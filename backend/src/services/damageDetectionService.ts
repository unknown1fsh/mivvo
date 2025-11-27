/**
 * DamageDetectionService - ChatGPT Uyumlu Versiyon
 * 
 * Bu servis ChatGPT'nin verdiği response yapısına uygun olarak
 * uzman seviyesinde hasar analizi yapar.
 */

import OpenAI from 'openai'
import fs from 'fs/promises'
import { access } from 'fs/promises'
import { AIHelpers } from '../utils/aiRateLimiter'
import { parseAIResponse, checkMissingFields } from '../utils/jsonParser'

const OPENAI_MODEL = 'gpt-4o'

export interface DamageDetectionResult {
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
    tür: string
    şiddet: string
    güven: number
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
  genelDeğerlendirme: {
    hasarSeviyesi: string
    toplamOnarımMaliyeti: number
    sigortaDurumu: string
    piyasaDeğeriEtkisi: number
    detaylıAnaliz: string
    araçDurumu: string
    satışDeğeri: number
    değerKaybı: number
    güçlüYönler: string[]
    zayıfYönler: string[]
    öneriler: string[]
    güvenlikEndişeleri: string[]
  }
  teknikAnaliz: {
    yapısalBütünlük: string
    güvenlikSistemleri: string
    mekanikSistemler: string
    elektrikSistemleri: string
    gövdeHizalaması: string
    şasiHasarı: boolean
    havaYastığıAçılması: boolean
    emniyetKemeri: string
    notlar: string
  }
  güvenlikDeğerlendirmesi: {
    yolDurumu: string
    kritikSorunlar: string[]
    güvenlikÖnerileri: string[]
    incelemeGerekli: boolean
    acilAksiyonlar: string[]
    uzunVadeliEndişeler: string[]
  }
  onarımTahmini: {
    toplamMaliyet: number
    işçilikMaliyeti: number
    parçaMaliyeti: number
    boyaMaliyeti: number
    ekMaliyetler: number
    maliyetKırılımı: Array<{
      parça: string
      açıklama: string
      maliyet: number
    }>
    zamanÇizelgesi: Array<{
      faz: string
      süre: number
      açıklama: string
    }>
    garantiKapsamı: string
    önerilenServis: string
    acilOnarımGerekli: boolean
  }
  aiSağlayıcı: string
  model: string
  güven: number
  analizZamanı: string
}

export class DamageDetectionService {
  private static openaiClient: OpenAI | null = null
  private static isInitialized = false
  private static cache = new Map<string, DamageDetectionResult>()

  static async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      const openaiApiKey = process.env.OPENAI_API_KEY
      if (!openaiApiKey) {
        throw new Error('OpenAI API key bulunamadı')
      }
      
      this.openaiClient = new OpenAI({
        apiKey: openaiApiKey,
        timeout: 120000, // 120 saniye (2 dakika) timeout - trafik yoğunluğu için yeterli
        maxRetries: 3 // Maksimum 3 deneme (retry mekanizması)
      })
      this.isInitialized = true
      console.log('[AI] DamageDetectionService başlatıldı (timeout: 120s, maxRetries: 3)')
    } catch (error) {
      console.error('[AI] DamageDetectionService başlatılamadı:', error)
      throw new Error('OpenAI API key bulunamadı')
    }
  }

  private static buildPrompt(vehicleInfo?: any): string {
    const vehicleContext = vehicleInfo ? `Araç: ${vehicleInfo.make || ''} ${vehicleInfo.model || ''} (${vehicleInfo.year || ''})` : ''

    return `Araç hasar analizi uzmanısın. ${vehicleContext}

GÖREV: Görseli analiz et, hasarları tespit et ve aşağıdaki JSON formatını TAMAMEN doldur.

ÖNEMLİ KURALLAR:
1. SADECE JSON döndür (açıklama, markdown, ek metin YOK)
2. TÜM field'ları doldur (boş bırakma)
3. hasarAlanları en az 1 eleman içermeli
4. Maliyet tahmini Türkiye 2025 fiyatlarına göre (TL)
5. Türkçe field isimleri kullan

HASAR TİPLERİ: çizik, göçük, pas, oksidasyon, çatlak, kırılma, boya_hasarı, yapısal_hasar
ŞİDDET SEVİYELERİ: minimal, düşük, orta, yüksek, kritik

{
  "hasarAlanları": [{
    "id": "hasar-1",
    "x": 100, "y": 150, "genişlik": 80, "yükseklik": 60,
    "tür": "çizik",
    "şiddet": "düşük",
    "güven": 90,
    "açıklama": "Ön tampon sağ tarafta 15cm çizik",
    "bölge": "ön",
    "onarımMaliyeti": 5000,
    "etkilenenParçalar": ["Tampon"],
    "onarımÖnceliği": "orta",
    "güvenlikEtkisi": "yok",
    "onarımYöntemi": "Boya rötuşu",
    "tahminiOnarımSüresi": 2,
    "garantiEtkisi": false,
    "sigortaKapsamı": "tam"
  }],
  "genelDeğerlendirme": {
    "hasarSeviyesi": "iyi",
    "toplamOnarımMaliyeti": 5000,
    "sigortaDurumu": "onarılabilir",
    "piyasaDeğeriEtkisi": 5,
    "detaylıAnaliz": "Araçta hafif hasar tespit edildi",
    "araçDurumu": "hafif_hasar",
    "satışDeğeri": 95,
    "değerKaybı": 5,
    "güçlüYönler": ["Genel durum iyi"],
    "zayıfYönler": ["Tampon çizik"],
    "öneriler": ["Boya tamir edilebilir"],
    "güvenlikEndişeleri": []
  },
  "teknikAnaliz": {
    "yapısalBütünlük": "sağlam",
    "güvenlikSistemleri": "fonksiyonel",
    "mekanikSistemler": "çalışır",
    "elektrikSistemleri": "fonksiyonel",
    "gövdeHizalaması": "mükemmel",
    "şasiHasarı": false,
    "havaYastığıAçılması": false,
    "emniyetKemeri": "fonksiyonel",
    "notlar": "Genel durum iyi"
  },
  "güvenlikDeğerlendirmesi": {
    "yolDurumu": "güvenli",
    "kritikSorunlar": [],
    "güvenlikÖnerileri": ["Düzenli bakım"],
    "incelemeGerekli": false,
    "acilAksiyonlar": [],
    "uzunVadeliEndişeler": []
  },
  "onarımTahmini": {
    "toplamMaliyet": 5000,
    "işçilikMaliyeti": 2000,
    "parçaMaliyeti": 0,
    "boyaMaliyeti": 3000,
    "ekMaliyetler": 0,
    "maliyetKırılımı": [{"parça": "Tampon Boyası", "açıklama": "Boya rötuşu", "maliyet": 3000}],
    "zamanÇizelgesi": [{"faz": "Boya", "süre": 2, "açıklama": "Tampon boyama"}],
    "garantiKapsamı": "Var",
    "önerilenServis": "Yetkili servis",
    "acilOnarımGerekli": false
  },
  "aiSağlayıcı": "OpenAI",
  "model": "gpt-4o",
  "güven": 90,
  "analizZamanı": "2025-11-27T10:00:00Z"
}

TÜM field'ları doldur. Türkiye fiyatları kullan (çizik: 3-8bin, göçük: 8-20bin, panel: 15-40bin TL).`
  }

  private static async convertImageToBase64(imagePath: string): Promise<string> {
    try {
      // Resim yolunu kontrol et
      if (!imagePath || typeof imagePath !== 'string') {
        throw new Error('Geçersiz resim yolu');
      }

      // Eğer zaten base64 data URL formatındaysa, base64 kısmını çıkar
      if (imagePath.startsWith('data:image/')) {
        const base64Match = imagePath.match(/base64,(.+)/);
        if (base64Match && base64Match[1]) {
          console.log('[AI] Resim zaten base64 formatında - direkt kullanılıyor');
          return base64Match[1];
        }
      }

      // Normal dosya yolu ise (eski yaklaşım için backward compatibility)
      const exists = await access(imagePath).then(() => true).catch(() => false);
      if (!exists) {
        throw new Error(`Resim dosyası bulunamadı: ${imagePath}`);
      }

      const imageBuffer = await fs.readFile(imagePath);
      return imageBuffer.toString('base64');
    } catch (error) {
      console.error('[AI] Resim base64\'e çevrilemedi:', error);
      throw new Error('Resim dosyası okunamadı');
    }
  }

  private static extractJsonPayload(rawText: string): any {
    try {
      // Önce direkt parse dene (GPT-4o json_object mode'da temiz JSON döner)
      return JSON.parse(rawText)
    } catch (directParseError) {
      console.warn('[AI] Direkt JSON parse başarısız, fallback deneniyor...')
      
      // Fallback: JSON code block içinde olabilir
      const codeBlockMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/)
      if (codeBlockMatch) {
        try {
          return JSON.parse(codeBlockMatch[1])
        } catch (e) {
          console.error('[AI] Code block içinde JSON parse hatası:', e)
        }
      }
      
      // Fallback 2: İlk { ve son } arası
      const start = rawText.indexOf('{')
      const end = rawText.lastIndexOf('}') + 1
      
      if (start === -1 || end === 0) {
        console.error('[AI] JSON bulunamadı. Raw response:', rawText.substring(0, 500))
        throw new Error('JSON payload bulunamadı. API yanıtı beklenmeyen formatta.')
      }
      
      const json = rawText.slice(start, end)
      try {
        return JSON.parse(json)
      } catch (e) {
        console.error('[AI] Extracted JSON parse hatası:', e)
        console.error('[AI] Extracted content:', json.substring(0, 500))
        throw new Error('JSON parse başarısız. API yanıtı geçersiz JSON formatında.')
      }
    }
  }

  private static async detectDamageWithOpenAI(imagePath: string, vehicleInfo?: any): Promise<DamageDetectionResult> {
    if (!this.openaiClient) {
      throw new Error('OpenAI istemcisi kullanılabilir değil')
    }

    const imageBase64 = await this.convertImageToBase64(imagePath)
    const prompt = `${this.buildPrompt(vehicleInfo)}\nLütfen tüm sayısal değerleri sayı olarak döndür.`

    const response = await AIHelpers.callVision(() => 
      this.openaiClient!.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 0.3, // Tutarlı JSON için optimize edildi
        max_tokens: 2500, // Yeterli yanıt uzunluğu
        top_p: 0.9, // Çeşitlilik azalt, tutarlılık arttır
        response_format: { type: 'json_object' }, // ZORUNLU: GPT-4o için JSON format
        messages: [
          {
            role: 'system',
            content: 'Araç hasar analizi uzmanısın. Görselleri analiz edip detaylı JSON rapor üretirsin. SADECE geçerli JSON döndür.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high' // Yüksek kaliteli analiz için
                } 
              }
            ]
          }
        ]
      })
    )

    const text = response.choices?.[0]?.message?.content
    if (!text) {
      console.error('[AI] OpenAI yanıtı boş!')
      throw new Error('OpenAI yanıtı boş geldi')
    }

    console.log('[AI] OpenAI raw response (first 500 chars):', text.substring(0, 500))

    // JSON parse ve validation
    let parsed: any
    try {
      parsed = parseAIResponse(text)
      console.log('[AI] ✅ JSON parse başarılı')
      
      // Zorunlu field'ları kontrol et
      const requiredFields = ['hasarAlanları', 'genelDeğerlendirme', 'teknikAnaliz', 'güvenlikDeğerlendirmesi', 'onarımTahmini']
      const missingFields = checkMissingFields(parsed, requiredFields)
      
      if (missingFields.length > 0) {
        console.error('[AI] ❌ Eksik field\'lar:', missingFields)
        throw new Error(`AI yanıtında eksik field'lar: ${missingFields.join(', ')}`)
      }
      
      // hasarAlanları array kontrolü
      if (!Array.isArray(parsed.hasarAlanları) || parsed.hasarAlanları.length === 0) {
        console.error('[AI] ❌ hasarAlanları array değil veya boş')
        throw new Error('AI yanıtında hasarAlanları eksik veya geçersiz')
      }
      
      console.log('[AI] ✅ Validation başarılı - Tüm field\'lar mevcut')
    } catch (parseError) {
      console.error('[AI] ❌ JSON parse/validation hatası:', parseError)
      console.error('[AI] Full response:', text)
      throw parseError
    }
    
    // AI'dan gelen veriyi doğrudan döndür
    return {
      ...parsed,
      aiSağlayıcı: 'OpenAI',
      model: OPENAI_MODEL,
      güven: parsed.güven || 95,
      analizZamanı: new Date().toISOString()
    }
  }

  static async detectDamage(imagePath: string, vehicleInfo?: any): Promise<DamageDetectionResult> {
    await this.initialize()

    const cacheKey = `${imagePath}_${JSON.stringify(vehicleInfo)}`
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
