// Form validation sabitleri

export const VEHICLE_BRANDS = [
  'Toyota', 'Honda', 'Ford', 'Volkswagen', 'BMW', 'Mercedes', 
  'Audi', 'Hyundai', 'Kia', 'Renault', 'Nissan', 'Mazda', 
  'Subaru', 'Mitsubishi', 'Suzuki', 'Peugeot', 'Citroen', 'Opel'
]

export const VEHICLE_COLORS = [
  'Beyaz', 'Siyah', 'Gri', 'Gümüş', 'Mavi', 'Kırmızı', 
  'Yeşil', 'Sarı', 'Kahverengi', 'Turuncu', 'Mor', 'Pembe'
]

export const IMAGE_TYPES = [
  { id: 'exterior', label: 'Dış Görünüm', icon: '🚗', desc: 'Aracın dış yüzeyi, kapılar, tamponlar' },
  { id: 'interior', label: 'İç Mekan', icon: '🪑', desc: 'Koltuklar, direksiyon, konsol' },
  { id: 'engine', label: 'Motor', icon: '🔧', desc: 'Motor bölümü, kaput altı' },
  { id: 'damage', label: 'Hasar', icon: '⚠️', desc: 'Çizikler, çukurlar, hasarlar' },
  { id: 'paint', label: 'Boya Analizi', icon: '🎨', desc: 'Boya kalitesi ve durumu' }
]

export const FILE_CONSTRAINTS = {
  MAX_SIZE: 15 * 1024 * 1024, // 15MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_FILES: 10
}
