import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// @desc    Get user credits
// @route   GET /api/user/credits
// @access  Private
export const getUserCredits = async (req: AuthRequest, res: Response): Promise<void> => {
  const userCredits = await prisma.userCredits.findUnique({
    where: { userId: req.user!.id },
  });

  res.json({
    success: true,
    data: { credits: userCredits },
  });
};

// @desc    Purchase credits
// @route   POST /api/user/credits/purchase
// @access  Private
export const purchaseCredits = async (req: AuthRequest, res: Response): Promise<void> => {
  const { amount, paymentMethod } = req.body;

  // TODO: Implement payment processing
  // For now, just add credits directly
  
  const userCredits = await prisma.userCredits.findUnique({
    where: { userId: req.user!.id },
  });

  if (!userCredits) {
    res.status(404).json({
      success: false,
      message: 'Kullanıcı kredisi bulunamadı.',
    });
    return;
  }

  const newBalance = userCredits.balance.add(amount);
  const newTotalPurchased = userCredits.totalPurchased.add(amount);

  await prisma.userCredits.update({
    where: { userId: req.user!.id },
    data: {
      balance: newBalance,
      totalPurchased: newTotalPurchased,
    },
  });

  // Create credit transaction record
  await prisma.creditTransaction.create({
    data: {
      userId: req.user!.id,
      transactionType: 'PURCHASE',
      amount: amount,
      description: 'Kredi satın alma',
      referenceId: `purchase_${Date.now()}`,
    },
  });

  res.json({
    success: true,
    message: 'Kredi başarıyla yüklendi.',
    data: { newBalance },
  });
};

// @desc    Get credit history
// @route   GET /api/user/credits/history
// @access  Private
export const getCreditHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const transactions = await prisma.creditTransaction.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({
    success: true,
    data: { transactions },
  });
};

// @desc    Get user reports
// @route   GET /api/user/reports
// @access  Private
export const getUserReports = async (req: AuthRequest, res: Response): Promise<void> => {
  const reports = await prisma.vehicleReport.findMany({
    where: { userId: req.user!.id },
    include: {
      vehicleImages: true,
      aiAnalysisResults: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: { reports },
  });
};

// @desc    Delete user account
// @route   DELETE /api/user/account
// @access  Private
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  // TODO: Implement account deletion with proper cleanup
  
  res.json({
    success: true,
    message: 'Hesap silme işlemi henüz aktif değil.',
  });
};
