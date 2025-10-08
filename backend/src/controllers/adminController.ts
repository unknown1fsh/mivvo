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
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

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

  const total = await prisma.user.count({ where });

  res.json({
    success: true,
    data: {
      users,
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
    include: {
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
