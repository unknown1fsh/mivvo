/**
 * Damage Analysis Controller
 * Clean Architecture - Controller Layer
 * THIN Controller - Delegates all logic to Service layer
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { damageAnalysisService } from '../services/damageAnalysisService';
import { ResponseHelper } from '../utils/ResponseHelper';
import multer from 'multer';

// Multer konfigürasyonu - memory storage
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir'));
    }
  }
});

export class DamageAnalysisController {
  /**
   * POST /api/damage-analysis/start
   * Hasar analizi başlat
   */
  static startAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const requestData = req.body;

    // ✅ Service'e delege et - TÜM LOGIC SERVICE'TE
    const result = await damageAnalysisService.startAnalysis(userId, requestData);

    // ✅ Standard response
    ResponseHelper.created(res, result, result.message);
  });

  /**
   * POST /api/damage-analysis/:reportId/upload
   * Hasar analizi resim yükleme
   */
  static uploadImages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const reportId = parseInt(req.params.reportId);
    const files = req.files as Express.Multer.File[];

    // ✅ Service'e delege et
    const result = await damageAnalysisService.uploadImages(userId, reportId, files);

    // ✅ Standard response
    ResponseHelper.success(res, result, result.message);
  });

  /**
   * POST /api/damage-analysis/:reportId/analyze
   * AI hasar analizi gerçekleştir
   */
  static performAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const reportId = parseInt(req.params.reportId);

    // ✅ Service'e delege et - TÜM AI LOGIC SERVICE'TE
    const result = await damageAnalysisService.performAnalysis(userId, reportId);

    // ✅ Standard response
    ResponseHelper.success(res, result, 'Hasar analizi tamamlandı');
  });

  /**
   * GET /api/damage-analysis/:reportId
   * Hasar analizi raporu getir
   */
  static getReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const reportId = parseInt(req.params.reportId);

    // ✅ Service'e delege et
    const result = await damageAnalysisService.getReport(userId, reportId);

    // ✅ Standard response
    ResponseHelper.success(res, result);
  });

  /**
   * GET /api/damage-analysis/:reportId/pdf
   * Hasar analizi raporunu PDF formatında indir
   */
  static downloadPDF = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const reportId = parseInt(req.params.reportId);

    try {
      const { generatePDFReport } = require('../services/pdfReportService');
      const pdfBuffer = await generatePDFReport({
        reportId,
        userId,
        includeImages: true,
        includeCharts: true,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="mivvo-hasar-analizi-${reportId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('PDF oluşturma hatası:', error);
      ResponseHelper.error(res, error.message || 'PDF rapor oluşturulamadı', 500);
    }
  });
}

// Multer upload instance'ını export et
export { upload };
