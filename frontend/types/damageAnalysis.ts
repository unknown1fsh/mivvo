/**
 * Hasar Analizi Types (Damage Analysis Types) - TÜRKÇE FIELD'LAR
 * 
 * Clean Architecture - Type Layer (Tip Katmanı)
 * 
 * Bu dosya, hasar analizi ile ilgili tüm TypeScript tiplerini tanımlar.
 * Backend servislerindeki interface'lerle %100 uyumlu.
 * 
 * İçerik:
 * - DamageAnalysisResult (Hasar Analizi Sonucu)
 * - DamageArea (Hasar Alanı)
 * - AnalysisSummary (Analiz Özeti)
 * - TechnicalDetails (Teknik Detaylar)
 * 
 * Kullanım:
 * ```typescript
 * import { DamageAnalysisResult } from '@/types/damageAnalysis'
 * 
 * const result: DamageAnalysisResult = await damageAnalysisService.getReport('123')
 * ```
 */

// ===== HASAR ANALİZİ SONUCU =====

/**
 * Hasar Analizi Sonucu Interface (Türkçe Field'lar)
 * 
 * Backend DamageDetectionService'den gelen tam analiz sonucu
 * Backend prompt'ındaki JSON format ile %100 uyumlu
 */
export interface DamageAnalysisResult {
  /** Tespit edilen hasar alanları */
  hasarAlanları: DamageArea[]
  
  /** Genel değerlendirme */
  genelDeğerlendirme: OverallAssessment
  
  /** Teknik analiz */
  teknikAnaliz: TechnicalAnalysis
  
  /** Güvenlik değerlendirmesi */
  güvenlikDeğerlendirmesi: SafetyAssessment
  
  /** Onarım tahmini */
  onarımTahmini: RepairEstimate
  
  /** AI sağlayıcı */
  aiSağlayıcı: string
  
  /** Model */
  model: string
  
  /** Güven seviyesi (0-100) */
  güven: number
  
  /** Analiz zamanı */
  analizZamanı: string
}

/**
 * Hasar Alanı Interface (Türkçe Field'lar)
 * 
 * Tespit edilen her hasar için detaylı bilgi
 */
export interface DamageArea {
  /** Hasar ID'si */
  id: string
  
  /** Koordinat bilgileri */
  x: number
  y: number
  genişlik: number
  yükseklik: number
  
  /** Hasar türü (Türkçe) */
  tür: 'çizik' | 'göçük' | 'pas' | 'oksidasyon' | 'çatlak' | 'kırılma' | 'boya_hasarı' | 'yapısal_hasar' | 'mekanik_hasar' | 'elektrik_hasarı'
  
  /** Hasar şiddeti (Türkçe) */
  şiddet: 'minimal' | 'düşük' | 'orta' | 'yüksek' | 'kritik'
  
  /** Güven seviyesi (0-100) */
  güven: number
  
  /** Hasar açıklaması */
  açıklama: string
  
  /** Hasar konumu (Türkçe) */
  bölge: 'ön' | 'arka' | 'sol' | 'sağ' | 'üst' | 'alt' | 'iç' | 'motor' | 'şasi'
  
  /** Onarım maliyeti (TL) */
  onarımMaliyeti: number
  
  /** Etkilenen parçalar */
  etkilenenParçalar: string[]
  
  /** Onarım önceliği (Türkçe) */
  onarımÖnceliği: 'düşük' | 'orta' | 'yüksek' | 'acil'
  
  /** Güvenlik etkisi (Türkçe) */
  güvenlikEtkisi: 'yok' | 'düşük' | 'orta' | 'yüksek' | 'kritik'
  
  /** Onarım metodu */
  onarımYöntemi: string
  
  /** Tahmini onarım süresi (saat) */
  tahminiOnarımSüresi: number
  
  /** Garanti etkisi */
  garantiEtkisi: boolean
  
  /** Sigorta kapsamı (Türkçe) */
  sigortaKapsamı: 'yok' | 'kısmi' | 'tam'
}

/**
 * Genel Değerlendirme Interface (Türkçe Field'lar)
 */
export interface OverallAssessment {
  /** Hasar seviyesi (Türkçe) */
  hasarSeviyesi: 'mükemmel' | 'iyi' | 'orta' | 'kötü' | 'kritik'
  
  /** Toplam onarım maliyeti (TL) */
  toplamOnarımMaliyeti: number
  
  /** Sigorta durumu (Türkçe) */
  sigortaDurumu: 'onarılabilir' | 'ekonomik_hasar' | 'total_hasar'
  
  /** Piyasa değeri etkisi (%) */
  piyasaDeğeriEtkisi: number
  
  /** Detaylı analiz */
  detaylıAnaliz: string
  
  /** Araç durumu (Türkçe) */
  araçDurumu: 'hasarsız' | 'hafif_hasar' | 'hasarlı' | 'ağır_hasar'
  
  /** Satış değeri (%) */
  satışDeğeri: number
  
  /** Değer kaybı (%) */
  değerKaybı: number
  
  /** Güçlü yönler */
  güçlüYönler: string[]
  
  /** Zayıf yönler */
  zayıfYönler: string[]
  
  /** Öneriler */
  öneriler: string[]
  
  /** Güvenlik endişeleri */
  güvenlikEndişeleri: string[]
}

/**
 * Teknik Analiz Interface (Türkçe Field'lar)
 */
export interface TechnicalAnalysis {
  /** Yapısal bütünlük (Türkçe) */
  yapısalBütünlük: 'sağlam' | 'hafif_hasar' | 'orta_hasar' | 'ağır_hasar' | 'bozuk'
  
  /** Güvenlik sistemleri (Türkçe) */
  güvenlikSistemleri: 'fonksiyonel' | 'hafif_sorun' | 'büyük_sorun' | 'fonksiyonsuz'
  
  /** Mekanik sistemler (Türkçe) */
  mekanikSistemler: 'çalışır' | 'hafif_sorun' | 'büyük_sorun' | 'çalışmaz'
  
  /** Elektrik sistemleri (Türkçe) */
  elektrikSistemleri: 'fonksiyonel' | 'hafif_sorun' | 'büyük_sorun' | 'fonksiyonsuz'
  
  /** Gövde hizalaması (Türkçe) */
  gövdeHizalaması: 'mükemmel' | 'hafif_sapma' | 'orta_sapma' | 'büyük_sapma'
  
  /** Şasi hasarı */
  şasiHasarı: boolean
  
  /** Hava yastığı açılması */
  havaYastığıAçılması: boolean
  
  /** Emniyet kemeri durumu (Türkçe) */
  emniyetKemeri: 'fonksiyonel' | 'inceleme_gerekli' | 'fonksiyonsuz'
  
  /** Notlar */
  notlar: string
}

/**
 * Güvenlik Değerlendirmesi Interface (Türkçe Field'lar)
 */
export interface SafetyAssessment {
  /** Yol durumu (Türkçe) */
  yolDurumu: 'güvenli' | 'koşullu' | 'güvensiz'
  
  /** Kritik sorunlar */
  kritikSorunlar: string[]
  
  /** Güvenlik önerileri */
  güvenlikÖnerileri: string[]
  
  /** İnceleme gerekli */
  incelemeGerekli: boolean
  
  /** Acil aksiyonlar */
  acilAksiyonlar: string[]
  
  /** Uzun vadeli endişeler */
  uzunVadeliEndişeler: string[]
}

/**
 * Onarım Tahmini Interface (Türkçe Field'lar)
 */
export interface RepairEstimate {
  /** Toplam maliyet (TL) */
  toplamMaliyet: number
  
  /** İşçilik maliyeti (TL) */
  işçilikMaliyeti: number
  
  /** Parça maliyeti (TL) */
  parçaMaliyeti: number
  
  /** Boya maliyeti (TL) */
  boyaMaliyeti: number
  
  /** Ek maliyetler (TL) */
  ekMaliyetler: number
  
  /** Maliyet kırılımı */
  maliyetKırılımı: RepairBreakdown[]
  
  /** Zaman çizelgesi */
  zamanÇizelgesi: RepairTimeline[]
  
  /** Garanti bilgileri */
  garanti: RepairWarranty
}

/**
 * Onarım Kırılımı Interface (Türkçe Field'lar)
 */
export interface RepairBreakdown {
  /** Parça adı */
  parça: string
  
  /** Açıklama */
  açıklama: string
  
  /** Maliyet (TL) */
  maliyet: number
}

/**
 * Onarım Zaman Çizelgesi Interface (Türkçe Field'lar)
 */
export interface RepairTimeline {
  /** Faz adı */
  faz: string
  
  /** Süre (gün) */
  süre: number
  
  /** Açıklama */
  açıklama: string
}

/**
 * Onarım Garantisi Interface (Türkçe Field'lar)
 */
export interface RepairWarranty {
  /** Garanti kapsamı */
  kapsam: boolean
  
  /** Garanti süresi */
  süre: string
  
  /** Garanti koşulları */
  koşullar: string[]
}

// ===== HASAR ANALİZİ BAŞLATMA =====

/**
 * Hasar Analizi Başlatma İsteği Interface
 * 
 * Analiz başlatmak için gerekli bilgiler
 */
export interface StartDamageAnalysisRequest {
  /** Araç bilgileri */
  vehicleInfo: {
    /** Plaka (zorunlu) */
    plate: string
    /** Marka (opsiyonel) */
    brand?: string
    /** Make (opsiyonel, brand yerine) */
    make?: string
    /** Model (zorunlu) */
    model: string
    /** Yıl (zorunlu) */
    year: number
  }
  /** Analiz tipi (opsiyonel) */
  analysisType?: 'damage' | 'comprehensive'
}

/**
 * Hasar Analizi Yanıtı Interface
 * 
 * Analiz başlatma işleminin sonucu
 */
export interface DamageAnalysisResponse {
  /** Oluşturulan rapor ID'si */
  reportId: number
  
  /** Rapor durumu */
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED'
  
  /** Araç bilgileri */
  vehicleInfo: {
    /** Plaka */
    plate: string
    /** Marka */
    brand: string
    /** Model */
    model: string
    /** Yıl */
    year: number
  }
  
  /** Kullanıcıya gösterilecek mesaj */
  message: string
}

/**
 * Analiz Sonucu Yanıtı Interface
 * 
 * Tamamlanmış analiz sonucunun tüm detayları
 */
export interface AnalysisResultResponse {
  /** Rapor ID'si */
  reportId: number
  
  /** Rapor durumu */
  status: string
  
  /** Analiz sonuçları (detaylı JSON) */
  analysisResult: any
  
  /** Araç bilgileri */
  vehicleInfo: any
  
  /** Oluşturulma tarihi */
  createdAt: Date
  
  /** Tamamlanma tarihi */
  completedAt?: Date
}

// ===== HASAR TÜRLERİ VE SEVERİTY (TÜRKÇE) =====

/**
 * Hasar Türü Enum (Türkçe)
 * 
 * Desteklenen hasar türleri
 */
export enum DamageType {
  ÇİZİK = 'çizik',
  GÖÇÜK = 'göçük',
  PAS = 'pas',
  OKSİDASYON = 'oksidasyon',
  ÇATLAK = 'çatlak',
  KIRILMA = 'kırılma',
  BOYA_HASARI = 'boya_hasarı',
  YAPISAL_HASAR = 'yapısal_hasar',
  MEKANIK_HASAR = 'mekanik_hasar',
  ELEKTRIK_HASARI = 'elektrik_hasarı'
}

/**
 * Hasar Şiddeti Enum (Türkçe)
 * 
 * Hasar şiddet seviyeleri
 */
export enum DamageSeverity {
  MİNİMAL = 'minimal',
  DÜŞÜK = 'düşük',
  ORTA = 'orta',
  YÜKSEK = 'yüksek',
  KRİTİK = 'kritik'
}

/**
 * Hasar Konumu Enum (Türkçe)
 * 
 * Hasar konumları
 */
export enum DamageArea {
  ÖN = 'ön',
  ARKA = 'arka',
  SOL = 'sol',
  SAĞ = 'sağ',
  ÜST = 'üst',
  ALT = 'alt',
  İÇ = 'iç',
  MOTOR = 'motor',
  ŞASİ = 'şasi'
}

/**
 * Güvenlik Etkisi Enum (Türkçe)
 * 
 * Güvenlik etki seviyeleri
 */
export enum SafetyImpact {
  YOK = 'yok',
  DÜŞÜK = 'düşük',
  ORTA = 'orta',
  YÜKSEK = 'yüksek',
  KRİTİK = 'kritik'
}

/**
 * Onarım Önceliği Enum (Türkçe)
 * 
 * Onarım öncelik seviyeleri
 */
export enum RepairPriority {
  DÜŞÜK = 'düşük',
  ORTA = 'orta',
  YÜKSEK = 'yüksek',
  ACİL = 'acil'
}

// ===== UTILITY TYPES =====

/**
 * Hasar Türü Açıklamaları (Türkçe)
 * 
 * Her hasar türü için Türkçe açıklama
 */
export const DamageTypeDescriptions: Record<DamageType, string> = {
  [DamageType.ÇİZİK]: 'Çizik',
  [DamageType.GÖÇÜK]: 'Göçük',
  [DamageType.PAS]: 'Paslanma',
  [DamageType.OKSİDASYON]: 'Oksidasyon',
  [DamageType.ÇATLAK]: 'Çatlama',
  [DamageType.KIRILMA]: 'Kırılma',
  [DamageType.BOYA_HASARI]: 'Boya Hasarı',
  [DamageType.YAPISAL_HASAR]: 'Yapısal Hasar',
  [DamageType.MEKANIK_HASAR]: 'Mekanik Hasar',
  [DamageType.ELEKTRIK_HASARI]: 'Elektrik Hasarı'
}

/**
 * Hasar Şiddeti Açıklamaları (Türkçe)
 * 
 * Her şiddet seviyesi için Türkçe açıklama
 */
export const DamageSeverityDescriptions: Record<DamageSeverity, string> = {
  [DamageSeverity.MİNİMAL]: 'Minimal',
  [DamageSeverity.DÜŞÜK]: 'Düşük',
  [DamageSeverity.ORTA]: 'Orta',
  [DamageSeverity.YÜKSEK]: 'Yüksek',
  [DamageSeverity.KRİTİK]: 'Kritik'
}

/**
 * Güvenlik Etkisi Açıklamaları (Türkçe)
 * 
 * Her güvenlik etki seviyesi için Türkçe açıklama
 */
export const SafetyImpactDescriptions: Record<SafetyImpact, string> = {
  [SafetyImpact.YOK]: 'Etki Yok',
  [SafetyImpact.DÜŞÜK]: 'Düşük Etki',
  [SafetyImpact.ORTA]: 'Orta Etki',
  [SafetyImpact.YÜKSEK]: 'Yüksek Etki',
  [SafetyImpact.KRİTİK]: 'Kritik Etki'
}

/**
 * Onarım Önceliği Açıklamaları (Türkçe)
 * 
 * Her öncelik seviyesi için Türkçe açıklama
 */
export const RepairPriorityDescriptions: Record<RepairPriority, string> = {
  [RepairPriority.DÜŞÜK]: 'Düşük Öncelik',
  [RepairPriority.ORTA]: 'Orta Öncelik',
  [RepairPriority.YÜKSEK]: 'Yüksek Öncelik',
  [RepairPriority.ACİL]: 'Acil'
}