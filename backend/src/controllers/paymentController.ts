import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// @desc    Create payment
// @route   POST /api/payment/create
// @access  Private
export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { amount, paymentMethod } = req.body;

  // Validate amount
  const minAmount = 50;
  const maxAmount = 5000;
  
  if (amount < minAmount || amount > maxAmount) {
    res.status(400).json({
      success: false,
      message: `Ödeme tutarı ${minAmount}-${maxAmount} TL arasında olmalıdır.`,
    });
    return;
  }

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      userId: req.user!.id,
      amount,
      paymentMethod,
      paymentStatus: 'PENDING',
      paymentProvider: 'iyzico', // Default provider
      referenceNumber: `PAY_${Date.now()}`,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Ödeme işlemi başlatıldı.',
    data: { payment },
  });
};

// @desc    Get payment methods
// @route   GET /api/payment/methods
// @access  Private
export const getPaymentMethods = async (req: AuthRequest, res: Response): Promise<void> => {
  const paymentMethods = [
    {
      id: 'CREDIT_CARD',
      name: 'Kredi Kartı',
      description: 'Visa, Mastercard, American Express',
      icon: '💳',
    },
    {
      id: 'BANK_TRANSFER',
      name: 'Banka Havalesi',
      description: 'EFT/Havale ile ödeme',
      icon: '🏦',
    },
    {
      id: 'DIGITAL_WALLET',
      name: 'Dijital Cüzdan',
      description: 'Papara, İninal, PayTR',
      icon: '📱',
    },
  ];

  res.json({
    success: true,
    data: { paymentMethods },
  });
};

// @desc    Process payment
// @route   POST /api/payment/process
// @access  Private
export const processPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { paymentId, paymentData } = req.body;

  // TODO: Implement actual payment processing with Iyzico
  // For now, simulate successful payment
  
  const payment = await prisma.payment.findFirst({
    where: {
      id: parseInt(paymentId),
      userId: req.user!.id,
    },
  });

  if (!payment) {
    res.status(404).json({
      success: false,
      message: 'Ödeme bulunamadı.',
    });
    return;
  }

  if (payment.paymentStatus !== 'PENDING') {
    res.status(400).json({
      success: false,
      message: 'Bu ödeme zaten işlenmiş.',
    });
    return;
  }

  // Simulate payment processing
  const isSuccessful = Math.random() > 0.1; // 90% success rate for demo

  if (isSuccessful) {
    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: 'COMPLETED',
        transactionId: `TXN_${Date.now()}`,
      },
    });

    // Add credits to user account
    const userCredits = await prisma.userCredits.findUnique({
      where: { userId: req.user!.id },
    });

    if (userCredits) {
        await prisma.userCredits.update({
          where: { userId: req.user!.id },
          data: {
            balance: userCredits.balance.add(payment.amount),
            totalPurchased: userCredits.totalPurchased.add(payment.amount),
          },
        });

      // Create credit transaction
      await prisma.creditTransaction.create({
        data: {
          userId: req.user!.id,
          transactionType: 'PURCHASE',
          amount: payment.amount,
          description: 'Kredi satın alma',
          referenceId: payment.referenceNumber,
        },
      });
    }

    res.json({
      success: true,
      message: 'Ödeme başarıyla tamamlandı.',
      data: { 
        payment: {
          ...payment,
          paymentStatus: 'COMPLETED',
        },
      },
    });
  } else {
    // Payment failed
    await prisma.payment.update({
      where: { id: payment.id },
      data: { paymentStatus: 'FAILED' },
    });

    res.status(400).json({
      success: false,
      message: 'Ödeme işlemi başarısız oldu.',
    });
  }
};

// @desc    Get payment history
// @route   GET /api/payment/history
// @access  Private
export const getPaymentHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, status } = req.query;

  const where: any = { userId: req.user!.id };
  if (status) {
    where.paymentStatus = status;
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const total = await prisma.payment.count({ where });

  res.json({
    success: true,
    data: {
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
};

// @desc    Refund payment
// @route   POST /api/payment/refund
// @access  Private
export const refundPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { paymentId, reason } = req.body;

  const payment = await prisma.payment.findFirst({
    where: {
      id: parseInt(paymentId),
      userId: req.user!.id,
      paymentStatus: 'COMPLETED',
    },
  });

  if (!payment) {
    res.status(404).json({
      success: false,
      message: 'İade edilebilir ödeme bulunamadı.',
    });
    return;
  }

  // TODO: Implement actual refund processing
  // For now, just update status
  
  await prisma.payment.update({
    where: { id: payment.id },
    data: { paymentStatus: 'REFUNDED' },
  });

  // Deduct credits from user account
  const userCredits = await prisma.userCredits.findUnique({
    where: { userId: req.user!.id },
  });

  if (userCredits) {
    await prisma.userCredits.update({
      where: { userId: req.user!.id },
      data: {
        balance: Decimal.max(userCredits.balance.sub(payment.amount), new Decimal(0)),
      },
    });

    // Create refund transaction
    await prisma.creditTransaction.create({
      data: {
        userId: req.user!.id,
        transactionType: 'REFUND',
        amount: -payment.amount,
        description: `İade: ${reason}`,
        referenceId: payment.referenceNumber,
      },
    });
  }

  res.json({
    success: true,
    message: 'İade işlemi başlatıldı.',
    data: { 
      payment: {
        ...payment,
        paymentStatus: 'REFUNDED',
      },
    },
  });
};
