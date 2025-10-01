import OpenAI from 'openai'
import { DamageDetectionService, DamageDetectionResult } from './damageDetectionService'
import { PaintAnalysisService, PaintAnalysisResult } from './paintAnalysisService'
import { AudioAnalysisService, AudioAnalysisResult } from './audioAnalysisService'
import { ValueEstimationService, ValueEstimationResult } from './valueEstimationService'

// --- Tip Tanımları ---------------------------------------------------------

export interface ComprehensiveExpertiseResult {
  overallScore: number
  expertiseGrade: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  damageAnalysis: DamageDetectionResult | null
  paintAnalysis: PaintAnalysisResult | null
  audioAnalysis: AudioAnalysisResult | null
  valueEstimation: ValueEstimationResult | null
  comprehensiveSummary: ComprehensiveSummary
  expertOpinion: ExpertOpinion
  finalRecommendations: FinalRecommendations
  investmentDecision: InvestmentDecision
  aiProvider: string
  model: string
  confidence: number
  analysisTimestamp: string
}

export interface ComprehensiveSummary {
  vehicleOverview: string
  keyFindings: string[]
  criticalIssues: string[]
  strengths: string[]
  weaknesses: string[]
  overallCondition: string
  marketPosition: string
  investmentPotential: string
}

export interface ExpertOpinion {
  recommendation: 'strongly_buy' | 'buy' | 'neutral' | 'avoid' | 'strongly_avoid'
  reasoning: string[]
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'very_high'
    factors: string[]
  }
  opportunityAssessment: {
    level: 'excellent' | 'good' | 'fair' | 'poor'
    factors: string[]
  }
  expertNotes: string[]
}

export interface FinalRecommendations {
  immediate: Array<{ priority: string; action: string; cost: number; benefit: string }>
  shortTerm: Array<{ priority: string; action: string; cost: number; benefit: string }>
  longTerm: Array<{ priority: string; action: string; cost: number; benefit: string }>
  maintenance: Array<{ frequency: string; action: string; cost: number }>
}

export interface InvestmentDecision {
  decision: 'excellent_investment' | 'good_investment' | 'fair_investment' | 'poor_investment' | 'avoid'
  expectedReturn: number
  paybackPeriod: string
  riskLevel: 'low' | 'medium' | 'high'
  liquidityScore: number
  marketTiming: string
  financialSummary: {
    purchasePrice: number
    immediateRepairs: number
    monthlyMaintenance: number
    estimatedResaleValue: number
    totalInvestment: number
    expectedProfit: number
    roi: number
  }
}

// --- Servis ----------------------------------------------------------------

const OPENAI_MODEL = process.env.OPENAI_COMPREHENSIVE_MODEL ?? 'gpt-4o'

export class ComprehensiveExpertiseService {
  private static openaiClient: OpenAI | null = null
  private static isInitialized = false

  static async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      const openaiApiKey = process.env.OPENAI_API_KEY
      if (openaiApiKey) {
        this.openaiClient = new OpenAI({ apiKey: openaiApiKey })
        console.log('[AI] OpenAI Tam Expertiz servisi hazırlandı')
      } else {
        throw new Error('OpenAI API key bulunamadı')
      }
      this.isInitialized = true
    } catch (error) {
      console.error('[AI] OpenAI Tam Expertiz servisi başlatılırken hata:', error)
      throw error
    }
  }

  private static buildPrompt(analyses: {
    damage?: DamageDetectionResult
    paint?: PaintAnalysisResult
    audio?: AudioAnalysisResult
    value?: ValueEstimationResult
  }): string {
    return `Sen dünyaca ünlü bir otomotiv eksperisin. 30+ yıllık deneyimin var. Tüm analiz sonuçlarını birleştirip KAPSAMLI bir expertiz raporu hazırlayabiliyorsun.

🎯 ÖNEMLİ: RAPOR TAMAMEN TÜRKÇE OLMALI - HİÇBİR İNGİLİZCE KELİME YOK!

📋 KAPSAMLI EKSPERTİZ RAPORU

ANALİZ SONUÇLARI:

${analyses.damage ? `
🔧 HASAR ANALİZİ:
- Genel Skor: ${analyses.damage.overallAssessment.totalRepairCost} TL
- Hasar Sayısı: ${analyses.damage.damageAreas.length}
- Kritik Hasarlar: ${analyses.damage.damageAreas.filter(d => d.severity === 'high' || d.severity === 'critical').length}
` : ''}

${analyses.paint ? `
🎨 BOYA ANALİZİ:
- Boya Kalitesi: ${analyses.paint.paintQuality.overallScore}/100
- Boya Durumu: ${analyses.paint.paintCondition}
- Renk: ${analyses.paint.colorAnalysis.colorName}
` : ''}

${analyses.audio ? `
🔊 MOTOR SES ANALİZİ:
- Motor Sağlığı: ${analyses.audio.engineHealth}
- Genel Skor: ${analyses.audio.overallScore}/100
- Tespit Edilen Sorunlar: ${analyses.audio.detectedIssues.length}
` : ''}

${analyses.value ? `
💰 DEĞER TAHMİNİ:
- Tahmini Değer: ${analyses.value.estimatedValue} TL
- Piyasa Durumu: ${analyses.value.marketAnalysis.marketTrend}
- Yatırım Notu: ${analyses.value.investmentAnalysis.investmentGrade}
` : ''}

🔍 ÇIKTI FORMATI (Sadece geçerli JSON, TAMAMEN TÜRKÇE):
{
  "overallScore": 82,
  "expertiseGrade": "good",
  "comprehensiveSummary": {
    "vehicleOverview": "2019 model araç, genel durumu iyi. Düzenli bakım yapılmış, hasar geçmişi temiz. Motor sağlıklı çalışıyor, boya kalitesi fabrika standartlarında.",
    "keyFindings": [
      "Araç genel olarak iyi durumda ve bakımlı",
      "Motor sağlıklı çalışıyor, ciddi sorun yok",
      "Boya orijinal ve kaliteli",
      "Piyasa değeri ortalamanın üzerinde"
    ],
    "criticalIssues": [
      "Ön tampondaki çizik giderilmeli",
      "Motor takozları kontrol edilmeli"
    ],
    "strengths": [
      "Düzenli bakım geçmişi",
      "Orijinal boya",
      "Motor sağlıklı",
      "Hasar kaydı yok",
      "Düşük kilometre"
    ],
    "weaknesses": [
      "Küçük kozmetik hasarlar var",
      "Motor takozlarında hafif aşınma",
      "Bazı bakımlar yaklaşıyor"
    ],
    "overallCondition": "Araç genel olarak çok iyi durumda. Küçük kozmetik hasarlar dışında ciddi sorun yok. Düzenli bakım yapılmış, motor sağlıklı çalışıyor.",
    "marketPosition": "Piyasa ortalamasının %8-10 üzerinde değere sahip. Benzer araçlara göre daha iyi durumda.",
    "investmentPotential": "İyi bir yatırım fırsatı. Değer kaybı yavaş, likidite yüksek, bakım maliyetleri düşük."
  },
  "expertOpinion": {
    "recommendation": "buy",
    "reasoning": [
      "Araç genel durumu çok iyi",
      "Düzenli bakım yapılmış",
      "Motor ve mekanik aksamlar sağlıklı",
      "Piyasa değeri uygun",
      "Yatırım potansiyeli var"
    ],
    "riskAssessment": {
      "level": "low",
      "factors": [
        "Hasar geçmişi temiz",
        "Motor sağlıklı",
        "Bakım düzenli yapılmış",
        "Orijinal parçalar kullanılmış"
      ]
    },
    "opportunityAssessment": {
      "level": "good",
      "factors": [
        "Piyasa değeri uygun",
        "Kolay satılabilir",
        "Değer kaybı yavaş",
        "Bakım maliyetleri düşük"
      ]
    },
    "expertNotes": [
      "Küçük kozmetik hasarlar giderilirse değer artışı sağlanır",
      "Bahar aylarında satış için ideal",
      "Düzenli bakıma devam edilmeli"
    ]
  },
  "finalRecommendations": {
    "immediate": [
      {
        "priority": "Yüksek",
        "action": "Ön tampon çizik retuşu",
        "cost": 450,
        "benefit": "Görsel iyileştirme, değer artışı"
      },
      {
        "priority": "Orta",
        "action": "Motor takozları kontrolü",
        "cost": 200,
        "benefit": "Titreşim azalması, konfor artışı"
      }
    ],
    "shortTerm": [
      {
        "priority": "Orta",
        "action": "Detaylı iç-dış temizlik",
        "cost": 2000,
        "benefit": "Değer artışı 8.000 TL"
      },
      {
        "priority": "Orta",
        "action": "Seramik kaplama",
        "cost": 8000,
        "benefit": "Boya koruması, değer artışı"
      }
    ],
    "longTerm": [
      {
        "priority": "Normal",
        "action": "Triger kayışı değişimi (80.000 km'de)",
        "cost": 4500,
        "benefit": "Motor ömrü uzatma"
      }
    ],
    "maintenance": [
      {
        "frequency": "Her 10.000 km",
        "action": "Motor yağı ve filtre değişimi",
        "cost": 1200
      },
      {
        "frequency": "Her 20.000 km",
        "action": "Hava filtresi değişimi",
        "cost": 350
      },
      {
        "frequency": "Yılda 2 kez",
        "action": "Detaylı kontrol ve bakım",
        "cost": 1500
      }
    ]
  },
  "investmentDecision": {
    "decision": "good_investment",
    "expectedReturn": 8,
    "paybackPeriod": "1-2 yıl",
    "riskLevel": "low",
    "liquidityScore": 85,
    "marketTiming": "Şu an alım için uygun. Bahar aylarında satış için ideal.",
    "financialSummary": {
      "purchasePrice": 485000,
      "immediateRepairs": 2650,
      "monthlyMaintenance": 500,
      "estimatedResaleValue": 520000,
      "totalInvestment": 499650,
      "expectedProfit": 20350,
      "roi": 4.1
    }
  },
  "aiProvider": "OpenAI",
  "model": "OpenAI",
  "confidence": 95,
  "analysisTimestamp": "${new Date().toISOString()}"
}

⚠️ KRİTİK KURALLAR:
- RAPOR TAMAMEN TÜRKÇE - HİÇBİR İNGİLİZCE YOK!
- Tüm analizleri birleştir ve kapsamlı değerlendir
- Uzman görüşü sun
- Yatırım kararı ver
- Detaylı Türkçe açıklamalar
- Sadece geçerli JSON döndür`
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

  static async generateComprehensiveReport(
    vehicleInfo: any,
    imagePaths?: string[],
    audioPath?: string
  ): Promise<ComprehensiveExpertiseResult> {
    await this.initialize()

    console.log('[AI] Kapsamlı expertiz raporu oluşturuluyor...')

    // Tüm analizleri paralel olarak çalıştır
    const analyses: {
      damage?: DamageDetectionResult
      paint?: PaintAnalysisResult
      audio?: AudioAnalysisResult
      value?: ValueEstimationResult
    } = {}

    try {
      // Hasar analizi
      if (imagePaths && imagePaths.length > 0) {
        console.log('[AI] Hasar analizi yapılıyor...')
        analyses.damage = await DamageDetectionService.detectDamage(imagePaths[0])
      }

      // Boya analizi
      if (imagePaths && imagePaths.length > 0) {
        console.log('[AI] Boya analizi yapılıyor...')
        analyses.paint = await PaintAnalysisService.analyzePaint(imagePaths[0])
      }

      // Motor ses analizi
      if (audioPath) {
        console.log('[AI] Motor ses analizi yapılıyor...')
        analyses.audio = await AudioAnalysisService.analyzeEngineSound(audioPath, vehicleInfo)
      }

      // Değer tahmini
      console.log('[AI] Değer tahmini yapılıyor...')
      analyses.value = await ValueEstimationService.estimateValue(vehicleInfo)

      // Kapsamlı rapor oluştur
      console.log('[AI] Kapsamlı rapor birleştiriliyor...')
      const prompt = `${this.buildPrompt(analyses)}\nLütfen tüm sayısal değerleri sayı olarak döndür.`

      const response = await this.openaiClient!.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: 'Sen deneyimli bir otomotiv eksperisin. Çıktıyı geçerli JSON olarak üret. Tüm metinler Türkçe olmalı.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const text = response.choices?.[0]?.message?.content
      if (!text) {
        throw new Error('OpenAI yanıtı boş geldi')
      }

      const comprehensiveData = this.extractJsonPayload(text)

      const result: ComprehensiveExpertiseResult = {
        ...comprehensiveData,
        damageAnalysis: analyses.damage || null,
        paintAnalysis: analyses.paint || null,
        audioAnalysis: analyses.audio || null,
        valueEstimation: analyses.value || null
      }

      console.log('[AI] Kapsamlı expertiz raporu başarıyla oluşturuldu!')
      return result

    } catch (error) {
      console.error('[AI] Kapsamlı expertiz raporu HATASI:', error)
      throw new Error('Kapsamlı expertiz raporu oluşturulamadı.')
    }
  }
}
