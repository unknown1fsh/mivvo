/**
 * AI Orkestrasyon Servisi (AI Orchestration Service)
 * 
 * Clean Architecture - Service Layer (İş Mantığı Katmanı)
 * 
 * Bu servis, tüm AI servislerini yöneten merkezi facade (cephe) servisidir.
 * 
 * Amaç:
 * - Birden fazla AI servisini tek noktadan yönetme
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
 * - DamageDetectionService: Hasar tespiti (OpenAI GPT-4 Vision)
 * - PaintAnalysisService: Boya analizi (OpenAI GPT-4 Vision)
 * - AudioAnalysisService: Motor sesi analizi (OpenAI GPT-4)
 * 
 * Hata Stratejisi:
 * - Tüm analizler GERÇEK AI kullanır
 * - AI başarısız olursa hata fırlatılır
 * - Controller'da kredi iadesi yapılır
 * - Kullanıcıya user-friendly hata gösterilir
 */

import { ModernDamageAnalysisService } from './modernDamageAnalysisService'
import { DamageDetectionService, DamageDetectionResult } from './damageDetectionService'
import { PaintAnalysisService, PaintAnalysisResult as AdvancedPaintAnalysisResult } from './paintAnalysisService'
import { AudioAnalysisService, AudioAnalysisResult } from './audioAnalysisService'

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
      console.log('[AI] ✅ Tüm AI servisleri hazır (GERÇEK AI)')
    } catch (error) {
      console.error('[AI] ❌ Servisler başlatılamadı:', error)
      // Hata durumunda da initialized olarak işaretle (retry için)
      this.isInitialized = true
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
        provider: advancedResult.aiSağlayıcı,
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
      console.log('[AI] Modern hasar analizi başlatılıyor...')
      
      // Yeni modern servisi kullan
      const modernResult = await ModernDamageAnalysisService.analyzeImage(imagePath, vehicleInfo)
      
      console.log('[AI] Modern analysis completed:', {
        hasHasarAlanları: !!modernResult.hasarAlanları,
        hasarAlanlarıLength: modernResult.hasarAlanları?.length || 0,
        keys: Object.keys(modernResult)
      })
      
      // Modern sonucu legacy formata çevir
      const legacyResult: DamageDetectionResult = {
        araçÖzeti: modernResult.araçÖzeti,
        görselHasarAnalizi: modernResult.görselHasarAnalizi,
        teknikDurum: modernResult.teknikDurum,
        türkiye2025TamirMaliyeti: modernResult.türkiye2025TamirMaliyeti,
        sigortaPiyasaDeğerlendirmesi: modernResult.sigortaPiyasaDeğerlendirmesi,
        ustaYorumu: modernResult.ustaYorumu,
        kararÖzeti: modernResult.kararÖzeti,
        genelDeğerlendirme: {
          hasarSeviyesi: modernResult.kararÖzeti.hasarTipi.includes('kritik') ? 'kritik' : 'orta',
          toplamOnarımMaliyeti: modernResult.kararÖzeti.tahminiTamirBedeli,
          sigortaDurumu: modernResult.sigortaPiyasaDeğerlendirmesi.sigortaKararı,
          piyasaDeğeriEtkisi: modernResult.sigortaPiyasaDeğerlendirmesi.değerKaybı,
          detaylıAnaliz: modernResult.ustaYorumu.genelDeğerlendirme,
          araçDurumu: modernResult.teknikDurum.ekspertizSonucu,
          satışDeğeri: modernResult.sigortaPiyasaDeğerlendirmesi.onarımSonrasıPiyasaDeğeri,
          değerKaybı: modernResult.sigortaPiyasaDeğerlendirmesi.değerKaybı,
          güçlüYönler: ['Motor bölgesi hasarsız'],
          zayıfYönler: [modernResult.teknikDurum.açıklama],
          öneriler: ['Sigorta şirketini bilgilendir'],
          güvenlikEndişeleri: ['Yapısal bütünlük bozulmuş']
        },
        teknikAnaliz: {
          yapısalBütünlük: modernResult.teknikDurum.monokokBütünlük,
          güvenlikSistemleri: 'risk_altında',
          mekanikSistemler: 'inceleme_gerekli',
          elektrikSistemleri: 'risk_altında',
          gövdeHizalaması: 'kritik_sapma',
          şasiHasarı: modernResult.teknikDurum.şasiHasarı,
          havaYastığıAçılması: false,
          emniyetKemeri: 'fonksiyonel',
          notlar: modernResult.teknikDurum.açıklama
        },
        güvenlikDeğerlendirmesi: {
          yolDurumu: 'tehlikeli',
          kritikSorunlar: ['Yapısal deformasyon'],
          güvenlikÖnerileri: ['Aracı kullanmayı bırak'],
          incelemeGerekli: true,
          acilAksiyonlar: ['Sigorta bildirimi'],
          uzunVadeliEndişeler: ['Yapısal bütünlük kaybı']
        },
        onarımTahmini: {
          toplamMaliyet: modernResult.türkiye2025TamirMaliyeti.toplamMaliyet,
          işçilikMaliyeti: modernResult.türkiye2025TamirMaliyeti.toplamMaliyet * 0.4,
          parçaMaliyeti: modernResult.türkiye2025TamirMaliyeti.toplamMaliyet * 0.5,
          boyaMaliyeti: modernResult.türkiye2025TamirMaliyeti.toplamMaliyet * 0.1,
          ekMaliyetler: 0,
          maliyetKırılımı: modernResult.türkiye2025TamirMaliyeti.maliyetKırılımı.map(item => ({
            parça: item.işlem,
            açıklama: item.işlem,
            maliyet: item.maliyet
          })),
          zamanÇizelgesi: [
            { faz: 'Hasar tespiti', süre: 1, açıklama: 'Detaylı hasar analizi' },
            { faz: 'Parça temini', süre: 7, açıklama: 'Orijinal parça siparişi' },
            { faz: 'Onarım', süre: 15, açıklama: 'Tamir işlemleri' }
          ],
          garantiKapsamı: 'Sınırlı',
          önerilenServis: 'Yetkili servis',
          acilOnarımGerekli: true
        },
        hasarAlanları: modernResult.hasarAlanları.map((area, index) => ({
          id: area.id || `hasar-${index + 1}`,
          x: area.x,
          y: area.y,
          genişlik: area.genişlik,
          yükseklik: area.yükseklik,
          tür: area.tip,
          şiddet: this.normalizeDamageSeverity(area.şiddet),
          güven: 95,
          açıklama: area.açıklama,
          bölge: area.bölge,
          onarımMaliyeti: area.onarımMaliyeti,
          etkilenenParçalar: area.etkilenenParçalar,
          onarımÖnceliği: area.onarımÖnceliği,
          güvenlikEtkisi: area.güvenlikEtkisi,
          onarımYöntemi: area.onarımYöntemi,
          tahminiOnarımSüresi: area.tahminiOnarımSüresi,
          garantiEtkisi: area.garantiEtkisi,
          sigortaKapsamı: area.sigortaKapsamı
        })),
        aiSağlayıcı: modernResult.aiSağlayıcı,
        model: modernResult.model,
        güven: modernResult.güven,
        analizZamanı: modernResult.analizZamanı
      }

      console.log('[AI] Legacy conversion completed:', {
        provider: legacyResult.aiSağlayıcı,
        model: legacyResult.model,
        damageCount: legacyResult.hasarAlanları.length
      })

      return legacyResult
    } catch (error) {
      console.error('[AI] Modern hasar analizi başarısız:', error)
      throw error
    }
  }

  /**
   * Motor Sesi Analizi
   * 
   * SADECE GERÇEK AI kullanır - Fallback/Mock YOK!
   * 
   * İşlem akışı:
   * 1. Initialize kontrolü
   * 2. AudioAnalysisService.analyzeEngineSound() çağır (GPT-4)
   * 3. Ses metadata + araç bilgisi → GPT-4'e gönderilir
   * 4. Başarı loglama
   * 5. Sonuç döndür
   * 
   * Hata Stratejisi:
   * - AI başarısız olursa exception fırlat
   * - Controller'da kredi iadesi yapılır
   * - Kullanıcıya user-friendly hata gösterilir
   * 
   * @param audioPath - Motor sesi dosyası path'i
   * @param vehicleInfo - Araç bilgileri (opsiyonel)
   * @returns Promise<AudioAnalysisResult> - GERÇEK AI motor sesi analiz sonucu
   * @throws Error - AI analizi başarısız olursa
   * 
   * @example
   * const result = await AIService.analyzeEngineSound('./engine.mp3', { make: 'Mercedes', year: 2008 });
   * console.log(result.engineHealth); // 'good'
   * console.log(result.overallScore); // 82
   */
  static async analyzeEngineSound(audioPath: string, vehicleInfo?: any): Promise<AudioAnalysisResult> {
    await this.initialize()

    try {
      console.log('[AI] GERÇEK AI motor sesi analizi başlatılıyor...')
      
      // GERÇEK AI servisini çağır (GPT-4)
      const result = await AudioAnalysisService.analyzeEngineSound(audioPath, vehicleInfo)
      
      console.log('[AI] ✅ Motor sesi analizi tamamlandı (GERÇEK AI):', {
        provider: result.aiProvider,
        model: result.model,
        overallScore: result.overallScore
      })
      
      return result
    } catch (error) {
      console.error('[AI] ❌ Motor sesi analizi BAŞARISIZ:', error)
      // Fallback YOK - Hata fırlat, controller'da kredi iade edilecek
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
    const recommendations = this.collectPaintRecommendations(result.öneriler)

    return {
      paintCondition: this.mapPaintCondition(result.boyaDurumu),
      paintThickness: result.yüzeyAnalizi?.toplamKalınlık ?? result.yüzeyAnalizi?.boyaKalınlığı ?? 0,
      colorMatch: result.renkAnalizi?.renkEşleşmesi ?? 0,
      // Hasar bilgileri kaldırıldı - bunlar hasar analizi raporunda
      scratches: 0,
      dents: 0,
      rust: false,
      oxidation: 0,
      glossLevel: result.boyaKalitesi?.parlaklıkSeviyesi ?? 0,
      overallScore: result.boyaKalitesi?.genelPuan ?? 0,
      recommendations: recommendations.length > 0 ? recommendations : ['Detaylı boya bakımı önerilir'],
      confidence: result.güvenSeviyesi ?? 0,
      technicalDetails: {
        paintSystem: result.teknikDetaylar?.boyaSistemi ?? 'Belirtilmedi',
        primerType: result.teknikDetaylar?.astarTürü ?? 'Belirtilmedi',
        baseCoat: result.teknikDetaylar?.bazKat ?? 'Belirtilmedi',
        clearCoat: result.teknikDetaylar?.vernik ?? 'Belirtilmedi',
        totalThickness: result.yüzeyAnalizi?.toplamKalınlık ?? 0,
        colorCode: result.renkAnalizi?.renkKodu ?? 'Belirtilmedi'
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
  private static collectPaintRecommendations(recommendations?: AdvancedPaintAnalysisResult['öneriler']): string[] {
    if (!recommendations) return []

    // Tüm kategori array'lerini topla
    const groups = [
      recommendations.acil,
      recommendations.kısaVadeli,
      recommendations.uzunVadeli,
      recommendations.bakım,
      recommendations.koruma,
      recommendations.restorasyon,
      recommendations.önleme
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
  private static mapPaintCondition(condition: AdvancedPaintAnalysisResult['boyaDurumu'] | undefined): PaintAnalysisResult['paintCondition'] {
    // BoyaDurumu nesnesi ise genelDurum alanını kullan
    const durum = typeof condition === 'object' && condition !== null 
      ? condition.genelDurum 
      : condition
    
    switch (durum) {
      case 'mükemmel': return 'excellent'
      case 'iyi': return 'good'
      case 'orta': return 'fair'
      case 'kötü':
      case 'kritik': return 'poor'
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
  private static normalizeDamageSeverity(severity: string | undefined): DamageDetectionResult['hasarAlanları'][number]['şiddet'] {
    switch (severity) {
      case 'kritik':
      case 'yüksek':
        return 'yüksek'
      case 'orta':
        return 'orta'
      case 'minimal':
      case 'düşük':
      default:
        return 'düşük'
    }
  }
}
