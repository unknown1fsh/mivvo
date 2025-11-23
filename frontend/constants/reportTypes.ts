/**
 * Report Types Constants (Rapor Tipleri Sabitleri)
 * 
 * Clean Architecture - Constants Layer (Sabitler Katmanı)
 * 
 * Bu dosya, rapor tipleri ve form adımları için sabitleri içerir.
 * 
 * İçerik:
 * - REPORT_TYPES: Mevcut rapor tipleri ve fiyatları
 * - Analysis adımları (Paint, Damage, Engine, Value, Full)
 * - getStepsForReportType(): Rapor tipine göre adımları getiren helper
 * 
 * Kullanım:
 * ```typescript
 * import { REPORT_TYPES, getStepsForReportType } from '@/constants'
 * 
 * const steps = getStepsForReportType('PAINT_ANALYSIS')
 * ```
 */

import { ReportType } from '@/types/report'

/**
 * Report Types (Rapor Tipleri)
 * 
 * Mevcut tüm rapor tipleri, fiyatları ve özellikleri.
 * 
 * Her rapor tipi için:
 * - id: Benzersiz ID
 * - name: Rapor adı
 * - price: Fiyat (kredi)
 * - description: Açıklama
 * - features: Özellikler listesi
 * - icon: Emoji ikonu
 * - popular: Popüler mi? (opsiyonel)
 */
export const REPORT_TYPES: ReportType[] = [
  {
    id: 'PAINT_ANALYSIS',
    name: 'Boya Analizi',
    price: 399,
    description: 'Araç boyasının durumu ve kalitesi analizi',
    features: ['Renk eşleştirme', 'Çizik tespiti', 'Kalite değerlendirmesi'],
    icon: '🎨'
  },
  {
    id: 'DAMAGE_ANALYSIS',
    name: 'Hasar Analizi',
    price: 499,
    description: 'AI destekli kapsamlı hasar tespiti ve değerlendirmesi',
    features: ['Çarpışma hasarları', 'Çizik analizi', 'Onarım maliyeti', 'Güvenlik riski değerlendirmesi'],
    icon: '🔧'
  },
  {
    id: 'ENGINE_SOUND_ANALYSIS',
    name: 'Motor Ses Analizi',
    price: 299,
    description: 'Motor sesinden arıza tespiti ve performans analizi',
    features: ['Motor arıza tespiti', 'Performans değerlendirmesi', 'Akustik analiz raporu', 'Arıza öncelik sıralaması'],
    icon: '🎵'
  },
  {
    id: 'VALUE_ESTIMATION',
    name: 'Değer Tahmini',
    price: 299,
    description: 'Araç piyasa değeri tahmini',
    features: ['Piyasa analizi', 'Değer hesaplama', 'Raporlama'],
    icon: '💰'
  },
  {
    id: 'FULL_REPORT',
    name: 'Tam Expertiz',
    price: 899,
    description: 'Tüm analizlerin dahil olduğu kapsamlı rapor',
    features: ['Tüm analizler', 'Detaylı rapor', 'Uzman görüşü'],
    icon: '📋',
    popular: true
  }
]

/**
 * Step Interface (Adım Arayüzü)
 * 
 * Form wizard adımları için tip tanımı.
 */
export interface Step {
  /** Adım numarası */
  id: number
  
  /** Adım adı */
  name: string
  
  /** Adım açıklaması */
  description: string
}

/**
 * Paint Analysis Steps (Boya Analizi Adımları)
 * 
 * Boya analizi form wizard adımları.
 */
export const PAINT_ANALYSIS_STEPS: Step[] = [
  { id: 1, name: 'Rapor Türü', description: 'Analiz türünü seçin' },
  { id: 2, name: 'Araç Bilgileri', description: 'Araç detaylarını girin' },
  { id: 3, name: 'Resim Yükleme', description: 'Araç resimlerini yükleyin' },
  { id: 4, name: 'Özet', description: 'Bilgileri kontrol edin' },
]

/**
 * Engine Sound Analysis Steps (Motor Ses Analizi Adımları)
 * 
 * Motor sesi analizi form wizard adımları.
 */
export const ENGINE_SOUND_ANALYSIS_STEPS: Step[] = [
  { id: 1, name: 'Rapor Türü', description: 'Analiz türünü seçin' },
  { id: 2, name: 'Araç Bilgileri', description: 'Araç detaylarını girin' },
  { id: 3, name: 'Ses Kaydı', description: 'Motor sesini kaydedin' },
  { id: 4, name: 'Özet', description: 'Bilgileri kontrol edin' },
]

/**
 * Damage Analysis Steps (Hasar Analizi Adımları)
 * 
 * Hasar analizi form wizard adımları.
 */
export const DAMAGE_ANALYSIS_STEPS: Step[] = [
  { id: 1, name: 'Rapor Türü', description: 'Analiz türünü seçin' },
  { id: 2, name: 'Araç Bilgileri', description: 'Araç detaylarını girin' },
  { id: 3, name: 'Resim Yükleme', description: 'Hasar resimlerini yükleyin' },
  { id: 4, name: 'Özet', description: 'Bilgileri kontrol edin' },
]

/**
 * Value Estimation Steps (Değer Tahmini Adımları)
 * 
 * Değer tahmini form wizard adımları.
 */
export const VALUE_ESTIMATION_STEPS: Step[] = [
  { id: 1, name: 'Rapor Türü', description: 'Analiz türünü seçin' },
  { id: 2, name: 'Araç Bilgileri', description: 'Araç detaylarını girin' },
  { id: 3, name: 'Resim Yükleme', description: 'Araç resimlerini yükleyin' },
  { id: 4, name: 'Özet', description: 'Bilgileri kontrol edin' },
]

/**
 * Full Report Steps (Tam Expertiz Adımları)
 * 
 * Tam expertiz form wizard adımları.
 * 
 * NOT: Hem görsel hem ses kaydı içerir (5 adım).
 */
export const FULL_REPORT_STEPS: Step[] = [
  { id: 1, name: 'Rapor Türü', description: 'Analiz türünü seçin' },
  { id: 2, name: 'Araç Bilgileri', description: 'Araç detaylarını girin' },
  { id: 3, name: 'Resim Yükleme', description: 'Araç resimlerini yükleyin' },
  { id: 4, name: 'Ses Kaydı', description: 'Motor sesini kaydedin' },
  { id: 5, name: 'Özet', description: 'Bilgileri kontrol edin' },
]

/**
 * Get Steps For Report Type (Rapor Tipine Göre Adımları Getir)
 * 
 * Verilen rapor tipi ID'sine göre ilgili form wizard adımlarını döner.
 * 
 * @param reportTypeId - Rapor tipi ID
 * 
 * @returns İlgili adımlar dizisi
 * 
 * @example
 * const steps = getStepsForReportType('PAINT_ANALYSIS')
 * // [{ id: 1, name: 'Rapor Türü', ... }, ...]
 */
export const getStepsForReportType = (reportTypeId: string): Step[] => {
  switch (reportTypeId) {
    case 'PAINT_ANALYSIS':
      return PAINT_ANALYSIS_STEPS
    case 'ENGINE_SOUND_ANALYSIS':
      return ENGINE_SOUND_ANALYSIS_STEPS
    case 'DAMAGE_ANALYSIS':
      return DAMAGE_ANALYSIS_STEPS
    case 'VALUE_ESTIMATION':
      return VALUE_ESTIMATION_STEPS
    case 'FULL_REPORT':
      return FULL_REPORT_STEPS
    default:
      // Varsayılan olarak boya analizi adımlarını döner
      return PAINT_ANALYSIS_STEPS
  }
}

