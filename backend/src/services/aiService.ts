/**
 * AI Orkestrasyon Servisi (AI Orchestration Service)
 * 
 * Clean Architecture - Service Layer (İş Mantığı Katmanı)
 * 
 * Bu servis, tüm AI servislerini yöneten merkezi facade (cephe) servisidir.
 * 
 * Amaç:
 * - Birden fazla AI servisini tek noktadan yönetme
 * - Fallback mekanizması ile hata toleransı
 * - Legacy interface desteği (backward compatibility)
 * - Veri format dönüşümleri (mapping)
 * - Initialize orchestration
 * 
 * Facade Design Pattern:
 * - Controller'lar bu servisi çağırır
 * - Bu servis altta DamageDetectionService, PaintAnalysisService, AudioAnalysisService çağırır
 * - Client (controller) sadece AIService'i bilir, alt servisleri bilmez
 * 
 * AI Servisleri:
 * - DamageDetectionService: Hasar tespiti (Google Gemini)
 * - PaintAnalysisService: Boya analizi (Google Gemini)
 * - AudioAnalysisService: Motor sesi analizi
 * - SimpleFallbackService: Yedek (fallback) servis
 * 
 * Fallback Stratejisi:
 * - Boya analizi: Fallback yok (throw error)
 * - Hasar tespiti: Hata varsa throw error
 * - Motor sesi: Hata varsa SimpleFallbackService kullan
 */

import { DamageDetectionService, DamageDetectionResult } from './damageDetectionService'
import { PaintAnalysisService, PaintAnalysisResult as AdvancedPaintAnalysisResult } from './paintAnalysisService'
import { AudioAnalysisService, AudioAnalysisResult } from './audioAnalysisService'
import { SimpleFallbackService } from './simpleFallbackService';

/**
 * Boya Analizi Sonucu Interface (Legacy)
 * 
 * Frontend ve mevcut controller kodları bu yapıyı bekliyor.
 * Backward compatibility için korunuyor.
 * 
 * Gelişmiş AI servisinden gelen sonuç bu formata map edilir.
 */
export interface PaintAnalysisResult {
  paintCondition: 'excellent' | 'good' | 'fair' | 'poor';  // Boya durumu
  paintThickness: number;                                    // Boya kalınlığı (mikron)
  colorMatch: number;                                        // Renk uyumu (%)
  scratches: number;                                         // Çizik sayısı
  dents: number;                                             // Göçük sayısı
  rust: boolean;                                             // Pas var mı?
  oxidation: number;                                         // Oksidasyon seviyesi (%)
  glossLevel: number;                                        // Parlaklık seviyesi (%)
  overallScore: number;                                      // Genel puan (0-100)
  recommendations: string[];                                 // Öneriler listesi
  confidence: number;                                        // Güven seviyesi (%)
  technicalDetails: {                                        // Teknik detaylar
    paintSystem: string;                                     // Boya sistemi
    primerType: string;                                      // Astar tipi
    baseCoat: string;                                        // Baz kat
    clearCoat: string;                                       // Vernik
    totalThickness: number;                                  // Toplam kalınlık
    colorCode: string;                                       // Renk kodu
  };
  damageAreas?: {                                            // Hasar alanları (opsiyonel)
    x: number;                                               // X koordinatı
    y: number;                                               // Y koordinatı
    width: number;                                           // Genişlik
    height: number;                                          // Yükseklik
    type: 'scratch' | 'dent' | 'rust' | 'oxidation';        // Hasar tipi
    severity: 'low' | 'medium' | 'high';                    // Şiddet
    confidence: number;                                      // Güven
    overallAssessment?: any;                                 // Genel değerlendirme
  }[];
}

/**
 * Motor Sesi Analizi Sonucu Interface (Legacy)
 * 
 * Frontend ve mevcut controller kodları bu yapıyı bekliyor.
 */
export interface EngineSoundAnalysisResult {
  overallScore: number;                                      // Genel puan (0-100)
  engineHealth: string;                                      // Motor sağlığı (excellent, good, fair, poor)
  rpmAnalysis: {                                             // RPM analizi
    idleRpm: number;                                         // Rölanti devri
    maxRpm: number;                                          // Maximum devir
    rpmStability: number;                                    // Devir stabilitesi (%)
  };
  frequencyAnalysis: {                                       // Frekans analizi
    dominantFrequencies: number[];                           // Baskın frekanslar (Hz)
    harmonicDistortion: number;                              // Harmonik bozulma (%)
    noiseLevel: number;                                      // Gürültü seviyesi (dB)
  };
  detectedIssues: {                                          // Tespit edilen sorunlar
    issue: string;                                           // Sorun adı
    severity: 'low' | 'medium' | 'high';                    // Şiddet
    confidence: number;                                      // Güven (%)
    description: string;                                     // Açıklama
    recommendation: string;                                  // Öneri
  }[];
  performanceMetrics: {                                      // Performans metrikleri
    engineEfficiency: number;                                // Motor verimliliği (%)
    vibrationLevel: number;                                  // Vibrasyon seviyesi
    acousticQuality: number;                                 // Akustik kalite (%)
  };
  recommendations: string[];                                 // Öneriler listesi
}

/**
 * AIService Sınıfı
 * 
 * Tüm AI servislerini yöneten merkezi facade servisi.
 * Static metodlarla çalışır, instance oluşturmaya gerek yoktur.
 */
export class AIService {
  /**
   * Initialization durumu
   * 
   * Birden fazla initialize çağrısını önler.
   */
  private static isInitialized = false

  /**
   * Tüm AI servislerini tek seferlik hazırlar
   * 
   * İşlem adımları:
   * 1. Duplicate initialization kontrolü
   * 2. DamageDetectionService initialize
   * 3. PaintAnalysisService initialize
   * 4. AudioAnalysisService initialize
   * 5. Başarı/hata loglama
   * 
   * Promise.all ile parallel initialization yapılır.
   * Hata durumunda fallback moduna geçilir (throw edilmez).
   * 
   * @returns Promise<void>
   * 
   * @example
   * await AIService.initialize();
   * // Artık tüm AI servisleri kullanılabilir
   */
  static async initialize(): Promise<void> {
    // Zaten initialize edildiyse tekrar yapma
    if (this.isInitialized) return

    try {
      console.log('[AI] Servisler başlatılıyor...')
      
      // Tüm AI servislerini paralel başlat
      await Promise.all([
        DamageDetectionService.initialize(),
        PaintAnalysisService.initialize(),
        AudioAnalysisService.initialize()
      ])
      
      this.isInitialized = true
      console.log('[AI] Servisler hazır.')
    } catch (error) {
      console.error('[AI] Servisler başlatılırken hata:', error)
      this.isInitialized = true // Yine de fallback ile devam etmeye çalış
    }
  }

  /**
   * Boya Analizi
   * 
   * Sadece gerçek AI kullanır, fallback yok.
   * Hata durumunda exception fırlatır.
   * 
   * İşlem akışı:
   * 1. Initialize kontrolü
   * 2. PaintAnalysisService.analyzePaint() çağır
   * 3. Gelişmiş sonucu legacy formata map et
   * 4. Başarı loglama
   * 5. Sonuç döndür
   * 
   * Hata yönetimi:
   * - API hatası: Exception fırlat (controller handle eder)
   * - Fallback yok (boya analizi kritik, gerçek AI gerekli)
   * 
   * @param imagePath - Boya fotoğrafı path'i
   * @param vehicleInfo - Araç bilgileri (opsiyonel)
   * @returns Promise<PaintAnalysisResult> - Boya analiz sonucu (legacy format)
   * @throws Error - AI analizi başarısız olursa
   * 
   * @example
   * const result = await AIService.analyzePaint('./paint-front.jpg', { brand: 'Toyota' });
   * console.log(result.paintCondition); // 'good'
   * console.log(result.overallScore); // 85
   */
  static async analyzePaint(imagePath: string, vehicleInfo?: any): Promise<PaintAnalysisResult> {
    await this.initialize()

    try {
      console.log('[AI] Gelişmiş boya analizi başlatılıyor...')
      
      // Gelişmiş AI servisini çağır
      const advancedResult = await PaintAnalysisService.analyzePaint(imagePath, vehicleInfo)
      
      // Legacy formata map et
      const mapped = this.mapPaintAnalysisResult(advancedResult)
      
      console.log('[AI] Boya analizi tamamlandı:', {
        provider: advancedResult.aiProvider,
        model: advancedResult.model,
        overallScore: mapped.overallScore
      })
      
      return mapped
    } catch (error) {
      console.error('[AI] Gelişmiş boya analizi başarısız:', error)
      throw new Error('AI boya analizi gerçekleştirilemedi. Lütfen resim kalitesini kontrol edin ve tekrar deneyin.')
    }
  }

  /**
   * Hasar Tespiti
   * 
   * Önce gerçek AI dener, hata durumunda exception fırlatır.
   * 
   * İşlem akışı:
   * 1. Initialize kontrolü
   * 2. DamageDetectionService.detectDamage() çağır
   * 3. Severity normalizasyonu yap
   * 4. Başarı loglama
   * 5. Sonuç döndür
   * 
   * Severity Normalization:
   * - 'critical', 'high' → 'high'
   * - 'medium' → 'medium'
   * - 'minimal', 'low' → 'low'
   * 
   * @param imagePath - Hasar fotoğrafı path'i
   * @param vehicleInfo - Araç bilgileri (opsiyonel)
   * @returns Promise<DamageDetectionResult> - Hasar tespit sonucu
   * @throws Error - AI analizi başarısız olursa
   * 
   * @example
   * const result = await AIService.detectDamage('./damage.jpg', { brand: 'BMW' });
   * console.log(result.damageAreas.length); // 3
   */
  static async detectDamage(imagePath: string, vehicleInfo?: any): Promise<DamageDetectionResult> {
    await this.initialize()

    try {
      console.log('[AI] Gelişmiş hasar analizi başlatılıyor...')
      
      // Gelişmiş AI servisini çağır
      const advancedResult = await DamageDetectionService.detectDamage(imagePath, vehicleInfo)
      
      // Severity normalizasyonu yap (critical/high/medium/minimal/low → high/medium/low)
      const normalizedAreas = advancedResult.damageAreas.map((area) => ({
        ...area,
        severity: this.normalizeDamageSeverity(area.severity)
      })) as DamageDetectionResult['damageAreas']

      const result: DamageDetectionResult = {
        ...advancedResult,
        damageAreas: normalizedAreas
      }

      console.log('[AI] Hasar analizi tamamlandı:', {
        provider: result.aiProvider,
        model: result.model,
        damageCount: result.damageAreas.length
      })

      return result
    } catch (error) {
      console.error('[AI] Hasar analizi beklenmedik bir hatayla sonuçlandı:', error)
      throw error
    }
  }

  /**
   * Motor Sesi Analizi
   * 
   * Önce gerçek AI dener, hata durumunda simple fallback kullanır.
   * 
   * İşlem akışı:
   * 1. Initialize kontrolü
   * 2. AudioAnalysisService.analyzeEngineSound() çağır
   * 3. Başarı loglama
   * 4. Sonuç döndür
   * 5. Hata varsa SimpleFallbackService.analyzeEngineSound() çağır
   * 
   * Fallback Stratejisi:
   * - Gerçek AI servisi başarısız olursa (API key yok, quota aşıldı vb.)
   * - SimpleFallbackService devreye girer
   * - Simülasyon verisi döndürür
   * 
   * @param audioPath - Motor sesi dosyası path'i
   * @param vehicleInfo - Araç bilgileri (opsiyonel)
   * @returns Promise<AudioAnalysisResult> - Motor sesi analiz sonucu
   * 
   * @example
   * const result = await AIService.analyzeEngineSound('./engine.mp3', { engineType: 'Benzinli' });
   * console.log(result.engineHealth); // 'good'
   * console.log(result.overallScore); // 82
   */
  static async analyzeEngineSound(audioPath: string, vehicleInfo?: any): Promise<AudioAnalysisResult> {
    await this.initialize()

    try {
      console.log('[AI] Gelişmiş motor sesi analizi başlatılıyor...')
      
      // Gelişmiş AI servisini çağır
      const result = await AudioAnalysisService.analyzeEngineSound(audioPath, vehicleInfo)
      
      console.log('[AI] Motor sesi analizi tamamlandı:', {
        provider: result.aiProvider,
        model: result.model,
        overallScore: result.overallScore
      })
      
      return result
    } catch (error) {
      console.error('[AI] Gelişmiş motor sesi analizi başarısız:', error)
      // Fallback DEVRE DISI: Mock/simülasyon kesinlikle dönme
      throw error instanceof Error ? error : new Error('Motor sesi analizi başarısız')
    }
  }

  // ===== YARDIMCI METODLAR (PRIVATE) =====

  /**
   * Gelişmiş boya analiz sonucunu legacy formata map eder
   * 
   * Gelişmiş format:
   * - Detaylı nested objeler
   * - Kategorize edilmiş öneriler
   * - Çoklu metric'ler
   * 
   * Legacy format:
   * - Flat structure
   * - Basit öneriler array'i
   * - Temel metric'ler
   * 
   * @param result - Gelişmiş boya analiz sonucu
   * @returns PaintAnalysisResult - Legacy format sonuç
   * 
   * @private
   */
  private static mapPaintAnalysisResult(result: AdvancedPaintAnalysisResult): PaintAnalysisResult {
    // Önerileri topla ve flatten et
    const recommendations = this.collectPaintRecommendations(result.recommendations)

    return {
      paintCondition: this.mapPaintCondition(result.paintCondition),
      paintThickness: result.surfaceAnalysis?.totalThickness ?? result.surfaceAnalysis?.paintThickness ?? 0,
      colorMatch: result.colorAnalysis?.colorMatch ?? 0,
      scratches: result.damageAssessment?.scratches?.length ?? 0,
      dents: result.damageAssessment?.dents?.length ?? 0,
      rust: (result.damageAssessment?.rust?.length ?? 0) > 0,
      oxidation: this.calculateAverageSeverity(result.damageAssessment?.oxidation),
      glossLevel: result.paintQuality?.glossLevel ?? 0,
      overallScore: result.paintQuality?.overallScore ?? 0,
      recommendations: recommendations.length > 0 ? recommendations : ['Detaylı boya bakımı önerilir'],
      confidence: result.confidence ?? 0,
      technicalDetails: {
        paintSystem: result.technicalDetails?.paintSystem ?? 'Belirtilmedi',
        primerType: result.technicalDetails?.primerType ?? 'Belirtilmedi',
        baseCoat: result.technicalDetails?.baseCoat ?? 'Belirtilmedi',
        clearCoat: result.technicalDetails?.clearCoat ?? 'Belirtilmedi',
        totalThickness: result.surfaceAnalysis?.totalThickness ?? 0,
        colorCode: result.colorAnalysis?.colorCode ?? 'Belirtilmedi'
      }
    }
  }

  /**
   * Kategorize edilmiş önerileri tek array'e toplar
   * 
   * Gelişmiş format: { immediate: [], shortTerm: [], longTerm: [], ... }
   * Legacy format: string[]
   * 
   * İşlem:
   * 1. Tüm kategori array'lerini topla
   * 2. Flatten et (tek array yap)
   * 3. Duplicate'leri kaldır (Set kullanarak)
   * 4. Maximum 12 öneri döndür
   * 
   * @param recommendations - Kategorize edilmiş öneriler
   * @returns string[] - Flat öneri array'i
   * 
   * @private
   */
  private static collectPaintRecommendations(recommendations?: AdvancedPaintAnalysisResult['recommendations']): string[] {
    if (!recommendations) return []

    // Tüm kategori array'lerini topla
    const groups = [
      recommendations.immediate,
      recommendations.shortTerm,
      recommendations.longTerm,
      recommendations.maintenance,
      recommendations.protection,
      recommendations.restoration,
      recommendations.prevention
    ]

    // Flatten, filter ve deduplicate
    const flattened = groups
      .filter(Array.isArray)
      .flat()
      .filter((item): item is string => Boolean(item))

    // Duplicate'leri kaldır ve max 12 öneri döndür
    return Array.from(new Set(flattened)).slice(0, 12)
  }

  /**
   * Boya durumunu legacy formata map eder
   * 
   * Gelişmiş: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
   * Legacy: 'excellent' | 'good' | 'fair' | 'poor'
   * 
   * Mapping: 'critical' → 'poor'
   * 
   * @param condition - Gelişmiş boya durumu
   * @returns PaintAnalysisResult['paintCondition'] - Legacy boya durumu
   * 
   * @private
   */
  private static mapPaintCondition(condition: AdvancedPaintAnalysisResult['paintCondition'] | undefined): PaintAnalysisResult['paintCondition'] {
    switch (condition) {
      case 'excellent': return 'excellent'
      case 'good': return 'good'
      case 'fair': return 'fair'
      case 'poor':
      case 'critical': return 'poor'
      default: return 'good'
    }
  }

  /**
   * Hasar şiddet listesinin ortalamasını hesaplar
   * 
   * Her şiddet seviyesine ağırlık verilir:
   * - minimal: 15
   * - low: 30
   * - medium: 55
   * - high: 80
   * - critical: 95
   * 
   * Ortalama alınarak 0-100 arası değer döndürülür.
   * 
   * @param items - Hasar item'ları (severity property'si olan)
   * @returns number - Ortalama şiddet (0-100)
   * 
   * @private
   */
  private static calculateAverageSeverity(items?: Array<{ severity: string }>): number {
    if (!items || items.length === 0) return 0

    // Şiddet seviyesi → ağırlık mapping
    const severityWeights: Record<string, number> = {
      minimal: 15,
      low: 30,
      medium: 55,
      high: 80,
      critical: 95
    }

    // Toplam ağırlık hesapla
    const total = items.reduce((sum, item) => sum + (severityWeights[item.severity] ?? 40), 0)
    
    // Ortalama al (max 100)
    return Math.min(100, Math.round(total / items.length))
  }

  /**
   * Hasar şiddetini normalize eder
   * 
   * 5 seviye → 3 seviye mapping
   * 
   * Mapping:
   * - 'critical', 'high' → 'high'
   * - 'medium' → 'medium'
   * - 'minimal', 'low', undefined → 'low'
   * 
   * @param severity - Gelişmiş şiddet seviyesi
   * @returns 'low' | 'medium' | 'high' - Normalize şiddet
   * 
   * @private
   */
  private static normalizeDamageSeverity(severity: string | undefined): DamageDetectionResult['damageAreas'][number]['severity'] {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'high'
      case 'medium':
        return 'medium'
      case 'minimal':
      case 'low':
      default:
        return 'low'
    }
  }
}
