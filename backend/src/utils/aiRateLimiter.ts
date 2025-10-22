/**
 * AI Rate Limiter Utility
 * 
 * OpenAI API için rate limiting ve retry stratejisi.
 * Exponential backoff ile güvenilir AI servis çağrıları.
 * 
 * Özellikler:
 * - Exponential backoff retry
 * - Rate limit hatalarını yakala
 * - Queue mekanizması (opsiyonel)
 * - Circuit breaker pattern
 * - Request deduplication
 * - Performance monitoring
 * 
 * OpenAI Rate Limits:
 * - GPT-4: 10,000 tokens/minute
 * - Vision API: 500 requests/minute
 * - Audio API: 50 requests/minute
 */

import { ERROR_MESSAGES } from '../constants/ErrorMessages'

/**
 * Rate Limiter Konfigürasyonu
 */
interface RateLimiterConfig {
  /**
   * Maksimum istek sayısı
   */
  maxRequests: number
  
  /**
   * Zaman penceresi (milisaniye)
   */
  windowMs: number
  
  /**
   * Maksimum retry sayısı
   */
  maxRetries: number
  
  /**
   * İlk retry gecikmesi (milisaniye)
   */
  initialDelayMs: number
  
  /**
   * Maksimum gecikme (milisaniye)
   */
  maxDelayMs: number
  
  /**
   * Backoff çarpanı
   */
  backoffMultiplier: number
  
  /**
   * Jitter ekle (rastgele gecikme)
   */
  jitter: boolean
}

/**
 * AI Servis Tipi
 */
export type AIServiceType = 'gpt' | 'vision' | 'audio' | 'embedding'

/**
 * Rate Limiter Konfigürasyonları
 */
const RATE_LIMITER_CONFIGS: Record<AIServiceType, RateLimiterConfig> = {
  gpt: {
    maxRequests: 50, // 50 requests/minute
    windowMs: 60 * 1000, // 1 dakika
    maxRetries: 3,
    initialDelayMs: 1000, // 1 saniye
    maxDelayMs: 30000, // 30 saniye
    backoffMultiplier: 2,
    jitter: true
  },
  vision: {
    maxRequests: 100, // 100 requests/minute
    windowMs: 60 * 1000, // 1 dakika
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitter: true
  },
  audio: {
    maxRequests: 20, // 20 requests/minute
    windowMs: 60 * 1000, // 1 dakika
    maxRetries: 2,
    initialDelayMs: 2000, // 2 saniye
    maxDelayMs: 60000, // 60 saniye
    backoffMultiplier: 3,
    jitter: true
  },
  embedding: {
    maxRequests: 100, // 100 requests/minute
    windowMs: 60 * 1000, // 1 dakika
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitter: true
  }
}

/**
 * Request Bilgisi
 */
interface RequestInfo {
  timestamp: number
  userId?: string
  requestId: string
}

/**
 * AI Rate Limiter Sınıfı
 */
export class AIRateLimiter {
  private requestQueues: Map<AIServiceType, RequestInfo[]> = new Map()
  private circuitBreakers: Map<AIServiceType, CircuitBreaker> = new Map()
  private requestCounts: Map<AIServiceType, number> = new Map()
  private lastResetTimes: Map<AIServiceType, number> = new Map()

  constructor() {
    // Her servis için queue ve circuit breaker başlat
    Object.keys(RATE_LIMITER_CONFIGS).forEach(service => {
      this.requestQueues.set(service as AIServiceType, [])
      this.circuitBreakers.set(service as AIServiceType, new CircuitBreaker())
      this.requestCounts.set(service as AIServiceType, 0)
      this.lastResetTimes.set(service as AIServiceType, Date.now())
    })
  }

  /**
   * AI servis çağrısı yap (rate limiting ile)
   * 
   * @param serviceType - AI servis tipi
   * @param requestFn - AI servis çağrı fonksiyonu
   * @param userId - Kullanıcı ID (opsiyonel)
   * @param requestId - İstek ID (opsiyonel)
   * @returns Promise<any> - AI servis sonucu
   */
  async executeWithRateLimit<T>(
    serviceType: AIServiceType,
    requestFn: () => Promise<T>,
    userId?: string,
    requestId?: string
  ): Promise<T> {
    const config = RATE_LIMITER_CONFIGS[serviceType]
    const requestIdFinal = requestId || this.generateRequestId()
    
    // Circuit breaker kontrolü
    const circuitBreaker = this.circuitBreakers.get(serviceType)!
    if (circuitBreaker.isOpen()) {
      throw new Error(ERROR_MESSAGES.ANALYSIS.AI_UNAVAILABLE)
    }

    // Rate limit kontrolü
    await this.checkRateLimit(serviceType, userId, requestIdFinal)

    // Retry mekanizması ile AI çağrısı yap
    return await this.executeWithRetry(serviceType, requestFn, config)
  }

  /**
   * Rate limit kontrolü
   * 
   * @param serviceType - AI servis tipi
   * @param userId - Kullanıcı ID
   * @param requestId - İstek ID
   */
  private async checkRateLimit(
    serviceType: AIServiceType,
    userId?: string,
    requestId?: string
  ): Promise<void> {
    const config = RATE_LIMITER_CONFIGS[serviceType]
    const now = Date.now()
    
    // Zaman penceresini sıfırla
    this.resetWindowIfNeeded(serviceType, now)
    
    // Mevcut istek sayısını kontrol et
    const currentCount = this.requestCounts.get(serviceType) || 0
    
    if (currentCount >= config.maxRequests) {
      // Rate limit aşıldı, bekle
      const waitTime = this.calculateWaitTime(serviceType, now)
      await this.wait(waitTime)
      
      // Tekrar kontrol et
      this.resetWindowIfNeeded(serviceType, Date.now())
      const newCount = this.requestCounts.get(serviceType) || 0
      
      if (newCount >= config.maxRequests) {
        throw new Error(ERROR_MESSAGES.ANALYSIS.AI_RATE_LIMIT_WITH_REFUND)
      }
    }
    
    // İstek sayısını artır
    this.requestCounts.set(serviceType, currentCount + 1)
    
    // Request queue'ya ekle
    const queue = this.requestQueues.get(serviceType)!
    queue.push({
      timestamp: now,
      userId,
      requestId: requestId || this.generateRequestId()
    })
    
    // Eski istekleri temizle
    this.cleanOldRequests(serviceType, now)
  }

  /**
   * Retry mekanizması ile AI çağrısı yap
   * 
   * @param serviceType - AI servis tipi
   * @param requestFn - AI servis çağrı fonksiyonu
   * @param config - Rate limiter konfigürasyonu
   * @returns Promise<any> - AI servis sonucu
   */
  private async executeWithRetry<T>(
    serviceType: AIServiceType,
    requestFn: () => Promise<T>,
    config: RateLimiterConfig
  ): Promise<T> {
    const circuitBreaker = this.circuitBreakers.get(serviceType)!
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        // Circuit breaker ile çağrı yap
        const result = await circuitBreaker.execute(requestFn)
        
        // Başarılı çağrı, sonucu döndür
        return result
        
      } catch (error) {
        lastError = error as Error
        
        // Son deneme ise hata fırlat
        if (attempt === config.maxRetries) {
          break
        }
        
        // Rate limit hatası ise retry yap
        if (this.isRateLimitError(error)) {
          const delay = this.calculateRetryDelay(attempt, config)
          console.log(`⏳ AI servis rate limit, ${delay}ms bekleniyor... (Deneme ${attempt + 1}/${config.maxRetries})`)
          await this.wait(delay)
          continue
        }
        
        // Diğer hatalar için retry yapma
        if (this.isRetryableError(error)) {
          const delay = this.calculateRetryDelay(attempt, config)
          console.log(`⏳ AI servis hatası, ${delay}ms bekleniyor... (Deneme ${attempt + 1}/${config.maxRetries})`)
          await this.wait(delay)
          continue
        }
        
        // Retry edilemeyen hata, fırlat
        throw error
      }
    }
    
    // Tüm denemeler başarısız
    throw lastError || new Error(ERROR_MESSAGES.ANALYSIS.AI_FAILED_WITH_REFUND)
  }

  /**
   * Retry gecikmesi hesapla
   * 
   * @param attempt - Deneme sayısı
   * @param config - Konfigürasyon
   * @returns Gecikme süresi (milisaniye)
   */
  private calculateRetryDelay(attempt: number, config: RateLimiterConfig): number {
    let delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt)
    
    // Maksimum gecikme ile sınırla
    delay = Math.min(delay, config.maxDelayMs)
    
    // Jitter ekle (rastgele gecikme)
    if (config.jitter) {
      const jitterRange = delay * 0.1 // %10 jitter
      delay += (Math.random() - 0.5) * 2 * jitterRange
    }
    
    return Math.max(0, delay)
  }

  /**
   * Bekleme fonksiyonu
   * 
   * @param ms - Bekleme süresi (milisaniye)
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Rate limit hatası mı kontrol et
   * 
   * @param error - Hata objesi
   * @returns Rate limit hatası mı?
   */
  private isRateLimitError(error: any): boolean {
    const message = error?.message || error?.toString() || ''
    return message.includes('rate limit') || 
           message.includes('429') ||
           message.includes('Too Many Requests') ||
           message.includes('quota')
  }

  /**
   * Retry edilebilir hata mı kontrol et
   * 
   * @param error - Hata objesi
   * @returns Retry edilebilir mi?
   */
  private isRetryableError(error: any): boolean {
    const message = error?.message || error?.toString() || ''
    return message.includes('timeout') ||
           message.includes('network') ||
           message.includes('connection') ||
           message.includes('5') // 5xx server errors
  }

  /**
   * Zaman penceresini sıfırla (gerekirse)
   * 
   * @param serviceType - AI servis tipi
   * @param now - Şu anki zaman
   */
  private resetWindowIfNeeded(serviceType: AIServiceType, now: number): void {
    const config = RATE_LIMITER_CONFIGS[serviceType]
    const lastReset = this.lastResetTimes.get(serviceType) || 0
    
    if (now - lastReset >= config.windowMs) {
      this.requestCounts.set(serviceType, 0)
      this.lastResetTimes.set(serviceType, now)
    }
  }

  /**
   * Bekleme süresi hesapla
   * 
   * @param serviceType - AI servis tipi
   * @param now - Şu anki zaman
   * @returns Bekleme süresi (milisaniye)
   */
  private calculateWaitTime(serviceType: AIServiceType, now: number): number {
    const lastReset = this.lastResetTimes.get(serviceType) || 0
    const config = RATE_LIMITER_CONFIGS[serviceType]
    const timeSinceReset = now - lastReset
    const timeUntilReset = config.windowMs - timeSinceReset
    
    return Math.max(0, timeUntilReset)
  }

  /**
   * Eski istekleri temizle
   * 
   * @param serviceType - AI servis tipi
   * @param now - Şu anki zaman
   */
  private cleanOldRequests(serviceType: AIServiceType, now: number): void {
    const config = RATE_LIMITER_CONFIGS[serviceType]
    const queue = this.requestQueues.get(serviceType)!
    
    // Eski istekleri filtrele
    const filteredQueue = queue.filter(
      request => now - request.timestamp < config.windowMs
    )
    
    this.requestQueues.set(serviceType, filteredQueue)
  }

  /**
   * İstek ID oluştur
   * 
   * @returns Benzersiz istek ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Rate limiter istatistikleri al
   * 
   * @param serviceType - AI servis tipi
   * @returns İstatistik bilgisi
   */
  getStats(serviceType: AIServiceType): {
    currentRequests: number
    maxRequests: number
    windowMs: number
    circuitBreakerState: 'closed' | 'open' | 'half-open'
    queueLength: number
  } {
    const config = RATE_LIMITER_CONFIGS[serviceType]
    const circuitBreaker = this.circuitBreakers.get(serviceType)!
    const queue = this.requestQueues.get(serviceType)!
    
    return {
      currentRequests: this.requestCounts.get(serviceType) || 0,
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      circuitBreakerState: circuitBreaker.getState(),
      queueLength: queue.length
    }
  }

  /**
   * Tüm servisler için istatistikleri al
   * 
   * @returns Tüm servis istatistikleri
   */
  getAllStats(): Record<AIServiceType, ReturnType<typeof this.getStats>> {
    const stats: any = {}
    
    Object.keys(RATE_LIMITER_CONFIGS).forEach(service => {
      stats[service] = this.getStats(service as AIServiceType)
    })
    
    return stats
  }
}

/**
 * Circuit Breaker Sınıfı
 * 
 * Hata oranı yüksek olduğunda servisi geçici olarak devre dışı bırakır.
 */
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  private failureCount = 0
  private lastFailureTime = 0
  private readonly failureThreshold = 5 // 5 hata sonrası aç
  private readonly timeout = 60000 // 60 saniye timeout

  /**
   * Circuit breaker ile fonksiyon çalıştır
   * 
   * @param fn - Çalıştırılacak fonksiyon
   * @returns Fonksiyon sonucu
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open'
      } else {
        throw new Error(ERROR_MESSAGES.ANALYSIS.AI_UNAVAILABLE)
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  /**
   * Başarılı çağrı
   */
  private onSuccess(): void {
    this.failureCount = 0
    this.state = 'closed'
  }

  /**
   * Başarısız çağrı
   */
  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open'
    }
  }

  /**
   * Circuit breaker açık mı?
   * 
   * @returns Açık mı?
   */
  isOpen(): boolean {
    return this.state === 'open'
  }

  /**
   * Circuit breaker durumu
   * 
   * @returns Durum
   */
  getState(): 'closed' | 'open' | 'half-open' {
    return this.state
  }
}

/**
 * Global AI Rate Limiter Instance
 */
export const aiRateLimiter = new AIRateLimiter()

/**
 * AI Servis Çağrı Helper Fonksiyonları
 */
export const AIHelpers = {
  /**
   * GPT çağrısı yap
   * 
   * @param requestFn - GPT çağrı fonksiyonu
   * @param userId - Kullanıcı ID
   * @returns GPT sonucu
   */
  async callGPT<T>(requestFn: () => Promise<T>, userId?: string): Promise<T> {
    return await aiRateLimiter.executeWithRateLimit('gpt', requestFn, userId)
  },

  /**
   * Vision API çağrısı yap
   * 
   * @param requestFn - Vision çağrı fonksiyonu
   * @param userId - Kullanıcı ID
   * @returns Vision sonucu
   */
  async callVision<T>(requestFn: () => Promise<T>, userId?: string): Promise<T> {
    return await aiRateLimiter.executeWithRateLimit('vision', requestFn, userId)
  },

  /**
   * Audio API çağrısı yap
   * 
   * @param requestFn - Audio çağrı fonksiyonu
   * @param userId - Kullanıcı ID
   * @returns Audio sonucu
   */
  async callAudio<T>(requestFn: () => Promise<T>, userId?: string): Promise<T> {
    return await aiRateLimiter.executeWithRateLimit('audio', requestFn, userId)
  },

  /**
   * Embedding API çağrısı yap
   * 
   * @param requestFn - Embedding çağrı fonksiyonu
   * @param userId - Kullanıcı ID
   * @returns Embedding sonucu
   */
  async callEmbedding<T>(requestFn: () => Promise<T>, userId?: string): Promise<T> {
    return await aiRateLimiter.executeWithRateLimit('embedding', requestFn, userId)
  }
}
