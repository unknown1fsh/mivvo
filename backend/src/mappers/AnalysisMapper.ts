/**
 * Analiz Mapper (Analysis Mapper)
 * 
 * Clean Architecture - Mapper Layer (Dönüşüm Katmanı)
 * 
 * AI analiz sonuçları ile Response DTO'lar arasında dönüşüm yapar.
 * 
 * Mapper'ın amacı:
 * - Ham AI analiz sonuçlarını yapılandırılmış DTO'lara dönüştürmek
 * - Hasar puanlaması ve maliyet hesaplamaları yapmak
 * - Client için okunabilir formata çevirmek
 * - AI provider bilgilerini eklemek
 * 
 * Bu mapper, AI servislerinden gelen farklı formatları standartlaştırır.
 * OpenAI Vision, Google Gemini gibi farklı AI sağlayıcılarının
 * yanıtlarını tek bir formata çevirir.
 */

import {
  DamageAnalysisResponseDTO,
  DamageAreaDTO,
  PaintAnalysisResponseDTO,
} from '../dto/response/AnalysisResponseDTO';

/**
 * AnalysisMapper Static Sınıfı
 * 
 * Tüm metodlar static'tir, instance oluşturmaya gerek yoktur.
 * Utility sınıfı olarak çalışır.
 */
export class AnalysisMapper {
  /**
   * Ham AI hasar analizi sonucunu DamageAnalysisResponseDTO'ya dönüştürür
   * 
   * AI servisinden gelen JSON yanıtını parse eder ve yapılandırılmış DTO'ya çevirir.
   * Hasar skorları, maliyet hesaplamaları ve şiddet değerlendirmesi yapar.
   * 
   * @param reportId - Bu analizin bağlı olduğu rapor ID'si
   * @param analysisResult - AI servisinden gelen ham analiz sonucu (JSON)
   * @param aiProvider - Kullanılan AI sağlayıcısı (örn: 'OpenAI', 'Google Gemini') (opsiyonel)
   * @param model - Kullanılan AI model adı (örn: 'gpt-4-vision') (opsiyonel)
   * @returns DamageAnalysisResponseDTO - Yapılandırılmış hasar analiz sonucu
   */
  static toDamageAnalysisDTO(
    reportId: number,
    analysisResult: any,
    aiProvider?: string,
    model?: string
  ): DamageAnalysisResponseDTO {
    // AI'dan gelen hasar alanlarını DamageAreaDTO'ya dönüştür
    const damageAreas: DamageAreaDTO[] = (analysisResult.damageAreas || []).map((area: any) => ({
      type: area.type,          // Hasar tipi (scratch, dent, rust vb.)
      severity: area.severity,  // Şiddet seviyesi (low, medium, high)
      location: {
        x: area.x || 0,         // Fotoğraf üzerinde X koordinatı
        y: area.y || 0,         // Fotoğraf üzerinde Y koordinatı
        width: area.width || 0, // Hasarın genişliği
        height: area.height || 0, // Hasarın yüksekliği
      },
      description: area.description || '',      // AI'ın hasar açıklaması
      estimatedCost: area.estimatedCost || 0,   // Tahmini tamir maliyeti (TL)
      confidence: area.confidence || 0,         // AI güven skoru (0-100)
    }));

    // İstatistik hesaplamaları
    const totalDamages = damageAreas.length;
    const criticalDamages = damageAreas.filter((d) => d.severity === 'high').length;

    // Genel hasar skorunu hesapla (0-100 arası, yüksek = az hasarlı)
    const overallScore = this.calculateDamageScore(damageAreas);

    // Hasar şiddet kategorisini belirle
    let damageSeverity: 'low' | 'medium' | 'high' | 'critical';
    if (overallScore >= 90) damageSeverity = 'low';        // Çok az hasar
    else if (overallScore >= 70) damageSeverity = 'medium'; // Orta hasar
    else if (overallScore >= 40) damageSeverity = 'high';   // Yüksek hasar
    else damageSeverity = 'critical';                        // Kritik hasar

    // Toplam tamir maliyetini hesapla (tüm hasarların toplamı)
    const estimatedRepairCost = damageAreas.reduce((sum, area) => sum + area.estimatedCost, 0);

    return {
      id: 0,  // Veritabanına kaydedildikten sonra doldurulacak
      reportId,
      damageAreas,
      totalDamages,
      criticalDamages,
      overallScore,
      damageSeverity,
      estimatedRepairCost,
      confidence: analysisResult.confidence || 85, // Genel AI güven skoru
      aiProvider,
      model,
      createdAt: new Date(),
    };
  }

  /**
   * Ham AI boya analizi sonucunu PaintAnalysisResponseDTO'ya dönüştürür
   * 
   * AI servisinden gelen boya analizi yanıtını parse eder.
   * Boya kalınlığı, renk uyumu, çizik sayısı gibi detayları yapılandırır.
   * 
   * @param vehicleId - Analiz edilen araç ID'si
   * @param angle - Fotoğrafın çekildiği açı (front, rear, left, right vb.)
   * @param analysisResult - AI servisinden gelen ham analiz sonucu (JSON)
   * @returns PaintAnalysisResponseDTO - Yapılandırılmış boya analiz sonucu
   */
  static toPaintAnalysisDTO(
    vehicleId: number,
    angle: string,
    analysisResult: any
  ): PaintAnalysisResponseDTO {
    return {
      id: 0,  // Veritabanına kaydedildikten sonra doldurulacak
      vehicleId,
      angle,
      paintCondition: analysisResult.paintCondition || 'good',    // Boya durumu
      paintThickness: analysisResult.paintThickness || 0,         // Mikron cinsinden
      colorMatch: analysisResult.colorMatch || 0,                 // Renk uyumu (0-100)
      scratches: analysisResult.scratches || 0,                   // Çizik sayısı
      dents: analysisResult.dents || 0,                          // Göçük sayısı
      rust: analysisResult.rust || false,                         // Pas var mı?
      oxidation: analysisResult.oxidation || 0,                   // Oksidasyon seviyesi
      glossLevel: analysisResult.glossLevel || 0,                 // Parlaklık seviyesi
      overallScore: analysisResult.overallScore || 0,             // Genel boya skoru
      recommendations: analysisResult.recommendations || [],       // AI önerileri
      confidence: analysisResult.confidence || 85,                // AI güven skoru
      technicalDetails: analysisResult.technicalDetails || {
        paintSystem: 'Unknown',     // Boya sistemi
        primerType: 'Unknown',      // Astar tipi
        baseCoat: 'Unknown',        // Ana kat
        clearCoat: 'Unknown',       // Vernik
        totalThickness: 0,          // Toplam kalınlık
        colorCode: 'Unknown',       // Renk kodu
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Hasar alanlarına göre genel skor hesaplar
   * 
   * Private helper metod. Hasar sayısı ve şiddetine göre 0-100 arası skor üretir.
   * Skor ne kadar yüksekse araç o kadar az hasarlıdır.
   * 
   * Hesaplama formülü:
   * - Her hasar için -5 puan
   * - Her yüksek şiddetli hasar için ekstra -15 puan
   * - Her orta şiddetli hasar için ekstra -8 puan
   * - Minimum skor: 10, Maximum skor: 95
   * 
   * @param damageAreas - Tespit edilen hasar alanları
   * @returns Genel hasar skoru (0-100 arası)
   */
  private static calculateDamageScore(damageAreas: DamageAreaDTO[]): number {
    // Hiç hasar yoksa mükemmel skor
    if (damageAreas.length === 0) return 95;

    const totalDamages = damageAreas.length;
    const highSeverityCount = damageAreas.filter((d) => d.severity === 'high').length;
    const mediumSeverityCount = damageAreas.filter((d) => d.severity === 'medium').length;

    // Skor hesaplama formülü
    const score = 95 
      - (totalDamages * 5)         // Her hasar -5 puan
      - (highSeverityCount * 15)   // Her kritik hasar -15 puan
      - (mediumSeverityCount * 8); // Her orta hasar -8 puan

    // Skoru 10-100 aralığında tut
    return Math.max(10, Math.min(100, score));
  }
}
