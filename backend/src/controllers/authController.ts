/**
 * Authentication Controller (Kimlik Doğrulama Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, kullanıcı kimlik doğrulama ve yetkilendirme
 * işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Kullanıcı kaydı (register)
 * - Kullanıcı girişi (login)
 * - Kullanıcı çıkışı (logout)
 * - Profil görüntüleme ve güncelleme
 * - Şifre değiştirme
 * - Şifre sıfırlama (forgot/reset)
 * - Email doğrulama
 * 
 * Thin Controller Prensibi:
 * - Minimal iş mantığı (sadece request/response handling)
 * - Validasyon (middleware'de yapılmalı)
 * - Service çağrıları (gelecekte eklenebilir)
 * - Response standardizasyonu
 * 
 * Güvenlik:
 * - Bcrypt ile şifre hashleme
 * - JWT token ile authentication
 * - Token expiration (7 gün)
 * - Email verification
 * - Password reset tokens (1 saat)
 * 
 * Endpoints:
 * - POST /api/auth/register (Public)
 * - POST /api/auth/login (Public)
 * - POST /api/auth/logout (Private)
 * - GET /api/auth/profile (Private)
 * - PUT /api/auth/profile (Private)
 * - PUT /api/auth/change-password (Private)
 * - POST /api/auth/forgot-password (Public)
 * - POST /api/auth/reset-password (Public)
 * - GET /api/auth/verify-email/:token (Public)
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { NotificationService } from '../services/notificationService';
import { emailService } from '../services/emailService';
import { getPrismaClient } from '../utils/prisma';

// Optimized Prisma Client
const prisma = getPrismaClient();

// ===== HELPER FUNCTIONS =====

/**
 * JWT Token Oluşturur
 * 
 * Kullanıcı ID'sini içeren JWT token üretir.
 * 
 * Token Özellikleri:
 * - Payload: { id: userId }
 * - Expiration: 7 gün (default)
 * - Secret: JWT_SECRET env variable
 * 
 * @param id - Kullanıcı ID'si
 * @returns JWT token string
 * @throws Error - JWT_SECRET tanımlı değilse
 * 
 * @example
 * const token = generateToken(123);
 */
const generateToken = (id: number): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

// ===== CONTROLLER METHODS =====

/**
 * Kullanıcı Kaydı
 * 
 * Yeni kullanıcı hesabı oluşturur.
 * 
 * İşlem Akışı:
 * 1. Email benzersizlik kontrolü
 * 2. Şifre hashleme (bcrypt, 12 rounds)
 * 3. Kullanıcı oluşturma
 * 4. Kredi hesabı oluşturma (başlangıç: 0 TL)
 * 5. JWT token üretme
 * 6. Response dönme
 * 
 * @route   POST /api/auth/register
 * @access  Public
 * 
 * @param req.body.email - Email adresi
 * @param req.body.password - Şifre
 * @param req.body.firstName - Ad
 * @param req.body.lastName - Soyad
 * @param req.body.phone - Telefon (opsiyonel)
 * 
 * @returns 201 - Kullanıcı ve token
 * @returns 400 - Email zaten kullanımda
 * 
 * @example
 * POST /api/auth/register
 * Body: {
 *   "email": "user@example.com",
 *   "password": "SecurePass123",
 *   "firstName": "Ahmet",
 *   "lastName": "Yılmaz"
 * }
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔐 Register başlatıldı:', { body: req.body });
    
    const { email, password, firstName, lastName, phone } = req.body;

    // Environment variables kontrolü
    console.log('🔍 Environment check:', {
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || '12'
    });

    // Email benzersizlik kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('❌ Email zaten kullanımda:', email);
      res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor.',
      });
      return;
    }

    // Şifre hashleme
    console.log('🔑 Şifre hashleniyor...');
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
    const passwordHash = await bcrypt.hash(password, salt);

    // Kullanıcı oluşturma (emailVerified: true olarak - geçici olarak devre dışı)
    console.log('👤 Kullanıcı oluşturuluyor...');
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        emailVerified: true, // Geçici olarak email doğrulama devre dışı
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Kredi hesabı oluşturma
    console.log('💰 Kredi hesabı oluşturuluyor...');
    await prisma.userCredits.create({
      data: {
        userId: user.id,
        balance: 0,
      },
    });

    // Email doğrulama işlemi - GEÇİCİ OLARAK TAMAMEN DEVRE DIŞI
    console.log('📧 Email doğrulama özelliği geçici olarak devre dışı');

    // JWT token üretme (login için)
    console.log('🎫 Login token oluşturuluyor...');
    const token = generateToken(user.id);

    // Hoş geldiniz bildirimi oluştur
    console.log('📢 Hoş geldiniz bildirimi oluşturuluyor...');
    try {
      await NotificationService.createWelcomeNotification(user.id, user.firstName);
    } catch (notificationError) {
      console.warn('⚠️ Bildirim oluşturulamadı:', notificationError);
      // Bildirim hatası register işlemini etkilemesin
    }

    console.log('✅ Register başarılı:', { userId: user.id, email: user.email });

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu.',
      data: {
        user,
        token,
        emailVerificationSent: false, // Geçici olarak devre dışı
      },
    });
  } catch (error) {
    console.error('❌ Register hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

/**
 * Kullanıcı Girişi
 * 
 * Email ve şifre ile giriş yapar.
 * 
 * İşlem Akışı:
 * 1. Kullanıcı bulma (email)
 * 2. Aktiflik kontrolü (isActive)
 * 3. Şifre doğrulama (bcrypt.compare)
 * 4. JWT token üretme
 * 5. Response dönme
 * 
 * Güvenlik:
 * - Şifre hash'i response'da dönmez
 * - Genel hata mesajı (email/şifre ayırt edilmez)
 * 
 * @route   POST /api/auth/login
 * @access  Public
 * 
 * @param req.body.email - Email adresi
 * @param req.body.password - Şifre
 * 
 * @returns 200 - Kullanıcı ve token
 * @returns 401 - Geçersiz email veya şifre
 * 
 * @example
 * POST /api/auth/login
 * Body: {
 *   "email": "user@example.com",
 *   "password": "SecurePass123"
 * }
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Production'da minimal logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Backend login başlatıldı:', { email, hasPassword: !!password });
    }

    // Kullanıcı bulma - sadece gerekli alanları seç
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    // Kullanıcı ve aktiflik kontrolü
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre.',
      });
      return;
    }

    // Şifre doğrulama
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre.',
      });
      return;
    }

    // JWT token üretme
    const token = generateToken(user.id);

    // Şifre hash'ini response'dan çıkar
    const { passwordHash, ...userWithoutPassword } = user;

    const responseData = {
      success: true,
      message: 'Giriş başarılı.',
      data: {
        user: userWithoutPassword,
        token,
      },
    };

    // Production'da minimal logging
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Login başarılı:', { userEmail: user.email });
    }

    res.json(responseData);
  } catch (error) {
    console.error('❌ Login hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.',
    });
  }
};

/**
 * Kullanıcı Çıkışı
 * 
 * Kullanıcıyı sistemden çıkarır.
 * 
 * NOT: Stateless JWT kullanıldığı için server-side logout yok.
 * Client-side'da token silinmelidir. İleride token blacklist
 * eklenebilir.
 * 
 * @route   POST /api/auth/logout
 * @access  Private
 * 
 * @returns 200 - Çıkış başarılı
 * 
 * @example
 * POST /api/auth/logout
 * Headers: { Authorization: 'Bearer <token>' }
 */
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  // Token blacklist eklenebilir (gelecekte)
  res.json({
    success: true,
    message: 'Çıkış başarılı.',
  });
};

/**
 * Profil Görüntüleme
 * 
 * Giriş yapmış kullanıcının profil bilgilerini getirir.
 * 
 * İçerik:
 * - Kullanıcı bilgileri (id, email, ad, soyad, telefon, rol)
 * - Kredi bilgileri (bakiye, toplam alınan, toplam kullanılan)
 * 
 * @route   GET /api/auth/profile
 * @access  Private
 * 
 * @returns 200 - Kullanıcı profili
 * 
 * @example
 * GET /api/auth/profile
 * Headers: { Authorization: 'Bearer <token>' }
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      userCredits: {
        select: {
          balance: true,
          totalPurchased: true,
          totalUsed: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: { user },
  });
};

/**
 * Profil Güncelleme
 * 
 * Kullanıcı profil bilgilerini günceller.
 * 
 * Güncellenebilir Alanlar:
 * - firstName
 * - lastName
 * - phone
 * 
 * NOT: Email ve şifre burada güncellenmez.
 * 
 * @route   PUT /api/auth/profile
 * @access  Private
 * 
 * @param req.body.firstName - Ad
 * @param req.body.lastName - Soyad
 * @param req.body.phone - Telefon
 * 
 * @returns 200 - Güncellenmiş kullanıcı
 * 
 * @example
 * PUT /api/auth/profile
 * Body: {
 *   "firstName": "Mehmet",
 *   "lastName": "Demir",
 *   "phone": "05551234567"
 * }
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { firstName, lastName, phone } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      firstName,
      lastName,
      phone,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
    },
  });

  res.json({
    success: true,
    message: 'Profil başarıyla güncellendi.',
    data: { user },
  });
};

/**
 * Şifre Değiştirme
 * 
 * Mevcut şifreyi doğrulayarak yeni şifre belirler.
 * 
 * İşlem Akışı:
 * 1. Mevcut şifre doğrulama
 * 2. Yeni şifre hashleme
 * 3. Şifre güncelleme
 * 
 * Güvenlik:
 * - Mevcut şifre kontrolü zorunlu
 * - Yeni şifre bcrypt ile hashlenır
 * 
 * @route   PUT /api/auth/change-password
 * @access  Private
 * 
 * @param req.body.currentPassword - Mevcut şifre
 * @param req.body.newPassword - Yeni şifre
 * 
 * @returns 200 - Şifre değiştirildi
 * @returns 400 - Mevcut şifre yanlış
 * @returns 404 - Kullanıcı bulunamadı
 * 
 * @example
 * PUT /api/auth/change-password
 * Body: {
 *   "currentPassword": "OldPass123",
 *   "newPassword": "NewSecurePass456"
 * }
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  // Kullanıcı ve şifre getirme
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { passwordHash: true },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı.',
    });
    return;
  }

  // Mevcut şifre doğrulama
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) {
    res.status(400).json({
      success: false,
      message: 'Mevcut şifre yanlış.',
    });
    return;
  }

  // Yeni şifre hashleme
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
  const newPasswordHash = await bcrypt.hash(newPassword, salt);

  // Şifre güncelleme
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { passwordHash: newPasswordHash },
  });

  res.json({
    success: true,
    message: 'Şifre başarıyla değiştirildi.',
  });
};

/**
 * Şifre Sıfırlama İsteği (Forgot Password)
 * 
 * Kullanıcıya şifre sıfırlama linki gönderir.
 * 
 * İşlem Akışı:
 * 1. Kullanıcı bulma (email)
 * 2. Reset token üretme (1 saat geçerli)
 * 3. Email gönderme (TODO)
 * 
 * NOT: Email gönderme henüz implemente edilmemiş.
 * Development modunda token response'da döner.
 * 
 * @route   POST /api/auth/forgot-password
 * @access  Public
 * 
 * @param req.body.email - Email adresi
 * 
 * @returns 200 - Email gönderildi
 * @returns 404 - Kullanıcı bulunamadı
 * 
 * @example
 * POST /api/auth/forgot-password
 * Body: {
 *   "email": "user@example.com"
 * }
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.',
    });
    return;
  }

  // Reset token üretme (1 saat geçerli)
  const resetToken = jwt.sign(
    { id: user.id, type: 'password_reset' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  // Şifre sıfırlama email'i gönderme - GEÇİCİ OLARAK DEVRE DIŞI
  console.log('📧 Email gönderme özelliği geçici olarak devre dışı');
  
  // Development modunda token'ı döndür
  res.json({
    success: true,
    message: 'Şifre sıfırlama token\'ı oluşturuldu. (Email gönderme devre dışı)',
    // Development modunda token'ı döndür
    ...(process.env.NODE_ENV === 'development' && { resetToken }),
  });
};

/**
 * Şifre Sıfırlama (Reset Password)
 * 
 * Reset token ile yeni şifre belirler.
 * 
 * İşlem Akışı:
 * 1. Token doğrulama (JWT verify)
 * 2. Token tipi kontrolü (password_reset)
 * 3. Yeni şifre hashleme
 * 4. Şifre güncelleme
 * 
 * Güvenlik:
 * - Token 1 saat geçerli
 * - Token tipi kontrolü
 * 
 * @route   POST /api/auth/reset-password
 * @access  Public
 * 
 * @param req.body.token - Reset token
 * @param req.body.newPassword - Yeni şifre
 * 
 * @returns 200 - Şifre sıfırlandı
 * @returns 400 - Geçersiz veya süresi dolmuş token
 * 
 * @example
 * POST /api/auth/reset-password
 * Body: {
 *   "token": "<reset-token>",
 *   "newPassword": "NewSecurePass789"
 * }
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  try {
    // Token doğrulama
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    const decoded = jwt.verify(token, secret) as any;
    
    // Token tipi kontrolü
    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid token type');
    }

    // Yeni şifre hashleme
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Şifre güncelleme
    await prisma.user.update({
      where: { id: decoded.id },
      data: { passwordHash: newPasswordHash },
    });

    res.json({
      success: true,
      message: 'Şifre başarıyla sıfırlandı.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Geçersiz veya süresi dolmuş token.',
    });
  }
};

/**
 * Email Doğrulama
 * 
 * Verification token ile email adresini doğrular.
 * 
 * İşlem Akışı:
 * 1. Token doğrulama (JWT verify)
 * 2. Token tipi kontrolü (email_verification)
 * 3. emailVerified = true güncelleme
 * 
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 * 
 * @param req.params.token - Verification token
 * 
 * @returns 200 - Email doğrulandı
 * @returns 400 - Geçersiz veya süresi dolmuş token
 * 
 * @example
 * GET /api/auth/verify-email/<verification-token>
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  try {
    // Token doğrulama
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    const decoded = jwt.verify(token, secret) as any;
    
    // Token tipi kontrolü
    if (decoded.type !== 'email_verification') {
      throw new Error('Invalid token type');
    }

    // Kullanıcı kontrolü
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, emailVerified: true, firstName: true, lastName: true }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.',
      });
      return;
    }

    if (user.emailVerified) {
      res.json({
        success: true,
        message: 'Email adresi zaten doğrulanmış.',
      });
      return;
    }

    // Email doğrulama
    await prisma.user.update({
      where: { id: decoded.id },
      data: { emailVerified: true },
    });

    // Hoş geldiniz bildirimi oluştur
    try {
      await NotificationService.createNotification({
        userId: user.id,
        title: 'Email Doğrulandı',
        message: 'Email adresiniz başarıyla doğrulandı. Artık tüm özelliklerimize erişebilirsiniz.',
        type: 'SUCCESS'
      });
    } catch (notificationError) {
      console.warn('⚠️ Bildirim oluşturulamadı:', notificationError);
    }

    res.json({
      success: true,
      message: 'Email adresi başarıyla doğrulandı.',
    });
  } catch (error) {
    console.error('❌ Email doğrulama hatası:', error);
    res.status(400).json({
      success: false,
      message: 'Geçersiz veya süresi dolmuş token.',
    });
  }
};

/**
 * Email Doğrulama Token'ı Yeniden Gönder (Resend Verification)
 * 
 * Email doğrulama token'ını yeniden gönderir.
 * 
 * İşlem Akışı:
 * 1. Kullanıcı bulma (email)
 * 2. Email zaten doğrulanmış mı kontrol
 * 3. Yeni verification token üretme
 * 4. Email gönderme
 * 
 * @route   POST /api/auth/resend-verification
 * @access  Public
 * 
 * @param req.body.email - Email adresi
 * 
 * @returns 200 - Email gönderildi
 * @returns 404 - Kullanıcı bulunamadı
 * @returns 400 - Email zaten doğrulanmış
 * 
 * @example
 * POST /api/auth/resend-verification
 * Body: {
 *   "email": "user@example.com"
 * }
 */
export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    // Kullanıcı bulma
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerified: true, firstName: true, lastName: true }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.',
      });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({
        success: false,
        message: 'Email adresi zaten doğrulanmış.',
      });
      return;
    }

    // Yeni verification token üretme (24 saat geçerli)
    const verificationToken = jwt.sign(
      { id: user.id, type: 'email_verification' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Email doğrulama email'i gönderme - GEÇİCİ OLARAK DEVRE DIŞI
    console.log('📧 Email gönderme özelliği geçici olarak devre dışı');
    
    res.json({
      success: true,
      message: 'Email doğrulama özelliği geçici olarak devre dışı.',
    });
  } catch (error) {
    console.error('❌ Resend verification hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.',
    });
  }
};

/**
 * OAuth Login (OAuth ile Giriş)
 * 
 * Google, Facebook gibi OAuth provider'lar ile giriş yapar.
 * 
 * İşlem Akışı:
 * 1. OAuth provider'dan gelen bilgileri kontrol et
 * 2. Mevcut kullanıcı var mı kontrol et (email ile)
 * 3. Varsa mevcut kullanıcıyı döndür, yoksa yeni oluştur
 * 4. OAuth kullanıcıları otomatik olarak email doğrulanmış sayılır
 * 5. JWT token üret ve döndür
 * 
 * @route   POST /api/auth/oauth
 * @access  Public
 * 
 * @param req.body.provider - OAuth provider (google, facebook)
 * @param req.body.providerId - Provider'dan gelen kullanıcı ID'si
 * @param req.body.email - Kullanıcı email adresi
 * @param req.body.name - Kullanıcı adı
 * @param req.body.image - Kullanıcı profil resmi URL'si (opsiyonel)
 * @param req.body.accessToken - OAuth access token (opsiyonel)
 * 
 * @returns 200 - Kullanıcı ve token
 * @returns 400 - Geçersiz OAuth verileri
 * 
 * @example
 * POST /api/auth/oauth
 * Body: {
 *   "provider": "google",
 *   "providerId": "google_user_id",
 *   "email": "user@gmail.com",
 *   "name": "John Doe",
 *   "image": "https://example.com/avatar.jpg",
 *   "accessToken": "oauth_access_token"
 * }
 */
export const oauthLogin = async (req: Request, res: Response): Promise<void> => {
  const { provider, providerId, email, name, image, accessToken } = req.body;

  try {
    console.log('🔐 OAuth login başlatıldı:', { provider, email });

    // Gerekli alanları kontrol et
    if (!provider || !providerId || !email || !name) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz OAuth verileri.',
      });
      return;
    }

    // Desteklenen provider'ları kontrol et
    if (!['google', 'facebook'].includes(provider)) {
      res.status(400).json({
        success: false,
        message: 'Desteklenmeyen OAuth provider.',
      });
      return;
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz email formatı.',
      });
      return;
    }

    // İsim bilgisini parse et (firstName, lastName)
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Mevcut kullanıcıyı bul (email ile)
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (user) {
      console.log('👤 Mevcut kullanıcı bulundu:', { userId: user.id, email: user.email });
      
      // Kullanıcı bilgilerini güncelle (OAuth bilgileri ile)
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          // OAuth kullanıcıları otomatik olarak email doğrulanmış sayılır
          emailVerified: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else {
      console.log('👤 Yeni OAuth kullanıcı oluşturuluyor...');
      
      // Yeni kullanıcı oluştur
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          // OAuth kullanıcıları için rastgele şifre oluştur (asla kullanılmayacak)
          passwordHash: await bcrypt.hash(`oauth_${providerId}_${Date.now()}`, 12),
          // OAuth kullanıcıları otomatik olarak email doğrulanmış sayılır
          emailVerified: true,
          role: 'USER',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Kredi hesabı oluştur
      await prisma.userCredits.create({
        data: {
          userId: user.id,
          balance: 0,
        },
      });

      // Hoş geldiniz bildirimi oluştur
      try {
        await NotificationService.createWelcomeNotification(user.id, user.firstName);
      } catch (notificationError) {
        console.warn('⚠️ Bildirim oluşturulamadı:', notificationError);
      }

      console.log('✅ Yeni OAuth kullanıcı oluşturuldu:', { userId: user.id, email: user.email });
    }

    // JWT token üretme
    const token = generateToken(user.id);

    console.log('✅ OAuth login başarılı:', { userId: user.id, email: user.email, provider });

    res.json({
      success: true,
      message: `${provider} ile giriş başarılı.`,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('❌ OAuth login hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.',
    });
  }
};
