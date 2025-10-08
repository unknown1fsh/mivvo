/**
 * Ses Analizi Servisi (Audio Analysis Service)
 * 
 * Clean Architecture - Service Layer (İş Mantığı Katmanı)
 * 
 * Bu servis, OpenAI API kullanarak motor ses analizi yapar.
 * 
 * Amaç:
 * - Motor ses kaydından arıza tespiti
 * - RPM ve frekans analizi
 * - Motor sağlığı değerlendirmesi
 * - Detaylı Türkçe arıza raporları
 * - Bakım önerileri ve maliyet tahmini
 * 
 * NOT: OpenAI şu anda doğrudan ses dosyası analizi desteklemiyor.
 * Bu implementasyon ses dosyası path'ini prompt'a ekleyerek
 * simüle bir analiz yapıyor. Gelecekte Whisper API veya
 * özel ses analiz modelleri entegre edilebilir.
 * 
 * Motor Analiz Kategorileri:
 * - RPM analizi (rölanti, max devir, stabilite)
 * - Ses kalitesi (netlik, pürüzsüzlük, tutarlılık)
 * - Tespit edilen sorunlar (mekanik, elektrik vb.)
 * - Performans metrikleri (verimlilik, yakıt ekonomisi)
 * - Bakım önerileri (acil, kısa/uzun vadeli)
 * - Maliyet tahmini (detaylı breakdown)
 * 
 * Özellikler:
 * - Gerçekçi Türkiye fiyatları (2025)
 * - Detaylı arıza açıklaması
 * - Semptom ve neden analizi
 * - Aciliyet değerlendirmesi
 * - Cache mekanizması
 */

import OpenAI from 'openai'
import fs from 'fs/promises'
import crypto from 'crypto'

// ===== TİP TANIMLARI =====

/**
 * Ses Analizi Sonucu Interface
 * 
 * Motor ses analizinin tüm sonuçlarını içerir
 */
export interface AudioAnalysisResult {
  overallScore: number                                                  // Genel puan (0-100)
  engineHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'   // Motor sağlığı
  rpmAnalysis: {                                                        // RPM analizi
    idleRpm: number                                                     // Rölanti devri
    maxRpm: number                                                      // Maximum devir
    rpmStability: number                                                // Devir stabilitesi (%)
    rpmResponse: number                                                 // Devir tepkisi (%)
    idleQuality: string                                                 // Rölanti kalitesi açıklaması
  }
  soundQuality: {                                                       // Ses kalitesi
    overallQuality: number                                              // Genel kalite (0-100)
    clarity: number                                                     // Netlik (0-100)
    smoothness: number                                                  // Pürüzsüzlük (0-100)
    consistency: number                                                 // Tutarlılık (0-100)
    soundSignature: string                                              // Ses imzası açıklaması
  }
  detectedIssues: EngineIssue[]                                        // Tespit edilen sorunlar
  performanceMetrics: {                                                 // Performans metrikleri
    engineEfficiency: number                                            // Motor verimliliği (%)
    fuelEfficiency: number                                              // Yakıt verimliliği (%)
    overallPerformance: number                                          // Genel performans (%)
    performanceGrade: string                                            // Performans notu
  }
  recommendations: {                                                    // Öneriler
    immediate: string[]                                                 // Acil öneriler
    shortTerm: string[]                                                 // Kısa vadeli öneriler
    longTerm: string[]                                                  // Uzun vadeli öneriler
    maintenance: string[]                                               // Bakım önerileri
  }
  costEstimate: {                                                       // Maliyet tahmini
    totalCost: number                                                   // Toplam maliyet (TL)
    breakdown: Array<{                                                  // Maliyet detayı
      category: string                                                  // Kategori
      cost: number                                                      // Maliyet (TL)
      description: string                                               // Açıklama
    }>
  }
  aiProvider: string                                                    // AI sağlayıcı
  model: string                                                         // AI model
  confidence: number                                                    // Güven seviyesi (0-100)
  analysisTimestamp: string                                             // Analiz zamanı (ISO)
}

/**
 * Motor Arızası Interface
 * 
 * Tespit edilen her arıza için detaylı bilgi
 */
export interface EngineIssue {
  id: string                                                            // Benzersiz arıza ID'si
  type: string                                                          // Arıza tipi
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'        // Şiddet seviyesi
  confidence: number                                                    // Güven seviyesi (0-100)
  description: string                                                   // Detaylı açıklama
  symptoms: string[]                                                    // Semptomlar listesi
  possibleCauses: string[]                                              // Olası nedenler
  urgency: 'immediate' | 'urgent' | 'normal' | 'low'                  // Aciliyet
  estimatedRepairCost: number                                           // Tahmini onarım maliyeti (TL)
  estimatedRepairTime: number                                           // Tahmini onarım süresi (saat)
  recommendedActions: string[]                                          // Önerilen aksiyonlar
}

// ===== SERVİS =====

/**
 * OpenAI Model Seçimi
 * 
 * Environment variable'dan model adı alınır, yoksa default kullanılır
 */
const OPENAI_MODEL = process.env.OPENAI_AUDIO_MODEL ?? 'gpt-4o-mini'

/**
 * AudioAnalysisService Sınıfı
 * 
 * OpenAI API ile motor ses analizi yapan servis
 */
export class AudioAnalysisService {
  /**
   * OpenAI client instance
   */
  private static openaiClient: OpenAI | null = null

  /**
   * Initialization durumu
   */
  private static isInitialized = false

  /**
   * In-memory cache (audio hash → result)
   */
  private static cache = new Map<string, AudioAnalysisResult>()

  /**
   * Servisi başlatır (OpenAI client oluşturur)
   * 
   * @throws Error - API key yoksa
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      const openaiApiKey = process.env.OPENAI_API_KEY
      if (openaiApiKey) {
        this.openaiClient = new OpenAI({ apiKey: openaiApiKey })
        console.log('[AI] OpenAI Motor Ses Analizi servisi hazırlandı')
      } else {
        throw new Error('OpenAI API key bulunamadı')
      }
      this.isInitialized = true
    } catch (error) {
      console.error('[AI] OpenAI Motor Ses Analizi servisi başlatılırken hata:', error)
      throw error
    }
  }

  /**
   * Cache'i temizler
   */
  static clearCache(): void {
    this.cache.clear()
  }

  /**
   * Ses dosyası hash'ini hesaplar (cache key için)
   * 
   * MD5 hash kullanır
   * 
   * @param audioPath - Ses dosyası path'i
   * @returns MD5 hash veya timestamp (fallback)
   * 
   * @private
   */
  private static async getAudioHash(audioPath: string): Promise<string> {
    try {
      const buffer = await fs.readFile(audioPath)
      return crypto.createHash('md5').update(buffer).digest('hex')
    } catch (error) {
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`
    }
  }

  /**
   * OpenAI için Türkçe prompt oluşturur
   * 
   * ÇOK DETAYLI prompt ile AI'ya motor uzmanı rolü verilir:
   * - 30+ yıllık deneyimli motor uzmanı
   * - Akustik mühendis
   * - Frekans seviyesinde analiz
   * - Türkçe rapor
   * - Gerçekçi Türkiye fiyatları
   * - JSON format örneği
   * 
   * @param vehicleInfo - Araç bilgileri (opsiyonel)
   * @returns Prompt metni
   * 
   * @private
   */
  private static buildPrompt(vehicleInfo?: any): string {
    const vehicleContext = vehicleInfo ? `
🚗 ARAÇ BİLGİLERİ:
- Marka: ${vehicleInfo.make || 'Bilinmiyor'}
- Model: ${vehicleInfo.model || 'Bilinmiyor'}
- Yıl: ${vehicleInfo.year || 'Bilinmiyor'}
- Plaka: ${vehicleInfo.plate || 'Bilinmiyor'}

Bu araç bilgilerini göz önünde bulundurarak motor ses analizi yap.` : ''

    return `Sen dünyaca ünlü bir motor uzmanı ve akustik mühendisisin. 30+ yıllık deneyimin var. Motor sesini FREKANS SEVİYESİNDE analiz edebiliyorsun.

🎯 ÖNEMLİ: RAPOR TAMAMEN TÜRKÇE OLMALI - HİÇBİR İNGİLİZCE KELİME YOK!

🔊 PROFESYONEL MOTOR SES ANALİZİ

${vehicleContext}

📋 ANALİZ KURALLARI:
1. Motor sesini ÇOK DETAYLI dinle ve analiz et
2. RPM, frekans, titreşim analizi yap
3. Tüm arızaları tespit et
4. Her sorunu Türkçe açıkla
5. Gerçekçi maliyet hesapla (Türkiye 2025 fiyatları)

💰 MALİYET HESAPLAMA (Türkiye 2025):
- Motor revizyonu: 15.000-35.000 TL
- Supap ayarı: 800-1.500 TL
- Triger değişimi: 3.000-6.000 TL
- Enjektör temizliği: 1.200-2.500 TL
- Motor yağı değişimi: 800-1.500 TL
- Hava filtresi: 200-500 TL
- Yakıt filtresi: 300-600 TL
- Buji değişimi: 400-1.200 TL

🔍 ÇIKTI FORMATI (Sadece geçerli JSON, TAMAMEN TÜRKÇE):
{
  "overallScore": 85,
  "engineHealth": "İyi",
  "rpmAnalysis": {
    "idleRpm": 800,
    "maxRpm": 6500,
    "rpmStability": 90
  },
  "frequencyAnalysis": {
    "dominantFrequencies": [120, 240, 360],
    "harmonicDistortion": 6.5,
    "noiseLevel": 52.3
  },
  "acousticFeatures": {
    "durationSec": 6.0,
    "rms": 0.033,
    "zeroCrossingRate": 0.1986,
    "dominantFrequencyHz": 1464
  },
  "detectedIssues": [
    {
      "issue": "Motor takozlarında aşınma",
      "severity": "low",
      "confidence": 85,
      "description": "Rölantide hafif titreşim, motor takozlarında başlangıç seviyesi aşınma tespit edildi.",
      "recommendation": "Motor takozlarını kontrol ettirin ve gerekirse değiştirin"
    }
  ],
  "performanceMetrics": {
    "engineEfficiency": 85,
    "vibrationLevel": 22,
    "acousticQuality": 88
  },
  "recommendations": [
    "Motor yağı ve filtre değişimini zamanında yapın",
    "Hava filtresini kontrol edin",
    "Yakıt kalitesine dikkat edin"
  ],
  "analysisSummary": "Ses kaydında motor ateşleme darbeleri belirgin değil; marş dönüyor fakat tutuşma zayıf. Baskın frekans ~1464 Hz metal sürtünmesine işaret edebilir. Ateşleme/yakıt sistemi kontrol önerilir.",
  "aiProvider": "OpenAI",
  "model": "${OPENAI_MODEL}",
  "analysisTimestamp": "${new Date().toISOString()}"
}

⚠️ KRİTİK KURALLAR:
- RAPOR TAMAMEN TÜRKÇE - HİÇBİR İNGİLİZCE YOK!
- SADECE MOTOR SES ANALİZİ - Başka analiz yapma
- Sadece GEÇERLİ JSON döndür (ek metin YOK)
- frequencyAnalysis alanını MUTLAKA doldur (dominantFrequencies, harmonicDistortion, noiseLevel)
- acousticFeatures alanını da doldur (durationSec, rms, zeroCrossingRate, dominantFrequencyHz)
- detectedIssues.severity sadece: low | medium | high | critical
- recommendations mutlaka string[] olmalı (düz liste)
- Kısa bir "analysisSummary" metni ekle (Türkçe yorum)
- Değerler gerçekçi aralıkta olmalı`
  }

  /**
   * AI yanıtından JSON payload'ı çıkarır
   * 
   * AI bazen JSON öncesi/sonrasında metin ekler,
   * bu fonksiyon sadece JSON kısmını parse eder.
   * 
   * @param rawText - AI'dan gelen ham metin
   * @returns Parse edilmiş JSON
   * @throws Error - JSON bulunamazsa
   * 
   * @private
   */
  private static extractJsonPayload(rawText: string): any {
    const start = rawText.indexOf('{')
    const end = rawText.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) {
      throw new Error('AI yanıtından JSON verisi alınamadı')
    }
    const json = rawText.slice(start, end + 1)
    return JSON.parse(json)
  }

  /**
   * OpenAI API ile ses analizi yapar
   * 
   * NOT: OpenAI şu anda doğrudan ses dosyası analizi desteklemiyor.
   * Bu implementasyon ses dosyası path'ini prompt'a ekleyerek
   * simüle bir analiz yapıyor.
   * 
   * Gelecek İyileştirmeler:
   * - Whisper API ile ses transkripti
   * - FFmpeg ile ses özellikleri çıkarma (frekans, amplitüd)
   * - Özel audio analysis model entegrasyonu
   * 
   * @param audioPath - Ses dosyası path'i
   * @param vehicleInfo - Araç bilgileri
   * @returns Ses analizi sonucu
   * @throws Error - API hatası
   * 
   * @private
   */
  private static async analyzeAudioWithOpenAI(audioPath: string, vehicleInfo: any): Promise<AudioAnalysisResult> {
    if (!this.openaiClient) {
      throw new Error('OpenAI istemcisi kullanılabilir değil')
    }

    // Prompt'a ses dosyası path'ini ekle
    const prompt = `${this.buildPrompt(vehicleInfo)}

SES DOSYASI: ${audioPath}

Lütfen motor sesini analiz et ve yukarıdaki formatta JSON döndür.`

    // OpenAI chat completion çağrısı
    const response = await this.openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.1, // Düşük temperature = tutarlı sonuçlar
      messages: [
        {
          role: 'system',
          content: 'Sen deneyimli bir motor uzmanısın. Çıktıyı geçerli JSON olarak üret. Tüm metinler Türkçe olmalı.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Yanıtı al
    const text = response.choices?.[0]?.message?.content
    if (!text) {
      throw new Error('OpenAI yanıtı boş geldi')
    }

    // JSON'u parse et
    const parsed = this.extractJsonPayload(text)
    return parsed as AudioAnalysisResult
  }

  /**
   * Motor Ses Analizi - Public API
   * 
   * Cache kontrolü yapar, yoksa OpenAI ile analiz eder.
   * 
   * İşlem akışı:
   * 1. Initialize kontrolü
   * 2. Audio hash hesapla (cache key)
   * 3. Cache kontrolü (varsa döndür)
   * 4. OpenAI analizi yap
   * 5. Sonucu cache'e kaydet
   * 6. Sonucu döndür
   * 
   * @param audioPath - Ses dosyası path'i
   * @param vehicleInfo - Araç bilgileri
   * @returns Ses analizi sonucu
   * @throws Error - API hatası
   * 
   * @example
   * const result = await AudioAnalysisService.analyzeEngineSound(
   *   './engine-sound.mp3',
   *   { make: 'Toyota', model: 'Corolla', year: 2020 }
   * );
   * console.log(result.engineHealth); // 'good'
   * console.log(result.overallScore); // 85
   */
  static async analyzeEngineSound(audioPath: string, vehicleInfo: any): Promise<AudioAnalysisResult> {
    await this.initialize()

    // Cache kontrolü
    const cacheKey = await this.getAudioHash(audioPath)
    const cached = this.cache.get(cacheKey)
    if (cached) {
      console.log('[AI] Motor ses analizi cache üzerinden döndürüldü')
      return cached
    }

    try {
      console.log('[AI] OpenAI ile motor ses analizi başlatılıyor...')
      
      // OpenAI analizi
      const result = await this.analyzeAudioWithOpenAI(audioPath, vehicleInfo)
      
      console.log('[AI] OpenAI motor ses analizi başarılı!')
      
      // Cache'e kaydet
      this.cache.set(cacheKey, result)
      return result
    } catch (error) {
      console.error('[AI] OpenAI motor ses analizi HATASI:', error)
      throw new Error('OpenAI motor ses analizi başarısız oldu.')
    }
  }
}
