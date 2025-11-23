/**
 * Admin Controller (Yönetici Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, admin panel işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Kullanıcı yönetimi (CRUD, arama, filtreleme)
 * - Rapor yönetimi ve inceleme
 * - Sistem istatistikleri
 * - Fiyatlandırma yönetimi
 * - Sistem ayarları
 * 
 * Yetkilendirme:
 * - Tüm endpoint'ler ADMIN rolü gerektirir
 * - auth middleware ve authorize('ADMIN') ile korunmalı
 * 
 * Özellikler:
 * - Pagination desteği
 * - Arama ve filtreleme
 * - Soft delete (kullanıcı silme)
 * - İstatistik agregasyonu
 * - Toplu güncelleme (pricing, settings)
 * 
 * Endpoints:
 * - GET /api/admin/users (Kullanıcı listesi)
 * - GET /api/admin/users/:id (Kullanıcı detayı)
 * - PUT /api/admin/users/:id (Kullanıcı güncelle)
 * - DELETE /api/admin/users/:id (Kullanıcı sil)
 * - GET /api/admin/reports (Rapor listesi)
 * - GET /api/admin/reports/:id (Rapor detayı)
 * - PUT /api/admin/reports/:id/status (Rapor durumu güncelle)
 * - GET /api/admin/stats (Sistem istatistikleri)
 * - GET /api/admin/pricing (Fiyatlandırma listesi)
 * - PUT /api/admin/pricing (Fiyatlandırma güncelle)
 * - GET /api/admin/settings (Sistem ayarları)
 * - PUT /api/admin/settings (Sistem ayarları güncelle)
 */

import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { getPrismaClient } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = getPrismaClient();

// ===== KULLANICI YÖNETİMİ =====

/**
 * Tüm Kullanıcıları Listele
 * 
 * Kullanıcıları paginated olarak listeler.
 * 
 * Özellikler:
 * - Pagination (page, limit)
 * - Arama (email, ad, soyad)
 * - Filtreleme (role)
 * - Kredi bilgileri dahil
 * 
 * @route   GET /api/admin/users
 * @access  Private/Admin
 * 
 * @param req.query.page - Sayfa numarası (default: 1)
 * @param req.query.limit - Sayfa boyutu (default: 10)
 * @param req.query.search - Arama terimi
 * @param req.query.role - Rol filtresi (USER, ADMIN)
 * 
 * @returns 200 - Kullanıcı listesi ve pagination bilgisi
 * 
 * @example
 * GET /api/admin/users?page=1&limit=10&search=ahmet&role=USER
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, search, role } = req.query;

  // Where clause oluşturma
  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: search as string } },
      { firstName: { contains: search as string } },
      { lastName: { contains: search as string } },
    ];
  }
  if (role) {
    where.role = role;
  }

  // Kullanıcıları getir
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
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
    orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  // Eksik UserCredits kayıtlarını oluştur
  for (const user of users) {
    if (!user.userCredits) {
      console.log(`⚠️ Admin - UserCredits not found for user ${user.id}, creating...`);
      
      await prisma.userCredits.create({
        data: {
          userId: user.id,
          balance: 0,
          totalPurchased: 0,
          totalUsed: 0,
        },
      });
      
      // Kullanıcı objesini güncelle
      user.userCredits = {
        balance: new Prisma.Decimal(0),
        totalPurchased: new Prisma.Decimal(0),
        totalUsed: new Prisma.Decimal(0),
      };
      
      console.log(`✅ Admin - UserCredits created for user ${user.id}`);
    }
  }

  // Decimal değerleri number'a çevir (JSON serialize sorununu önlemek için)
  const usersWithNumericCredits = users.map(user => ({
    ...user,
    userCredits: user.userCredits ? {
      ...user.userCredits,
      balance: parseFloat(user.userCredits.balance.toString()),
      totalPurchased: parseFloat(user.userCredits.totalPurchased.toString()),
      totalUsed: parseFloat(user.userCredits.totalUsed.toString()),
    } : null,
  }));

  const total = await prisma.user.count({ where });

  res.json({
    success: true,
    data: {
      users: usersWithNumericCredits,
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
 * Kullanıcı Detayını Getir
 * 
 * Belirli bir kullanıcının detaylı bilgilerini getirir.
 * 
 * İçerik:
 * - Kullanıcı bilgileri
 * - Kredi bilgileri
 * - Son 10 kredi transaction
 * - Son 10 araç raporu
 * - Son 10 ödeme
 * 
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 * 
 * @param req.params.id - Kullanıcı ID
 * 
 * @returns 200 - Kullanıcı detayları
 * @returns 404 - Kullanıcı bulunamadı
 * 
 * @example
 * GET /api/admin/users/123
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      userCredits: true,
      creditTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      vehicleReports: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı.',
    });
    return;
  }

  // Eğer kredi kaydı yoksa oluştur (backward compatibility)
  if (!user.userCredits) {
    console.log(`⚠️ Admin - UserCredits not found for user ${user.id}, creating...`);
    
    user.userCredits = await prisma.userCredits.create({
      data: {
        userId: user.id,
        balance: 0,
        totalPurchased: 0,
        totalUsed: 0,
      },
    });
    
    console.log(`✅ Admin - UserCredits created for user ${user.id}`);
  }

  // Decimal değerleri number'a çevir (JSON serialize sorununu önlemek için)
  if (user && user.userCredits) {
    user.userCredits = {
      ...user.userCredits,
      balance: parseFloat(user.userCredits.balance.toString()),
      totalPurchased: parseFloat(user.userCredits.totalPurchased.toString()),
      totalUsed: parseFloat(user.userCredits.totalUsed.toString()),
    } as any;
  }

  res.json({
    success: true,
    data: { user },
  });
};

/**
 * Kullanıcı Güncelle
 * 
 * Kullanıcı bilgilerini günceller.
 * 
 * Güncellenebilir Alanlar:
 * - firstName, lastName
 * - role (USER, ADMIN)
 * - isActive (aktiflik durumu)
 * - emailVerified (email doğrulama)
 * 
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 * 
 * @param req.params.id - Kullanıcı ID
 * @param req.body.firstName - Ad
 * @param req.body.lastName - Soyad
 * @param req.body.role - Rol
 * @param req.body.isActive - Aktif mi?
 * @param req.body.emailVerified - Email doğrulanmış mı?
 * 
 * @returns 200 - Güncellenmiş kullanıcı
 * @returns 404 - Kullanıcı bulunamadı
 * 
 * @example
 * PUT /api/admin/users/123
 * Body: {
 *   "firstName": "Ahmet",
 *   "role": "ADMIN",
 *   "isActive": true
 * }
 */
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { firstName, lastName, role, isActive, emailVerified } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı.',
    });
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      firstName,
      lastName,
      role,
      isActive,
      emailVerified,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      emailVerified: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    message: 'Kullanıcı başarıyla güncellendi.',
    data: { user: updatedUser },
  });
};

/**
 * Kullanıcı Sil
 * 
 * Kullanıcıyı deaktive eder (soft delete).
 * 
 * NOT: Hard delete yerine soft delete kullanılır.
 * isActive = false yapılır, veri kalır.
 * 
 * Avantajlar:
 * - Audit trail korunur
 * - Veri kaybı olmaz
 * - Geri alınabilir
 * 
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 * 
 * @param req.params.id - Kullanıcı ID
 * 
 * @returns 200 - Kullanıcı deaktive edildi
 * @returns 404 - Kullanıcı bulunamadı
 * 
 * @example
 * DELETE /api/admin/users/123
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı.',
    });
    return;
  }

  // Soft delete - isActive = false
  await prisma.user.update({
    where: { id: parseInt(id) },
    data: { isActive: false },
  });

  res.json({
    success: true,
    message: 'Kullanıcı başarıyla deaktive edildi.',
  });
};

// ===== RAPOR YÖNETİMİ =====

/**
 * Tüm Raporları Listele
 * 
 * Sistem genelindeki tüm raporları listeler.
 * 
 * Özellikler:
 * - Pagination
 * - Filtreleme (status, reportType)
 * - Kullanıcı bilgileri dahil
 * - Görseller ve analiz sonuçları dahil
 * 
 * @route   GET /api/admin/reports
 * @access  Private/Admin
 * 
 * @param req.query.page - Sayfa numarası (default: 1)
 * @param req.query.limit - Sayfa boyutu (default: 10)
 * @param req.query.status - Durum filtresi (PENDING, PROCESSING, COMPLETED, FAILED)
 * @param req.query.reportType - Tip filtresi (DAMAGE_ASSESSMENT, VALUE_ESTIMATION, vb.)
 * 
 * @returns 200 - Rapor listesi ve pagination bilgisi
 * 
 * @example
 * GET /api/admin/reports?page=1&limit=10&status=COMPLETED
 */
export const getAllReports = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, status, reportType } = req.query;

  // Where clause oluşturma
  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (reportType) {
    where.reportType = reportType;
  }

  const reports = await prisma.vehicleReport.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      vehicleImages: true,
      aiAnalysisResults: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const total = await prisma.vehicleReport.count({ where });

  res.json({
    success: true,
    data: {
      reports,
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
 * Rapor Detayını Getir
 * 
 * Belirli bir raporun detaylı bilgilerini getirir.
 * 
 * İçerik:
 * - Rapor bilgileri
 * - Kullanıcı bilgileri
 * - Araç görselleri
 * - AI analiz sonuçları
 * 
 * @route   GET /api/admin/reports/:id
 * @access  Private/Admin
 * 
 * @param req.params.id - Rapor ID
 * 
 * @returns 200 - Rapor detayları
 * @returns 404 - Rapor bulunamadı
 * 
 * @example
 * GET /api/admin/reports/456
 */
export const getReportById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const report = await prisma.vehicleReport.findUnique({
    where: { id: parseInt(id) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      vehicleImages: true,
      aiAnalysisResults: true,
    },
  });

  if (!report) {
    res.status(404).json({
      success: false,
      message: 'Rapor bulunamadı.',
    });
    return;
  }

  res.json({
    success: true,
    data: { report },
  });
};

/**
 * Rapor Durumunu Güncelle
 * 
 * Raporun durumunu ve uzman notlarını günceller.
 * 
 * Kullanım Senaryoları:
 * - Manuel inceleme sonrası durum güncelleme
 * - Uzman notları ekleme
 * - Rapor onaylama/reddetme
 * 
 * @route   PUT /api/admin/reports/:id/status
 * @access  Private/Admin
 * 
 * @param req.params.id - Rapor ID
 * @param req.body.status - Yeni durum
 * @param req.body.expertNotes - Uzman notları
 * 
 * @returns 200 - Güncellenmiş rapor
 * @returns 404 - Rapor bulunamadı
 * 
 * @example
 * PUT /api/admin/reports/456/status
 * Body: {
 *   "status": "COMPLETED",
 *   "expertNotes": "Manuel inceleme tamamlandı, analiz sonuçları doğru."
 * }
 */
export const updateReportStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, expertNotes } = req.body;

  const report = await prisma.vehicleReport.findUnique({
    where: { id: parseInt(id) },
  });

  if (!report) {
    res.status(404).json({
      success: false,
      message: 'Rapor bulunamadı.',
    });
    return;
  }

  const updatedReport = await prisma.vehicleReport.update({
    where: { id: parseInt(id) },
    data: {
      status,
      expertNotes,
    },
  });

  res.json({
    success: true,
    message: 'Rapor durumu başarıyla güncellendi.',
    data: { report: updatedReport },
  });
};

// ===== STAT İSTİKLER =====

/**
 * Sistem İstatistiklerini Getir
 * 
 * Sistem genelindeki özet istatistikleri döndürür.
 * 
 * İstatistikler:
 * - Kullanıcı sayıları (toplam, aktif, pasif)
 * - Rapor sayıları (toplam, tamamlanmış, bekleyen)
 * - Gelir (toplam)
 * - Kredi dolaşımı (toplam bakiye)
 * 
 * Performans:
 * - Promise.all ile paralel sorgular
 * - Agregasyon kullanımı
 * 
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 * 
 * @returns 200 - Sistem istatistikleri
 * 
 * @example
 * GET /api/admin/stats
 * Response: {
 *   "success": true,
 *   "data": {
 *     "users": {
 *       "total": 1500,
 *       "active": 1200,
 *       "inactive": 300
 *     },
 *     "reports": {
 *       "total": 5000,
 *       "completed": 4500,
 *       "pending": 500
 *     },
 *     "revenue": {
 *       "total": 150000
 *     },
 *     "credits": {
 *       "totalInCirculation": 50000
 *     }
 *   }
 * }
 */
export const getSystemStats = async (req: AuthRequest, res: Response): Promise<void> => {
  // Paralel sorgular ile performans optimizasyonu
  const [
    totalUsers,
    activeUsers,
    totalReports,
    completedReports,
    totalRevenue,
    totalCredits,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.vehicleReport.count(),
    prisma.vehicleReport.count({ where: { status: 'COMPLETED' } }),
    prisma.payment.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.userCredits.aggregate({
      _sum: { balance: true },
    }),
  ]);

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      reports: {
        total: totalReports,
        completed: completedReports,
        pending: totalReports - completedReports,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
      },
      credits: {
        totalInCirculation: totalCredits._sum.balance || 0,
      },
    },
  });
};

// ===== FİYATLANDIRMA YÖNETİMİ =====

/**
 * Servis Fiyatlandırmasını Getir
 * 
 * Tüm servislerin fiyatlandırma bilgilerini listeler.
 * 
 * @route   GET /api/admin/pricing
 * @access  Private/Admin
 * 
 * @returns 200 - Fiyatlandırma listesi
 * 
 * @example
 * GET /api/admin/pricing
 */
export const getServicePricing = async (req: AuthRequest, res: Response): Promise<void> => {
  const pricing = await prisma.servicePricing.findMany({
    orderBy: { serviceType: 'asc' },
  });

  res.json({
    success: true,
    data: { pricing },
  });
};

/**
 * Servis Fiyatlandırmasını Güncelle
 * 
 * Birden fazla servis fiyatını toplu günceller.
 * 
 * @route   PUT /api/admin/pricing
 * @access  Private/Admin
 * 
 * @param req.body.pricing - Fiyatlandırma dizisi
 * 
 * @returns 200 - Güncellenmiş fiyatlandırma
 * 
 * @example
 * PUT /api/admin/pricing
 * Body: {
 *   "pricing": [
 *     { "id": 1, "basePrice": 50, "isActive": true },
 *     { "id": 2, "basePrice": 100, "isActive": true }
 *   ]
 * }
 */
export const updateServicePricing = async (req: AuthRequest, res: Response): Promise<void> => {
  const { pricing } = req.body; // Array of pricing objects

  const updatedPricing = await Promise.all(
    pricing.map((price: any) =>
      prisma.servicePricing.update({
        where: { id: price.id },
        data: {
          basePrice: price.basePrice,
          isActive: price.isActive,
        },
      })
    )
  );

  res.json({
    success: true,
    message: 'Fiyatlandırma başarıyla güncellendi.',
    data: { pricing: updatedPricing },
  });
};

// ===== SİSTEM AYARLARI =====

/**
 * Sistem Ayarlarını Getir
 * 
 * Tüm sistem ayarlarını listeler.
 * 
 * @route   GET /api/admin/settings
 * @access  Private/Admin
 * 
 * @returns 200 - Sistem ayarları
 * 
 * @example
 * GET /api/admin/settings
 */
export const getSystemSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const settings = await prisma.systemSetting.findMany({
    orderBy: { settingKey: 'asc' },
  });

  res.json({
    success: true,
    data: { settings },
  });
};

/**
 * Sistem Ayarlarını Güncelle
 * 
 * Birden fazla sistem ayarını toplu günceller.
 * 
 * @route   PUT /api/admin/settings
 * @access  Private/Admin
 * 
 * @param req.body.settings - Ayarlar dizisi
 * 
 * @returns 200 - Güncellenmiş ayarlar
 * 
 * @example
 * PUT /api/admin/settings
 * Body: {
 *   "settings": [
 *     { "settingKey": "MAX_UPLOAD_SIZE", "settingValue": "10MB" },
 *     { "settingKey": "ENABLE_AI", "settingValue": "true" }
 *   ]
 * }
 */
export const updateSystemSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const { settings } = req.body; // Array of setting objects

  const updatedSettings = await Promise.all(
    settings.map((setting: any) =>
      prisma.systemSetting.update({
        where: { settingKey: setting.settingKey },
        data: {
          settingValue: setting.settingValue,
        },
      })
    )
  );

  res.json({
    success: true,
    message: 'Sistem ayarları başarıyla güncellendi.',
    data: { settings: updatedSettings },
  });
};

// ===== KREDİ YÖNETİMİ =====

/**
 * Kullanıcıya Kredi Ekle
 * 
 * Admin tarafından kullanıcıya kredi yükler.
 * 
 * İşlem Akışı:
 * 1. Kullanıcı kredisini getir
 * 2. Bakiyeye ekle
 * 3. Transaction kaydı oluştur (audit trail)
 * 
 * @route   POST /api/admin/users/:id/credits/add
 * @access  Private/Admin
 * 
 * @param req.params.id - Kullanıcı ID
 * @param req.body.amount - Eklenecek kredi miktarı
 * @param req.body.description - İşlem açıklaması
 * 
 * @returns 200 - Güncellenmiş bakiye
 * @returns 404 - Kullanıcı bulunamadı
 * 
 * @example
 * POST /api/admin/users/123/credits/add
 * Body: {
 *   "amount": 1000,
 *   "description": "Admin tarafından bonus kredi"
 * }
 */
export const addUserCredits = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { amount, description = 'Admin tarafından kredi yükleme' } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      userCredits: true,
    },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı.',
    });
    return;
  }

  // Atomik işlem: Kredi kaydı oluştur/güncelle + Transaction kaydı
  const result = await prisma.$transaction(async (tx) => {
    // Kullanıcı kredisi yoksa oluştur
    let userCredits = await tx.userCredits.findUnique({
      where: { userId: user.id },
    });

    if (!userCredits) {
      userCredits = await tx.userCredits.create({
        data: {
          userId: user.id,
          balance: 0,
          totalPurchased: 0,
          totalUsed: 0,
        },
      });
    }

    // Kredi ekle
    const updatedCredits = await tx.userCredits.update({
      where: { userId: user.id },
      data: {
        balance: {
          increment: amount,
        },
        totalPurchased: {
          increment: amount,
        },
      },
    });

    // Transaction kaydı oluştur
    await tx.creditTransaction.create({
      data: {
        userId: user.id,
        transactionType: 'PURCHASE',
        amount: amount,
        description: description,
        referenceId: `admin_add_${req.user!.id}_${Date.now()}`,
        status: 'COMPLETED',
      },
    });

    return updatedCredits;
  });

  // Decimal değerleri number'a çevir (JSON serialize sorununu önlemek için)
  const creditsResponse = {
    id: result.id,
    userId: result.userId,
    balance: parseFloat(result.balance.toString()),
    totalPurchased: parseFloat(result.totalPurchased.toString()),
    totalUsed: parseFloat(result.totalUsed.toString()),
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };

  res.json({
    success: true,
    message: `${amount} kredi başarıyla eklendi.`,
    data: { credits: creditsResponse },
  });
};

/**
 * Kullanıcı Kredilerini Sıfırla
 * 
 * Kullanıcının tüm kredilerini sıfırlar.
 * 
 * UYARI: Bu işlem geri alınamaz!
 * 
 * @route   POST /api/admin/users/:id/credits/reset
 * @access  Private/Admin
 * 
 * @param req.params.id - Kullanıcı ID
 * @param req.body.reason - Sıfırlama sebebi (audit için)
 * 
 * @returns 200 - Sıfırlanmış krediler
 * @returns 404 - Kullanıcı bulunamadı
 * 
 * @example
 * POST /api/admin/users/123/credits/reset
 * Body: {
 *   "reason": "Hesap kapatma talebi"
 * }
 */
export const resetUserCredits = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { reason = 'Admin tarafından sıfırlama' } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      userCredits: true,
    },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı.',
    });
    return;
  }

  const oldBalance = Number(user.userCredits?.balance || 0);

  // Kredileri sıfırla
  const updatedCredits = await prisma.userCredits.update({
    where: { userId: user.id },
    data: {
      balance: 0,
    },
  });

  // Transaction kaydı oluştur
  if (oldBalance > 0) {
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        transactionType: 'REFUND',
        amount: oldBalance,
        description: `Kredi sıfırlama: ${reason}`,
        referenceId: `admin_reset_${req.user!.id}_${Date.now()}`,
      },
    });
  }

  res.json({
    success: true,
    message: 'Kullanıcı kredileri sıfırlandı.',
    data: {
      credits: {
        id: updatedCredits.id,
        userId: updatedCredits.userId,
        balance: parseFloat(updatedCredits.balance.toString()),
        totalPurchased: parseFloat(updatedCredits.totalPurchased.toString()),
        totalUsed: parseFloat(updatedCredits.totalUsed.toString()),
        createdAt: updatedCredits.createdAt,
        updatedAt: updatedCredits.updatedAt,
      },
      resetAmount: parseFloat(oldBalance.toString()),
    },
  });
};

/**
 * Kullanıcıya Kredi İadesi Yap
 * 
 * Belirtilen miktarda kredi iadesi yapar.
 * 
 * @route   POST /api/admin/users/:id/credits/refund
 * @access  Private/Admin
 * 
 * @param req.params.id - Kullanıcı ID
 * @param req.body.amount - İade edilecek kredi miktarı
 * @param req.body.reason - İade sebebi
 * 
 * @returns 200 - Güncellenmiş krediler
 * @returns 404 - Kullanıcı bulunamadı
 * 
 * @example
 * POST /api/admin/users/123/credits/refund
 * Body: {
 *   "amount": 50,
 *   "reason": "Hatalı işlem iadesi"
 * }
 */
export const refundUserCredits = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { amount, reason = 'Admin tarafından iade' } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      userCredits: true,
    },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı.',
    });
    return;
  }

  // Kredi iadesi yap
  const updatedCredits = await prisma.userCredits.update({
    where: { userId: user.id },
    data: {
      balance: {
        increment: amount,
      },
    },
  });

  // Transaction kaydı oluştur
  await prisma.creditTransaction.create({
    data: {
      userId: user.id,
      transactionType: 'REFUND',
      amount: amount,
      description: reason,
      referenceId: `admin_refund_${req.user!.id}_${Date.now()}`,
    },
  });

  res.json({
    success: true,
    message: `${amount} kredi iadesi başarıyla yapıldı.`,
    data: {
      credits: {
        id: updatedCredits.id,
        userId: updatedCredits.userId,
        balance: parseFloat(updatedCredits.balance.toString()),
        totalPurchased: parseFloat(updatedCredits.totalPurchased.toString()),
        totalUsed: parseFloat(updatedCredits.totalUsed.toString()),
        createdAt: updatedCredits.createdAt,
        updatedAt: updatedCredits.updatedAt,
      },
    },
  });
};

// ===== KULLANICI DURUM YÖNETİMİ =====

/**
 * Kullanıcıyı Dondur
 * 
 * Kullanıcı hesabını geçici olarak deaktive eder.
 * 
 * @route   POST /api/admin/users/:id/suspend
 * @access  Private/Admin
 * 
 * @param req.params.id - Kullanıcı ID
 * @param req.body.reason - Dondurma sebebi
 * 
 * @returns 200 - Güncellenmiş kullanıcı
 * @returns 404 - Kullanıcı bulunamadı
 * 
 * @example
 * POST /api/admin/users/123/suspend
 * Body: {
 *   "reason": "Şüpheli aktivite tespit edildi"
 * }
 */
export const suspendUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { reason = 'Admin tarafından donduruldu' } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı.',
    });
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      isActive: false,
    },
  });

  res.json({
    success: true,
    message: 'Kullanıcı başarıyla donduruldu.',
    data: { user: updatedUser },
  });
};

/**
 * Kullanıcıyı Aktifleştir
 * 
 * Dondurulmuş kullanıcı hesabını tekrar aktif eder.
 * 
 * @route   POST /api/admin/users/:id/activate
 * @access  Private/Admin
 * 
 * @param req.params.id - Kullanıcı ID
 * 
 * @returns 200 - Güncellenmiş kullanıcı
 * @returns 404 - Kullanıcı bulunamadı
 * 
 * @example
 * POST /api/admin/users/123/activate
 */
export const activateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı.',
    });
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      isActive: true,
    },
  });

  res.json({
    success: true,
    message: 'Kullanıcı başarıyla aktifleştirildi.',
    data: { user: updatedUser },
  });
};

/**
 * Kullanıcıyı Kalıcı Olarak Sil
 * 
 * Kullanıcıyı ve ilişkili tüm verileri veritabanından kalıcı olarak siler.
 * 
 * UYARI: Bu işlem GERİ ALINAMAZ!
 * Cascade delete ile tüm ilişkili veriler silinir:
 * - UserCredits
 * - CreditTransactions
 * - VehicleReports
 * - Payments
 * 
 * @route   DELETE /api/admin/users/:id/hard-delete
 * @access  Private/Admin
 * 
 * @param req.params.id - Kullanıcı ID
 * @param req.body.confirm - Onay (true olmalı)
 * 
 * @returns 200 - Silme başarılı
 * @returns 400 - Onay eksik
 * @returns 404 - Kullanıcı bulunamadı
 * 
 * @example
 * DELETE /api/admin/users/123/hard-delete
 * Body: {
 *   "confirm": true
 * }
 */
export const hardDeleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { confirm } = req.body;

  if (!confirm) {
    res.status(400).json({
      success: false,
      message: 'Silme işlemi için onay gereklidir.',
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı.',
    });
    return;
  }

  // Kullanıcıyı ve cascade ile tüm ilişkili verileri sil
  await prisma.user.delete({
    where: { id: parseInt(id) },
  });

  res.json({
    success: true,
    message: 'Kullanıcı kalıcı olarak silindi.',
    data: { deletedUserId: parseInt(id) },
  });
};

// ===== DETAYLI ANALİTİKS =====

/**
 * Detaylı İstatistikleri Getir
 * 
 * Dashboard için kapsamlı istatistikler döndürür.
 * 
 * @route   GET /api/admin/stats/detailed
 * @access  Private/Admin
 * 
 * @returns 200 - Detaylı istatistikler
 * 
 * @example
 * GET /api/admin/stats/detailed
 */
export const getDetailedStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    activeUsers,
    newUsersToday,
    newUsersThisMonth,
    totalReports,
    reportsToday,
    reportsThisMonth,
    completedReports,
    pendingReports,
    failedReports,
    totalRevenue,
    revenueThisMonth,
    totalCreditBalance,
    totalCreditPurchased,
    totalCreditUsed,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: thisMonth } } }),
    prisma.vehicleReport.count(),
    prisma.vehicleReport.count({ where: { createdAt: { gte: today } } }),
    prisma.vehicleReport.count({ where: { createdAt: { gte: thisMonth } } }),
    prisma.vehicleReport.count({ where: { status: 'COMPLETED' } }),
    prisma.vehicleReport.count({ where: { status: 'PENDING' } }),
    prisma.vehicleReport.count({ where: { status: 'FAILED' } }),
    prisma.payment.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { 
        paymentStatus: 'COMPLETED',
        createdAt: { gte: thisMonth }
      },
      _sum: { amount: true },
    }),
    prisma.userCredits.aggregate({
      _sum: { balance: true },
    }),
    prisma.userCredits.aggregate({
      _sum: { totalPurchased: true },
    }),
    prisma.userCredits.aggregate({
      _sum: { totalUsed: true },
    }),
  ]);

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        newToday: newUsersToday,
        newThisMonth: newUsersThisMonth,
      },
      reports: {
        total: totalReports,
        today: reportsToday,
        thisMonth: reportsThisMonth,
        completed: completedReports,
        pending: pendingReports,
        failed: failedReports,
        processing: totalReports - completedReports - pendingReports - failedReports,
      },
      revenue: {
        total: Number(totalRevenue._sum.amount || 0),
        thisMonth: Number(revenueThisMonth._sum.amount || 0),
      },
      credits: {
        totalBalance: Number(totalCreditBalance._sum.balance || 0),
        totalPurchased: Number(totalCreditPurchased._sum.totalPurchased || 0),
        totalUsed: Number(totalCreditUsed._sum.totalUsed || 0),
      },
    },
  });
};

/**
 * Zaman Serisi İstatistiklerini Getir
 * 
 * Son 30 günün trend verilerini döndürür.
 * 
 * @route   GET /api/admin/stats/timeline
 * @access  Private/Admin
 * 
 * @param req.query.days - Gün sayısı (default: 30)
 * 
 * @returns 200 - Timeline verileri
 * 
 * @example
 * GET /api/admin/stats/timeline?days=30
 */
export const getTimelineStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const days = parseInt(req.query.days as string) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Son N günün verilerini getir
  const reports = await prisma.vehicleReport.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
      status: true,
      totalCost: true,
    },
  });

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
    },
  });

  const payments = await prisma.payment.findMany({
    where: {
      createdAt: { gte: startDate },
      paymentStatus: 'COMPLETED',
    },
    select: {
      createdAt: true,
      amount: true,
    },
  });

  // Günlük gruplama
  const timeline: any[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const dayReports = reports.filter(r => 
      r.createdAt >= dayStart && r.createdAt < dayEnd
    );
    const dayUsers = users.filter(u => 
      u.createdAt >= dayStart && u.createdAt < dayEnd
    );
    const dayPayments = payments.filter(p => 
      p.createdAt >= dayStart && p.createdAt < dayEnd
    );

    timeline.push({
      date: dayStart.toISOString().split('T')[0],
      reports: dayReports.length,
      users: dayUsers.length,
      revenue: dayPayments.reduce((sum, p) => sum + Number(p.amount), 0),
    });
  }

  res.json({
    success: true,
    data: { timeline },
  });
};

/**
 * Rapor İstatistikleri
 * 
 * Tüm rapor durumları için detaylı istatistikler döndürür.
 * 
 * İçerik:
 * - Başarılı/Başarısız rapor sayıları
 * - Rapor türüne göre başarı oranları
 * - Toplam iade edilen kredi miktarı
 * - Hata trendleri (son 7 gün, 30 gün)
 * - AI servis başarı oranları
 * 
 * @route   GET /api/admin/report-statistics
 * @access  Private (Admin)
 * 
 * @returns 200 - Rapor istatistikleri
 * @returns 401 - Yetkisiz
 * @returns 500 - Sunucu hatası
 * 
 * @example
 * GET /api/admin/report-statistics
 */
export const getReportStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Rapor durumlarına göre gruplama
  const reportStats = await prisma.vehicleReport.groupBy({
    by: ['status', 'reportType'],
    _count: true,
  });
  
  // Toplam rapor sayıları
  const totalReports = await prisma.vehicleReport.count();
  const completedReports = await prisma.vehicleReport.count({
    where: { status: 'COMPLETED' }
  });
  const failedReports = await prisma.vehicleReport.count({
    where: { status: 'FAILED' }
  });
  const processingReports = await prisma.vehicleReport.count({
    where: { status: 'PROCESSING' }
  });
  
  // Toplam iade edilen kredi miktarı
  const totalRefunded = await prisma.creditTransaction.aggregate({
    where: { transactionType: 'REFUND' },
    _sum: { amount: true }
  });
  
  // Son 7 günlük hata trendi
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentFailedReports = await prisma.vehicleReport.count({
    where: { 
      status: 'FAILED',
      createdAt: { gte: sevenDaysAgo }
    }
  });
  
  // Rapor türüne göre başarı oranları
  const reportTypeStats = await prisma.vehicleReport.groupBy({
    by: ['reportType'],
    _count: {
      _all: true,
      status: true
    },
    where: {
      status: { in: ['COMPLETED', 'FAILED'] }
    }
  });
  
  // Başarı oranlarını hesapla
  const successRates = await Promise.all(reportTypeStats.map(async (stat) => {
    const completed = await prisma.vehicleReport.count({
      where: {
        reportType: stat.reportType,
        status: 'COMPLETED'
      }
    });
    
    const failed = await prisma.vehicleReport.count({
      where: {
        reportType: stat.reportType,
        status: 'FAILED'
      }
    });
    
    const total = completed + failed;
    const successRate = total > 0 ? (completed / total * 100) : 0;
    
    return {
      reportType: stat.reportType,
      total,
      completed,
      failed,
      successRate: Math.round(successRate * 100) / 100
    };
  }));
  
  // Promise.all ile paralel hesaplama
  const successRatesResolved = successRates;
  
  // Genel başarı oranı
  const overallSuccessRate = totalReports > 0 ? 
    Math.round((completedReports / totalReports * 100) * 100) / 100 : 0;
  
  res.json({
    success: true,
    data: {
      overview: {
        totalReports,
        completedReports,
        failedReports,
        processingReports,
        overallSuccessRate,
        totalRefunded: totalRefunded._sum.amount || 0
      },
      reportStats,
      successRates: successRatesResolved,
      recentTrends: {
        failedLast7Days: recentFailedReports,
        failureRateLast7Days: totalReports > 0 ? 
          Math.round((recentFailedReports / totalReports * 100) * 100) / 100 : 0
      }
    }
  });
});

/**
 * Detaylı Rapor İzleme
 * 
 * Tüm rapor işlemlerini (başarılı/başarısız) detaylı olarak izler.
 * 
 * İçerik:
 * - Son 24 saat, 7 gün, 30 günlük raporlar
 * - Rapor türüne göre detaylı analiz
 * - Kullanıcı bazında performans
 * - Hata türleri ve nedenleri
 * - Ortalama işlem süreleri
 * 
 * @route   GET /api/admin/report-monitoring
 * @access  Private (Admin)
 * 
 * @returns 200 - Detaylı rapor izleme verileri
 * @returns 401 - Yetkisiz
 * @returns 500 - Sunucu hatası
 * 
 * @example
 * GET /api/admin/report-monitoring?period=7d&type=DAMAGE_ASSESSMENT
 */
export const getReportMonitoring = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { period = '7d', type, userId } = req.query;
  
  // Zaman aralığını hesapla
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  
  // Base query
  const baseWhere: any = {
    createdAt: { gte: startDate }
  };
  
  if (type) {
    baseWhere.reportType = type;
  }
  
  if (userId) {
    baseWhere.userId = parseInt(userId as string);
  }
  
  // Tüm raporları getir (detaylı bilgilerle)
  const reports = await prisma.vehicleReport.findMany({
    where: baseWhere,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      vehicleImages: {
        select: {
          id: true,
          imageUrl: true,
          uploadDate: true
        }
      },
      vehicleAudios: {
        select: {
          id: true,
          audioPath: true,
          uploadDate: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  // İstatistikleri hesapla
  const totalReports = reports.length;
  const completedReports = reports.filter(r => r.status === 'COMPLETED').length;
  const failedReports = reports.filter(r => r.status === 'FAILED').length;
  const processingReports = reports.filter(r => r.status === 'PROCESSING').length;
  
  // Rapor türüne göre gruplama
  const reportsByType = reports.reduce((acc, report) => {
    const type = report.reportType;
    if (!acc[type]) {
      acc[type] = {
        total: 0,
        completed: 0,
        failed: 0,
        processing: 0,
        reports: []
      };
    }
    acc[type].total++;
    acc[type][report.status.toLowerCase()]++;
    acc[type].reports.push(report);
    return acc;
  }, {} as any);
  
  // Kullanıcı bazında performans
  const userPerformance = reports.reduce((acc, report) => {
    const userId = report.userId;
    if (!acc[userId]) {
      acc[userId] = {
        user: report.user,
        total: 0,
        completed: 0,
        failed: 0,
        processing: 0,
        totalSpent: 0
      };
    }
    acc[userId].total++;
    acc[userId][report.status.toLowerCase()]++;
    acc[userId].totalSpent += Number(report.totalCost || 0);
    return acc;
  }, {} as any);
  
  // Hata analizi (FAILED raporlar için)
  const failedReportsAnalysis = reports
    .filter(r => r.status === 'FAILED')
    .map(report => ({
      id: report.id,
      reportType: report.reportType,
      userId: report.userId,
      user: report.user,
      createdAt: report.createdAt,
      expertNotes: report.expertNotes,
      totalCost: report.totalCost,
      vehiclePlate: report.vehiclePlate
    }));
  
  // Günlük trend (son 7 gün)
  const dailyTrend = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const dayReports = reports.filter(r => 
      r.createdAt >= dayStart && r.createdAt < dayEnd
    );
    
    dailyTrend.push({
      date: dayStart.toISOString().split('T')[0],
      total: dayReports.length,
      completed: dayReports.filter(r => r.status === 'COMPLETED').length,
      failed: dayReports.filter(r => r.status === 'FAILED').length,
      processing: dayReports.filter(r => r.status === 'PROCESSING').length
    });
  }
  
  // Ortalama işlem süreleri (COMPLETED raporlar için)
  const completedReportsWithDuration = reports
    .filter(r => r.status === 'COMPLETED')
    .map(r => ({
      ...r,
      duration: 0 // completedAt alanı yok, şimdilik 0
    }));
  
  const avgProcessingTime = 0; // completedAt alanı yok, şimdilik 0
  
  res.json({
    success: true,
    data: {
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      summary: {
        totalReports,
        completedReports,
        failedReports,
        processingReports,
        successRate: totalReports > 0 ? Math.round((completedReports / totalReports * 100) * 100) / 100 : 0,
        avgProcessingTime
      },
      reportsByType,
      userPerformance: Object.values(userPerformance),
      failedReportsAnalysis,
      dailyTrend,
      recentReports: reports.slice(0, 20) // Son 20 rapor
    }
  });
});

/**
 * Rapor Detayı
 * 
 * Belirli bir raporun detaylı bilgilerini getirir.
 * 
 * @route   GET /api/admin/report-monitoring/:reportId
 * @access  Private (Admin)
 * 
 * @returns 200 - Rapor detayları
 * @returns 401 - Yetkisiz
 * @returns 404 - Rapor bulunamadı
 * @returns 500 - Sunucu hatası
 */
export const getReportDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reportId } = req.params;
  
  const report = await prisma.vehicleReport.findUnique({
    where: { id: parseInt(reportId) },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          createdAt: true
        }
      },
      vehicleImages: true,
      vehicleAudios: true
    }
  });
  
  if (!report) {
    res.status(404).json({
      success: false,
      message: 'Rapor bulunamadı'
    });
    return;
  }
  
  res.json({
    success: true,
    data: report
  });
});

/**
 * Rapor Tip Dağılımını Getir
 * 
 * Rapor tiplerinin istatistiklerini döndürür.
 * 
 * @route   GET /api/admin/stats/reports-breakdown
 * @access  Private/Admin
 * 
 * @returns 200 - Rapor dağılımı
 * 
 * @example
 * GET /api/admin/stats/reports-breakdown
 */
export const getReportsBreakdown = async (req: AuthRequest, res: Response): Promise<void> => {
  const reportsByType = await prisma.vehicleReport.groupBy({
    by: ['reportType'],
    _count: {
      id: true,
    },
    _sum: {
      totalCost: true,
    },
  });

  const breakdown = reportsByType.map(item => ({
    type: item.reportType,
    count: item._count.id,
    totalRevenue: Number(item._sum.totalCost || 0),
  }));

  res.json({
    success: true,
    data: { breakdown },
  });
};