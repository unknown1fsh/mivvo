/**
 * Constants Index (Sabitler İndeksi)
 * 
 * Clean Architecture - Constants Layer (Sabitler Katmanı)
 * 
 * Bu dosya, tüm sabitleri merkezileştirir.
 * 
 * İçerik:
 * - reportTypes: Rapor tipleri ve adımlar
 * - formValidation: Form doğrulama sabitleri
 * - apiEndpoints: API uç noktaları
 * - uiConstants: UI sabitleri
 * 
 * Kullanım:
 * ```typescript
 * // Tekli import
 * import { REPORT_TYPES, API_ENDPOINTS } from '@/constants'
 * 
 * // Çoklu import
 * import {
 *   VEHICLE_BRANDS,
 *   FILE_CONSTRAINTS,
 *   UI_CONSTANTS
 * } from '@/constants'
 * ```
 */

// ===== REPORT TYPES =====

/**
 * Report Types & Steps (Rapor Tipleri & Adımlar)
 * 
 * Mevcut rapor tipleri, fiyatları ve form wizard adımları.
 */
export * from './reportTypes'

// ===== FORM VALIDATION =====

/**
 * Form Validation Constants (Form Doğrulama Sabitleri)
 * 
 * Araç markaları, renkleri, görsel tipleri, dosya kısıtlamaları.
 */
export * from './formValidation'

// ===== API ENDPOINTS =====

/**
 * API Endpoints (API Uç Noktaları)
 * 
 * Tüm API endpoint'leri.
 */
export * from './apiEndpoints'

// ===== UI CONSTANTS =====

/**
 * UI Constants (UI Sabitleri)
 * 
 * Animasyon, breakpoint, renk, boşluk sabitleri.
 */
export * from './uiConstants'
