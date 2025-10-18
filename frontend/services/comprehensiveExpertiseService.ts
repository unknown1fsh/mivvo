/**
 * Comprehensive Expertise Service (Tam Ekspertiz Servisi)
 * 
 * Clean Architecture - Service Layer (Servis Katmanı)
 * 
 * Bu servis, kapsamlı araç ekspertizi işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Tam ekspertiz raporu oluşturma
 * - Rapor getirme ve listeleme
 * - Rapor silme
 * - PDF indirme
 * - Genel skor hesaplama
 * - UI helper metotları
 * 
 * Tam Ekspertiz İçeriği:
 * - Boya analizi
 * - Hasar tespiti
 * - Motor sesi analizi
 * - Değer tahmini
 * - Genel durum değerlendirmesi
 * - Yatırım kararı önerisi
 * 
 * Kullanım:
 * ```typescript
 * import { comprehensiveExpertiseService } from './comprehensiveExpertiseService'
 * 
 * const report = await comprehensiveExpertiseService.create({
 *   vehicleInfo: { ... },
 *   includeTests: { paintAnalysis: true, damageDetection: true },
 *   images: [file1, file2],
 *   audioFile: audioFile
 * })
 * ```
 */

import { apiClient } from './apiClient';

// ===== INTERFACES =====

/**
 * Comprehensive Expertise Request
 * 
 * Tam ekspertiz için request interface'i.
 */
export interface ComprehensiveExpertiseRequest {
  vehicleGarageId?: number;
  vehicleInfo: {
    brand: string;
    model: string;
    year: number;
    plate?: string;
    vin?: string;
    mileage: number;
    fuelType?: string;
    transmission?: string;
  };
  includeTests: {
    paintAnalysis: boolean;
    damageDetection: boolean;
    engineSound: boolean;
    valueEstimation: boolean;
  };
  images?: File[];
  audioFile?: File;
}

/**
 * Comprehensive Expertise Response
 * 
 * Tam ekspertiz sonucu.
 */
export interface ComprehensiveExpertiseResponse {
  id: number;
  reportId: number;
  vehicleInfo: {
    brand: string;
    model: string;
    year: number;
    plate?: string;
    vin?: string;
    mileage: number;
  };
  paintAnalysis?: any;
  damageAnalysis?: any;
  engineSound?: any;
  valueEstimation?: any;
  overallScore: number;
  overallCondition: string;
  recommendations: string[];
  createdAt: string;
}

// ===== COMPREHENSIVE EXPERTISE SERVICE CLASS =====

/**
 * Comprehensive Expertise Service Class
 * 
 * Tam ekspertiz işlemlerini yöneten servis.
 */
class ComprehensiveExpertiseService {
  private readonly endpoint = '/comprehensive-expertise';

  // ===== REPORT CRUD =====

  /**
   * Create (Tam Ekspertiz Oluştur)
   * 
   * Yeni tam ekspertiz raporu oluşturur.
   * 
   * İşlem Akışı:
   * 1. FormData oluştur
   * 2. Araç bilgilerini ekle
   * 3. Test seçimlerini ekle
   * 4. Görselleri ekle
   * 5. Ses dosyasını ekle (varsa)
   * 6. Backend'e gönder
   * 7. AI analizlerini çalıştır
   * 8. Sonuçları birleştir ve döndür
   * 
   * @param request - Ekspertiz bilgileri
   * 
   * @returns ComprehensiveExpertiseResponse
   * 
   * @throws Error - Ekspertiz oluşturulamazsa
   */
  async create(request: ComprehensiveExpertiseRequest): Promise<ComprehensiveExpertiseResponse> {
    const formData = new FormData();
    
    formData.append('vehicleInfo', JSON.stringify(request.vehicleInfo));
    formData.append('includeTests', JSON.stringify(request.includeTests));

    if (request.vehicleGarageId) {
      formData.append('vehicleGarageId', request.vehicleGarageId.toString());
    }

    if (request.images) {
      request.images.forEach((image, index) => {
        formData.append(`images`, image);
      });
    }

    if (request.audioFile) {
      formData.append('audioFile', request.audioFile);
    }

    const response = await apiClient.post<ComprehensiveExpertiseResponse>(
      `${this.endpoint}/create`,
      formData
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Ekspertiz raporu oluşturulamadı');
    }

    return response.data;
  }

  /**
   * Get By ID (ID'ye Göre Getir)
   * 
   * Belirli bir raporu getirir.
   * 
   * @param id - Rapor ID
   * 
   * @returns ComprehensiveExpertiseResponse
   * 
   * @throws Error - Rapor bulunamazsa
   */
  async getById(id: number): Promise<ComprehensiveExpertiseResponse> {
    const response = await apiClient.get<ComprehensiveExpertiseResponse>(
      `${this.endpoint}/${id}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Rapor bulunamadı');
    }

    return response.data;
  }

  /**
   * Get All (Tümünü Getir)
   * 
   * Kullanıcının tüm ekspertiz raporlarını getirir.
   * 
   * @param page - Sayfa numarası
   * @param limit - Sayfa boyutu
   * 
   * @returns Rapor listesi
   * 
   * @throws Error - Raporlar yüklenemezse
   */
  async getAll(page: number = 1, limit: number = 10): Promise<{
    reports: ComprehensiveExpertiseResponse[];
    total: number;
    pages: number;
  }> {
    const response = await apiClient.get<any>(
      `${this.endpoint}?page=${page}&limit=${limit}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Raporlar yüklenemedi');
    }

    return response.data;
  }

  /**
   * Delete (Rapor Sil)
   * 
   * Belirli bir raporu siler.
   * 
   * @param id - Rapor ID
   * 
   * @throws Error - Silme başarısız olursa
   */
  async delete(id: number): Promise<void> {
    const response = await apiClient.delete(`${this.endpoint}/${id}`);

    if (!response.success) {
      throw new Error(response.error || 'Silme işlemi başarısız');
    }
  }

  /**
   * Download PDF (PDF İndir)
   * 
   * Raporu PDF formatında indirir.
   * 
   * TODO: Backend'de PDF generation eklenmeli
   * 
   * @param id - Rapor ID
   * 
   * @returns Blob (PDF dosyası)
   * 
   * @throws Error - PDF indirilemezse
   */
  async downloadPDF(id: number): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}${this.endpoint}/${id}/pdf`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('PDF indirilemedi');
    }

    return await response.blob();
  }

  // ===== UTILITY METHODS =====

  /**
   * Calculate Overall Score (Genel Skor Hesapla)
   * 
   * Tüm testlerin skorlarını birleştirerek genel skor hesaplar.
   * 
   * Hesaplama:
   * - Her test 0-100 arası skor verir
   * - Ortalama alınır
   * - Değer tahmini için normalize edilir (75)
   * 
   * @param report - Ekspertiz raporu
   * 
   * @returns Genel skor (0-100)
   */
  calculateOverallScore(report: ComprehensiveExpertiseResponse): number {
    let totalScore = 0;
    let testCount = 0;

    if (report.paintAnalysis) {
      totalScore += report.paintAnalysis.overallScore || 0;
      testCount++;
    }

    if (report.damageAnalysis) {
      totalScore += report.damageAnalysis.overallScore || 0;
      testCount++;
    }

    if (report.engineSound) {
      totalScore += report.engineSound.overallScore || 0;
      testCount++;
    }

    if (report.valueEstimation) {
      totalScore += 75; // Normalize value estimation
      testCount++;
    }

    return testCount > 0 ? Math.round(totalScore / testCount) : 0;
  }

  /**
   * Get Condition Label (Durum Etiketi)
   * 
   * Skora göre durum etiketi döndürür.
   * 
   * @param score - Genel skor
   * 
   * @returns Durum etiketi (Türkçe)
   */
  getConditionLabel(score: number): string {
    if (score >= 90) return 'Mükemmel';
    if (score >= 75) return 'Çok İyi';
    if (score >= 60) return 'İyi';
    if (score >= 40) return 'Orta';
    return 'Kötü';
  }

  /**
   * Get Condition Color (Durum Rengi)
   * 
   * Skora göre renk döndürür (UI için).
   * 
   * @param score - Genel skor
   * 
   * @returns Renk kodu
   */
  getConditionColor(score: number): string {
    if (score >= 90) return 'green';
    if (score >= 75) return 'blue';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  }

  /**
   * Format Currency (Para Formatla)
   * 
   * Tutarı Türk Lirası formatında döndürür.
   * 
   * @param amount - Tutar
   * 
   * @returns Formatlanmış tutar (TL)
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  }
}

// ===== SINGLETON INSTANCE =====

/**
 * Singleton Instance
 */
export const comprehensiveExpertiseService = new ComprehensiveExpertiseService();

/**
 * Default Export
 */
export default comprehensiveExpertiseService;
