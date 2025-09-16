import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, search, role } = req.query;

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

// @desc    Get user by ID (Admin only)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
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

// @desc    Update user (Admin only)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
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

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
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

  // Soft delete - deactivate user instead of hard delete
  await prisma.user.update({
    where: { id: parseInt(id) },
    data: { isActive: false },
  });

  res.json({
    success: true,
    message: 'Kullanıcı başarıyla deaktive edildi.',
  });
};

// @desc    Get all reports (Admin only)
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getAllReports = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, status, reportType } = req.query;

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

// @desc    Get report by ID (Admin only)
// @route   GET /api/admin/reports/:id
// @access  Private/Admin
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

// @desc    Update report status (Admin only)
// @route   PUT /api/admin/reports/:id/status
// @access  Private/Admin
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

// @desc    Get system statistics (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getSystemStats = async (req: AuthRequest, res: Response): Promise<void> => {
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

// @desc    Get service pricing (Admin only)
// @route   GET /api/admin/pricing
// @access  Private/Admin
export const getServicePricing = async (req: AuthRequest, res: Response): Promise<void> => {
  const pricing = await prisma.servicePricing.findMany({
    orderBy: { serviceType: 'asc' },
  });

  res.json({
    success: true,
    data: { pricing },
  });
};

// @desc    Update service pricing (Admin only)
// @route   PUT /api/admin/pricing
// @access  Private/Admin
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

// @desc    Get system settings (Admin only)
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSystemSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const settings = await prisma.systemSetting.findMany({
    orderBy: { settingKey: 'asc' },
  });

  res.json({
    success: true,
    data: { settings },
  });
};

// @desc    Update system settings (Admin only)
// @route   PUT /api/admin/settings
// @access  Private/Admin
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
