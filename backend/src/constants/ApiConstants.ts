/**
 * API Sabitleri (API Constants)
 * 
 * Clean Architecture - Constants Layer (Sabitler Katmanı)
 * 
 * Bu dosya, API ile ilgili tüm sabit değerleri içerir.
 * 
 * İçerik:
 * - API versiyon ve prefix bilgileri
 * - Pagination (sayfalama) ayarları
 * - Timeout süreleri (zaman aşımı)
 * - Dosya yükleme limitleri
 * - İzin verilen dosya tipleri
 * - Rate limiting (istek sınırlama) ayarları
 * - JWT token süreleri
 * - Kredi ayarları
 * - API endpoint path'leri
 * 
 * Avantajları:
 * - Merkezi konfigürasyon (tek yerden yönetim)
 * - Magic number kullanımını önler
 * - Değişiklikleri kolaylaştırır
 * - Kod okunabilirliğini artırır
 * 
 * Spring Framework'teki application.properties benzeri yapı.
 */

/**
 * Genel API Konfigürasyon Sabitleri
 * 
 * API'nin genel davranışını kontrol eden ayarlar.
 */
export const API_CONSTANTS = {
  // ===== VERSİYONLAMA =====
  /**
   * API versiyonu
   * Örnek kullanım: /api/v1/users
   */
  VERSION: 'v1',

  /**
   * API path prefix
   * Tüm endpoint'ler bu prefix ile başlar
   */
  PREFIX: '/api',

  // ===== SAYFALAMA (PAGINATION) =====
  /**
   * Varsayılan sayfa başına kayıt sayısı
   * Liste endpoint'lerinde limit belirtilmezse bu değer kullanılır
   */
  DEFAULT_PAGE_SIZE: 10,

  /**
   * Maximum sayfa başına kayıt sayısı
   * Client bu değerden fazla kayıt isteyemez (DoS koruması)
   */
  MAX_PAGE_SIZE: 100,

  // ===== ZAMAN AŞIMI SÜRELERİ (TIMEOUTS) =====
  /**
   * Varsayılan request timeout süresi
   * Milisaniye cinsinden (30 saniye)
   */
  DEFAULT_TIMEOUT: 30000, // 30 saniye

  /**
   * AI analiz timeout süresi
   * AI işlemleri uzun sürebileceği için yüksek tutulur
   * Milisaniye cinsinden (10 dakika)
   */
  AI_ANALYSIS_TIMEOUT: 600000, // 10 dakika

  /**
   * Dosya yükleme timeout süresi
   * Büyük dosyalar için yeterli süre tanır
   * Milisaniye cinsinden (2 dakika)
   */
  FILE_UPLOAD_TIMEOUT: 120000, // 2 dakika

  // ===== DOSYA YÜKLEME LİMİTLERİ =====
  /**
   * Maximum genel dosya boyutu
   * 50MB (Byte cinsinden)
   */
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB

  /**
   * Maximum görsel dosya boyutu
   * 10MB (Byte cinsinden)
   * Hasar ve boya analizleri için kullanılır
   */
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB

  /**
   * Maximum ses dosyası boyutu
   * 20MB (Byte cinsinden)
   * Motor sesi analizi için kullanılır
   */
  MAX_AUDIO_SIZE: 20 * 1024 * 1024, // 20MB

  /**
   * İzin verilen görsel dosya tipleri (MIME types)
   * 
   * - image/jpeg: JPEG formatı
   * - image/jpg: JPG formatı
   * - image/png: PNG formatı
   * - image/webp: WebP formatı (modern, optimize edilmiş)
   */
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

  /**
   * İzin verilen ses dosyası tipleri (MIME types)
   * 
   * - audio/mpeg, audio/mp3: MP3 formatı
   * - audio/wav: WAV formatı (yüksek kalite)
   * - audio/webm: WebM formatı
   * - audio/ogg: OGG formatı
   * - audio/m4a: M4A formatı (Apple)
   */
  ALLOWED_AUDIO_TYPES: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/m4a',
  ],

  // ===== RATE LIMITING (İSTEK SINIRLAMA) =====
  /**
   * Rate limit pencere süresi
   * Bu süre içinde maximum istek sayısı kontrol edilir
   * Milisaniye cinsinden (15 dakika)
   */
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 dakika

  /**
   * Rate limit maximum istek sayısı
   * Pencere süresi içinde bir IP'den maksimum istek sayısı
   * DoS saldırılarına karşı koruma
   */
  RATE_LIMIT_MAX_REQUESTS: 100,

  // ===== JWT (JSON WEB TOKEN) AYARLARI =====
  /**
   * Access token geçerlilik süresi
   * Kullanıcı oturumu için ana token
   * 24 saat
   */
  JWT_EXPIRATION: '24h',

  /**
   * Refresh token geçerlilik süresi
   * Access token'ı yenilemek için kullanılır
   * 7 gün
   */
  JWT_REFRESH_EXPIRATION: '7d',

  // ===== KREDİ SİSTEMİ =====
  /**
   * Yeni kullanıcıya verilen başlangıç kredisi
   * Kayıt sonrası otomatik olarak eklenir
   * 0 kredi (kullanıcı satın almalı)
   */
  INITIAL_USER_CREDITS: 0,

  /**
   * Kayıt bonusu kredisi
   * İlk kayıt yapanlara bonus olarak verilir
   * 50 kredi (tanıtım/test amaçlı)
   */
  BONUS_REGISTRATION_CREDITS: 50,
};

/**
 * API Endpoint Path'leri
 * 
 * Tüm API endpoint'lerinin path'lerini merkezi olarak tanımlar.
 * Route dosyalarında ve client'ta bu sabitler kullanılır.
 * 
 * Avantajları:
 * - Path değişikliklerinde tek yerden güncelleme
 * - Typo (yazım hatası) riskini azaltır
 * - IDE autocomplete desteği
 * - Dokümantasyon kolaylığı
 */
export const API_ENDPOINTS = {
  // ===== KİMLİK DOĞRULAMA (AUTHENTICATION) =====
  AUTH: {
    /** POST /api/v1/auth/login - Kullanıcı girişi */
    LOGIN: '/auth/login',
    
    /** POST /api/v1/auth/register - Yeni kullanıcı kaydı */
    REGISTER: '/auth/register',
    
    /** POST /api/v1/auth/logout - Kullanıcı çıkışı */
    LOGOUT: '/auth/logout',
    
    /** POST /api/v1/auth/refresh - Token yenileme */
    REFRESH: '/auth/refresh',
    
    /** POST /api/v1/auth/forgot-password - Şifre sıfırlama talebi */
    FORGOT_PASSWORD: '/auth/forgot-password',
    
    /** POST /api/v1/auth/reset-password - Şifre sıfırlama */
    RESET_PASSWORD: '/auth/reset-password',
    
    /** GET /api/v1/auth/verify-email - E-posta doğrulama */
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // ===== KULLANICI (USER) =====
  USER: {
    /** GET /api/v1/user/profile - Kullanıcı profili görüntüleme */
    PROFILE: '/user/profile',
    
    /** PUT /api/v1/user/profile - Kullanıcı profili güncelleme */
    UPDATE_PROFILE: '/user/profile',
    
    /** POST /api/v1/user/change-password - Şifre değiştirme */
    CHANGE_PASSWORD: '/user/change-password',
    
    /** GET /api/v1/user/credits - Kredi bakiyesi görüntüleme */
    CREDITS: '/user/credits',
    
    /** GET /api/v1/user/transactions - Kredi işlem geçmişi */
    TRANSACTIONS: '/user/transactions',
  },

  // ===== ARAÇ GARAJI (VEHICLE GARAGE) =====
  VEHICLE: {
    /** GET /api/v1/vehicle-garage - Kullanıcının araçlarını listele */
    LIST: '/vehicle-garage',
    
    /** POST /api/v1/vehicle-garage - Yeni araç ekle */
    CREATE: '/vehicle-garage',
    
    /** GET /api/v1/vehicle-garage/:id - Belirli aracı getir */
    GET: '/vehicle-garage/:id',
    
    /** PUT /api/v1/vehicle-garage/:id - Araç bilgilerini güncelle */
    UPDATE: '/vehicle-garage/:id',
    
    /** DELETE /api/v1/vehicle-garage/:id - Araç sil */
    DELETE: '/vehicle-garage/:id',
    
    /** POST /api/v1/vehicle-garage/:id/set-default - Varsayılan araç yap */
    SET_DEFAULT: '/vehicle-garage/:id/set-default',
  },

  // ===== AI ANALİZ SERVİSLERİ (ANALYSIS) =====
  ANALYSIS: {
    /** POST /api/v1/paint-analysis - Boya analizi başlat */
    PAINT: '/paint-analysis',
    
    /** POST /api/v1/damage-analysis - Hasar tespiti başlat */
    DAMAGE: '/damage-analysis',
    
    /** POST /api/v1/engine-sound-analysis - Motor sesi analizi başlat */
    ENGINE_SOUND: '/engine-sound-analysis',
    
    /** POST /api/v1/value-estimation - Araç değer tahmini */
    VALUE_ESTIMATION: '/value-estimation',
    
    /** POST /api/v1/comprehensive-expertise - Kapsamlı ekspertiz raporu */
    COMPREHENSIVE: '/comprehensive-expertise',
  },

  // ===== RAPORLAR (REPORTS) =====
  REPORTS: {
    /** GET /api/v1/reports - Kullanıcının raporlarını listele */
    LIST: '/reports',
    
    /** GET /api/v1/reports/:id - Belirli raporu getir */
    GET: '/reports/:id',
    
    /** DELETE /api/v1/reports/:id - Rapor sil */
    DELETE: '/reports/:id',
  },

  // ===== VIN SORGULAMA (VIN LOOKUP) =====
  VIN: {
    /** GET /api/v1/vin/lookup/:vin - VIN numarası ile araç bilgisi sorgula */
    LOOKUP: '/vin/lookup/:vin',
  },

  // ===== ÖDEME (PAYMENT) =====
  PAYMENT: {
    /** POST /api/v1/payment/add-credits - Kredi satın al */
    ADD_CREDITS: '/payment/add-credits',
    
    /** GET /api/v1/payment/history - Ödeme geçmişi */
    HISTORY: '/payment/history',
  },

  // ===== ADMİN PANELİ (ADMIN) =====
  ADMIN: {
    /** GET /api/v1/admin/users - Tüm kullanıcıları listele */
    USERS: '/admin/users',
    
    /** GET /api/v1/admin/reports - Tüm raporları listele */
    REPORTS: '/admin/reports',
    
    /** GET /api/v1/admin/analytics - Sistem istatistikleri */
    ANALYTICS: '/admin/analytics',
    
    /** GET/PUT /api/v1/admin/settings - Sistem ayarları */
    SETTINGS: '/admin/settings',
  },
};
