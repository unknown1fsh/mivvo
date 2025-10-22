/**
 * Pricing Constants (Fiyatlandırma Sabitleri)
 * 
 * Dashboard ve Pricing sayfasında paylaşımlı olarak kullanılacak
 * kampanya ve paket bilgileri.
 */

export const PRICING_PACKAGES = [
  {
    id: 'starter',
    name: 'Başlangıç Paketi',
    price: 149,
    credits: 150,
    bonus: 1,
    period: 'tek seferlik',
    description: 'İlk kez kullanıcılar için',
    features: [
      '150 kredi (150 TL değerinde)',
      '1 TL bonus kredi',
      '~3 Boya Analizi (399₺)',
      '~2 Hasar Analizi (499₺)',
      '~1 Motor Sesi Analizi (299₺)',
      'Tüm analizlere erişim'
    ],
    popular: false,
    badge: null
  },
  {
    id: 'professional',
    name: 'Profesyonel Paket',
    price: 649,
    credits: 750,
    bonus: 101,
    period: 'tek seferlik',
    description: 'En popüler seçenek ⭐',
    features: [
      '750 kredi (750 TL değerinde)',
      '101 TL bonus kredi (%15.6)',
      '~15 Boya Analizi (399₺)',
      '~10 Hasar Analizi (499₺)',
      '~4 Kapsamlı Ekspertiz (899₺)',
      'Öncelikli destek',
      '7/24 WhatsApp destek'
    ],
    popular: true,
    badge: 'En Popüler'
  },
  {
    id: 'enterprise',
    name: 'Kurumsal Paket',
    price: 1199,
    credits: 1500,
    bonus: 301,
    period: 'tek seferlik',
    description: 'Galeri ve kurumsal müşteriler',
    features: [
      '1500 kredi (1500 TL değerinde)',
      '301 TL bonus kredi (%25.1)',
      '~30 Boya Analizi (399₺)',
      '~21 Hasar Analizi (499₺)',
      '~8 Kapsamlı Ekspertiz (899₺)',
      '7/24 öncelikli destek',
      'Özel hesap yöneticisi',
      'Toplu işlem indirimleri'
    ],
    popular: false,
    badge: 'Kurumsal'
  }
]

// Dashboard için kısaltılmış versiyon
export const DASHBOARD_PACKAGES = PRICING_PACKAGES.map(pkg => ({
  id: pkg.id,
  name: pkg.name.replace(' Paketi', '').replace(' Paket', ''),
  price: pkg.price,
  credits: pkg.credits,
  bonus: pkg.bonus,
  popular: pkg.popular,
  badge: pkg.badge
}))
