/**
 * Contact Routes (İletişim Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, iletişim formu ile ilgili route'ları tanımlar.
 * 
 * Route Kategorileri:
 * 1. Public Routes:
 *    - POST /submit (İletişim formu gönder)
 * 
 * 2. Admin Routes:
 *    - GET /admin/contact-inquiries (Tüm başvuruları listele)
 *    - GET /admin/contact-inquiries/:id (Başvuru detayı)
 *    - PUT /admin/contact-inquiries/:id/status (Durum güncelle)
 * 
 * Özellikler:
 * - Rate limiting (spam koruması)
 * - Input validation
 * - Error handling
 * 
 * Güvenlik:
 * - Public routes için rate limiting
 * - Admin routes için authentication + authorization
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { createRateLimit } from '../utils/rateLimit';
import {
  createContactInquiry,
  getContactInquiries,
  updateInquiryStatus,
  getInquiryById
} from '../controllers/contactController';

const router = Router();

// ===== PUBLIC ROUTES (GENEL ERİŞİM) =====

/**
 * POST /api/contact/submit
 * 
 * İletişim formu gönderimi.
 * 
 * Rate Limiting: 5 request per minute per IP
 * 
 * Body:
 * - name: string (required)
 * - email: string (required)
 * - phone: string (optional)
 * - company: string (optional)
 * - subject: string (required)
 * - message: string (required)
 * - inquiryType: string (required)
 * 
 * Response:
 * - 201: Başarılı gönderim
 * - 400: Geçersiz veri
 * - 429: Rate limit aşıldı
 * - 500: Sunucu hatası
 */
router.post('/submit', 
  createRateLimit(5, 60 * 1000), // 5 request per minute
  asyncHandler(createContactInquiry)
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
 * GET /api/contact/admin/contact-inquiries
 * 
 * Tüm iletişim başvurularını listele.
 * 
 * Query:
 * - page?: number (default: 1)
 * - limit?: number (default: 10)
 * - status?: string (PENDING, IN_PROGRESS, RESOLVED, CLOSED)
 * - type?: string (GENERAL, TECHNICAL, SALES, PARTNERSHIP, MEDIA, CAREER)
 * - search?: string (name, email, subject arama)
 * 
 * Response:
 * - inquiries: Başvuru listesi
 * - pagination: Sayfalama bilgisi
 */
router.get('/admin/contact-inquiries', asyncHandler(getContactInquiries));

/**
 * GET /api/contact/admin/contact-inquiries/:id
 * 
 * Belirli bir başvurunun detaylarını getir.
 * 
 * Params:
 * - id: Başvuru ID
 * 
 * Response:
 * - Başvuru detayları
 */
router.get('/admin/contact-inquiries/:id', asyncHandler(getInquiryById));

/**
 * PUT /api/contact/admin/contact-inquiries/:id/status
 * 
 * Başvuru durumunu güncelle.
 * 
 * Params:
 * - id: Başvuru ID
 * 
 * Body:
 * - status: string (PENDING, IN_PROGRESS, RESOLVED, CLOSED)
 * - notes?: string (admin notları)
 * 
 * Response:
 * - Güncellenmiş başvuru bilgileri
 */
router.put('/admin/contact-inquiries/:id/status', asyncHandler(updateInquiryStatus));

export default router;
