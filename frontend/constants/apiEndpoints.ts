/**
 * API Endpoints (API Uç Noktaları)
 * 
 * Clean Architecture - Constants Layer (Sabitler Katmanı)
 * 
 * Bu dosya, tüm API endpoint'lerini merkezileştirir.
 * 
 * Avantajlar:
 * - Tek bir yerden yönetim
 * - Tip güvenliği
 * - URL değişikliklerinde kolay güncelleme
 * - Dokümantasyon
 * 
 * Kullanım:
 * ```typescript
 * import { API_ENDPOINTS } from '@/constants'
 * 
 * const url = API_ENDPOINTS.AUTH.LOGIN
 * await apiClient.post(url, credentials)
 * ```
 */

/**
 * API Endpoints Object
 * 
 * Tüm API endpoint'lerini kategorilere göre gruplar.
 * 
 * Kategoriler:
 * - AUTH: Kimlik doğrulama
 * - USER: Kullanıcı işlemleri
 * - VEHICLE: Araç işlemleri
 * - REPORT: Rapor işlemleri
 * - PAINT_ANALYSIS: Boya analizi
 * - ENGINE_SOUND_ANALYSIS: Motor sesi analizi
 * - VEHICLE_GARAGE: Araç garajı
 * - VIN: VIN sorgulama
 */
export const API_ENDPOINTS = {
  /**
   * Authentication Endpoints (Kimlik Doğrulama)
   * 
   * Kullanıcı girişi, kaydı, çıkışı ve token yenileme.
   */
  AUTH: {
    /** Kullanıcı girişi */
    LOGIN: '/api/auth/login',
    
    /** Kullanıcı kaydı */
    REGISTER: '/api/auth/register',
    
    /** Kullanıcı çıkışı */
    LOGOUT: '/api/auth/logout',
    
    /** JWT token yenileme */
    REFRESH: '/api/auth/refresh'
  },
  
  /**
   * User Endpoints (Kullanıcı)
   * 
   * Profil, kredi ve bildirim işlemleri.
   */
  USER: {
    /** Kullanıcı profili */
    PROFILE: '/api/user/profile',
    
    /** Kullanıcı kredileri */
    CREDITS: '/api/user/credits',
    
    /** Kullanıcı bildirimleri */
    NOTIFICATIONS: '/api/user/notifications'
  },
  
  /**
   * Vehicle Endpoints (Araç)
   * 
   * Araç CRUD işlemleri.
   */
  VEHICLE: {
    /** Araç oluşturma */
    CREATE: '/api/vehicle',
    
    /** Araçları listeleme */
    LIST: '/api/vehicle',
    
    /** Araç detayı (:id parametrik) */
    DETAIL: '/api/vehicle/:id',
    
    /** Araç güncelleme (:id parametrik) */
    UPDATE: '/api/vehicle/:id'
  },
  
  /**
   * Report Endpoints (Rapor)
   * 
   * Rapor CRUD ve PDF işlemleri.
   */
  REPORT: {
    /** Rapor oluşturma */
    CREATE: '/api/vehicle/reports',
    
    /** Kullanıcının raporları */
    LIST: '/api/user/reports',
    
    /** Rapor detayı (:id parametrik) */
    DETAIL: '/api/vehicle/reports/:id',
    
    /** Rapor PDF indirme (:id parametrik) */
    PDF: '/api/vehicle/reports/:id/pdf'
  },
  
  /**
   * Paint Analysis Endpoints (Boya Analizi)
   * 
   * Boya analizi işlemleri.
   */
  PAINT_ANALYSIS: {
    /** Analiz yapma */
    ANALYZE: '/api/paint-analysis/analyze',
    
    /** Analiz geçmişi (:vehicleId parametrik) */
    HISTORY: '/api/paint-analysis/history/:vehicleId',
    
    /** Analiz raporu (:analysisId parametrik) */
    REPORT: '/api/paint-analysis/report/:analysisId'
  },
  
  /**
   * Engine Sound Analysis Endpoints (Motor Sesi Analizi)
   * 
   * Motor sesi analizi işlemleri.
   */
  ENGINE_SOUND_ANALYSIS: {
    /** Analiz yapma */
    ANALYZE: '/api/engine-sound-analysis/analyze',
    
    /** Analiz geçmişi */
    HISTORY: '/api/engine-sound-analysis/history',
    
    /** Analiz raporu (:reportId parametrik) */
    REPORT: '/api/engine-sound-analysis/:reportId',
    
    /** Rapor indirme (:reportId parametrik) */
    DOWNLOAD: '/api/engine-sound-analysis/:reportId/download',
    
    /** Analiz durumu (:reportId parametrik) */
    STATUS: '/api/engine-sound-analysis/:reportId/status'
  },
  
  /**
   * Vehicle Garage Endpoints (Araç Garajı)
   * 
   * Kullanıcının araç garajı işlemleri.
   */
  VEHICLE_GARAGE: {
    /** Garajdaki araçları listeleme */
    LIST: '/api/vehicle-garage',
    
    /** Araç detayı (:id parametrik) */
    GET: '/api/vehicle-garage/:id',
    
    /** Garaja araç ekleme */
    CREATE: '/api/vehicle-garage',
    
    /** Araç güncelleme (:id parametrik) */
    UPDATE: '/api/vehicle-garage/:id',
    
    /** Araç silme (:id parametrik) */
    DELETE: '/api/vehicle-garage/:id',
    
    /** Araç görselleri yükleme (:vehicleId parametrik) */
    UPLOAD_IMAGES: '/api/vehicle-garage/:vehicleId/images',
    
    /** Görsel silme (:vehicleId ve :imageId parametrik) */
    DELETE_IMAGE: '/api/vehicle-garage/:vehicleId/images/:imageId',
    
    /** Varsayılan araç yapma (:id parametrik) */
    SET_DEFAULT: '/api/vehicle-garage/:id/set-default',
    
    /** Araç raporları (:id parametrik) */
    REPORTS: '/api/vehicle-garage/:id/reports'
  },
  
  /**
   * VIN Endpoints (VIN Sorgulama)
   * 
   * VIN numarası ile araç bilgisi sorgulama.
   */
  VIN: {
    /** VIN sorgulama */
    LOOKUP: '/api/vin/lookup'
  }
}
