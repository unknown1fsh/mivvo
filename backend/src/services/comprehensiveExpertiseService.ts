/**
 * Tam Ekspertiz Servisi (Comprehensive Expertise Service)
 * 
 * Clean Architecture - Service Layer (İş Mantığı Katmanı)
 * 
 * Bu servis, tüm AI analiz servislerini orchestrate ederek
 * kapsamlı bir araç ekspertiz raporu oluşturur.
 * 
 * Amaç:
 * - Hasar tespiti, boya analizi, motor ses analizi ve değer tahmini
 * - Tüm analiz sonuçlarını birleştirme
 * - Uzman görüşü oluşturma
 * - Yatırım kararı önerisi
 * - Premium detaylı rapor
 * 
 * Entegre Servisler:
 * - DamageDetectionService (Hasar Tespiti)
 * - PaintAnalysisService (Boya Analizi)
 * - AudioAnalysisService (Motor Ses Analizi)
 * - ValueEstimationService (Değer Tahmini)
 * 
 * Rapor Bileşenleri:
 * - Genel Puan (0-100)
 * - Ekspertiz Notu (excellent/good/fair/poor/critical)
 * - Detaylı Özet (anahtar bulgular, kritik sorunlar, güçlü/zayıf yönler)
 * - Uzman Görüşü (durabilite, güvenlik, ekonomiklik)
 * - Nihai Öneriler (acil, kısa/uzun vadeli)
 * - Yatırım Kararı (al/bekleme/alma önerisi)
 * 
 * Özellikler:
 * - 4 farklı AI analiz entegrasyonu
 * - Ağırlıklı puan hesaplama
 * - Detaylı tablo formatları
 * - Premium rapor tasarımı
 * - Türkçe içerik
 */

import OpenAI from 'openai'
import { DamageDetectionService, DamageDetectionResult } from './damageDetectionService'
import { PaintAnalysisService } from './paintAnalysisService'
import { AIService, PaintAnalysisResult } from './aiService'
import { AudioAnalysisService, AudioAnalysisResult } from './audioAnalysisService'
import { ValueEstimationService, ValueEstimationResult } from './valueEstimationService'
import { AIHelpers } from '../utils/aiRateLimiter'
import { parseAIResponse, checkMissingFields } from '../utils/jsonParser'

// ===== TİP TANIMLARI =====

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
  detailedDescription?: string  // Detaylı açıklama (optional)
  keyFindings: string[]
  criticalIssues: string[]
  strengths: string[]
  weaknesses: string[]
  overallCondition: string
  marketPosition: string
  investmentPotential: string
  // Tablo formatında bilgiler (optional)
  vehicleSpecsTable?: {
    makeModel: string
    year: string
    engineType: string
    transmission: string
    driveType: string
    color: string
    plate: string
  }
  exteriorConditionTable?: {
    bodywork: { status: string, note: string }
    paint: { status: string, note: string }
    windows: { status: string, note: string }
    lights: { status: string, note: string }
    mirrors: { status: string, note: string }
  }
  mechanicalAnalysisTable?: {
    engine: { status: string, note: string }
    transmission: { status: string, note: string }
    suspension: { status: string, note: string }
    brakes: { status: string, note: string }
    electrical: { status: string, note: string }
  }
  expertiseScoreTable?: {
    bodyPaint: { score: number, status: string, note: string }
    chassis: { score: number, status: string, note: string }
    mechanical: { score: number, status: string, note: string }
    electrical: { score: number, status: string, note: string }
    tires: { score: number, status: string, note: string }
    wheels: { score: number, status: string, note: string }
    interior: { score: number, status: string, note: string }
    overall: { score: number, status: string, note: string }
  }
  marketValueTable?: {
    asIs: { min: number, max: number, note: string }
    afterRepair: { min: number, max: number, note: string }
    restored: { min: number, max: number, note: string }
  }
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

// ===== SERVİS =====

/**
 * OpenAI Model Seçimi
 * 
 * Tam ekspertiz için gpt-4o modeli kullanılır (en güçlü model)
 */
const OPENAI_MODEL = process.env.OPENAI_COMPREHENSIVE_MODEL ?? 'gpt-4o'

/**
 * ComprehensiveExpertiseService Sınıfı
 * 
 * Tüm AI analiz servislerini orchestrate ederek
 * kapsamlı araç ekspertiz raporu oluşturur.
 * 
 * Ana Metod:
 * - performComprehensiveAnalysis: Tüm analizleri yapar ve birleştirir
 * 
 * İş Akışı:
 * 1. Hasar Tespiti (DamageDetectionService)
 * 2. Boya Analizi (PaintAnalysisService)
 * 3. Motor Ses Analizi (AudioAnalysisService)
 * 4. Değer Tahmini (ValueEstimationService)
 * 5. Tüm sonuçları birleştirme
 * 6. Ağırlıklı puan hesaplama
 * 7. Uzman görüşü ve yatırım kararı oluşturma
 */
export class ComprehensiveExpertiseService {
  /**
   * OpenAI client instance
   */
  private static openaiClient: OpenAI | null = null

  /**
   * Initialization durumu
   */
  private static isInitialized = false

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
        this.openaiClient = new OpenAI({
          apiKey: openaiApiKey,
          timeout: 120000, // 120 saniye (2 dakika) timeout - trafik yoğunluğu için yeterli
          maxRetries: 3 // Maksimum 3 deneme (retry mekanizması)
        })
        console.log('[AI] OpenAI Tam Expertiz servisi hazırlandı (timeout: 120s, maxRetries: 3)')
      } else {
        throw new Error('OpenAI API key bulunamadı')
      }
      this.isInitialized = true
    } catch (error) {
      console.error('[AI] OpenAI Tam Expertiz servisi başlatılırken hata:', error)
      throw error
    }
  }

  private static buildPrompt(vehicleInfo: any, analyses: {
    damage?: DamageDetectionResult
    paint?: PaintAnalysisResult
    audio?: AudioAnalysisResult
    value?: ValueEstimationResult
  }): string {
    const currentYear = new Date().getFullYear()
    const vehicleAge = vehicleInfo?.year ? currentYear - vehicleInfo.year : 0

    return `Kapsamlı expertiz uzmanısın. ${vehicleInfo.make} ${vehicleInfo.model} (${vehicleInfo.year}, ${vehicleAge} yıl)

GÖREV: Tüm alt analizleri birleştirip kapsamlı expertiz raporu oluştur. SADECE JSON döndür.

ALT ANALİZ SONUÇLARI:
${analyses.damage ? `
HASAR ANALİZİ:
- ${analyses.damage.hasarAlanları.length} adet hasar
- Toplam maliyet: ${analyses.damage.genelDeğerlendirme.toplamOnarımMaliyeti.toLocaleString('tr-TR')} TL
- Seviye: ${analyses.damage.genelDeğerlendirme.hasarSeviyesi}
- Durum: ${analyses.damage.genelDeğerlendirme.araçDurumu}
` : 'Hasar analizi yok'}
${analyses.paint ? `
BOYA ANALİZİ:
- Genel puan: ${analyses.paint.boyaKalitesi?.genelPuan || 0}/100
- Kalite: ${analyses.paint.boyaKalitesi?.kalite || 'Bilinmiyor'}
` : 'Boya analizi yok'}
${analyses.audio ? `
MOTOR SES ANALİZİ:
- Motor sağlığı: ${analyses.audio.engineHealth}
- Puan: ${analyses.audio.overallScore}/100
- Tespit edilen sorun: ${analyses.audio.detectedIssues?.length || 0} adet
` : 'Motor analizi yok'}
${analyses.value ? `
DEĞER TAHMİNİ:
- Tahmini değer: ${analyses.value.estimatedValue?.toLocaleString('tr-TR') || 0} TL
- Piyasa durumu: ${analyses.value.marketAnalysis?.marketTrend || 'Bilinmiyor'}
` : 'Değer tahmini yok'}

{
  "overallScore": 85,
  "riskLevel": "düşük",
  "vehicleCondition": {
    "general": "iyi",
    "damageScore": 90,
    "paintScore": 85,
    "mechanicalScore": 80,
    "valueScore": 85
  },
  "summary": "Genel durum iyi. ${analyses.damage && analyses.damage.hasarAlanları.length > 0 ? `${analyses.damage.hasarAlanları.length} adet hasar mevcut.` : 'Hasarsız.'} Yatırım değeri var.",
  "recommendations": ["Rutin bakım yaptır", ${analyses.damage && analyses.damage.genelDeğerlendirme.toplamOnarımMaliyeti > 0 ? '"Hasar onarımı gerekli",' : ''} "Piyasa fiyatını takip et"],
  "investmentDecision": {
    "worthBuying": ${!analyses.damage || analyses.damage.genelDeğerlendirme.hasarSeviyesi === 'iyi' || analyses.damage.genelDeğerlendirme.hasarSeviyesi === 'orta'},
    "reason": "${analyses.damage && analyses.damage.hasarAlanları.length > 5 ? 'Çok hasarlı, dikkatli olun' : 'İyi durum, uygun fiyat'}",
    "negotiationAdvice": "${analyses.damage && analyses.damage.hasarAlanları.length > 0 ? '10-15%' : '5-8%'} pazarlık yapılabilir",
    "estimatedROI": ${analyses.value ? 10 : 5}
  },
  "detailedAnalysis": {
    "strengths": [${analyses.damage ? '"Motor hasarsız"' : ''}, "Genel durum iyi"],
    "weaknesses": [${analyses.damage && analyses.damage.hasarAlanları.length > 0 ? '"Hasarlar mevcut"' : ''}],
    "risks": [${analyses.damage && analyses.damage.genelDeğerlendirme.hasarSeviyesi === 'kritik' ? '"Yüksek hasar riski"' : '"Düşük risk"'}]
  },
  "aiSağlayıcı": "OpenAI",
  "model": "gpt-4o",
  "güven": 90,
  "analizZamanı": "${new Date().toISOString()}"
}`

${vehicleContext}

🎯 ÖNEMLİ: RAPOR TAMAMEN TÜRKÇE OLMALI - HİÇBİR İNGİLİZCE KELİME YOK!

⚠️ ÖNEMLİ: Araç hasarlı veya kötü durumda olsa bile MUTLAKA detaylı rapor yaz!
- Hasarları açıkça belirt ve GERÇEKÇİ onarım maliyetleri ver (0 TL değil!)
- Pert araç için boya durumunu "Kötü" olarak belirt
- Ciddi hasar varsa düşük puan ver (0-30 arası)
- Risk faktörlerini açıkla
- "Rapor oluşturulamıyor" deme, durumu olduğu gibi raporla!
- HASAR MALİYETİ VARSA MUTLAKA BELİRT - 0 TL yazma!

🔍 ÖNEMLİ: Sana YÜKSEK ÇÖZÜNÜRLÜKLÜ araç fotoğrafları gönderiyorum.
Bu fotoğrafları DOĞRUDAN analiz et ve kendi değerlendirmeni yap.

Aşağıdaki alt servis sonuçları SADECE REFERANS içindir:
- Hasar analizi (fiziksel hasar uzmanı)
- Boya analizi (boya uzmanı)
- Motor ses analizi (mekanik uzman)
- Değer tahmini (piyasa uzmanı)

SEN KENDİ GÖRSELLERİ ANALİZ ET - alt servislere körü körüne güvenme!

🚨 KRİTİK: Sen hasar ve boya analizini DOĞRUDAN YAPACAKSIN!

HASAR ANALİZİ (Kendin Yap):
- Fotoğraflardaki çizik, göçük, kırık, pas, çatlak, deformasyon tespit et
- Her hasar için konum, şiddet, tür belirt
- Gerçekçi onarım maliyeti hesapla (0 TL YAZMA!)
- Hasar şiddeti: minimal/düşük/orta/yüksek/kritik
- Genel hasar puanı: 0-100

BOYA ANALİZİ (Kendin Yap):
- Fotoğraflardaki boya durumunu analiz et
- Yüzey kusurları tespit et (çizik, soyulma, renk farkı, pürüz)
- Boya kalitesi: Kötü/Orta/İyi/Mükemmel
- Pert araç için MUTLAKA "Kötü" yaz!
- Orijinal boya olup olmadığını belirt

⚠️ Alt servislerin sonuçlarını GÖRMEZDEN GEL - sen kendi analizini yap!

🔍 YÜKSEK KALİTE VERİ ANALİZİ:
Bu analiz için YÜKSEK ÇÖZÜNÜRLÜKLÜ araç fotoğrafları ve KALİTELİ motor ses kaydı kullanıldı. Bu sayede:
- En küçük hasar detayları tespit edilebilir
- Boya kalınlığı mikron seviyesinde ölçülebilir  
- Motor sesi frekans analizi yapılabilir
- Çok hassas değerlendirmeler mümkün

📊 MEVCUT AI ANALİZ SONUÇLARI (SADECE MOTOR VE DEĞER REFERANS):

${analyses.audio ? `
✓ MOTOR SES ANALİZİ (Referans):
 - Motor sağlığı: ${analyses.audio.engineHealth}
 - Rölanti RPM: ${analyses.audio.rpmAnalysis?.idleRpm || 0}
 - Tespit edilen sorunlar: ${analyses.audio.detectedIssues?.length || 0} adet
 - Tahmini onarım: ${analyses.audio.costEstimate?.totalCost || 0} TL
` : ''}

${analyses.value ? `
✓ DEĞER TAHMİNİ (Referans):
 - Tahmini değer: ${analyses.value.estimatedValue?.toLocaleString('tr-TR') || '-'} TL
 - Piyasa pozisyonu ve likidite analizi
` : ''}

🎯 SENİN GÖREVİN:
1. MOTOR VE DEĞER analizlerini referans olarak kullan
2. HASAR ANALİZİNİ KENDİN YAP - fotoğraflardaki hasarları tespit et ve gerçekçi maliyet hesapla!
3. BOYA ANALİZİNİ KENDİN YAP - fotoğraflardaki boya durumunu analiz et, pert araç için "Kötü" yaz!
4. Genel bir özet, uzman görüşü ve yatırım kararı ver

⚠️ ÖNEMLİ: Hasar ve boya analizini sen kendin yapacaksın - alt servislere güvenme!
⚠️ KRİTİK: Ciddi hasar varsa onarım maliyetini 0 TL yazma - gerçekçi maliyet ver!
⚠️ KRİTİK: Pert araç için boya durumunu "Kötü" olarak belirt!

📋 ZORUNLU BÖLÜMLER:

1️⃣ detailedDescription (Minimum 300 kelime):
   - YÜKSEK KALİTE görüntü analizi ile başla: "Bu yüksek çözünürlüklü fotoğraflara baktığımda karşımda..."
   - Plaka, marka, model, yıl, motor tipi, renk detaylarını TAM OLARAK ver
   - Kaporta, boya, donanım durumunu MİKRON SEVİYESİNDE detaylıca anlat
   - Motor ses analizinden KALİTELİ kayıt sayesinde bahset (rölanti, titreşim, frekans analizi)
   - YÜKSEK KALİTE VERİLER sayesinde çok detaylı analiz yap
   - Profesyonel ama konuşma dili kullan

2️⃣ vehicleSpecsTable:
   - Tüm teknik özellikleri tablo formatında sun
   - Motor gücü HP cinsinden belirt
   - Aktarım sistemi (FWD/RWD/AWD) ekle
   
3️⃣ exteriorConditionTable:
   - bodywork, paint, windows, lights, mirrors
   - Her biri için status (%, durum) ve note (detaylı not) ver
   
4️⃣ mechanicalAnalysisTable:
   - engine, transmission, suspension, brakes, electrical
   - Motor için RPM değerini KALİTELİ SES ANALİZİ ile ver (örn: "825 RPM ideal rölanti, frekans analizi normal")
   - YÜKSEK KALİTE VERİLER sayesinde çok detaylı analiz yap
   - Her biri için status ve detaylı note ver
   
5️⃣ expertiseScoreTable:
   - bodyPaint, chassis, mechanical, electrical, tires, wheels, interior, overall
   - YÜKSEK KALİTE VERİLER sayesinde çok hassas puanlama yap
   - Her biri için score (0-100), status (durum) ve detaylı note ver
   - overall score özellikle YÜKSEK KALİTE ANALİZİ ile detaylı olmalı
   
6️⃣ marketValueTable:
   - asIs (şu anki hali), afterRepair (tamir sonrası), restored (restore sonrası)
   - YÜKSEK KALİTE VERİLER ile çok detaylı piyasa analizi
   - Her biri için min, max (TL) ve detaylı note ver
   - Türkiye 2025 güncel piyasa fiyatlarını kullan

${vehicleContext}

📊 Mevcut AI Analiz Sonuçları:
${analyses.damage ? `\n✓ Hasar Tespiti: ${analyses.damage.hasarAlanları?.length || 0} hasar bulundu` : ''}
${analyses.paint ? `\n✓ Boya Analizi: Durum ${analyses.paint.paintCondition || 'değerlendirildi'}` : ''}
${analyses.audio ? `\n✓ Motor Sesi: ${analyses.audio.engineHealth || 'analiz edildi'}` : ''}
${analyses.value ? `\n✓ Değer Tahmini: Yaklaşık ${analyses.value.estimatedValue?.toLocaleString('tr-TR') || '-'} TL` : ''}

📋 YÜKSEK KALİTE RAPOR FORMATI:

1. Detaylı açıklama (300+ kelime) - YÜKSEK ÇÖZÜNÜRLÜKLÜ fotoğraflara bakarak başla
2. Teknik özellikler tablosu (YÜKSEK KALİTE VERİLER ile)
3. Dış ve iç donanım durumu tabloları (MİKRON SEVİYESİNDE analiz)
4. Mekanik analiz (KALİTELİ SES ANALİZİ ile motor, vites, fren, süspansiyon)
5. Ekspertiz puanları (YÜKSEK KALİTE VERİLER ile her bölüm için 0-100)
6. Piyasa değer tahmini (YÜKSEK KALİTE ANALİZİ ile şu anki hali, tamir sonrası, restore sonrası)
7. Uzman görüşü ve yatırım önerisi (YÜKSEK KALİTE VERİLER temelinde)
8. Acil yapılması gerekenler
9. Kısa/uzun vadeli öneriler

💰 Türkiye 2025 güncel gerçek fiyatlarını kullan.

⚠️ SADECE JSON FORMATINDA CEVAP VER:

{
  "overallScore": 85,
  "expertiseGrade": "good",
  "comprehensiveSummary": {
    "vehicleOverview": "Bu 2020 model Toyota Corolla 1.6 benzinli aracı toplamda 67.500 km yapılmış durumda. Araç, genel olarak yaşına ve kilometresine göre çok iyi bir kondisyonda. Tek el sahibinden alındığı düşünüldüğünde, bakım geçmişinin oldukça düzenli olduğu gözlemlenmektedir. Hasar tespiti yapılan görsel analizde kayda değer kaporta hasarı bulunmamaktadır. Motor sesi kayıtlarının akustik analizi, motorun sağlıklı çalıştığını ve yaşına göre normal aşınma seviyeleri olduğunu göstermektedir. Boya kalınlık ölçümleri ve görsel inceleme sonucunda tüm panellerde orijinal fabrika boyası tespit edilmiştir. Piyasa değeri analizi, aracın segment ortalamasının %12 üzerinde bir değere sahip olduğunu ortaya koymaktadır.",
    
    "keyFindings": [
      "✅ TÜM PANELLERDE ORİJİNAL BOYA - Hiçbir panel değişimi veya boyama yapılmamış, fabrika çıkışı boya korunmuş",
      "✅ MOTOR SAĞLIKLI VE SORUNSUZ - Akustik analiz sonuçları ideal rölanti değerleri gösteriyor, titreşim seviyesi normalin altında",
      "✅ DÜZENLI BAKIM GEÇMİŞİ - Tüm servis bakımları zamanında yapılmış, orijinal yedek parça kullanılmış",
      "✅ HASAR KAYDI TEMİZ - Hiçbir kaza kaydı yok, sigorta şirketi hasarsız belgesi mevcut",
      "✅ PİYASA DEĞERİ YÜKSEK - Benzer araçlara göre %12 daha değerli, yüksek likidite potansiyeli",
      "✅ DÜŞÜK KİLOMETRE - Yıllık ortalama 16.800 km, segment ortalamasının %38 altında",
      "✅ TEK SAHİPLİ ARAÇ - İlk el, bakım faturaları ve tüm belgeler sahibinde mevcut"
    ],
    
    "criticalIssues": [
      "⚠️ Motor takozlarında minimal aşınma tespit edildi - 3-4 ay içinde değiştirilmeli (1.500 TL maliyet)",
      "⚠️ Ön sol fren diski hafif yüzey pürüzlülüğü gösteriyor - Bir sonraki bakımda değiştirilmeli (800 TL)"
    ],
    
    "strengths": [
      "🏆 DÜZENLI SERVİS BAKIMI - 15 ayrı servis kaydı, hiçbir bakım atlanmamış, tüm işlemler yetkili serviste yapılmış",
      "🏆 ORİJİNAL FABRIKA BOYASI - 127 μm ortalama boya kalınlığı (standart: 90-150 μm), hiçbir panel boyanmamış",
      "🏆 MOTOR SAĞLIĞI MÜKEMMEL - 825 RPM ideal rölanti, titreşim seviyesi %95 stabilite, hiçbir anormal ses yok",
      "🏆 DÜŞÜK YILLIK KİLOMETRE - Ortalama 16.800 km/yıl, çoğunlukla şehir içi kullanım, ağır koşullara maruz kalmamış",
      "🏆 HASAR GEÇMİŞİ YOK - Kaza kaydı yok, tramerlerde kayıt yok, sigorta hasarsız belgelendirmesi var",
      "🏆 YÜKSEK LİKİDİTE - Segment lideri model, piyasada çok aranan renk, ortalama 12-15 günde satılır",
      "🏆 GARANTİ DEVAM EDİYOR - 2 yıl/40.000 km garanti süresi kalmış, transferedilebilir",
      "🏆 YAKÍT EKONOMİSİ - Şehir içi 6.2 lt/100km tüketim, segment ortalamasının %18 altında"
    ],
    
    "weaknesses": [
      "⚠️ Motor takozlarında yaşa bağlı minimal aşınma - Değişim maliyeti 1.500 TL, 3-4 ay içinde yapılmalı",
      "⚠️ Ön fren diskleri yaklaşık 5.000 km sonra değişim gerektirecek - Tahmini maliyet 2.400 TL",
      "⚠️ Klima gazı şarjı azalmış - Performans %15 düşük, gaz dolumu gerekli (400 TL)",
      "⚠️ Arka silecek lastiği çatlamış - Değişim gerekli (150 TL)",
      "⚠️ Kabin hava filtresi ömrünü doldurmuş - Bir sonraki bakımda değiştirilmeli (280 TL)"
    ],
    
    "overallCondition": "Araç genel olarak yaşına ve kilometresine göre ÇOK İYİ durumda. 2020 model, 67.500 km'de ve tek el sahibinden olması büyük avantaj sağlıyor. Görsel inceleme ve AI destekli hasar analizi sonucunda herhangi bir kaporta hasarı, kaza geçmişi veya boya işlemi tespit edilmedi. Tüm panellerde fabrika boyası mevcut ve boya kalınlık ölçümleri ideal aralıkta (127 μm ortalama). Motor sesi akustik analizi, motorun çok sağlıklı çalıştığını gösteriyor - rölanti 825 RPM'de sabit, titreşim seviyesi minimal ve hiçbir anormal vuruntu veya ses yok. Sadece normal yıpranma maddeleri yaklaşık değişim zamanına geliyor (motor takozları, fren diskleri gibi) ki bunlar tüm araçlarda bu yaş ve kilometrede beklenen rutin bakım kalemleridir. Piyasa değeri analizi, aracın segment ortalamasının %12 üzerinde bir fiyata sahip olduğunu gösteriyor. Yüksek talep, düşük arz ve mükemmel durum nedeniyle likidite çok yüksek - tahminen 12-15 gün içinde kolayca satılabilir.",
    
    "marketPosition": "Araç, ikinci el piyasada ÇOK AVANTAJLI bir konumda. 2020 model Toyota Corolla segmentinde lider konumda ve en çok aranan modellerden biri. Tek el, düşük kilometre (67.500 km), tam servis geçmişi ve hasarsız özellikleri sayesinde piyasa ortalamasının %12 üzerinde değer taşıyor. Benzer özelliklere sahip araçlar (aynı model, yıl ve kilometre bandında) piyasada ortalama 685.000-720.000 TL aralığında işlem görüyor, ancak bu araç 750.000-780.000 TL bandında fiyatlandırılabilir. Türkiye'de bu segmentte yıllık ortalama %8-10 değer kaybı yaşanırken, bu aracın özellikleri nedeniyle değer kaybının %5-6 seviyesinde kalması bekleniyor. Likidite açısından segment birincisi - ortalama 12-15 günde, bazen 7-10 günde bile alıcı bulunabiliyor. Özellikle bahar aylarında (Mart-Mayıs) talep %20-25 artıyor ve fiyatlar yukarı yönlü hareket ediyor.",
    
    "investmentPotential": "YATIRIM AÇISINDAN ÇOK İYİ bir fırsat. Araç hem kullanım hem de yatırım aracı olarak değerlendirilebilir. Satın alma fiyatı 750.000 TL olarak kabul edildiğinde, 1-2 yıl sonra (bazı küçük iyileştirmelerle) 780.000-820.000 TL civarında satış yapılabilir. Aylık ortalama bakım maliyeti 650 TL (sigorta, vergi, yakıt hariç). Yakıt ekonomisi mükemmel seviyede (şehir içi 6.2 lt/100km), bu da işletme maliyetlerini düşük tutuyor. Kredi ile alım durumunda bile, değer kaybı çok yavaş olduğu için negatif öz sermaye riski minimal. Segment lideri bir model olması, her an satılabilirlik garantisi sağlıyor - acil likidite ihtiyacında 5-7 gün içinde nakde dönüştürülebilir. Sigorta şirketlerinin hasarsız, tek el araçlara özel indirimleri mevcut (%15-20), bu da maliyet avantajı sağlıyor.",
    
    "detailedDescription": "Bu aracın fotoğraflarına ve motor ses analizine baktığımda karşımda parlak kırmızı bir 2020 model Toyota Corolla duruyor. Plaka: 34 ABC 123. Bu araç, segmentinde lider konumda olan Toyota Corolla 1.6 benzinli otomatik versiyonu. Motor tipi 4 silindir, 1.6 litre hacimli, enjeksiyonlu benzinli motor. Aktarım sistemi önden çekiş (FWD), şanzıman CVT otomatik. Renk parlak kırmızı (fabrika çıkışı orijinal renk). Aracın kilometresi 67.500 km ile yaşına göre oldukça düşük seviyede. Kaporta genel olarak son derece düzgün, göze çarpan göçük, ezik veya boya dalgalanması görünmüyor. Renk tonu tamamen homojen, tüm panellerde fabrika boyası mevcut. Boya kalınlık ölçümleri 120-135 mikron aralığında ideal seviyede. Tamponlar orijinal tip ve hiç boyanmamış. Kapı fitilleri, cam çerçeve çıtaları ve krom hatlar yerli yerinde. Farlar ve stoplar orijinal (LED teknoloji), hiç sararma veya buğulanma yok. Motor ses analizi ideal değerler gösteriyor - rölanti 825 RPM'de sabit, titreşim minimal, hiçbir anormal ses yok.",
    
    "vehicleSpecsTable": {
      "makeModel": "Toyota Corolla 1.6 CVT",
      "year": "2020",
      "engineType": "1.6L 4 Silindir Benzinli (132 HP)",
      "transmission": "CVT Otomatik",
      "driveType": "Önden Çekiş (FWD)",
      "color": "Parlak Kırmızı (Orijinal Fabrika Rengi)",
      "plate": "34 ABC 123 (İstanbul)"
    },
    
    "exteriorConditionTable": {
      "bodywork": { 
        "status": "%95 Temiz", 
        "note": "Minimal yüzeysel çizikler, göçük/ezik yok, tüm paneller düzgün" 
      },
      "paint": { 
        "status": "Orijinal Fabrika Boyası", 
        "note": "127 μm ortalama kalınlık, hiçbir panel boyanmamış, renk tonu homojen" 
      },
      "windows": { 
        "status": "Mükemmel", 
        "note": "Tüm camlar orijinal, çatlak/çizik yok, film kaliteli" 
      },
      "lights": { 
        "status": "Orijinal ve Sağlam", 
        "note": "LED farlar ve stoplar, sararma/buğulanma yok" 
      },
      "mirrors": { 
        "status": "Orijinal", 
        "note": "Elektrikli katlanır, cam ve gövde hasar yok" 
      }
    },
    
    "mechanicalAnalysisTable": {
      "engine": { 
        "status": "Mükemmel", 
        "note": "825 RPM ideal rölanti, titreşim minimal, akustik analiz sağlıklı gösteriyor" 
      },
      "transmission": { 
        "status": "İyi", 
        "note": "CVT otomatik, vites geçişleri yumuşak, anormal ses yok" 
      },
      "suspension": { 
        "status": "İyi", 
        "note": "Sürüş konforu normal, aşırı sarsıntı yok, takozu yaklaşık 3-4 ay sonra değişmeli" 
      },
      "brakes": { 
        "status": "Orta", 
        "note": "Ön diskler 5.000 km sonra değişim gerektirecek, fren performansı normal" 
      },
      "electrical": { 
        "status": "İyi", 
        "note": "Tüm sistemler çalışıyor, klima gazı azalmış (dolum gerekli)" 
      }
    },
    
    "expertiseScoreTable": {
      "bodyPaint": { 
        "score": 95, 
        "status": "Mükemmel", 
        "note": "Orijinal boya, minimal çizikler" 
      },
      "chassis": { 
        "score": 100, 
        "status": "Sağlam", 
        "note": "Hasar kaydı yok, yapısal sorun yok" 
      },
      "mechanical": { 
        "score": 90, 
        "status": "Çok İyi", 
        "note": "Motor sağlıklı, küçük bakım maddeleri yaklaşıyor" 
      },
      "electrical": { 
        "score": 85, 
        "status": "İyi", 
        "note": "Tüm sistemler çalışıyor, klima bakımı gerekli" 
      },
      "tires": { 
        "score": 80, 
        "status": "İyi", 
        "note": "Diş derinliği %70, yaklaşık 2 sezon daha gider" 
      },
      "wheels": { 
        "score": 95, 
        "status": "Mükemmel", 
        "note": "Orijinal Toyota jantlar, hasar yok" 
      },
      "interior": { 
        "score": 90, 
        "status": "Çok İyi", 
        "note": "Temiz ve bakımlı, minimal kullanım izi" 
      },
      "overall": { 
        "score": 90, 
        "status": "Çok İyi Kondisyon", 
        "note": "Yaşına ve kilometresine göre mükemmel durum" 
      }
    },
    
    "marketValueTable": {
      "asIs": { 
        "min": 680000, 
        "max": 720000, 
        "note": "Mevcut durumda, küçük bakımlar yapılmadan satış fiyatı" 
      },
      "afterRepair": { 
        "min": 750000, 
        "max": 780000, 
        "note": "Motor takozları, fren diskleri değiştirildikten sonra" 
      },
      "restored": { 
        "min": 820000, 
        "max": 850000, 
        "note": "Tam detaylı bakım, pasta-cila, tüm küçük kusurlar giderildikten sonra" 
      }
    }
  },
  
  "expertOpinion": {
    "recommendation": "strongly_buy",
    "reasoning": [
      "1. ARAÇ DURUMU MÜKEMMEL - Hasar geçmişi yok, orijinal boya, motor sağlıklı, düzenli bakımlı",
      "2. PİYASA KONUMU ÇOK GÜÇLÜ - Segment lideri, en çok aranan model, yüksek likidite, değer kaybı minimal",
      "3. FİNANSAL AÇIDAN AVANTAJLI - Alış fiyatı uygun, satış potansiyeli yüksek, ROI beklentisi %8-10",
      "4. KULLANIM EKONOMİSİ - Yakıt tüketimi düşük, bakım maliyetleri öngörülebilir, yedek parça kolay bulunur",
      "5. RİSK SEVİYESİ ÇOK DÜŞÜK - Garanti devam ediyor, hasar riski yok, mekanik sorun olasılığı minimal",
      "6. SATIŞ POTANSİYELİ YÜKSEK - Ortalama 12-15 günde satılır, bahar aylarında daha kısa sürede ve daha yüksek fiyata",
      "7. YATIRIM GETİRİSİ - 1-2 yıl içinde %5-8 net getiri beklentisi, enflasyonun üzerinde performans"
    ],
    
    "riskAssessment": {
      "level": "low",
      "factors": [
        "✅ HASAR GEÇMİŞİ TEMİZ - Kaza kaydı yok, tramer sorgusu temiz, sigorta hasarsız belgesi var",
        "✅ MOTOR SAĞLIKLI - Akustik analiz ideal değerler gösteriyor, yakın gelecekte büyük onarım riski yok",
        "✅ BAKIM DÜZENLİ - 15 servis kaydı, hiçbir bakım atlanmamış, tüm işlemler yetkili serviste",
        "✅ ORİJİNAL PARÇALAR - Tüm yedek parçalar orijinal, kalitesiz aftermarket parça kullanılmamış",
        "✅ GARANTİ DEVAM EDİYOR - 2 yıl/40.000 km garanti var, büyük arıza riskini önemli ölçüde azaltıyor",
        "✅ SEGMENT LİDERİ - Toyota Corolla segment birincisi, yedek parça kolay bulunur, teknik servis desteği yaygın",
        "✅ DÜŞÜK KİLOMETRE - 67.500 km çok düşük, yıllık ortalama 16.800 km ideal seviyede"
      ]
    },
    
    "opportunityAssessment": {
      "level": "excellent",
      "factors": [
        "🎯 PİYASA TALEBİ ÇOK YÜKSEK - Bu model ve özelliklerde araç günde 50+ kişi tarafından aranıyor",
        "🎯 DEĞER KAYBI MİNİMAL - Segment ortalaması %10 iken bu araç %5-6 seviyesinde değer kaybedecek",
        "🎯 LİKİDİTE MÜKEMMEL - 12-15 gün içinde ortalama fiyattan satılabilir, bahar aylarında 7-10 gün",
        "🎯 FIYAT ARTIŞ POTANSİYELİ - Bahar aylarında (Mart-Mayıs) fiyatlar %10-15 artıyor",
        "🎯 YATIRIM GETİRİSİ - 1 yıl tutulduğunda %5-8 net getiri, 2 yıl tutulduğunda %8-12 getiri bekleniyor",
        "🎯 SİGORTA İNDİRİMLERİ - Hasarsız araçlara %15-20 kasko indirimi uygulanıyor",
        "🎯ParameterEKSİK PARÇA YOK - Tüm aksesuarlar, yedek anahtar, servis kitapçığı mevcut, değer kaybı faktörü yok"
      ]
    },
    
    "expertNotes": [
      "💡 PAZARLIK YAPILMALI - Satıcı 780.000 TL istiyor, 750.000-760.000 TL'de anlaşma yapılabilir (peşin ödemede ek %2-3 indirim mümkün)",
      "💡 KÜÇÜK İYİLEŞTİRMELER YÜKSEK DEĞER KATACAK - 3.500 TL iyileştirme yatırımı (motor takozları, fren diskleri, klima gazı) ile araç değeri 15.000 TL artacak",
      "💡 BAHAR AYLARINI BEKLEMEK AVANTAJLI - Mart-Mayıs arası talep zirvede, %10-15 daha yüksek fiyata satılabilir",
      "💡 GARANTİ TRANSFERİ YAPILMALI - Garanti süresi transfere edilmeli, bu yeni alıcı için büyük avantaj",
      "💡 DETAYLI TEMİZLİK ÖNERİLİR - Profesyonel iç-dış detaylı temizlik (2.000 TL) aracın görsel değerini 8.000-10.000 TL artırır",
      "💡 SERVİS KİTAPÇIĞI VE FATURALAR ÖNEMLİ - Tüm servis faturaları ve kitapçık muhafaza edilmeli, satışta büyük güven unsuru"
    ]
  },
  "finalRecommendations": {
    "immediate": [
      {
        "priority": "🔴 KRİTİK",
        "action": "Motor takozları değişimi",
        "cost": 1500,
        "timeframe": "7-10 gün içinde",
        "benefit": "Titreşim problemi %90 azalacak, sürüş konforu artacak, motor bloku titreşimden korunacak, değer kaybı önlenecek",
        "consequence": "Yapılmazsa: Motor titreşimi artacak, diğer parçalara zarar verebilir, araç değeri 3.000-5.000 TL düşecek"
      },
      {
        "priority": "🟡 YÜKSEK",
        "action": "Fren diskleri ve balataları kontrolü",
        "cost": 800,
        "timeframe": "İlk bakımda",
        "benefit": "Fren performansı ideal seviyede olacak, güvenlik riski ortadan kalkacak",
        "consequence": "Yapılmazsa: 5.000 km sonra mecburen değiştirilmeli, aksi takdirde fren sistemi hasarı riski var"
      },
      {
        "priority": "🟢 ORTA",
        "action": "Klima gazı şarjı",
        "cost": 400,
        "timeframe": "İsteğe bağlı",
        "benefit": "Klima performansı ideal seviyeye dönecek, yaz aylarında konfor sağlanacak",
        "consequence": "Yapılmazsa: Klima performansı düşük kalacak ama acil tehlike yok"
      }
    ],
    
    "shortTerm": [
      {
        "priority": "⭐ ÖNERİLEN",
        "action": "Profesyonel detaylı iç-dış temizlik, pasta-cila, motor yıkama",
        "cost": 2500,
        "timeframe": "Satıştan önce mutlaka",
        "benefit": "Araç görsel olarak sıfır gibi olacak, değer 10.000-15.000 TL artacak, satış süresi %40 kısalacak",
        "consequence": "Yapılmazsa: Potansiyel alıcılar araç hakkında olumsuz etkilenecek, pazarlık payı artacak"
      },
      {
        "priority": "⭐ ÖNERİLEN",
        "action": "Boya koruma ve seramik kaplama",
        "cost": 10000,
        "timeframe": "Kullanım düşünülüyorsa öncelikli",
        "benefit": "Boya 2-3 yıl korunacak, değer kaybı yavaşlayacak, satış değeri 15.000-20.000 TL artacak",
        "consequence": "Yapılmazsa: Boya zamanla matlaşacak, çizilecek, değer daha hızlı kaybedecek"
      },
      {
        "priority": "🟢 ORTA",
        "action": "Tüm eksik bakımların tamamlanması (kabin filtresi, silecekler vs.)",
        "cost": 850,
        "timeframe": "1-2 ay içinde",
        "benefit": "Tüm sistemler tam performansta çalışacak, bakımlı araç imajı güçlenecek",
        "consequence": "Yapılmazsa: Küçük kusurlar birikecek, alıcı güveni azalacak"
      }
    ],
    
    "longTerm": [
      {
        "priority": "📅 PLANLAMA",
        "action": "Triger kayışı ve su pompası değişimi",
        "cost": 5500,
        "timeframe": "80.000-85.000 km'de",
        "benefit": "Motor ömrü 200.000+ km'ye uzar, ani arıza riski sıfırlanır",
        "consequence": "Yapılmazsa: Triger kopması durumunda motor hasar görebilir, 50.000-80.000 TL onarım maliyeti"
      },
      {
        "priority": "📅 PLANLAMA",
        "action": "Amortisörler kontrolü ve değişimi",
        "cost": 6000,
        "timeframe": "100.000 km'de",
        "benefit": "Sürüş konforu ve yol tutuşu ideal seviyede kalacak",
        "consequence": "Yapılmazsa: Yol tutuşu azalacak, diğer süspansiyon parçaları daha çabuk aşınacak"
      },
      {
        "priority": "📅 PLANLAMA",
        "action": "Debriyaj seti kontrolü",
        "cost": 8500,
        "timeframe": "120.000-130.000 km'de",
        "benefit": "Yumuşak vites geçişleri, güç aktarımı ideal seviyede",
        "consequence": "Yapılmazsa: Debriyaj patlama riski, seyir halinde kalmayüksek riski"
      }
    ],
    
    "maintenance": [
      {
        "frequency": "Her 10.000 km veya 1 yılda bir",
        "action": "Motor yağı ve filtre değişimi (5W-30 Full Sentetik)",
        "cost": 1400,
        "importance": "KRİTİK",
        "notes": "Mutlaka zamanında yapılmalı, gecikme motor hasarına yol açar"
      },
      {
        "frequency": "Her 20.000 km veya 2 yılda bir",
        "action": "Hava filtresi ve kabin filtresi değişimi",
        "cost": 550,
        "importance": "YÜKSEK",
        "notes": "Yakıt tüketimi ve motor performansını etkiler"
      },
      {
        "frequency": "Her 30.000 km",
        "action": "Yakıt filtresi ve buji değişimi",
        "cost": 950,
        "importance": "ORTA",
        "notes": "Motor performansı ve yakıt ekonomisi için önemli"
      },
      {
        "frequency": "Yılda 2 kez (İlkbahar ve Sonbahar)",
        "action": "Genel kontrol, fren ve süspansiyon kontrolü, rot-balans",
        "cost": 1200,
        "importance": "YÜKSEK",
        "notes": "Mevsim geçişlerinde mutlaka yaptırılmalı, lastik ömrünü uzatır"
      },
      {
        "frequency": "Her 40.000 km veya 3 yılda bir",
        "action": "Şanzıman yağı değişimi (otomatik şanzımanda)",
        "cost": 2400,
        "importance": "KRİTİK",
        "notes": "Şanzıman ömrünü doğrudan etkiler, ihmal edilmemeli"
      }
    ]
  },
  
  "investmentDecision": {
    "decision": "excellent_investment",
    "expectedReturn": 8.5,
    "paybackPeriod": "12-18 ay",
    "riskLevel": "low",
    "liquidityScore": 92,
    "marketTiming": "🟢 ŞU AN ALIM İÇİN ÇOK UYGUN - Kış ayları sonu, talepler artmaya başladı. Bahar aylarında (Mart-Mayıs) %10-15 daha yüksek fiyata satılabilir. Eğer kullanım amaçlı ise zaten ideal bir araç.",
    "priceNegotiation": "Satıcı 780.000 TL istiyor. Hedef fiyat 750.000-760.000 TL olmalı. Peşin ödeme durumunda 745.000-750.000 TL'ye kadar pazarlık yapılabilir (%4-5 indirim mümkün).",
    
    "financialSummary": {
      "purchasePrice": 750000,
      "negotiationTarget": 750000,
      "immediateRepairs": 3500,
      "improvements": 12500,
      "monthlyMaintenance": 650,
      "estimatedResaleValue": 820000,
      "totalInvestment": 766000,
      "expectedProfit": 54000,
      "roi": 7.0,
      "breakdownDetails": {
        "basePrice": "750.000 TL (pazarlık sonrası hedef fiyat)",
        "immediateCosts": "3.500 TL (motor takozları, fren kontrolü, klima gazı)",
        "improvementCosts": "12.500 TL (detaylı temizlik 2.500 TL + seramik kaplama 10.000 TL)",
        "holding12Months": "7.800 TL (aylık 650 TL × 12 ay bakım)",
        "totalInvested": "773.800 TL",
        "salePrice1Year": "795.000 TL (konservatif tahmin)",
        "salePrice1_5Year": "820.000 TL (iyimser tahmin)",
        "netProfit1Year": "21.200 TL (ROI: %2.7)",
        "netProfit1_5Year": "46.200 TL (ROI: %6.0)",
        "best CaseScenario": "850.000 TL (bahar aylarında detaylı temiz, hasarsız araç olarak %8.5 ROI)"
      }
    },
    
    "scenarioAnalysis": {
      "bestCase": {
        "scenario": "Bahar aylarında (Mart-Mayıs) temiz ve bakımlı olarak satış",
        "salePrice": 850000,
        "profit": 76200,
        "roi": 9.8,
        "probability": "40%"
      },
      "baseCase": {
        "scenario": "1-1.5 yıl içinde normal piyasa koşullarında satış",
        "salePrice": 820000,
        "profit": 46200,
        "roi": 6.0,
        "probability": "50%"
      },
      "worstCase": {
        "scenario": "Acil satış gerektiğinde veya piyasa koşulları kötüleşirse",
        "salePrice": 770000,
        "profit": -3800,
        "roi": -0.5,
        "probability": "10%"
      }
    },
    
    "comparisonAnalysis": {
      "alternativeInvestments": [
        {
          "option": "Banka mevduat (1 yıl)",
          "return": "%48 (aylık %4)",
          "risk": "Çok düşük",
          "liquidity": "Orta",
          "verdict": "Bu araç yatırımı daha avantajlı değil AMA kullanım değeri var"
        },
        {
          "option": "Farklı araç modeli (Renault Megane)",
          "return": "%5-6",
          "risk": "Orta",
          "liquidity": "Orta",
          "verdict": "Toyota Corolla daha güvenli, likiditesi daha yüksek"
        },
        {
          "option": "Eski model yüksek kilometre araç",
          "return": "%10-15",
          "risk": "Yüksek",
          "liquidity": "Düşük",
          "verdict": "Risk/getiri dengesi Toyota Corolla lehine"
        }
      ]
    },
    
    "exitStrategy": {
      "idealTiming": "Mart-Mayıs (bahar ayları) - talep %20-25 daha yüksek",
      "optimalHoldingPeriod": "12-18 ay",
      "quickSaleOption": "7-10 gün içinde 10% indirimle satılabilir",
      "marketingTips": [
        "Profesyonel fotoğraf çektirin (1.000 TL maliyet, değer 15.000 TL artırır)",
        "Tüm servis faturalarını düzenli klasörleyin",
        "Detaylı temizlik mutlaka yaptırın",
        "Sahibinden.com, Arabam.com ve Facebook'ta eş zamanlı ilan",
        "'Tek el, hasarsız, tam bakımlı' vurgusu yapın",
        "Video çekim yapın (motor sesi, iç mekan, test sürüşü)",
        "Fiyatı %5 yüksek başlatın, pazarlık payı bırakın"
      ]
    }
  },
  
  "aiProvider": "OpenAI",
  "model": "gpt-4o",
  "confidence": 95,
  "analysisTimestamp": "${new Date().toISOString()}",
  "reportVersion": "2.0",
  "totalAnalysisTime": "Kapsamlı 4 aşamalı AI analizi tamamlandı"
}

═══════════════════════════════════════════════════════════════════
              ⚠️ SON KRİTİK KURALLAR - MUTLAKA UYULMALI
═══════════════════════════════════════════════════════════════════

🚫 YAPILMAMASI GEREKENLER:
❌ HİÇBİR İNGİLİZCE KELİME kullanma
❌ Kısa, yüzeysel açıklamalar yapma
❌ Genel geçer klişe cümleler kullanma
❌ Sadece bir analiz türüne odaklanma
❌ Sayısal değerler vermeden yorum yapma
❌ Varsayımda bulunma, mevcut verileri kullan
❌ JSON formatı dışında hiçbir şey yazma

✅ MUTLAKA YAPILMASI GEREKENLER:
✓ RAPOR %100 TÜRKÇE - Profesyonel otomotiv terminolojisi kullan
✓ HER BULGU İÇİN DETAYLI AÇIKLAMA YAP - Minimum 3-4 cümle
✓ TÜM ANALİZLERİ BİRLEŞTİR - Hasar, boya, motor ses, değer
✓ SAYISAL DEĞERLER VER - Mikron, RPM, TL, km, yıl, %
✓ KARŞILAŞTIRMALAR YAP - Standart değerlerle karşılaştır
✓ NEDEN-SONUÇ İLİŞKİLERİ AÇIKLA - "Çünkü", "Bu nedenle", "Dolayısıyla"
✓ SOMUT ÖNERİLER SUN - Ne yapılmalı, ne zaman, neden
✓ MALİYET-FAYDA ANALİZİ YAP - Her önerinin maliyeti ve faydası
✓ RİSK DEĞERLENDİRMESİ YAP - Yapılmazsa ne olur?
✓ YATIRIM ANALİZİ YAP - ROI, likidite, piyasa zamanlaması
✓ SADECE GEÇERLİ JSON DÖNDÜR - Başka hiçbir metin ekleme

🎯 RAPOR KALİTE KRİTERLERİ:
1. comprehensiveSummary.vehicleOverview: Minimum 150 kelime, tüm analizleri özetle
2. keyFindings: En az 7 adet, her biri 1 cümle, en önemli bulgular
3. strengths: En az 8 adet, detaylı açıklamalı güçlü yönler
4. weaknesses: Dürüstçe belirt, gizleme, ama dengeli sun
5. expertOpinion.reasoning: En az 7 gerekçe, numaralandırılmış
6. finalRecommendations: Önceliklendirilmiş, maliyetli, zamanlı, fayd alı
7. investmentDecision: Detaylı finansal analiz, senaryolar, karşılaştırmalar

🏆 BU RAPOR MIVVO EKSPERTİZ'İN AMİRAL GEMİSİ ÜRÜNÜDÜR:
• Kullanıcı bu rapor için en yüksek ücreti ödeyecek (85 TL)
• En kapsamlı, en profesyonel, en detaylı rapor olmalı
• Kullanıcı bu raporla araç alma kararını verecek
• Rapor PDF olarak saklanacak ve referans olacak
• Kullanıcı bu raporu başkalarına gösterecek
• Mivvo Expertiz'in kalitesini temsil edecek

💼 PROFESYONEL EKSPER YAKLAŞIMI:
Sen sadece AI değilsin, 35 yıllık deneyimli bir MASTER EKSPERSİN.
Her cümlen güven vermeli, her veri doğru olmalı, her öneri mantıklı olmalı.
Müşterinin en iyi kararı almasına yardımcı oluyorsun.
Rapor, müşterinin binlerce TL tasarruf etmesini veya kazanmasını sağlayacak.

📊 SON KONTROL LİSTESİ:
□ Tüm metinler Türkçe mi?
□ Tüm sayısal değerler gerçekçi mi?
□ Tüm açıklamalar detaylı mı (3-4 cümle)?
□ Hasar, boya, motor ses, değer analizleri birleştirilmiş mi?
□ Finansal analiz eksiksiz mi?
□ Öneriler somut ve uygulanabilir mi?
□ Risk değerlendirmesi yapılmış mı?
□ JSON formatı geçerli mi?
□ Güven veren profesyonel dil kullanılmış mı?
□ Hem olumlu hem olumsuz yönler dengeli aktarılmış mı?

🎬 ŞİMDİ BAŞLA - YUKARIDA VERILEN TÜM ANALIZ VERİLERİNİ KULLANARAK 
   KAPSAMLI, PROFESYONEL, TÜRKÇE TAM EKSPERTİZ RAPORU OLUŞTUR!
   
   SADECE JSON FORMATINDA CEVAP VER - BAŞKA HİÇBİR ŞEY YAZMA!
`
  }

  private static extractJsonPayload(rawText: string): any {
    try {
      // Önce direkt JSON parse dene
      return JSON.parse(rawText)
    } catch (e) {
      // Başarısız olursa markdown code block temizle
      let cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      try {
        return JSON.parse(cleaned)
      } catch (e2) {
        // Son çare: { } arasındaki kısmı al
        const start = cleaned.indexOf('{')
        const end = cleaned.lastIndexOf('}')

        if (start === -1 || end === -1 || end <= start) {
          console.error('❌ AI yanıtı parse edilemedi:', rawText.substring(0, 500))
          throw new Error('AI yanıtından JSON verisi alınamadı')
        }

        const json = cleaned.slice(start, end + 1)
        return JSON.parse(json)
      }
    }
  }

  private static async convertImagesToBase64(imagePaths: string[]): Promise<string[]> {
    const base64Array: string[] = []

    for (const imagePath of imagePaths) {
      if (imagePath.startsWith('data:image/')) {
        const base64Match = imagePath.match(/base64,(.+)/)
        if (base64Match && base64Match[1]) {
          base64Array.push(base64Match[1])
        }
      }
    }

    return base64Array
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
      // Hasar ve boya analizini comprehensive expertise kendi yapacak
      // analyses.damage = null
      // analyses.paint = null

      // Motor ses analizi
      if (audioPath) {
        console.log('[AI] Motor ses analizi yapılıyor...')
        analyses.audio = await AudioAnalysisService.analyzeEngineSound(audioPath, vehicleInfo)
      }

      // Değer tahmini
      console.log('[AI] Değer tahmini yapılıyor...')
      analyses.value = await ValueEstimationService.estimateValue(vehicleInfo)

      // Alt servislerden teknik verileri al (Hybrid yaklaşım)
      const damageList = analyses.damage?.hasarAlanları || []
      const paintThickness = analyses.paint?.technicalDetails?.totalThickness || 0
      const engineRPM = analyses.audio?.rpmAnalysis?.idleRpm || 0
      const marketValue = analyses.value?.estimatedValue || 0

      console.log('[AI] Alt servislerden teknik veriler alındı:')
      console.log(`- Hasar sayısı: ${damageList.length}`)
      console.log(`- Boya kalınlığı: ${paintThickness} mikron`)
      console.log(`- Motor RPM: ${engineRPM}`)
      console.log(`- Piyasa değeri: ${marketValue} TL`)

      // Kapsamlı rapor oluştur
      console.log('[AI] Kapsamlı rapor birleştiriliyor...')
      const prompt = `${this.buildPrompt(vehicleInfo, analyses)}

ALT SERVİS SONUÇLARI (Referans):
- Tespit edilen hasarlar: ${JSON.stringify(damageList)}
- Boya kalınlığı: ${paintThickness} mikron
- Motor RPM: ${engineRPM}
- Piyasa değeri: ${marketValue} TL

Bu teknik verileri dikkate alarak genel değerlendirme yap!

📊 JSON ÇIKTI ŞEMASINDAKİ HASAR VE BOYA ALANLARI:

"damageAnalysis": {
  "hasarAlanları": [
    {
      "hasar_tipi": "Göçük/Çizik/Kırık/Pas/Çatlak",
      "konum": "Arka sol çamurluk",
      "şiddet": "Yüksek",
      "açıklama": "Detaylı açıklama"
    }
  ],
  "genelDeğerlendirme": {
    "genelPuan": 25, // 0-100 arası
    "toplamOnarımMaliyeti": 50000, // 0 TL YAZMA!
    "damageSeverity": "high" // minimal/low/medium/high/critical
  }
},

"paintAnalysis": {
  "paintCondition": "poor", // poor/fair/good/excellent (Pert için: poor)
  "technicalDetails": {
    "totalThickness": 80, // mikron (hasarlı için düşük)
    "colorCode": "Orijinal Değil"
  },
  "yüzeyKusurları": [
    {
      "tür": "Çizik/Soyulma/Renk Farkı",
      "konum": "Ön kaput",
      "şiddet": "Yüksek"
    }
  ]
}

Lütfen tüm sayısal değerleri sayı olarak döndür.`

      // Görselleri base64'e çevir
      let imageBase64Array: string[] = []
      if (imagePaths && imagePaths.length > 0) {
        console.log(`[AI] ${imagePaths.length} adet görsel OpenAI'ya gönderiliyor...`)
        imageBase64Array = await this.convertImagesToBase64(imagePaths)
        console.log(`[AI] ${imageBase64Array.length} adet görsel base64'e çevrildi`)
      }

      // OpenAI'ya görsel + text gönder
      console.log('[AI] Görsel analizi başlatıldı - AI fotoğrafları inceliyor...')
      const response = await AIHelpers.callVision(() =>
        this.openaiClient!.chat.completions.create({
          model: OPENAI_MODEL,
          temperature: 0.3,
          max_tokens: 2500,
          top_p: 0.9,
          response_format: { type: "json_object" },
          messages: [
            {
              role: 'system',
              content: 'Kapsamlı expertiz uzmanısın. Tüm analizleri birleştirip JSON rapor üretirsin. SADECE geçerli JSON döndür, Türkçe.'
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                // Görselleri ekle
                ...imageBase64Array.map(img => ({
                  type: 'image_url' as const,
                  image_url: {
                    url: `data:image/jpeg;base64,${img}`,
                    detail: 'high' as const
                  }
                }))
              ]
            }
          ]
        })
      )

      const text = response.choices?.[0]?.message?.content
      if (!text) {
        console.error('❌ OpenAI yanıtı boş!')
        throw new Error('OpenAI yanıtı boş geldi')
      }

      console.log('✅ OpenAI yanıtı alındı, uzunluk:', text.length)
      console.log('📄 İlk 200 karakter:', text.substring(0, 200))
      console.log('[AI] ✅ Görsel analizi tamamlandı')

      // JSON parse ve validation
      const comprehensiveData = parseAIResponse(text)
      
      const requiredFields = ['overallScore', 'vehicleCondition', 'summary']
      const missingFields = checkMissingFields(comprehensiveData, requiredFields)
      
      if (missingFields.length > 0) {
        console.error('[AI] ❌ Eksik field\'lar:', missingFields)
        throw new Error(`AI yanıtında eksik field'lar: ${missingFields.join(', ')}`)
      }
      
      console.log('✅ JSON başarıyla parse edildi ve validation tamamlandı')

      // RELAXED VALIDATION & DEFAULT VALUES
      // AI yanıtı bazen eksik olabilir, bu durumda işlemi iptal etmek yerine
      // varsayılan değerlerle devam ediyoruz.

      const defaultSummary: ComprehensiveSummary = {
        vehicleOverview: "Araç analizi tamamlandı ancak detaylı özet oluşturulamadı. Lütfen fotoğrafları kontrol ediniz.",
        keyFindings: ["Analiz tamamlandı", "Detaylı veri bekleniyor"],
        criticalIssues: [],
        strengths: [],
        weaknesses: [],
        overallCondition: "Veri Yetersiz",
        marketPosition: "Belirlenemedi",
        investmentPotential: "Belirlenemedi"
      }

      const defaultExpertOpinion: ExpertOpinion = {
        recommendation: "neutral",
        reasoning: ["Yeterli veri sağlanamadı"],
        riskAssessment: { level: "medium", factors: [] },
        opportunityAssessment: { level: "fair", factors: [] },
        expertNotes: ["Otomatik analiz sırasında bazı veriler eksik kalmış olabilir."]
      }

      const defaultRecommendations: FinalRecommendations = {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        maintenance: []
      }

      const defaultInvestment: InvestmentDecision = {
        decision: "fair_investment",
        expectedReturn: 0,
        paybackPeriod: "Belirsiz",
        riskLevel: "medium",
        liquidityScore: 0,
        marketTiming: "Nötr",
        financialSummary: {
          purchasePrice: 0,
          immediateRepairs: 0,
          monthlyMaintenance: 0,
          estimatedResaleValue: 0,
          totalInvestment: 0,
          expectedProfit: 0,
          roi: 0
        }
      }

      // Güvenli veri birleştirme
      const safeData = {
        overallScore: comprehensiveData.overallScore || 0, // 0 = Hesaplanamadı
        expertiseGrade: comprehensiveData.expertiseGrade || 'fair',
        comprehensiveSummary: { ...defaultSummary, ...comprehensiveData.comprehensiveSummary },
        expertOpinion: { ...defaultExpertOpinion, ...comprehensiveData.expertOpinion },
        finalRecommendations: { ...defaultRecommendations, ...comprehensiveData.finalRecommendations },
        investmentDecision: { ...defaultInvestment, ...comprehensiveData.investmentDecision },
        aiProvider: 'OpenAI',
        model: OPENAI_MODEL,
        confidence: comprehensiveData.confidence || 50,
        analysisTimestamp: new Date().toISOString()
      }

      const result: ComprehensiveExpertiseResult = {
        ...safeData,
        damageAnalysis: analyses.damage || null,
        paintAnalysis: analyses.paint || null,
        audioAnalysis: analyses.audio || null,
        valueEstimation: analyses.value || null
      }

      console.log('[AI] Kapsamlı expertiz raporu başarıyla oluşturuldu (Safe Mode)!')
      return result

    } catch (error) {
      console.error('[AI] Kapsamlı expertiz raporu HATASI:', error)
      throw new Error('Kapsamlı expertiz raporu oluşturulamadı.')
    }
  }
}
