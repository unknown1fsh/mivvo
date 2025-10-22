/**
 * Career Service (Kariyer Servisi)
 * 
 * Frontend için kariyer başvuru API servisleri
 * 
 * Fonksiyonlar:
 * - submitApplication() - Kariyer başvurusu gönderimi
 * - uploadResume() - CV dosyası yükleme
 * - getApplications() - Admin için başvuruları listele
 * - updateApplicationStatus() - Admin için durum güncelleme
 */

import api from '../lib/api';

export interface CareerApplicationData {
  name: string;
  email: string;
  phone: string;
  position: string;
  department?: string;
  experience?: number;
  education?: string;
  coverLetter?: string;
  resumeUrl?: string;
  linkedIn?: string;
  portfolio?: string;
}

export interface CareerApplication {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department?: string;
  experience?: number;
  education?: string;
  coverLetter?: string;
  resumeUrl?: string;
  linkedIn?: string;
  portfolio?: string;
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'REJECTED' | 'ACCEPTED';
  notes?: string;
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CareerApplicationsResponse {
  applications: CareerApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UpdateApplicationStatusData {
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'REJECTED' | 'ACCEPTED';
  notes?: string;
}

export interface ResumeUploadResponse {
  resumeUrl: string;
  filename: string;
  size: number;
}

class CareerService {
  /**
   * Kariyer başvuru formu gönderimi
   */
  async submitApplication(data: CareerApplicationData) {
    try {
      const response = await api.post('/career/submit', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Başvuru gönderilemedi');
    }
  }

  /**
   * CV dosyası yükleme
   */
  async uploadResume(file: File): Promise<ResumeUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await api.post('/career/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'CV yüklenemedi');
    }
  }

  /**
   * Admin - Tüm kariyer başvurularını listele
   */
  async getApplications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    position?: string;
    search?: string;
  }) {
    try {
      const response = await api.get('/career/admin/career-applications', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Başvurular alınamadı');
    }
  }

  /**
   * Admin - Başvuru detayını getir
   */
  async getApplicationById(id: number) {
    try {
      const response = await api.get(`/career/admin/career-applications/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Başvuru detayı alınamadı');
    }
  }

  /**
   * Admin - Başvuru durumunu güncelle
   */
  async updateApplicationStatus(id: number, data: UpdateApplicationStatusData) {
    try {
      const response = await api.put(`/career/admin/career-applications/${id}/status`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Durum güncellenemedi');
    }
  }
}

export const careerService = new CareerService();
