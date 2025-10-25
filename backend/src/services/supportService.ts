/**
 * Destek Servisi (Support Service)
 * 
 * Ticket yönetimi ve mesajlaşma iş mantığını içerir
 */

import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../utils/prisma';

const prisma = getPrismaClient();

export interface CreateTicketRequest {
  userId: number;
  subject: string;
  description: string;
  category: string;
  priority: string;
  reportId?: number;
  attachments?: string;
}

export interface TicketFilter {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: number;
  page?: number;
  limit?: number;
}

/**
 * Yeni Ticket Oluştur
 */
export async function createTicket(data: CreateTicketRequest) {
  const ticket = await prisma.supportTicket.create({
    data: {
      userId: data.userId,
      subject: data.subject,
      description: data.description,
      category: data.category as any,
      priority: data.priority as any,
      reportId: data.reportId || null,
      attachments: data.attachments || null,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      messages: true,
    },
  });

  console.log(`✅ Yeni destek ticket'ı oluşturuldu: #${ticket.id}`);
  return ticket;
}

/**
 * Kullanıcının Ticket'larını Listele
 */
export async function getUserTickets(userId: number) {
  const tickets = await prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 1, // Son mesajı göster
      },
    },
  });

  return tickets;
}

/**
 * Ticket Detayını Getir
 */
export async function getTicketById(ticketId: number, userId: number, isAdmin: boolean = false) {
  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: ticketId,
      ...(isAdmin ? {} : { userId }), // Admin tüm ticket'ları görebilir
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket) {
    throw new Error('Ticket bulunamadı');
  }

  return ticket;
}

/**
 * Ticket'a Mesaj Ekle
 */
export async function addMessageToTicket(
  ticketId: number,
  senderId: number,
  message: string,
  isAdmin: boolean = false,
  attachments?: string
) {
  // 1. Ticket'ı bul
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new Error('Ticket bulunamadı');
  }

  // 2. Yetki kontrolü (sadece sahibi veya admin mesaj ekleyebilir)
  if (!isAdmin && ticket.userId !== senderId) {
    throw new Error('Bu ticket\'a mesaj ekleme yetkiniz yok');
  }

  // 3. Mesaj ekle
  const ticketMessage = await prisma.ticketMessage.create({
    data: {
      ticketId,
      senderId,
      message,
      isAdmin,
      attachments: attachments || null,
    },
  });

  // 4. Admin mesaj eklediyse ticket'ı IN_PROGRESS yap
  if (isAdmin && ticket.status === 'OPEN') {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'IN_PROGRESS' },
    });
  }

  console.log(`✅ Ticket #${ticketId} mesajına eklenen mesaj: ${message.substring(0, 50)}...`);
  return ticketMessage;
}

/**
 * Tüm Ticket'ları Listele (Admin)
 */
export async function getAllTickets(filter: TicketFilter = {}) {
  const {
    status,
    priority,
    category,
    assignedTo,
    page = 1,
    limit = 20,
  } = filter;

  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (category) where.category = category;
  if (assignedTo) where.assignedTo = assignedTo;

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return {
    tickets,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Ticket Durumunu Güncelle
 */
export async function updateTicketStatus(ticketId: number, status: string) {
  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: status as any },
  });

  console.log(`✅ Ticket #${ticketId} durumu güncellendi: ${status}`);
  return ticket;
}

/**
 * Ticket'a Ata (Admin)
 */
export async function assignTicket(ticketId: number, assignedTo: number) {
  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { assignedTo },
  });

  console.log(`✅ Ticket #${ticketId} atandı: ${assignedTo}`);
  return ticket;
}

/**
 * Ticket Önceliğini Güncelle
 */
export async function updateTicketPriority(ticketId: number, priority: string) {
  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { priority: priority as any },
  });

  console.log(`✅ Ticket #${ticketId} önceliği güncellendi: ${priority}`);
  return ticket;
}

/**
 * Ticket'ı Kapat
 */
export async function closeTicket(ticketId: number, userId: number) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new Error('Ticket bulunamadı');
  }

  // Sadece sahibi veya admin kapatabilir
  if (ticket.userId !== userId) {
    throw new Error('Bu ticket\'ı kapatma yetkiniz yok');
  }

  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: 'CLOSED' },
  });

  console.log(`✅ Ticket #${ticketId} kapatıldı`);
  return updatedTicket;
}

/**
 * Ticket İstatistikleri
 */
export async function getTicketStats() {
  const [total, open, inProgress, resolved, closed] = await Promise.all([
    prisma.supportTicket.count(),
    prisma.supportTicket.count({ where: { status: 'OPEN' } }),
    prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
    prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
  ]);

  return {
    total,
    open,
    inProgress,
    resolved,
    closed,
  };
}

