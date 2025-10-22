/**
 * Boya Analizi Types (Paint Analysis Types)
 * 
 * Clean Architecture - Type Layer (Tip Katmanı)
 * 
 * Bu dosya, boya analizi ile ilgili tüm TypeScript tiplerini tanımlar.
 * Backend PaintAnalysisService'den gelen tam analiz sonucu ile %100 uyumlu.
 * 
 * İçerik:
 * - PaintAnalysisResult (Boya Analizi Sonucu)
 * - PaintQuality (Boya Kalitesi)
 * - ColorAnalysis (Renk Analizi)
 * - SurfaceAnalysis (Yüzey Analizi)
 * - PaintDefects (Boya Kusurları - Sadece Yüzey Kusurları)
 * - TechnicalDetails (Teknik Detaylar)
 * - PaintRecommendations (Boya Önerileri)
 * - PaintCostEstimate (Boya Maliyet Tahmini)
 * 
 * Kullanım:
 * ```typescript
 * import { PaintAnalysisResult } from '@/types/paintAnalysis'
 * 
 * const result: PaintAnalysisResult = await paintAnalysisService.getReport('123')
 * ```
 */

// ===== BOYA ANALİZİ SONUCU =====

/**
 * Boya Analizi Sonucu Interface
 * 
 * Backend PaintAnalysisService'den gelen tam analiz sonucu
 * Backend prompt'ındaki JSON format ile %100 uyumlu
 */
export interface PaintAnalysisResult {
  /** Boya durumu */
  boyaDurumu: 'mükemmel' | 'iyi' | 'orta' | 'kötü' | 'kritik'
  
  /** Boya kalitesi */
  boyaKalitesi: BoyaKalitesi
  
  /** Renk analizi */
  renkAnalizi: RenkAnalizi
  
  /** Yüzey analizi */
  yüzeyAnalizi: YüzeyAnalizi
  
  /** Boya kusurları */
  boyaKusurları: BoyaKusurları
  
  /** Teknik detaylar */
  teknikDetaylar: TeknikDetaylar
  
  /** Öneriler */
  öneriler: BoyaÖnerileri
  
  /** Maliyet tahmini */
  maliyetTahmini: MaliyetTahmini
  
  /** AI sağlayıcı */
  aiSağlayıcı: string
  
  /** AI model */
  model: string
  
  /** Güven seviyesi (0-100) */
  güvenSeviyesi: number
  
  /** Analiz zamanı (ISO) */
  analizZamanDamgası: string
}

// ===== BOYA KALİTESİ =====

/**
 * Boya Kalitesi Interface
 * 
 * Boyanın genel kalite metrikleri
 */
export interface BoyaKalitesi {
  /** Genel puan (0-100) */
  genelPuan: number
  
  /** Parlaklık seviyesi (0-100) */
  parlaklıkSeviyesi: number
  
  /** Pürüzsüzlük (0-100) */
  pürüzsüzlük: number
  
  /** Tekdüzelik (0-100) */
  tekdüzelik: number
  
  /** Yapışma (0-100) */
  yapışma: number
  
  /** Dayanıklılık (0-100) */
  dayanıklılık: number
  
  /** Hava koşullarına direnç (0-100) */
  havaDirenci: number
  
  /** UV koruma (0-100) */
  uvKoruması: number
}

// ===== RENK ANALİZİ =====

/**
 * Renk Analizi Interface
 * 
 * Boyanın renk özellikleri
 */
export interface RenkAnalizi {
  /** Renk kodu (örn: "1G3") */
  renkKodu: string
  
  /** Renk adı (örn: "Gümüş Metalik") */
  renkAdı: string
  
  /** Renk ailesi (örn: "Gümüş") */
  renkAilesi: string
  
  /** Metalik mi? */
  metalik: boolean
  
  /** Perle mi? */
  inci: boolean
  
  /** Renk eşleşmesi (0-100) */
  renkEşleşmesi: number
  
  /** Renk tutarlılığı (0-100) */
  renkTutarlılığı: number
  
  /** Renk derinliği (0-100) */
  renkDerinliği: number
  
  /** Renk canlılığı (0-100) */
  renkCanlılığı: number
  
  /** Renk solması (0-100) */
  renkSolması: number
  
  /** Renk kayması (0-100) */
  renkKayması: number
  
  /** Orijinal renk mi? */
  orijinalRenk: boolean
  
  /** Boya tespit edildi mi? */
  boyaTespitEdildi: boolean
  
  /** Renk geçmişi */
  renkGeçmişi: string[]
}

// ===== YÜZEY ANALİZİ =====

/**
 * Yüzey Analizi Interface
 * 
 * Boya yüzeyi ve kalınlık ölçümleri
 */
export interface YüzeyAnalizi {
  /** Boya kalınlığı (mikron) */
  boyaKalınlığı: number
  
  /** Astar kalınlığı (mikron) */
  astarKalınlığı: number
  
  /** Baz kat kalınlığı (mikron) */
  bazKatKalınlığı: number
  
  /** Vernik kalınlığı (mikron) */
  vernikKalınlığı: number
  
  /** Toplam kalınlık (mikron) */
  toplamKalınlık: number
  
  /** Kalınlık tekdüzeliği (0-100) */
  kalınlıkTekdüzeliği: number
  
  /** Yüzey pürüzlülüğü (0-100) */
  yüzeyPürüzlülüğü: number
  
  /** Portakal kabuğu efekti (0-100) */
  portakalKabuğu: number
  
  /** Akıntı (0-100) */
  akıntılar: number
  
  /** Sarkma (0-100) */
  sarkmalar: number
  
  /** Kirlilik (0-100) */
  kir: number
  
  /** Kontaminasyon (0-100) */
  kontaminasyon: number
  
  /** Yüzey kusurları */
  yüzeyKusurları: YüzeyKusuru[]
}

/**
 * Yüzey Kusuru Interface
 * 
 * Tespit edilen yüzey kusurları
 */
export interface YüzeyKusuru {
  /** Kusur ID'si */
  id: string
  
  /** Kusur türü */
  tür: 'portakal_kabuğu' | 'akıntı' | 'sarkma' | 'kir' | 'kontaminasyon' | 'balık_gözü' | 'krater' | 'kabarcık' | 'çatlak' | 'soyulma'
  
  /** Şiddet */
  şiddet: 'minimal' | 'düşük' | 'orta' | 'yüksek' | 'kritik'
  
  /** Konum */
  konum: string
  
  /** Boyut (cm²) */
  boyut: number
  
  /** Açıklama */
  açıklama: string
  
  /** Onarılabilir mi? */
  onarılabilir: boolean
  
  /** Onarım maliyeti (TL) */
  onarımMaliyeti: number
}

// ===== BOYA KUSURLARI =====

/**
 * Boya Kusurları Interface
 * 
 * Backend prompt'ındaki paintDefects ile uyumlu
 */
export interface BoyaKusurları {
  /** Yüzey kusurları */
  yüzeyKusurları: YüzeyKusuru[]
  
  /** Renk sorunları */
  renkSorunları: RenkSorunu[]
  
  /** Parlaklık sorunları */
  parlaklıkSorunları: ParlaklıkSorunu[]
  
  /** Kalınlık değişimleri */
  kalınlıkDeğişimleri: KalınlıkDeğişimi[]
  
  /** Toplam kusur puanı (0-100) */
  toplamKusurPuanı: number
}

/**
 * Yüzey Kusuru Interface
 * 
 * Tespit edilen yüzey kusurları
 */
export interface SurfaceDefect {
  /** Kusur ID'si */
  id: string
  
  /** Kusur türü */
  type: 'orange_peel' | 'runs' | 'sags' | 'dirt' | 'contamination' | 'fish_eye' | 'crater' | 'blister' | 'crack' | 'peel'
  
  /** Şiddet */
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  
  /** Konum */
  location: string
  
  /** Boyut (cm²) */
  size: number
  
  /** Açıklama */
  description: string
  
  /** Onarılabilir mi? */
  repairable: boolean
  
  /** Onarım maliyeti (TL) */
  repairCost: number
}

/**
 * Renk Sorunu Interface
 */
export interface RenkSorunu {
  /** Sorun ID'si */
  id: string
  
  /** Sorun türü */
  tür: string
  
  /** Şiddet */
  şiddet: string
  
  /** Konum */
  konum: string
  
  /** Açıklama */
  açıklama: string
  
  /** Onarılabilir mi? */
  onarılabilir: boolean
  
  /** Onarım maliyeti (TL) */
  onarımMaliyeti: number
}

/**
 * Parlaklık Sorunu Interface
 */
export interface ParlaklıkSorunu {
  /** Sorun ID'si */
  id: string
  
  /** Sorun türü */
  tür: string
  
  /** Şiddet */
  şiddet: string
  
  /** Konum */
  konum: string
  
  /** Açıklama */
  açıklama: string
  
  /** Onarılabilir mi? */
  onarılabilir: boolean
  
  /** Onarım maliyeti (TL) */
  onarımMaliyeti: number
}

/**
 * Kalınlık Değişimi Interface
 */
export interface KalınlıkDeğişimi {
  /** Değişim ID'si */
  id: string
  
  /** Değişim türü */
  tür: string
  
  /** Şiddet */
  şiddet: string
  
  /** Konum */
  konum: string
  
  /** Kalınlık (mikron) */
  kalınlık: number
  
  /** Açıklama */
  açıklama: string
  
  /** Onarılabilir mi? */
  onarılabilir: boolean
  
  /** Onarım maliyeti (TL) */
  onarımMaliyeti: number
}

// ===== TEKNİK DETAYLAR =====

/**
 * Teknik Detaylar Interface
 * 
 * Boya sistemi ve uygulama detayları
 */
export interface TeknikDetaylar {
  /** Boya sistemi (örn: "3 Katlı Sistem") */
  boyaSistemi: string
  
  /** Astar türü */
  astarTürü: string
  
  /** Baz kat */
  bazKat: string
  
  /** Vernik */
  vernik: string
  
  /** Boya markası */
  boyaMarkası: string
  
  /** Boya türü */
  boyaTürü: string
  
  /** Uygulama yöntemi */
  uygulamaYöntemi: string
  
  /** Kurutma yöntemi */
  kurutmaYöntemi: string
  
  /** Boya yaşı (yıl) */
  boyaYaşı: number
  
  /** Son boya (yıl) */
  sonBoya: number
  
  /** Boya katman sayısı */
  boyaKatmanSayısı: number
  
  /** Kalite sınıfı */
  kaliteSınıfı: 'OEM' | 'aftermarket' | 'unknown'
}

// ===== BOYA ÖNERİLERİ =====

/**
 * Boya Önerileri Interface
 * 
 * Bakım ve iyileştirme önerileri
 */
export interface BoyaÖnerileri {
  /** Acil öneriler */
  acil: string[]
  
  /** Kısa vadeli öneriler */
  kısaVadeli: string[]
  
  /** Uzun vadeli öneriler */
  uzunVadeli: string[]
  
  /** Bakım önerileri */
  bakım: string[]
  
  /** Koruma önerileri */
  koruma: string[]
  
  /** Restorasyon önerileri */
  restorasyon: string[]
  
  /** Önleme önerileri */
  önleme: string[]
}

// ===== BOYA MALİYET TAHMİNİ =====

/**
 * Boya Maliyet Tahmini Interface
 * 
 * Detaylı maliyet kırılımı ve zaman çizelgesi
 */
export interface MaliyetTahmini {
  /** Toplam maliyet (TL) */
  toplamMaliyet: number
  
  /** İşçilik maliyeti (TL) */
  işçilikMaliyeti: number
  
  /** Malzeme maliyeti (TL) */
  malzemeMaliyeti: number
  
  /** Hazırlık maliyeti (TL) */
  hazırlıkMaliyeti: number
  
  /** Boya maliyeti (TL) */
  boyaMaliyeti: number
  
  /** Vernik maliyeti (TL) */
  vernikMaliyeti: number
  
  /** Ek maliyetler (TL) */
  ekMaliyetler: number
  
  /** Maliyet detayı */
  maliyetKırılımı: {
    /** Kategori */
    kategori: string
    /** Maliyet (TL) */
    maliyet: number
    /** Açıklama */
    açıklama: string
  }[]
  
  /** Zaman çizelgesi */
  zamanÇizelgesi: {
    /** Faz */
    faz: string
    /** Süre (saat) */
    süre: number
    /** Açıklama */
    açıklama: string
  }[]
  
  /** Garanti */
  garanti: {
    /** Kapsam */
    kapsam: boolean
    /** Süre */
    süre: string
    /** Koşullar */
    koşullar: string[]
  }
}

// ===== ENUMS VE CONSTANTS =====

/**
 * Boya Durumu Enum
 */
export enum BoyaDurumu {
  MÜKEMMEL = 'mükemmel',
  İYİ = 'iyi',
  ORTA = 'orta',
  KÖTÜ = 'kötü',
  KRİTİK = 'kritik'
}

/**
 * Boya Durumu Açıklamaları
 */
export const BoyaDurumuAçıklamaları: Record<BoyaDurumu, string> = {
  [BoyaDurumu.MÜKEMMEL]: 'Mükemmel',
  [BoyaDurumu.İYİ]: 'İyi',
  [BoyaDurumu.ORTA]: 'Orta',
  [BoyaDurumu.KÖTÜ]: 'Kötü',
  [BoyaDurumu.KRİTİK]: 'Kritik'
}

/**
 * Boya Durumu Renkleri
 */
export const BoyaDurumuRenkleri: Record<BoyaDurumu, string> = {
  [BoyaDurumu.MÜKEMMEL]: 'text-green-600',
  [BoyaDurumu.İYİ]: 'text-blue-600',
  [BoyaDurumu.ORTA]: 'text-yellow-600',
  [BoyaDurumu.KÖTÜ]: 'text-orange-600',
  [BoyaDurumu.KRİTİK]: 'text-red-600'
}

/**
 * Boya Durumu Arka Plan Renkleri
 */
export const BoyaDurumuArkaPlanRenkleri: Record<BoyaDurumu, string> = {
  [BoyaDurumu.MÜKEMMEL]: 'bg-green-100',
  [BoyaDurumu.İYİ]: 'bg-blue-100',
  [BoyaDurumu.ORTA]: 'bg-yellow-100',
  [BoyaDurumu.KÖTÜ]: 'bg-orange-100',
  [BoyaDurumu.KRİTİK]: 'bg-red-100'
}
