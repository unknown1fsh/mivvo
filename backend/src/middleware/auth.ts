/**
 * Kimlik Doğrulama Middleware (Authentication Middleware)
 * 
 * Clean Architecture - Middleware Layer (Ara Yazılım Katmanı)
 * 
 * Bu dosya, kullanıcı kimlik doğrulama ve yetkilendirme middleware'lerini içerir.
 * 
 * Amaç:
 * - JWT token doğrulama
 * - Kullanıcı kimliğini request'e ekleme
 * - Rol tabanlı erişim kontrolü (authorization)
 * - Opsiyonel kimlik doğrulama (public + auth endpoints için)
 * 
 * Middleware'lar:
 * - authenticate: Zorunlu kimlik doğrulama (protected endpoints)
 * - authorize: Rol bazlı yetkilendirme (admin, user vb.)
 * - optionalAuth: Opsiyonel kimlik doğrulama (varsa user bilgisi eklenir)
 * 
 * Spring Framework'teki SecurityFilterChain benzeri yapı.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Prisma Client singleton instance
const prisma = new PrismaClient();

/**
 * Genişletilmiş Request Interface
 * 
 * Express Request'e kullanıcı bilgisi ekler.
 * Middleware'den sonra controller'larda req.user erişilebilir.
 */
export interface AuthRequest extends Request {
  user?: {
    id: number;        // Kullanıcı ID'si (primary key)
    email: string;     // Kullanıcı e-posta adresi
    role: string;      // Kullanıcı rolü (USER, ADMIN, SUPERADMIN)
  };
}

/**
 * Kimlik Doğrulama Middleware (authenticate)
 * 
 * JWT token kontrolü yapar ve kullanıcı bilgisini request'e ekler.
 * Token yoksa veya geçersizse 401 Unauthorized döndürür.
 * 
 * Kullanım: Korumalı endpoint'lerde middleware olarak eklenir.
 * 
 * @example
 * router.get('/profile', authenticate, profileController);
 * router.post('/analysis', authenticate, analysisController);
 * 
 * @param req - Express Request (AuthRequest olarak extend edilmiş)
 * @param res - Express Response
 * @param next - Express NextFunction
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Authorization header'ından token'ı al
    // Format: "Bearer {token}"
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Token yoksa unauthorized
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Erişim reddedildi. Token bulunamadı.',
      });
      return;
    }

    // JWT_SECRET environment variable kontrolü
    // envValidation'dan validated secret kullan
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      console.error('❌ JWT_SECRET is missing or too short');
      res.status(500).json({
        success: false,
        message: 'Sunucu yapılandırma hatası.',
      });
      return;
    }

    // Token'ı doğrula ve decode et
    const decoded = jwt.verify(token, secret) as any;
    
    // Kullanıcıyı veritabanından getir
    // Token içindeki ID ile user tablosunu sorgula
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,  // Hesap aktif mi kontrol et
      },
    });

    // Kullanıcı bulunamadı veya hesap pasif
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Geçersiz token veya kullanıcı aktif değil.',
      });
      return;
    }

    // Kullanıcı bilgisini request objesine ekle
    // Controller'larda req.user olarak erişilebilir
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Bir sonraki middleware/controller'a geç
    next();
  } catch (error) {
    // JWT doğrulama hatası (expired, malformed vb.)
    res.status(401).json({
      success: false,
      message: 'Geçersiz token.',
    });
  }
};

/**
 * Rol Tabanlı Yetkilendirme Middleware (authorize)
 * 
 * Kullanıcının belirli rollere sahip olup olmadığını kontrol eder.
 * Yetkisiz erişim denemesinde 403 Forbidden döndürür.
 * 
 * NOT: Bu middleware, authenticate'den SONRA çalışmalıdır!
 * 
 * Kullanım: Sadece belirli rollerin erişebileceği endpoint'lerde kullanılır.
 * 
 * @example
 * // Sadece admin'ler erişebilir
 * router.get('/admin/users', authenticate, authorize('ADMIN'), getUsersController);
 * 
 * // Admin veya superadmin erişebilir
 * router.delete('/users/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), deleteUserController);
 * 
 * @param roles - İzin verilen roller (...rest parameter, birden fazla rol gönderilebilir)
 * @returns Express middleware function
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Kullanıcı kimliği doğrulanmamış (authenticate çalışmamış)
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Kimlik doğrulama gerekli.',
      });
      return;
    }

    // Kullanıcının rolü izin verilen roller arasında değil
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz bulunmuyor.',
      });
      return;
    }

    // Yetki var, devam et
    next();
  };
};

/**
 * Opsiyonel Kimlik Doğrulama Middleware (optionalAuth)
 * 
 * Token varsa kullanıcı bilgisini request'e ekler, yoksa sessizce devam eder.
 * Public + Authenticated endpoints için kullanılır.
 * 
 * Kullanım: Hem giriş yapmış hem de yapmamış kullanıcıların erişebildiği endpoint'lerde.
 * 
 * @example
 * // Rapor detay: Giriş yapmışsa kullanıcı bilgisi ile, yapmamışsa genel gösterim
 * router.get('/reports/:id', optionalAuth, getReportController);
 * 
 * // VIN lookup: Giriş yapmışsa kayıt oluştur, yapmamışsa sadece bilgi göster
 * router.get('/vin/:vin', optionalAuth, vinLookupController);
 * 
 * @param req - Express Request (AuthRequest olarak extend edilmiş)
 * @param res - Express Response
 * @param next - Express NextFunction
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Authorization header'ından token'ı al
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Token varsa doğrula
    if (token) {
      // JWT_SECRET environment variable kontrolü
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
      }

      // Token'ı doğrula
      const decoded = jwt.verify(token, secret) as any;
      
      // Kullanıcıyı veritabanından getir
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      // Kullanıcı geçerli ve aktifse request'e ekle
      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    }

    // Token yoksa veya geçersizse de devam et (hata fırlatma)
    next();
  } catch (error) {
    // Token geçersizse sessizce devam et
    // req.user undefined kalır, controller'da kontrol edilir
    next();
  }
};
