/**
 * Boya Analizi Servisi (Paint Analysis Service)
 * 
 * Clean Architecture - Service Layer (İş Mantığı Katmanı)
 * 
 * Bu servis, OpenAI Vision API kullanarak araç boyası analizi yapar.
 * 
 * Amaç:
 * - Boya kalitesi değerlendirmesi
 * - Renk analizi ve eşleşme
 * - Yüzey kusurları tespiti
 * - Mikron seviyesinde kalınlık ölçümü
 * - Detaylı Türkçe boya raporu
 * - Bakım önerileri ve maliyet tahmini
 * 
 * Boya Analiz Kategorileri:
 * - Boya kalitesi (gloss, pürüzsüzlük, uniformite)
 * - Renk analizi (kod, isim, metalik/perle, solma)
 * - Yüzey analizi (kalınlık, portakal kabuğu, kirlilik)
 * - Hasar değerlendirmesi (çizik, göçük, pas, oksidasyon)
 * - Teknik detaylar (sistem, marka, yöntem)
 * - Öneriler (acil, kısa/uzun vadeli, bakım)
 * - Maliyet tahmini (detaylı breakdown, timeline)
 * 
 * Özellikler:
 * - OpenAI Vision API entegrasyonu
 * - Sharp ile görsel optimizasyonu
 * - Gerçekçi Türkiye fiyatları (2025)
 * - Detaylı kusur açıklaması
 * - Cache mekanizması
 */

import OpenAI from 'openai'
import sharp from 'sharp'
import fs from 'fs/promises'
import crypto from 'crypto'

// ===== TİP TANIMLARI =====

/**
 * Boya Analizi Sonucu Interface
 * 
 * Tüm boya analizi sonuçlarını içerir
 */
export interface PaintAnalysisResult {
  paintCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'  // Boya durumu
  paintQuality: PaintQuality                                             // Boya kalitesi
  colorAnalysis: ColorAnalysis                                           // Renk analizi
  surfaceAnalysis: SurfaceAnalysis                                       // Yüzey analizi
  damageAssessment: PaintDamageAssessment                                // Hasar değerlendirmesi
  technicalDetails: TechnicalDetails                                     // Teknik detaylar
  recommendations: PaintRecommendations                                  // Öneriler
  costEstimate: PaintCostEstimate                                        // Maliyet tahmini
  aiProvider: string                                                     // AI sağlayıcı
  model: string                                                          // AI model
  confidence: number                                                     // Güven seviyesi (0-100)
  analysisTimestamp: string                                              // Analiz zamanı (ISO)
}

/**
 * Boya Kalitesi Interface
 * 
 * Boyanın genel kalite metrikleri
 */
export interface PaintQuality {
  overallScore: number          // Genel puan (0-100)
  glossLevel: number            // Parlaklık seviyesi (0-100)
  smoothness: number            // Pürüzsüzlük (0-100)
  uniformity: number            // Tekdüzelik (0-100)
  adhesion: number              // Yapışma (0-100)
  durability: number            // Dayanıklılık (0-100)
  weatherResistance: number     // Hava koşullarına direnç (0-100)
  uvProtection: number          // UV koruma (0-100)
}

/**
 * Renk Analizi Interface
 * 
 * Boyanın renk özellikleri
 */
export interface ColorAnalysis {
  colorCode: string             // Renk kodu (örn: "1G3")
  colorName: string             // Renk adı (örn: "Gümüş Metalik")
  colorFamily: string           // Renk ailesi (örn: "Gümüş")
  metallic: boolean             // Metalik mi?
  pearl: boolean                // Perle mi?
  colorMatch: number            // Renk eşleşmesi (0-100)
  colorConsistency: number      // Renk tutarlılığı (0-100)
  colorDepth: number            // Renk derinliği (0-100)
  colorVibrance: number         // Renk canlılığı (0-100)
  colorFading: number           // Renk solması (0-100)
  colorShifting: number         // Renk kayması (0-100)
  originalColor: boolean        // Orijinal renk mi?
  repaintDetected: boolean      // Boya tespit edildi mi?
  colorHistory: string[]        // Renk geçmişi
}

/**
 * Yüzey Analizi Interface
 * 
 * Boya yüzeyi ve kalınlık ölçümleri
 */
export interface SurfaceAnalysis {
  paintThickness: number        // Boya kalınlığı (mikron)
  primerThickness: number       // Astar kalınlığı (mikron)
  baseCoatThickness: number     // Baz kat kalınlığı (mikron)
  clearCoatThickness: number    // Vernik kalınlığı (mikron)
  totalThickness: number        // Toplam kalınlık (mikron)
  thicknessUniformity: number   // Kalınlık tekdüzeliği (0-100)
  surfaceRoughness: number      // Yüzey pürüzlülüğü (0-100)
  orangePeel: number            // Portakal kabuğu efekti (0-100)
  runs: number                  // Akıntı (0-100)
  sags: number                  // Sarkma (0-100)
  dirt: number                  // Kirlilik (0-100)
  contamination: number         // Kontaminasyon (0-100)
  surfaceDefects: SurfaceDefect[] // Yüzey kusurları
}

/**
 * Yüzey Kusuru Interface
 * 
 * Tespit edilen yüzey kusurları
 */
export interface SurfaceDefect {
  type: 'orange_peel' | 'runs' | 'sags' | 'dirt' | 'contamination' | 'fish_eye' | 'crater' | 'blister' | 'crack' | 'peel'
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'      // Şiddet
  location: string                                                    // Konum
  size: number                                                        // Boyut (cm²)
  description: string                                                 // Açıklama
  repairable: boolean                                                 // Onarılabilir mi?
  repairCost: number                                                  // Onarım maliyeti (TL)
}

/**
 * Boya Hasarı Değerlendirmesi Interface
 * 
 * Tüm hasar türlerini içerir
 */
export interface PaintDamageAssessment {
  scratches: ScratchAnalysis[]        // Çizikler
  dents: DentAnalysis[]               // Göçükler
  rust: RustAnalysis[]                // Paslanma
  oxidation: OxidationAnalysis[]      // Oksidasyon
  fading: FadingAnalysis[]            // Solma
  chipping: ChippingAnalysis[]        // Sıyrıklar
  peeling: PeelingAnalysis[]          // Soyulma
  blistering: BlisteringAnalysis[]    // Kabarcıklanma
  cracking: CrackingAnalysis[]        // Çatlama
  totalDamageScore: number            // Toplam hasar puanı (0-100)
}

/**
 * Çizik Analizi Interface
 */
export interface ScratchAnalysis {
  id: string                                                          // Benzersiz ID
  depth: 'surface' | 'primer' | 'metal'                              // Çizik derinliği
  length: number                                                      // Uzunluk (cm)
  width: number                                                       // Genişlik (mm)
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'      // Şiddet
  location: string                                                    // Konum
  repairable: boolean                                                 // Onarılabilir mi?
  repairMethod: string                                                // Onarım yöntemi
  repairCost: number                                                  // Onarım maliyeti (TL)
  description: string                                                 // Açıklama
}

/**
 * Göçük Analizi Interface
 */
export interface DentAnalysis {
  id: string                                                          // Benzersiz ID
  depth: number                                                       // Derinlik (mm)
  diameter: number                                                    // Çap (cm)
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'      // Şiddet
  location: string                                                    // Konum
  repairable: boolean                                                 // Onarılabilir mi?
  repairMethod: string                                                // Onarım yöntemi
  repairCost: number                                                  // Onarım maliyeti (TL)
  description: string                                                 // Açıklama
}

/**
 * Pas Analizi Interface
 */
export interface RustAnalysis {
  id: string                                                          // Benzersiz ID
  type: 'surface' | 'penetrating' | 'structural'                     // Pas türü
  area: number                                                        // Alan (cm²)
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'      // Şiddet
  location: string                                                    // Konum
  spreading: boolean                                                  // Yayılıyor mu?
  repairable: boolean                                                 // Onarılabilir mi?
  repairMethod: string                                                // Onarım yöntemi
  repairCost: number                                                  // Onarım maliyeti (TL)
  description: string                                                 // Açıklama
}

/**
 * Oksidasyon Analizi Interface
 */
export interface OxidationAnalysis {
  id: string                                                          // Benzersiz ID
  type: 'chalking' | 'fading' | 'discoloration' | 'hazing'           // Oksidasyon türü
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'      // Şiddet
  location: string                                                    // Konum
  repairable: boolean                                                 // Onarılabilir mi?
  repairMethod: string                                                // Onarım yöntemi
  repairCost: number                                                  // Onarım maliyeti (TL)
  description: string                                                 // Açıklama
}

/**
 * Solma Analizi Interface
 */
export interface FadingAnalysis {
  id: string                                                          // Benzersiz ID
  type: 'uv_fading' | 'chemical_fading' | 'heat_fading'              // Solma türü
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'      // Şiddet
  location: string                                                    // Konum
  repairable: boolean                                                 // Onarılabilir mi?
  repairMethod: string                                                // Onarım yöntemi
  repairCost: number                                                  // Onarım maliyeti (TL)
  description: string                                                 // Açıklama
}

/**
 * Sıyrık Analizi Interface
 */
export interface ChippingAnalysis {
  id: string                                                          // Benzersiz ID
  size: number                                                        // Boyut (mm)
  count: number                                                       // Adet
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'      // Şiddet
  location: string                                                    // Konum
  repairable: boolean                                                 // Onarılabilir mi?
  repairMethod: string                                                // Onarım yöntemi
  repairCost: number                                                  // Onarım maliyeti (TL)
  description: string                                                 // Açıklama
}

/**
 * Soyulma Analizi Interface
 */
export interface PeelingAnalysis {
  id: string                                                          // Benzersiz ID
  area: number                                                        // Alan (cm²)
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'      // Şiddet
  location: string                                                    // Konum
  repairable: boolean                                                 // Onarılabilir mi?
  repairMethod: string                                                // Onarım yöntemi
  repairCost: number                                                  // Onarım maliyeti (TL)
  description: string                                                 // Açıklama
}

/**
 * Kabarcıklanma Analizi Interface
 */
export interface BlisteringAnalysis {
  id: string                                                          // Benzersiz ID
  size: number                                                        // Boyut (mm)
  count: number                                                       // Adet
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'      // Şiddet
  location: string                                                    // Konum
  repairable: boolean                                                 // Onarılabilir mi?
  repairMethod: string                                                // Onarım yöntemi
  repairCost: number                                                  // Onarım maliyeti (TL)
  description: string                                                 // Açıklama
}

/**
 * Çatlama Analizi Interface
 */
export interface CrackingAnalysis {
  id: string                                                          // Benzersiz ID
  length: number                                                      // Uzunluk (cm)
  width: number                                                       // Genişlik (mm)
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'      // Şiddet
  location: string                                                    // Konum
  repairable: boolean                                                 // Onarılabilir mi?
  repairMethod: string                                                // Onarım yöntemi
  repairCost: number                                                  // Onarım maliyeti (TL)
  description: string                                                 // Açıklama
}

/**
 * Teknik Detaylar Interface
 * 
 * Boya sistemi ve uygulama detayları
 */
export interface TechnicalDetails {
  paintSystem: string           // Boya sistemi (örn: "3 Katlı Sistem")
  primerType: string            // Astar türü
  baseCoat: string              // Baz kat
  clearCoat: string             // Vernik
  paintBrand: string            // Boya markası
  paintType: string             // Boya türü
  applicationMethod: string     // Uygulama yöntemi
  curingMethod: string          // Kurutma yöntemi
  paintAge: number              // Boya yaşı (yıl)
  lastRepaint: number           // Son boya (yıl)
  paintLayers: number           // Boya katman sayısı
  qualityGrade: 'OEM' | 'aftermarket' | 'unknown'  // Kalite sınıfı
}

/**
 * Boya Önerileri Interface
 * 
 * Bakım ve iyileştirme önerileri
 */
export interface PaintRecommendations {
  immediate: string[]           // Acil öneriler
  shortTerm: string[]           // Kısa vadeli öneriler
  longTerm: string[]            // Uzun vadeli öneriler
  maintenance: string[]         // Bakım önerileri
  protection: string[]          // Koruma önerileri
  restoration: string[]         // Restorasyon önerileri
  prevention: string[]          // Önleme önerileri
}

/**
 * Boya Maliyet Tahmini Interface
 * 
 * Detaylı maliyet kırılımı ve zaman çizelgesi
 */
export interface PaintCostEstimate {
  totalCost: number             // Toplam maliyet (TL)
  laborCost: number             // İşçilik maliyeti (TL)
  materialCost: number          // Malzeme maliyeti (TL)
  preparationCost: number       // Hazırlık maliyeti (TL)
  paintCost: number             // Boya maliyeti (TL)
  clearCoatCost: number         // Vernik maliyeti (TL)
  additionalCosts: number       // Ek maliyetler (TL)
  breakdown: {                  // Maliyet detayı
    category: string            // Kategori
    cost: number                // Maliyet (TL)
    description: string         // Açıklama
  }[]
  timeline: {                   // Zaman çizelgesi
    phase: string               // Faz
    duration: number            // Süre (saat)
    description: string         // Açıklama
  }[]
  warranty: {                   // Garanti
    covered: boolean            // Kapsam
    duration: string            // Süre
    conditions: string[]        // Koşullar
  }
}

// ===== SERVİS =====

/**
 * OpenAI Model Seçimi
 * 
 * Environment variable'dan model adı alınır, yoksa default kullanılır
 */
const OPENAI_MODEL = process.env.OPENAI_PAINT_MODEL ?? 'gpt-4o-mini'

/**
 * PaintAnalysisService Sınıfı
 * 
 * OpenAI Vision API ile boya analizi yapan servis
 */
export class PaintAnalysisService {
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
  private static cache = new Map<string, PaintAnalysisResult>()

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
        console.log('[AI] OpenAI Boya Analizi servisi hazırlandı')
      } else {
        console.error('[AI] OPENAI_API_KEY tanımlı değil!')
        throw new Error('OpenAI API key bulunamadı')
      }

      this.isInitialized = true
    } catch (error) {
      console.error('[AI] OpenAI Boya Analizi servisi başlatılırken hata:', error)
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
   * Görseli Base64'e çevirir ve optimize eder
   * 
   * Sharp ile görseli optimize eder:
   * - 1024x1024 max boyut
   * - JPEG format
   * - %95 kalite
   * 
   * @param imagePath - Görsel dosya path'i veya base64 data URL
   * @returns Base64 encoded görsel
   * 
   * @private
   */
  private static async convertImageToBase64(imagePath: string): Promise<string> {
    if (imagePath.startsWith('data:')) {
      return imagePath.split(',')[1]
    }

    const buffer = await fs.readFile(imagePath)
    const optimized = await sharp(buffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 95 })
      .toBuffer()

    return optimized.toString('base64')
  }

  /**
   * Görsel hash'ini hesaplar (cache key için)
   * 
   * MD5 hash kullanır
   * 
   * @param imagePath - Görsel dosya path'i veya base64 data URL
   * @returns MD5 hash veya timestamp (fallback)
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
      console.warn('[AI] Görsel hash hesaplanamadı', error)
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`
    }
  }

  /**
   * OpenAI için Türkçe prompt oluşturur
   * 
   * ÇOK DETAYLI prompt ile AI'ya boya uzmanı rolü verilir:
   * - 25+ yıllık deneyimli boya uzmanı
   * - Mikron seviyesinde analiz
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

Bu araç bilgilerini göz önünde bulundurarak analiz yap.` : ''

    return `Sen dünyaca ünlü bir otomotiv boya uzmanısın. 25+ yıllık deneyimin var. Araç boyasını MİKRON SEVİYESİNDE analiz edebiliyorsun.

🎯 ÖNEMLİ: RAPOR TAMAMEN TÜRKÇE OLMALI - HİÇBİR İNGİLİZCE KELİME YOK!

🎨 PROFESYONEL BOYA ANALİZİ RAPORU

${vehicleContext}

📋 ANALİZ KURALLARI:
1. Fotoğraftaki boyayı ÇOKDETAYLI incele
2. Her detayı Türkçe açıkla
3. Mikron seviyesinde ölçümler yap
4. Renk kodunu tespit et
5. SADECE BOYA KALİTESİ ve YÜZEY ANALİZİ yap (hasar tespiti değil!)
6. Gerçekçi maliyet hesapla (Türkiye 2025 fiyatları)

💰 MALİYET HESAPLAMA (Türkiye 2025):
- Tam boya: 25.000-45.000 TL
- Lokal boya: 3.000-8.000 TL
- Çizik giderme: 800-2.000 TL
- Parlatma: 1.500-3.000 TL
- Seramik kaplama: 8.000-15.000 TL
- Boya koruma filmi: 12.000-25.000 TL

🔍 ÇIKTI FORMATI (Sadece geçerli JSON, TAMAMEN TÜRKÇE):
{
  "paintCondition": "good",
  "paintQuality": {
    "overallScore": 85,
    "glossLevel": 80,
    "smoothness": 75,
    "uniformity": 90,
    "adhesion": 95,
    "durability": 80,
    "weatherResistance": 85,
    "uvProtection": 75
  },
  "colorAnalysis": {
    "colorCode": "1G3",
    "colorName": "Gümüş Metalik",
    "colorFamily": "Gümüş",
    "metallic": true,
    "pearl": false,
    "colorMatch": 95,
    "colorConsistency": 90,
    "colorDepth": 85,
    "colorVibrance": 80,
    "colorFading": 15,
    "colorShifting": 5,
    "originalColor": true,
    "repaintDetected": false,
    "colorHistory": ["Orijinal fabrika boyası"]
  },
  "surfaceAnalysis": {
    "paintThickness": 127,
    "primerThickness": 28,
    "baseCoatThickness": 48,
    "clearCoatThickness": 51,
    "totalThickness": 127,
    "thicknessUniformity": 85,
    "surfaceRoughness": 20,
    "orangePeel": 15,
    "runs": 5,
    "sags": 3,
    "dirt": 10,
    "contamination": 8,
    "surfaceDefects": [
      {
        "type": "orange_peel",
        "severity": "low",
        "location": "Ön kaput merkez bölgesi",
        "size": 2,
        "description": "Hafif portakal kabuğu efekti tespit edildi. Fabrika çıkışı standartlarında. Görsel etki minimal.",
        "repairable": true,
        "repairCost": 800
      }
    ]
  },
  "paintDefects": {
    "surfaceDefects": [
      {
        "id": "yuzey-001",
        "type": "orange_peel",
        "severity": "low",
        "location": "Ön kaput merkez bölgesi",
        "size": 2,
        "description": "Hafif portakal kabuğu efekti tespit edildi. Fabrika çıkışı standartlarında. Görsel etki minimal.",
        "repairable": true,
        "repairCost": 800
      }
    ],
    "colorIssues": [],
    "glossProblems": [],
    "thicknessVariations": [],
    "totalDefectScore": 5
  },
  "technicalDetails": {
    "paintSystem": "3 Katlı Sistem (Astar + Baz + Vernik)",
    "primerType": "Epoksi Astar",
    "baseCoat": "Metalik Baz Kat",
    "clearCoat": "UV Korumalı Vernik",
    "paintBrand": "OEM Fabrika Boyası",
    "paintType": "Akrilik Poliüretan",
    "applicationMethod": "Elektrostatik Püskürtme",
    "curingMethod": "Fırın Kurutma 80°C",
    "paintAge": 3,
    "lastRepaint": 0,
    "paintLayers": 3,
    "qualityGrade": "OEM"
  },
  "recommendations": {
    "immediate": [
      "Portakal kabuğu efekti hafif parlatma ile giderilebilir"
    ],
    "shortTerm": [
      "Seramik kaplama uygulanmalı",
      "Düzenli yıkama programı başlatılmalı",
      "Boya koruyucu film değerlendirilmeli"
    ],
    "longTerm": [
      "Yılda 2 kez detaylı temizlik ve parlatma",
      "UV koruma yenilenmeli",
      "Boya kalınlığı takibi yapılmalı"
    ],
    "maintenance": [
      "Haftada 1 kez yıkama",
      "Ayda 1 kez balmumu uygulaması",
      "3 ayda 1 detaylı temizlik",
      "Yılda 1 profesyonel parlatma"
    ],
    "protection": [
      "Seramik kaplama önerilir",
      "Boya koruma filmi değerlendirilebilir",
      "UV koruyucu uygulama şart",
      "Çevresel faktörlere karşı önlem"
    ],
    "qualityImprovement": [
      "Yüzey pürüzlülüğü azaltılmalı",
      "Gloss seviyesi artırılabilir",
      "Renk derinliği geliştirilebilir"
    ],
    "prevention": [
      "Düzenli bakım programı oluştur",
      "Kapalı park kullan",
      "Ağaç reçinesi ve kuş pisliğinden koru",
      "Kimyasal maddelerden uzak tut"
    ]
  },
  "costEstimate": {
    "totalCost": 2450,
    "laborCost": 1200,
    "materialCost": 800,
    "preparationCost": 250,
    "paintCost": 150,
    "clearCoatCost": 50,
    "additionalCosts": 0,
    "breakdown": [
      {
        "category": "Yüzey Düzeltme",
        "cost": 800,
        "description": "Portakal kabuğu efekti giderme ve parlatma"
      },
      {
        "category": "Gloss İyileştirme",
        "cost": 650,
        "description": "Profesyonel parlatma ve gloss artırma"
      },
      {
        "category": "Koruyucu Uygulama",
        "cost": 1200,
        "description": "Seramik kaplama uygulaması"
      }
    ],
    "timeline": [
      {
        "phase": "Hazırlık ve Temizlik",
        "duration": 2,
        "description": "Detaylı yıkama ve yüzey hazırlığı"
      },
      {
        "phase": "Yüzey Düzeltme",
        "duration": 3,
        "description": "Portakal kabuğu efekti giderme ve düzeltme"
      },
      {
        "phase": "Parlatma",
        "duration": 4,
        "description": "Profesyonel parlatma ve düzeltme"
      },
      {
        "phase": "Koruyucu Uygulama",
        "duration": 6,
        "description": "Seramik kaplama uygulaması ve kurutma"
      },
      {
        "phase": "Kalite Kontrol",
        "duration": 1,
        "description": "Detaylı kontrol ve teslim"
      }
    ],
    "warranty": {
      "covered": true,
      "duration": "2 yıl veya 40.000 km",
      "conditions": [
        "Yetkili serviste yapılmalı",
        "Orijinal malzeme kullanılmalı",
        "Düzenli bakım takibi yapılmalı",
        "Garanti belgesi saklanmalı"
      ]
    }
  },
  "aiProvider": "OpenAI",
  "model": "OpenAI",
  "confidence": 95,
  "analysisTimestamp": "${new Date().toISOString()}"
}

⚠️ KRİTİK KURALLAR:
- RAPOR TAMAMEN TÜRKÇE - HİÇBİR İNGİLİZCE YOK!
- SADECE BOYA KALİTESİ ANALİZİ - Hasar tespiti yapma!
- Her ölçüm gerçekçi olmalı (mikron cinsinden)
- Maliyet Türkiye 2025 fiyatları
- Detaylı Türkçe açıklamalar (minimum 2 cümle)
- Sadece geçerli JSON döndür
- Tüm field'lar Türkçe değerler içermeli
- Boya kalınlığı, gloss, renk eşleşmesi, yüzey kalitesi odaklı analiz yap`
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
   * OpenAI Vision API ile boya analizi yapar
   * 
   * İşlem akışı:
   * 1. Görseli base64'e çevir ve optimize et
   * 2. Prompt oluştur
   * 3. OpenAI Vision API çağrısı yap
   * 4. Yanıtı parse et
   * 5. JSON'u extract et
   * 
   * @param imagePath - Görsel dosya path'i
   * @param vehicleInfo - Araç bilgileri
   * @returns Boya analizi sonucu
   * @throws Error - API hatası
   * 
   * @private
   */
  private static async analyzePaintWithOpenAI(imagePath: string, vehicleInfo?: any): Promise<PaintAnalysisResult> {
    if (!this.openaiClient) {
      throw new Error('OpenAI istemcisi kullanılabilir değil')
    }

    // Görseli base64'e çevir
    const imageBase64 = await this.convertImageToBase64(imagePath)
    const prompt = `${this.buildPrompt(vehicleInfo)}\nLütfen tüm sayısal değerleri sayı olarak döndür.`

    // OpenAI Vision API çağrısı
    const response = await this.openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.1, // Düşük temperature = tutarlı sonuçlar
      messages: [
        {
          role: 'system',
          content: 'Sen deneyimli bir otomotiv boya uzmanısın. Çıktıyı geçerli JSON olarak üret. Tüm metinler Türkçe olmalı.'
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

    // Yanıtı al
    const text = response.choices?.[0]?.message?.content
    if (!text) {
      throw new Error('OpenAI yanıtı boş geldi')
    }

    // JSON'u parse et
    const parsed = this.extractJsonPayload(text)
    return parsed as PaintAnalysisResult
  }

  /**
   * Boya Analizi - Public API
   * 
   * Cache kontrolü yapar, yoksa OpenAI ile analiz eder.
   * 
   * İşlem akışı:
   * 1. Initialize kontrolü
   * 2. Image hash hesapla (cache key)
   * 3. Cache kontrolü (varsa döndür)
   * 4. OpenAI Vision analizi yap
   * 5. Sonucu cache'e kaydet
   * 6. Sonucu döndür
   * 
   * @param imagePath - Görsel dosya path'i
   * @param vehicleInfo - Araç bilgileri (opsiyonel)
   * @returns Boya analizi sonucu
   * @throws Error - API hatası
   * 
   * @example
   * const result = await PaintAnalysisService.analyzePaint(
   *   './car-paint.jpg',
   *   { make: 'Toyota', model: 'Corolla', year: 2020 }
   * );
   * console.log(result.paintCondition); // 'good'
   * console.log(result.paintQuality.overallScore); // 85
   */
  static async analyzePaint(imagePath: string, vehicleInfo?: any): Promise<PaintAnalysisResult> {
    await this.initialize()

    // Cache kontrolü
    const cacheKey = await this.getImageHash(imagePath)
    const cached = this.cache.get(cacheKey)
    if (cached) {
      console.log('[AI] Boya analizi cache üzerinden döndürüldü')
      return cached
    }

    try {
      console.log('[AI] OpenAI ile boya analizi başlatılıyor...')
      
      // OpenAI analizi
      const result = await this.analyzePaintWithOpenAI(imagePath, vehicleInfo)
      
      console.log('[AI] OpenAI boya analizi başarılı!')
      
      // Cache'e kaydet
      this.cache.set(cacheKey, result)
      return result
    } catch (error) {
      console.error('[AI] OpenAI boya analizi HATASI:', error)
      throw new Error('OpenAI boya analizi başarısız oldu.')
    }
  }
}
