/**
 * Contact Controller (İletişim Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, iletişim formu işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - İletişim formu gönderimi
 * - Admin için başvuru listeleme
 * - Başvuru durumu güncelleme
 * - Email bildirimi gönderimi
 * 
 * Endpoints:
 * - POST /api/contact/submit - İletişim formu gönder
 * - GET /api/admin/contact-inquiries - Admin için başvuruları listele
 * - PUT /api/admin/contact-inquiries/:id/status - Başvuru durumu güncelle
 */

import { Request, Response } from 'express';
import { getPrismaClient } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = getPrismaClient();

/**
 * İletişim Formu Gönderimi
 * 
 * @route   POST /api/contact/submit
 * @access  Public
 * 
 * @param req.body.name - Ad soyad
 * @param req.body.email - Email adresi
 * @param req.body.phone - Telefon numarası (opsiyonel)
 * @param req.body.company - Şirket adı (opsiyonel)
 * @param req.body.subject - Konu
 * @param req.body.message - Mesaj
 * @param req.body.inquiryType - İletişim türü
 * 
 * @returns 201 - Başarılı gönderim
 * @returns 400 - Geçersiz veri
 * @returns 500 - Sunucu hatası
 */
export const createContactInquiry = async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, company, subject, message, inquiryType } = req.body;

  // Validasyon
  if (!name || !email || !subject || !message || !inquiryType) {
    res.status(400).json({
      success: false,
      error: 'Gerekli alanlar eksik'
    });
    return;
  }

  // Email format kontrolü
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      error: 'Geçersiz email formatı'
    });
    return;
  }

  try {
    // İletişim başvurusunu kaydet
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        subject,
        message,
        inquiryType: inquiryType as any,
        status: 'PENDING'
      }
    });

    // Email bildirimi gönder
    try {
      const { addEmailJob } = require('../jobs/emailJob');
      await addEmailJob({
        type: 'custom',
        to: process.env.ADMIN_EMAIL || 'admin@mivvo.com',
        subject: `Yeni İletişim Formu: ${inquiry.subject}`,
        html: `
          <h2>Yeni İletişim Formu</h2>
          <p><strong>Ad:</strong> ${inquiry.name}</p>
          <p><strong>Email:</strong> ${inquiry.email}</p>
          <p><strong>Telefon:</strong> ${inquiry.phone || 'Belirtilmemiş'}</p>
          <p><strong>Konu:</strong> ${inquiry.subject}</p>
          <p><strong>Mesaj:</strong></p>
          <p>${inquiry.message}</p>
        `,
      });
    } catch (emailError) {
      console.warn('Email gönderme hatası:', emailError);
    }
    // await sendContactNotificationEmail(inquiry);

    res.status(201).json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      data: {
        id: inquiry.id,
        status: inquiry.status
      }
    });

  } catch (error) {
    console.error('Contact inquiry creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.'
    });
  }
};

/**
 * Admin - Tüm İletişim Başvurularını Listele
 * 
 * @route   GET /api/admin/contact-inquiries
 * @access  Private/Admin
 * 
 * @param req.query.page - Sayfa numarası (default: 1)
 * @param req.query.limit - Sayfa boyutu (default: 10)
 * @param req.query.status - Durum filtresi
 * @param req.query.type - Tip filtresi
 * @param req.query.search - Arama terimi
 * 
 * @returns 200 - Başvuru listesi ve pagination bilgisi
 */
export const getContactInquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, status, type, search } = req.query;

  // Where clause oluşturma
  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (type) {
    where.inquiryType = type;
  }
  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { email: { contains: search as string } },
      { subject: { contains: search as string } }
    ];
  }

  try {
    // Toplam sayı
    const total = await prisma.contactInquiry.count({ where });

    // Başvuruları getir
    const inquiries = await prisma.contactInquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    res.json({
      success: true,
      data: {
        inquiries,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get contact inquiries error:', error);
    res.status(500).json({
      success: false,
      error: 'Başvurular alınamadı'
    });
  }
};

/**
 * Admin - İletişim Başvuru Durumunu Güncelle
 * 
 * @route   PUT /api/admin/contact-inquiries/:id/status
 * @access  Private/Admin
 * 
 * @param req.params.id - Başvuru ID
 * @param req.body.status - Yeni durum
 * @param req.body.notes - Admin notları (opsiyonel)
 * 
 * @returns 200 - Başarılı güncelleme
 * @returns 404 - Başvuru bulunamadı
 */
export const updateInquiryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    res.status(400).json({
      success: false,
      error: 'Durum belirtilmelidir'
    });
    return;
  }

  try {
    // Başvuruyu güncelle
    const inquiry = await prisma.contactInquiry.update({
      where: { id: Number(id) },
      data: {
        status: status as any,
        notes: notes || null,
        assignedTo: req.user?.id || null
      }
    });

    // TODO: Durum değişikliği email bildirimi gönder
    // await sendStatusUpdateEmail(inquiry);

    res.json({
      success: true,
      message: 'Başvuru durumu güncellendi',
      data: inquiry
    });

  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({
      success: false,
      error: 'Durum güncellenemedi'
    });
  }
};

/**
 * Admin - İletişim Başvuru Detayını Getir
 * 
 * @route   GET /api/admin/contact-inquiries/:id
 * @access  Private/Admin
 * 
 * @param req.params.id - Başvuru ID
 * 
 * @returns 200 - Başvuru detayı
 * @returns 404 - Başvuru bulunamadı
 */
export const getInquiryById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id: Number(id) }
    });

    if (!inquiry) {
      res.status(404).json({
        success: false,
        error: 'Başvuru bulunamadı'
      });
      return;
    }

    res.json({
      success: true,
      data: inquiry
    });

  } catch (error) {
    console.error('Get inquiry by id error:', error);
    res.status(500).json({
      success: false,
      error: 'Başvuru detayı alınamadı'
    });
  }
};
