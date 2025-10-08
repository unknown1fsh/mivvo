/**
 * Temel Exception Sınıfı (Base Exception)
 * 
 * Clean Architecture - Exception Layer (Hata Yönetim Katmanı)
 * 
 * Tüm özel exception sınıflarının parent class'ıdır.
 * JavaScript'in Error sınıfını extend eder ve ek özellikler ekler.
 * 
 * Eklenen özellikler:
 * - statusCode: HTTP status kodu (400, 404, 500 vb.)
 * - isOperational: Operasyonel hata mı? (expected) yoksa programlama hatası mı? (bug)
 * 
 * Operasyonel hatalar:
 * - Beklenen hatalar (kullanıcı girdi hatası, yetersiz kredi vb.)
 * - Client'a güvenli mesaj gönderilebilir
 * - Uygulama çalışmaya devam edebilir
 * 
 * Programlama hataları:
 * - Beklenmeyen hatalar (null reference, syntax error vb.)
 * - Generic mesaj gösterilmeli, detaylar loglanmalı
 * - Uygulama restart gerektirebilir
 * 
 * Spring Framework'teki RuntimeException benzeri bir yapı.
 */

/**
 * BaseException Sınıfı
 * 
 * Error sınıfından extends eder.
 * Tüm custom exception'ların temelini oluşturur.
 */
export class BaseException extends Error {
  /**
   * HTTP status kodu
   * 
   * Client'a döndürülecek HTTP yanıt kodu.
   * Örnek: 400 (Bad Request), 404 (Not Found), 500 (Internal Server Error)
   */
  public readonly statusCode: number;

  /**
   * Operasyonel hata flag'i
   * 
   * true: Beklenen hata, güvenli mesaj gösterilebilir
   * false: Programlama hatası, generic mesaj gösterilmeli
   */
  public readonly isOperational: boolean;

  /**
   * Constructor
   * 
   * @param message - Hata mesajı (kullanıcıya gösterilecek veya loglanacak)
   * @param statusCode - HTTP status kodu (default: 500)
   * @param isOperational - Operasyonel hata mı? (default: true)
   */
  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    // Parent Error constructor'ını çağır
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Stack trace'i doğru yerden başlat
    // Bu sayede hata fırlatıldığı yer doğru gösterilir
    Error.captureStackTrace(this, this.constructor);
    
    // TypeScript için prototype chain'i düzelt
    // instanceof kontrollerinin doğru çalışması için gerekli
    Object.setPrototypeOf(this, BaseException.prototype);
  }
}
