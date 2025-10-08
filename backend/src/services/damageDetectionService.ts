/**
 * Hasar Tespit Servisi (Damage Detection Service)
 * 
 * Clean Architecture - Service Layer (İş Mantığı Katmanı)
 * 
 * Bu servis, OpenAI Vision API kullanarak araç hasarlarını tespit eder.
 * 
 * Amaç:
 * - Araç fotoğraflarından hasar tespiti
 * - Detaylı hasar analizi (konum, tip, şiddet, maliyet)
 * - Türkçe hasar raporları
 * - OpenAI GPT-4 Vision ile yüksek doğruluk
 * - Cache mekanizması ile performans
 * 
 * OpenAI Vision API:
 * - Model: gpt-4o-mini (veya environment'tan)
 * - Multimodal: Görüntü + Metin analizi
 * - JSON structured output
 * - Türkçe dil desteği
 * 
 * Hasar Kategorileri:
 * - Çizik (scratch)
 * - Ezilme/Göçük (dent)
 * - Pas (rust)
 * - Oksidasyon (oxidation)
 * - Çatlak (crack)
 * - Kırık (break)
 * - Boya hasarı (paint_damage)
 * - Yapısal hasar (structural)
 * - Mekanik hasar (mechanical)
 * - Elektrik hasarı (electrical)
 * 
 * Özellikler:
 * - Her hasar için detaylı bilgi (konum, maliyet, parçalar, öncelik)
 * - Genel değerlendirme (toplam maliyet, sigorta durumu, değer kaybı)
 * - Teknik analiz (yapısal bütünlük, güvenlik sistemleri)
 * - Güvenlik değerlendirmesi (sürüş güvenliği, kritik sorunlar)
 * - Onarım tahmini (maliyet detayı, zaman planı, garanti)
 * - Gerçekçi Türkiye fiyatları (2025)
 */

import OpenAI from 'openai'
import sharp from 'sharp'
import fs from 'fs/promises'
import crypto from 'crypto'

// ===== TİP TANIMLARI =====

/**
 * Hasar Şiddeti Seviyeleri
 * 
 * - minimal: Çok hafif, estetik sorun
 * - low: Hafif, küçük onarım
 * - medium: Orta, orta seviye onarım
 * - high: Ağır, büyük onarım
 * - critical: Kritik, güvenlik riski
 */
export type DamageSeverity = 'minimal' | 'low' | 'medium' | 'high' | 'critical'

/**
 * Hasar Tipleri
 * 
 * Tüm olası hasar türleri
 */
export type DamageType =
  | 'scratch'        // Çizik
  | 'dent'           // Ezilme/Göçük
  | 'rust'           // Pas
  | 'oxidation'      // Oksidasyon
  | 'crack'          // Çatlak
  | 'break'          // Kırık
  | 'paint_damage'   // Boya hasarı
  | 'structural'     // Yapısal hasar
  | 'mechanical'     // Mekanik hasar
  | 'electrical'     // Elektrik hasarı

/**
 * Hasar Alanı Interface
 * 
 * Tespit edilen her hasar için detaylı bilgi içerir.
 */
export interface DamageArea {
  id: string                                                        // Benzersiz hasar ID'si
  x: number                                                         // X koordinatı (piksel)
  y: number                                                         // Y koordinatı (piksel)
  width: number                                                     // Genişlik (piksel)
  height: number                                                    // Yükseklik (piksel)
  type: DamageType                                                  // Hasar tipi
  severity: DamageSeverity                                          // Şiddet seviyesi
  confidence: number                                                // Güven seviyesi (0-100)
  description: string                                               // Detaylı açıklama (Türkçe)
  area: 'front' | 'rear' | 'left' | 'right' | 'top' | 'bottom' | 'interior' | 'mechanical' // Bölge
  repairCost: number                                                // Onarım maliyeti (TL)
  partsAffected: string[]                                           // Etkilenen parçalar (Türkçe)
  repairPriority: 'immediate' | 'urgent' | 'normal' | 'cosmetic'  // Onarım önceliği
  safetyImpact: 'none' | 'low' | 'medium' | 'high' | 'critical'  // Güvenlik etkisi
  repairMethod: string                                              // Onarım yöntemi (Türkçe)
  estimatedRepairTime: number                                       // Tahmini onarım süresi (saat)
  warrantyImpact: boolean                                           // Garantiyi etkiler mi?
  insuranceCoverage: 'full' | 'partial' | 'none'                   // Sigorta kapsamı
}

/**
 * Genel Değerlendirme Interface
 * 
 * Tüm hasarlar için özet değerlendirme
 */
export interface OverallAssessment {
  damageLevel: 'excellent' | 'good' | 'fair' | 'poor' | 'total_loss'  // Genel hasar seviyesi
  totalRepairCost: number                                              // Toplam onarım maliyeti (TL)
  insuranceStatus: 'repairable' | 'total_loss' | 'economical_repair'  // Sigorta durumu
  marketValueImpact: number                                            // Piyasa değerine etkisi (%)
  detailedAnalysis: string                                             // Detaylı analiz metni
  vehicleCondition: 'like_new' | 'good' | 'fair' | 'poor' | 'damaged' // Araç durumu
  resaleValue: number                                                  // Yeniden satış değeri (%)
  depreciation: number                                                 // Değer kaybı (%)
}

/**
 * Teknik Analiz Interface
 * 
 * Aracın teknik durumunu değerlendirir
 */
export interface TechnicalAnalysis {
  structuralIntegrity: 'intact' | 'minor_damage' | 'moderate_damage' | 'severe_damage' | 'compromised' // Yapısal bütünlük
  safetySystems: 'functional' | 'minor_issues' | 'major_issues' | 'non_functional'  // Güvenlik sistemleri
  mechanicalSystems: 'operational' | 'minor_issues' | 'major_issues' | 'non_operational' // Mekanik sistemler
  electricalSystems: 'functional' | 'minor_issues' | 'major_issues' | 'non_functional' // Elektrik sistemleri
  bodyAlignment: 'perfect' | 'minor_deviation' | 'moderate_deviation' | 'severe_deviation' // Gövde hizalaması
  frameDamage: boolean                                                // Şasi hasarı var mı?
  airbagDeployment: boolean                                           // Hava yastığı patlamış mı?
  seatbeltFunction: 'functional' | 'needs_inspection' | 'non_functional' // Emniyet kemeri fonksiyonu
}

/**
 * Güvenlik Değerlendirmesi Interface
 * 
 * Sürüş güvenliği ve kritik sorunlar
 */
export interface SafetyAssessment {
  roadworthiness: 'safe' | 'conditional' | 'unsafe'  // Sürüş güvenliği
  criticalIssues: string[]                            // Kritik sorunlar listesi
  safetyRecommendations: string[]                     // Güvenlik önerileri
  inspectionRequired: boolean                         // Detaylı muayene gerekli mi?
  immediateActions: string[]                          // Acil aksiyonlar
  longTermConcerns: string[]                          // Uzun vadeli endişeler
}

/**
 * Onarım Tahmini Interface
 * 
 * Detaylı maliyet ve zaman tahmini
 */
export interface RepairEstimate {
  totalCost: number                                   // Toplam maliyet (TL)
  laborCost: number                                   // İşçilik maliyeti (TL)
  partsCost: number                                   // Parça maliyeti (TL)
  paintCost: number                                   // Boya maliyeti (TL)
  additionalCosts: number                             // Ek maliyetler (TL)
  breakdown: Array<{                                  // Maliyet detayı
    part: string                                      // Parça adı
    description: string                               // Açıklama
    cost: number                                      // Maliyet
  }>
  timeline: Array<{                                   // Zaman planı
    phase: string                                     // Aşama
    duration: number                                  // Süre (gün)
    description: string                               // Açıklama
  }>
  warranty: {                                         // Garanti bilgisi
    covered: boolean                                  // Garanti kapsamında mı?
    duration: string                                  // Garanti süresi
    conditions: string[]                              // Garanti koşulları
  }
}

/**
 * Hasar Tespit Sonucu Interface
 * 
 * Tüm analiz sonuçlarını içerir
 */
export interface DamageDetectionResult {
  damageAreas: DamageArea[]                           // Tespit edilen hasarlar
  overallAssessment: OverallAssessment                // Genel değerlendirme
  technicalAnalysis: TechnicalAnalysis                // Teknik analiz
  safetyAssessment: SafetyAssessment                  // Güvenlik değerlendirmesi
  repairEstimate: RepairEstimate                      // Onarım tahmini
  aiProvider: string                                  // AI sağlayıcı
  model: string                                       // AI model
  confidence: number                                  // Genel güven seviyesi (0-100)
  analysisTimestamp: string                           // Analiz zamanı (ISO)
}

// ===== YARDIMCI FONKSİYONLAR =====

/**
 * OpenAI Model Seçimi
 * 
 * Environment variable'dan model adı alınır, yoksa default kullanılır
 */
const OPENAI_MODEL = process.env.OPENAI_DAMAGE_MODEL ?? 'gpt-4o-mini'

/**
 * "Not Found" hatasını kontrol eder
 * 
 * @param error - Hata objesi
 * @returns true: not found hatası, false: başka hata
 */
const isNotFoundError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false
  const message = (error as any).message?.toString().toLowerCase() ?? ''
  const status = (error as any).status ?? (error as any).statusCode
  return status === 404 || message.includes('not found') || message.includes('model') && message.includes('supported')
}

/**
 * Kota (quota) hatasını kontrol eder
 * 
 * @param error - Hata objesi
 * @returns true: quota hatası, false: başka hata
 */
const isQuotaError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false
  const code = (error as any).code?.toString().toLowerCase()
  const message = (error as any).message?.toString().toLowerCase() ?? ''
  return code === 'insufficient_quota' || message.includes('quota') || message.includes('rate limit')
}

/**
 * Sayıyı min-max aralığına sınırlar
 * 
 * @param value - Değer
 * @param min - Minimum
 * @param max - Maximum
 * @returns Sınırlanmış değer
 */
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/**
 * Değeri float'a çevirir, hata varsa fallback döner
 * 
 * @param value - Değer
 * @param fallback - Fallback değer
 * @returns Float sayı
 */
const ensureFloat = (value: any, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * Değeri integer'a çevirir, hata varsa fallback döner
 * 
 * @param value - Değer
 * @param fallback - Fallback değer
 * @returns Integer sayı
 */
const ensureInt = (value: any, fallback: number) => Math.round(ensureFloat(value, fallback))

/**
 * Değeri string array'e çevirir
 * 
 * @param value - Değer
 * @returns String array (valid olanlar)
 */
const ensureStringArray = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string') as string[]
  }
  return []
}

/**
 * Varsayılan hasar alanı oluşturur
 * 
 * AI yanıt vermezse veya hatalı yanıt verirse kullanılır
 * 
 * @param index - Hasar index'i
 * @returns Varsayılan DamageArea
 */
const defaultDamageArea = (index: number): DamageArea => ({
  id: `damage-${index + 1}`,
  x: 0,
  y: 0,
  width: 50,
  height: 50,
  type: 'scratch',
  severity: 'low',
  confidence: 40,
  description: 'AI tarafından hasar tespit edilemedi, manuel inceleme önerilir.',
  area: 'front',
  repairCost: 750,
  partsAffected: [],
  repairPriority: 'normal',
  safetyImpact: 'low',
  repairMethod: 'Profesyonel değerlendirme önerilir',
  estimatedRepairTime: 2,
  warrantyImpact: false,
  insuranceCoverage: 'partial'
})

// ===== SERVİS =====

/**
 * DamageDetectionService Sınıfı
 * 
 * OpenAI Vision API ile hasar tespiti yapan ana servis
 */
export class DamageDetectionService {
  /**
   * OpenAI client instance
   */
  private static openaiClient: OpenAI | null = null

  /**
   * Initialization durumu
   */
  private static isInitialized = false

  /**
   * In-memory cache (image hash → result)
   */
  private static cache = new Map<string, DamageDetectionResult>()

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
        console.log('[AI] OpenAI istemcisi hazırlandı')
      } else {
        console.error('[AI] OPENAI_API_KEY tanımlı değil! Lütfen .env dosyasına ekleyin.')
        throw new Error('OpenAI API key bulunamadı')
      }

      this.isInitialized = true
    } catch (error) {
      console.error('[AI] OpenAI servisi başlatılırken hata oluştu:', error)
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
   * Görüntüyü Base64'e çevirir
   * 
   * Sharp ile optimize eder (1024x1024, JPEG %90)
   * 
   * @param imagePath - Görüntü path'i veya data URL
   * @returns Base64 string
   * 
   * @private
   */
  private static async convertImageToBase64(imagePath: string): Promise<string> {
    // Data URL ise direkt base64 kısmını al
    if (imagePath.startsWith('data:')) {
      return imagePath.split(',')[1]
    }

    // Dosya path'i ise oku ve optimize et
    const buffer = await fs.readFile(imagePath)
    const optimized = await sharp(buffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer()

    return optimized.toString('base64')
  }

  /**
   * Görüntü hash'ini hesaplar (cache key için)
   * 
   * MD5 hash kullanır
   * 
   * @param imagePath - Görüntü path'i
   * @returns MD5 hash
   * 
   * @private
   */
  private static async getImageHash(imagePath: string): Promise<string> {
    try {
      const buffer = imagePath.startsWith('data:')
        ? Buffer.from(imagePath.split(',')[1], 'base64')
        : await fs.readFile(imagePath)
      return crypto.createHash('md5').update(buffer).digest('hex')
    } catch (error) {
      console.warn('[AI] Görsel hash hesaplanamadı, rastgele anahtar kullanılacak', error)
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`
    }
  }

  /**
   * OpenAI için Türkçe prompt oluşturur
   * 
   * ÇOK DETAYLI prompt ile AI'ya ne yapması gerektiğini anlatır:
   * - Hasar tespit kuralları
   * - Türkiye fiyatları (2025)
   * - JSON format örneği
   * - Kritik kurallar
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

Bu araç bilgilerini göz önünde bulundurarak hasar analizi yap.` : ''

    return `Sen profesyonel bir otomotiv hasar eksperisin. Araç fotoğrafını ÇOK DETAYLI analiz et ve TÜM hasarları Türkçe olarak raporla.

🎯 ÖNEMLİ: RAPOR TAMAMEN TÜRKÇE OLMALI - HİÇBİR İNGİLİZCE KELİME KULLANMA!

${vehicleContext}

📋 HASAR TESPİT KURALLARI:
1. Fotoğraftaki HER hasarı ayrı ayrı tespit et ve raporla
2. Her hasar için şu bilgileri VER:
   - Hasar türü (Türkçe): Çizik, Ezilme, Kırık, Çatlak, Paslanma, Boya Hasarı vb.
   - Şiddet seviyesi: minimal, low, medium, high, critical
   - Etkilenen parçalar (Türkçe): "Ön Sağ Çamurluk", "Ön Tampon", "Far Grubu" gibi
   - Detaylı açıklama (Türkçe): Hasarın ne olduğunu, nerede olduğunu, nasıl onarılacağını açıkla
   - Koordinat bilgisi: x, y, width, height (piksel cinsinden)
   - Güvenilirlik: 0-100 arası yüzde değeri
   - Onarım maliyeti: Türk Lirası cinsinden gerçekçi fiyat

💰 MALİYET HESAPLAMA (Türkiye 2025 Gerçek Fiyatları):
- Çamurluk değişimi + boya: 15.000-25.000 TL
- Far grubu değişimi: 8.000-15.000 TL  
- Tampon değişimi + boya: 10.000-18.000 TL
- Kaput düzeltme + boya: 12.000-20.000 TL
- Kapı düzeltme + boya: 8.000-15.000 TL
- Cam değişimi: 3.000-8.000 TL
- Ayna değişimi: 2.000-5.000 TL
- Jant değişimi: 3.000-8.000 TL
- Çizik giderme: 800-2.000 TL
- Göçük düzeltme: 1.500-5.000 TL

🔍 ÇIKTI FORMATI (Sadece geçerli JSON döndür, TAMAMEN TÜRKÇE):
{
  "damageAreas": [
    {
      "id": "hasar-1",
      "x": 150,
      "y": 200,
      "width": 120,
      "height": 80,
      "type": "dent",
      "severity": "high",
      "confidence": 95,
      "description": "Ön sağ çamurlukta ciddi ezilme ve bükülme tespit edildi. Metal yapı deforme olmuş. Çamurluk komple değiştirilmeli ve boya yapılmalı. Ön sağ kapı kenarı da etkilenmiş durumda.",
      "area": "front",
      "repairCost": 18000,
      "partsAffected": ["Ön Sağ Çamurluk", "Ön Sağ Kapı Kenarı", "Yan Panel"],
      "repairPriority": "urgent",
      "safetyImpact": "medium",
      "repairMethod": "Çamurluk komple değişimi + profesyonel boya uygulaması + kapı kenarı düzeltme",
      "estimatedRepairTime": 8,
      "warrantyImpact": true,
      "insuranceCoverage": "full"
    },
    {
      "id": "hasar-2",
      "x": 70,
      "y": 120,
      "width": 100,
      "height": 80,
      "type": "break",
      "severity": "high",
      "confidence": 90,
      "description": "Ön sağ far grubu kırık. Far camı parçalanmış durumda. Far grubu komple değiştirilmeli. Gece sürüş tehlikeli.",
      "area": "front",
      "repairCost": 12000,
      "partsAffected": ["Ön Sağ Far Grubu", "Far Camı", "Far Muhafazası"],
      "repairPriority": "urgent",
      "safetyImpact": "high",
      "repairMethod": "Far grubu komple değişimi + elektrik bağlantı kontrolü",
      "estimatedRepairTime": 4,
      "warrantyImpact": true,
      "insuranceCoverage": "full"
    }
  ],
  "overallAssessment": {
    "damageLevel": "poor",
    "totalRepairCost": 85000,
    "insuranceStatus": "repairable",
    "marketValueImpact": 25,
    "detailedAnalysis": "Araçta ön sağ tarafta orta-ağır seviyede hasar tespit edildi. Çamurluk, far grubu, tampon ve kaput bölgeleri etkilenmiş durumda. Yapısal bütünlük kontrol edilmeli. Mekanik ve elektrik sistemleri mutlaka kontrol edilmelidir. Şasi ölçümü önerilir.",
    "vehicleCondition": "damaged",
    "resaleValue": 75,
    "depreciation": 25,
    "strengths": [
      "Motor bölgesi hasarsız görünüyor",
      "Arka taraf temiz durumda",
      "Sol taraf hasarsız"
    ],
    "weaknesses": [
      "Ön sağ tarafta ciddi hasar var",
      "Far grubu kırık - gece sürüş tehlikeli",
      "Çamurluk komple değişmeli"
    ],
    "recommendations": [
      "Acil onarım gerekli - aracı kullanmayın",
      "Yetkili serviste detaylı kontrol yaptırın",
      "Şasi ölçümü mutlaka yapılmalı",
      "Sigorta şirketini bilgilendirin"
    ],
    "safetyConcerns": [
      "Far kırık - gece sürüş tehlikeli",
      "Yapısal hasar olabilir",
      "Güvenlik sistemleri kontrol edilmeli"
    ]
  },
  "technicalAnalysis": {
    "structuralIntegrity": "moderate_damage",
    "safetySystems": "needs_inspection",
    "mechanicalSystems": "needs_inspection",
    "electricalSystems": "needs_inspection",
    "bodyAlignment": "moderate_deviation",
    "frameDamage": false,
    "airbagDeployment": false,
    "seatbeltFunction": "functional",
    "notes": "Ön sağ tarafta orta seviye yapısal hasar mevcut. Detaylı kontrol şart."
  },
  "safetyAssessment": {
    "roadworthiness": "conditional",
    "criticalIssues": [
      "Ön sağ tarafta yapısal hasar mevcut",
      "Far grubu kırık - gece sürüş çok tehlikeli",
      "Çamurluk ciddi şekilde deforme olmuş"
    ],
    "safetyRecommendations": [
      "Aracı derhal kullanmayı bırakın",
      "Yetkili servise çektirin",
      "Mekanik ve elektrik kontrolleri mutlaka yaptırın",
      "Şasi ölçümü ve rot-balans kontrolü şart"
    ],
    "inspectionRequired": true,
    "immediateActions": [
      "Far grubu acil değiştirilmeli",
      "Çamurluk onarımı öncelikli",
      "Rot-balans ve aks kontrolü",
      "Elektrik sistemleri test edilmeli"
    ],
    "longTermConcerns": [
      "Şasi hasarı riski yüksek",
      "Paslanma başlayabilir",
      "Değer kaybı devam edebilir"
    ]
  },
  "repairEstimate": {
    "totalCost": 85000,
    "laborCost": 25000,
    "partsCost": 50000,
    "paintCost": 8000,
    "additionalCosts": 2000,
    "breakdown": [
      {
        "part": "Ön Sağ Çamurluk",
        "description": "Komple değişim + profesyonel boya uygulaması + montaj",
        "cost": 18000
      },
      {
        "part": "Ön Sağ Far Grubu",
        "description": "Komple far grubu değişimi + elektrik bağlantı kontrolü",
        "cost": 12000
      },
      {
        "part": "Ön Tampon",
        "description": "Komple tampon değişimi + boya + montaj",
        "cost": 15000
      },
      {
        "part": "Kaput",
        "description": "Düzeltme + boya + parlatma",
        "cost": 14000
      },
      {
        "part": "Ön Sağ Kapı",
        "description": "Kenar düzeltme + lokal boya",
        "cost": 8000
      },
      {
        "part": "Diğer İşçilik",
        "description": "Sökme-takma + ayar + test",
        "cost": 18000
      }
    ],
    "timeline": [
      {
        "phase": "Parça Tedariki",
        "duration": 3,
        "description": "Orijinal yedek parça siparişi ve temin süreci"
      },
      {
        "phase": "Sökme İşlemi",
        "duration": 1,
        "description": "Hasarlı parçaların sökülmesi ve hazırlık"
      },
      {
        "phase": "Onarım ve Montaj",
        "duration": 4,
        "description": "Yeni parça montajı ve düzeltme işlemleri"
      },
      {
        "phase": "Boya İşlemi",
        "duration": 2,
        "description": "Profesyonel boya uygulaması ve kurutma"
      },
      {
        "phase": "Kalite Kontrol",
        "duration": 1,
        "description": "Detaylı kontrol, test sürüşü ve teslim hazırlığı"
      }
    ],
    "warranty": {
      "covered": true,
      "duration": "12 ay veya 20.000 km",
      "conditions": [
        "Yetkili serviste onarım yapılmalı",
        "Orijinal yedek parça kullanılmalı",
        "Düzenli bakım takibi yapılmalı"
      ]
    }
  }
}

⚠️ KRİTİK KURALLAR:
- RAPOR TAMAMEN TÜRKÇE OLMALI - HİÇBİR İNGİLİZCE KELİME YOK!
- Eğer fotoğrafta HASAR YOKSA, damageAreas boş array [] döndür
- Her hasar için DETAYLI Türkçe açıklama yaz (minimum 2 cümle)
- Maliyet değerlerini GERÇEKÇI hesapla (Türkiye 2025 fiyatları)
- Her hasarı AYRI AYRI belirt, birleştirme
- Koordinat bilgilerini mutlaka ver (x, y, width, height)
- Etkilenen parçaları Türkçe listele
- Sadece geçerli JSON döndür, başka metin ekleme
- Tüm field'lar Türkçe değerler içermeli`
  }

  /**
   * AI yanıtından JSON payload'ı çıkarır
   * 
   * AI bazen JSON öncesi veya sonrasında açıklama metni ekler,
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
   * AI sonucunu normalize eder ve validation yapar
   * 
   * AI bazen eksik veya hatalı veri döndürebilir,
   * bu fonksiyon tüm field'ları kontrol eder ve fallback değerlerle doldurur.
   * 
   * @param raw - AI'dan gelen ham sonuç
   * @param provider - AI sağlayıcı adı
   * @param model - Model adı
   * @returns Normalize edilmiş DamageDetectionResult
   * 
   * @private
   */
  private static sanitizeDamageResult(raw: any, provider: string, model: string): DamageDetectionResult {
    // Hasar alanlarını normalize et
    const areasSource = Array.isArray(raw?.damageAreas) ? raw.damageAreas : []
    const damageAreas: DamageArea[] = (areasSource.length ? areasSource : [defaultDamageArea(0)]).map((area: any, index: number) => ({
      ...defaultDamageArea(index),
      ...area,
      id: typeof area?.id === 'string' ? area.id : `damage-${index + 1}`,
      x: ensureInt(area?.x, 0),
      y: ensureInt(area?.y, 0),
      width: ensureInt(area?.width, 60),
      height: ensureInt(area?.height, 40),
      type: (area?.type ?? 'scratch') as DamageType,
      severity: (area?.severity ?? 'low') as DamageSeverity,
      confidence: clamp(ensureInt(area?.confidence, 65), 0, 100),
      description: typeof area?.description === 'string' && area.description.trim().length > 0
        ? area.description.trim()
        : 'Hasar tespiti için ek inceleme önerilir.',
      area: (area?.area ?? 'front') as DamageArea['area'],
      repairCost: Math.max(0, ensureInt(area?.repairCost, 750)),
      partsAffected: ensureStringArray(area?.partsAffected),
      repairPriority: (area?.repairPriority ?? 'normal') as DamageArea['repairPriority'],
      safetyImpact: (area?.safetyImpact ?? 'low') as DamageArea['safetyImpact'],
      repairMethod: typeof area?.repairMethod === 'string' ? area.repairMethod : 'Yetkili serviste onarım önerilir',
      estimatedRepairTime: Math.max(1, ensureInt(area?.estimatedRepairTime, 2)),
      warrantyImpact: Boolean(area?.warrantyImpact),
      insuranceCoverage: (area?.insuranceCoverage ?? 'partial') as DamageArea['insuranceCoverage']
    }))

    // Toplam maliyet hesapla
    const totalRepairCost = Math.max(
      ensureInt(raw?.overallAssessment?.totalRepairCost, damageAreas.reduce((sum, area) => sum + area.repairCost, 0)),
      0
    )

    // Genel değerlendirme
    const overallAssessment: OverallAssessment = {
      damageLevel: (raw?.overallAssessment?.damageLevel ?? 'fair') as OverallAssessment['damageLevel'],
      totalRepairCost,
      insuranceStatus: (raw?.overallAssessment?.insuranceStatus ?? 'repairable') as OverallAssessment['insuranceStatus'],
      marketValueImpact: clamp(ensureInt(raw?.overallAssessment?.marketValueImpact, Math.floor(totalRepairCost / 200)), 0, 100),
      detailedAnalysis: typeof raw?.overallAssessment?.detailedAnalysis === 'string'
        ? raw.overallAssessment.detailedAnalysis
        : 'Genel inceleme tamamlandı. Hasarın kapsamı yukarıda listelenmiştir.',
      vehicleCondition: (raw?.overallAssessment?.vehicleCondition ?? 'fair') as OverallAssessment['vehicleCondition'],
      resaleValue: clamp(ensureInt(raw?.overallAssessment?.resaleValue, Math.max(0, 100 - Math.floor(totalRepairCost / 150))), 0, 100),
      depreciation: clamp(ensureInt(raw?.overallAssessment?.depreciation, Math.floor(totalRepairCost / 180)), 0, 100)
    }

    // Teknik analiz
    const technicalAnalysis: TechnicalAnalysis = {
      structuralIntegrity: (raw?.technicalAnalysis?.structuralIntegrity ?? 'intact') as TechnicalAnalysis['structuralIntegrity'],
      safetySystems: (raw?.technicalAnalysis?.safetySystems ?? 'functional') as TechnicalAnalysis['safetySystems'],
      mechanicalSystems: (raw?.technicalAnalysis?.mechanicalSystems ?? 'operational') as TechnicalAnalysis['mechanicalSystems'],
      electricalSystems: (raw?.technicalAnalysis?.electricalSystems ?? 'functional') as TechnicalAnalysis['electricalSystems'],
      bodyAlignment: (raw?.technicalAnalysis?.bodyAlignment ?? 'perfect') as TechnicalAnalysis['bodyAlignment'],
      frameDamage: Boolean(raw?.technicalAnalysis?.frameDamage),
      airbagDeployment: Boolean(raw?.technicalAnalysis?.airbagDeployment),
      seatbeltFunction: (raw?.technicalAnalysis?.seatbeltFunction ?? 'functional') as TechnicalAnalysis['seatbeltFunction']
    }

    // Güvenlik değerlendirmesi
    const safetyAssessment: SafetyAssessment = {
      roadworthiness: (raw?.safetyAssessment?.roadworthiness ?? 'safe') as SafetyAssessment['roadworthiness'],
      criticalIssues: ensureStringArray(raw?.safetyAssessment?.criticalIssues),
      safetyRecommendations: ensureStringArray(raw?.safetyAssessment?.safetyRecommendations),
      inspectionRequired: Boolean(raw?.safetyAssessment?.inspectionRequired),
      immediateActions: ensureStringArray(raw?.safetyAssessment?.immediateActions),
      longTermConcerns: ensureStringArray(raw?.safetyAssessment?.longTermConcerns)
    }

    // Onarım tahmini
    const repairEstimate: RepairEstimate = {
      totalCost: totalRepairCost,
      laborCost: ensureInt(raw?.repairEstimate?.laborCost, Math.floor(totalRepairCost * 0.4)),
      partsCost: ensureInt(raw?.repairEstimate?.partsCost, Math.floor(totalRepairCost * 0.5)),
      paintCost: ensureInt(raw?.repairEstimate?.paintCost, Math.floor(totalRepairCost * 0.1)),
      additionalCosts: ensureInt(raw?.repairEstimate?.additionalCosts, 0),
      breakdown: Array.isArray(raw?.repairEstimate?.breakdown)
        ? raw.repairEstimate.breakdown.map((item: any, index: number) => ({
            part: typeof item?.part === 'string' ? item.part : damageAreas[index]?.type ?? 'body_panel',
            description: typeof item?.description === 'string' ? item.description : damageAreas[index]?.description ?? 'Onarım detayı',
            cost: ensureInt(item?.cost, damageAreas[index]?.repairCost ?? 0)
          }))
        : damageAreas.map(area => ({ part: area.type, description: area.description, cost: area.repairCost })),
      timeline: Array.isArray(raw?.repairEstimate?.timeline)
        ? raw.repairEstimate.timeline.map((item: any) => ({
            phase: typeof item?.phase === 'string' ? item.phase : 'Onarım',
            duration: Math.max(1, ensureInt(item?.duration, 1)),
            description: typeof item?.description === 'string' ? item.description : 'Planlanan işlem'
          }))
        : [
            { phase: 'Hazırlık', duration: 1, description: 'Detaylı inceleme ve parça tedariki' },
            { phase: 'Onarım', duration: Math.max(1, Math.ceil(totalRepairCost / 1500)), description: 'Ana onarım ve montaj' },
            { phase: 'Kontrol', duration: 1, description: 'Kalite kontrol ve teslim hazırlığı' }
          ],
      warranty: {
        covered: Boolean(raw?.repairEstimate?.warranty?.covered ?? true),
        duration: typeof raw?.repairEstimate?.warranty?.duration === 'string'
          ? raw.repairEstimate.warranty.duration
          : '12 ay',
        conditions: ensureStringArray(raw?.repairEstimate?.warranty?.conditions).length
          ? ensureStringArray(raw?.repairEstimate?.warranty?.conditions)
          : ['Yetkili servis bakımı', 'Orijinal parça kullanımı']
      }
    }

    return {
      damageAreas,
      overallAssessment,
      technicalAnalysis,
      safetyAssessment,
      repairEstimate,
      aiProvider: provider,
      model,
      confidence: clamp(ensureInt(raw?.confidence, 85), 0, 100),
      analysisTimestamp: typeof raw?.analysisTimestamp === 'string' ? raw.analysisTimestamp : new Date().toISOString()
    }
  }

  /**
   * OpenAI Vision API ile hasar tespiti yapar
   * 
   * @param imagePath - Görüntü path'i
   * @param vehicleInfo - Araç bilgileri (opsiyonel)
   * @returns Hasar tespit sonucu
   * @throws Error - API hatası
   * 
   * @private
   */
  private static async detectDamageWithOpenAI(imagePath: string, vehicleInfo?: any): Promise<DamageDetectionResult> {
    if (!this.openaiClient) {
      throw new Error('OpenAI istemcisi kullanılabilir değil')
    }

    const imageBase64 = await this.convertImageToBase64(imagePath)
    const prompt = `${this.buildPrompt(vehicleInfo)}\nLütfen tüm sayısal değerleri sayı olarak döndür.`

    const response = await this.openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: 'Sen deneyimli bir otomotiv eksperisin. Çıktıyı geçerli JSON olarak üret.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ]
    })

    const text = response.choices?.[0]?.message?.content
    if (!text) {
      throw new Error('OpenAI yanıtı boş geldi')
    }

    const parsed = this.extractJsonPayload(text)
    return this.sanitizeDamageResult(parsed, 'OpenAI', OPENAI_MODEL)
  }

  /**
   * Hasar Tespiti - Public API
   * 
   * Cache kontrolü yapar, yoksa OpenAI ile analiz eder.
   * 
   * @param imagePath - Görüntü path'i
   * @param vehicleInfo - Araç bilgileri (opsiyonel)
   * @returns Hasar tespit sonucu
   * @throws Error - API hatası
   */
  static async detectDamage(imagePath: string, vehicleInfo?: any): Promise<DamageDetectionResult> {
    await this.initialize()

    const cacheKey = await this.getImageHash(imagePath)
    const cached = this.cache.get(cacheKey)
    if (cached) {
      console.log('[AI] Hasar analizi cache üzerinden döndürüldü')
      return cached
    }

    try {
      console.log('[AI] OpenAI ile hasar analizi başlatılıyor...')
      const result = await this.detectDamageWithOpenAI(imagePath, vehicleInfo)
      console.log('[AI] OpenAI hasar analizi başarılı!')
      
      this.cache.set(cacheKey, result)
      return result
    } catch (error) {
      console.error('[AI] OpenAI hasar analizi HATASI:', error)
      console.error('[AI] Hata detayları:', {
        message: (error as any)?.message,
        status: (error as any)?.status,
        statusCode: (error as any)?.statusCode,
        code: (error as any)?.code
      })
      throw new Error('OpenAI hasar analizi başarısız oldu. Lütfen API key\'inizi kontrol edin.')
    }
  }
}
