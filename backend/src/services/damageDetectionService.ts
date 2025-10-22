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
      this.openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
      this.isInitialized = true
      console.log('[AI] DamageDetectionService başlatıldı')
    } catch (error) {
      console.error('[AI] DamageDetectionService başlatılamadı:', error)
      throw new Error('OpenAI API key bulunamadı')
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

    return `Sen uzman bir araç expertiz ustasısın. Görseli analiz et ve SADECE GEÇERLİ JSON formatında yanıt ver. Hiçbir ek açıklama, markdown veya metin ekleme.

🎯 KRITIK: Yanıtın SADECE JSON olmalı, başka hiçbir şey olmamalı!

${vehicleContext}

📋 EXPERTİZ USTASI ANALİZ KURALLARI:

1. **ARAÇ ÖZETİ**: Model, yakıt tipi, darbenin yönü ve şiddeti
2. **GÖRSEL HASAR ANALİZİ**: Tablo formatında bölge, durum, muhtemel parça/işlem
3. **TEKNİK DURUM**: Yapısal deformasyon, şasi hasarı, monokok bütünlük analizi
4. **TÜRKİYE 2025 MALİYET HESAPLAMA**: Detaylı tamir maliyeti tablosu
5. **SİGORTA & PİYASA DEĞERLENDİRMESİ**: Kasko değeri, pert durumu, piyasa etkisi
6. **USTA YORUMU**: Profesyonel görüş ve öneriler
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
- hasarAlanları (zorunlu - en az 1 hasar alanı)

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
    },
    {
      "bölge": "Arka Sol Çamurluk & Arka Panel",
      "durum": "Yapısal deformasyon var (şasi uzantısı kırılmış)",
      "muhtemelParça": "Kesme-kaynakla panel değişimi gerekir"
    }
  ],
  "teknikDurum": {
    "yapısalDeformasyon": true,
    "şasiHasarı": true,
    "monokokBütünlük": "bozulmuş",
    "açıklama": "Bu araçta arka şasi uzantısı + tavan hattı + batarya bölmesi hasar aldığı için, bu monokok taşıyıcı yapı deformasyonu demektir. Bu tür hasarlarda orijinal fabrika ölçü noktasına dönmek mümkün değildir.",
    "ekspertizSonucu": "Ağır hasarlı / ekonomik tamir dışı (pert)"
  },
  "türkiye2025TamirMaliyeti": {
    "toplamMaliyet": 300000,
    "gerçekçiToplam": 350000,
    "maliyetKırılımı": [
      {
        "işlem": "Arka panel + çamurluk kesme-kaynak",
        "maliyet": 40000
      },
      {
        "işlem": "Tavan değişimi",
        "maliyet": 35000
      },
      {
        "işlem": "Sol arka kapı",
        "maliyet": 15000
      },
      {
        "işlem": "Bagaj kapağı + tampon + iç sac",
        "maliyet": 30000
      },
      {
        "işlem": "Boya (arka + sol taraf)",
        "maliyet": 25000
      },
      {
        "işlem": "Batarya muhafaza + bağlantılar",
        "maliyet": 50000
      },
      {
        "işlem": "Şasi düzeltme hattı + ölçü",
        "maliyet": 20000
      },
      {
        "işlem": "İç döşeme + cam + işçilik",
        "maliyet": 15000
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
    "genelDeğerlendirme": "Bu araç 'arka taşıyıcı + tavan hattı + batarya bölgesi' hasarı almış. Yani bu artık 'parça değişimiyle düzelir' değil, 'karoser kesilip yeniden puntalanır' düzeyinde bir iş. O da hem maliyetli, hem güvenlik açısından tehlikeli olur.",
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
      "tür": "yapısal_deformasyon",
      "şiddet": "kritik",
      "güven": 95,
      "açıklama": "Arka sol tavan hattına kadar uzanan ezilme. Yapısal bütünlük bozulmuş.",
      "bölge": "arka",
      "onarımMaliyeti": 35000,
      "etkilenenParçalar": ["Tavan", "Arka Panel", "Şasi Uzantısı"],
      "onarımÖnceliği": "acil",
      "güvenlikEtkisi": "yüksek",
      "onarımYöntemi": "Tavan komple değişimi + şasi düzeltme",
      "tahminiOnarımSüresi": 15,
      "garantiEtkisi": true,
      "sigortaKapsamı": "pert"
    }
  ],
  "genelDeğerlendirme": {
    "hasarSeviyesi": "kritik",
    "toplamOnarımMaliyeti": 300000,
    "sigortaDurumu": "pert",
    "piyasaDeğeriEtkisi": 50,
    "detaylıAnaliz": "Araçta arka-sol tarafta kritik seviyede yapısal deformasyon tespit edildi. Tavan çökmesi, şasi uzantısı kırılması ve batarya bölgesi hasarı mevcut. Bu tür hasarlar ekonomik tamir sınırlarını aşar.",
    "araçDurumu": "pert",
    "satışDeğeri": 40,
    "değerKaybı": 60,
    "güçlüYönler": ["Motor bölgesi hasarsız", "Ön taraf temiz"],
    "zayıfYönler": ["Yapısal deformasyon", "Tavan çökmesi", "Şasi hasarı"],
    "öneriler": ["Sigorta şirketini bilgilendir", "Pert kararı al", "İhale sürecini başlat"],
    "güvenlikEndişeleri": ["Yapısal bütünlük bozulmuş", "Güvenlik sistemleri risk altında"]
  },
  "teknikAnaliz": {
    "yapısalBütünlük": "kritik_hasar",
    "güvenlikSistemleri": "risk_altında",
    "mekanikSistemler": "inceleme_gerekli",
    "elektrikSistemleri": "risk_altında",
    "gövdeHizalaması": "kritik_sapma",
    "şasiHasarı": true,
    "havaYastığıAçılması": false,
    "emniyetKemeri": "fonksiyonel",
    "notlar": "Yapısal deformasyon nedeniyle güvenlik sistemleri etkilenmiş olabilir."
  },
  "güvenlikDeğerlendirmesi": {
    "yolDurumu": "tehlikeli",
    "kritikSorunlar": ["Yapısal deformasyon", "Tavan çökmesi", "Şasi hasarı"],
    "güvenlikÖnerileri": ["Aracı kullanmayı bırak", "Sigorta şirketini bilgilendir", "Pert sürecini başlat"],
    "incelemeGerekli": true,
    "acilAksiyonlar": ["Sigorta bildirimi", "Pert kararı", "İhale süreci"],
    "uzunVadeliEndişeler": ["Yapısal bütünlük kaybı", "Güvenlik riski", "Değer kaybı"]
  },
  "onarımTahmini": {
    "toplamMaliyet": 300000,
    "işçilikMaliyeti": 120000,
    "parçaMaliyeti": 150000,
    "boyaMaliyeti": 25000,
    "ekMaliyetler": 5000,
    "maliyetKırılımı": [
      {
        "parça": "Tavan Değişimi",
        "açıklama": "Komple tavan değişimi + şasi düzeltme",
        "maliyet": 35000
      },
      {
        "parça": "Arka Panel",
        "açıklama": "Kesme-kaynakla panel değişimi",
        "maliyet": 40000
      }
    ],
    "zamanÇizelgesi": [
      {
        "faz": "Hazırlık",
        "süre": 3,
        "açıklama": "Sökme ve hazırlık işlemleri"
      },
      {
        "faz": "Onarım",
        "süre": 15,
        "açıklama": "Ana onarım işlemleri"
      }
    ],
    "garantiKapsamı": "Pert durumunda garanti geçersiz",
    "önerilenServis": "Sigorta şirketi yetkili servisi",
    "acilOnarımGerekli": true
  },
  "aiSağlayıcı": "OpenAI",
  "model": "gpt-4-vision-preview",
  "güven": 95,
  "analizZamanı": "${new Date().toISOString()}"
}

⚠️ KRİTİK KURALLAR:
- RAPOR TAMAMEN TÜRKÇE - HİÇBİR İNGİLİZCE YOK!
- SADECE HASAR TESPİTİ - Boya kalitesi veya renk analizi yapma!
- Fiyatlar GERÇEK Türkiye 2025 piyasa değerleri olmalı
- Detaylı Türkçe açıklamalar yap (minimum 2-3 cümle)
- Tüm sayısal değerleri NUMBER olarak ver (string DEĞİL!)
- Sadece geçerli JSON döndür
- Uzman seviyesinde analiz yap - ChatGPT gibi detaylı ve profesyonel`
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
        temperature: 0.1,
        response_format: { type: 'json_object' }, // ZORUNLU: GPT-4o için JSON format
        messages: [
          {
            role: 'system',
            content: 'Sen deneyimli bir otomotiv eksperisin. Yüksek kaliteli görüntüleri analiz ederek detaylı hasar tespiti yaparsın. Çıktını SADECE geçerli JSON olarak üret, başka hiçbir metin ekleme.'
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

    let parsed: any
    try {
      parsed = this.extractJsonPayload(text)
      console.log('[AI] ✅ JSON parse başarılı')
    } catch (parseError) {
      console.error('[AI] ❌ JSON parse hatası:', parseError)
      console.error('[AI] Full response:', text)
      throw parseError
    }
    
    // AI'dan gelen veriyi doğrudan döndür (fallback yok)
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
