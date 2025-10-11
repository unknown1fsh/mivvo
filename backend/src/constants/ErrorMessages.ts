/**
 * Hata ve Başarı Mesajları Sabitleri (Error & Success Messages Constants)
 * 
 * Clean Architecture - Constants Layer (Sabitler Katmanı)
 * 
 * Bu dosya, tüm hata ve başarı mesajlarını merkezi olarak tanımlar.
 * 
 * İçerik:
 * - Kimlik doğrulama hataları
 * - Kullanıcı işlem hataları
 * - Kredi sistem hataları
 * - Dosya yükleme hataları
 * - AI analiz hataları
 * - Generic (genel) hatalar
 * - Başarı mesajları
 * 
 * Avantajları:
 * - Tutarlı mesajlaşma
 * - Çok dilli destek hazırlığı (i18n)
 * - Typo (yazım hatası) riskini azaltır
 * - Mesaj güncellemelerinde tek nokta
 * - Kullanıcı dostu Türkçe mesajlar
 * 
 * Spring Framework'teki messages.properties benzeri yapı.
 */

/**
 * Hata Mesajları
 * 
 * Kategorilere göre düzenlenmiş standart hata mesajları.
 * Exception class'larında ve controller'larda kullanılır.
 */
export const ERROR_MESSAGES = {
  // ===== KİMLİK DOĞRULAMA HATALARI (AUTHENTICATION) =====
  AUTH: {
    /**
     * Geçersiz e-posta veya şifre
     * 
     * Kullanım: Login işlemi başarısız olduğunda
     * Güvenlik: E-posta/şifre hangisi hatalı belirtilmez
     */
    INVALID_CREDENTIALS: 'Geçersiz kullanıcı adı veya şifre',

    /**
     * Yetkisiz erişim
     * 
     * Kullanım: Token olmadan korumalı endpoint'e istek
     * HTTP 401
     */
    UNAUTHORIZED: 'Yetkisiz erişim',

    /**
     * Oturum süresi dolmuş
     * 
     * Kullanım: JWT token süresi dolduğunda
     * HTTP 401
     */
    TOKEN_EXPIRED: 'Oturum süresi dolmuş',

    /**
     * Geçersiz token
     * 
     * Kullanım: JWT token format hatası veya signature hatası
     * HTTP 401
     */
    TOKEN_INVALID: 'Geçersiz token',

    /**
     * E-posta doğrulanmamış
     * 
     * Kullanım: E-posta onayı gerektiren işlemlerde
     * HTTP 403
     */
    EMAIL_NOT_VERIFIED: 'E-posta adresi doğrulanmamış',

    /**
     * Hesap pasif
     * 
     * Kullanım: Admin tarafından devre dışı bırakılmış hesap
     * HTTP 403
     */
    ACCOUNT_INACTIVE: 'Hesabınız aktif değil',
  },

  // ===== KULLANICI HATALARI (USER) =====
  USER: {
    /**
     * Kullanıcı bulunamadı
     * 
     * Kullanım: ID ile kullanıcı sorgulandığında kayıt yoksa
     * HTTP 404
     */
    NOT_FOUND: 'Kullanıcı bulunamadı',

    /**
     * E-posta zaten kayıtlı
     * 
     * Kullanım: Kayıt sırasında duplicate e-posta kontrolü
     * HTTP 409 Conflict
     */
    EMAIL_EXISTS: 'Bu e-posta adresi zaten kullanılıyor',

    /**
     * Geçersiz e-posta formatı
     * 
     * Kullanım: Validation hatası
     * HTTP 422
     */
    INVALID_EMAIL: 'Geçersiz e-posta adresi',

    /**
     * Zayıf şifre
     * 
     * Kullanım: Şifre güvenlik kriterlerini karşılamıyor
     * HTTP 422
     */
    WEAK_PASSWORD: 'Şifre çok zayıf',

    /**
     * Şifreler eşleşmiyor
     * 
     * Kullanım: Şifre ve şifre tekrarı aynı değil
     * HTTP 422
     */
    PASSWORD_MISMATCH: 'Şifreler eşleşmiyor',

    /**
     * Mevcut şifre yanlış
     * 
     * Kullanım: Şifre değiştirme sırasında eski şifre kontrolü
     * HTTP 401
     */
    CURRENT_PASSWORD_WRONG: 'Mevcut şifre yanlış',
  },

  // ===== KREDİ SİSTEMİ HATALARI (CREDITS) =====
  CREDITS: {
    /**
     * Yetersiz kredi bakiyesi
     * 
     * Kullanım: İşlem maliyeti kullanıcı bakiyesinden fazla
     * HTTP 402 Payment Required
     */
    INSUFFICIENT: 'Yetersiz kredi bakiyesi',

    /**
     * Geçersiz kredi miktarı
     * 
     * Kullanım: Negatif veya çok yüksek kredi talebi
     * HTTP 422
     */
    INVALID_AMOUNT: 'Geçersiz kredi miktarı',

    /**
     * Kredi işlemi başarısız
     * 
     * Kullanım: Veritabanı hatası veya transaction hatası
     * HTTP 500
     */
    TRANSACTION_FAILED: 'Kredi işlemi başarısız',
  },

  // ===== ARAÇ HATALARI (VEHICLE) =====
  VEHICLE: {
    /**
     * Araç bulunamadı
     * 
     * Kullanım: ID ile araç sorgulandığında kayıt yoksa
     * HTTP 404
     */
    NOT_FOUND: 'Araç bulunamadı',

    /**
     * Plaka zaten kayıtlı
     * 
     * Kullanım: Duplicate plaka kontrolü (unique constraint)
     * HTTP 409 Conflict
     */
    PLATE_EXISTS: 'Bu plaka zaten kayıtlı',

    /**
     * Geçersiz plaka formatı
     * 
     * Kullanım: Türk plaka formatı validation hatası
     * HTTP 422
     */
    INVALID_PLATE: 'Geçersiz plaka formatı',

    /**
     * Geçersiz VIN numarası
     * 
     * Kullanım: VIN formatı validation hatası (17 karakter)
     * HTTP 422
     */
    INVALID_VIN: 'Geçersiz VIN numarası',

    /**
     * VIN bulunamadı
     * 
     * Kullanım: VIN lookup servisi kayıt bulamadı
     * HTTP 404
     */
    VIN_NOT_FOUND: 'VIN numarası bulunamadı',
  },

  // ===== DOSYA YÜKLEME HATALARI (FILE UPLOAD) =====
  FILE: {
    /**
     * Dosya boyutu çok büyük
     * 
     * Kullanım: Dosya MAX_FILE_SIZE limitini aşıyor
     * HTTP 413 Payload Too Large
     */
    TOO_LARGE: 'Dosya boyutu çok büyük',

    /**
     * Geçersiz dosya tipi
     * 
     * Kullanım: İzin verilmeyen MIME type
     * HTTP 415 Unsupported Media Type
     */
    INVALID_TYPE: 'Geçersiz dosya tipi',

    /**
     * Dosya yükleme başarısız
     * 
     * Kullanım: Disk yazma hatası, permission hatası
     * HTTP 500
     */
    UPLOAD_FAILED: 'Dosya yükleme başarısız',

    /**
     * Dosya bulunamadı
     * 
     * Kullanım: Disk üzerinde dosya yok (silinmiş olabilir)
     * HTTP 404
     */
    NOT_FOUND: 'Dosya bulunamadı',

    /**
     * Dosya bozuk
     * 
     * Kullanım: Corrupt file, açılamıyor
     * HTTP 422
     */
    CORRUPTED: 'Dosya bozuk',
  },

  // ===== AI ANALİZ HATALARI (ANALYSIS) =====
  ANALYSIS: {
    /**
     * Analiz başarısız
     * 
     * Kullanım: AI servisi analiz yapamadı (generic hata)
     * HTTP 500
     */
    FAILED: 'Analiz başarısız',

    /**
     * AI servisi kullanılamıyor
     * 
     * Kullanım: OpenAI/Gemini API down veya erişilemez
     * HTTP 503 Service Unavailable
     */
    AI_UNAVAILABLE: 'AI servisi şu anda kullanılamıyor',

    /**
     * AI servis yoğunluğu
     * 
     * Kullanım: Rate limit veya yüksek talep
     * HTTP 429 Too Many Requests
     * KULLANICI DOSTU: Kredi iade garanti mesajı ile
     */
    AI_BUSY: 'AI servis yoğunluğu nedeniyle rapor oluşturulamadı. Lütfen birkaç dakika sonra tekrar deneyiniz. Kredileriniz korunmuştur.',

    /**
     * AI analizi tamamlanamadı - Kredi iade edildi
     * 
     * Kullanım: Analiz başarısız, kredi iade edildi
     * HTTP 500
     * KULLANICI DOSTU: Kredi iade edildi mesajı ile
     */
    AI_FAILED_WITH_REFUND: 'AI analizi tamamlanamadı. Kredileriniz iade edilmiştir. Lütfen tekrar deneyiniz.',

    /**
     * Yetersiz veri
     * 
     * Kullanım: Görsel veya ses dosyası eksik
     * HTTP 422
     */
    INSUFFICIENT_DATA: 'Yeterli veri bulunamadı. Lütfen daha fazla görsel veya ses dosyası yükleyiniz.',

    /**
     * Geçersiz görsel
     * 
     * Kullanım: Görüntü kalitesi düşük veya format hatalı
     * HTTP 422
     */
    INVALID_IMAGE: 'Geçersiz görsel',

    /**
     * Geçersiz ses dosyası
     * 
     * Kullanım: Ses kaydı kısa, gürültülü veya format hatalı
     * HTTP 422
     */
    INVALID_AUDIO: 'Geçersiz ses dosyası',

    /**
     * İşleme hatası
     * 
     * Kullanım: AI processing pipeline hatası
     * HTTP 500
     */
    PROCESSING_ERROR: 'İşleme hatası',

    /**
     * Analiz zaman aşımı
     * 
     * Kullanım: AI servisi timeout süresini aştı
     * HTTP 504 Gateway Timeout
     */
    TIMEOUT: 'Analiz zaman aşımına uğradı. Lütfen tekrar deneyiniz.',
  },

  // ===== RAPOR HATALARI (REPORT) =====
  REPORT: {
    /**
     * Rapor bulunamadı
     * 
     * Kullanım: ID ile rapor sorgulandığında kayıt yoksa
     * HTTP 404
     */
    NOT_FOUND: 'Rapor bulunamadı',

    /**
     * Rapora erişim yetkisi yok
     * 
     * Kullanım: Kullanıcı başka kullanıcının raporuna erişmeye çalıştı
     * HTTP 403 Forbidden
     */
    ACCESS_DENIED: 'Bu rapora erişim yetkiniz yok',

    /**
     * Rapor oluşturulamadı
     * 
     * Kullanım: PDF generation hatası
     * HTTP 500
     */
    GENERATION_FAILED: 'Rapor oluşturulamadı',
  },

  // ===== ÖDEME HATALARI (PAYMENT) =====
  PAYMENT: {
    /**
     * Ödeme başarısız
     * 
     * Kullanım: Payment gateway hatası
     * HTTP 402 Payment Required
     */
    FAILED: 'Ödeme işlemi başarısız',

    /**
     * Geçersiz tutar
     * 
     * Kullanım: Negatif veya çok yüksek ödeme talebi
     * HTTP 422
     */
    INVALID_AMOUNT: 'Geçersiz tutar',

    /**
     * Ödeme sağlayıcı hatası
     * 
     * Kullanım: Stripe, PayTR vb. API hatası
     * HTTP 503
     */
    PROVIDER_ERROR: 'Ödeme sağlayıcı hatası',
  },

  // ===== GENEL HATALAR (GENERIC) =====
  GENERIC: {
    /**
     * Sunucu hatası
     * 
     * Kullanım: Catch-all için, beklenmeyen hatalar
     * HTTP 500
     */
    INTERNAL_ERROR: 'Sunucu hatası',

    /**
     * Kaynak bulunamadı
     * 
     * Kullanım: Generic 404 hatası
     * HTTP 404
     */
    NOT_FOUND: 'Kaynak bulunamadı',

    /**
     * Geçersiz istek
     * 
     * Kullanım: Generic 400 hatası
     * HTTP 400
     */
    BAD_REQUEST: 'Geçersiz istek',

    /**
     * Doğrulama hatası
     * 
     * Kullanım: Validation pipeline hatası
     * HTTP 422
     */
    VALIDATION_ERROR: 'Doğrulama hatası',

    /**
     * Veritabanı hatası
     * 
     * Kullanım: Prisma generic hatası
     * HTTP 500
     */
    DATABASE_ERROR: 'Veritabanı hatası',

    /**
     * Ağ hatası
     * 
     * Kullanım: Network connection hatası
     * HTTP 503
     */
    NETWORK_ERROR: 'Ağ hatası',
  },
};

/**
 * Başarı Mesajları
 * 
 * İşlem başarılı olduğunda kullanıcıya gösterilecek mesajlar.
 * Controller'larda başarılı response'larda kullanılır.
 */
export const SUCCESS_MESSAGES = {
  // ===== KİMLİK DOĞRULAMA BAŞARI MESAJLARI (AUTHENTICATION) =====
  AUTH: {
    /** Login başarılı - Kullanıcı sisteme giriş yaptı */
    LOGIN_SUCCESS: 'Giriş başarılı',

    /** Register başarılı - Yeni kullanıcı kaydedildi */
    REGISTER_SUCCESS: 'Kayıt başarılı',

    /** Logout başarılı - Kullanıcı çıkış yaptı */
    LOGOUT_SUCCESS: 'Çıkış başarılı',

    /** Şifre sıfırlama e-postası gönderildi */
    PASSWORD_RESET_SENT: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi',

    /** Şifre başarıyla değiştirildi */
    PASSWORD_CHANGED: 'Şifre başarıyla değiştirildi',

    /** E-posta doğrulandı */
    EMAIL_VERIFIED: 'E-posta adresi doğrulandı',
  },

  // ===== KULLANICI BAŞARI MESAJLARI (USER) =====
  USER: {
    /** Profil bilgileri güncellendi */
    PROFILE_UPDATED: 'Profil güncellendi',

    /** Şifre güncellendi */
    PASSWORD_UPDATED: 'Şifre güncellendi',
  },

  // ===== KREDİ SİSTEMİ BAŞARI MESAJLARI (CREDITS) =====
  CREDITS: {
    /** Kredi hesaba eklendi (bonus, hediye vb.) */
    ADDED: 'Kredi eklendi',

    /** Kredi satın alındı (ödeme tamamlandı) */
    PURCHASED: 'Kredi satın alındı',
  },

  // ===== ARAÇ BAŞARI MESAJLARI (VEHICLE) =====
  VEHICLE: {
    /** Yeni araç garaja eklendi */
    CREATED: 'Araç eklendi',

    /** Araç bilgileri güncellendi */
    UPDATED: 'Araç güncellendi',

    /** Araç garajdan silindi */
    DELETED: 'Araç silindi',

    /** Araç varsayılan olarak ayarlandı */
    SET_DEFAULT: 'Varsayılan araç ayarlandı',
  },

  // ===== ANALİZ BAŞARI MESAJLARI (ANALYSIS) =====
  ANALYSIS: {
    /** AI analizi tamamlandı */
    COMPLETED: 'Analiz tamamlandı',

    /** Analiz işleniyor (async operation) */
    PROCESSING: 'Analiz işleniyor',
  },

  // ===== RAPOR BAŞARI MESAJLARI (REPORT) =====
  REPORT: {
    /** Rapor oluşturuldu (PDF hazır) */
    GENERATED: 'Rapor oluşturuldu',

    /** Rapor silindi */
    DELETED: 'Rapor silindi',
  },

  // ===== ÖDEME BAŞARI MESAJLARI (PAYMENT) =====
  PAYMENT: {
    /** Ödeme başarılı (transaction completed) */
    SUCCESS: 'Ödeme başarılı',

    /** Ödeme işleniyor (pending) */
    PROCESSING: 'Ödeme işleniyor',
  },
};
