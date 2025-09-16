import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (id: number): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, firstName, lastName, phone } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    res.status(400).json({
      success: false,
      message: 'Bu email adresi zaten kullanılıyor.',
    });
    return;
  }

  // Hash password
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
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

  // Create user credits
  await prisma.userCredits.create({
    data: {
      userId: user.id,
      balance: 0,
    },
  });

  // Generate token
  const token = generateToken(user.id);

  res.status(201).json({
    success: true,
    message: 'Kullanıcı başarıyla oluşturuldu.',
    data: {
      user,
      token,
    },
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Check if user exists
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

  if (!user || !user.isActive) {
    res.status(401).json({
      success: false,
      message: 'Geçersiz email veya şifre.',
    });
    return;
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      message: 'Geçersiz email veya şifre.',
    });
    return;
  }

  // Generate token
  const token = generateToken(user.id);

  // Remove password from response
  const { passwordHash, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Giriş başarılı.',
    data: {
      user: userWithoutPassword,
      token,
    },
  });
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  // In a real application, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Çıkış başarılı.',
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
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

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
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

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
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

  // Check current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) {
    res.status(400).json({
      success: false,
      message: 'Mevcut şifre yanlış.',
    });
    return;
  }

  // Hash new password
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
  const newPasswordHash = await bcrypt.hash(newPassword, salt);

  // Update password
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { passwordHash: newPasswordHash },
  });

  res.json({
    success: true,
    message: 'Şifre başarıyla değiştirildi.',
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
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

  // Generate reset token
  const resetToken = jwt.sign(
    { id: user.id, type: 'password_reset' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  // TODO: Send email with reset token
  // For now, just return success
  res.json({
    success: true,
    message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi.',
    // In development, you might want to return the token
    ...(process.env.NODE_ENV === 'development' && { resetToken }),
  });
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    const decoded = jwt.verify(token, secret) as any;
    
    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid token type');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
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

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    const decoded = jwt.verify(token, secret) as any;
    
    if (decoded.type !== 'email_verification') {
      throw new Error('Invalid token type');
    }

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
