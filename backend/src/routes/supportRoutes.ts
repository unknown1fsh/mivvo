/**
 * Destek Routes (Support Routes)
 * 
 * Ticket ve mesajlaşma endpoint'lerini tanımlar
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as supportController from '../controllers/supportController';

const router = Router();

// Kullanıcı endpoint'leri
router.post('/tickets', authenticate, supportController.createTicket);
router.get('/tickets', authenticate, supportController.getUserTickets);
router.get('/tickets/:id', authenticate, supportController.getTicket);
router.post('/tickets/:id/messages', authenticate, supportController.addMessage);
router.patch('/tickets/:id/close', authenticate, supportController.closeTicket);

// Admin endpoint'leri
router.get('/admin/tickets', authenticate, authorize('ADMIN'), supportController.getAllTickets);
router.patch('/admin/tickets/:id/status', authenticate, authorize('ADMIN'), supportController.updateTicketStatus);
router.patch('/admin/tickets/:id/priority', authenticate, authorize('ADMIN'), supportController.updateTicketPriority);
router.patch('/admin/tickets/:id/assign', authenticate, authorize('ADMIN'), supportController.assignTicket);
router.get('/admin/stats', authenticate, authorize('ADMIN'), supportController.getTicketStats);

export default router;

