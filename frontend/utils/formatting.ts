/**
 * Formatting Utils (Formatlama Yardımcı Fonksiyonları)
 * 
 * Clean Architecture - Utility Layer (Yardımcı Katman)
 * 
 * Bu dosya, veri formatlama için yardımcı fonksiyonlar sağlar.
 * 
 * Fonksiyonlar:
 * - formatCurrency: Para formatlama
 * - formatNumber: Sayı formatlama
 * - formatPercentage: Yüzde formatlama
 * - capitalizeFirst: İlk harf büyük
 * - truncateText: Metin kısaltma
 * 
 * Kullanım:
 * ```typescript
 * import { formatCurrency, formatNumber } from '@/utils'
 * 
 * const price = formatCurrency(1500) // "1.500 ₺"
 * const count = formatNumber(1234567) // "1.234.567"
 * ```
 */

/**
 * Format Currency (Para Formatla)
 * 
 * Sayıyı Türk Lirası formatında gösterir.
 * 
 * Özellikler:
 * - Türkçe sayı formatı (noktalı: 1.500)
 * - Para birimi simgesi (₺)
 * - Kuruş gösterilmez (tam sayı)
 * 
 * @param amount - Tutar
 * @param currency - Para birimi simgesi (default: '₺')
 * 
 * @returns Formatlanmış tutar
 * 
 * @example
 * formatCurrency(1500) // "1.500 ₺"
 * formatCurrency(25000) // "25.000 ₺"
 * formatCurrency(1500, '$') // "1.500 $"
 */
export const formatCurrency = (amount: number, currency: string = '₺'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('TRY', currency)
}

/**
 * Format Number (Sayı Formatla)
 * 
 * Sayıyı Türkçe formatta gösterir.
 * 
 * Özellikler:
 * - Binlik ayracı (nokta: 1.234.567)
 * - Ondalık ayracı (virgül: 1,5)
 * 
 * @param number - Formatlanacak sayı
 * 
 * @returns Formatlanmış sayı
 * 
 * @example
 * formatNumber(1234567) // "1.234.567"
 * formatNumber(1500) // "1.500"
 * formatNumber(1.5) // "1,5"
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('tr-TR').format(number)
}

/**
 * Format Percentage (Yüzde Formatla)
 * 
 * Sayıyı yüzde formatında gösterir.
 * 
 * @param value - Yüzde değeri (örn: 75)
 * 
 * @returns Formatlanmış yüzde (örn: "75%")
 * 
 * @example
 * formatPercentage(75) // "75%"
 * formatPercentage(100) // "100%"
 * formatPercentage(33.5) // "33.5%"
 */
export const formatPercentage = (value: number): string => {
  return `${value}%`
}

/**
 * Capitalize First (İlk Harf Büyük)
 * 
 * Metnin ilk harfini büyük yapar, geri kalanını küçük.
 * 
 * @param str - Metin
 * 
 * @returns Formatlanmış metin
 * 
 * @example
 * capitalizeFirst('MERHABA') // "Merhaba"
 * capitalizeFirst('toyota') // "Toyota"
 * capitalizeFirst('bMW') // "Bmw"
 */
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Truncate Text (Metin Kısalt)
 * 
 * Metni belirtilen uzunlukta keser ve sonuna "..." ekler.
 * 
 * @param text - Kısaltılacak metin
 * @param maxLength - Maksimum uzunluk
 * 
 * @returns Kısaltılmış metin
 * 
 * @example
 * truncateText('Çok uzun bir metin örneği', 10) // "Çok uzun b..."
 * truncateText('Kısa', 10) // "Kısa"
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
