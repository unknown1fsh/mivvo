/**
 * Contact Service (İletişim Servisi)
 * 
 * Frontend için iletişim formu API servisleri
 * 
 * Fonksiyonlar:
 * - submitContactInquiry() - İletişim formu gönderimi
 * - getInquiries() - Admin için başvuruları listele
 * - updateInquiryStatus() - Admin için durum güncelleme
 */

import api from '../lib/api';

export interface ContactInquiryData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  inquiryType: 'GENERAL' | 'TECHNICAL' | 'SALES' | 'PARTNERSHIP' | 'MEDIA' | 'CAREER';
}

export interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  inquiryType: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  notes?: string;
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInquiriesResponse {
  inquiries: ContactInquiry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UpdateInquiryStatusData {
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  notes?: string;
}

class ContactService {
  /**
   * İletişim formu gönderimi
   */
  async submitContactInquiry(data: ContactInquiryData) {
    try {
      const response = await api.post('/contact/submit', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Mesaj gönderilemedi');
    }
  }

  /**
   * Admin - Tüm iletişim başvurularını listele
   */
  async getInquiries(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
  }) {
    try {
      const response = await api.get('/contact/admin/contact-inquiries', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Başvurular alınamadı');
    }
  }

  /**
   * Admin - Başvuru detayını getir
   */
  async getInquiryById(id: number) {
    try {
      const response = await api.get(`/contact/admin/contact-inquiries/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Başvuru detayı alınamadı');
    }
  }

  /**
   * Admin - Başvuru durumunu güncelle
   */
  async updateInquiryStatus(id: number, data: UpdateInquiryStatusData) {
    try {
      const response = await api.put(`/contact/admin/contact-inquiries/${id}/status`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Durum güncellenemedi');
    }
  }
}

export const contactService = new ContactService();
