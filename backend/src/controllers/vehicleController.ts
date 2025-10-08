/**
 * Vehicle Controller (Araç Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, araç raporu CRUD işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Rapor oluşturma (kredi kontrolü + fiyatlandırma)
 * - Rapor listeleme (pagination + filtreleme)
 * - Rapor detayı görüntüleme
 * - Rapor görseli yükleme
 * - Analiz sonuçlarını getirme
 * - Rapor indirme (PDF)
 * 
 * İş Akışı:
 * 1. Rapor oluşturma → Kredi kontrolü → Kredi düşme
 * 2. Görsel yükleme → Rapor durumu güncelleme
 * 3. AI analizi → Sonuçları kaydetme
 * 4. Rapor görüntüleme/indirme
 * 
 * Özellikler:
 * - Otomatik kredi yönetimi
 * - Sahiplik kontrolü (userId match)
 * - Transaction kaydı
 * - Pagination desteği
 * 
 * TODO:
 * - PDF rapor oluşturma (downloadReport)
 * - Görsel yükleme için Multer entegrasyonu
 * - Rapor silme endpoint'i
 * 
 * Endpoints:
 * - POST /api/vehicle/reports (Rapor oluştur)
 * - GET /api/vehicle/reports (Raporları listele)
 * - GET /api/vehicle/reports/:id (Rapor detayı)
 * - POST /api/vehicle/reports/:id/images (Görsel yükle)
 * - GET /api/vehicle/reports/:id/analysis (Analiz sonuçları)
 * - GET /api/vehicle/reports/:id/download (Rapor indir)
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// ===== CONTROLLER METHODS =====

/**
 * Araç Raporu Oluştur
 * 
 * Yeni bir araç raporu oluşturur ve kredi işlemlerini yönetir.
 * 
 * İşlem Akışı:
 * 1. Servis fiyatlandırmasını getir
 * 2. Kullanıcı kredi kontrolü
 * 3. Rapor kaydı oluştur
 * 4. Kredi düş (balance ve totalUsed güncelle)
 * 5. CreditTransaction kaydı oluştur
 * 
 * Kredi Yönetimi:
 * - Yetersiz kredi durumunda hata döner
 * - Kredi düşme işlemi atomik yapılmalı (transaction)
 * - Audit trail için CreditTransaction kaydı
 * 
 * @route   POST /api/vehicle/reports
 * @access  Private
 * 
 * @param req.body.reportType - Rapor türü (DAMAGE_ASSESSMENT, VALUE_ESTIMATION, vb.)
 * @param req.body.vehiclePlate - Araç plakası
 * @param req.body.vehicleBrand - Araç markası
 * @param req.body.vehicleModel - Araç modeli
 * @param req.body.vehicleYear - Araç yılı
 * @param req.body.vehicleColor - Araç rengi
 * @param req.body.mileage - Km
 * 
 * @returns 201 - Oluşturulan rapor
 * @returns 400 - Geçersiz rapor türü veya yetersiz kredi
 * 
 * @example
 * POST /api/vehicle/reports
 * Body: {
 *   "reportType": "DAMAGE_ASSESSMENT",
 *   "vehiclePlate": "34ABC123",
 *   "vehicleBrand": "Toyota",
 *   "vehicleModel": "Corolla",
 *   "vehicleYear": 2020,
 *   "vehicleColor": "Beyaz",
 *   "mileage": 50000
 * }
 */
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

  // Servis fiyatlandırmasını getir
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

  // Kullanıcı kredi kontrolü
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

  // Rapor oluştur
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

  // Kredi düş
  await prisma.userCredits.update({
    where: { userId: req.user!.id },
    data: {
      balance: userCredits.balance.sub(servicePricing.basePrice),
      totalUsed: userCredits.totalUsed.add(servicePricing.basePrice),
    },
  });

  // CreditTransaction kaydı (audit trail)
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

/**
 * Araç Raporlarını Listele
 * 
 * Kullanıcının tüm raporlarını paginated olarak listeler.
 * 
 * Özellikler:
 * - Pagination (page, limit)
 * - Filtreleme (status)
 * - Görseller ve analiz sonuçları dahil
 * - Sahiplik kontrolü (userId)
 * 
 * @route   GET /api/vehicle/reports
 * @access  Private
 * 
 * @param req.query.page - Sayfa numarası (default: 1)
 * @param req.query.limit - Sayfa boyutu (default: 10)
 * @param req.query.status - Durum filtresi (PENDING, PROCESSING, COMPLETED, FAILED)
 * 
 * @returns 200 - Rapor listesi ve pagination bilgisi
 * 
 * @example
 * GET /api/vehicle/reports?page=1&limit=10&status=COMPLETED
 */
export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, status } = req.query;

  // Where clause (sadece kullanıcının raporları)
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

/**
 * Tek Bir Rapor Detayını Getir
 * 
 * Belirli bir raporun detaylı bilgilerini döndürür.
 * 
 * İçerik:
 * - Rapor bilgileri
 * - Araç görselleri
 * - AI analiz sonuçları
 * 
 * Güvenlik:
 * - Sahiplik kontrolü (userId match)
 * - Başka kullanıcının raporuna erişim engellenir
 * 
 * @route   GET /api/vehicle/reports/:id
 * @access  Private
 * 
 * @param req.params.id - Rapor ID
 * 
 * @returns 200 - Rapor detayları
 * @returns 404 - Rapor bulunamadı
 * 
 * @example
 * GET /api/vehicle/reports/123
 */
export const getReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const report = await prisma.vehicleReport.findFirst({
    where: {
      id: parseInt(id),
      userId: req.user!.id, // Sahiplik kontrolü
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

/**
 * Rapor İçin Görsel Yükle
 * 
 * Rapora ait görselleri yükler ve kaydeder.
 * 
 * İşlem Akışı:
 * 1. Rapor sahiplik kontrolü
 * 2. Her görsel için VehicleImage kaydı oluştur
 * 3. Görsel kayıtlarını döndür
 * 
 * TODO: Multer ile file upload entegrasyonu
 * Şu anda: Body'den image URL'leri alınıyor
 * Gelecekte: Multipart/form-data ile file upload
 * 
 * Görsel Tipleri:
 * - EXTERIOR: Dış görünüm
 * - INTERIOR: İç görünüm
 * - DAMAGE: Hasar bölgesi
 * - ENGINE: Motor bölmesi
 * - WHEELS: Lastik/jant
 * 
 * @route   POST /api/vehicle/reports/:id/images
 * @access  Private
 * 
 * @param req.params.id - Rapor ID
 * @param req.body.images - Görsel URL'leri dizisi
 * 
 * @returns 200 - Yüklenen görseller
 * @returns 404 - Rapor bulunamadı
 * 
 * @example
 * POST /api/vehicle/reports/123/images
 * Body: {
 *   "images": [
 *     "https://example.com/image1.jpg",
 *     "https://example.com/image2.jpg"
 *   ]
 * }
 */
export const uploadImages = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { images } = req.body; // Array of image URLs

  // Rapor sahiplik kontrolü
  const report = await prisma.vehicleReport.findFirst({
    where: {
      id: parseInt(id),
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

  // Görsel kayıtları oluştur
  const imageRecords = await Promise.all(
    images.map((imageUrl: string, index: number) =>
      prisma.vehicleImage.create({
        data: {
          reportId: parseInt(id),
          imageUrl,
          imageType: 'EXTERIOR', // Default type, geliştirilebilir
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

/**
 * Analiz Sonuçlarını Getir
 * 
 * Rapora ait tüm AI analiz sonuçlarını listeler.
 * 
 * Sonuç Tipleri:
 * - DAMAGE_DETECTION: Hasar tespiti
 * - PAINT_ANALYSIS: Boya analizi
 * - VALUE_ESTIMATION: Değer tahmini
 * - ENGINE_SOUND: Motor sesi analizi
 * - COMPREHENSIVE: Tam ekspertiz
 * 
 * @route   GET /api/vehicle/reports/:id/analysis
 * @access  Private
 * 
 * @param req.params.id - Rapor ID
 * 
 * @returns 200 - Analiz sonuçları
 * @returns 404 - Rapor bulunamadı
 * 
 * @example
 * GET /api/vehicle/reports/123/analysis
 */
export const getAnalysisResults = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  // Rapor sahiplik kontrolü
  const report = await prisma.vehicleReport.findFirst({
    where: {
      id: parseInt(id),
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

  // Analiz sonuçlarını getir
  const analysisResults = await prisma.aiAnalysisResult.findMany({
    where: { reportId: parseInt(id) },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: { analysisResults },
  });
};

/**
 * Rapor İndir (PDF)
 * 
 * Raporu PDF formatında indirir.
 * 
 * TODO: PDF Rapor Oluşturma
 * 
 * Kütüphane Seçenekleri:
 * - pdfkit: Low-level PDF oluşturma
 * - puppeteer: HTML'den PDF
 * - jsPDF: Client-side PDF
 * 
 * PDF İçeriği:
 * - Araç bilgileri
 * - Görseller
 * - Analiz sonuçları
 * - Grafikler ve tablolar
 * - Marka/logo
 * 
 * Şu anda: JSON data döndürüyor (placeholder)
 * 
 * @route   GET /api/vehicle/reports/:id/download
 * @access  Private
 * 
 * @param req.params.id - Rapor ID
 * 
 * @returns 200 - PDF dosyası (gelecekte)
 * @returns 404 - Rapor bulunamadı
 * 
 * @example
 * GET /api/vehicle/reports/123/download
 */
export const downloadReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const report = await prisma.vehicleReport.findFirst({
    where: {
      id: parseInt(id),
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

  // TODO: PDF rapor oluşturma
  // - pdfkit veya puppeteer kullanılabilir
  // - Template-based PDF generation
  // - Grafik ve tablo desteği
  
  // Şu anda JSON döndürüyor
  res.json({
    success: true,
    data: { report },
    message: 'PDF rapor oluşturma özelliği yakında eklenecek.',
  });
};
