/**
 * Career Controller (Kariyer Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, kariyer başvuru işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Kariyer başvuru formu gönderimi
 * - CV upload desteği
 * - Admin için başvuru listeleme
 * - Başvuru durumu güncelleme
 * - Email bildirimi gönderimi
 * 
 * Endpoints:
 * - POST /api/career/submit - Kariyer başvurusu gönder
 * - POST /api/career/upload-resume - CV yükle
 * - GET /api/admin/career-applications - Admin için başvuruları listele
 * - PUT /api/admin/career-applications/:id/status - Başvuru durumu güncelle
 */

import { Request, Response } from 'express';
import { getPrismaClient } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = getPrismaClient();

// Multer konfigürasyonu - CV upload için
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece PDF, DOC ve DOCX dosyaları kabul edilir'));
    }
  }
});

export const uploadResume = upload.single('resume');

/**
 * Kariyer Başvuru Formu Gönderimi
 * 
 * @route   POST /api/career/submit
 * @access  Public
 * 
 * @param req.body.name - Ad soyad
 * @param req.body.email - Email adresi
 * @param req.body.phone - Telefon numarası
 * @param req.body.position - Pozisyon
 * @param req.body.department - Departman (opsiyonel)
 * @param req.body.experience - Deneyim yılı (opsiyonel)
 * @param req.body.education - Eğitim bilgisi (opsiyonel)
 * @param req.body.coverLetter - Ön yazı (opsiyonel)
 * @param req.body.resumeUrl - CV URL (opsiyonel)
 * @param req.body.linkedIn - LinkedIn URL (opsiyonel)
 * @param req.body.portfolio - Portfolio URL (opsiyonel)
 * 
 * @returns 201 - Başarılı gönderim
 * @returns 400 - Geçersiz veri
 * @returns 500 - Sunucu hatası
 */
export const createCareerApplication = async (req: Request, res: Response): Promise<void> => {
  const { 
    name, 
    email, 
    phone, 
    position, 
    department, 
    experience, 
    education, 
    coverLetter, 
    resumeUrl, 
    linkedIn, 
    portfolio 
  } = req.body;

  // Validasyon
  if (!name || !email || !phone || !position) {
    res.status(400).json({
      success: false,
      error: 'Ad, email, telefon ve pozisyon alanları zorunludur'
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

  // Telefon format kontrolü
  const phoneRegex = /^[0-9+\-\s()]+$/;
  if (!phoneRegex.test(phone)) {
    res.status(400).json({
      success: false,
      error: 'Geçersiz telefon formatı'
    });
    return;
  }

  try {
    // Kariyer başvurusunu kaydet
    const application = await prisma.careerApplication.create({
      data: {
        name,
        email,
        phone,
        position,
        department: department || null,
        experience: experience ? Number(experience) : null,
        education: education || null,
        coverLetter: coverLetter || null,
        resumeUrl: resumeUrl || null,
        linkedIn: linkedIn || null,
        portfolio: portfolio || null,
        status: 'PENDING'
      }
    });

    // TODO: Email bildirimi gönder
    // await sendCareerApplicationEmail(application);

    res.status(201).json({
      success: true,
      message: 'Başvurunuz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      data: {
        id: application.id,
        status: application.status
      }
    });

  } catch (error) {
    console.error('Career application creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Başvuru gönderilemedi. Lütfen tekrar deneyin.'
    });
  }
};

/**
 * CV Upload İşlemi
 * 
 * @route   POST /api/career/upload-resume
 * @access  Public
 * 
 * @param req.file - CV dosyası
 * 
 * @returns 200 - Başarılı upload
 * @returns 400 - Geçersiz dosya
 * @returns 500 - Upload hatası
 */
export const handleResumeUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'CV dosyası yüklenmedi'
      });
      return;
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    res.json({
      success: true,
      message: 'CV başarıyla yüklendi',
      data: {
        resumeUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      error: 'CV yüklenemedi'
    });
  }
};

/**
 * Admin - Tüm Kariyer Başvurularını Listele
 * 
 * @route   GET /api/admin/career-applications
 * @access  Private/Admin
 * 
 * @param req.query.page - Sayfa numarası (default: 1)
 * @param req.query.limit - Sayfa boyutu (default: 10)
 * @param req.query.status - Durum filtresi
 * @param req.query.position - Pozisyon filtresi
 * @param req.query.search - Arama terimi
 * 
 * @returns 200 - Başvuru listesi ve pagination bilgisi
 */
export const getCareerApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, status, position, search } = req.query;

  // Where clause oluşturma
  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (position) {
    where.position = { contains: position as string };
  }
  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { email: { contains: search as string } },
      { position: { contains: search as string } }
    ];
  }

  try {
    // Toplam sayı
    const total = await prisma.careerApplication.count({ where });

    // Başvuruları getir
    const applications = await prisma.careerApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get career applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Başvurular alınamadı'
    });
  }
};

/**
 * Admin - Kariyer Başvuru Durumunu Güncelle
 * 
 * @route   PUT /api/admin/career-applications/:id/status
 * @access  Private/Admin
 * 
 * @param req.params.id - Başvuru ID
 * @param req.body.status - Yeni durum
 * @param req.body.notes - Admin notları (opsiyonel)
 * 
 * @returns 200 - Başarılı güncelleme
 * @returns 404 - Başvuru bulunamadı
 */
export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const application = await prisma.careerApplication.update({
      where: { id: Number(id) },
      data: {
        status: status as any,
        notes: notes || null,
        assignedTo: req.user?.id || null
      }
    });

    // TODO: Durum değişikliği email bildirimi gönder
    // await sendApplicationStatusUpdateEmail(application);

    res.json({
      success: true,
      message: 'Başvuru durumu güncellendi',
      data: application
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      error: 'Durum güncellenemedi'
    });
  }
};

/**
 * Admin - Kariyer Başvuru Detayını Getir
 * 
 * @route   GET /api/admin/career-applications/:id
 * @access  Private/Admin
 * 
 * @param req.params.id - Başvuru ID
 * 
 * @returns 200 - Başvuru detayı
 * @returns 404 - Başvuru bulunamadı
 */
export const getApplicationById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const application = await prisma.careerApplication.findUnique({
      where: { id: Number(id) }
    });

    if (!application) {
      res.status(404).json({
        success: false,
        error: 'Başvuru bulunamadı'
      });
      return;
    }

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Get application by id error:', error);
    res.status(500).json({
      success: false,
      error: 'Başvuru detayı alınamadı'
    });
  }
};
