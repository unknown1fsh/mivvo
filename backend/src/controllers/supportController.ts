/**
 * Destek Controller (Support Controller)
 * 
 * Ticket ve mesajlaşma endpoint'lerini yönetir
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as supportService from '../services/supportService';
import multer from 'multer';
import { uploadFile } from '../services/storageService';

// Multer konfigürasyonu - memory storage (ekran görüntüleri için)
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit (ekran görüntüleri için yeterli)
  fileFilter: (req, file, cb) => {
    // Sadece resim dosyaları kabul et
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir (JPG, PNG, WebP)'));
    }
  }
});

/**
 * Yeni Ticket Oluştur
 * 
 * @route   POST /api/support/tickets
 * @access  Private
 */
export const createTicket = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, description, category, priority, reportId } = req.body;
    const files = req.files as Express.Multer.File[];
    
    if (!subject || !description) {
      res.status(400).json({
        success: false,
        message: 'Konu ve açıklama zorunludur',
      });
      return;
    }

    // Ekran görüntülerini yükle (varsa)
    let attachmentUrls: string[] = [];
    if (files && files.length > 0) {
      attachmentUrls = await Promise.all(
        files.map(async (file) => {
          const uploadResult = await uploadFile({
            file: file.buffer,
            fileName: file.originalname,
            folder: 'support-attachments',
            contentType: file.mimetype,
            optimizeImage: true,
          });
          return uploadResult.url;
        })
      );
    }

    const ticket = await supportService.createTicket({
      userId: req.user!.id,
      subject,
      description,
      category: category || 'GENERAL',
      priority: priority || 'NORMAL',
      reportId: reportId ? parseInt(reportId) : undefined,
      attachments: attachmentUrls.length > 0 ? JSON.stringify(attachmentUrls) : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Destek talebiniz oluşturuldu',
      data: { ticket },
    });
  } catch (error: any) {
    console.error('❌ Ticket oluşturma hatası:', error);
    throw error; // asyncHandler zaten handle edecek
  }
});

/**
 * Kullanıcının Ticket'larını Listele
 * 
 * @route   GET /api/support/tickets
 * @access  Private
 */
export const getUserTickets = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const tickets = await supportService.getUserTickets(req.user!.id);

  res.json({
    success: true,
    data: { tickets },
  });
});

/**
 * Ticket Detayını Getir
 * 
 * @route   GET /api/support/tickets/:id
 * @access  Private
 */
export const getTicket = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const ticketId = parseInt(req.params.id);
  const isAdmin = req.user!.role === 'ADMIN';

  const ticket = await supportService.getTicketById(ticketId, req.user!.id, isAdmin);

  res.json({
    success: true,
    data: { ticket },
  });
});

/**
 * Ticket'a Mesaj Ekle
 * 
 * @route   POST /api/support/tickets/:id/messages
 * @access  Private
 */
export const addMessage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const ticketId = parseInt(req.params.id);
  const { message } = req.body;
  const files = req.files as Express.Multer.File[];
  
  if (!message) {
    res.status(400).json({
      success: false,
      message: 'Mesaj içeriği zorunludur',
    });
    return;
  }

  // Ekran görüntülerini yükle (varsa)
  let attachmentUrls: string[] = [];
  if (files && files.length > 0) {
    attachmentUrls = await Promise.all(
      files.map(async (file) => {
        const uploadResult = await uploadFile({
          file: file.buffer,
          fileName: file.originalname,
          folder: 'support-attachments',
          contentType: file.mimetype,
          optimizeImage: true,
        });
        return uploadResult.url;
      })
    );
  }

  const isAdmin = req.user!.role === 'ADMIN';
  const ticketMessage = await supportService.addMessageToTicket(
    ticketId,
    req.user!.id,
    message,
    isAdmin,
    attachmentUrls.length > 0 ? JSON.stringify(attachmentUrls) : undefined
  );

  res.json({
    success: true,
    message: 'Mesaj eklendi',
    data: { message: ticketMessage },
  });
});

/**
 * Ticket'ı Kapat
 * 
 * @route   PATCH /api/support/tickets/:id/close
 * @access  Private
 */
export const closeTicket = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const ticketId = parseInt(req.params.id);

  const ticket = await supportService.closeTicket(ticketId, req.user!.id);

  res.json({
    success: true,
    message: 'Ticket kapatıldı',
    data: { ticket },
  });
});

/**
 * Admin: Tüm Ticket'ları Listele
 * 
 * @route   GET /api/admin/support/tickets
 * @access  Admin
 */
export const getAllTickets = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const filter = {
    status: req.query.status as string,
    priority: req.query.priority as string,
    category: req.query.category as string,
    assignedTo: req.query.assignedTo ? parseInt(req.query.assignedTo as string) : undefined,
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
  };

  const result = await supportService.getAllTickets(filter);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Admin: Ticket Durumunu Güncelle
 * 
 * @route   PATCH /api/admin/support/tickets/:id/status
 * @access  Admin
 */
export const updateTicketStatus = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const ticketId = parseInt(req.params.id);
  const { status } = req.body;

  if (!status) {
    res.status(400).json({
      success: false,
      message: 'Durum gerekli',
    });
    return;
  }

  const ticket = await supportService.updateTicketStatus(ticketId, status);

  res.json({
    success: true,
    message: 'Ticket durumu güncellendi',
    data: { ticket },
  });
});

/**
 * Admin: Ticket Önceliğini Güncelle
 * 
 * @route   PATCH /api/admin/support/tickets/:id/priority
 * @access  Admin
 */
export const updateTicketPriority = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const ticketId = parseInt(req.params.id);
  const { priority } = req.body;

  if (!priority) {
    res.status(400).json({
      success: false,
      message: 'Öncelik gerekli',
    });
    return;
  }

  const ticket = await supportService.updateTicketPriority(ticketId, priority);

  res.json({
    success: true,
    message: 'Ticket önceliği güncellendi',
    data: { ticket },
  });
});

/**
 * Admin: Ticket'a Ata
 * 
 * @route   PATCH /api/admin/support/tickets/:id/assign
 * @access  Admin
 */
export const assignTicket = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const ticketId = parseInt(req.params.id);
  const { assignedTo } = req.body;

  if (!assignedTo) {
    res.status(400).json({
      success: false,
      message: 'Atama ID gerekli',
    });
    return;
  }

  const ticket = await supportService.assignTicket(ticketId, assignedTo);

  res.json({
    success: true,
    message: 'Ticket atandı',
    data: { ticket },
  });
});

/**
 * Admin: Ticket İstatistikleri
 * 
 * @route   GET /api/admin/support/stats
 * @access  Admin
 */
export const getTicketStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const stats = await supportService.getTicketStats();

  res.json({
    success: true,
    data: { stats },
  });
});

