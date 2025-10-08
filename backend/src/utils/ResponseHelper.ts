/**
 * Yanıt Yardımcısı (Response Helper)
 * 
 * Clean Architecture - Utils Layer (Yardımcı Katman)
 * 
 * Bu sınıf, tüm API yanıtlarını standartlaştırır.
 * 
 * Amaç:
 * - Tutarlı API response formatı
 * - Controller kodunu sadeleştirir
 * - DRY prensibi (tekrar eden kod önlenir)
 * - HTTP status kodlarını merkezi yönetim
 * 
 * Kullanım:
 * Controller'larda Response objesi oluşturmak yerine
 * ResponseHelper metodları kullanılır.
 * 
 * Örnek:
 * ```typescript
 * // Eski yöntem (kötü):
 * res.status(200).json({ success: true, data: user, timestamp: new Date() });
 * 
 * // Yeni yöntem (iyi):
 * ResponseHelper.success(res, user);
 * ```
 * 
 * Spring Framework'teki ResponseEntity benzeri yapı sağlar.
 */

import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../dto/response/ApiResponseDTO';

/**
 * ResponseHelper Static Sınıfı
 * 
 * Tüm metodlar static'tir, instance oluşturmaya gerek yoktur.
 * Utility sınıfı olarak çalışır.
 */
export class ResponseHelper {
  /**
   * Başarılı yanıt döndürür
   * 
   * Generic type kullanarak farklı veri tiplerini destekler.
   * 
   * @template T - Döndürülecek veri tipi
   * @param res - Express Response objesi
   * @param data - Client'a gönderilecek veri
   * @param message - Kullanıcıya gösterilecek başarı mesajı (opsiyonel)
   * @param statusCode - HTTP status kodu (default: 200 OK)
   * 
   * @example
   * ResponseHelper.success(res, user, 'Kullanıcı bulundu');
   * // Response: { success: true, data: user, message: '...', timestamp: Date }
   */
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date(),
    };
    res.status(statusCode).json(response);
  }

  /**
   * Kayıt oluşturma başarılı yanıtı (201 Created)
   * 
   * POST işlemleri sonrası yeni kayıt oluşturulduğunda kullanılır.
   * 
   * @template T - Oluşturulan kayıt tipi
   * @param res - Express Response objesi
   * @param data - Oluşturulan kayıt
   * @param message - Başarı mesajı (opsiyonel)
   * 
   * @example
   * ResponseHelper.created(res, newVehicle, 'Araç eklendi');
   */
  static created<T>(res: Response, data: T, message?: string): void {
    this.success(res, data, message, 201);
  }

  /**
   * İçerik yok yanıtı (204 No Content)
   * 
   * Başarılı işlem ama response body gerekmediğinde kullanılır.
   * Genellikle DELETE işlemleri için uygundur.
   * 
   * @param res - Express Response objesi
   * 
   * @example
   * ResponseHelper.noContent(res); // Araç silindi, response body yok
   */
  static noContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * Sayfalanmış liste yanıtı
   * 
   * Liste endpoint'lerinde pagination desteği sağlar.
   * Toplam kayıt sayısı ve sayfa bilgisi içerir.
   * 
   * @template T - Liste elemanlarının tipi
   * @param res - Express Response objesi
   * @param data - Sayfa içeriği (kayıt listesi)
   * @param pagination - Sayfalama bilgileri
   * @param pagination.page - Mevcut sayfa numarası (1'den başlar)
   * @param pagination.limit - Sayfa başına kayıt sayısı
   * @param pagination.total - Toplam kayıt sayısı (tüm sayfalar)
   * @param statusCode - HTTP status kodu (default: 200)
   * 
   * @example
   * ResponseHelper.paginated(res, reports, { page: 1, limit: 10, total: 45 });
   * // Response pages: Math.ceil(45 / 10) = 5 sayfa
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    statusCode: number = 200
  ): void {
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      pagination: {
        ...pagination,
        pages: Math.ceil(pagination.total / pagination.limit), // Toplam sayfa sayısını hesapla
      },
    };
    res.status(statusCode).json(response);
  }

  /**
   * Hata yanıtı döndürür
   * 
   * Generic hata yanıtı oluşturur.
   * ErrorHandler middleware genellikle bunu kullanır.
   * 
   * @param res - Express Response objesi
   * @param message - Kullanıcıya gösterilecek hata mesajı
   * @param statusCode - HTTP status kodu (default: 500)
   * @param error - Hata kodu/tipi (opsiyonel)
   * 
   * @example
   * ResponseHelper.error(res, 'Araç bulunamadı', 404, 'VehicleNotFound');
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    error?: string
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      error,
      timestamp: new Date(),
    };
    res.status(statusCode).json(response);
  }

  /**
   * Bad Request yanıtı (400)
   * 
   * Client'tan gelen istek hatalı/eksik olduğunda kullanılır.
   * Örnek: Eksik parametre, geçersiz format
   * 
   * @param res - Express Response objesi
   * @param message - Hata açıklaması
   * @param error - Hata kodu (opsiyonel)
   * 
   * @example
   * ResponseHelper.badRequest(res, 'Plaka alanı zorunludur');
   */
  static badRequest(res: Response, message: string, error?: string): void {
    this.error(res, message, 400, error);
  }

  /**
   * Unauthorized yanıtı (401)
   * 
   * Kimlik doğrulama gerektiğinde veya token geçersiz olduğunda kullanılır.
   * 
   * @param res - Express Response objesi
   * @param message - Hata mesajı (default: 'Unauthorized')
   * 
   * @example
   * ResponseHelper.unauthorized(res, 'Token süresi dolmuş');
   */
  static unauthorized(res: Response, message: string = 'Unauthorized'): void {
    this.error(res, message, 401);
  }

  /**
   * Forbidden yanıtı (403)
   * 
   * Kullanıcı kimlik doğrulamış ama erişim yetkisi yoksa kullanılır.
   * Örnek: Normal kullanıcı admin paneline erişmeye çalıştı
   * 
   * @param res - Express Response objesi
   * @param message - Hata mesajı (default: 'Forbidden')
   * 
   * @example
   * ResponseHelper.forbidden(res, 'Bu işlem için admin yetkisi gerekli');
   */
  static forbidden(res: Response, message: string = 'Forbidden'): void {
    this.error(res, message, 403);
  }

  /**
   * Not Found yanıtı (404)
   * 
   * İstenen kayıt/resource bulunamadığında kullanılır.
   * 
   * @param res - Express Response objesi
   * @param message - Hata mesajı (default: 'Not Found')
   * 
   * @example
   * ResponseHelper.notFound(res, 'Rapor bulunamadı');
   */
  static notFound(res: Response, message: string = 'Not Found'): void {
    this.error(res, message, 404);
  }

  /**
   * Internal Server Error yanıtı (500)
   * 
   * Beklenmeyen sunucu hatası olduğunda kullanılır.
   * 
   * @param res - Express Response objesi
   * @param message - Hata mesajı (default: 'Internal Server Error')
   * 
   * @example
   * ResponseHelper.internalError(res, 'Veritabanı bağlantı hatası');
   */
  static internalError(res: Response, message: string = 'Internal Server Error'): void {
    this.error(res, message, 500);
  }
}
