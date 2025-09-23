import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// @desc    Create vehicle report
// @route   POST /api/vehicle/reports
// @access  Private
export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    reportType,
    vehiclePlate,
    vehicleBrand,
    vehicleModel,
    vehicleYear,
    vehicleColor,
    mileage,
  } = req.body;

  // Get service pricing
  const servicePricing = await prisma.servicePricing.findFirst({
    where: {
      serviceType: reportType,
      isActive: true,
    },
  });

  if (!servicePricing) {
    res.status(400).json({
      success: false,
      message: 'Geçersiz rapor türü.',
    });
    return;
  }

  // Check user credits
  const userCredits = await prisma.userCredits.findUnique({
    where: { userId: req.user!.id },
  });

  if (!userCredits || userCredits.balance < servicePricing.basePrice) {
    res.status(400).json({
      success: false,
      message: 'Yetersiz kredi bakiyesi.',
    });
    return;
  }

  // Create report
  const report = await prisma.vehicleReport.create({
    data: {
      userId: req.user!.id,
      reportType,
      vehiclePlate,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      mileage,
      totalCost: servicePricing.basePrice,
      status: 'PENDING',
    },
  });

  // Deduct credits
  await prisma.userCredits.update({
    where: { userId: req.user!.id },
    data: {
      balance: userCredits.balance.sub(servicePricing.basePrice),
      totalUsed: userCredits.totalUsed.add(servicePricing.basePrice),
    },
  });

  // Create credit transaction
  await prisma.creditTransaction.create({
    data: {
      userId: req.user!.id,
      transactionType: 'USAGE',
      amount: servicePricing.basePrice,
      description: `${servicePricing.serviceName} raporu`,
      referenceId: `report_${report.id}`,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Rapor başarıyla oluşturuldu.',
    data: { report },
  });
};

// @desc    Get vehicle reports
// @route   GET /api/vehicle/reports
// @access  Private
export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, status } = req.query;

  const where: any = { userId: req.user!.id };
  if (status) {
    where.status = status;
  }

  const reports = await prisma.vehicleReport.findMany({
    where,
    include: {
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

// @desc    Get single vehicle report
// @route   GET /api/vehicle/reports/:id
// @access  Private
export const getReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const report = await prisma.vehicleReport.findFirst({
    where: {
      id: id,
      userId: req.user!.id,
    },
    include: {
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

// @desc    Upload images for report
// @route   POST /api/vehicle/reports/:id/images
// @access  Private
export const uploadImages = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { images } = req.body; // Array of image URLs

  // Verify report exists and belongs to user
  const report = await prisma.vehicleReport.findFirst({
    where: {
      id: id,
      userId: req.user!.id,
    },
  });

  if (!report) {
    res.status(404).json({
      success: false,
      message: 'Rapor bulunamadı.',
    });
    return;
  }

  // Create image records
  const imageRecords = await Promise.all(
    images.map((imageUrl: string, index: number) =>
      prisma.vehicleImage.create({
        data: {
          reportId: id,
          imageUrl,
          imageType: 'EXTERIOR', // Default type, can be enhanced
          uploadDate: new Date(),
        },
      })
    )
  );

  res.json({
    success: true,
    message: 'Resimler başarıyla yüklendi.',
    data: { images: imageRecords },
  });
};

// @desc    Get analysis results
// @route   GET /api/vehicle/reports/:id/analysis
// @access  Private
export const getAnalysisResults = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const report = await prisma.vehicleReport.findFirst({
    where: {
      id: id,
      userId: req.user!.id,
    },
  });

  if (!report) {
    res.status(404).json({
      success: false,
      message: 'Rapor bulunamadı.',
    });
    return;
  }

  const analysisResults = await prisma.aiAnalysisResult.findMany({
    where: { reportId: id },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: { analysisResults },
  });
};

// @desc    Download report
// @route   GET /api/vehicle/reports/:id/download
// @access  Private
export const downloadReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const report = await prisma.vehicleReport.findFirst({
    where: {
      id: id,
      userId: req.user!.id,
    },
    include: {
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

  // TODO: Generate PDF report
  // For now, return JSON data
  res.json({
    success: true,
    data: { report },
    message: 'PDF rapor oluşturma özelliği yakında eklenecek.',
  });
};
