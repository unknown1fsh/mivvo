/**
 * User Controller (Kullanıcı Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, kullanıcı işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Kredi bilgileri görüntüleme
 * - Kredi satın alma
 * - Kredi geçmişi görüntüleme
 * - Kullanıcı raporları listeleme
 * - Hesap silme
 * 
 * Thin Controller Prensibi:
 * - Minimal iş mantığı
 * - Doğrudan Prisma çağrıları (gelecekte service'e taşınabilir)
 * - Response standardizasyonu
 * 
 * İyileştirme Alanları:
 * - UserService oluşturulabilir
 * - Ödeme servisi entegrasyonu (purchaseCredits)
 * - Hesap silme implementasyonu (deleteAccount)
 * - Pagination eklenmeli (reports, history)
 * 
 * Endpoints:
 * - GET /api/user/credits (Private)
 * - POST /api/user/credits/purchase (Private)
 * - GET /api/user/credits/history (Private)
 * - GET /api/user/reports (Private)
 * - DELETE /api/user/account (Private)
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { getPrismaClient } from '../utils/prisma';

const prisma = getPrismaClient();

// ===== CONTROLLER METHODS =====

/**
 * Kredi Bilgileri Getir
 * 
 * Kullanıcının kredi bakiyesi ve istatistiklerini döndürür.
 * 
 * Dönen Bilgiler:
 * - balance: Mevcut bakiye (TL)
 * - totalPurchased: Toplam satın alınan (TL)
 * - totalUsed: Toplam kullanılan (TL)
 * 
 * Auto-Create Feature:
 * - Eğer kullanıcının kredi kaydı yoksa otomatik oluşturur
 * - Başlangıç bakiyesi: 0 TL
 * - Eski kullanıcılar için backward compatibility
 * 
 * @route   GET /api/user/credits
 * @access  Private
 * 
 * @returns 200 - Kredi bilgileri
 * 
 * @example
 * GET /api/user/credits
 * Response: {
 *   "success": true,
 *   "data": {
 *     "credits": {
 *       "balance": 500,
 *       "totalPurchased": 1000,
 *       "totalUsed": 500
 *     }
 *   }
 * }
 */
export const getUserCredits = async (req: AuthRequest, res: Response): Promise<void> => {
  // Kullanıcının kredi kaydını bul
  let userCredits = await prisma.userCredits.findUnique({
    where: { userId: req.user!.id },
  });

  // Eğer kredi kaydı yoksa oluştur (backward compatibility için)
  if (!userCredits) {
    console.log(`⚠️ UserCredits not found for user ${req.user!.id}, creating...`);
    
    userCredits = await prisma.userCredits.create({
      data: {
        userId: req.user!.id,
        balance: 0,
        totalPurchased: 0,
        totalUsed: 0,
      },
    });
    
    console.log(`✅ UserCredits created for user ${req.user!.id}`);
  }

  res.json({
    success: true,
    data: { credits: userCredits },
  });
};

/**
 * Kredi Satın Al
 * 
 * Kullanıcıya kredi yükler ve transaction kaydı oluşturur.
 * 
 * İşlem Akışı:
 * 1. Mevcut kredi bilgilerini getir
 * 2. Bakiye ve totalPurchased güncelle
 * 3. CreditTransaction kaydı oluştur
 * 
 * TODO: Ödeme Servisi Entegrasyonu
 * - Stripe/Iyzico entegrasyonu
 * - Ödeme doğrulama
 * - Webhook handling
 * - Başarısız ödeme yönetimi
 * 
 * Şu anda: Direkt kredi ekleme (test amaçlı)
 * 
 * @route   POST /api/user/credits/purchase
 * @access  Private
 * 
 * @param req.body.amount - Satın alınacak kredi miktarı (TL)
 * @param req.body.paymentMethod - Ödeme yöntemi (henüz kullanılmıyor)
 * 
 * @returns 200 - Yeni bakiye
 * @returns 404 - Kullanıcı kredisi bulunamadı
 * 
 * @example
 * POST /api/user/credits/purchase
 * Body: {
 *   "amount": 100,
 *   "paymentMethod": "credit_card"
 * }
 */
export const purchaseCredits = async (req: AuthRequest, res: Response): Promise<void> => {
  const { amount, paymentMethod } = req.body;

  // Validation
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    res.status(400).json({
      success: false,
      message: 'Geçerli bir kredi miktarı giriniz.',
    });
    return;
  }

  // TODO: Ödeme servisi entegrasyonu
  // Şu anda direkt kredi ekleniyor
  
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

  // Bakiye ve toplam satın alınan güncelleme
  const newBalance = userCredits.balance.add(amount);
  const newTotalPurchased = userCredits.totalPurchased.add(amount);

  await prisma.userCredits.update({
    where: { userId: req.user!.id },
    data: {
      balance: newBalance,
      totalPurchased: newTotalPurchased,
    },
  });

  // Transaction kaydı oluştur (audit trail)
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

/**
 * Kredi Geçmişi Getir
 * 
 * Kullanıcının kredi transaction geçmişini listeler.
 * 
 * Özellikler:
 * - En yeni 50 transaction
 * - Tarih sıralı (descending)
 * 
 * Transaction Tipleri:
 * - PURCHASE: Kredi satın alma
 * - USAGE: Servis kullanımı (analiz vb.)
 * - REFUND: İade
 * - BONUS: Bonus kredi
 * 
 * TODO: Pagination ekle (limit, offset parametreleri)
 * 
 * @route   GET /api/user/credits/history
 * @access  Private
 * 
 * @returns 200 - Transaction listesi
 * 
 * @example
 * GET /api/user/credits/history
 * Response: {
 *   "success": true,
 *   "data": {
 *     "transactions": [
 *       {
 *         "id": 1,
 *         "transactionType": "PURCHASE",
 *         "amount": 100,
 *         "description": "Kredi satın alma",
 *         "createdAt": "2025-01-15T10:30:00Z"
 *       }
 *     ]
 *   }
 * }
 */
export const getCreditHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const skip = (page - 1) * limit;
  
  // Filtreleme parametreleri
  const where: any = { userId: req.user!.id };
  
  if (req.query.type) {
    where.transactionType = req.query.type;
  }
  
  if (req.query.status) {
    where.status = req.query.status;
  }

  const [transactions, total] = await Promise.all([
    prisma.creditTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.creditTransaction.count({ where }),
  ]);

  res.json({
    success: true,
    data: { 
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

/**
 * Kullanıcı Raporları Getir
 * 
 * Kullanıcının oluşturduğu tüm araç raporlarını listeler.
 * 
 * İlişkili Veriler:
 * - vehicleImages: Rapor görselleri
 * - aiAnalysisResults: AI analiz sonuçları
 * 
 * Sıralama: En yeni raporlar önce
 * 
 * TODO: Pagination ekle
 * TODO: Filtreleme ekle (status, reportType)
 * 
 * @route   GET /api/user/reports
 * @access  Private
 * 
 * @returns 200 - Rapor listesi
 * 
 * @example
 * GET /api/user/reports
 * Response: {
 *   "success": true,
 *   "data": {
 *     "reports": [
 *       {
 *         "id": 1,
 *         "reportType": "DAMAGE_ASSESSMENT",
 *         "status": "COMPLETED",
 *         "vehiclePlate": "34ABC123",
 *         "createdAt": "2025-01-15T10:30:00Z",
 *         "vehicleImages": [...],
 *         "aiAnalysisResults": [...]
 *       }
 *     ]
 *   }
 * }
 */
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

/**
 * Kredi İşlem Geçmişi
 * 
 * Kullanıcının kredi işlem geçmişini getirir.
 * 
 * @route   GET /api/user/credits/transactions
 * @access  Private
 * 
 * @returns 200 - İşlem listesi
 */
export const getCreditTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        transactionType: true,
        amount: true,
        description: true,
        createdAt: true,
      },
    }),
    prisma.creditTransaction.count({ where: { userId } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
};

/**
 * Hesap Silme
 * 
 * Kullanıcı hesabını ve ilişkili tüm verileri siler.
 * 
 * TODO: Implementasyon Gerekli
 * 
 * Silinmesi Gereken Veriler:
 * - User kaydı
 * - UserCredits
 * - CreditTransactions
 * - VehicleReports (ve ilişkili görseller)
 * - VehicleGarage kayıtları
 * - Session/Token blacklist (varsa)
 * 
 * Güvenlik:
 * - Şifre doğrulama gerekli
 * - Onay mekanizması (email/SMS)
 * - Soft delete (isDeleted flag) veya hard delete
 * - GDPR compliance (veri silme hakkı)
 * 
 * @route   DELETE /api/user/account
 * @access  Private
 * 
 * @returns 200 - Hesap silindi (şu anda placeholder)
 * 
 * @example
 * DELETE /api/user/account
 * Body: {
 *   "password": "CurrentPassword123",
 *   "confirmDeletion": true
 * }
 */
/**
 * Rehberi Görüldü Olarak İşaretle
 * 
 * Kullanıcının onboarding rehberini tamamladığını işaretler.
 * 
 * İş Akışı:
 * 1. hasSeenGuide alanını true yap
 * 2. updatedAt timestamp güncelle
 * 
 * @route   PATCH /api/user/guide-seen
 * @access  Private
 * 
 * @returns 200 - Başarılı güncelleme
 * @returns 401 - Yetkisiz erişim
 * @returns 500 - Sunucu hatası
 * 
 * @example
 * PATCH /api/user/guide-seen
 * Response: { success: true, message: "Rehber görüldü olarak işaretlendi" }
 */
export const markGuideAsSeen = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Yetkilendirme gerekli'
      });
      return;
    }

    // hasSeenGuide alanını true yap
    await prisma.user.update({
      where: { id: userId },
      data: {
        hasSeenGuide: true,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Rehber görüldü olarak işaretlendi',
      data: {
        hasSeenGuide: true,
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Rehber işaretleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rehber işaretlenirken hata oluştu'
    });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  // TODO: Hesap silme implementasyonu
  // - Şifre doğrulama
  // - İlişkili verilerin silinmesi
  // - Soft delete veya hard delete
  
  res.json({
    success: true,
    message: 'Hesap silme işlemi henüz aktif değil.',
  });
};
