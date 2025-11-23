/**
 * Hasar Analizi Servisi (Damage Analysis Service)
 * 
 * Clean Architecture - Service Layer (İş Mantığı Katmanı)
 * 
 * Bu servis, araç hasar analizi sürecinin tüm iş mantığını yönetir.
 * 
 * Amaç:
 * - Hasar analizi süreci yönetimi
 * - Kredi kontrolü ve düşme işlemleri
 * - Görsel yükleme ve doğrulama
 * - AI servis orchestration
 * - Analiz sonuçlarının hesaplanması
 * - Rapor oluşturma ve güncelleme
 * 
 * İş Akışı:
 * 1. startAnalysis    → Analiz başlatır (kredi kontrolü + rapor oluşturur)
 * 2. uploadImages     → Görselleri yükler ve kaydeder
 * 3. performAnalysis  → AI analizi yapar ve sonuçları hesaplar
 * 4. getReport        → Raporu getirir
 * 
 * Clean Architecture Prensipleri:
 * - Repository pattern ile veri erişimi
 * - Custom exception'lar ile hata yönetimi
 * - Constants ile sabit değerler
 * - Mapper ile DTO dönüşümleri
 * - AIService ile AI orchestration
 * 
 * Özellikler:
 * - Test modu desteği (kredi düşme bypass)
 * - Detaylı error handling
 * - Transaction yönetimi
 * - Sahiplik kontrolü
 * - Hasar skoru hesaplama
 * - Onarım maliyet tahmini
 * - Piyasa değeri etkisi analizi
 * - Güvenlik endişeleri tespiti
 * - Sigorta durumu değerlendirmesi
 */

import { VehicleReport } from '@prisma/client';
import { VehicleReportRepository } from '../repositories/VehicleReportRepository';
import { UserRepository } from '../repositories/UserRepository';
import { PrismaClient } from '@prisma/client';
import { AIService } from './aiService';
import { refundCreditForFailedAnalysis } from '../utils/creditRefund';
import { logAiAnalysis, logError, logInfo, logDebug, createTimer } from '../utils/logger';
import {
  ReportNotFoundException,
  UnauthorizedException,
  InsufficientCreditsException,
  BadRequestException,
} from '../exceptions';
import { CREDIT_PRICING, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import { AnalysisMapper } from '../mappers/AnalysisMapper';
import { addAIAnalysisJob } from '../jobs/aiAnalysisJob';

// Prisma client ve repository instance'ları
const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);
const reportRepository = new VehicleReportRepository(prisma);

// ===== TİP TANIMLARI =====

/**
 * Hasar Analizi Başlatma İsteği Interface
 * 
 * Analiz başlatmak için gerekli bilgiler
 */
export interface StartDamageAnalysisRequest {
  vehicleInfo: {                                      // Araç bilgileri
    plate: string;                                    // Plaka (zorunlu)
    brand?: string;                                   // Marka (opsiyonel)
    make?: string;                                    // Make (opsiyonel, brand yerine)
    model: string;                                    // Model (zorunlu)
    year: number;                                     // Yıl (zorunlu)
  };
  analysisType?: 'damage' | 'comprehensive';          // Analiz tipi (opsiyonel)
}

/**
 * Hasar Analizi Yanıtı Interface
 * 
 * Analiz başlatma işleminin sonucu
 */
export interface DamageAnalysisResponse {
  reportId: number;                                                     // Oluşturulan rapor ID'si
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';                       // Rapor durumu
  vehicleInfo: {                                                        // Araç bilgileri
    plate: string;                                                      // Plaka
    brand: string;                                                      // Marka
    model: string;                                                      // Model
    year: number;                                                       // Yıl
  };
  message: string;                                                      // Kullanıcıya gösterilecek mesaj
}

/**
 * Analiz Sonucu Yanıtı Interface
 * 
 * Tamamlanmış analiz sonucunun tüm detayları
 */
export interface AnalysisResultResponse {
  reportId: number;                                   // Rapor ID'si
  status: string;                                     // Rapor durumu
  analysisResult: any;                                // Analiz sonuçları (detaylı JSON)
  vehicleInfo: any;                                   // Araç bilgileri
  createdAt: Date;                                    // Oluşturulma tarihi
  completedAt?: Date;                                 // Tamamlanma tarihi
}

/**
 * DamageAnalysisService Sınıfı
 * 
 * Hasar analizi sürecinin tüm iş mantığını içerir
 */
export class DamageAnalysisService {
  /**
   * Hasar Analizi Başlatır
   * 
   * İş Akışı:
   * 1. İstek validasyonu (plaka, model, yıl kontrolü)
   * 2. Kullanıcı kredi kontrolü (yeterli kredi var mı?)
   * 3. Rapor kaydı oluşturma (PROCESSING durumunda)
   * 4. Kredi düşme işlemi (test modunda atlanır)
   * 
   * Test Modu:
   * - NODE_ENV=development veya TEST_MODE=true ise kredi düşmez
   * - Bu sayede geliştirme sırasında kredi tüketimi olmaz
   * 
   * @param userId - Kullanıcı ID'si
   * @param request - Analiz başlatma isteği (araç bilgileri)
   * @returns Oluşturulan rapor bilgisi (reportId, status, vehicleInfo)
   * @throws BadRequestException - Eksik/geçersiz araç bilgileri
   * @throws InsufficientCreditsException - Yetersiz kredi
   * 
   * @example
   * const result = await damageAnalysisService.startAnalysis(123, {
   *   vehicleInfo: {
   *     plate: '34ABC123',
   *     brand: 'Toyota',
   *     model: 'Corolla',
   *     year: 2020
   *   }
   * });
   */
  async startAnalysis(
    userId: number,
    request: StartDamageAnalysisRequest
  ): Promise<DamageAnalysisResponse> {
    const timer = createTimer('DamageAnalysis-startAnalysis');
    
    logAiAnalysis('START', '', {
      userId,
      vehicleInfo: request.vehicleInfo,
      timestamp: new Date().toISOString(),
    });

    logDebug('DamageAnalysisService.startAnalysis çağrıldı', { userId, request });

    // 1. Validasyon
    this.validateStartRequest(request);

    // 2. Kredi kontrolü
    await this.checkUserCredits(userId, CREDIT_PRICING.DAMAGE_ANALYSIS);

    // 3. Rapor oluştur
    const report = await reportRepository.create({
      userId,
      vehiclePlate: request.vehicleInfo.plate,
      vehicleBrand: request.vehicleInfo.brand || request.vehicleInfo.make || 'Belirtilmemiş',
      vehicleModel: request.vehicleInfo.model,
      vehicleYear: request.vehicleInfo.year,
      reportType: 'DAMAGE_ASSESSMENT',
      status: 'PROCESSING',
      totalCost: CREDIT_PRICING.DAMAGE_ANALYSIS,
      aiAnalysisData: {}
    });

    console.log('✅ Rapor oluşturuldu:', report.id);

    // 4. Kredi düş (test modunda atla)
    const isTestMode = process.env.NODE_ENV === 'development' || process.env.TEST_MODE === 'true';
    if (!isTestMode) {
      await this.deductCredits(userId, CREDIT_PRICING.DAMAGE_ANALYSIS, report.id);
    }

    return {
      reportId: report.id,
      status: 'PROCESSING',
      vehicleInfo: {
        plate: report.vehiclePlate || '',
        brand: report.vehicleBrand || '',
        model: report.vehicleModel || '',
        year: report.vehicleYear || new Date().getFullYear(),
      },
      message: SUCCESS_MESSAGES.ANALYSIS.PROCESSING
    };
  }

  /**
   * Resimleri Yükler
   * 
   * İş Akışı:
   * 1. Dosya validasyonu (boş mu kontrolü)
   * 2. Rapor sahiplik kontrolü (kullanıcı rapora sahip mi?)
   * 3. Resimleri base64'e çevirip veritabanına kaydetme
   * 
   * NOT: Resimler base64 format olarak saklanır.
   * Bu yaklaşım küçük-orta boyutlu uygulamalar için uygundur.
   * Büyük ölçekli uygulamalarda S3/Cloudinary kullanımı tercih edilmelidir.
   * 
   * @param userId - Kullanıcı ID'si
   * @param reportId - Rapor ID'si
   * @param files - Multer ile yüklenen dosyalar
   * @returns Yüklenen resim sayısı ve resim kayıtları
   * @throws BadRequestException - Dosya yoksa
   * @throws ReportNotFoundException - Rapor bulunamazsa
   * @throws UnauthorizedException - Kullanıcı rapora sahip değilse
   * 
   * @example
   * const result = await damageAnalysisService.uploadImages(123, 456, files);
   * console.log(`${result.uploadedCount} resim yüklendi`);
   */
  async uploadImages(
    userId: number,
    reportId: number,
    files: Express.Multer.File[]
  ): Promise<{ uploadedCount: number; message: string; images: any[] }> {
    console.log('📸 DamageAnalysisService.uploadImages çağrıldı:', { userId, reportId, fileCount: files.length });

    // 1. Validasyon
    if (!files || files.length === 0) {
      throw new BadRequestException(ERROR_MESSAGES.FILE.UPLOAD_FAILED);
    }

    // 2. Rapor sahiplik kontrolü
    await this.checkReportOwnership(userId, reportId);

    // 3. Resimleri kaydet (base64 format)
    const imageRecords = await Promise.all(
      files.map(async (file) => {
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        
        return prisma.vehicleImage.create({
          data: {
            reportId,
            imageUrl: base64Image,
            imageType: 'DAMAGE',
            fileSize: file.size
          }
        });
      })
    );

    console.log('✅ Resimler kaydedildi:', imageRecords.length);

    return {
      uploadedCount: imageRecords.length,
      message: `${files.length} resim başarıyla yüklendi`,
      images: imageRecords
    };
  }

  /**
   * AI Analizi Gerçekleştirir
   * 
   * İş Akışı:
   * 1. Rapor ve resimleri getir
   * 2. Sahiplik ve resim varlık kontrolü
   * 3. Her resmi AI ile analiz et (AIService.detectDamage)
   * 4. Analiz sonuçlarını birleştir ve hesapla
   * 5. Raporu COMPLETED olarak güncelle
   * 
   * AI Analizi:
   * - Her resim için AIService.detectDamage çağrılır
   * - Hasar alanları, şiddet, maliyet hesaplanır
   * - Tüm sonuçlar birleştirilerek özet rapor oluşturulur
   * 
   * Hesaplanan Metrikler:
   * - overallScore: Genel puan (0-100)
   * - damageSeverity: Hasar şiddeti (low/medium/high/critical)
   * - totalDamages: Toplam hasar sayısı
   * - criticalDamages: Kritik hasar sayısı
   * - estimatedRepairCost: Tahmini onarım maliyeti (TL)
   * - insuranceStatus: Sigorta kapsamı durumu
   * - marketValueImpact: Piyasa değerine etkisi (%)
   * - strengths: Güçlü yönler
   * - weaknesses: Zayıf yönler
   * - recommendations: Öneriler
   * - safetyConcerns: Güvenlik endişeleri
   * 
   * @param userId - Kullanıcı ID'si
   * @param reportId - Rapor ID'si
   * @returns Tamamlanmış analiz sonucu
   * @throws ReportNotFoundException - Rapor bulunamazsa
   * @throws UnauthorizedException - Kullanıcı rapora sahip değilse
   * @throws BadRequestException - Resim yoksa
   * 
   * @example
   * const result = await damageAnalysisService.performAnalysis(123, 456);
   * console.log(`Genel Puan: ${result.analysisResult.overallScore}`);
   * console.log(`Toplam Hasar: ${result.analysisResult.totalDamages}`);
   */
  async performAnalysis(
    userId: number,
    reportId: number
  ): Promise<AnalysisResultResponse> {
    console.log('🤖 DamageAnalysisService.performAnalysis çağrıldı:', { userId, reportId });

    try {
      // 1. Rapor ve resimleri getir
      const report = await reportRepository.findByIdWithDetails(reportId);

      if (!report) {
        throw new ReportNotFoundException(ERROR_MESSAGES.REPORT.NOT_FOUND);
      }

      if (report.userId !== userId) {
        throw new UnauthorizedException(ERROR_MESSAGES.REPORT.ACCESS_DENIED);
      }

      // 2. Resim kontrolü
      const images = await prisma.vehicleImage.findMany({
        where: { reportId }
      });

      if (!images || images.length === 0) {
        throw new BadRequestException(ERROR_MESSAGES.ANALYSIS.INVALID_IMAGE);
      }

      console.log(`📸 ${images.length} resim analiz edilecek`);

      // 3. AI analizi
      const analysisResults = await this.analyzeImages(report, images);

      // 4. Analiz sonucunu hesapla
      const analysisData = this.calculateAnalysisResults(analysisResults, images.length);

      // 5. Raporu güncelle
      await reportRepository.update(reportId, {
        status: 'COMPLETED',
        aiAnalysisData: analysisData as any
      });

      console.log('🎉 Hasar analizi tamamlandı');

      return {
        reportId,
        status: 'COMPLETED',
        analysisResult: analysisData,
        vehicleInfo: {
          plate: report.vehiclePlate,
          brand: report.vehicleBrand,
          model: report.vehicleModel,
          year: report.vehicleYear
        },
        createdAt: report.createdAt,
        completedAt: new Date()
      };
    } catch (error) {
      console.error('❌ Hasar analizi başarısız:', error);
      
      // Analiz başarısız oldu - Krediyi iade et (GARANTİLİ)
      let creditRefunded = false;
      let refundError: any = null;
      
      try {
        const serviceCost = CREDIT_PRICING.DAMAGE_ANALYSIS;
        
        await refundCreditForFailedAnalysis(
          userId,
          reportId,
          serviceCost,
          'Hasar analizi AI servisi başarısız - Kredi otomatik iade edildi'
        );
        
        creditRefunded = true;
        console.log(`✅ Kredi iade edildi: ${serviceCost} TL`);
      } catch (refundErr) {
        refundError = refundErr;
        console.error('❌ Kredi iade hatası:', refundErr);
        // Kredi iade hatası olsa bile raporu FAILED olarak işaretle
      }
      
      // Raporu MUTLAKA FAILED olarak işaretle (kredi iade başarılı olsa da olmasa da)
      try {
        await reportRepository.update(reportId, {
          status: 'FAILED',
          expertNotes: creditRefunded 
            ? 'Hasar analizi başarısız oldu. AI servisinden veri alınamadı. Kredi otomatik iade edildi.'
            : 'Hasar analizi başarısız oldu. AI servisinden veri alınamadı. Kredi iade işlemi başarısız oldu - lütfen destek ile iletişime geçin.'
        });
        console.log('✅ Rapor FAILED durumuna geçirildi');
      } catch (updateError) {
        console.error('❌ Rapor güncelleme hatası:', updateError);
        // Rapor güncelleme hatası olsa bile hata fırlat
      }
      
      // Kullanıcıya net hata mesajı ver
      const errorMessage = creditRefunded
        ? ERROR_MESSAGES.ANALYSIS.AI_FAILED_WITH_REFUND || 'AI analizi tamamlanamadı. Krediniz otomatik olarak iade edildi. Lütfen daha sonra tekrar deneyin.'
        : 'AI analizi tamamlanamadı. Kredi iade işlemi sırasında bir sorun oluştu. Lütfen destek ile iletişime geçin.';
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Rapor Getirir
   * 
   * Sahiplik kontrolü yaparak raporu getirir.
   * 
   * @param userId - Kullanıcı ID'si
   * @param reportId - Rapor ID'si
   * @returns Rapor detayları (ilişkili verilerle)
   * @throws ReportNotFoundException - Rapor bulunamazsa
   * @throws UnauthorizedException - Kullanıcı rapora sahip değilse
   * 
   * @example
   * const report = await damageAnalysisService.getReport(123, 456);
   */
  async getReport(userId: number, reportId: number): Promise<any> {
    const report = await reportRepository.findByIdWithDetails(reportId);

    if (!report) {
      throw new ReportNotFoundException(ERROR_MESSAGES.REPORT.NOT_FOUND);
    }

    if (report.userId !== userId) {
      throw new UnauthorizedException(ERROR_MESSAGES.REPORT.ACCESS_DENIED);
    }

    // Debug: Rapor verisini logla (Frontend'e gönderilmeden önce)
    console.log('🔍 DamageAnalysisService.getReport - Frontend\'e gönderilecek rapor verisi:', {
      reportId: report.id,
      status: report.status,
      hasAiAnalysisData: !!report.aiAnalysisData,
      aiAnalysisDataType: report.aiAnalysisData ? typeof report.aiAnalysisData : 'undefined',
      aiAnalysisDataKeys: report.aiAnalysisData ? Object.keys(report.aiAnalysisData as any) : [],
      hasHasarAlanları: !!(report.aiAnalysisData && (report.aiAnalysisData as any).hasarAlanları),
      hasarAlanlarıLength: report.aiAnalysisData && (report.aiAnalysisData as any).hasarAlanları ? (report.aiAnalysisData as any).hasarAlanları.length : 0,
      hasGenelDeğerlendirme: !!(report.aiAnalysisData && (report.aiAnalysisData as any).genelDeğerlendirme),
      genelDeğerlendirmeKeys: report.aiAnalysisData && (report.aiAnalysisData as any).genelDeğerlendirme ? Object.keys((report.aiAnalysisData as any).genelDeğerlendirme) : [],
      vehiclePlate: report.vehiclePlate
    });

    return report;
  }

  // ===== PRIVATE HELPER METODLAR =====
  // Bu metodlar sadece sınıf içinden çağrılır

  /**
   * İstek Validasyonu
   * 
   * Analiz başlatma isteğinin geçerliliğini kontrol eder.
   * 
   * Kontroller:
   * - Plaka bilgisi var mı?
   * - Model bilgisi var mı?
   * - Yıl geçerli mi? (>= 1900)
   * 
   * @param request - Analiz başlatma isteği
   * @throws BadRequestException - Validasyon hatası
   * 
   * @private
   */
  private validateStartRequest(request: StartDamageAnalysisRequest): void {
    if (!request.vehicleInfo || !request.vehicleInfo.plate) {
      throw new BadRequestException('Araç bilgileri eksik. Plaka bilgisi gerekli.');
    }

    if (!request.vehicleInfo.model) {
      throw new BadRequestException('Araç modeli gerekli.');
    }

    if (!request.vehicleInfo.year || request.vehicleInfo.year < 1900) {
      throw new BadRequestException('Geçerli bir araç yılı gerekli.');
    }
  }

  /**
   * Kullanıcı Kredi Kontrolü
   * 
   * Kullanıcının yeterli kredisi olup olmadığını kontrol eder.
   * 
   * Test Modu:
   * - NODE_ENV=development veya TEST_MODE=true ise atlanır
   * 
   * @param userId - Kullanıcı ID'si
   * @param requiredAmount - Gerekli kredi miktarı (TL)
   * @throws InsufficientCreditsException - Yetersiz kredi
   * 
   * @private
   */
  private async checkUserCredits(userId: number, requiredAmount: number): Promise<void> {
    const isTestMode = process.env.NODE_ENV === 'development' || process.env.TEST_MODE === 'true';
    
    if (isTestMode) {
      console.log('⚠️ Test modu - Kredi kontrolü atlandı');
      return;
    }

    const userCredits = await prisma.userCredits.findUnique({
      where: { userId }
    });

    if (!userCredits || userCredits.balance.toNumber() < requiredAmount) {
      throw new InsufficientCreditsException(
        `Yetersiz kredi. Gerekli: ${requiredAmount} TL, Mevcut: ${userCredits?.balance.toNumber() || 0} TL`
      );
    }
  }

  /**
   * Kredi Düşme İşlemi
   * 
   * Kullanıcının kredi bakiyesini düşürür ve transaction kaydı oluşturur.
   * 
   * İşlemler:
   * 1. Kredi bakiyesini düş (decrement)
   * 2. CreditTransaction kaydı oluştur (audit trail)
   * 
   * @param userId - Kullanıcı ID'si
   * @param amount - Düşülecek kredi miktarı (TL)
   * @param reportId - İlişkili rapor ID'si (referans)
   * 
   * @private
   */
  private async deductCredits(
    userId: number,
    amount: number,
    reportId: number
  ): Promise<void> {
    // Atomik işlem: Kredi düş + Transaction oluştur
    await prisma.$transaction(async (tx) => {
      // 1. Kredi düş
      await tx.userCredits.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
          totalUsed: { increment: amount }
        }
      });

      // 2. Transaction kaydet (audit trail)
      await tx.creditTransaction.create({
        data: {
          userId,
          amount: amount, // DÜZELTME: Negatif değil, pozitif tutar
          transactionType: 'USAGE',
          description: 'Hasar Analizi - AI servisi kullanımı',
          referenceId: reportId.toString(),
          status: 'COMPLETED'
        }
      });
    });

    console.log('💳 Kredi işlemi tamamlandı:', { userId, amount, reportId });
  }

  /**
   * Rapor Sahiplik Kontrolü
   * 
   * Kullanıcının rapora erişim yetkisi olup olmadığını kontrol eder.
   * 
   * @param userId - Kullanıcı ID'si
   * @param reportId - Rapor ID'si
   * @throws ReportNotFoundException - Rapor bulunamazsa
   * @throws UnauthorizedException - Kullanıcı rapora sahip değilse
   * 
   * @private
   */
  private async checkReportOwnership(userId: number, reportId: number): Promise<void> {
    const report = await reportRepository.findById(reportId);

    if (!report) {
      throw new ReportNotFoundException(ERROR_MESSAGES.REPORT.NOT_FOUND);
    }

    if (report.userId !== userId) {
      throw new UnauthorizedException(ERROR_MESSAGES.REPORT.ACCESS_DENIED);
    }
  }

  /**
   * Resimleri Analiz Et
   * 
   * Her resmi AIService ile analiz eder ve sonuçları toplar.
   * 
   * İş Akışı:
   * 1. Her resim için döngü
   * 2. AIService.detectDamage çağrısı
   * 3. Hasar alanlarını işle ve normalize et
   * 4. Hasar skorunu hesapla
   * 5. Hata durumunda boş sonuç döndür (analiz devam eder)
   * 
   * @param report - Rapor bilgileri (araç bilgileri için)
   * @param images - Analiz edilecek resimler
   * @returns Her resim için analiz sonuçları listesi
   * 
   * @private
   */
  private async analyzeImages(report: any, images: any[]): Promise<any[]> {
    const analysisResults = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const vehicleInfo = {
        make: report.vehicleBrand,
        model: report.vehicleModel,
        year: report.vehicleYear,
        plate: report.vehiclePlate
      };

      // Retry mekanizması: Maksimum 2 deneme
      let damageResult: any = null;
      let lastError: any = null;
      const maxRetries = 2;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 1) {
            console.log(`🔄 Resim ${i + 1}/${images.length} analizi tekrar deneniyor... (Deneme ${attempt}/${maxRetries})`);
            // Retry arasında kısa bir bekleme
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            console.log(`🔍 Resim ${i + 1}/${images.length} analiz ediliyor...`);
          }

          damageResult = await AIService.detectDamage(image.imageUrl, vehicleInfo);
          
          // Başarılı oldu, döngüden çık
          break;
        } catch (error) {
          lastError = error;
          console.error(`❌ Resim ${i + 1} analiz hatası (Deneme ${attempt}/${maxRetries}):`, error);
          
          // Son deneme ise hatayı fırlat
          if (attempt === maxRetries) {
            throw lastError;
          }
          // Değilse bir sonraki denemeye geç
        }
      }
      
      // Retry başarılı olduysa devam et
      try {
        // Debug: AI'dan gelen ham veriyi logla
        console.log(`[AI] Resim ${i + 1} AI sonucu:`, {
          hasDamageResult: !!damageResult,
          damageResultKeys: damageResult ? Object.keys(damageResult) : [],
          hasHasarAlanları: !!(damageResult?.hasarAlanları),
          hasarAlanlarıLength: damageResult?.hasarAlanları?.length || 0,
          hasGenelDeğerlendirme: !!(damageResult?.genelDeğerlendirme),
          genelDeğerlendirmeKeys: damageResult?.genelDeğerlendirme ? Object.keys(damageResult.genelDeğerlendirme) : []
        });
        
        // AI'dan gelen damageResult direkt DamageDetectionResult formatında
        // Root seviyesinde: genelDeğerlendirme, teknikAnaliz, güvenlikDeğerlendirmesi, onarımTahmini, hasarAlanları vb.
        // damageResult'u direkt kullan, hasar alanlarına ek field ekleme
        
        const damageAreas = damageResult?.hasarAlanları || [];
        
        // analysisResults array'ine damageResult'u direkt ekle
        // combineAIResults fonksiyonu bu veriyi birleştirecek
        analysisResults.push({
          imageId: image.id,
          imagePath: image.imageUrl,
          damageResult: damageResult, // AI'dan gelen tam sonuç
          damageAreas: damageAreas, // Sadece hasar alanları (fallback için)
          totalDamageScore: this.calculateDamageScore(damageAreas)
        });

        console.log(`✅ Resim ${i + 1} analizi tamamlandı: ${damageAreas.length} hasar`);
      } catch (error) {
        logError(`Resim ${image.id} analiz hatası`, error, {
          imageId: image.id,
          imagePath: image.imagePath,
          vehicleInfo,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined
        });
        console.error(`❌ Resim ${image.id} analiz hatası:`, error);
        console.error('Error details:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        // AI'dan veri gelmediğinde boş sonuç döndür, fallback veri üretme
        analysisResults.push({
          imageId: image.id,
          imagePath: image.imageUrl,
          damageAreas: [],
          totalDamageScore: 0,
          aiError: true,
          errorMessage: 'AI servisi geçici olarak kullanılamıyor'
        });
      }
    }

    return analysisResults;
  }

  /**
   * Analiz Sonuçlarını Hesaplar
   * 
   * Tüm resimlerin analiz sonuçlarını birleştirerek özet rapor oluşturur.
   * 
   * Hesaplamalar:
   * - overallScore: 95 puandan başlar, her hasar için puan düşer
   * - damageSeverity: Puana göre hasar şiddeti (low/medium/high/critical)
   * - estimatedRepairCost: Hasar türlerine göre tahmini onarım maliyeti
   * - insuranceStatus: Sigorta kapsam durumu
   * - marketValueImpact: Piyasa değerine etkisi (%)
   * - strengths/weaknesses: Aracın güçlü/zayıf yönleri
   * - recommendations: Öneriler
   * - safetyConcerns: Güvenlik endişeleri
   * 
   * Puan Hesaplama Formülü:
   * - Başlangıç: 95 puan
   * - Her hasar için: -15 puan
   * - Her kritik hasar için: -25 ek puan
   * - Minimum: 10 puan
   * 
   * @param analysisResults - Her resmin analiz sonuçları
   * @param imageCount - Toplam resim sayısı
   * @returns Detaylı analiz raporu
   * 
   * @private
   */
  private calculateAnalysisResults(analysisResults: any[], imageCount: number): any {
    // Debug: Gelen analysisResults'u logla
    console.log('[AI] calculateAnalysisResults - Gelen results:', {
      resultsCount: analysisResults.length,
      firstResultKeys: analysisResults[0] ? Object.keys(analysisResults[0]) : [],
      hasDamageResult: !!(analysisResults[0]?.damageResult),
      hasDamageAreas: !!(analysisResults[0]?.damageAreas)
    });
    
    // AI'dan gelen detaylı veriyi koru ve genişlet - null-safe
    // analysisResults artık { damageResult, damageAreas } formatında
    const allDamages = analysisResults.flatMap(r => {
      // damageResult içinden hasarAlanları al, yoksa fallback olarak damageAreas kullan
      return r.damageResult?.hasarAlanları || r.damageAreas || [];
    });
    const totalDamages = allDamages.length;
    const criticalDamages = allDamages.filter(d => {
      const severity = d.şiddet || d.severity;
      return severity === 'yüksek' || severity === 'kritik' || severity === 'high' || severity === 'critical';
    }).length;

    // Modern AI servisi kullanıldığı için error kontrolü kaldırıldı
    console.log('[AI] Analysis results received:', analysisResults.length, 'results');
    console.log('[AI] Total damages:', totalDamages, 'Critical:', criticalDamages);

    // AI'dan gelen detaylı analiz sonuçlarını birleştir
    // combineAIResults artık null döndürmüyor, eksik veri durumunda hata fırlatıyor
    let combinedAnalysis: any;
    try {
      combinedAnalysis = this.combineAIResults(analysisResults);
    } catch (combineError) {
      console.error('[AI] calculateAnalysisResults - combineAIResults hatası:', combineError);
      // combineAIResults zaten detaylı hata mesajı ile fırlatıyor, tekrar fırlat
      throw combineError;
    }
    
    // combineAIResults başarılı döndüyse, buraya ulaşıldıysa veri tam olmalı
    // Yine de bir kez daha kontrol et (defensive programming)
    if (!combinedAnalysis || !combinedAnalysis.genelDeğerlendirme) {
      console.error('[AI] calculateAnalysisResults - Combined analysis eksik:', {
        hasCombinedAnalysis: !!combinedAnalysis,
        hasGenelDeğerlendirme: !!combinedAnalysis?.genelDeğerlendirme
      });
      throw new Error('AI analiz sonucu eksik. Genel değerlendirme bilgisi alınamadı.');
    }

    // Debug: combineAIResults sonucunu logla
    console.log('[AI] calculateAnalysisResults - Combined analysis:', {
      hasCombinedAnalysis: !!combinedAnalysis,
      hasGenelDeğerlendirme: !!combinedAnalysis.genelDeğerlendirme,
      hasarAlanlarıCount: combinedAnalysis.hasarAlanları?.length || 0
    });
    
    // AI'dan gelen detaylı analiz mevcut - veriyi döndür
    console.log('[AI] ✅ AI analiz sonucu başarıyla birleştirildi');
    
    // AI'dan gelen veriyi kontrol et - eksik field varsa hata fırlat
    if (!combinedAnalysis.hasarAlanları) {
      throw new Error('AI analiz sonucu eksik. Hasar alanları bilgisi alınamadı.');
    }
    if (!combinedAnalysis.genelDeğerlendirme) {
      throw new Error('AI analiz sonucu eksik. Genel değerlendirme bilgisi alınamadı.');
    }
    if (!combinedAnalysis.aiSağlayıcı) {
      throw new Error('AI analiz sonucu eksik. AI sağlayıcı bilgisi alınamadı.');
    }
    if (!combinedAnalysis.model) {
      throw new Error('AI analiz sonucu eksik. AI model bilgisi alınamadı.');
    }
    if (combinedAnalysis.güven === undefined || combinedAnalysis.güven === null) {
      throw new Error('AI analiz sonucu eksik. Güven seviyesi bilgisi alınamadı.');
    }
    if (!combinedAnalysis.analizZamanı) {
      throw new Error('AI analiz sonucu eksik. Analiz zamanı bilgisi alınamadı.');
    }
    
    return {
      // AI'dan gelen detaylı veri - SADECE AI'dan gelen gerçek veri
      hasarAlanları: combinedAnalysis.hasarAlanları,
      genelDeğerlendirme: combinedAnalysis.genelDeğerlendirme,
      teknikAnaliz: combinedAnalysis.teknikAnaliz,
      güvenlikDeğerlendirmesi: combinedAnalysis.güvenlikDeğerlendirmesi,
      onarımTahmini: combinedAnalysis.onarımTahmini,
      aiSağlayıcı: combinedAnalysis.aiSağlayıcı,
      model: combinedAnalysis.model,
      güven: combinedAnalysis.güven,
      analizZamanı: combinedAnalysis.analizZamanı,
      
      // Ek hesaplanmış değerler (AI'dan gelen veriye dayalı)
      overallScore: this.calculateOverallScore(combinedAnalysis.genelDeğerlendirme),
      damageSeverity: combinedAnalysis.genelDeğerlendirme.hasarSeviyesi,
      totalDamages,
      criticalDamages,
      estimatedRepairCost: combinedAnalysis.genelDeğerlendirme.toplamOnarımMaliyeti,
      analysisResults,
      summary: {
        totalDamages,
        criticalDamages,
        estimatedRepairCost: combinedAnalysis.genelDeğerlendirme.toplamOnarımMaliyeti,
        insuranceImpact: combinedAnalysis.genelDeğerlendirme.sigortaDurumu,
        strengths: combinedAnalysis.genelDeğerlendirme.güçlüYönler,
        weaknesses: combinedAnalysis.genelDeğerlendirme.zayıfYönler,
        recommendations: combinedAnalysis.genelDeğerlendirme.öneriler,
        safetyConcerns: combinedAnalysis.genelDeğerlendirme.güvenlikEndişeleri,
        marketValueImpact: combinedAnalysis.genelDeğerlendirme.değerKaybı
      },
      technicalDetails: {
        analysisMethod: 'OpenAI Vision API Analizi',
        aiModel: combinedAnalysis.model,
        confidence: combinedAnalysis.güven,
        processingTime: '3-5 saniye',
        imageQuality: 'Yüksek (1024x1024)',
        imagesAnalyzed: imageCount
      }
    };
  }

  /**
   * AI Sonuçlarını Birleştirir
   * 
   * Birden fazla resimden gelen AI analiz sonuçlarını birleştirerek
   * tek bir kapsamlı analiz raporu oluşturur.
   * 
   * @param analysisResults - Her resmin analiz sonuçları
   * @returns Birleştirilmiş AI analiz sonucu
   * 
   * @private
   */
  private combineAIResults(analysisResults: any[]): any {
    if (!analysisResults || analysisResults.length === 0) {
      console.error('[AI] combineAIResults: analysisResults boş - AI verisi gelmedi');
      throw new Error('AI analiz sonucu alınamadı. Analiz sonuçları boş geldi.');
    }

    // İlk resmin AI sonucunu al (damageResult root seviyesinde tüm field'ları içeriyor)
    const firstResult = analysisResults[0];
    
    // Debug logging
    console.log('[AI] combineAIResults - First result:', {
      hasDamageResult: !!firstResult.damageResult,
      hasDamageAreas: !!firstResult.damageAreas,
      damageResultKeys: firstResult.damageResult ? Object.keys(firstResult.damageResult) : [],
      hasGenelDeğerlendirme: !!(firstResult.damageResult?.genelDeğerlendirme),
      hasarAlanlarıLength: firstResult.damageResult?.hasarAlanları?.length || 0
    });
    
    // damageResult direkt DamageDetectionResult formatında
    // Root seviyesinde: genelDeğerlendirme, teknikAnaliz, güvenlikDeğerlendirmesi, onarımTahmini, hasarAlanları vb.
    const firstDamageResult = firstResult.damageResult;
    
    if (!firstDamageResult) {
      console.error('[AI] combineAIResults: damageResult yok - AI verisi gelmedi');
      throw new Error('AI analiz sonucu alınamadı. Hasar tespit sonucu boş geldi.');
    }
    
    // ZORUNLU ALAN KONTROLÜ: genelDeğerlendirme ve hasarAlanları olmalı
    if (!firstDamageResult.genelDeğerlendirme) {
      console.error('[AI] combineAIResults: genelDeğerlendirme bulunamadı - AI verisi eksik');
      throw new Error('AI analiz sonucu eksik. Genel değerlendirme bilgisi alınamadı.');
    }

    // hasarAlanları kontrolü (boş array olabilir ama array olmalı)
    if (!Array.isArray(firstDamageResult.hasarAlanları)) {
      console.error('[AI] combineAIResults: hasarAlanları array değil - AI verisi eksik');
      throw new Error('AI analiz sonucu eksik. Hasar alanları bilgisi alınamadı.');
    }
    
    // AI'dan gelen detaylı analiz mevcut - veriyi birleştir
    // Tüm resimlerden hasar alanlarını birleştir
    const allHasarAlanları = analysisResults.flatMap(r => {
      // damageResult içinden hasarAlanları al, yoksa fallback olarak damageAreas kullan
      return r.damageResult?.hasarAlanları || r.damageAreas || [];
    });
    
    console.log('[AI] combineAIResults - Birleştirilmiş sonuç:', {
      totalHasarAlanları: allHasarAlanları.length,
      hasGenelDeğerlendirme: !!firstDamageResult.genelDeğerlendirme,
      hasTeknikAnaliz: !!firstDamageResult.teknikAnaliz,
      hasGüvenlikDeğerlendirmesi: !!firstDamageResult.güvenlikDeğerlendirmesi,
      hasOnarımTahmini: !!firstDamageResult.onarımTahmini
    });
    
    return {
      hasarAlanları: allHasarAlanları,
      genelDeğerlendirme: firstDamageResult.genelDeğerlendirme,
      teknikAnaliz: firstDamageResult.teknikAnaliz,
      güvenlikDeğerlendirmesi: firstDamageResult.güvenlikDeğerlendirmesi,
      onarımTahmini: firstDamageResult.onarımTahmini,
      aiSağlayıcı: (() => {
        if (!firstDamageResult.aiSağlayıcı) {
          throw new Error('AI analiz sonucu eksik. AI sağlayıcı bilgisi alınamadı.');
        }
        return firstDamageResult.aiSağlayıcı;
      })(),
      model: (() => {
        if (!firstDamageResult.model) {
          throw new Error('AI analiz sonucu eksik. AI model bilgisi alınamadı.');
        }
        return firstDamageResult.model;
      })(),
      güven: (() => {
        if (firstDamageResult.güven === undefined || firstDamageResult.güven === null) {
          throw new Error('AI analiz sonucu eksik. Güven seviyesi bilgisi alınamadı.');
        }
        return firstDamageResult.güven;
      })(),
      analizZamanı: (() => {
        if (!firstDamageResult.analizZamanı) {
          throw new Error('AI analiz sonucu eksik. Analiz zamanı bilgisi alınamadı.');
        }
        return firstDamageResult.analizZamanı;
      })()
    };
  }

  /**
   * Genel Puan Hesaplar
   * 
   * AI'dan gelen genel değerlendirmeye göre puan hesaplar.
   * 
   * @param genelDeğerlendirme - AI'dan gelen genel değerlendirme
   * @returns Hesaplanmış puan (0-100)
   * 
   * @private
   */
  private calculateOverallScore(genelDeğerlendirme: any): number {
    if (!genelDeğerlendirme) return 50;

    // Hasar seviyesine göre puan hesapla
    const hasarSeviyesi = genelDeğerlendirme.hasarSeviyesi;
    switch (hasarSeviyesi) {
      case 'mükemmel':
      case 'çok iyi':
        return 95;
      case 'iyi':
        return 85;
      case 'orta':
        return 70;
      case 'kötü':
        return 45;
      case 'çok kötü':
      case 'kritik':
        return 20;
      default:
        return 50;
    }
  }

  /**
   * Hasar Skoru Hesaplar
   * 
   * Her hasarın şiddetine göre skor toplar.
   * 
   * Skor Tablosu:
   * - high: 30 puan
   * - medium: 20 puan
   * - low: 10 puan
   * 
   * @param damageAreas - Hasar alanları
   * @returns Toplam hasar skoru
   * 
   * @private
   */
  private calculateDamageScore(damageAreas: any[]): number {
    return damageAreas.reduce((sum, damage) => 
      sum + (damage.severity === 'high' ? 30 : damage.severity === 'medium' ? 20 : 10), 0
    );
  }

  /**
   * Hasar Şiddeti Belirler
   * 
   * Genel puana göre hasar şiddet kategorisi döner.
   * 
   * Kategoriler:
   * - low: >= 90 puan (Az hasarlı)
   * - medium: >= 70 puan (Orta hasarlı)
   * - high: >= 40 puan (Yüksek hasarlı)
   * - critical: < 40 puan (Kritik hasarlı)
   * 
   * @param score - Genel puan (0-100)
   * @returns Hasar şiddeti
   * 
   * @private
   */
  private calculateDamageSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 90) return 'low';
    if (score >= 70) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  /**
   * Onarım Maliyeti Hesaplar
   * 
   * Her hasarın türüne, şiddetine ve etkilenen parçalarına göre
   * toplam onarım maliyetini tahmin eder.
   * 
   * Temel Maliyet Tablosu (Türkiye 2025):
   * - scratch: 800 TL
   * - dent: 2.500 TL
   * - rust: 1.200 TL
   * - oxidation: 600 TL
   * - crack: 3.000 TL
   * - break: 4.000 TL
   * - paint_damage: 1.000 TL
   * - structural: 5.000 TL
   * - mechanical: 3.500 TL
   * - electrical: 2.000 TL
   * 
   * Çarpanlar:
   * - Şiddet (high: x2.5, medium: x1.8, low: x1.2)
   * - Etkilenen parça sayısı (her parça +%30)
   * - İşçilik (+%30)
   * 
   * @param damages - Hasar listesi
   * @returns Toplam tahmini onarım maliyeti (TL)
   * 
   * @private
   */
  private calculateRepairCost(damages: any[]): number {
    const baseCosts: Record<string, number> = {
      'scratch': 800,
      'dent': 2500,
      'rust': 1200,
      'oxidation': 600,
      'crack': 3000,
      'break': 4000,
      'paint_damage': 1000,
      'structural': 5000,
      'mechanical': 3500,
      'electrical': 2000
    };

    const totalCost = damages.reduce((sum, damage) => {
      const baseCost = baseCosts[damage.type] || 1000;
      const severityMultiplier = damage.severity === 'high' ? 2.5 : 
                                damage.severity === 'medium' ? 1.8 : 1.2;
      const partsMultiplier = damage.partsAffected ? 
        Math.max(1, damage.partsAffected.length * 0.3) : 1;
      
      return sum + Math.round(baseCost * severityMultiplier * partsMultiplier);
    }, 0);

    // İşçilik maliyeti ekle (%30)
    return Math.round(totalCost * 1.3);
  }

  /**
   * Sigorta Durumu Hesaplar
   * 
   * Puan, toplam hasar ve kritik hasar sayısına göre
   * sigorta kapsam durumunu değerlendirir.
   * 
   * Kapsam Kriterleri:
   * - "Kapsam içinde": >= 85 puan ve 0 kritik hasar
   * - "Kısmen kapsam içinde": >= 70 puan ve <= 1 kritik hasar
   * - "Değerlendirilecek": >= 50 puan ve <= 2 kritik hasar
   * - "Kapsam dışı olabilir": >= 30 puan
   * - "Kapsam dışı": < 30 puan
   * 
   * @param score - Genel puan (0-100)
   * @param total - Toplam hasar sayısı
   * @param critical - Kritik hasar sayısı
   * @returns Sigorta durumu metni
   * 
   * @private
   */
  private calculateInsuranceStatus(score: number, total: number, critical: number): string {
    if (score >= 85 && critical === 0) return 'Kapsam içinde';
    if (score >= 70 && critical <= 1) return 'Kısmen kapsam içinde';
    if (score >= 50 && critical <= 2) return 'Değerlendirilecek';
    if (score >= 30) return 'Kapsam dışı olabilir';
    return 'Kapsam dışı';
  }

  /**
   * Güçlü Yönler Oluşturur
   * 
   * Aracın pozitif özelliklerini vurgulayan mesajlar üretir.
   * 
   * Senaryolar:
   * - 0 hasar: Mükemmel durum mesajları
   * - 1-2 hasar: İyi durum mesajları
   * - Kritik hasar yok: Güvenli kullanım mesajı
   * - Pas yok: Paslanma tespit edilmedi mesajı
   * 
   * @param allDamages - Tüm hasarlar
   * @param totalDamages - Toplam hasar sayısı
   * @returns Güçlü yönler listesi
   * 
   * @private
   */
  private generateStrengths(allDamages: any[], totalDamages: number): string[] {
    const strengths = [];
    
    if (totalDamages === 0) {
      strengths.push('🎉 Araç tamamen hasarsız durumda - Mükemmel bakım');
      strengths.push('✨ Tüm kaporta parçaları orijinal ve sağlam');
      strengths.push('💎 Boya kalitesi fabrika çıkışı gibi');
    } else if (totalDamages <= 2) {
      strengths.push('👍 Genel durum çok iyi - Sadece kozmetik hasarlar');
      strengths.push('✅ Yapısal bütünlük tam korunmuş');
    }
    
    const hasCritical = allDamages.some(d => d.severity === 'critical' || d.severity === 'high');
    if (!hasCritical) {
      strengths.push('✅ Kritik seviye hasar yok - Güvenli kullanım');
    }
    
    const hasRust = allDamages.some(d => d.type === 'rust');
    if (!hasRust) {
      strengths.push('🔒 Paslanma/korozyon tespit edilmedi');
    }
    
    return strengths.length > 0 ? strengths : ['Araç genel olarak kullanılabilir durumda'];
  }

  /**
   * Zayıf Yönler Oluşturur
   * 
   * Aracın negatif özelliklerini vurgulayan uyarı mesajları üretir.
   * 
   * Senaryolar:
   * - >10 hasar: Çok sayıda hasar uyarısı
   * - >5 hasar: Orta-yüksek hasar yoğunluğu uyarısı
   * - Kritik hasar var: Kritik hasar sayısı ve aciliyet uyarısı
   * - Pas var: Paslanma ve korozyon uyarısı
   * 
   * @param allDamages - Tüm hasarlar
   * @param totalDamages - Toplam hasar sayısı
   * @returns Zayıf yönler listesi
   * 
   * @private
   */
  private generateWeaknesses(allDamages: any[], totalDamages: number): string[] {
    const weaknesses = [];
    
    if (totalDamages > 10) {
      weaknesses.push('🚨 ÇOK SAYIDA HASAR - Kapsamlı onarım gerekli');
    } else if (totalDamages > 5) {
      weaknesses.push('⚠️ Orta-yüksek hasar yoğunluğu mevcut');
    }
    
    const criticalDamages = allDamages.filter(d => d.severity === 'critical' || d.severity === 'high');
    if (criticalDamages.length > 0) {
      weaknesses.push(`🚨 ${criticalDamages.length} adet KRİTİK HASAR - Acil müdahale gerekli`);
    }
    
    const hasRust = allDamages.some(d => d.type === 'rust');
    if (hasRust) {
      weaknesses.push('🦠 PASLANMA TESPİT EDİLDİ - Korozyon ilerliyor');
    }
    
    return weaknesses;
  }

  /**
   * Öneriler Oluşturur
   * 
   * Hasar şiddetine göre öneri mesajları üretir.
   * 
   * Öneri Seviyeleri:
   * - critical: Acil - Aracı kullanmayın uyarısı
   * - high: En kısa sürede servise götürün
   * - medium: Yakın zamanda onarım planlayın
   * - low: Düzenli bakım yaptırın
   * 
   * Ek Öneriler:
   * - Pas varsa: Acil paslanma tedavisi önerisi
   * 
   * @param allDamages - Tüm hasarlar
   * @param damageSeverity - Hasar şiddeti (low/medium/high/critical)
   * @returns Öneri listesi
   * 
   * @private
   */
  private generateRecommendations(allDamages: any[], damageSeverity: string): string[] {
    const recommendations = [];
    
    if (damageSeverity === 'critical') {
      recommendations.push('🚨 ACİL: Aracı kullanmayın, derhal servise götürün');
    } else if (damageSeverity === 'high') {
      recommendations.push('⚠️ En kısa sürede yetkili servise götürün');
    } else if (damageSeverity === 'medium') {
      recommendations.push('🔶 Yakın zamanda onarım planlayın');
    } else {
      recommendations.push('✅ Düzenli bakım yaptırın');
    }
    
    const hasRust = allDamages.some(d => d.type === 'rust');
    if (hasRust) {
      recommendations.push('🦠 Paslanma tedavisi acil - Yayılmadan önce müdahale edin');
    }
    
    return recommendations;
  }

  /**
   * Güvenlik Endişeleri Oluşturur
   * 
   * Güvenliği tehdit eden hasarları vurgulayan uyarı mesajları üretir.
   * 
   * Kontroller:
   * - Kritik hasar sayısı (high veya critical)
   * - Yapısal hasar varlığı (structural, crack, break)
   * 
   * @param allDamages - Tüm hasarlar
   * @returns Güvenlik endişeleri listesi
   * 
   * @private
   */
  private generateSafetyConcerns(allDamages: any[]): string[] {
    const concerns = [];
    
    const criticalDamages = allDamages.filter(d => d.severity === 'critical' || d.severity === 'high');
    if (criticalDamages.length > 0) {
      concerns.push(`🚨 ${criticalDamages.length} adet kritik hasar - Güvenlik riski yüksek`);
    }
    
    const structuralDamages = allDamages.filter(d => 
      d.type === 'structural' || d.type === 'crack' || d.type === 'break'
    );
    if (structuralDamages.length > 0) {
      concerns.push('⚠️ Yapısal bütünlük etkilenmiş - Kaza riski var');
    }
    
    return concerns;
  }

  /**
   * Piyasa Değeri Etkisi Hesaplar
   * 
   * Genel puan ve hasar sayısına göre aracın piyasa değerindeki
   * tahmini düşüş yüzdesini hesaplar.
   * 
   * Etki Tablosu:
   * - >= 90 puan: %2 düşüş
   * - >= 80 puan: %5 düşüş
   * - >= 70 puan: %8 düşüş
   * - >= 60 puan: %12 düşüş
   * - >= 50 puan: %18 düşüş
   * - < 50 puan: %25 düşüş
   * 
   * Ek Etki (Hasar Sayısı):
   * - >15 hasar: +%8
   * - >10 hasar: +%5
   * - >5 hasar: +%3
   * 
   * Maksimum etki: %35
   * 
   * @param score - Genel puan (0-100)
   * @param allDamages - Tüm hasarlar
   * @returns Piyasa değeri düşüş yüzdesi (0-35)
   * 
   * @private
   */
  private calculateMarketValueImpact(score: number, allDamages: any[]): number {
    let baseImpact = 0;
    
    if (score >= 90) baseImpact = 2;
    else if (score >= 80) baseImpact = 5;
    else if (score >= 70) baseImpact = 8;
    else if (score >= 60) baseImpact = 12;
    else if (score >= 50) baseImpact = 18;
    else baseImpact = 25;
    
    const totalDamages = allDamages.length;
    if (totalDamages > 15) baseImpact += 8;
    else if (totalDamages > 10) baseImpact += 5;
    else if (totalDamages > 5) baseImpact += 3;
    
    return Math.min(baseImpact, 35);
  }
}

// Singleton export
export const damageAnalysisService = new DamageAnalysisService();

