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
    id: 'DAMAGE_ASSESSMENT',
    name: 'Hasar Değerlendirmesi',
    price: 35,
    description: 'Araç hasarlarının tespiti ve değerlendirmesi',
    features: ['Çarpışma hasarları', 'Çizik analizi', 'Onarım maliyeti'],
    icon: '🔧'
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
    price: 75,
    description: 'Tüm analizlerin dahil olduğu kapsamlı rapor',
    features: ['Tüm analizler', 'Detaylı rapor', 'Uzman görüşü'],
    icon: '📋',
    popular: true
  }
]

export const STEPS = [
  { id: 1, name: 'Rapor Türü', description: 'Analiz türünü seçin' },
  { id: 2, name: 'Araç Bilgileri', description: 'Araç detaylarını girin' },
  { id: 3, name: 'Resim Yükleme', description: 'Araç resimlerini yükleyin' },
  { id: 4, name: 'Özet', description: 'Bilgileri kontrol edin' },
]
