/**
 * 404 Not Found Middleware
 * 
 * Clean Architecture - Middleware Layer (Ara Yazılım Katmanı)
 * 
 * Bu dosya, tanımsız route'lar için 404 yanıtı döndürür.
 * 
 * Amaç:
 * - Var olmayan endpoint'lere istek geldiğinde 404 döndürür
 * - Kullanıcı dostu hata mesajı gösterir
 * - Hangi URL'in bulunamadığını belirtir
 * 
 * Kullanım:
 * Tüm route tanımlamalarından SONRA, error handler'dan ÖNCE eklenir.
 * 
 * Express middleware sırası:
 * 1. Body parser, CORS vb. global middleware'ler
 * 2. Route'lar (API endpoint'leri)
 * 3. notFound middleware (bu dosya) ← Hiçbir route match olmazsa buraya gelir
 * 4. errorHandler middleware ← Hataları yakalar ve response döndürür
 * 
 * @example
 * // index.ts veya app.ts'de kullanım:
 * app.use('/api/auth', authRoutes);
 * app.use('/api/reports', reportRoutes);
 * // ... diğer route'lar
 * 
 * app.use(notFound);       // ← Tüm route'lardan sonra
 * app.use(errorHandler);   // ← En son
 * 
 * Spring Framework'teki @ControllerAdvice ile NoHandlerFoundException
 * yakalama mantığına benzer.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Not Found Middleware Function
 * 
 * Tanımsız bir route'a istek geldiğinde çalışır.
 * 404 status kodu ile standart hata yanıtı döndürür.
 * 
 * @param req - Express Request objesi
 * @param req.originalUrl - İstek yapılan tam URL (örn: /api/v1/unknown-endpoint)
 * @param res - Express Response objesi
 * @param next - Express NextFunction (kullanılmıyor ama signature için gerekli)
 * 
 * Response Format:
 * {
 *   success: false,
 *   message: "Bulunamadı - /api/v1/unknown-endpoint"
 * }
 * 
 * @example
 * // Client istek yapar:
 * GET /api/v1/users
 * → users route'u tanımlıysa normal response
 * → users route'u tanımlı değilse notFound middleware çalışır
 * 
 * Response:
 * HTTP 404
 * {
 *   "success": false,
 *   "message": "Bulunamadı - /api/v1/users"
 * }
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  // Hata mesajı oluştur (hangi URL bulunamadı?)
  const error = new Error(`Bulunamadı - ${req.originalUrl}`);
  
  // 404 Not Found response döndür
  res.status(404).json({
    success: false,               // İşlem başarısız
    message: error.message,       // "Bulunamadı - /api/v1/unknown-endpoint"
  });
};
