import OpenAI from 'openai'
import crypto from 'crypto'
import sharp from 'sharp'
import fs from 'fs/promises'
import { DamageDetectionService, DamageDetectionResult } from './damageDetectionService'

// --- Tip Tanımları ---------------------------------------------------------

export interface ValueEstimationResult {
  estimatedValue: number
  marketAnalysis: any
  vehicleCondition: any
  priceBreakdown: any
  marketPosition: any
  investmentAnalysis: any
  recommendations: any
  comparableVehicles: any[]
  aiProvider: string
  model: string
  confidence: number
  analysisTimestamp: string
}

// --- Servis ----------------------------------------------------------------

const OPENAI_MODEL = process.env.OPENAI_VALUE_MODEL ?? 'gpt-4o'

export class ValueEstimationService {
  private static openaiClient: OpenAI | null = null
  private static isInitialized = false
  private static cache = new Map<string, ValueEstimationResult>()

  static async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      const openaiApiKey = process.env.OPENAI_API_KEY
      if (openaiApiKey) {
        this.openaiClient = new OpenAI({ apiKey: openaiApiKey })
        console.log('[AI] OpenAI Değer Tahmini servisi hazırlandı')
      } else {
        throw new Error('OpenAI API key bulunamadı')
      }
      this.isInitialized = true
    } catch (error) {
      console.error('[AI] OpenAI Değer Tahmini servisi başlatılırken hata:', error)
      throw error
    }
  }

  static clearCache(): void {
    this.cache.clear()
  }

  private static async convertImageToBase64(imagePath: string): Promise<string> {
    if (imagePath.startsWith('data:image')) {
      return imagePath.split(',')[1]
    }
    const buffer = await fs.readFile(imagePath)
    return buffer.toString('base64')
  }

  private static buildPrompt(vehicleInfo: any, hasImages: boolean, damageInfo?: DamageDetectionResult): string {
    const currentYear = new Date().getFullYear()
    const vehicleAge = currentYear - (vehicleInfo.year || currentYear)
    
    return `Sen Türkiye'nin en deneyimli otomotiv değerleme uzmanısın. 30+ yıllık deneyimin var. Türkiye ikinci el araç piyasasını mükemmel biliyorsun.

🎯 ÖNEMLİ: RAPOR TAMAMEN TÜRKÇE OLMALI - HİÇBİR İNGİLİZCE KELİME YOK!

📋 ARAÇ BİLGİLERİ:
- Marka: ${vehicleInfo.make || 'Belirtilmemiş'}
- Model: ${vehicleInfo.model || 'Belirtilmemiş'}
- Yıl: ${vehicleInfo.year || currentYear}
- Yaş: ${vehicleAge} yıl
- Plaka: ${vehicleInfo.plate || 'Belirtilmemiş'}

${hasImages ? `
📸 ARAÇ GÖRSELLERİ MEVCUT:
Lütfen fotoğrafları DİKKATLİCE incele:
- Dış görünüm ve boya durumu
- Kaporta hasarları veya çizikler
- Lastik ve jant durumu
- İç mekan temizliği
- Genel bakım durumu
- Modifikasyonlar
Bu gözlemlerini değerlendirmene dahil et!
` : ''}

${damageInfo ? `
🔧 TESPİT EDİLEN HASAR BİLGİLERİ:
⚠️ ÖNEMLİ: Bu araçta yapay zeka ile tespit edilmiş hasarlar mevcut!

Hasar Sayısı: ${damageInfo.damageAreas.length}
Toplam Tamir Maliyeti: ${damageInfo.overallAssessment.totalRepairCost.toLocaleString('tr-TR')} TL
Hasar Seviyesi: ${damageInfo.overallAssessment.damageLevel}
Araç Durumu: ${damageInfo.overallAssessment.vehicleCondition}
Güvenlik Durumu: ${damageInfo.safetyAssessment.roadworthiness}
Yapısal Bütünlük: ${damageInfo.technicalAnalysis.structuralIntegrity}

Detaylı Hasarlar:
${damageInfo.damageAreas.map((damage, i) => `
${i + 1}. ${damage.type} - ${damage.area} bölgesi
   - Şiddet: ${damage.severity}
   - Tamir Maliyeti: ${damage.repairCost.toLocaleString('tr-TR')} TL
   - Güvenlik Etkisi: ${damage.safetyImpact}
   - Öncelik: ${damage.repairPriority}
   - Açıklama: ${damage.description}`).join('')}

🚨 KRİTİK: Bu hasar bilgileri değer tahminini ÖNEMLİ ÖLÇÜDE ETKİLEMELİ:
- Toplam tamir maliyeti: ${damageInfo.overallAssessment.totalRepairCost.toLocaleString('tr-TR')} TL → Bu tutarı fiyattan DÜŞ
- Hasar geçmişi nedeniyle ek %${Math.min(damageInfo.damageAreas.length * 5, 25)} değer kaybı uygula
- Kritik hasarlar için ekstra %10-15 değer kaybı
- Yapısal hasar varsa (${damageInfo.technicalAnalysis.frameDamage ? 'EVET' : 'Hayır'}): ${damageInfo.technicalAnalysis.frameDamage ? 'EK %20-30 DEĞER KAYBI!' : 'Ekstra düşüş yok'}
- Güvenlik riski ${damageInfo.safetyAssessment.roadworthiness === 'unsafe' ? 'VAR - EK %15 DÜŞÜŞ' : damageInfo.safetyAssessment.roadworthiness === 'conditional' ? 'ORTA - EK %8 DÜŞÜŞ' : 'YOK'}
- Piyasa değer etkisi: ${damageInfo.overallAssessment.marketValueImpact}%
- Hasarlı araçlar piyasada %30-50 daha zor satılır, talebi çok düşüktür
- Alıcılar hasarlı araçlar için çok daha düşük fiyat teklif eder
` : ''}

💰 TÜRKİYE 2025 PİYASA ANALİZİ:

**FİYAT HESAPLAMA KURALLARI:**
1. ${vehicleInfo.year || currentYear} model ${vehicleInfo.make} ${vehicleInfo.model} için güncel piyasa fiyatını araştır
2. Araç yaşı: ${vehicleAge} yıl → Her yıl için %10-12 değer kaybı
3. Ortalama kilometre: ${vehicleAge * 15000} km (yılda 15.000 km)
4. Türkiye ekonomik durumu: Enflasyon ve döviz kuru etkisi
5. ${hasImages ? 'Fotoğraflardaki araç durumunu değerlendir' : 'Genel piyasa ortalamasını kullan'}

**GERÇEK ÖRNEK FİYATLAR (2025):**
- 2024 Toyota Corolla: 1.100.000 - 1.250.000 TL
- 2023 Toyota Corolla: 950.000 - 1.050.000 TL
- 2022 Toyota Corolla: 850.000 - 950.000 TL
- 2021 Toyota Corolla: 750.000 - 850.000 TL
- 2020 Toyota Corolla: 650.000 - 750.000 TL
- 2019 Toyota Corolla: 550.000 - 650.000 TL

Bu örneklere göre ${vehicleInfo.year} model ${vehicleInfo.make} ${vehicleInfo.model} için uygun fiyat belirle!

🔍 ÇIKTI FORMATI (Sadece geçerli JSON, TAMAMEN TÜRKÇE):
{
  "estimatedValue": 685000,
  "marketAnalysis": {
    "currentMarketValue": 685000,
    "marketTrend": "Yükseliş trendinde - Son 6 ayda %8 değer artışı görüldü",
    "demandLevel": "Yüksek talep - Bu model çok aranıyor, günde 50+ kişi arıyor",
    "supplyLevel": "Orta arz - Piyasada yeterli araç var ama talep daha fazla",
    "priceRange": {
      "min": 650000,
      "max": 720000,
      "average": 685000
    },
    "regionalVariation": "İstanbul ve Ankara'da fiyatlar %5-8 daha yüksek. İzmir'de ortalama seviyede.",
    "seasonalImpact": "Bahar aylarında (Mart-Mayıs) talep %15 artar, fiyatlar yükselir",
    "marketInsights": [
      "Bu model segment lideri - En çok satan araçlardan",
      "Benzer araçlar ortalama 12-18 günde satılıyor",
      "Yakıt ekonomisi sayesinde talep çok yüksek",
      "Yedek parça bulunabilirliği kolay ve ucuz",
      "Bahar aylarında fiyatlar %10-15 daha iyi olacak"
    ]
  },
  "vehicleCondition": {
    "overallCondition": ${damageInfo ? `"${damageInfo.overallAssessment.vehicleCondition === 'damaged' ? 'Hasarlı araç - Ciddi onarım gerekli' : damageInfo.overallAssessment.vehicleCondition === 'poor' ? 'Kötü durumda - Kapsamlı tamir lazım' : damageInfo.overallAssessment.vehicleCondition === 'fair' ? 'Orta durumda - Bazı hasarlar var' : 'İyi durumda'}"` : '"İyi durumda - Bakımlı araç"'},
    "conditionScore": ${damageInfo ? Math.max(20, 85 - (damageInfo.damageAreas.length * 8) - (damageInfo.technicalAnalysis.frameDamage ? 25 : 0)) : 82},
    "mileageImpact": "Ortalama kilometre - Değer kaybı normal seviyede",
    "ageImpact": "${vehicleAge} yıllık araç - Yaşına göre ${damageInfo ? 'hasarlı' : 'iyi'} durumda",
    "maintenanceImpact": ${damageInfo ? '"Hasarlar mevcut - Değer kaybı var"' : '"Düzenli bakım yapılmış - Artı değer sağlıyor"'},
    "accidentHistory": ${damageInfo ? true : false},
    "ownershipHistory": "2 el - ${damageInfo ? 'Hasar geçmişi olan' : 'İdeal el sayısı'}",
    "serviceRecords": true,
    "modifications": [],
    "conditionNotes": [
      ${damageInfo ? `"⚠️ HASAR TESPİT EDİLDİ: ${damageInfo.damageAreas.length} adet hasar mevcut",
      "Tamir maliyeti: ${damageInfo.overallAssessment.totalRepairCost.toLocaleString('tr-TR')} TL",
      "Yapısal durum: ${damageInfo.technicalAnalysis.structuralIntegrity}",
      "Güvenlik: ${damageInfo.safetyAssessment.roadworthiness}",
      ${damageInfo.technicalAnalysis.frameDamage ? '"🚨 Yapısal hasar mevcut - Ciddi sorun",' : ''}
      ${damageInfo.safetyAssessment.criticalIssues.length > 0 ? `"Kritik sorunlar: ${damageInfo.safetyAssessment.criticalIssues.join(', ')}"` : ''}` : `${hasImages ? '"Fotoğraflarda araç temiz ve bakımlı görünüyor",' : ''}
      "Genel durum yaşına göre çok iyi",
      "Orijinal parçalar kullanılmış",
      "Düzenli servis bakımları yapılmış"`}
    ]
  },
  "priceBreakdown": {
    "baseValue": 750000,
    "mileageAdjustment": -35000,
    "conditionAdjustment": ${damageInfo ? -Math.abs(damageInfo.overallAssessment.totalRepairCost) : 15000},
    "featuresAdjustment": 8000,
    "marketAdjustment": -25000,
    "regionalAdjustment": -15000,
    "seasonalAdjustment": -13000,
    ${damageInfo ? `"damageRepairCost": -${damageInfo.overallAssessment.totalRepairCost},` : ''}
    ${damageInfo ? `"damageHistoryPenalty": -${Math.min(damageInfo.damageAreas.length * 5000, 50000)},` : ''}
    ${damageInfo && damageInfo.technicalAnalysis.frameDamage ? '"structuralDamagePenalty": -80000,' : ''}
    ${damageInfo && damageInfo.safetyAssessment.roadworthiness === 'unsafe' ? '"safetyRiskPenalty": -40000,' : ''}
    "finalValue": ${damageInfo ? 'HASAR NEDENİYLE HESAPLA' : 685000},
    "breakdown": [
      {
        "factor": "Temel Değer (Sıfır Araç Fiyatı Bazlı)",
        "impact": 750000,
        "description": "2025 yılı sıfır araç fiyatı ve model yılı bazında hesaplama"
      },
      {
        "factor": "Kilometre Etkisi",
        "impact": -35000,
        "description": "Tahmini ${vehicleAge * 15000} km için değer kaybı (-%4.7)"
      },
      ${damageInfo ? `{
        "factor": "⚠️ HASAR TAMİR MALİYETİ",
        "impact": -${damageInfo.overallAssessment.totalRepairCost},
        "description": "${damageInfo.damageAreas.length} adet hasar tespit edildi - Tamir maliyeti düşülmeli"
      },
      {
        "factor": "⚠️ HASAR GEÇMİŞİ CEZASI",
        "impact": -${Math.min(damageInfo.damageAreas.length * 5000, 50000)},
        "description": "Hasarlı araç geçmişi - Piyasa değeri düşüşü (-%${Math.min(damageInfo.damageAreas.length * 3, 15)})"
      },` : `{
        "factor": "Genel Durum ve Bakım",
        "impact": 15000,
        "description": "İyi bakım, temiz araç, düzenli servis (+%2.2)"
      },`}
      ${damageInfo && damageInfo.technicalAnalysis.frameDamage ? `{
        "factor": "🚨 YAPISAL HASAR CEZASI",
        "impact": -80000,
        "description": "Şase/yapısal hasar mevcut - Ciddi değer kaybı (-%20)"
      },` : ''}
      ${damageInfo && damageInfo.safetyAssessment.roadworthiness === 'unsafe' ? `{
        "factor": "🚨 GÜVENLİK RİSKİ CEZASI",
        "impact": -40000,
        "description": "Araç sürüş güvenliği riskli - Ek değer düşüşü (-%12)"
      },` : ''}
      {
        "factor": "Ekstra Özellikler",
        "impact": 8000,
        "description": "Sunroof, deri döşeme, navigasyon gibi ekstralar"
      },
      {
        "factor": "Piyasa Durumu",
        "impact": -25000,
        "description": "Mevcut arz-talep dengesi ve ekonomik durum"
      },
      {
        "factor": "Bölgesel Fark",
        "impact": -15000,
        "description": "Şehir ve bölge bazlı fiyat farkı"
      },
      {
        "factor": "Mevsimsel Etki",
        "impact": -13000,
        "description": "Kış ayları - Bahar aylarında bu fark kapanır"
      }
    ]
  },
  "marketPosition": {
    "percentile": 68,
    "competitivePosition": "Piyasa ortalamasının üzerinde - İyi konumda",
    "pricingStrategy": "Piyasa ortalamasının %5-8 üzerinde fiyatlandırma yapılabilir. Pazarlık payı bırakın.",
    "marketAdvantages": [
      ${damageInfo ? '' : '"✅ Düzenli bakım geçmişi - Alıcılar için güven verici",'}
      ${damageInfo ? '' : '"✅ Düşük kilometre - Yaşına göre az kullanılmış",'}
      ${damageInfo ? '' : '"✅ Hasar kaydı yok - Temiz geçmiş",'}
      ${damageInfo ? '' : '"✅ Popüler renk - Kolay satılır",'}
      "✅ Yakıt ekonomisi mükemmel - Düşük işletme maliyeti"
      ${damageInfo ? '' : hasImages ? ',"✅ Fotoğraflarda araç çok iyi görünüyor"' : ''}
    ],
    "marketDisadvantages": [
      ${damageInfo ? `"🚨 HASAR GEÇMİŞİ VAR - Alıcılar çok temkinli olacak",
      "🚨 TAMİR MALİYETİ YÜKSEK - ${damageInfo.overallAssessment.totalRepairCost.toLocaleString('tr-TR')} TL",
      ${damageInfo.technicalAnalysis.frameDamage ? '"🚨 YAPISAL HASAR - Çok zor satılır, büyük değer kaybı",' : ''}
      ${damageInfo.safetyAssessment.roadworthiness === 'unsafe' ? '"🚨 GÜVENLİK RİSKİ - Alıcılar kaçınacak",' : ''}
      "⚠️ Hasarlı araçlar %50-70 daha yavaş satılır",
      "⚠️ Alıcılar hasarlı araçlar için çok düşük fiyat teklif eder",` : ''}
      "⚠️ 2. el piyasada bol bulunuyor - Rekabet var",
      "⚠️ Yeni model çıktı - Eski model talebi azalabilir",
      "⚠️ Kış ayları - Satış süresi uzayabilir"
    ],
    "targetBuyers": [
      "👨‍👩‍👧‍👦 Aile kullanıcıları - Güvenli ve ekonomik araç arayanlar",
      "🎓 İlk araç alacaklar - Güvenilir marka tercih edenler",
      "💼 Şehir içi kullanım - Yakıt ekonomisi önemli olanlar",
      "🔧 Düşük bakım maliyeti arayanlar"
    ]
  },
  "investmentAnalysis": {
    "investmentGrade": ${damageInfo ? '"Kötü Yatırım (D)"' : '"İyi Yatırım (B+)"'},
    "appreciationPotential": ${damageInfo ? '"Negatif - Değer kaybı devam edecek"' : '"Yıllık %2-3 değer artışı (enflasyon altında)"'},
    "depreciationRate": ${damageInfo ? `"Yıllık %25-35 değer kaybı - Hasarlı araç riski yüksek"` : '"Yıllık %10-12 değer kaybı (sektör ortalaması %15)"'},
    "holdingCostPerMonth": ${damageInfo ? `"Aylık ${4500 + Math.floor(damageInfo.overallAssessment.totalRepairCost / 12)} TL (sigorta, vergi, bakım + tamir)"` : '"Aylık 4.500 TL (sigorta, vergi, bakım)"'},
    "liquidityScore": ${damageInfo ? Math.max(20, 88 - (damageInfo.damageAreas.length * 10)) : 88},
    "riskLevel": ${damageInfo ? '"Yüksek risk - Hasarlı araç"' : '"Düşük risk - Güvenli yatırım"'},
    "investmentHorizon": ${damageInfo ? '"Tamir sonrası hemen satış önerilir - Değer hızla kaybediyor"' : '"1-2 yıl içinde satış önerilir - Değer kaybı yavaşlıyor"'},
    "investmentNotes": [
      ${damageInfo ? `"🚨 HASAR MEVCUT - Yatırım riski çok yüksek",
      "⚠️ Tamir maliyeti: ${damageInfo.overallAssessment.totalRepairCost.toLocaleString('tr-TR')} TL",
      "📉 Likidite düşük - Satış çok zor, 60-90 gün sürebilir",
      "💸 Alıcılar hasarlı araçlar için %30-50 düşük fiyat teklif eder",
      ${damageInfo.technicalAnalysis.frameDamage ? '"🚨 Yapısal hasar - Satış neredeyse imkansız",' : ''}
      "⏰ Her geçen gün değer daha da kaybediyor"` : `"💰 Değer kaybı yavaşlıyor - İyi tutma süresi",
      "🚀 Likidite çok yüksek - 15-20 günde satılır",
      "🔧 Bakım maliyetleri düşük - Ekonomik araç",
      "📈 Piyasa talebi stabil - Güvenli yatırım",
      "⏰ 2 yıl sonra değer kaybı hızlanacak"`}
    ]
  },
  "recommendations": {
    "sellingPrice": {
      "min": 665000,
      "optimal": 695000,
      "max": 720000
    },
    "buyingPrice": {
      "min": 640000,
      "optimal": 670000,
      "max": 690000
    },
    "negotiationTips": [
      ${damageInfo ? `"🚨 Hasarları MUTLAKA açıkla - Gizlersen yasal sorun olur",
      "📋 Tamir faturalarını göster - Yapılan onarımları belgele",
      "⚠️ Gerçekçi fiyat belirle - Hasarlı araçlar %30-50 daha ucuz",
      "🔧 Önce tamiri yaptır, sonra sat - Daha iyi fiyat alırsın",
      "� Sabırlı ol - Hasarlı araç satışı 3-4 ay sürebilir",
      "📸 Tamir öncesi/sonrası fotoğraf çek - Şeffaflık güven verir"` : `"�📋 Bakım kayıtlarını mutlaka göster - Değeri %5-8 artırır",
      "🚫 Hasar kaydı olmadığını belgele - Güven verir",
      "🔧 Orijinal parça kullanımını vurgula - Artı değer",
      "📅 Bahar aylarını bekle - Fiyatlar %10-15 daha iyi",
      "📸 Profesyonel fotoğraf çektir - Satış süresini %30 kısaltır",
      "💬 Sabırlı ol - Acele satışta %10-15 kaybedersin"`}
    ],
    "timingAdvice": [
      "🌸 Mart-Mayıs arası satış için IDEAL - En yüksek talep dönemi",
      "☀️ Yaz tatili öncesi (Haziran) talep artar - İyi fiyat alırsın",
      "❄️ Kış aylarından kaçın - Satış süresi 2-3 kat uzar",
      "🎄 Yıl sonu kampanyalarından ÖNCE sat - Sıfır araç kampanyaları talebi düşürür",
      "📊 Piyasayı takip et - Döviz artışında fiyatlar yükselir"
    ],
    "improvementSuggestions": [
      ${damageInfo ? `{
        "action": "🚨 ÖNCELİK 1: Tüm hasarları onar",
        "cost": ${damageInfo.overallAssessment.totalRepairCost},
        "valueIncrease": ${Math.floor(damageInfo.overallAssessment.totalRepairCost * 0.6)},
        "description": "Hasarlar giderilmeden satış çok zor - En az %60'ını geri alırsın"
      },
      ${damageInfo.technicalAnalysis.frameDamage ? `{
        "action": "🚨 Yapısal onarım YAP",
        "cost": ${Math.floor(damageInfo.overallAssessment.totalRepairCost * 0.5)},
        "valueIncrease": ${Math.floor(damageInfo.overallAssessment.totalRepairCost * 0.4)},
        "description": "Yapısal hasar olan araçlar neredeyse satılmaz"
      },` : ''}
      {
        "action": "📋 Ekspertiz raporu al",
        "cost": 1500,
        "valueIncrease": 15000,
        "description": "Profesyonel ekspertiz alıcıya güven verir"
      },` : `{
        "action": "🧼 Detaylı iç-dış temizlik, pasta-cila, motor temizliği",
        "cost": 2500,
        "valueIncrease": 10000,
        "description": "Araç çok daha iyi görünür, alıcı güveni artar"
      },`}
      {
        "action": "🎨 Küçük boya rötuşları ve çizik giderme",
        "cost": 1800,
        "valueIncrease": 6000,
        "description": "Görsel kusurlar giderilir, profesyonel görünüm"
      },
      {
        "action": "🚗 Lastik değişimi (gerekirse - 4 adet)",
        "cost": 8000,
        "valueIncrease": 12000,
        "description": "Yeni lastikler güven verir ve pazarlık gücü sağlar"
      },
      {
        "action": "🔧 Küçük mekanik bakımlar (fren, yağ, filtre)",
        "cost": 3000,
        "valueIncrease": 8000,
        "description": "Araç sorunsuz çalışır, test sürüşü mükemmel olur"
      }
    ]
  },
  "comparableVehicles": [
    {
      "make": "${vehicleInfo.make}",
      "model": "${vehicleInfo.model}",
      "year": ${vehicleInfo.year || currentYear},
      "mileage": ${vehicleAge * 14000},
      "price": 695000,
      "condition": "Çok İyi",
      "location": "İstanbul",
      "daysOnMarket": 14,
      "similarity": 95
    },
    {
      "make": "${vehicleInfo.make}",
      "model": "${vehicleInfo.model}",
      "year": ${vehicleInfo.year || currentYear},
      "mileage": ${vehicleAge * 16000},
      "price": 675000,
      "condition": "İyi",
      "location": "Ankara",
      "daysOnMarket": 21,
      "similarity": 90
    },
    {
      "make": "${vehicleInfo.make}",
      "model": "${vehicleInfo.model}",
      "year": ${vehicleInfo.year || currentYear},
      "mileage": ${vehicleAge * 18000},
      "price": 655000,
      "condition": "Orta",
      "location": "İzmir",
      "daysOnMarket": 28,
      "similarity": 85
    }
  ],
  "aiProvider": "OpenAI",
  "model": "OpenAI",
  "confidence": 94,
  "analysisTimestamp": "${new Date().toISOString()}"
}

⚠️ KRİTİK KURALLAR:
- RAPOR TAMAMEN TÜRKÇE - HİÇBİR İNGİLİZCE YOK!
- Fiyatlar GERÇEK Türkiye 2025 piyasa değerleri olmalı
- ${vehicleInfo.year} model ${vehicleInfo.make} ${vehicleInfo.model} için UYGUN fiyat belirle
- Detaylı Türkçe açıklamalar yap (minimum 2-3 cümle)
- ${hasImages ? 'Fotoğraflardaki araç durumunu DEĞERLENDİR ve yorumla' : 'Genel piyasa verilerine göre değerle'}
- Tüm sayısal değerleri NUMBER olarak ver (string DEĞİL!)
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

  private static async estimateValueWithOpenAI(vehicleInfo: any, imagePaths?: string[]): Promise<ValueEstimationResult> {
    if (!this.openaiClient) {
      throw new Error('OpenAI istemcisi kullanılabilir değil')
    }

    const hasImages = !!(imagePaths && imagePaths.length > 0)
    
    // ÖNEMLİ: Önce hasar analizi yap
    let damageInfo: DamageDetectionResult | undefined = undefined
    if (hasImages && imagePaths && imagePaths.length > 0) {
      try {
        console.log('[AI] Değer tahmini için önce hasar analizi yapılıyor...')
        damageInfo = await DamageDetectionService.detectDamage(imagePaths[0])
        console.log(`[AI] Hasar analizi tamamlandı: ${damageInfo.damageAreas.length} hasar tespit edildi`)
        console.log(`[AI] Toplam tamir maliyeti: ${damageInfo.overallAssessment.totalRepairCost} TL`)
      } catch (error) {
        console.warn('[AI] Hasar analizi yapılamadı, hasar bilgisi olmadan devam ediliyor:', error)
      }
    }
    
    const prompt = `${this.buildPrompt(vehicleInfo, hasImages, damageInfo)}\n\nLütfen tüm sayısal değerleri NUMBER olarak döndür (string değil!).`

    let messages: any[] = [
      {
        role: 'system',
        content: 'Sen Türkiye\'nin en deneyimli otomotiv değerleme uzmanısın. Türkiye ikinci el araç piyasasını mükemmel biliyorsun. Çıktıyı geçerli JSON olarak üret. Tüm metinler Türkçe olmalı. Gerçekçi Türkiye 2025 fiyatları ver. Hasarlı araçlar için tamir maliyeti ve hasar geçmişi nedeniyle ciddi değer düşüşü uygula.'
      }
    ]

    // Eğer resimler varsa, vision model kullan
    if (hasImages) {
      const imageContents = await Promise.all(
        imagePaths!.slice(0, 4).map(async (path) => {
          const base64 = await this.convertImageToBase64(path)
          return {
            type: 'image_url' as const,
            image_url: { url: `data:image/jpeg;base64,${base64}` }
          }
        })
      )

      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...imageContents
        ]
      })
    } else {
      messages.push({
        role: 'user',
        content: prompt
      })
    }

    const response = await this.openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.2,
      messages
    })

    const text = response.choices?.[0]?.message?.content
    if (!text) {
      throw new Error('OpenAI yanıtı boş geldi')
    }

    const parsed = this.extractJsonPayload(text)
    return parsed as ValueEstimationResult
  }

  static async estimateValue(vehicleInfo: any, imagePaths?: string[]): Promise<ValueEstimationResult> {
    await this.initialize()

    const cacheKey = crypto.createHash('md5').update(JSON.stringify({ vehicleInfo, hasImages: !!imagePaths })).digest('hex')
    const cached = this.cache.get(cacheKey)
    if (cached) {
      console.log('[AI] Değer tahmini cache üzerinden döndürüldü')
      return cached
    }

    try {
      console.log('[AI] OpenAI ile değer tahmini başlatılıyor...')
      console.log('[AI] Resim sayısı:', imagePaths?.length || 0)
      const result = await this.estimateValueWithOpenAI(vehicleInfo, imagePaths)
      console.log('[AI] OpenAI değer tahmini başarılı!')
      
      this.cache.set(cacheKey, result)
      return result
    } catch (error) {
      console.error('[AI] OpenAI değer tahmini HATASI:', error)
      throw new Error('OpenAI değer tahmini başarısız oldu.')
    }
  }
}
