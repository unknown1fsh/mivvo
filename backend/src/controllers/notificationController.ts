/**
 * Notification Controller (Bildirim Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, kullanıcı bildirimlerini yönetir.
 * 
 * Sorumluluklar:
 * - Bildirim listesi getirme (pagination ile)
 * - Bildirim detayı getirme
 * - Bildirim okundu işaretleme
 * - Tüm bildirimleri okundu işaretleme
 * - Bildirim silme
 * - Okunmamış bildirim sayısı
 * 
 * Güvenlik:
 * - Sadece kendi bildirimlerine erişim
 * - JWT token ile authentication
 * - Input validation
 * 
 * Endpoints:
 * - GET /api/user/notifications (Private)
 * - GET /api/user/notifications/:id (Private)
 * - PUT /api/user/notifications/:id/read (Private)
 * - PUT /api/user/notifications/read-all (Private)
 * - DELETE /api/user/notifications/:id (Private)
 * - GET /api/user/notifications/unread-count (Private)
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * Bildirim Listesi Getir
 * 
 * Kullanıcının bildirimlerini pagination ile getirir.
 * 
 * Query Parameters:
 * - page: Sayfa numarası (default: 1)
 * - limit: Sayfa başına kayıt (default: 20, max: 100)
 * - unreadOnly: Sadece okunmamış bildirimler (true/false)
 * - type: Bildirim türü (SUCCESS, INFO, WARNING, ERROR)
 * 
 * @route   GET /api/user/notifications
 * @access  Private
 * 
 * @returns 200 - Bildirim listesi ve pagination bilgileri
 * 
 * @example
 * GET /api/user/notifications?page=1&limit=10&unreadOnly=true
 */
export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const unreadOnly = req.query.unreadOnly === 'true';
  const type = req.query.type as string;

  const skip = (page - 1) * limit;

  // Where conditions
  const where: any = { userId };
  
  if (unreadOnly) {
    where.isRead = false;
  }
  
  if (type && ['SUCCESS', 'INFO', 'WARNING', 'ERROR'].includes(type)) {
    where.type = type;
  }

  // Get notifications with pagination
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        actionUrl: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      unreadCount,
    },
  });
});

/**
 * Tek Bildirim Getir
 * 
 * Belirli bir bildirimin detaylarını getirir.
 * 
 * @route   GET /api/user/notifications/:id
 * @access  Private
 * 
 * @param req.params.id - Bildirim ID
 * 
 * @returns 200 - Bildirim detayı
 * @returns 404 - Bildirim bulunamadı
 * 
 * @example
 * GET /api/user/notifications/123
 */
export const getNotificationById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const notification = await prisma.notification.findFirst({
    where: {
      id: parseInt(id),
      userId, // Sahiplik kontrolü
    },
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Bildirim bulunamadı',
    });
  }

  return res.json({
    success: true,
    data: notification,
  });
});

/**
 * Bildirim Okundu İşaretle
 * 
 * Belirli bir bildirimi okundu olarak işaretler.
 * 
 * @route   PUT /api/user/notifications/:id/read
 * @access  Private
 * 
 * @param req.params.id - Bildirim ID
 * 
 * @returns 200 - Bildirim okundu işaretlendi
 * @returns 404 - Bildirim bulunamadı
 * 
 * @example
 * PUT /api/user/notifications/123/read
 */
export const markNotificationAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const notification = await prisma.notification.findFirst({
    where: {
      id: parseInt(id),
      userId, // Sahiplik kontrolü
    },
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Bildirim bulunamadı',
    });
  }

  // Zaten okunmuşsa güncelleme yapma
  if (notification.isRead) {
    return res.json({
      success: true,
      message: 'Bildirim zaten okunmuş',
      data: notification,
    });
  }

  const updatedNotification = await prisma.notification.update({
    where: { id: parseInt(id) },
    data: { isRead: true },
  });

  return res.json({
    success: true,
    message: 'Bildirim okundu işaretlendi',
    data: updatedNotification,
  });
});

/**
 * Tüm Bildirimleri Okundu İşaretle
 * 
 * Kullanıcının tüm okunmamış bildirimlerini okundu olarak işaretler.
 * 
 * @route   PUT /api/user/notifications/read-all
 * @access  Private
 * 
 * @returns 200 - Tüm bildirimler okundu işaretlendi
 * 
 * @example
 * PUT /api/user/notifications/read-all
 */
export const markAllNotificationsAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return res.json({
    success: true,
    message: `${result.count} bildirim okundu işaretlendi`,
    data: {
      updatedCount: result.count,
    },
  });
});

/**
 * Bildirim Sil
 * 
 * Belirli bir bildirimi siler.
 * 
 * @route   DELETE /api/user/notifications/:id
 * @access  Private
 * 
 * @param req.params.id - Bildirim ID
 * 
 * @returns 200 - Bildirim silindi
 * @returns 404 - Bildirim bulunamadı
 * 
 * @example
 * DELETE /api/user/notifications/123
 */
export const deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const notification = await prisma.notification.findFirst({
    where: {
      id: parseInt(id),
      userId, // Sahiplik kontrolü
    },
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Bildirim bulunamadı',
    });
  }

  await prisma.notification.delete({
    where: { id: parseInt(id) },
  });

  return res.json({
    success: true,
    message: 'Bildirim silindi',
  });
});

/**
 * Okunmamış Bildirim Sayısı
 * 
 * Kullanıcının okunmamış bildirim sayısını getirir.
 * 
 * @route   GET /api/user/notifications/unread-count
 * @access  Private
 * 
 * @returns 200 - Okunmamış bildirim sayısı
 * 
 * @example
 * GET /api/user/notifications/unread-count
 */
export const getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return res.json({
    success: true,
    data: {
      unreadCount,
    },
  });
});

/**
 * Bildirim Oluştur (Internal)
 * 
 * Sistem tarafından bildirim oluşturmak için kullanılır.
 * Bu fonksiyon genellikle diğer controller'lardan çağrılır.
 * 
 * @param userId - Kullanıcı ID
 * @param title - Bildirim başlığı
 * @param message - Bildirim mesajı
 * @param type - Bildirim türü
 * @param actionUrl - İşlem URL'i (opsiyonel)
 * 
 * @returns Oluşturulan bildirim
 */
export const createNotification = async (
  userId: number,
  title: string,
  message: string,
  type: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR' = 'INFO',
  actionUrl?: string
) => {
  return await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      actionUrl,
    },
  });
};
