/**
 * Career Routes (Kariyer Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, kariyer başvuru ile ilgili route'ları tanımlar.
 * 
 * Route Kategorileri:
 * 1. Public Routes:
 *    - POST /submit (Kariyer başvurusu gönder)
 *    - POST /upload-resume (CV yükle)
 * 
 * 2. Admin Routes:
 *    - GET /admin/career-applications (Tüm başvuruları listele)
 *    - GET /admin/career-applications/:id (Başvuru detayı)
 *    - PUT /admin/career-applications/:id/status (Durum güncelle)
 * 
 * Özellikler:
 * - File upload (CV)
 * - Rate limiting (spam koruması)
 * - Input validation
 * - Error handling
 * 
 * Güvenlik:
 * - Public routes için rate limiting
 * - Admin routes için authentication + authorization
 * - File upload güvenliği
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { createRateLimit } from '../utils/rateLimit';
import {
  createCareerApplication,
  handleResumeUpload,
  getCareerApplications,
  updateApplicationStatus,
  getApplicationById,
  uploadResume
} from '../controllers/careerController';

const router = Router();

// ===== PUBLIC ROUTES (GENEL ERİŞİM) =====

/**
 * POST /api/career/submit
 * 
 * Kariyer başvuru formu gönderimi.
 * 
 * Rate Limiting: 3 request per minute per IP
 * 
 * Body:
 * - name: string (required)
 * - email: string (required)
 * - phone: string (required)
 * - position: string (required)
 * - department: string (optional)
 * - experience: number (optional)
 * - education: string (optional)
 * - coverLetter: string (optional)
 * - resumeUrl: string (optional)
 * - linkedIn: string (optional)
 * - portfolio: string (optional)
 * 
 * Response:
 * - 201: Başarılı gönderim
 * - 400: Geçersiz veri
 * - 429: Rate limit aşıldı
 * - 500: Sunucu hatası
 */
router.post('/submit', 
  createRateLimit(3, 60 * 1000), // 3 request per minute
  asyncHandler(createCareerApplication)
);

/**
 * POST /api/career/upload-resume
 * 
 * CV dosyası yükleme.
 * 
 * Rate Limiting: 2 request per minute per IP
 * 
 * Body:
 * - resume: file (PDF, DOC, DOCX, max 5MB)
 * 
 * Response:
 * - 200: Başarılı upload
 * - 400: Geçersiz dosya
 * - 429: Rate limit aşıldı
 * - 500: Upload hatası
 */
router.post('/upload-resume', 
  createRateLimit(2, 60 * 1000), // 2 request per minute
  uploadResume,
  asyncHandler(handleResumeUpload)
);

// ===== ADMIN ROUTES (YÖNETİCİ ERİŞİMİ) =====

/**
 * Authentication Middleware
 * 
 * JWT token kontrolü yapar.
 */
router.use('/admin', authenticate);

/**
 * Authorization Middleware (ADMIN)
 * 
 * Kullanıcının ADMIN rolüne sahip olduğunu kontrol eder.
 */
router.use('/admin', authorize('ADMIN'));

/**
 * GET /api/career/admin/career-applications
 * 
 * Tüm kariyer başvurularını listele.
 * 
 * Query:
 * - page?: number (default: 1)
 * - limit?: number (default: 10)
 * - status?: string (PENDING, REVIEWING, INTERVIEW, REJECTED, ACCEPTED)
 * - position?: string (pozisyon filtresi)
 * - search?: string (name, email, position arama)
 * 
 * Response:
 * - applications: Başvuru listesi
 * - pagination: Sayfalama bilgisi
 */
router.get('/admin/career-applications', asyncHandler(getCareerApplications));

/**
 * GET /api/career/admin/career-applications/:id
 * 
 * Belirli bir başvurunun detaylarını getir.
 * 
 * Params:
 * - id: Başvuru ID
 * 
 * Response:
 * - Başvuru detayları
 */
router.get('/admin/career-applications/:id', asyncHandler(getApplicationById));

/**
 * PUT /api/career/admin/career-applications/:id/status
 * 
 * Başvuru durumunu güncelle.
 * 
 * Params:
 * - id: Başvuru ID
 * 
 * Body:
 * - status: string (PENDING, REVIEWING, INTERVIEW, REJECTED, ACCEPTED)
 * - notes?: string (admin notları)
 * 
 * Response:
 * - Güncellenmiş başvuru bilgileri
 */
router.put('/admin/career-applications/:id/status', asyncHandler(updateApplicationStatus));

export default router;
