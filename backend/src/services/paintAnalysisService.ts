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
import { AIHelpers } from '../utils/aiRateLimiter'
import { logAiAnalysis, logError, logInfo, logDebug, createTimer } from '../utils/logger'

// ===== TİP TANIMLARI =====

/**
 * Boya Analizi Sonucu Interface
 * 
 * Tüm boya analizi sonuçlarını içerir
 */
export interface PaintAnalysisResult {
  boyaDurumu: 'mükemmel' | 'iyi' | 'orta' | 'kötü' | 'kritik'  // Boya durumu
  boyaKalitesi: BoyaKalitesi                                     // Boya kalitesi
  renkAnalizi: RenkAnalizi                                       // Renk analizi
  yüzeyAnalizi: YüzeyAnalizi                                     // Yüzey analizi
  boyaKusurları: BoyaKusurları                                   // Boya kusurları (sadece yüzey kusurları)
  teknikDetaylar: TeknikDetaylar                                 // Teknik detaylar
  öneriler: BoyaÖnerileri                                        // Öneriler
  maliyetTahmini: MaliyetTahmini                                 // Maliyet tahmini
  aiSağlayıcı: string                                            // AI sağlayıcı
  model: string                                                  // AI model
  güvenSeviyesi: number                                          // Güven seviyesi (0-100)
  analizZamanDamgası: string                                     // Analiz zamanı (ISO)
}

/**
 * Boya Kalitesi Interface
 * 
 * Boyanın genel kalite metrikleri
 */
export interface BoyaKalitesi {
  genelPuan: number             // Genel puan (0-100)
  parlaklıkSeviyesi: number     // Parlaklık seviyesi (0-100)
  pürüzsüzlük: number           // Pürüzsüzlük (0-100)
  tekdüzelik: number            // Tekdüzelik (0-100)
  yapışma: number               // Yapışma (0-100)
  dayanıklılık: number          // Dayanıklılık (0-100)
  havaDirenci: number           // Hava koşullarına direnç (0-100)
  uvKoruması: number            // UV koruma (0-100)
}

/**
 * Renk Analizi Interface
 * 
 * Boyanın renk özellikleri
 */
export interface RenkAnalizi {
  renkKodu: string              // Renk kodu (örn: "1G3")
  renkAdı: string               // Renk adı (örn: "Gümüş Metalik")
  renkAilesi: string            // Renk ailesi (örn: "Gümüş")
  metalik: boolean              // Metalik mi?
  inci: boolean                 // Perle mi?
  renkEşleşmesi: number         // Renk eşleşmesi (0-100)
  renkTutarlılığı: number       // Renk tutarlılığı (0-100)
  renkDerinliği: number         // Renk derinliği (0-100)
  renkCanlılığı: number         // Renk canlılığı (0-100)
  renkSolması: number           // Renk solması (0-100)
  renkKayması: number           // Renk kayması (0-100)
  orijinalRenk: boolean         // Orijinal renk mi?
  boyaTespitEdildi: boolean     // Boya tespit edildi mi?
  renkGeçmişi: string[]         // Renk geçmişi
}

/**
 * Yüzey Analizi Interface
 * 
 * Boya yüzeyi ve kalınlık ölçümleri
 */
export interface YüzeyAnalizi {
  boyaKalınlığı: number         // Boya kalınlığı (mikron)
  astarKalınlığı: number        // Astar kalınlığı (mikron)
  bazKatKalınlığı: number       // Baz kat kalınlığı (mikron)
  vernikKalınlığı: number       // Vernik kalınlığı (mikron)
  toplamKalınlık: number        // Toplam kalınlık (mikron)
  kalınlıkTekdüzeliği: number   // Kalınlık tekdüzeliği (0-100)
  yüzeyPürüzlülüğü: number      // Yüzey pürüzlülüğü (0-100)
  portakalKabuğu: number        // Portakal kabuğu efekti (0-100)
  akıntılar: number             // Akıntı (0-100)
  sarkmalar: number             // Sarkma (0-100)
  kir: number                   // Kirlilik (0-100)
  kontaminasyon: number         // Kontaminasyon (0-100)
  yüzeyKusurları: YüzeyKusuru[] // Yüzey kusurları
}

/**
 * Yüzey Kusuru Interface
 * 
 * Tespit edilen yüzey kusurları
 */
export interface YüzeyKusuru {
  id: string                                                        // Kusur ID'si
  tür: 'portakal_kabuğu' | 'akıntı' | 'sarkma' | 'kir' | 'kontaminasyon' | 'balık_gözü' | 'krater' | 'kabarcık' | 'çatlak' | 'soyulma'
  şiddet: 'minimal' | 'düşük' | 'orta' | 'yüksek' | 'kritik'       // Şiddet
  konum: string                                                     // Konum
  boyut: number                                                     // Boyut (cm²)
  açıklama: string                                                  // Açıklama
  onarılabilir: boolean                                             // Onarılabilir mi?
  onarımMaliyeti: number                                            // Onarım maliyeti (TL)
}

/**
 * Boya Kusurları Interface (Sadece Yüzey Kusurları)
 * 
 * Fiziksel hasar değil, sadece boya kalitesi kusurları
 */
export interface BoyaKusurları {
  yüzeyKusurları: YüzeyKusuru[]         // Yüzey kusurları (portakal kabuğu, akıntı, sarkma)
  renkSorunları: RenkSorunu[]           // Renk sorunları (solma, lekelenme, uyumsuzluk)
  parlaklıkSorunları: ParlaklıkSorunu[] // Parlaklık sorunları
  kalınlıkDeğişimleri: KalınlıkDeğişimi[] // Kalınlık değişimleri
  toplamKusurPuanı: number              // Toplam kusur puanı (0-100)
}

// Eksik interface'leri ekle
export interface RenkSorunu {
  id: string
  tür: string
  şiddet: string
  konum: string
  açıklama: string
  onarılabilir: boolean
  onarımMaliyeti: number
}

export interface ParlaklıkSorunu {
  id: string
  tür: string
  şiddet: string
  konum: string
  açıklama: string
  onarılabilir: boolean
  onarımMaliyeti: number
}

export interface KalınlıkDeğişimi {
  id: string
  tür: string
  şiddet: string
  konum: string
  kalınlık: number
  açıklama: string
  onarılabilir: boolean
  onarımMaliyeti: number
}

// Fiziksel hasar interface'leri kaldırıldı - bunlar hasar analizi raporunda olacak

/**
 * Teknik Detaylar Interface
 * 
 * Boya sistemi ve uygulama detayları
 */
export interface TeknikDetaylar {
  boyaSistemi: string           // Boya sistemi (örn: "3 Katlı Sistem")
  astarTürü: string             // Astar türü
  bazKat: string                // Baz kat
  vernik: string                // Vernik
  boyaMarkası: string           // Boya markası
  boyaTürü: string              // Boya türü
  uygulamaYöntemi: string       // Uygulama yöntemi
  kurutmaYöntemi: string        // Kurutma yöntemi
  boyaYaşı: number              // Boya yaşı (yıl)
  sonBoya: number               // Son boya (yıl)
  boyaKatmanSayısı: number      // Boya katman sayısı
  kaliteSınıfı: 'OEM' | 'aftermarket' | 'unknown'  // Kalite sınıfı
}

/**
 * Boya Önerileri Interface
 * 
 * Bakım ve iyileştirme önerileri
 */
export interface BoyaÖnerileri {
  acil: string[]                // Acil öneriler
  kısaVadeli: string[]          // Kısa vadeli öneriler
  uzunVadeli: string[]          // Uzun vadeli öneriler
  bakım: string[]               // Bakım önerileri
  koruma: string[]              // Koruma önerileri
  restorasyon: string[]         // Restorasyon önerileri
  önleme: string[]              // Önleme önerileri
}

/**
 * Boya Maliyet Tahmini Interface
 * 
 * Detaylı maliyet kırılımı ve zaman çizelgesi
 */
export interface MaliyetTahmini {
  toplamMaliyet: number         // Toplam maliyet (TL)
  işçilikMaliyeti: number       // İşçilik maliyeti (TL)
  malzemeMaliyeti: number       // Malzeme maliyeti (TL)
  hazırlıkMaliyeti: number      // Hazırlık maliyeti (TL)
  boyaMaliyeti: number          // Boya maliyeti (TL)
  vernikMaliyeti: number        // Vernik maliyeti (TL)
  ekMaliyetler: number          // Ek maliyetler (TL)
  maliyetKırılımı: {            // Maliyet detayı
    kategori: string            // Kategori
    maliyet: number             // Maliyet (TL)
    açıklama: string            // Açıklama
  }[]
  zamanÇizelgesi: {             // Zaman çizelgesi
    faz: string                 // Faz
    süre: number                // Süre (saat)
    açıklama: string            // Açıklama
  }[]
  garanti: {                    // Garanti
    kapsam: boolean             // Kapsam
    süre: string                // Süre
    koşullar: string[]          // Koşullar
  }
}

// ===== SERVİS =====

/**
 * OpenAI Model Seçimi
 * 
 * Environment variable'dan model adı alınır, yoksa default kullanılır
 */
const OPENAI_MODEL = process.env.OPENAI_PAINT_MODEL ?? 'gpt-4o'

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
      console.log('🔑 OpenAI API Key kontrolü:', {
        hasKey: !!openaiApiKey,
        keyLength: openaiApiKey?.length || 0,
        keyPrefix: openaiApiKey?.substring(0, 10) || 'YOK'
      })
      
      if (openaiApiKey) {
        this.openaiClient = new OpenAI({ 
          apiKey: openaiApiKey,
          timeout: 120000, // 120 saniye (2 dakika) timeout - trafik yoğunluğu için yeterli
          maxRetries: 3 // Maksimum 3 deneme (retry mekanizması)
        })
        console.log('[AI] ✅ OpenAI Boya Analizi servisi hazırlandı (timeout: 120s, maxRetries: 3)')
      } else {
        console.error('[AI] ❌ OPENAI_API_KEY tanımlı değil!')
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
    try {
      logDebug('Converting image to base64', {
        imagePathType: typeof imagePath,
        imagePathLength: imagePath?.length,
        startsWithData: imagePath?.startsWith('data:image/'),
        startsWithBase64: imagePath?.startsWith('/9j/'),
        isLongString: imagePath?.length > 1000
      })

      // Eğer imagePath zaten base64 string ise, direkt döndür
      if (imagePath.startsWith('data:image/') || imagePath.startsWith('/9j/') || imagePath.length > 1000) {
        // Base64 string'i temizle (data:image/... prefix'ini kaldır)
        const base64Data = imagePath.includes(',') ? imagePath.split(',')[1] : imagePath
        logDebug('Using existing base64 data', { base64Length: base64Data?.length })
        return base64Data
      }

      // Dosya yolu ise, dosyayı oku
      logDebug('Reading image file', { filePath: imagePath })
      const buffer = await fs.readFile(imagePath)
      const optimized = await sharp(buffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 95 })
        .toBuffer()

      const base64Result = optimized.toString('base64')
      logDebug('File converted to base64', { base64Length: base64Result?.length })
      return base64Result
    } catch (error) {
      logError('Failed to convert image to base64', error, {
        imagePathType: typeof imagePath,
        imagePathLength: imagePath?.length,
        imagePathPreview: imagePath?.substring(0, 100)
      })
      console.error('❌ Failed to convert image to base64:', error)
      console.error('ImagePath type:', typeof imagePath, 'Length:', imagePath?.length)
      throw new Error('Image file could not be read')
    }
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
    const vehicleContext = vehicleInfo 
      ? `Araç Bilgileri: ${vehicleInfo.make} ${vehicleInfo.model} (${vehicleInfo.year}) - Plaka: ${vehicleInfo.plate}`
      : 'Araç bilgileri belirtilmemiş'

    return `Sen uzman bir araç boya analiz ustasısın. Görseli analiz et ve MUTLAKA GEÇERLİ JSON formatında yanıt ver. Hiçbir ek açıklama, markdown veya metin ekleme.

${vehicleContext}

Görseli analiz et ve aşağıdaki JSON formatında yanıt ver:

{
  "araçÖzeti": {
    "marka": "string",
    "model": "string", 
    "yıl": "number",
    "plaka": "string"
  },
  "boyaDurumu": {
    "genelDurum": "mükemmel|iyi|orta|kötü",
    "hasarVar": true|false,
    "çizikVar": true|false,
    "çukurVar": true|false,
    "pasVar": true|false,
    "boyaKalınlığı": "normal|kalın|ince"
  },
  "boyaKalitesi": {
    "genelSkor": 0-100,
    "parlaklık": 0-100,
    "düzgünlük": 0-100,
    "renkEşleşmesi": 0-100,
    "kalite": "mükemmel|iyi|orta|kötü"
  },
  "hasarAlanları": [
    {
      "bölge": "ön|arka|sol|sağ|tavan|kaput|bagaj",
      "tür": "çizik|çukur|pas|boyaKaybı|çatlak",
      "şiddet": "hafif|orta|ağır",
      "boyut": "küçük|orta|büyük",
      "açıklama": "string",
      "onarımMaliyeti": 0-10000,
      "etkilenenParçalar": ["string"],
      "güven": 0-100
    }
  ],
  "genelDeğerlendirme": "string",
  "teknikAnaliz": "string",
  "güvenlikDeğerlendirmesi": "string",
  "onarımTahmini": {
    "toplamMaliyet": 0-10000,
    "süre": "string",
    "öncelik": "düşük|orta|yüksek"
  },
  "güven": 0-100,
  "analizZamanı": "ISO string"
}

KRİTİK: Sadece JSON yanıt ver, başka hiçbir metin ekleme! Eğer görselde araç yoksa bile JSON formatında yanıt ver!`
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
    // Önce tam JSON olup olmadığını kontrol et
    try {
      return JSON.parse(rawText.trim())
    } catch {
      // JSON değilse, içinden JSON çıkarmaya çalış
      const start = rawText.indexOf('{')
      const end = rawText.lastIndexOf('}')
      if (start === -1 || end === -1 || end <= start) {
        throw new Error('AI yanıtından JSON verisi alınamadı')
      }
      const json = rawText.slice(start, end + 1)
      return JSON.parse(json)
    }
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
  private static async analyzePaintWithOpenAI(imagePath: string, vehicleInfo?: any, reportId?: number, userId?: number): Promise<PaintAnalysisResult> {
    if (!this.openaiClient) {
      throw new Error('OpenAI istemcisi kullanılabilir değil')
    }

    try {
      logAiAnalysis('PAINT_ANALYZE_START', '', {
        imagePathType: typeof imagePath,
        imagePathLength: imagePath?.length,
        imagePathPreview: imagePath?.substring(0, 100),
        vehicleInfo,
        timestamp: new Date().toISOString(),
      })

      console.log('🎨 Starting paint analysis for:', imagePath?.substring(0, 100) + '...')

      // Görseli base64'e çevir
      const imageBase64 = await this.convertImageToBase64(imagePath)

      logDebug('Image converted to base64', {
        base64Length: imageBase64?.length,
        isBase64: imageBase64?.startsWith('/9j/') || imageBase64?.startsWith('iVBOR'),
        base64Preview: imageBase64?.substring(0, 50)
      })

      const prompt = `${this.buildPrompt(vehicleInfo)}\nLütfen tüm sayısal değerleri sayı olarak döndür.`

      logDebug('OpenAI API call starting', {
        model: OPENAI_MODEL,
        promptLength: prompt.length,
        hasImage: !!imageBase64,
        imageSize: imageBase64?.length
      })

      // OpenAI Vision API çağrısı - Monitoring ile
      const { wrapOpenAIRequest } = await import('../utils/openAIMonitor')
      const requiredFields = ['boyaKalitesi', 'renkAnalizi', 'yüzeyAnalizi']
      
      console.log('📡 OpenAI Request Gönderiliyor:', {
        reportId,
        userId,
        model: OPENAI_MODEL,
        hasImage: !!imageBase64,
        imageSize: imageBase64?.length
      })
      
      const response = await wrapOpenAIRequest(
        'paint-analysis',
        OPENAI_MODEL,
        () => AIHelpers.callVision(() =>
          this.openaiClient!.chat.completions.create({
            model: OPENAI_MODEL,
            temperature: 0.1, // Düşük temperature = tutarlı sonuçlar
            messages: [
              {
                role: 'system',
                content: 'Sen deneyimli bir otomotiv boya uzmanısın. Yüksek kaliteli görüntüleri analiz ederek detaylı boya analizi yaparsın. Çıktıyı geçerli JSON olarak üret. Tüm metinler Türkçe olmalı.'
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
        ),
        reportId,
        userId,
        requiredFields
      )
      
      console.log('📥 OpenAI Response Alındı:', {
        hasResponse: !!response,
        hasChoices: !!response.choices,
        choicesLength: response.choices?.length
      })

      logDebug('OpenAI API response received', {
        hasChoices: !!response.choices,
        choicesLength: response.choices?.length,
        hasMessage: !!response.choices?.[0]?.message,
        hasContent: !!response.choices?.[0]?.message?.content,
        contentLength: response.choices?.[0]?.message?.content?.length
      })

      // Yanıtı al
      const text = response.choices?.[0]?.message?.content
      if (!text) {
        logError('OpenAI returned empty response', new Error('Empty response'), {
          response: JSON.stringify(response, null, 2)
        })
        throw new Error('OpenAI yanıtı boş geldi')
      }

      console.log('📝 OpenAI response received, parsing JSON...')

      // JSON'u parse et
      let parsed: any
      try {
        parsed = this.extractJsonPayload(text)
        logDebug('JSON parsing successful', {
          parsedKeys: Object.keys(parsed),
          hasBoyaDurumu: !!parsed.boyaDurumu,
          hasBoyaKalitesi: !!parsed.boyaKalitesi,
          hasRenkAnalizi: !!parsed.renkAnalizi
        })
        console.log('✅ JSON parsing successful')
      } catch (parseError) {
        logError('JSON parsing failed', parseError, {
          rawResponse: text.substring(0, 500),
          responseLength: text.length
        })
        console.error('❌ JSON parsing failed:', parseError)
        console.error('Raw response:', text.substring(0, 500))
        throw new Error('Invalid JSON response from OpenAI')
      }

      // SIKI VALİDASYON: Zorunlu alanları kontrol et
      if (!parsed.boyaKalitesi) {
        throw new Error('AI analiz sonucu eksik. Boya kalitesi bilgisi alınamadı.')
      }

      if (!parsed.renkAnalizi) {
        throw new Error('AI analiz sonucu eksik. Renk analizi bilgisi alınamadı.')
      }

      if (!parsed.yüzeyAnalizi) {
        throw new Error('AI analiz sonucu eksik. Yüzey analizi bilgisi alınamadı.')
      }

      // Güven seviyesi kontrolü
      if (parsed.güvenSeviyesi === undefined || parsed.güvenSeviyesi === null) {
        throw new Error('AI analiz sonucu eksik. Güven seviyesi bilgisi alınamadı.')
      }

      // Add metadata
      const result: PaintAnalysisResult = {
        ...parsed,
        aiSağlayıcı: 'OpenAI',
        model: OPENAI_MODEL,
        güvenSeviyesi: parsed.güvenSeviyesi,
        analizZamanDamgası: new Date().toISOString()
      }

      logAiAnalysis('PAINT_ANALYZE_SUCCESS', '', {
        resultKeys: Object.keys(result),
        boyaDurumu: result.boyaDurumu,
        timestamp: new Date().toISOString()
      })

      console.log('🎉 Paint analysis completed successfully')
      return result

    } catch (error) {
      logError('Paint analysis failed', error, {
        imagePathType: typeof imagePath,
        imagePathLength: imagePath?.length,
        imagePathPreview: imagePath?.substring(0, 100),
        vehicleInfo,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorName: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString(),
      })
      console.error('💥 Paint analysis failed:', error)
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
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
  static async analyzePaint(imagePath: string, vehicleInfo?: any, reportId?: number, userId?: number): Promise<PaintAnalysisResult> {
    await this.initialize()

    try {
      logAiAnalysis('PAINT_START', '', {
        imagePathType: typeof imagePath,
        imagePathLength: imagePath?.length,
        imagePathPreview: imagePath?.substring(0, 100),
        vehicleInfo,
        timestamp: new Date().toISOString(),
      })

      // Cache kontrolü
      const cacheKey = await this.getImageHash(imagePath)
      const cached = this.cache.get(cacheKey)
      if (cached) {
        logDebug('Paint analysis cache hit', { cacheKey: cacheKey.substring(0, 10) + '...' })
        console.log('[AI] Boya analizi cache üzerinden döndürüldü')
        return cached
      }

      console.log('[AI] OpenAI ile boya analizi başlatılıyor...')
      
      // OpenAI analizi
      const result = await this.analyzePaintWithOpenAI(imagePath, vehicleInfo, reportId, userId)
      
      console.log('[AI] OpenAI boya analizi başarılı!')
      
      // Cache'e kaydet
      this.cache.set(cacheKey, result)
      
      logAiAnalysis('PAINT_SUCCESS', '', {
        resultKeys: Object.keys(result),
        boyaDurumu: result.boyaDurumu,
        timestamp: new Date().toISOString()
      })

      return result
    } catch (error) {
      logError('Paint analysis failed', error, {
        imagePathType: typeof imagePath,
        imagePathLength: imagePath?.length,
        imagePathPreview: imagePath?.substring(0, 100),
        vehicleInfo,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorName: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString(),
      })
      console.error('[AI] OpenAI boya analizi HATASI:', error)
      throw new Error('OpenAI boya analizi başarısız oldu.')
    }
  }

}
