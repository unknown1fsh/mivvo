/**
 * Değer Tahmini Servisi (Value Estimation Service)
 * 
 * Clean Architecture - Service Layer (İş Mantığı Katmanı)
 * 
 * Bu servis, OpenAI API kullanarak araç değer tahmini yapar.
 * 
 * Amaç:
 * - Piyasa değeri tahmini
 * - Pazar analizi ve karşılaştırma
 * - Araç durumu değerlendirmesi
 * - Fiyat kırılımı (temel değer + ekstralar - hasarlar)
 * - Yatırım analizi (ROI, amortisman)
 * - Satış ve satın alma önerileri
 * 
 * Değerlendirme Faktörleri:
 * - Araç yaşı ve model yılı
 * - Marka ve model popülaritesi
 * - Piyasa talebi
 * - Km durumu (varsayılan: yıl başına 15.000 km)
 * - Hasar durumu (DamageDetectionService entegrasyonu)
 * - Boya ve kaporta kalitesi (görsel analiz)
 * - Türkiye piyasa fiyatları (2025)
 * 
 * Çıktı Detayları:
 * - Tahmini değer (TL)
 * - Pazar analizi
 * - Fiyat kırılımı
 * - Pazar konumu
 * - Yatırım analizi
 * - Karşılaştırılabilir araçlar
 * - Öneriler
 * 
 * Özellikler:
 * - Hasar bilgisi entegrasyonu
 * - Görsel analiz (opsiyonel)
 * - Gerçekçi Türkiye fiyatları
 * - Cache mekanizması
 */


import OpenAI from 'openai'
import crypto from 'crypto'
import sharp from 'sharp'
import fs from 'fs/promises'
import { DamageDetectionService, DamageDetectionResult } from './damageDetectionService'
import { parseAIResponse, checkMissingFields } from '../utils/jsonParser'

// ===== TİP TANIMLARI =====

/**
 * Değer Tahmini Sonucu Interface
 */
export interface ValueEstimationResult {
  estimatedValue: number              // Tahmini değer (TL)
  marketAnalysis: any                 // Pazar analizi
  vehicleCondition: any               // Araç durumu değerlendirmesi
  priceBreakdown: any                 // Fiyat kırılımı (detaylı)
  marketPosition: any                 // Pazar konumu
  investmentAnalysis: any             // Yatırım analizi
  recommendations: any                // Öneriler
  comparableVehicles: any[]           // Karşılaştırılabilir araçlar
  aiProvider: string                  // AI sağlayıcı
  model: string                       // AI model
  confidence: number                  // Güven seviyesi (0-100)
  analysisTimestamp: string           // Analiz zamanı (ISO)
}

// ===== SERVİS =====

/**
 * OpenAI Model Seçimi
 * 
 * Değer tahmini için gpt-4o modeli kullanılır
 */
const OPENAI_MODEL = process.env.OPENAI_VALUE_MODEL ?? 'gpt-4o'

/**
 * ValueEstimationService Sınıfı
 * 
 * OpenAI API ile araç değer tahmini yapan servis
 */
export class ValueEstimationService {
  /**
   * OpenAI client instance
   */
  private static openaiClient: OpenAI | null = null

  /**
   * Initialization durumu
   */
  private static isInitialized = false

  /**
   * In-memory cache (vehicle hash → result)
   */
  private static cache = new Map<string, ValueEstimationResult>()

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
        console.log('[AI] OpenAI Değer Tahmini servisi hazırlandı (timeout: 120s, maxRetries: 3)')
      } else {
        throw new Error('OpenAI API key bulunamadı')
      }
      this.isInitialized = true
    } catch (error) {
      console.error('[AI] OpenAI Değer Tahmini servisi başlatılırken hata:', error)
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
   * Görseli Base64'e Çevirir
   * 
   * Desteklenen formatlar:
   * - data:image/... (zaten base64)
   * - /uploads/... (relative URL - local dosya)
   * - C:\... veya /home/... (absolute path)
   * - https://... (remote URL - fetch ile)
   * 
   * @param imagePath - Görsel dosya path'i, URL veya base64 data URL
   * @returns Base64 encoded görsel
   * 
   * @private
   */
  private static async convertImageToBase64(imagePath: string): Promise<string> {
    console.log('[AI] 🖼️ Görsel dönüştürülüyor:', imagePath.substring(0, 100))
    
    // Zaten base64 ise direkt döndür
    if (imagePath.startsWith('data:image')) {
      console.log('[AI] ✅ Görsel zaten base64 formatında')
      return imagePath.split(',')[1]
    }
    
    // Remote URL ise fetch ile al
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('[AI] 🌐 Remote URL\'den görsel indiriliyor...')
      const response = await fetch(imagePath)
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      console.log('[AI] ✅ Remote görsel indirildi, boyut:', buffer.length)
      return buffer.toString('base64')
    }
    
    // Relative URL ise (/uploads/...) local path'e çevir
    if (imagePath.startsWith('/uploads/')) {
      const localPath = `${process.cwd()}${imagePath}`
      console.log('[AI] 📁 Relative URL -> Local path:', localPath)
      try {
        const buffer = await fs.readFile(localPath)
        console.log('[AI] ✅ Local dosya okundu, boyut:', buffer.length)
        return buffer.toString('base64')
      } catch (err) {
        console.error('[AI] ❌ Local dosya okunamadı:', localPath)
        throw new Error(`Görsel dosyası bulunamadı: ${imagePath}`)
      }
    }
    
    // Absolute path ise direkt oku
    console.log('[AI] 📁 Absolute path okunuyor:', imagePath)
    try {
      const buffer = await fs.readFile(imagePath)
      console.log('[AI] ✅ Dosya okundu, boyut:', buffer.length)
      return buffer.toString('base64')
    } catch (err) {
      console.error('[AI] ❌ Dosya okunamadı:', imagePath)
      throw new Error(`Görsel dosyası bulunamadı: ${imagePath}`)
    }
  }

  private static buildPrompt(vehicleInfo: any, hasImages: boolean, damageInfo?: DamageDetectionResult): string {
    const currentYear = new Date().getFullYear()
    const vehicleAge = currentYear - (vehicleInfo.year || currentYear)
    const estimatedKm = vehicleAge * 15000
    
    return `Sen 20 yıllık deneyime sahip profesyonel bir ARAÇ DEĞERLEME UZMANISISN.

🚗 ARAÇ BİLGİLERİ:
- Marka: ${vehicleInfo.make || 'Belirtilmemiş'}
- Model: ${vehicleInfo.model || 'Belirtilmemiş'}
- Model Yılı: ${vehicleInfo.year || currentYear}
- Araç Yaşı: ${vehicleAge} yıl
- Tahmini KM: ${estimatedKm.toLocaleString('tr-TR')} km
- Plaka: ${vehicleInfo.plate || 'Belirtilmemiş'}

🎯 GÖREV: ${hasImages ? 'FOTOĞRAFLARI DİKKATLİCE İNCELE ve' : ''} bu aracın Türkiye 2025 piyasa değerini belirle.

${hasImages ? `
📸 FOTOĞRAF ANALİZİ TALİMATLARI:
Fotoğrafları DİKKATLİCE incele ve şunları tespit et:
1. BOYA DURUMU: Çizikler, solmalar, rötuş izleri, renk farklılıkları
2. KAPORTA DURUMU: Göçükler, ezikler, onarım izleri
3. GENEL GÖRÜNÜM: Temizlik, bakım durumu, yaşına göre durum
4. LASTIK/JANT: Lastik durumu, jant hasarları
5. CAM/FARU: Çatlak, kırık, sararmış farlar
6. İÇ MEKAN (varsa): Döşeme durumu, aşınma, temizlik

⚠️ ÖNEMLİ: Gördüğün her kusuru "görselAnaliz" bölümünde raporla!
` : ''}

${damageInfo ? `
🔧 ÖNCEKİ HASAR TESPİTİ:
- Hasar Sayısı: ${damageInfo.hasarAlanları.length}
- Tamir Maliyeti: ${damageInfo.genelDeğerlendirme.toplamOnarımMaliyeti.toLocaleString('tr-TR')} TL
- Hasar Seviyesi: ${damageInfo.genelDeğerlendirme.hasarSeviyesi}
- Bu hasarları değer hesabında DÜŞ!
` : ''}

💰 TÜRKİYE 2025 PİYASA REFERANSlari:
- 2024 Model Araçlar: Sıfır fiyatın %85-90'ı
- 2023 Model: Sıfır fiyatın %75-80'i  
- 2022 Model: Sıfır fiyatın %65-70'i
- 2021 Model: Sıfır fiyatın %55-60'ı
- 2020 ve öncesi: Her yıl için %8-10 ek düşüş

📤 SADECE JSON DÖNDÜR (açıklama YOK):

{
  "estimatedValue": {
    "minValue": 580000,
    "maxValue": 650000,
    "recommendedValue": 615000,
    "quickSaleValue": 570000,
    "currency": "TRY"
  },
  "görselAnaliz": {
    "yapıldıMı": ${hasImages},
    "boyaDurumu": {
      "genelDurum": "orta",
      "puan": 65,
      "tespitler": ["Sol ön çamurluğda rötuş izi", "Kaputunda hafif çizikler"],
      "boyaDeğerEtkisi": -15000
    },
    "kaportaDurumu": {
      "genelDurum": "iyi",
      "puan": 75,
      "tespitler": ["Sağ kapıda hafif ezik"],
      "kaportaDeğerEtkisi": -8000
    },
    "lastikJant": {
      "durum": "orta",
      "tespitler": ["Lastikler %50 ömürlü"],
      "değerEtkisi": -3000
    },
    "içMekan": {
      "durum": "iyi",
      "tespitler": ["Sürücü koltuğunda hafif aşınma"],
      "değerEtkisi": -2000
    },
    "genelİzlenim": "Yaşına göre orta durumda, bazı kozmetik sorunlar mevcut",
    "toplamGörselEtki": -28000
  },
  "değerHesaplama": {
    "sıfırAraçFiyatı": 1200000,
    "modelYılıDüşüşü": -480000,
    "kmEtkisi": -45000,
    "boyaDurumuEtkisi": -15000,
    "kaportaEtkisi": -8000,
    "genelDurumEtkisi": -10000,
    "piyasaDurumu": -27000,
    "hesaplananDeğer": 615000
  },
  "piyasaAnalizi": {
    "ortalamaFiyat": 620000,
    "fiyatAralığı": {"min": 580000, "max": 660000},
    "piyasaTrendi": "Stabil",
    "talepDurumu": "Orta",
    "arzDurumu": "Yüksek",
    "satışSüresiTahmini": "25-35 gün"
  },
  "araçDurumÖzeti": {
    "genelPuan": 68,
    "boyaPuan": 65,
    "kaportaPuan": 75,
    "mekanikTahmin": 70,
    "durumAçıklaması": "Yaşına göre ortalama durumda, boya rötuşları ve hafif ezikler mevcut"
  },
  "öneriler": {
    "satışİçin": {
      "önerilenfiyat": 615000,
      "minimumFiyat": 580000,
      "pazarlıkPayı": "5-8%"
    },
    "alımİçin": {
      "maksimumÖde": 600000,
      "hedefFiyat": 575000
    },
    "iyileştirmeler": [
      {"işlem": "Pasta-cila", "maliyet": 2000, "değerArtışı": 8000},
      {"işlem": "Hafif boya rötuş", "maliyet": 3000, "değerArtışı": 10000}
    ]
  },
  "sonuçÖzeti": {
    "tahminiDeğer": 615000,
    "güvenSeviyesi": ${hasImages ? 85 : 70},
    "değerlendirmeNotu": "${hasImages ? 'Görsel analiz yapıldı - Güvenilir tahmin' : 'Görsel analiz yapılmadı - Genel piyasa tahmini'}",
    "önemliNotlar": [
      "${hasImages ? 'Boya ve kaporta durumu fotoğraflardan değerlendirildi' : 'Görsel olmadan genel piyasa ortalaması kullanıldı'}",
      "Detaylı ekspertiz önerilir",
      "Fiyat pazarlık payı içermektedir"
    ]
  },
  "aiProvider": "OpenAI",
  "model": "gpt-4o",
  "analysisTimestamp": "${new Date().toISOString()}"
}

⚠️ KRİTİK KURALLAR:
1. SADECE yukarıdaki JSON yapısını döndür - başka metin YOK
2. ${hasImages ? 'Fotoğrafları ANALİZ ET - gördüğün her kusuru raporla' : 'Genel piyasa ortalaması kullan'}
3. Tüm fiyatlar TL cinsinden GERÇEK Türkiye 2025 fiyatları
4. görselAnaliz.yapıldıMı = ${hasImages}
5. ${vehicleInfo.make} ${vehicleInfo.model} ${vehicleInfo.year} için DOĞRU piyasa değeri hesapla
6. Tüm sayısal değerler NUMBER olmalı (string DEĞİL)`
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
        damageInfo = await DamageDetectionService.detectDamage(imagePaths[0], vehicleInfo)
        console.log(`[AI] Hasar analizi tamamlandı: ${damageInfo.hasarAlanları.length} hasar tespit edildi`)
        console.log(`[AI] Toplam tamir maliyeti: ${damageInfo.genelDeğerlendirme.toplamOnarımMaliyeti} TL`)
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

    const response = await this.openaiClient!.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.3,
      max_tokens: 2500,
      top_p: 0.9,
      response_format: { type: 'json_object' },
      messages
    })

    const text = response.choices?.[0]?.message?.content
    if (!text) {
      throw new Error('OpenAI yanıtı boş geldi')
    }

    // JSON parse ve validation
    const parsed = parseAIResponse(text)
    
    // ❌ MOCK VERİ YOK - SADECE AI VERİSİ KULLANILACAK
    // Eksik alan varsa HATA FIRLAT - fallback yok!
    
    console.log('[AI] 📊 Parse edilen veri anahtarları:', Object.keys(parsed))
    
    // ZORUNLU ALAN: estimatedValue
    if (!parsed.estimatedValue) {
      console.error('[AI] ❌ HATA: estimatedValue alanı AI yanıtında YOK!')
      throw new Error('AI_INCOMPLETE_RESPONSE: Tahmini değer bilgisi alınamadı. Lütfen tekrar deneyin.')
    }
    
    // ZORUNLU ALAN: görselAnaliz (eğer görsel varsa)
    if (hasImages && (!parsed.görselAnaliz || parsed.görselAnaliz.yapıldıMı === false)) {
      console.error('[AI] ❌ HATA: Görsel yüklendi ama görselAnaliz yapılmadı!')
      throw new Error('AI_VISUAL_ANALYSIS_FAILED: Görsel analizi yapılamadı. Lütfen tekrar deneyin.')
    }
    
    // ZORUNLU ALAN: değerHesaplama veya piyasaAnalizi
    if (!parsed.değerHesaplama && !parsed.piyasaAnalizi) {
      console.error('[AI] ❌ HATA: Değer hesaplama veya piyasa analizi eksik!')
      throw new Error('AI_INCOMPLETE_RESPONSE: Değer analizi eksik. Lütfen tekrar deneyin.')
    }
    
    // Görsel analizi yapıldıysa logla
    if (hasImages && parsed.görselAnaliz?.yapıldıMı) {
      console.log('[AI] ✅ Görsel analiz BAŞARILI:')
      console.log('   - Boya Durumu:', parsed.görselAnaliz.boyaDurumu?.genelDurum)
      console.log('   - Kaporta Durumu:', parsed.görselAnaliz.kaportaDurumu?.genelDurum)
      console.log('   - Toplam Görsel Etki:', parsed.görselAnaliz.toplamGörselEtki)
    }

    console.log('[AI] ✅ Değer tahmini validation başarılı - GERÇEK AI VERİSİ')
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
    
    console.log('[AI] estimateValue metodu çağrıldı')
    
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

