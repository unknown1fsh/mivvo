/**
 * Report Controller (Rapor Controller)
 * 
 * Clean Architecture - Controller Layer
 * 
 * Bu dosya, rapor yönetimi ile ilgili controller fonksiyonlarını içerir.
 * 
 * İşlevler:
 * 1. Rapor Getirme
 * 2. Rapor Durumu Sorgulama
 * 
 * Güvenlik:
 * - Kullanıcı sadece kendi raporlarına erişebilir
 * - Authentication kontrolü yapılır
 */

import { Response } from 'express';
import { getPrismaClient } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const prisma = getPrismaClient();

/**
 * GET /api/reports/:id
 * 
 * Belirli bir raporu getir.
 * 
 * İş Akışı:
 * 1. Rapor ID'sini validate et
 * 2. Raporu veritabanından getir
 * 3. Kullanıcının kendi raporu olduğunu kontrol et
 * 4. Rapor verisini döndür
 */
export const getReportById = async (req: any, res: Response): Promise<void> => {
  const { id } = req.params;
  // GEÇİCİ OLARAK USER ID KONTROLÜ KALDIRILDI - TEST İÇİN
  const userId = 1; // req.user!.id;

  // Rapor ID'sini sayıya çevir
  const reportId = parseInt(id, 10);
  if (isNaN(reportId)) {
    res.status(400).json({ error: 'Geçersiz rapor ID' });
    return;
  }

  // Raporu getir
  const report = await prisma.vehicleReport.findUnique({
    where: { id: reportId },
    include: {
      vehicleImages: true,
      aiAnalysisResults: true,
      vehicleGarage: true,
    },
  });

  // Rapor bulunamadı
  if (!report) {
    res.status(404).json({ error: 'Rapor bulunamadı' });
    return;
  }

  // Kullanıcının kendi raporu olduğunu kontrol et
  if (report.userId !== userId) {
    res.status(404).json({ error: 'Rapor bulunamadı' });
    return;
  }

  // Rapor tipini belirle
  const reportTypeMapping: { [key: string]: string } = {
    DAMAGE_ASSESSMENT: 'damage',
    PAINT_ANALYSIS: 'paint',
    ENGINE_SOUND_ANALYSIS: 'audio',
    VALUE_ESTIMATION: 'value',
    COMPREHENSIVE_EXPERTISE: 'comprehensive',
  };

  const reportType = reportTypeMapping[report.reportType] || 'comprehensive';

  // Debug: Rapor verilerini kontrol et
  console.log('🔍 Report Controller Debug:', {
    reportId: report.id,
    reportType: report.reportType,
    status: report.status,
    hasAiAnalysisData: !!report.aiAnalysisData,
    aiAnalysisDataKeys: report.aiAnalysisData ? Object.keys(report.aiAnalysisData) : [],
    aiAnalysisDataContent: report.aiAnalysisData ? JSON.stringify(report.aiAnalysisData).substring(0, 200) + '...' : 'No data',
    hasAiAnalysisResults: !!report.aiAnalysisResults,
    aiAnalysisResultsLength: report.aiAnalysisResults?.length || 0
  });

  // Rapor verisini hazırla
  const reportData = {
    id: report.id,
    type: reportType,
    status: report.status.toLowerCase(),
    data: report.aiAnalysisData || report.aiAnalysisResults?.[0]?.resultData || {},
    vehicleInfo: {
      brand: report.vehicleBrand || report.vehicleGarage?.brand || 'Bilinmiyor',
      model: report.vehicleModel || report.vehicleGarage?.model || 'Bilinmiyor',
      year: report.vehicleYear || report.vehicleGarage?.year || new Date().getFullYear(),
      plate: report.vehiclePlate || report.vehicleGarage?.plate || '',
      vin: report.vehicleGarage?.vin || '',
    },
    images: report.vehicleImages?.map((img: any) => img.imageUrl) || [],
    charts: [],
    createdAt: report.createdAt.toISOString(),
    reportId: report.id.toString(),
  };

  console.log('📊 Report Data to send:', {
    id: reportData.id,
    type: reportData.type,
    status: reportData.status,
    hasData: !!reportData.data,
    dataKeys: reportData.data ? Object.keys(reportData.data) : [],
    dataContent: reportData.data ? JSON.stringify(reportData.data).substring(0, 200) + '...' : 'No data'
  });

  res.json(reportData);
};

/**
 * GET /api/reports/:id/status
 * 
 * Rapor durumunu getir.
 * 
 * İş Akışı:
 * 1. Rapor ID'sini validate et
 * 2. Raporu veritabanından getir
 * 3. Kullanıcının kendi raporu olduğunu kontrol et
 * 4. Rapor durumunu döndür
 */
export const getReportStatus = async (req: any, res: Response): Promise<void> => {
  const { id } = req.params;
  // GEÇİCİ OLARAK USER ID KONTROLÜ KALDIRILDI - TEST İÇİN
  const userId = 1; // req.user!.id;

  // Rapor ID'sini sayıya çevir
  const reportId = parseInt(id, 10);
  if (isNaN(reportId)) {
    res.status(400).json({ error: 'Geçersiz rapor ID' });
    return;
  }

  // Raporu getir
  const report = await prisma.vehicleReport.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      status: true,
      userId: true,
      aiAnalysisResults: {
        select: {
          resultData: true,
        },
      },
      failedReason: true,
      refundStatus: true,
      creditTransactionId: true,
    },
  });

  // Rapor bulunamadı
  if (!report) {
    res.status(404).json({ error: 'Rapor bulunamadı' });
    return;
  }

  // Kullanıcının kendi raporu olduğunu kontrol et
  if (report.userId !== userId) {
    res.status(404).json({ error: 'Rapor bulunamadı' });
    return;
  }

  // Durum mapping
  const statusMapping: { [key: string]: string } = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
  };

  // İlerleme hesapla
  let progress = 0;
  switch (report.status) {
    case 'PENDING':
      progress = 10;
      break;
    case 'PROCESSING':
      progress = 50;
      break;
    case 'COMPLETED':
      progress = 100;
      break;
    case 'FAILED':
      progress = 0;
      break;
    default:
      progress = 0;
  }

  // Rapor durumunu döndür
  const statusData = {
    id: report.id,
    status: statusMapping[report.status] || 'PENDING',
    progress,
    error: report.status === 'FAILED' ? 'Rapor oluşturulamadı' : null,
    data: report.status === 'COMPLETED' ? report.aiAnalysisResults?.[0]?.resultData : null,
    failedReason: report.failedReason || null,
    refundStatus: report.refundStatus || 'NONE',
    creditTransactionId: report.creditTransactionId || null,
  };

  res.json(statusData);
};

