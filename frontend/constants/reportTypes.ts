// Rapor türleri sabitleri

import { ReportType } from '@/types/report'

export const REPORT_TYPES: ReportType[] = [
  {
    id: 'PAINT_ANALYSIS',
    name: 'Boya Analizi',
    price: 25,
    description: 'Araç boyasının durumu ve kalitesi analizi',
    features: ['Renk eşleştirme', 'Çizik tespiti', 'Kalite değerlendirmesi'],
    icon: '🎨'
  },
  {
    id: 'DAMAGE_ANALYSIS',
    name: 'Hasar Analizi',
    price: 35,
    description: 'AI destekli kapsamlı hasar tespiti ve değerlendirmesi',
    features: ['Çarpışma hasarları', 'Çizik analizi', 'Onarım maliyeti', 'Güvenlik riski değerlendirmesi'],
    icon: '🔧'
  },
  {
    id: 'ENGINE_SOUND_ANALYSIS',
    name: 'Motor Ses Analizi',
    price: 30,
    description: 'Motor sesinden arıza tespiti ve performans analizi',
    features: ['Motor arıza tespiti', 'Performans değerlendirmesi', 'Akustik analiz raporu', 'Arıza öncelik sıralaması'],
    icon: '🎵'
  },
  {
    id: 'VALUE_ESTIMATION',
    name: 'Değer Tahmini',
    price: 20,
    description: 'Araç piyasa değeri tahmini',
    features: ['Piyasa analizi', 'Değer hesaplama', 'Raporlama'],
    icon: '💰'
  },
  {
    id: 'FULL_REPORT',
    name: 'Tam Expertiz',
    price: 85,
    description: 'Tüm analizlerin dahil olduğu kapsamlı rapor',
    features: ['Tüm analizler', 'Detaylı rapor', 'Uzman görüşü'],
    icon: '📋',
    popular: true
  }
]

// Adım türleri
export interface Step {
  id: number
  name: string
  description: string
}

// Boya analizi için adımlar
export const PAINT_ANALYSIS_STEPS: Step[] = [
  { id: 1, name: 'Rapor Türü', description: 'Analiz türünü seçin' },
  { id: 2, name: 'Araç Bilgileri', description: 'Araç detaylarını girin' },
  { id: 3, name: 'Resim Yükleme', description: 'Araç resimlerini yükleyin' },
  { id: 4, name: 'Özet', description: 'Bilgileri kontrol edin' },
]

// Motor ses analizi için adımlar
export const ENGINE_SOUND_ANALYSIS_STEPS: Step[] = [
  { id: 1, name: 'Rapor Türü', description: 'Analiz türünü seçin' },
  { id: 2, name: 'Araç Bilgileri', description: 'Araç detaylarını girin' },
  { id: 3, name: 'Ses Kaydı', description: 'Motor sesini kaydedin' },
  { id: 4, name: 'Özet', description: 'Bilgileri kontrol edin' },
]

// Hasar analizi için adımlar
export const DAMAGE_ANALYSIS_STEPS: Step[] = [
  { id: 1, name: 'Rapor Türü', description: 'Analiz türünü seçin' },
  { id: 2, name: 'Araç Bilgileri', description: 'Araç detaylarını girin' },
  { id: 3, name: 'Resim Yükleme', description: 'Hasar resimlerini yükleyin' },
  { id: 4, name: 'Özet', description: 'Bilgileri kontrol edin' },
]

// Değer tahmini için adımlar
export const VALUE_ESTIMATION_STEPS: Step[] = [
  { id: 1, name: 'Rapor Türü', description: 'Analiz türünü seçin' },
  { id: 2, name: 'Araç Bilgileri', description: 'Araç detaylarını girin' },
  { id: 3, name: 'Resim Yükleme', description: 'Araç resimlerini yükleyin' },
  { id: 4, name: 'Özet', description: 'Bilgileri kontrol edin' },
]

// Tam expertiz için adımlar
export const FULL_REPORT_STEPS: Step[] = [
  { id: 1, name: 'Rapor Türü', description: 'Analiz türünü seçin' },
  { id: 2, name: 'Araç Bilgileri', description: 'Araç detaylarını girin' },
  { id: 3, name: 'Resim Yükleme', description: 'Araç resimlerini yükleyin' },
  { id: 4, name: 'Ses Kaydı', description: 'Motor sesini kaydedin' },
  { id: 5, name: 'Özet', description: 'Bilgileri kontrol edin' },
]

// Rapor türüne göre adımları getir
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
      return PAINT_ANALYSIS_STEPS
  }
}

// Varsayılan adımlar (geriye uyumluluk için)
export const STEPS = PAINT_ANALYSIS_STEPS
