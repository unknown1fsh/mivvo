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
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

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

    // Kullanıcı oluşturma
    console.log('👤 Kullanıcı oluşturuluyor...');
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
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

    // JWT token üretme
    console.log('🎫 Token oluşturuluyor...');
    const token = generateToken(user.id);

    console.log('✅ Register başarılı:', { userId: user.id, email: user.email });

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu.',
      data: {
        user,
        token,
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
  const { email, password } = req.body;
  
  console.log('🔐 Backend login başlatıldı:', { email, hasPassword: !!password });

  // Kullanıcı bulma
  console.log('🔍 Kullanıcı aranıyor:', email);
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

  console.log('👤 Kullanıcı bulundu:', {
    found: !!user,
    isActive: user?.isActive,
    userId: user?.id,
    userEmail: user?.email
  });

  // Kullanıcı ve aktiflik kontrolü
  if (!user || !user.isActive) {
    console.error('❌ Kullanıcı bulunamadı veya aktif değil');
    res.status(401).json({
      success: false,
      message: 'Geçersiz email veya şifre.',
    });
    return;
  }

  // Şifre doğrulama
  console.log('🔑 Şifre kontrol ediliyor...');
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  console.log('🔑 Şifre kontrol sonucu:', { isValid: isPasswordValid });
  
  if (!isPasswordValid) {
    console.error('❌ Şifre yanlış');
    res.status(401).json({
      success: false,
      message: 'Geçersiz email veya şifre.',
    });
    return;
  }

  // JWT token üretme
  console.log('🎫 Token oluşturuluyor...');
  const token = generateToken(user.id);
  console.log('🎫 Token oluşturuldu:', { tokenLength: token.length });

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

  console.log('✅ Login başarılı - Response hazırlanıyor:', {
    success: responseData.success,
    hasUser: !!responseData.data.user,
    hasToken: !!responseData.data.token,
    userEmail: responseData.data.user.email,
    fullResponse: responseData
  });

  console.log('📤 Response gönderiliyor:', JSON.stringify(responseData, null, 2));
  res.json(responseData);
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

  // TODO: Email gönderme servisi eklenecek
  res.json({
    success: true,
    message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi.',
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

    // Email doğrulama
    await prisma.user.update({
      where: { id: decoded.id },
      data: { emailVerified: true },
    });

    res.json({
      success: true,
      message: 'Email adresi başarıyla doğrulandı.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Geçersiz veya süresi dolmuş token.',
    });
  }
};
