import OpenAI from 'openai'
import sharp from 'sharp'
import fs from 'fs/promises'
import crypto from 'crypto'

// --- Tip Tanımları ---------------------------------------------------------

export interface PaintAnalysisResult {
  paintCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  paintQuality: PaintQuality
  colorAnalysis: ColorAnalysis
  surfaceAnalysis: SurfaceAnalysis
  damageAssessment: PaintDamageAssessment
  technicalDetails: TechnicalDetails
  recommendations: PaintRecommendations
  costEstimate: PaintCostEstimate
  aiProvider: string
  model: string
  confidence: number
  analysisTimestamp: string
}

export interface PaintQuality {
  overallScore: number
  glossLevel: number
  smoothness: number
  uniformity: number
  adhesion: number
  durability: number
  weatherResistance: number
  uvProtection: number
}

export interface ColorAnalysis {
  colorCode: string
  colorName: string
  colorFamily: string
  metallic: boolean
  pearl: boolean
  colorMatch: number
  colorConsistency: number
  colorDepth: number
  colorVibrance: number
  colorFading: number
  colorShifting: number
  originalColor: boolean
  repaintDetected: boolean
  colorHistory: string[]
}

export interface SurfaceAnalysis {
  paintThickness: number
  primerThickness: number
  baseCoatThickness: number
  clearCoatThickness: number
  totalThickness: number
  thicknessUniformity: number
  surfaceRoughness: number
  orangePeel: number
  runs: number
  sags: number
  dirt: number
  contamination: number
  surfaceDefects: SurfaceDefect[]
}

export interface SurfaceDefect {
  type: 'orange_peel' | 'runs' | 'sags' | 'dirt' | 'contamination' | 'fish_eye' | 'crater' | 'blister' | 'crack' | 'peel'
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  location: string
  size: number
  description: string
  repairable: boolean
  repairCost: number
}

export interface PaintDamageAssessment {
  scratches: ScratchAnalysis[]
  dents: DentAnalysis[]
  rust: RustAnalysis[]
  oxidation: OxidationAnalysis[]
  fading: FadingAnalysis[]
  chipping: ChippingAnalysis[]
  peeling: PeelingAnalysis[]
  blistering: BlisteringAnalysis[]
  cracking: CrackingAnalysis[]
  totalDamageScore: number
}

export interface ScratchAnalysis {
  id: string
  depth: 'surface' | 'primer' | 'metal'
  length: number
  width: number
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  location: string
  repairable: boolean
  repairMethod: string
  repairCost: number
  description: string
}

export interface DentAnalysis {
  id: string
  depth: number
  diameter: number
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  location: string
  repairable: boolean
  repairMethod: string
  repairCost: number
  description: string
}

export interface RustAnalysis {
  id: string
  type: 'surface' | 'penetrating' | 'structural'
  area: number
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  location: string
  spreading: boolean
  repairable: boolean
  repairMethod: string
  repairCost: number
  description: string
}

export interface OxidationAnalysis {
  id: string
  type: 'chalking' | 'fading' | 'discoloration' | 'hazing'
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  location: string
  repairable: boolean
  repairMethod: string
  repairCost: number
  description: string
}

export interface FadingAnalysis {
  id: string
  type: 'uv_fading' | 'chemical_fading' | 'heat_fading'
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  location: string
  repairable: boolean
  repairMethod: string
  repairCost: number
  description: string
}

export interface ChippingAnalysis {
  id: string
  size: number
  count: number
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  location: string
  repairable: boolean
  repairMethod: string
  repairCost: number
  description: string
}

export interface PeelingAnalysis {
  id: string
  area: number
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  location: string
  repairable: boolean
  repairMethod: string
  repairCost: number
  description: string
}

export interface BlisteringAnalysis {
  id: string
  size: number
  count: number
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  location: string
  repairable: boolean
  repairMethod: string
  repairCost: number
  description: string
}

export interface CrackingAnalysis {
  id: string
  length: number
  width: number
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  location: string
  repairable: boolean
  repairMethod: string
  repairCost: number
  description: string
}

export interface TechnicalDetails {
  paintSystem: string
  primerType: string
  baseCoat: string
  clearCoat: string
  paintBrand: string
  paintType: string
  applicationMethod: string
  curingMethod: string
  paintAge: number
  lastRepaint: number
  paintLayers: number
  qualityGrade: 'OEM' | 'aftermarket' | 'unknown'
}

export interface PaintRecommendations {
  immediate: string[]
  shortTerm: string[]
  longTerm: string[]
  maintenance: string[]
  protection: string[]
  restoration: string[]
  prevention: string[]
}

export interface PaintCostEstimate {
  totalCost: number
  laborCost: number
  materialCost: number
  preparationCost: number
  paintCost: number
  clearCoatCost: number
  additionalCosts: number
  breakdown: {
    category: string
    cost: number
    description: string
  }[]
  timeline: {
    phase: string
    duration: number
    description: string
  }[]
  warranty: {
    covered: boolean
    duration: string
    conditions: string[]
  }
}

// --- Servis ----------------------------------------------------------------

const OPENAI_MODEL = process.env.OPENAI_PAINT_MODEL ?? 'gpt-4o-mini'

export class PaintAnalysisService {
  private static openaiClient: OpenAI | null = null
  private static isInitialized = false
  private static cache = new Map<string, PaintAnalysisResult>()

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

  static clearCache(): void {
    this.cache.clear()
  }

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

  private static buildPrompt(): string {
    return `Sen dünyaca ünlü bir otomotiv boya uzmanısın. 25+ yıllık deneyimin var. Araç boyasını MİKRON SEVİYESİNDE analiz edebiliyorsun.

🎯 ÖNEMLİ: RAPOR TAMAMEN TÜRKÇE OLMALI - HİÇBİR İNGİLİZCE KELİME YOK!

🎨 ULTRA DETAYLI BOYA ANALİZİ

📋 ANALİZ KURALLARI:
1. Fotoğraftaki boyayı ÇOKDETAYLI incele
2. Her detayı Türkçe açıkla
3. Mikron seviyesinde ölçümler yap
4. Renk kodunu tespit et
5. Tüm kusurları belirt
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
  "damageAssessment": {
    "scratches": [
      {
        "id": "cizik-001",
        "depth": "surface",
        "length": 15,
        "width": 0.5,
        "severity": "low",
        "location": "Ön tampon sağ alt köşe",
        "repairable": true,
        "repairMethod": "Profesyonel retuş ve parlatma",
        "repairCost": 450,
        "description": "Yüzeysel çizik, clear kat seviyesinde. Metal yapıya ulaşmamış. Retuş ile giderilebilir."
      }
    ],
    "dents": [],
    "rust": [],
    "oxidation": [],
    "fading": [],
    "chipping": [],
    "peeling": [],
    "blistering": [],
    "cracking": [],
    "totalDamageScore": 15
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
      "Ön tampondaki çizik profesyonel retuş ile giderilmeli"
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
    "restoration": [
      "Portakal kabuğu efekti hafif parlatma ile giderilebilir",
      "Yüzey pürüzlülüğü azaltılmalı",
      "Çizikler retuş edilmeli"
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
        "category": "Çizik Retuşu",
        "cost": 450,
        "description": "Ön tampon çizik profesyonel retuş"
      },
      {
        "category": "Yüzey Düzeltme",
        "cost": 800,
        "description": "Portakal kabuğu efekti giderme ve parlatma"
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
        "phase": "Retuş İşlemi",
        "duration": 3,
        "description": "Çizik retuşu ve düzeltme"
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
- Her ölçüm gerçekçi olmalı (mikron cinsinden)
- Maliyet Türkiye 2025 fiyatları
- Detaylı Türkçe açıklamalar (minimum 2 cümle)
- Sadece geçerli JSON döndür
- Tüm field'lar Türkçe değerler içermeli`
  }

  private static extractJsonPayload(rawText: string): any {
    const start = rawText.indexOf('{')
    const end = rawText.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) {
      throw new Error('AI yanıtından JSON verisi alınamadı')
    }
    const json = rawText.slice(start, end + 1)
    return JSON.parse(json)
  }

  private static async analyzePaintWithOpenAI(imagePath: string): Promise<PaintAnalysisResult> {
    if (!this.openaiClient) {
      throw new Error('OpenAI istemcisi kullanılabilir değil')
    }

    const imageBase64 = await this.convertImageToBase64(imagePath)
    const prompt = `${this.buildPrompt()}\nLütfen tüm sayısal değerleri sayı olarak döndür.`

    const response = await this.openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.1,
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

    const text = response.choices?.[0]?.message?.content
    if (!text) {
      throw new Error('OpenAI yanıtı boş geldi')
    }

    const parsed = this.extractJsonPayload(text)
    return parsed as PaintAnalysisResult
  }

  static async analyzePaint(imagePath: string): Promise<PaintAnalysisResult> {
    await this.initialize()

    const cacheKey = await this.getImageHash(imagePath)
    const cached = this.cache.get(cacheKey)
    if (cached) {
      console.log('[AI] Boya analizi cache üzerinden döndürüldü')
      return cached
    }

    try {
      console.log('[AI] OpenAI ile boya analizi başlatılıyor...')
      const result = await this.analyzePaintWithOpenAI(imagePath)
      console.log('[AI] OpenAI boya analizi başarılı!')
      
      this.cache.set(cacheKey, result)
      return result
    } catch (error) {
      console.error('[AI] OpenAI boya analizi HATASI:', error)
      throw new Error('OpenAI boya analizi başarısız oldu.')
    }
  }
}
