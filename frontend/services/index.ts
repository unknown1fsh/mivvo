/**
 * Services Index (Servisler İndeksi)
 * 
 * Clean Architecture - Service Layer (Servis Katmanı)
 * 
 * Bu dosya, tüm servis export'larını merkezileştirir.
 * 
 * Özellikler:
 * - Tüm servisleri tek yerden export eder
 * - Named export kullanır
 * - Type export'ları da dahil eder
 * - Clean import structure sağlar
 * 
 * Kullanım:
 * ```typescript
 * // Tekli import
 * import { apiClient, authService } from '@/services'
 * 
 * // Çoklu import
 * import {
 *   userService,
 *   vehicleGarageService,
 *   reportService
 * } from '@/services'
 * 
 * // Type import
 * import type {
 *   DamageAnalysisRequest,
 *   ComprehensiveExpertiseResponse
 * } from '@/services'
 * ```
 */

// ===== CORE SERVICES =====

/**
 * API Client
 * 
 * Merkezi HTTP istemcisi.
 */
export { default as apiClient } from './apiClient';

/**
 * Auth Service
 * 
 * Kimlik doğrulama servisi.
 */
export { default as authService } from './authService';

/**
 * User Service
 * 
 * Kullanıcı yönetimi servisi.
 */
export { default as userService } from './userService';

// ===== VEHICLE SERVICES =====

/**
 * Vehicle Garage Service
 * 
 * Araç garajı yönetimi servisi.
 */
export { default as vehicleGarageService } from './vehicleGarageService';

/**
 * VIN Service
 * 
 * VIN sorgulama servisi.
 */
export { default as vinService } from './vinService';

// ===== ANALYSIS SERVICES =====

/**
 * Paint Analysis Service
 * 
 * Boya analizi servisi.
 */
export { default as paintAnalysisService } from './paintAnalysisService';

/**
 * Engine Sound Analysis Service
 * 
 * Motor sesi analizi servisi.
 */
export { default as engineSoundAnalysisService } from './engineSoundAnalysisService';

/**
 * Damage Analysis Service
 * 
 * Hasar analizi servisi.
 */
export { default as damageAnalysisService } from './damageAnalysisService';

/**
 * Comprehensive Expertise Service
 * 
 * Tam ekspertiz servisi.
 */
export { default as comprehensiveExpertiseService } from './comprehensiveExpertiseService';

// ===== REPORT SERVICES =====

/**
 * Report Service
 * 
 * Rapor yönetimi servisi.
 */
export { default as reportService } from './reportService';

// ===== TYPE EXPORTS =====

/**
 * Damage Analysis Types
 * 
 * Hasar analizi type'ları.
 */
export type { DamageAnalysisRequest, DamageAnalysisResponse, DamageArea } from './damageAnalysisService';

/**
 * Comprehensive Expertise Types
 * 
 * Tam ekspertiz type'ları.
 */
export type { ComprehensiveExpertiseRequest, ComprehensiveExpertiseResponse } from './comprehensiveExpertiseService';
