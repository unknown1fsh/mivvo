/**
 * Form Validation Constants (Form Doğrulama Sabitleri)
 * 
 * Clean Architecture - Constants Layer (Sabitler Katmanı)
 * 
 * Bu dosya, form validasyonu için kullanılan sabitleri içerir.
 * 
 * İçerik:
 * - VEHICLE_BRANDS: Araç markaları listesi
 * - VEHICLE_COLORS: Araç renkleri listesi
 * - IMAGE_TYPES: Görsel tipleri
 * - FILE_CONSTRAINTS: Dosya kısıtlamaları
 * 
 * Kullanım:
 * ```typescript
 * import { VEHICLE_BRANDS, FILE_CONSTRAINTS } from '@/constants'
 * 
 * const { isValid } = validateFile(file)
 * ```
 */

/**
 * Vehicle Brands (Araç Markaları)
 * 
 * Form'larda kullanılacak araç markaları listesi.
 * 
 * Kullanım:
 * ```typescript
 * <select>
 *   {VEHICLE_BRANDS.map(brand => (
 *     <option value={brand}>{brand}</option>
 *   ))}
 * </select>
 * ```
 */
export const VEHICLE_BRANDS = [
  'Toyota', 'Honda', 'Ford', 'Volkswagen', 'BMW', 'Mercedes', 
  'Audi', 'Hyundai', 'Kia', 'Renault', 'Nissan', 'Mazda', 
  'Subaru', 'Mitsubishi', 'Suzuki', 'Peugeot', 'Citroen', 'Opel'
]

/**
 * Vehicle Colors (Araç Renkleri)
 * 
 * Form'larda kullanılacak araç renkleri listesi.
 * Türkçe renk isimleri.
 */
export const VEHICLE_COLORS = [
  'Beyaz', 'Siyah', 'Gri', 'Gümüş', 'Mavi', 'Kırmızı', 
  'Yeşil', 'Sarı', 'Kahverengi', 'Turuncu', 'Mor', 'Pembe'
]

/**
 * Image Types (Görsel Tipleri)
 * 
 * Görsel yükleme sırasında kullanılan tip tanımları.
 * 
 * Her tip için:
 * - id: Benzersiz ID
 * - label: Görünen etiket
 * - icon: Emoji ikonu
 * - desc: Açıklama
 */
export const IMAGE_TYPES = [
  { 
    id: 'exterior', 
    label: 'Dış Görünüm', 
    icon: '🚗', 
    desc: 'Aracın dış yüzeyi, kapılar, tamponlar' 
  },
  { 
    id: 'interior', 
    label: 'İç Mekan', 
    icon: '🪑', 
    desc: 'Koltuklar, direksiyon, konsol' 
  },
  { 
    id: 'engine', 
    label: 'Motor', 
    icon: '🔧', 
    desc: 'Motor bölümü, kaput altı' 
  },
  { 
    id: 'damage', 
    label: 'Hasar', 
    icon: '⚠️', 
    desc: 'Çizikler, çukurlar, hasarlar' 
  },
  { 
    id: 'paint', 
    label: 'Boya Analizi', 
    icon: '🎨', 
    desc: 'Boya kalitesi ve durumu' 
  }
]

/**
 * File Constraints (Dosya Kısıtlamaları)
 * 
 * Dosya yükleme sırasında kullanılan kısıtlamalar.
 * 
 * Özellikler:
 * - MAX_SIZE: Maksimum dosya boyutu (15MB)
 * - ALLOWED_TYPES: İzin verilen dosya tipleri (JPEG, PNG, WebP)
 * - MAX_FILES: Maksimum dosya sayısı (10)
 * 
 * Kullanım:
 * ```typescript
 * if (file.size > FILE_CONSTRAINTS.MAX_SIZE) {
 *   alert('Dosya çok büyük!')
 * }
 * ```
 */
export const FILE_CONSTRAINTS = {
  /** Maksimum dosya boyutu (15 MB) */
  MAX_SIZE: 15 * 1024 * 1024,
  
  /** İzin verilen dosya tipleri */
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  
  /** Maksimum dosya sayısı */
  MAX_FILES: 10
}
