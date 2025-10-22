/**
 * Hasar Tespit Servisi (Damage Detection Service)
 * 
 * Clean Architecture - Service Layer (İş Mantığı Katmanı)
 * 
 * Bu servis, OpenAI Vision API kullanarak araç hasarlarını tespit eder.
 * 
 * Amaç:
 * - Araç fotoğraflarından hasar tespiti
 * - Detaylı hasar analizi (konum, tip, şiddet, maliyet)
 * - Türkçe hasar raporları
 * - OpenAI GPT-4 Vision ile yüksek doğruluk
 * - Cache mekanizması ile performans
 * 
 * OpenAI Vision API:
 * - Model: gpt-4o-mini (veya environment'tan)
 * - Multimodal: Görüntü + Metin analizi
 * - JSON structured output
 * - Türkçe dil desteği
 * 
 * Hasar Kategorileri:
 * - Çizik (scratch)
 * - Ezilme/Göçük (dent)
 * - Pas (rust)
 * - Oksidasyon (oxidation)
 * - Çatlak (crack)
 * - Kırık (break)
 * - Boya hasarı (paint_damage)
 * - Yapısal hasar (structural)
 * - Mekanik hasar (mechanical)
 * - Elektrik hasarı (electrical)
 * 
 * Özellikler:
 * - Her hasar için detaylı bilgi (konum, maliyet, parçalar, öncelik)
 * - Genel değerlendirme (toplam maliyet, sigorta durumu, değer kaybı)
 * - Teknik analiz (yapısal bütünlük, güvenlik sistemleri)
 * - Güvenlik değerlendirmesi (sürüş güvenliği, kritik sorunlar)
 * - Onarım tahmini (maliyet detayı, zaman planı, garanti)
 * - Gerçekçi Türkiye fiyatları (2025)
 */

import OpenAI from 'openai'
import sharp from 'sharp'
import fs from 'fs/promises'
import crypto from 'crypto'
import { AIHelpers } from '../utils/aiRateLimiter'

// ===== TİP TANIMLARI =====

/**
 * Hasar Şiddeti Seviyeleri (Türkçe)
 * 
 * - minimal: Çok hafif, estetik sorun
 * - düşük: Hafif, küçük onarım
 * - orta: Orta, orta seviye onarım
 * - yüksek: Ağır, büyük onarım
 * - kritik: Kritik, güvenlik riski
 */
export type DamageSeverity = 'minimal' | 'düşük' | 'orta' | 'yüksek' | 'kritik'

/**
 * Hasar Tipleri (Türkçe)
 * 
 * Tüm olası hasar türleri
 */
export type DamageType =
  | 'çizik'          // Çizik
  | 'göçük'          // Ezilme/Göçük
  | 'pas'            // Pas
  | 'oksidasyon'     // Oksidasyon
  | 'çatlak'         // Çatlak
  | 'kırılma'        // Kırık
  | 'boya_hasarı'    // Boya hasarı
  | 'yapısal_hasar'  // Yapısal hasar
  | 'mekanik_hasar'  // Mekanik hasar
  | 'elektrik_hasarı' // Elektrik hasarı

/**
 * Hasar Alanı Interface (Türkçe Field'lar)
 * 
 * Tespit edilen her hasar için detaylı bilgi içerir.
 */
export interface DamageArea {
  id: string                                                        // Benzersiz hasar ID'si
  x: number                                                         // X koordinatı (piksel)
  y: number                                                         // Y koordinatı (piksel)
  genişlik: number                                                  // Genişlik (piksel)
  yükseklik: number                                                 // Yükseklik (piksel)
  tür: DamageType                                                   // Hasar tipi
  şiddet: DamageSeverity                                            // Şiddet seviyesi
  güven: number                                                     // Güven seviyesi (0-100)
  açıklama: string                                                  // Detaylı açıklama (Türkçe)
  bölge: 'ön' | 'arka' | 'sol' | 'sağ' | 'üst' | 'alt' | 'iç' | 'motor' | 'şasi' // Bölge
  onarımMaliyeti: number                                            // Onarım maliyeti (TL)
  etkilenenParçalar: string[]                                       // Etkilenen parçalar (Türkçe)
  onarımÖnceliği: 'düşük' | 'orta' | 'yüksek' | 'acil'              // Onarım önceliği
  güvenlikEtkisi: 'yok' | 'düşük' | 'orta' | 'yüksek' | 'kritik'    // Güvenlik etkisi
  onarımYöntemi: string                                             // Onarım yöntemi (Türkçe)
  tahminiOnarımSüresi: number                                       // Tahmini onarım süresi (saat)
  garantiEtkisi: boolean                                            // Garantiyi etkiler mi?
  sigortaKapsamı: 'yok' | 'kısmi' | 'tam'                          // Sigorta kapsamı
}

/**
 * Genel Değerlendirme Interface (Türkçe Field'lar)
 * 
 * Tüm hasarlar için özet değerlendirme
 */
export interface OverallAssessment {
  hasarSeviyesi: 'mükemmel' | 'iyi' | 'orta' | 'kötü' | 'kritik'  // Genel hasar seviyesi
  toplamOnarımMaliyeti: number                                     // Toplam onarım maliyeti (TL)
  sigortaDurumu: 'onarılabilir' | 'ekonomik_hasar' | 'total_hasar' // Sigorta durumu
  piyasaDeğeriEtkisi: number                                        // Piyasa değeri etkisi (%)
  detaylıAnaliz: string                                             // Detaylı analiz (Türkçe)
  araçDurumu: 'hasarsız' | 'hafif_hasar' | 'hasarlı' | 'ağır_hasar' // Araç durumu
  satışDeğeri: number                                               // Satış değeri (%)
  değerKaybı: number                                                // Değer kaybı (%)
  güçlüYönler: string[]                                             // Güçlü yönler (Türkçe)
  zayıfYönler: string[]                                             // Zayıf yönler (Türkçe)
  öneriler: string[]                                                // Öneriler (Türkçe)
  güvenlikEndişeleri: string[]                                       // Güvenlik endişeleri (Türkçe)
}

/**
 * Teknik Analiz Interface (Türkçe Field'lar)
 * 
 * Aracın teknik durumunu değerlendirir
 */
export interface TechnicalAnalysis {
  yapısalBütünlük: 'sağlam' | 'hafif_hasar' | 'orta_hasar' | 'ağır_hasar' | 'bozuk' // Yapısal bütünlük
  güvenlikSistemleri: 'fonksiyonel' | 'hafif_sorun' | 'büyük_sorun' | 'fonksiyonsuz'  // Güvenlik sistemleri
  mekanikSistemler: 'çalışır' | 'hafif_sorun' | 'büyük_sorun' | 'çalışmaz' // Mekanik sistemler
  elektrikSistemleri: 'fonksiyonel' | 'hafif_sorun' | 'büyük_sorun' | 'fonksiyonsuz' // Elektrik sistemleri
  gövdeHizalaması: 'mükemmel' | 'hafif_sapma' | 'orta_sapma' | 'büyük_sapma' // Gövde hizalaması
  şasiHasarı: boolean                                                // Şasi hasarı var mı?
  havaYastığıAçılması: boolean                                       // Hava yastığı patlamış mı?
  emniyetKemeri: 'fonksiyonel' | 'inceleme_gerekli' | 'fonksiyonsuz' // Emniyet kemeri fonksiyonu
  notlar: string                                                     // Ek notlar (Türkçe)
}

/**
 * Güvenlik Değerlendirmesi Interface (Türkçe Field'lar)
 * 
 * Sürüş güvenliği ve kritik sorunlar
 */
export interface SafetyAssessment {
  yolDurumu: 'güvenli' | 'koşullu' | 'güvensiz'  // Sürüş güvenliği
  kritikSorunlar: string[]                        // Kritik sorunlar listesi (Türkçe)
  güvenlikÖnerileri: string[]                     // Güvenlik önerileri (Türkçe)
  incelemeGerekli: boolean                        // Detaylı muayene gerekli mi?
  acilAksiyonlar: string[]                        // Acil aksiyonlar (Türkçe)
  uzunVadeliEndişeler: string[]                   // Uzun vadeli endişeler (Türkçe)
}

/**
 * Onarım Tahmini Interface (Türkçe Field'lar)
 * 
 * Detaylı maliyet ve zaman tahmini
 */
export interface RepairEstimate {
  toplamMaliyet: number                                   // Toplam maliyet (TL)
  işçilikMaliyeti: number                                 // İşçilik maliyeti (TL)
  parçaMaliyeti: number                                    // Parça maliyeti (TL)
  boyaMaliyeti: number                                     // Boya maliyeti (TL)
  ekMaliyetler: number                                     // Ek maliyetler (TL)
  maliyetKırılımı: Array<{                                // Maliyet detayı
    parça: string                                          // Parça adı (Türkçe)
    açıklama: string                                       // Açıklama (Türkçe)
    maliyet: number                                        // Maliyet
  }>
  zamanÇizelgesi: Array<{                                 // Zaman planı
    faz: string                                            // Aşama (Türkçe)
    süre: number                                           // Süre (gün)
    açıklama: string                                       // Açıklama (Türkçe)
  }>
  garanti: {                                               // Garanti bilgisi
    kapsam: boolean                                         // Garanti kapsamında mı?
    süre: string                                           // Garanti süresi
    koşullar: string[]                                     // Garanti koşulları (Türkçe)
  }
}

/**
 * Hasar Tespit Sonucu Interface (Türkçe Field'lar)
 * 
 * Tüm analiz sonuçlarını içerir
 */
export interface DamageDetectionResult {
  hasarAlanları: DamageArea[]                           // Tespit edilen hasarlar
  genelDeğerlendirme: OverallAssessment                 // Genel değerlendirme
  teknikAnaliz: TechnicalAnalysis                        // Teknik analiz
  güvenlikDeğerlendirmesi: SafetyAssessment             // Güvenlik değerlendirmesi
  onarımTahmini: RepairEstimate                          // Onarım tahmini
  aiSağlayıcı: string                                   // AI sağlayıcı
  model: string                                         // AI model
  güven: number                                         // Genel güven seviyesi (0-100)
  analizZamanı: string                                  // Analiz zamanı (ISO)
}

// ===== YARDIMCI FONKSİYONLAR =====

/**
 * OpenAI Model Seçimi
 * 
 * Environment variable'dan model adı alınır, yoksa default kullanılır
 */
const OPENAI_MODEL = process.env.OPENAI_DAMAGE_MODEL ?? 'gpt-4o-mini'

/**
 * "Not Found" hatasını kontrol eder
 * 
 * @param error - Hata objesi
 * @returns true: not found hatası, false: başka hata
 */
const isNotFoundError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false
  const message = (error as any).message?.toString().toLowerCase() ?? ''
  const status = (error as any).status ?? (error as any).statusCode
  return status === 404 || message.includes('not found') || message.includes('model') && message.includes('supported')
}

/**
 * Kota (quota) hatasını kontrol eder
 * 
 * @param error - Hata objesi
 * @returns true: quota hatası, false: başka hata
 */
const isQuotaError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false
  const code = (error as any).code?.toString().toLowerCase()
  const message = (error as any).message?.toString().toLowerCase() ?? ''
  return code === 'insufficient_quota' || message.includes('quota') || message.includes('rate limit')
}

/**
 * Sayıyı min-max aralığına sınırlar
 * 
 * @param value - Değer
 * @param min - Minimum
 * @param max - Maximum
 * @returns Sınırlanmış değer
 */
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/**
 * Değeri float'a çevirir, hata varsa fallback döner
 * 
 * @param value - Değer
 * @param fallback - Fallback değer
 * @returns Float sayı
 */
const ensureFloat = (value: any, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * Değeri integer'a çevirir, hata varsa fallback döner
 * 
 * @param value - Değer
 * @param fallback - Fallback değer
 * @returns Integer sayı
 */
const ensureInt = (value: any, fallback: number) => Math.round(ensureFloat(value, fallback))

/**
 * Değeri string array'e çevirir
 * 
 * @param value - Değer
 * @returns String array (valid olanlar)
 */
const ensureStringArray = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string') as string[]
  }
  return []
}


// ===== SERVİS =====

/**
 * DamageDetectionService Sınıfı
 * 
 * OpenAI Vision API ile hasar tespiti yapan ana servis
 */
export class DamageDetectionService {
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
  private static cache = new Map<string, DamageDetectionResult>()

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
        console.log('[AI] OpenAI istemcisi hazırlandı')
      } else {
        console.error('[AI] OPENAI_API_KEY tanımlı değil! Lütfen .env dosyasına ekleyin.')
        throw new Error('OpenAI API key bulunamadı')
      }

      this.isInitialized = true
    } catch (error) {
      console.error('[AI] OpenAI servisi başlatılırken hata oluştu:', error)
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
   * Görüntüyü Base64'e çevirir
   * 
   * Sharp ile optimize eder (1024x1024, JPEG %90)
   * 
   * @param imagePath - Görüntü path'i veya data URL
   * @returns Base64 string
   * 
   * @private
   */
  private static async convertImageToBase64(imagePath: string): Promise<string> {
    // Data URL ise direkt base64 kısmını al
    if (imagePath.startsWith('data:')) {
      return imagePath.split(',')[1]
    }

    // Dosya path'i ise oku ve optimize et
    const buffer = await fs.readFile(imagePath)
    const optimized = await sharp(buffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer()

    return optimized.toString('base64')
  }

  /**
   * Görüntü hash'ini hesaplar (cache key için)
   * 
   * MD5 hash kullanır
   * 
   * @param imagePath - Görüntü path'i
   * @returns MD5 hash
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
      console.warn('[AI] Görsel hash hesaplanamadı, rastgele anahtar kullanılacak', error)
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`
    }
  }

  /**
   * OpenAI için Türkçe prompt oluşturur
   * 
   * ÇOK DETAYLI prompt ile AI'ya ne yapması gerektiğini anlatır:
   * - Hasar tespit kuralları
   * - Türkiye fiyatları (2025)
   * - JSON format örneği
   * - Kritik kurallar
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

Bu araç bilgilerini göz önünde bulundurarak hasar analizi yap.` : ''

    return `Sen profesyonel bir otomotiv hasar eksperisin. YÜKSEK ÇÖZÜNÜRLÜKLÜ araç fotoğrafını ÇOK DETAYLI analiz et ve TÜM hasarları Türkçe olarak raporla.

🎯 ÖNEMLİ: RAPOR TAMAMEN TÜRKÇE OLMALI - HİÇBİR İNGİLİZCE KELİME KULLANMA!

${vehicleContext}

📋 HASAR TESPİT KURALLARI (YÜKSEK KALİTE GÖRÜNTÜ ANALİZİ):
1. Fotoğraftaki HER hasarı ayrı ayrı tespit et ve raporla
2. Görüntü kalitesi yüksek olduğu için en küçük detayları bile tespit et
3. Her hasar için şu bilgileri VER:
   - Hasar türü (Türkçe): çizik, göçük, kırılma, çatlak, paslanma, ezilme, yapısal_hasar vb.
   - Şiddet seviyesi: minimal, düşük, orta, yüksek, kritik
   - Etkilenen parçalar (Türkçe): "Ön Sağ Çamurluk", "Ön Tampon", "Far Grubu" gibi
   - Detaylı açıklama (Türkçe): Hasarın ne olduğunu, nerede olduğunu, nasıl onarılacağını açıkla
   - Koordinat bilgisi: x, y, genişlik, yükseklik (piksel cinsinden)
   - Güvenilirlik: 0-100 arası yüzde değeri (yüksek kalite görüntü için %80+ olmalı)
   - Onarım maliyeti: Türk Lirası cinsinden gerçekçi fiyat

⚠️ SADECE FİZİKSEL HASAR TESPİTİ YAP:
- ✅ Çizik, göçük, ezik, pas, çatlak, kırılma, yapısal hasar
- ✅ Hasar konumu, şiddeti, onarım maliyeti
- ✅ Güvenlik riski, sigorta durumu
- ❌ BOYA KALİTESİ, PARLAKLIK, RENK ANALİZİ YAPMA (boya analizi işi)

💰 MALİYET HESAPLAMA (Türkiye 2025 Gerçek Fiyatları):
- Çamurluk değişimi + boya: 15.000-25.000 TL
- Far grubu değişimi: 8.000-15.000 TL  
- Tampon değişimi + boya: 10.000-18.000 TL
- Kaput düzeltme + boya: 12.000-20.000 TL
- Kapı düzeltme + boya: 8.000-15.000 TL
- Cam değişimi: 3.000-8.000 TL
- Ayna değişimi: 2.000-5.000 TL
- Jant değişimi: 3.000-8.000 TL
- Çizik giderme: 800-2.000 TL
- Göçük düzeltme: 1.500-5.000 TL
- Profesyonel boya işlemi: 2.000-8.000 TL

🔍 GÖRÜNTÜ KALİTE ANALİZİ:
- Bu yüksek çözünürlüklü görüntüde tüm detaylar net görünüyor
- Hasar sınırları, derinlik, boyut ve şekil analizi yapabilirsin
- Boya hasarları, metal deformasyonları, çizik derinlikleri tespit edilebilir
- Güvenilirlik skorun %80'in altında olmamalı

🔍 ÇIKTI FORMATI (Sadece geçerli JSON döndür, TAMAMEN TÜRKÇE FIELD İSİMLERİ):
{
  "hasarAlanları": [
    {
      "id": "hasar-1",
      "x": 150,
      "y": 200,
      "genişlik": 120,
      "yükseklik": 80,
      "tür": "göçük",
      "şiddet": "yüksek",
      "güven": 95,
      "açıklama": "Ön sağ çamurlukta ciddi ezilme ve bükülme tespit edildi. Metal yapı deforme olmuş. Çamurluk komple değiştirilmeli ve boya yapılmalı. Ön sağ kapı kenarı da etkilenmiş durumda.",
      "bölge": "ön",
      "onarımMaliyeti": 18000,
      "etkilenenParçalar": ["Ön Sağ Çamurluk", "Ön Sağ Kapı Kenarı", "Yan Panel"],
      "onarımÖnceliği": "acil",
      "güvenlikEtkisi": "orta",
      "onarımYöntemi": "Çamurluk komple değişimi + profesyonel boya uygulaması + kapı kenarı düzeltme",
      "tahminiOnarımSüresi": 8,
      "garantiEtkisi": true,
      "sigortaKapsamı": "tam"
    },
    {
      "id": "hasar-2",
      "x": 70,
      "y": 120,
      "genişlik": 100,
      "yükseklik": 80,
      "tür": "kırılma",
      "şiddet": "yüksek",
      "güven": 90,
      "açıklama": "Ön sağ far grubu kırık. Far camı parçalanmış durumda. Far grubu komple değiştirilmeli. Gece sürüş tehlikeli.",
      "bölge": "ön",
      "onarımMaliyeti": 12000,
      "etkilenenParçalar": ["Ön Sağ Far Grubu", "Far Camı", "Far Muhafazası"],
      "onarımÖnceliği": "acil",
      "güvenlikEtkisi": "yüksek",
      "onarımYöntemi": "Far grubu komple değişimi + elektrik bağlantı kontrolü",
      "tahminiOnarımSüresi": 4,
      "garantiEtkisi": true,
      "sigortaKapsamı": "tam"
    }
  ],
  "genelDeğerlendirme": {
    "hasarSeviyesi": "kötü",
    "toplamOnarımMaliyeti": 85000,
    "sigortaDurumu": "onarılabilir",
    "piyasaDeğeriEtkisi": 25,
    "detaylıAnaliz": "Araçta ön sağ tarafta orta-ağır seviyede hasar tespit edildi. Çamurluk, far grubu, tampon ve kaput bölgeleri etkilenmiş durumda. Yapısal bütünlük kontrol edilmeli. Mekanik ve elektrik sistemleri mutlaka kontrol edilmelidir. Şasi ölçümü önerilir.",
    "araçDurumu": "hasarlı",
    "satışDeğeri": 75,
    "değerKaybı": 25,
    "güçlüYönler": [
      "Motor bölgesi hasarsız görünüyor",
      "Arka taraf temiz durumda",
      "Sol taraf hasarsız"
    ],
    "zayıfYönler": [
      "Ön sağ tarafta ciddi hasar var",
      "Far grubu kırık - gece sürüş tehlikeli",
      "Çamurluk komple değişmeli"
    ],
    "öneriler": [
      "Acil onarım gerekli - aracı kullanmayın",
      "Yetkili serviste detaylı kontrol yaptırın",
      "Şasi ölçümü mutlaka yapılmalı",
      "Sigorta şirketini bilgilendirin"
    ],
    "güvenlikEndişeleri": [
      "Far kırık - gece sürüş tehlikeli",
      "Yapısal hasar olabilir",
      "Güvenlik sistemleri kontrol edilmeli"
    ]
  },
  "teknikAnaliz": {
    "yapısalBütünlük": "orta_hasar",
    "güvenlikSistemleri": "inceleme_gerekli",
    "mekanikSistemler": "inceleme_gerekli",
    "elektrikSistemleri": "inceleme_gerekli",
    "gövdeHizalaması": "orta_sapma",
    "şasiHasarı": false,
    "havaYastığıAçılması": false,
    "emniyetKemeri": "fonksiyonel",
    "notlar": "Ön sağ tarafta orta seviye yapısal hasar mevcut. Detaylı kontrol şart."
  },
  "güvenlikDeğerlendirmesi": {
    "yolDurumu": "koşullu",
    "kritikSorunlar": [
      "Ön sağ tarafta yapısal hasar mevcut",
      "Far grubu kırık - gece sürüş çok tehlikeli",
      "Çamurluk ciddi şekilde deforme olmuş"
    ],
    "güvenlikÖnerileri": [
      "Aracı derhal kullanmayı bırakın",
      "Yetkili servise çektirin",
      "Mekanik ve elektrik kontrolleri mutlaka yaptırın",
      "Şasi ölçümü ve rot-balans kontrolü şart"
    ],
    "incelemeGerekli": true,
    "acilAksiyonlar": [
      "Far grubu acil değiştirilmeli",
      "Çamurluk onarımı öncelikli",
      "Rot-balans ve aks kontrolü",
      "Elektrik sistemleri test edilmeli"
    ],
    "uzunVadeliEndişeler": [
      "Şasi hasarı riski yüksek",
      "Paslanma başlayabilir",
      "Değer kaybı devam edebilir"
    ]
  },
  "onarımTahmini": {
    "toplamMaliyet": 85000,
    "işçilikMaliyeti": 25000,
    "parçaMaliyeti": 50000,
    "boyaMaliyeti": 8000,
    "ekMaliyetler": 2000,
    "maliyetKırılımı": [
      {
        "parça": "Ön Sağ Çamurluk",
        "açıklama": "Komple değişim + profesyonel boya uygulaması + montaj",
        "maliyet": 18000
      },
      {
        "parça": "Ön Sağ Far Grubu",
        "açıklama": "Komple far grubu değişimi + elektrik bağlantı kontrolü",
        "maliyet": 12000
      },
      {
        "parça": "Ön Tampon",
        "açıklama": "Komple tampon değişimi + boya + montaj",
        "maliyet": 15000
      },
      {
        "parça": "Kaput",
        "açıklama": "Düzeltme + boya + parlatma",
        "maliyet": 14000
      },
      {
        "parça": "Ön Sağ Kapı",
        "açıklama": "Kenar düzeltme + lokal boya",
        "maliyet": 8000
      },
      {
        "parça": "Diğer İşçilik",
        "açıklama": "Sökme-takma + ayar + test",
        "maliyet": 18000
      }
    ],
    "zamanÇizelgesi": [
      {
        "faz": "Parça Tedariki",
        "süre": 3,
        "açıklama": "Orijinal yedek parça siparişi ve temin süreci"
      },
      {
        "faz": "Sökme İşlemi",
        "süre": 1,
        "açıklama": "Hasarlı parçaların sökülmesi ve hazırlık"
      },
      {
        "faz": "Onarım ve Montaj",
        "süre": 4,
        "açıklama": "Yeni parça montajı ve düzeltme işlemleri"
      },
      {
        "faz": "Boya İşlemi",
        "süre": 2,
        "açıklama": "Profesyonel boya uygulaması ve kurutma"
      },
      {
        "faz": "Kalite Kontrol",
        "süre": 1,
        "açıklama": "Detaylı kontrol, test sürüşü ve teslim hazırlığı"
      }
    ],
    "garanti": {
      "kapsam": true,
      "süre": "12 ay veya 20.000 km",
      "koşullar": [
        "Yetkili serviste onarım yapılmalı",
        "Orijinal yedek parça kullanılmalı",
        "Düzenli bakım takibi yapılmalı"
      ]
    }
  }
}

⚠️ KRİTİK KURALLAR:
- RAPOR TAMAMEN TÜRKÇE OLMALI - HİÇBİR İNGİLİZCE KELİME YOK!
- FIELD İSİMLERİ DE TÜRKÇE OLMALI (hasarAlanları, genelDeğerlendirme, vb.)
- ENUM DEĞERLERİ TÜRKÇE OLMALI (şiddet: "yüksek", tür: "göçük", bölge: "ön")
- Eğer fotoğrafta HASAR YOKSA, hasarAlanları boş array [] döndür
- Her hasar için DETAYLI Türkçe açıklama yaz (minimum 2 cümle)
- Maliyet değerlerini GERÇEKÇI hesapla (Türkiye 2025 fiyatları)
- Her hasarı AYRI AYRI belirt, birleştirme
- Koordinat bilgilerini mutlaka ver (x, y, genişlik, yükseklik)
- Etkilenen parçaları Türkçe listele
- Sadece geçerli JSON döndür, başka metin ekleme
- Tüm field'lar Türkçe değerler içermeli`
  }

  /**
   * AI yanıtından JSON payload'ı çıkarır
   * 
   * AI bazen JSON öncesi veya sonrasında açıklama metni ekler,
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
   * AI sonucunu normalize eder ve validation yapar
   * 
   * AI bazen eksik veya hatalı veri döndürebilir,
   * bu fonksiyon tüm field'ları kontrol eder ve fallback değerlerle doldurur.
   * 
   * @param raw - AI'dan gelen ham sonuç
   * @param provider - AI sağlayıcı adı
   * @param model - Model adı
   * @returns Normalize edilmiş DamageDetectionResult
   * 
   * @private
   */
  private static sanitizeDamageResult(raw: any, provider: string, model: string): DamageDetectionResult {
    // Hasar alanlarını normalize et
    const areasSource = Array.isArray(raw?.hasarAlanları) ? raw.hasarAlanları : []
    const damageAreas: DamageArea[] = areasSource.map((area: any, index: number) => ({
      id: area?.id || `hasar-${index + 1}`,
      x: area?.x || 0,
      y: area?.y || 0,
      genişlik: area?.genişlik || 0,
      yükseklik: area?.yükseklik || 0,
      tür: area?.tür as DamageType,
      şiddet: area?.şiddet as DamageSeverity,
      güven: area?.güven || 0,
      açıklama: area?.açıklama || '',
      bölge: area?.bölge as DamageArea['bölge'],
      onarımMaliyeti: area?.onarımMaliyeti || 0,
      etkilenenParçalar: area?.etkilenenParçalar || [],
      onarımÖnceliği: area?.onarımÖnceliği as DamageArea['onarımÖnceliği'],
      güvenlikEtkisi: area?.güvenlikEtkisi as DamageArea['güvenlikEtkisi'],
      onarımYöntemi: area?.onarımYöntemi || '',
      tahminiOnarımSüresi: area?.tahminiOnarımSüresi || 0,
      garantiEtkisi: area?.garantiEtkisi || false,
      sigortaKapsamı: area?.sigortaKapsamı as DamageArea['sigortaKapsamı']
    }))

    // Toplam maliyet hesapla
    const totalRepairCost = Math.max(
      ensureInt(raw?.genelDeğerlendirme?.toplamOnarımMaliyeti, damageAreas.reduce((sum, area) => sum + area.onarımMaliyeti, 0)),
      0
    )

    // Genel değerlendirme
    const overallAssessment: OverallAssessment = {
      hasarSeviyesi: raw?.genelDeğerlendirme?.hasarSeviyesi as OverallAssessment['hasarSeviyesi'],
      toplamOnarımMaliyeti: raw?.genelDeğerlendirme?.toplamOnarımMaliyeti || 0,
      sigortaDurumu: raw?.genelDeğerlendirme?.sigortaDurumu as OverallAssessment['sigortaDurumu'],
      piyasaDeğeriEtkisi: raw?.genelDeğerlendirme?.piyasaDeğeriEtkisi || 0,
      detaylıAnaliz: raw?.genelDeğerlendirme?.detaylıAnaliz || '',
      araçDurumu: raw?.genelDeğerlendirme?.araçDurumu as OverallAssessment['araçDurumu'],
      satışDeğeri: raw?.genelDeğerlendirme?.satışDeğeri || 0,
      değerKaybı: raw?.genelDeğerlendirme?.değerKaybı || 0,
      güçlüYönler: raw?.genelDeğerlendirme?.güçlüYönler || [],
      zayıfYönler: raw?.genelDeğerlendirme?.zayıfYönler || [],
      öneriler: raw?.genelDeğerlendirme?.öneriler || [],
      güvenlikEndişeleri: raw?.genelDeğerlendirme?.güvenlikEndişeleri || []
    }

    // Teknik analiz
    const technicalAnalysis: TechnicalAnalysis = {
      yapısalBütünlük: raw?.teknikAnaliz?.yapısalBütünlük as TechnicalAnalysis['yapısalBütünlük'],
      güvenlikSistemleri: raw?.teknikAnaliz?.güvenlikSistemleri as TechnicalAnalysis['güvenlikSistemleri'],
      mekanikSistemler: raw?.teknikAnaliz?.mekanikSistemler as TechnicalAnalysis['mekanikSistemler'],
      elektrikSistemleri: raw?.teknikAnaliz?.elektrikSistemleri as TechnicalAnalysis['elektrikSistemleri'],
      gövdeHizalaması: raw?.teknikAnaliz?.gövdeHizalaması as TechnicalAnalysis['gövdeHizalaması'],
      şasiHasarı: raw?.teknikAnaliz?.şasiHasarı || false,
      havaYastığıAçılması: raw?.teknikAnaliz?.havaYastığıAçılması || false,
      emniyetKemeri: raw?.teknikAnaliz?.emniyetKemeri as TechnicalAnalysis['emniyetKemeri'],
      notlar: raw?.teknikAnaliz?.notlar || ''
    }

    // Güvenlik değerlendirmesi
    const safetyAssessment: SafetyAssessment = {
      yolDurumu: raw?.güvenlikDeğerlendirmesi?.yolDurumu as SafetyAssessment['yolDurumu'],
      kritikSorunlar: raw?.güvenlikDeğerlendirmesi?.kritikSorunlar || [],
      güvenlikÖnerileri: raw?.güvenlikDeğerlendirmesi?.güvenlikÖnerileri || [],
      incelemeGerekli: raw?.güvenlikDeğerlendirmesi?.incelemeGerekli || false,
      acilAksiyonlar: raw?.güvenlikDeğerlendirmesi?.acilAksiyonlar || [],
      uzunVadeliEndişeler: raw?.güvenlikDeğerlendirmesi?.uzunVadeliEndişeler || []
    }

    // Onarım tahmini
    const repairEstimate: RepairEstimate = {
      toplamMaliyet: totalRepairCost,
      işçilikMaliyeti: ensureInt(raw?.onarımTahmini?.işçilikMaliyeti, Math.floor(totalRepairCost * 0.4)),
      parçaMaliyeti: ensureInt(raw?.onarımTahmini?.parçaMaliyeti, Math.floor(totalRepairCost * 0.5)),
      boyaMaliyeti: ensureInt(raw?.onarımTahmini?.boyaMaliyeti, Math.floor(totalRepairCost * 0.1)),
      ekMaliyetler: ensureInt(raw?.onarımTahmini?.ekMaliyetler, 0),
      maliyetKırılımı: Array.isArray(raw?.onarımTahmini?.maliyetKırılımı)
        ? raw.onarımTahmini.maliyetKırılımı.map((item: any, index: number) => ({
            parça: typeof item?.parça === 'string' ? item.parça : damageAreas[index]?.tür ?? 'gövde_paneli',
            açıklama: typeof item?.açıklama === 'string' ? item.açıklama : damageAreas[index]?.açıklama ?? 'Onarım detayı',
            maliyet: ensureInt(item?.maliyet, damageAreas[index]?.onarımMaliyeti ?? 0)
          }))
        : damageAreas.map(area => ({ parça: area.tür, açıklama: area.açıklama, maliyet: area.onarımMaliyeti })),
      zamanÇizelgesi: Array.isArray(raw?.onarımTahmini?.zamanÇizelgesi)
        ? raw.onarımTahmini.zamanÇizelgesi.map((item: any) => ({
            faz: typeof item?.faz === 'string' ? item.faz : 'Onarım',
            süre: Math.max(1, ensureInt(item?.süre, 1)),
            açıklama: typeof item?.açıklama === 'string' ? item.açıklama : 'Planlanan işlem'
          }))
        : [
            { faz: 'Hazırlık', süre: 1, açıklama: 'Detaylı inceleme ve parça tedariki' },
            { faz: 'Onarım', süre: Math.max(1, Math.ceil(totalRepairCost / 1500)), açıklama: 'Ana onarım ve montaj' },
            { faz: 'Kontrol', süre: 1, açıklama: 'Kalite kontrol ve teslim hazırlığı' }
          ],
      garanti: {
        kapsam: Boolean(raw?.onarımTahmini?.garanti?.kapsam ?? true),
        süre: typeof raw?.onarımTahmini?.garanti?.süre === 'string'
          ? raw.onarımTahmini.garanti.süre
          : '12 ay',
        koşullar: ensureStringArray(raw?.onarımTahmini?.garanti?.koşullar).length
          ? ensureStringArray(raw?.onarımTahmini?.garanti?.koşullar)
          : ['Yetkili servis bakımı', 'Orijinal parça kullanımı']
      }
    }

    return {
      hasarAlanları: damageAreas,
      genelDeğerlendirme: overallAssessment,
      teknikAnaliz: technicalAnalysis,
      güvenlikDeğerlendirmesi: safetyAssessment,
      onarımTahmini: repairEstimate,
      aiSağlayıcı: provider,
      model,
      güven: clamp(ensureInt(raw?.güven, 85), 0, 100),
      analizZamanı: typeof raw?.analizZamanı === 'string' ? raw.analizZamanı : new Date().toISOString()
    }
  }

  /**
   * OpenAI Vision API ile hasar tespiti yapar
   * 
   * @param imagePath - Görüntü path'i
   * @param vehicleInfo - Araç bilgileri (opsiyonel)
   * @returns Hasar tespit sonucu
   * @throws Error - API hatası
   * 
   * @private
   */
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
        messages: [
          {
            role: 'system',
            content: 'Sen deneyimli bir otomotiv eksperisin. Yüksek kaliteli görüntüleri analiz ederek detaylı hasar tespiti yaparsın. Çıktıyı geçerli JSON olarak üret.'
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
    )

    const text = response.choices?.[0]?.message?.content
    if (!text) {
      throw new Error('OpenAI yanıtı boş geldi')
    }

    const parsed = this.extractJsonPayload(text)
    return this.sanitizeDamageResult(parsed, 'OpenAI', OPENAI_MODEL)
  }

  /**
   * Hasar Tespiti - Public API
   * 
   * Cache kontrolü yapar, yoksa OpenAI ile analiz eder.
   * 
   * @param imagePath - Görüntü path'i
   * @param vehicleInfo - Araç bilgileri (opsiyonel)
   * @returns Hasar tespit sonucu
   * @throws Error - API hatası
   */
  static async detectDamage(imagePath: string, vehicleInfo?: any): Promise<DamageDetectionResult> {
    await this.initialize()

    const cacheKey = await this.getImageHash(imagePath)
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
