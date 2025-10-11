/**
 * Utils Index (Yardımcılar İndeksi)
 * 
 * Clean Architecture - Utility Layer (Yardımcı Katman)
 * 
 * Bu dosya, tüm utility fonksiyonlarını merkezileştirir.
 * 
 * İçerik:
 * - dateUtils: Tarih işlemleri
 * - fileUtils: Dosya işlemleri
 * - formatting: Veri formatlama
 * - validation: Veri doğrulama
 * - pdfGenerator: PDF oluşturma (temel)
 * - pdfDamageAnalysis: Hasar analizi PDF'i
 * - pdfValueEstimation: Değer tahmini PDF'i
 * - pdfComprehensiveExpertise: Tam ekspertiz PDF'i
 * 
 * Kullanım:
 * ```typescript
 * // Tekli import
 * import { formatDate, validateEmail } from '@/utils'
 * 
 * // Çoklu import
 * import {
 *   formatCurrency,
 *   formatNumber,
 *   validatePlate,
 *   createImagePreview
 * } from '@/utils'
 * ```
 */

// ===== FILE UTILS =====

/**
 * File Utils (Dosya Yardımcıları)
 * 
 * Dosya doğrulama, önizleme oluşturma, boyut formatlama.
 */
export * from './fileUtils'

// ===== VALIDATION UTILS =====

/**
 * Validation Utils (Doğrulama Yardımcıları)
 * 
 * Email, telefon, plaka, yıl, kilometre doğrulama.
 */
export * from './validation'

// ===== FORMATTING UTILS =====

/**
 * Formatting Utils (Formatlama Yardımcıları)
 * 
 * Para, sayı, yüzde, metin formatlama.
 */
export * from './formatting'

// ===== DATE UTILS =====

/**
 * Date Utils (Tarih Yardımcıları)
 * 
 * Tarih formatlama, göreceli zaman, bugün kontrolü.
 */
export * from './dateUtils'
