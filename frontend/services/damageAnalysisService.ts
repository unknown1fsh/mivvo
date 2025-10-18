/**
 * Damage Analysis Service (Hasar Analizi Servisi)
 * 
 * Clean Architecture - Service Layer (Servis Katmanı)
 * 
 * Bu servis, araç hasar analizi işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Hasar analizi yapma (AI ile)
 * - Analiz geçmişi yönetimi
 * - Analiz silme
 * - Maliyet hesaplama
 * - UI helper metotları (renk, format)
 * 
 * Özellikler:
 * - OpenAI Vision API entegrasyonu
 * - Gerçek zamanlı hasar tespiti
 * - Tahmini onarım maliyeti
 * - Hasar şiddeti belirleme
 * - Türkçe metinler
 * 
 * Kullanım:
 * ```typescript
 * import { damageAnalysisService } from './damageAnalysisService'
 * 
 * const result = await damageAnalysisService.analyze({
 *   image: file,
 *   vehicleInfo: { brand: 'Toyota', model: 'Corolla' }
 * })
 * ```
 */

import { apiClient } from './apiClient';

// ===== INTERFACES =====

/**
 * Damage Analysis Request
 * 
 * Hasar analizi için request interface'i.
 */
export interface DamageAnalysisRequest {
  image: File;
  vehicleInfo?: {
    brand?: string;
    model?: string;
    year?: number;
  };
  vehicleGarageId?: number;
}

/**
 * Damage Analysis Response
 * 
 * Hasar analizi sonucu.
 */
export interface DamageAnalysisResponse {
  id: number;
  reportId: number;
  damageAreas: DamageArea[];
  totalDamages: number;
  criticalDamages: number;
  overallScore: number;
  damageSeverity: 'low' | 'medium' | 'high' | 'critical';
  estimatedRepairCost: number;
  confidence: number;
  aiProvider?: string;
  model?: string;
  createdAt: string;
}

/**
 * Damage Area
 * 
 * Tek bir hasar bölgesi.
 */
export interface DamageArea {
  type: 'scratch' | 'dent' | 'rust' | 'paint_chip' | 'crack' | 'corrosion';
  severity: 'low' | 'medium' | 'high';
  location: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  description: string;
  estimatedCost: number;
  confidence: number;
}

// ===== DAMAGE ANALYSIS SERVICE CLASS =====

/**
 * Damage Analysis Service Class
 * 
 * Hasar analizi işlemlerini yöneten servis.
 */
class DamageAnalysisService {
  private readonly endpoint = '/damage-analysis';

  // ===== ANALYSIS =====

  /**
   * Analyze (Hasar Analizi Yap)
   * 
   * Görüntüden hasar analizi yapar.
   * 
   * İşlem Akışı:
   * 1. FormData oluştur
   * 2. Görüntüyü ekle
   * 3. Araç bilgilerini ekle (opsiyonel)
   * 4. Backend'e gönder
   * 5. AI analizi yap (OpenAI Vision API)
   * 6. Sonuçları döndür
   * 
   * @param request - Analiz bilgileri
   * 
   * @returns DamageAnalysisResponse
   * 
   * @throws Error - Analiz başarısız olursa
   */
  async analyze(request: DamageAnalysisRequest): Promise<DamageAnalysisResponse> {
    const formData = new FormData();
    formData.append('image', request.image);

    if (request.vehicleInfo) {
      formData.append('vehicleInfo', JSON.stringify(request.vehicleInfo));
    }

    if (request.vehicleGarageId) {
      formData.append('vehicleGarageId', request.vehicleGarageId.toString());
    }

    const response = await apiClient.post<DamageAnalysisResponse>(
      `${this.endpoint}/analyze`,
      formData
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Hasar analizi başarısız');
    }

    return response.data;
  }

  // ===== HISTORY =====

  /**
   * Get History (Analiz Geçmişi)
   * 
   * Kullanıcının tüm hasar analizlerini getirir.
   * 
   * @param page - Sayfa numarası
   * @param limit - Sayfa boyutu
   * 
   * @returns Analiz geçmişi
   * 
   * @throws Error - Geçmiş yüklenemezse
   */
  async getHistory(page: number = 1, limit: number = 10): Promise<{
    analyses: DamageAnalysisResponse[];
    total: number;
    pages: number;
  }> {
    const response = await apiClient.get<any>(
      `${this.endpoint}/history?page=${page}&limit=${limit}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Geçmiş yüklenemedi');
    }

    return response.data;
  }

  /**
   * Get By ID (ID'ye Göre Getir)
   * 
   * Belirli bir analizi getirir.
   * 
   * @param id - Analiz ID
   * 
   * @returns DamageAnalysisResponse
   * 
   * @throws Error - Analiz bulunamazsa
   */
  async getById(id: number): Promise<DamageAnalysisResponse> {
    const response = await apiClient.get<DamageAnalysisResponse>(
      `${this.endpoint}/${id}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Analiz bulunamadı');
    }

    return response.data;
  }

  /**
   * Delete (Analiz Sil)
   * 
   * Belirli bir analizi siler.
   * 
   * @param id - Analiz ID
   * 
   * @throws Error - Silme başarısız olursa
   */
  async delete(id: number): Promise<void> {
    const response = await apiClient.delete(`${this.endpoint}/${id}`);

    if (!response.success) {
      throw new Error(response.error || 'Silme işlemi başarısız');
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Calculate Total Cost (Toplam Maliyet Hesapla)
   * 
   * Tüm hasar alanlarının toplam maliyetini hesaplar.
   * 
   * @param damageAreas - Hasar alanları
   * 
   * @returns Toplam maliyet (TL)
   */
  calculateTotalCost(damageAreas: DamageArea[]): number {
    return damageAreas.reduce((total, area) => total + area.estimatedCost, 0);
  }

  /**
   * Get Severity Color (Şiddet Rengi)
   * 
   * Hasar şiddetine göre renk döndürür (UI için).
   * 
   * @param severity - Hasar şiddeti
   * 
   * @returns Renk kodu
   */
  getSeverityColor(severity: string): string {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      critical: 'red',
    };
    return colors[severity as keyof typeof colors] || 'gray';
  }

  /**
   * Format Severity (Şiddet Formatla)
   * 
   * Hasar şiddetini Türkçe'ye çevirir.
   * 
   * @param severity - Hasar şiddeti
   * 
   * @returns Türkçe metin
   */
  formatSeverity(severity: string): string {
    const labels = {
      low: 'Düşük',
      medium: 'Orta',
      high: 'Yüksek',
      critical: 'Kritik',
    };
    return labels[severity as keyof typeof labels] || severity;
  }

  /**
   * Format Damage Type (Hasar Tipi Formatla)
   * 
   * Hasar tipini Türkçe'ye çevirir.
   * 
   * @param type - Hasar tipi
   * 
   * @returns Türkçe metin
   */
  formatDamageType(type: string): string {
    const labels = {
      scratch: 'Çizik',
      dent: 'Göçük',
      rust: 'Pas',
      paint_chip: 'Boya Dökülmesi',
      crack: 'Çatlak',
      corrosion: 'Korozyon',
    };
    return labels[type as keyof typeof labels] || type;
  }
}

// ===== SINGLETON INSTANCE =====

/**
 * Singleton Instance
 */
export const damageAnalysisService = new DamageAnalysisService();

/**
 * Default Export
 */
export default damageAnalysisService;
