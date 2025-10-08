/**
 * Validation Utils (Doğrulama Yardımcı Fonksiyonları)
 * 
 * Clean Architecture - Utility Layer (Yardımcı Katman)
 * 
 * Bu dosya, veri doğrulama için yardımcı fonksiyonlar sağlar.
 * 
 * Fonksiyonlar:
 * - validateEmail: Email doğrulama
 * - validatePhone: Telefon doğrulama (Türkiye)
 * - validatePlate: Plaka doğrulama (Türkiye)
 * - validateYear: Yıl doğrulama
 * - validateMileage: Kilometre doğrulama
 * 
 * Kullanım:
 * ```typescript
 * import { validateEmail, validatePlate } from '@/utils'
 * 
 * const isValid = validateEmail('user@example.com') // true
 * const isValidPlate = validatePlate('34 ABC 123') // true
 * ```
 */

/**
 * Validate Email (Email Doğrula)
 * 
 * Email adresinin formatını kontrol eder.
 * 
 * Format: xxx@yyy.zzz
 * 
 * @param email - Email adresi
 * 
 * @returns true ise geçerli, false değilse
 * 
 * @example
 * validateEmail('user@example.com') // true
 * validateEmail('invalid.email') // false
 * validateEmail('test@domain') // false
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate Phone (Telefon Doğrula)
 * 
 * Türkiye telefon numarası formatını kontrol eder.
 * 
 * Geçerli formatlar:
 * - +905551234567
 * - 05551234567
 * - 5551234567
 * 
 * @param phone - Telefon numarası
 * 
 * @returns true ise geçerli, false değilse
 * 
 * @example
 * validatePhone('+905551234567') // true
 * validatePhone('05551234567') // true
 * validatePhone('5551234567') // true
 * validatePhone('555 123 45 67') // true (boşluklar temizlenir)
 * validatePhone('1234567890') // false (5 ile başlamalı)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Validate Plate (Plaka Doğrula)
 * 
 * Türkiye araç plakası formatını kontrol eder.
 * 
 * Format: 34 ABC 1234
 * - 2 rakam (il kodu)
 * - 1-3 harf (seri)
 * - 2-4 rakam (numara)
 * - Boşluklarla ayrılmış
 * 
 * @param plate - Plaka
 * 
 * @returns true ise geçerli, false değilse
 * 
 * @example
 * validatePlate('34 ABC 1234') // true
 * validatePlate('06 A 123') // true
 * validatePlate('34ABC1234') // false (boşluksuz)
 * validatePlate('34 abc 1234') // false (küçük harf)
 */
export const validatePlate = (plate: string): boolean => {
  const plateRegex = /^[0-9]{2}\s[A-Z]{1,3}\s[0-9]{2,4}$/
  return plateRegex.test(plate)
}

/**
 * Validate Year (Yıl Doğrula)
 * 
 * Araç model yılının geçerliliğini kontrol eder.
 * 
 * Geçerli aralık: 1900 - (mevcut yıl + 1)
 * 
 * @param year - Model yılı
 * 
 * @returns true ise geçerli, false değilse
 * 
 * @example
 * validateYear(2024) // true
 * validateYear(2026) // true (gelecek yıl modeli)
 * validateYear(1899) // false (çok eski)
 * validateYear(2030) // false (çok gelecek)
 */
export const validateYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear()
  return year >= 1900 && year <= currentYear + 1
}

/**
 * Validate Mileage (Kilometre Doğrula)
 * 
 * Araç kilometresinin geçerliliğini kontrol eder.
 * 
 * Geçerli aralık: 0 - 999999 km
 * 
 * @param mileage - Kilometre
 * 
 * @returns true ise geçerli, false değilse
 * 
 * @example
 * validateMileage(50000) // true
 * validateMileage(0) // true (sıfır km)
 * validateMileage(-1000) // false (negatif)
 * validateMileage(1000000) // false (çok yüksek)
 */
export const validateMileage = (mileage: number): boolean => {
  return mileage >= 0 && mileage <= 999999
}
