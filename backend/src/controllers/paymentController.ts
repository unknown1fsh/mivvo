/**
 * Payment Controller (Ödeme Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, ödeme işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Ödeme oluşturma
 * - Ödeme işleme (Iyzico entegrasyonu - TODO)
 * - Ödeme geçmişi
 * - İade işlemleri
 * - Ödeme yöntemleri listeleme
 * 
 * İş Akışı:
 * 1. Ödeme kaydı oluştur (PENDING)
 * 2. Payment gateway'e ilet (Iyzico - TODO)
 * 3. Callback/webhook ile sonucu al
 * 4. Başarılıysa: Kredi ekle + COMPLETED
 * 5. Başarısızsa: FAILED
 * 
 * Özellikler:
 * - Kredi otomatik ekleme
 * - CreditTransaction kaydı
 * - İade mekanizması
 * - Ödeme limitleri (50-5000 TL)
 * 
 * TODO:
 * - Iyzico API entegrasyonu
 * - Webhook endpoint
 * - 3D Secure desteği
 * 
 * Endpoints:
 * - POST /api/payment/create (Ödeme oluştur)
 * - POST /api/payment/process (Ödeme işle)
 * - POST /api/payment/refund (İade)
 * - GET /api/payment/methods (Ödeme yöntemleri)
 * - GET /api/payment/history (Ödeme geçmişi)
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// ===== CONTROLLER METHODS =====

/**
 * Ödeme Oluştur
 * 
 * Yeni bir ödeme kaydı oluşturur (PENDING durumunda).
 * 
 * İşlem Akışı:
 * 1. Tutar doğrulama (min-max limit)
 * 2. Payment kaydı oluştur (PENDING)
 * 3. Reference number generate (PAY_timestamp)
 * 4. Kullanıcıya döndür
 * 
 * Tutar Limitleri:
 * - Minimum: 50 TL
 * - Maksimum: 5000 TL
 * 
 * Sonraki Adım:
 * - Frontend: Payment gateway'e yönlendir
 * - Backend: processPayment ile tamamla
 * 
 * @route   POST /api/payment/create
 * @access  Private
 * 
 * @param req.body.amount - Ödeme tutarı (TL)
 * @param req.body.paymentMethod - Ödeme yöntemi (CREDIT_CARD, BANK_TRANSFER, DIGITAL_WALLET)
 * 
 * @returns 201 - Oluşturulan ödeme kaydı
 * @returns 400 - Geçersiz tutar
 * 
 * @example
 * POST /api/payment/create
 * Body: {
 *   "amount": 100,
 *   "paymentMethod": "CREDIT_CARD"
 * }
 */
export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { amount, paymentMethod } = req.body;

  // Tutar limitleri
  const minAmount = 50;
  const maxAmount = 5000;
  
  if (amount < minAmount || amount > maxAmount) {
    res.status(400).json({
      success: false,
      message: `Ödeme tutarı ${minAmount}-${maxAmount} TL arasında olmalıdır.`,
    });
    return;
  }

  // Ödeme kaydı oluştur
  const payment = await prisma.payment.create({
    data: {
      userId: req.user!.id,
      amount,
      paymentMethod,
      paymentStatus: 'PENDING',
      paymentProvider: 'iyzico', // Default provider
      referenceNumber: `PAY_${Date.now()}`, // Unique reference
    },
  });

  res.status(201).json({
    success: true,
    message: 'Ödeme işlemi başlatıldı.',
    data: { payment },
  });
};

/**
 * Ödeme Yöntemlerini Getir
 * 
 * Mevcut ödeme yöntemlerini listeler.
 * 
 * Ödeme Yöntemleri:
 * - CREDIT_CARD: Kredi kartı (Visa, Mastercard, Amex)
 * - BANK_TRANSFER: Banka havalesi/EFT
 * - DIGITAL_WALLET: Dijital cüzdan (Papara, İninal, PayTR)
 * 
 * @route   GET /api/payment/methods
 * @access  Private
 * 
 * @returns 200 - Ödeme yöntemleri listesi
 * 
 * @example
 * GET /api/payment/methods
 */
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

/**
 * Ödeme İşle
 * 
 * Ödemeyi işler ve sonucu günceller.
 * 
 * İşlem Akışı:
 * 1. Payment kaydı kontrolü (PENDING mi?)
 * 2. Payment gateway'e istek (Iyzico - TODO)
 * 3. Sonuç başarılıysa:
 *    - Payment status: COMPLETED
 *    - TransactionId güncelle
 *    - Kredi ekle (UserCredits)
 *    - CreditTransaction oluştur
 * 4. Başarısızsa: Payment status: FAILED
 * 
 * TODO:
 * - Iyzico API entegrasyonu
 * - 3D Secure callback
 * - Webhook handling
 * 
 * Şu anda: Simülasyon (90% başarı)
 * 
 * @route   POST /api/payment/process
 * @access  Private
 * 
 * @param req.body.paymentId - Payment ID
 * @param req.body.paymentData - Ödeme verileri (kart bilgisi vb.)
 * 
 * @returns 200 - Ödeme başarılı
 * @returns 400 - Ödeme başarısız veya zaten işlenmiş
 * @returns 404 - Payment bulunamadı
 * 
 * @example
 * POST /api/payment/process
 * Body: {
 *   "paymentId": 123,
 *   "paymentData": { ... }
 * }
 */
export const processPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { paymentId, paymentData } = req.body;

  // TODO: Implement actual payment processing with Iyzico
  // For now, simulate successful payment
  
  // Payment kaydı kontrolü
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

  // Ödeme durumu kontrolü
  if (payment.paymentStatus !== 'PENDING') {
    res.status(400).json({
      success: false,
      message: 'Bu ödeme zaten işlenmiş.',
    });
    return;
  }

  // Ödeme simülasyonu (90% başarı - demo için)
  const isSuccessful = Math.random() > 0.1;

  if (isSuccessful) {
    // Ödeme başarılı
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: 'COMPLETED',
        transactionId: `TXN_${Date.now()}`,
      },
    });

    // Kullanıcıya kredi ekle
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

      // CreditTransaction kaydı (audit trail)
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
    // Ödeme başarısız
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

/**
 * Ödeme Geçmişi
 * 
 * Kullanıcının tüm ödemelerini listeler.
 * 
 * Özellikler:
 * - Pagination (page, limit)
 * - Filtreleme (status)
 * - Tarih sıralı (yeni önce)
 * 
 * @route   GET /api/payment/history
 * @access  Private
 * 
 * @param req.query.page - Sayfa numarası
 * @param req.query.limit - Sayfa boyutu
 * @param req.query.status - Durum filtresi (PENDING, COMPLETED, FAILED, REFUNDED)
 * 
 * @returns 200 - Ödeme geçmişi (paginated)
 * 
 * @example
 * GET /api/payment/history?page=1&limit=10&status=COMPLETED
 */
export const getPaymentHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, status } = req.query;

  // Where clause
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

/**
 * Ödeme İadesi
 * 
 * Tamamlanmış bir ödemeyi iade eder.
 * 
 * İşlem Akışı:
 * 1. Payment kontrolü (COMPLETED olmalı)
 * 2. İade işlemi (payment gateway - TODO)
 * 3. Payment status: REFUNDED
 * 4. Kullanıcıdan kredi düş
 * 5. CreditTransaction oluştur (REFUND)
 * 
 * TODO:
 * - Iyzico refund API
 * - Kısmi iade desteği
 * - İade süresi kontrolü (30 gün)
 * 
 * @route   POST /api/payment/refund
 * @access  Private
 * 
 * @param req.body.paymentId - Payment ID
 * @param req.body.reason - İade nedeni
 * 
 * @returns 200 - İade işlemi başlatıldı
 * @returns 404 - İade edilebilir ödeme bulunamadı
 * 
 * @example
 * POST /api/payment/refund
 * Body: {
 *   "paymentId": 123,
 *   "reason": "Kullanılmadı"
 * }
 */
export const refundPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { paymentId, reason } = req.body;

  // Payment kontrolü (COMPLETED olmalı)
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
  
  // Payment status güncelle
  await prisma.payment.update({
    where: { id: payment.id },
    data: { paymentStatus: 'REFUNDED' },
  });

  // Kullanıcıdan kredi düş
  const userCredits = await prisma.userCredits.findUnique({
    where: { userId: req.user!.id },
  });

  if (userCredits) {
    await prisma.userCredits.update({
      where: { userId: req.user!.id },
      data: {
        balance: Decimal.max(userCredits.balance.sub(payment.amount), new Decimal(0)), // Negatif olmasın
      },
    });

    // CreditTransaction oluştur (REFUND)
    await prisma.creditTransaction.create({
      data: {
        userId: req.user!.id,
        transactionType: 'REFUND',
        amount: -payment.amount, // Negatif miktar
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
