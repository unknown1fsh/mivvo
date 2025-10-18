/**
 * Notification Routes (Bildirim Route'ları)
 * 
 * Clean Architecture - Route Layer (API Route Katmanı)
 * 
 * Bildirim yönetimi için API endpoint'leri.
 * 
 * Route'lar:
 * - GET /api/user/notifications - Bildirim listesi
 * - GET /api/user/notifications/:id - Tek bildirim
 * - PUT /api/user/notifications/:id/read - Okundu işaretle
 * - PUT /api/user/notifications/read-all - Tümünü okundu işaretle
 * - DELETE /api/user/notifications/:id - Bildirim sil
 * - GET /api/user/notifications/unread-count - Okunmamış sayısı
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notificationController';

const router = Router();

// Tüm route'lar authentication gerektirir
router.use(authenticate);

// Bildirim listesi (pagination ile)
router.get('/', getNotifications);

// Okunmamış bildirim sayısı
router.get('/unread-count', getUnreadCount);

// Tüm bildirimleri okundu işaretle
router.put('/read-all', markAllNotificationsAsRead);

// Tek bildirim getir
router.get('/:id', getNotificationById);

// Bildirim okundu işaretle
router.put('/:id/read', markNotificationAsRead);

// Bildirim sil
router.delete('/:id', deleteNotification);

export default router;
