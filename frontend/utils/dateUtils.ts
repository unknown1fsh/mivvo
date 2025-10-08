/**
 * Date Utils (Tarih Yardımcı Fonksiyonları)
 * 
 * Clean Architecture - Utility Layer (Yardımcı Katman)
 * 
 * Bu dosya, tarih işlemleri için yardımcı fonksiyonlar sağlar.
 * 
 * Fonksiyonlar:
 * - formatDate: Tarih formatlama
 * - formatDateTime: Tarih/saat formatlama
 * - getRelativeTime: Göreceli zaman (örn: "5 dakika önce")
 * - isToday: Bugün mü kontrolü
 * 
 * Kullanım:
 * ```typescript
 * import { formatDate, getRelativeTime } from '@/utils'
 * 
 * const formatted = formatDate(new Date())
 * const relative = getRelativeTime('2024-01-01')
 * ```
 */

/**
 * Format Date (Tarih Formatla)
 * 
 * Tarihi lokale uygun formatta string'e çevirir.
 * 
 * @param date - Date objesi veya ISO string
 * @param locale - Dil kodu (default: 'tr-TR')
 * 
 * @returns Formatlanmış tarih (örn: "08.10.2025")
 * 
 * @example
 * formatDate(new Date()) // "08.10.2025"
 * formatDate('2025-01-15') // "15.01.2025"
 * formatDate(new Date(), 'en-US') // "10/8/2025"
 */
export const formatDate = (date: Date | string, locale: string = 'tr-TR'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale)
}

/**
 * Format Date Time (Tarih/Saat Formatla)
 * 
 * Tarih ve saati lokale uygun formatta string'e çevirir.
 * 
 * @param date - Date objesi veya ISO string
 * @param locale - Dil kodu (default: 'tr-TR')
 * 
 * @returns Formatlanmış tarih/saat (örn: "08.10.2025 14:30:00")
 * 
 * @example
 * formatDateTime(new Date()) // "08.10.2025 14:30:00"
 * formatDateTime('2025-01-15T10:30:00') // "15.01.2025 10:30:00"
 */
export const formatDateTime = (date: Date | string, locale: string = 'tr-TR'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString(locale)
}

/**
 * Get Relative Time (Göreceli Zaman)
 * 
 * Tarihi mevcut zamana göre göreceli olarak ifade eder.
 * 
 * Çıktılar:
 * - "Az önce" (< 1 dakika)
 * - "5 dakika önce" (< 1 saat)
 * - "3 saat önce" (< 1 gün)
 * - "2 gün önce" (< 1 ay)
 * - Tarih formatı (> 1 ay)
 * 
 * @param date - Date objesi veya ISO string
 * 
 * @returns Göreceli zaman string'i
 * 
 * @example
 * getRelativeTime(new Date(Date.now() - 30000)) // "Az önce"
 * getRelativeTime(new Date(Date.now() - 300000)) // "5 dakika önce"
 * getRelativeTime(new Date(Date.now() - 7200000)) // "2 saat önce"
 */
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Az önce'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} gün önce`
  
  return formatDate(dateObj)
}

/**
 * Is Today (Bugün mü?)
 * 
 * Verilen tarihin bugün olup olmadığını kontrol eder.
 * 
 * @param date - Date objesi veya ISO string
 * 
 * @returns true ise bugün, false değilse
 * 
 * @example
 * isToday(new Date()) // true
 * isToday('2025-01-01') // false
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return dateObj.toDateString() === today.toDateString()
}
