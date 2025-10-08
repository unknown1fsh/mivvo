/**
 * Sabitler Katmanı - Index (Constants Layer - Index)
 * 
 * Clean Architecture - Constants Layer (Sabitler Katmanı)
 * 
 * Tüm sabit değerlerin merkezi export noktası.
 * 
 * Bu dosya sayesinde diğer katmanlar sabitleri şu şekilde import edebilir:
 * import { API_CONSTANTS, ERROR_MESSAGES, CREDIT_PRICING } from '@/constants';
 * 
 * Sabit kategorileri:
 * - API_CONSTANTS: API konfigürasyonu (timeout, limit, izinler)
 * - API_ENDPOINTS: Tüm endpoint path'leri
 * - CREDIT_PRICING: Servis fiyatları ve kredi paketleri
 * - SERVICE_COSTS: Detaylı servis bilgileri
 * - ERROR_MESSAGES: Standart hata mesajları
 * - SUCCESS_MESSAGES: Standart başarı mesajları
 * 
 * Spring Framework'teki constants package'ına benzer yapı.
 * 
 * Kullanım örnekleri:
 * ```typescript
 * import { ERROR_MESSAGES, CREDIT_PRICING } from '@/constants';
 * 
 * // Kredi kontrolü
 * if (userBalance < CREDIT_PRICING.DAMAGE_ANALYSIS) {
 *   throw new InsufficientCreditsException(ERROR_MESSAGES.CREDITS.INSUFFICIENT);
 * }
 * 
 * // Dosya boyutu kontrolü
 * if (fileSize > API_CONSTANTS.MAX_IMAGE_SIZE) {
 *   throw new FileUploadException(ERROR_MESSAGES.FILE.TOO_LARGE);
 * }
 * ```
 */

// API sabitleri ve endpoint path'leri
export { API_CONSTANTS, API_ENDPOINTS } from './ApiConstants';

// Kredi fiyatlandırma ve servis maliyetleri
export { CREDIT_PRICING, SERVICE_COSTS } from './CreditPricing';

// Hata ve başarı mesajları
export { ERROR_MESSAGES, SUCCESS_MESSAGES } from './ErrorMessages';

