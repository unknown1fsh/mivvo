/**
 * Hata Yönetimi Middleware (Error Handler Middleware)
 * 
 * Clean Architecture - Middleware Layer (Ara Yazılım Katmanı)
 * 
 * Bu dosya, merkezi hata yönetimi (centralized error handling) sağlar.
 * 
 * Amaç:
 * - Tüm hataları tek noktadan yönet
 * - Custom exception'ları yakala ve uygun HTTP response döndür
 * - Prisma hatalarını kullanıcı dostu mesajlara çevir
 * - JWT hatalarını yönet
 * - Production'da hassas bilgileri gizle
 * - Hataları logla (monitoring için)
 * 
 * Express error handling pattern:
 * 1. Controller/Service'de hata fırlatılır: throw new NotFoundException()
 * 2. Express otomatik olarak error handler middleware'i çağırır
 * 3. errorHandler middleware hatayı yakalar ve uygun response döndürür
 * 
 * Spring Framework'teki @ControllerAdvice + @ExceptionHandler benzeri yapı.
 */

import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../exceptions/BaseException';
import { ErrorResponse } from '../dto/response/ApiResponseDTO';

/**
 * Custom Error Interface
 * 
 * Express Error objesini genişletir.
 * Bazı hatalar statusCode içermeyebilir, bu interface ile tip güvenliği sağlanır.
 */
export interface CustomError extends Error {
  statusCode?: number;        // HTTP status kodu (opsiyonel)
  isOperational?: boolean;    // Operasyonel hata mı? (opsiyonel)
}

/**
 * Global Hata Yönetim Middleware
 * 
 * Express'in error handling signature'ı:
 * (err, req, res, next) => void
 * 
 * Bu middleware, tüm hataları yakalar ve standart bir yanıt formatı döndürür.
 * 
 * Hata türleri:
 * - BaseException (custom exception'lar)
 * - Prisma hatalar (P2002, P2025 vb.)
 * - JWT hataları (JsonWebTokenError, TokenExpiredError)
 * - Validation hataları
 * - Generic hatalar
 * 
 * @param err - Fırlatılan hata objesi
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Express NextFunction (kullanılmaz ama signature için gerekli)
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // ===== HATA LOGLAMA =====
  // Console'a detaylı hata bilgisi yaz (monitoring için)
  console.error('🔥 Error:', {
    message: err.message,                                            // Hata mesajı
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Stack trace (sadece dev'de)
    path: req.path,                                                  // Hangi endpoint'te oluştu
    method: req.method,                                              // HTTP metodu (GET, POST vb.)
    timestamp: new Date().toISOString(),                            // Hata zamanı
  });

  // ===== CUSTOM EXCEPTION HANDLING =====
  // BaseException veya türevlerini yakala
  if (err instanceof BaseException) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: err.name,              // Exception class adı (NotFoundException, UnauthorizedException vb.)
      message: err.message,         // Kullanıcıya gösterilecek mesaj
      statusCode: err.statusCode,   // HTTP status kodu
      timestamp: new Date(),        // Response zamanı
      path: req.path,               // Hata oluşan endpoint
    };

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // ===== PRISMA HATA YÖNETİMİ =====
  
  /**
   * Prisma P2002 Hatası: Unique Constraint Violation
   * 
   * Örnek: E-posta zaten kayıtlı, plaka zaten var
   * HTTP 409 Conflict döndürülür
   */
  if (err.code === 'P2002') {
    res.status(409).json({
      success: false,
      error: 'ConflictError',
      message: 'Bu kayıt zaten mevcut',
      statusCode: 409,
      timestamp: new Date(),
      path: req.path,
    });
    return;
  }

  /**
   * Prisma P2025 Hatası: Record Not Found
   * 
   * Örnek: Güncellenecek/silinecek kayıt bulunamadı
   * HTTP 404 Not Found döndürülür
   */
  if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: 'NotFoundError',
      message: 'Kayıt bulunamadı',
      statusCode: 404,
      timestamp: new Date(),
      path: req.path,
    });
    return;
  }

  // ===== JWT HATA YÖNETİMİ =====
  
  /**
   * JsonWebTokenError: Geçersiz Token
   * 
   * Örnek: Malformed token, signature hatası
   * HTTP 401 Unauthorized döndürülür
   */
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'UnauthorizedError',
      message: 'Geçersiz token',
      statusCode: 401,
      timestamp: new Date(),
      path: req.path,
    });
    return;
  }

  /**
   * TokenExpiredError: Token Süresi Dolmuş
   * 
   * Örnek: JWT expire date geçmiş
   * HTTP 401 Unauthorized döndürülür
   * Client refresh token ile yeni token almalı
   */
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'UnauthorizedError',
      message: 'Token süresi dolmuş',
      statusCode: 401,
      timestamp: new Date(),
      path: req.path,
    });
    return;
  }

  // ===== VALIDATION HATA YÖNETİMİ =====
  
  /**
   * ValidationError: Veri Doğrulama Hatası
   * 
   * Örnek: Yup, Joi, express-validator hataları
   * HTTP 422 Unprocessable Entity döndürülür
   */
  if (err.name === 'ValidationError') {
    res.status(422).json({
      success: false,
      error: 'ValidationError',
      message: err.message || 'Doğrulama hatası',
      statusCode: 422,
      timestamp: new Date(),
      path: req.path,
    });
    return;
  }

  // ===== GENERIC HATA YÖNETİMİ (FALLBACK) =====
  
  // Status code'u belirle (hata objesinde varsa kullan, yoksa 500)
  const statusCode = err.statusCode || 500;
  
  const errorResponse: ErrorResponse = {
    success: false,
    error: err.name || 'InternalServerError',     // Hata adı
    message: err.message || 'Sunucu hatası',      // Hata mesajı
    statusCode,
    timestamp: new Date(),
    path: req.path,
  };

  // ===== PRODUCTION GÜVENLİĞİ =====
  // Production'da detaylı hata mesajları gösterilmez (güvenlik riski)
  // Generic mesaj döndürülür
  if (process.env.NODE_ENV !== 'development') {
    errorResponse.message = 'Bir hata oluştu';
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found Middleware
 * 
 * Route bulunamadığında çağrılır.
 * Express'te tanımlı olmayan bir endpoint'e istek geldiğinde bu middleware çalışır.
 * 
 * Kullanım: Tüm route'lardan SONRA eklenir
 * 
 * @example
 * app.use('/api', routes);
 * app.use(notFound);  // Tüm route'lardan sonra
 * app.use(errorHandler);
 * 
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Express NextFunction
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  // 404 hatası oluştur
  const error = new Error(`Bulunamadı - ${req.originalUrl}`) as CustomError;
  error.statusCode = 404;
  
  // Error handler middleware'ine gönder
  next(error);
};

/**
 * Async Handler Wrapper
 * 
 * Async controller'ları wrap eder ve hataları otomatik olarak error handler'a iletir.
 * Try-catch bloklarına gerek kalmaz.
 * 
 * Kullanım: Async controller'ları bu wrapper ile sarmalayın
 * 
 * @example
 * // Eski yöntem (kötü):
 * router.post('/analysis', async (req, res) => {
 *   try {
 *     const result = await analysisService.analyze();
 *     res.json(result);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 * 
 * // Yeni yöntem (iyi):
 * router.post('/analysis', asyncHandler(async (req, res) => {
 *   const result = await analysisService.analyze();
 *   res.json(result);
 * }));
 * 
 * @param fn - Async controller function
 * @returns Wrapped function (hata yakalamalı)
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  // Async function'ı Promise.resolve ile wrap et
  // Hata oluşursa catch ile yakala ve next()'e gönder
  Promise.resolve(fn(req, res, next)).catch(next);
};
