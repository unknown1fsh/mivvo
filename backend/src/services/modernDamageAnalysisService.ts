import OpenAI from 'openai'
import fs from 'fs/promises'
import path from 'path'
import { logAiAnalysis, logError, logDebug } from '../utils/logger'

// ===== TYPES =====
export interface DamageAnalysisResult {
  araçÖzeti: {
    model: string
    yakıt: string
    darbeninYönü: string
    darbeninŞiddeti: string
    genelDurum: string
  }
  görselHasarAnalizi: Array<{
    bölge: string
    durum: string
    muhtemelParça: string
  }>
  teknikDurum: {
    yapısalDeformasyon: boolean
    şasiHasarı: boolean
    monokokBütünlük: string
    açıklama: string
    ekspertizSonucu: string
  }
  türkiye2025TamirMaliyeti: {
    toplamMaliyet: number
    gerçekçiToplam: number
    maliyetKırılımı: Array<{
      işlem: string
      maliyet: number
    }>
  }
  sigortaPiyasaDeğerlendirmesi: {
    kaskoDeğeri: number
    hasarOranı: number
    pertSatışDeğeri: number
    sigortaKararı: string
    onarımSonrasıPiyasaDeğeri: number
    değerKaybı: number
  }
  ustaYorumu: {
    genelDeğerlendirme: string
    sonuç: string
    açıklama: string
  }
  kararÖzeti: {
    hasarTipi: string
    tahminiTamirBedeli: number
    pertOlasılığı: number
    onarımSonrasıGüvenlik: string
    satışaDeğerMi: string
  }
  hasarAlanları: Array<{
    id: string
    x: number
    y: number
    genişlik: number
    yükseklik: number
    tip: string
    şiddet: string
    açıklama: string
    bölge: string
    onarımMaliyeti: number
    etkilenenParçalar: string[]
    onarımÖnceliği: string
    güvenlikEtkisi: string
    onarımYöntemi: string
    tahminiOnarımSüresi: number
    garantiEtkisi: boolean
    sigortaKapsamı: string
  }>
  aiSağlayıcı: string
  model: string
  güven: number
  analizZamanı: string
}

// ===== CONFIGURATION =====
const OPENAI_MODEL = 'gpt-4o'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required')
}

// ===== MAIN SERVICE =====
export class ModernDamageAnalysisService {
  private static openaiClient: OpenAI | null = null
  private static isInitialized = false

  static async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.openaiClient = new OpenAI({
        apiKey: OPENAI_API_KEY,
        timeout: 120000, // 120 saniye (2 dakika) timeout - trafik yoğunluğu için yeterli
        maxRetries: 3 // Maksimum 3 deneme (retry mekanizması)
      })
      this.isInitialized = true
      console.log('🚀 ModernDamageAnalysisService initialized successfully (timeout: 120s, maxRetries: 3)')
    } catch (error) {
      console.error('❌ Failed to initialize ModernDamageAnalysisService:', error)
      throw new Error('OpenAI API key not found or invalid')
    }
  }

  static async analyzeImage(imagePath: string, vehicleInfo?: any): Promise<DamageAnalysisResult> {
    await this.initialize()

    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized')
    }

    try {
      logAiAnalysis('ANALYZE_START', '', {
        imagePathType: typeof imagePath,
        imagePathLength: imagePath?.length,
        imagePathPreview: imagePath?.substring(0, 100),
        vehicleInfo,
        timestamp: new Date().toISOString(),
      })
      
      console.log('🔍 Starting damage analysis for:', imagePath?.substring(0, 100) + '...')
      
      // Convert image to base64
      const imageBase64 = await this.convertImageToBase64(imagePath)
      
      logDebug('Image converted to base64', {
        base64Length: imageBase64?.length,
        isBase64: imageBase64?.startsWith('/9j/') || imageBase64?.startsWith('iVBOR'),
        base64Preview: imageBase64?.substring(0, 50)
      })
      
      // Build prompt
      const prompt = this.buildPrompt(vehicleInfo)
      
      logDebug('OpenAI API call starting', {
        model: OPENAI_MODEL,
        promptLength: prompt.length,
        hasImage: !!imageBase64,
        imageSize: imageBase64?.length
      })
      
      // Call OpenAI API
      const response = await this.openaiClient.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Sen uzman bir araç expertiz ustasısın. Görseli analiz et ve SADECE GEÇERLİ JSON formatında yanıt ver. Hiçbir ek açıklama, markdown veya metin ekleme.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high'
                } 
              }
            ]
          }
        ]
      })

      logDebug('OpenAI API response received', {
        hasChoices: !!response.choices,
        choicesLength: response.choices?.length,
        hasMessage: !!response.choices?.[0]?.message,
        hasContent: !!response.choices?.[0]?.message?.content,
        contentLength: response.choices?.[0]?.message?.content?.length
      })

      const text = response.choices?.[0]?.message?.content
      if (!text) {
        logError('OpenAI returned empty response', new Error('Empty response'), {
          response: JSON.stringify(response, null, 2)
        })
        throw new Error('OpenAI returned empty response')
      }

      console.log('📝 OpenAI response received, parsing JSON...')
      
      // Parse JSON response
      let parsed: any
      try {
        parsed = JSON.parse(text)
        logDebug('JSON parsing successful', {
          parsedKeys: Object.keys(parsed),
          hasAraçÖzeti: !!parsed.araçÖzeti,
          hasHasarAlanları: !!parsed.hasarAlanları,
          hasarAlanlarıLength: parsed.hasarAlanları?.length
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

      // Validate required fields
      this.validateResponse(parsed)

      // Add metadata
      const result: DamageAnalysisResult = {
        ...parsed,
        aiSağlayıcı: 'OpenAI',
        model: OPENAI_MODEL,
        güven: parsed.güven || 95,
        analizZamanı: new Date().toISOString()
      }

      logAiAnalysis('ANALYZE_SUCCESS', '', {
        resultKeys: Object.keys(result),
        hasarAlanlarıCount: result.hasarAlanları?.length || 0,
        timestamp: new Date().toISOString()
      })

      console.log('🎉 Damage analysis completed successfully')
      return result

    } catch (error) {
      logError('Damage analysis failed', error, {
        imagePathType: typeof imagePath,
        imagePathLength: imagePath?.length,
        imagePathPreview: imagePath?.substring(0, 100),
        vehicleInfo,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorName: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString(),
      })
      console.error('💥 Damage analysis failed:', error)
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

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
      const imageBuffer = await fs.readFile(imagePath)
      const base64Result = imageBuffer.toString('base64')
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

  private static buildPrompt(vehicleInfo?: any): string {
    const vehicleContext = vehicleInfo ? `
ARAÇ BİLGİLERİ:
- Marka: ${vehicleInfo.make || 'Bilinmiyor'}
- Model: ${vehicleInfo.model || 'Bilinmiyor'}
- Yıl: ${vehicleInfo.year || 'Bilinmiyor'}
- Plaka: ${vehicleInfo.plate || 'Bilinmiyor'}

Bu araç bilgilerini göz önünde bulundurarak hasar analizi yap.` : ''

    return `Sen DENEYİMLİ bir araç EXPERTİZ USTASISIN. Görseli DİKKATLİCE analiz et ve SADECE GEÇERLİ JSON formatında yanıt ver. Hiçbir ek açıklama, markdown veya metin ekleme.

🎯 KRITIK: Yanıtın SADECE JSON olmalı, başka hiçbir şey olmamalı!

${vehicleContext}

🚨 HASAR TESPİTİ - EN ÖNEMLİ GÖREV:
Görseldeki HER HASARI tespit et! Özellikle şunları kontrol et:
- ÖN/ARKA TAMPON: Çatlak, kırık, parçalanma, ezilme var mı?
- KAPUT/BAGAJ: Çökme, ezilme, deformasyon, boya hasarı var mı?
- ÇAMURLUKLAR (Ön/Sağ/Sol/Arka): Çökme, ezilme, çizik, boya hasarı var mı?
- KAPILAR: Çökme, çizik, boya hasarı, hizalama sorunu var mı?
- Farlar/Camlar: Kırık, çatlak, eksik far/stop var mı?
- YAN PANELLER: Çökme, ezilme, çizik var mı?
- TAVAN/BAGAJ KAPAĞI: Çökme, ezilme, boya hasarı var mı?
- ŞASİ/YAPISAL: Gözle görülen deformasyon, şasi hasarı var mı?

⚠️ HASAR TESPİT KURALI: En küçük çizikten en büyük çökmeye kadar HER HASARI hasarAlanları array'ine ekle!

📋 EXPERTİZ USTASI ANALİZ KURALLARI:

1. **ARAÇ ÖZETİ**: Model, yakıt tipi, darbenin yönü ve şiddeti (detaylı)
2. **GÖRSEL HASAR ANALİZİ**: Tablo formatında bölge, durum, muhtemel parça/işlem (TÜM HASARLAR)
3. **TEKNİK DURUM**: Yapısal deformasyon, şasi hasarı, monokok bütünlük analizi (gerçekçi değerlendirme)
4. **TÜRKİYE 2025 MALİYET HESAPLAMA**: Detaylı tamir maliyeti tablosu (gerçekçi fiyatlar)
5. **SİGORTA & PİYASA DEĞERLENDİRMESİ**: Kasko değeri, pert durumu, piyasa etkisi
6. **USTA YORUMU**: Profesyonel görüş ve öneriler (detaylı açıklama)
7. **KARAR ÖZETİ**: Hasar tipi, tamir bedeli, pert olasılığı, güvenlik, satış değeri

💰 TÜRKİYE 2025 GÜNCEL MALİYETLER:
- Arka panel + çamurluk kesme-kaynak: 40.000 TL
- Tavan değişimi: 35.000 TL
- Sol arka kapı: 15.000 TL
- Bagaj kapağı + tampon + iç sac: 30.000 TL
- Boya (arka + sol taraf): 25.000 TL
- Batarya muhafaza + bağlantılar: 50.000 TL
- Şasi düzeltme hattı + ölçü: 20.000 TL
- İç döşeme + cam + işçilik: 15.000 TL
- Çamurluk değişimi + boya: 15.000-25.000 TL
- Far grubu değişimi: 8.000-15.000 TL
- Tampon değişimi + boya: 10.000-18.000 TL
- Kaput düzeltme + boya: 12.000-20.000 TL
- Kapı düzeltme + boya: 8.000-15.000 TL
- Cam değişimi: 3.000-8.000 TL
- Ayna değişimi: 2.000-5.000 TL
- Jant değişimi: 3.000-8.000 TL

🔍 ÇIKTI FORMATI (Sadece geçerli JSON döndür, TAMAMEN TÜRKÇE FIELD İSİMLERİ):

⚠️ ÖNEMLİ: Aşağıdaki tüm field'ları MUTLAKA dahil et:
- araçÖzeti (zorunlu)
- görselHasarAnalizi (zorunlu) 
- teknikDurum (zorunlu)
- türkiye2025TamirMaliyeti (zorunlu)
- sigortaPiyasaDeğerlendirmesi (zorunlu)
- ustaYorumu (zorunlu)
- kararÖzeti (zorunlu)
- hasarAlanları (zorunlu - MUTLAKA hasar tespit et, görünen her hasarı ekle)

🚨 KRİTİK HASAR TESPİT KURALLARI:
- Görselde HERHANGİ BİR HASAR GÖRÜRSEN (çizik, çökme, parçalanma, kırık, ezilme, boya hasarı vb.) MUTLAKA hasarAlanları array'ine ekle
- Özellikle ön/arka tampon, kaput, çamurluk, kapı, cam, far gibi parçalarda hasar var mı DİKKATLE kontrol et
- Her hasar için: id, x, y, genişlik, yükseklik, tip, şiddet, açıklama, bölge, onarımMaliyeti, etkilenenParçalar MUTLAKA belirt
- Eğer hasar VARDIRSA hasarAlanları array'i MUTLAKA dolu olmalı (boş array ASLA döndürme)
- Sadece araç TAMAMEN HASARSIZ ve FABRİKA ÇIKIŞI gibi ise hasarAlanları boş olabilir

{
  "araçÖzeti": {
    "model": "Toyota Corolla Hybrid (2020-2022)",
    "yakıt": "Hibrit",
    "darbeninYönü": "Arka-sol tavan hattına kadar uzanan ezilme",
    "darbeninŞiddeti": "arka-yan çökme seviyesinde",
    "genelDurum": "tamir edilir sınıfından çıkmış, yapı deformasyonu yaşamış"
  },
  "görselHasarAnalizi": [
    {
      "bölge": "Arka Tampon & Bagaj Kapağı",
      "durum": "Tamamen ezilmiş, iç travers görünüyor",
      "muhtemelParça": "Yeni tampon, bagaj kapağı, iç sac"
    }
  ],
  "teknikDurum": {
    "yapısalDeformasyon": true,
    "şasiHasarı": true,
    "monokokBütünlük": "bozulmuş",
    "açıklama": "Bu araçta arka şasi uzantısı + tavan hattı + batarya bölmesi hasar aldığı için, bu monokok taşıyıcı yapı deformasyonu demektir.",
    "ekspertizSonucu": "Ağır hasarlı / ekonomik tamir dışı (pert)"
  },
  "türkiye2025TamirMaliyeti": {
    "toplamMaliyet": 300000,
    "gerçekçiToplam": 350000,
    "maliyetKırılımı": [
      {
        "işlem": "Arka panel + çamurluk kesme-kaynak",
        "maliyet": 40000
      }
    ]
  },
  "sigortaPiyasaDeğerlendirmesi": {
    "kaskoDeğeri": 1100000,
    "hasarOranı": 35,
    "pertSatışDeğeri": 400000,
    "sigortaKararı": "pert",
    "onarımSonrasıPiyasaDeğeri": 550000,
    "değerKaybı": 50
  },
  "ustaYorumu": {
    "genelDeğerlendirme": "Bu araç 'arka taşıyıcı + tavan hattı + batarya bölgesi' hasarı almış.",
    "sonuç": "Ekonomik tamir dışı (PERT)",
    "açıklama": "Bu araç, sigorta şirketi tarafından ihaleye çıkarılmış olmalı."
  },
  "kararÖzeti": {
    "hasarTipi": "Arka yapı deformasyonu + tavan çökmesi",
    "tahminiTamirBedeli": 300000,
    "pertOlasılığı": 100,
    "onarımSonrasıGüvenlik": "Düşük (tavan + şasi deformasyonu)",
    "satışaDeğerMi": "Yalnızca 'parça / donanım söküm' için"
  },
  "hasarAlanları": [
    {
      "id": "hasar-1",
      "x": 150,
      "y": 200,
      "genişlik": 120,
      "yükseklik": 80,
      "tip": "çökme",
      "şiddet": "kritik",
      "açıklama": "Ön sağ taraf ciddi çökme - kaput deformasyonu, tampon parçalanmış, sağ far yok",
      "bölge": "ön_sağ",
      "onarımMaliyeti": 45000,
      "etkilenenParçalar": ["Ön Tampon", "Sağ Çamurluk", "Kaput", "Sağ Far", "Radyatör Koruması"],
      "onarımÖnceliği": "acil",
      "güvenlikEtkisi": "yüksek",
      "onarımYöntemi": "Kaput değişimi + tampon değişimi + çamurluk tamiri + far montajı",
      "tahminiOnarımSüresi": 20,
      "garantiEtkisi": true,
      "sigortaKapsamı": "kasko"
    },
    {
      "id": "hasar-2",
      "x": 200,
      "y": 180,
      "genişlik": 80,
      "yükseklik": 60,
      "tip": "ezilme",
      "şiddet": "yüksek",
      "açıklama": "Kaput sağ tarafında ciddi ezilme ve deformasyon",
      "bölge": "ön_orta",
      "onarımMaliyeti": 18000,
      "etkilenenParçalar": ["Kaput"],
      "onarımÖnceliği": "yüksek",
      "güvenlikEtkisi": "orta",
      "onarımYöntemi": "Kaput değişimi veya komple tamiri",
      "tahminiOnarımSüresi": 10,
      "garantiEtkisi": false,
      "sigortaKapsamı": "kasko"
    }
  ]

⚠️ ÖNEMLİ: Yukarıdaki örnek sadece format göstergesidir. Gerçek görseldeki TÜM HASARLARI tespit et ve hasarAlanları array'ine ekle!
}`
  }

  private static validateResponse(parsed: any): void {
    const requiredFields = [
      'araçÖzeti',
      'görselHasarAnalizi', 
      'teknikDurum',
      'türkiye2025TamirMaliyeti',
      'sigortaPiyasaDeğerlendirmesi',
      'ustaYorumu',
      'kararÖzeti',
      'hasarAlanları'
    ]

    for (const field of requiredFields) {
      if (!parsed[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // hasarAlanları kontrolü - Array olmalı ama boş olabilir (hasarsız araçlar için)
    // Ancak bu durumda AI'dan açıkça "hasar yok" bilgisi gelmeli
    if (!Array.isArray(parsed.hasarAlanları)) {
      throw new Error('hasarAlanları must be an array')
    }

    // Eğer hasarAlanları boşsa, AI'dan "hasar yok" bilgisi kontrol et
    if (parsed.hasarAlanları.length === 0) {
      console.warn('⚠️ AI hasar alanı tespit etmedi - Bu hasarsız araç anlamına gelebilir veya AI analizi eksik olabilir')
      // Hasar yoksa bile diğer alanların dolu olması gerekiyor
      if (!parsed.kararÖzeti?.hasarTipi || !parsed.teknikDurum?.ekspertizSonucu) {
        console.error('❌ AI verisi eksik - hasar alanları boş ama diğer zorunlu alanlar da eksik')
        throw new Error('AI analiz sonucu eksik. Hasar tespiti yapılamadı ve diğer zorunlu alanlar da eksik.')
      }
    }

    console.log('✅ Response validation passed')
  }
}
