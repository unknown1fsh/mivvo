/**
 * PDF Report Service
 * 
 * Raporları PDF formatında oluşturur.
 * AI verileri eksik olsa bile çalışır, tüm rapor tiplerini destekler.
 */

import PDFDocument from 'pdfkit';
import { getPrismaClient } from '../utils/prisma';
import { logError, logInfo, logDebug } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

const prisma = getPrismaClient();

/**
 * PDF Rapor Oluştur
 */
export interface PDFReportOptions {
  reportId: number;
  userId: number;
  includeImages?: boolean;
  includeCharts?: boolean;
}

/**
 * Ana PDF oluşturma fonksiyonu
 */
export async function generatePDFReport(options: PDFReportOptions): Promise<Buffer> {
  const { reportId, userId, includeImages = true, includeCharts = true } = options;

  try {
    logInfo('PDF rapor oluşturuluyor', { reportId, userId });

    // Raporu getir
    const report = await prisma.vehicleReport.findFirst({
      where: {
        id: reportId,
        userId,
      },
      include: {
        vehicleImages: true,
        aiAnalysisResults: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      throw new Error('Rapor bulunamadı');
    }

    logDebug('Rapor bulundu', {
      reportId: report.id,
      reportType: report.reportType,
      status: report.status,
      hasAiAnalysisData: !!report.aiAnalysisData,
      imageCount: report.vehicleImages?.length || 0,
    });

    // PDF dokümanı oluştur
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // AI verilerini parse et
    let aiAnalysisData: any = null;
    try {
      if (report.aiAnalysisData) {
        // Eğer string ise parse et, değilse direkt kullan
        if (typeof report.aiAnalysisData === 'string') {
          aiAnalysisData = JSON.parse(report.aiAnalysisData);
        } else {
          aiAnalysisData = report.aiAnalysisData;
        }
        logDebug('AI verileri parse edildi', {
          hasData: !!aiAnalysisData,
          dataKeys: aiAnalysisData ? Object.keys(aiAnalysisData) : [],
        });
      } else {
        logDebug('AI verileri bulunamadı, PDF yine de oluşturulacak');
      }
    } catch (parseError) {
      logError('AI verileri parse edilemedi', parseError);
      // Parse hatası olsa bile devam et
    }

    // PDF içeriği oluştur
    await generatePDFContent(doc, report, aiAnalysisData, { includeImages, includeCharts });

    // PDF'i bitir
    doc.end();

    // Buffer'ı bekle
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        logInfo('PDF rapor oluşturuldu', { reportId, size: pdfBuffer.length });
        resolve(pdfBuffer);
      });

      doc.on('error', (error: Error) => {
        logError('PDF oluşturma hatası', error);
        reject(error);
      });
    });
  } catch (error) {
    logError('PDF rapor oluşturma hatası', error);
    throw error;
  }
}

/**
 * PDF içeriği oluştur
 */
async function generatePDFContent(
  doc: InstanceType<typeof PDFDocument>,
  report: any,
  aiAnalysisData: any,
  options: { includeImages: boolean; includeCharts: boolean }
): Promise<void> {
  const { includeImages, includeCharts } = options;
  const reportType = report.reportType || 'UNKNOWN';

  // Başlık
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('Mivvo Expertiz Raporu', { align: 'center' });
  
  doc.moveDown(0.5);
  
  // Alt başlık
  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#6b7280')
     .text(getReportTypeName(reportType), { align: 'center' });
  
  doc.moveDown(1);

  // Tarih ve Rapor ID
  doc.fontSize(10)
     .fillColor('#000000')
     .text(`Rapor Tarihi: ${new Date(report.createdAt).toLocaleDateString('tr-TR', {
       year: 'numeric',
       month: 'long',
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit'
     })}`, { align: 'right' });
  
  doc.text(`Rapor ID: ${report.id}`, { align: 'right' });
  doc.moveDown(2);

  // Araç Bilgileri Bölümü
  addVehicleInfoSection(doc, report);
  doc.moveDown(1);

  // AI Analiz Sonuçları Bölümü
  if (aiAnalysisData && Object.keys(aiAnalysisData).length > 0) {
    addAnalysisResultsSection(doc, reportType, aiAnalysisData);
    doc.moveDown(1);
  } else {
    // AI verileri yoksa bilgilendirme mesajı
    addNoAnalysisDataSection(doc);
    doc.moveDown(1);
  }

  // Uzman Notları
  if (report.expertNotes) {
    addExpertNotesSection(doc, report.expertNotes);
    doc.moveDown(1);
  }

  // Görseller (opsiyonel)
  if (includeImages && report.vehicleImages && report.vehicleImages.length > 0) {
    await addImagesSection(doc, report.vehicleImages);
  }

  // Footer
  addFooter(doc, report);
}

/**
 * Araç Bilgileri Bölümü
 */
function addVehicleInfoSection(doc: InstanceType<typeof PDFDocument>, report: any): void {
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('Araç Bilgileri', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#000000');

  const vehicleInfo = [
    { label: 'Marka', value: report.vehicleBrand || 'Belirtilmemiş' },
    { label: 'Model', value: report.vehicleModel || 'Belirtilmemiş' },
    { label: 'Yıl', value: report.vehicleYear ? report.vehicleYear.toString() : 'Belirtilmemiş' },
    { label: 'Plaka', value: report.vehiclePlate || 'Belirtilmemiş' },
  ];

  if (report.mileage) {
    vehicleInfo.push({ label: 'Kilometre', value: `${report.mileage.toLocaleString('tr-TR')} km` });
  }

  if (report.vehicleColor) {
    vehicleInfo.push({ label: 'Renk', value: report.vehicleColor });
  }

  if (report.fuelType) {
    vehicleInfo.push({ label: 'Yakıt Tipi', value: report.fuelType });
  }

  if (report.transmission) {
    vehicleInfo.push({ label: 'Vites', value: report.transmission });
  }

  vehicleInfo.forEach((info) => {
    doc.text(`${info.label}: ${info.value}`);
  });
}

/**
 * Analiz Sonuçları Bölümü - Rapor tipine göre
 */
function addAnalysisResultsSection(
  doc: InstanceType<typeof PDFDocument>,
  reportType: string,
  aiAnalysisData: any
): void {
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('Analiz Sonuçları', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#000000');

  // Rapor tipine göre içerik oluştur
  switch (reportType) {
    case 'DAMAGE_ASSESSMENT':
    case 'DAMAGE_DETECTION':
    case 'DAMAGE_ANALYSIS':
      addDamageAnalysisContent(doc, aiAnalysisData);
      break;
    
    case 'PAINT_ANALYSIS':
      addPaintAnalysisContent(doc, aiAnalysisData);
      break;
    
    case 'ENGINE_SOUND_ANALYSIS':
    case 'AUDIO_ANALYSIS':
      addAudioAnalysisContent(doc, aiAnalysisData);
      break;
    
    case 'VALUE_ESTIMATION':
      addValueEstimationContent(doc, aiAnalysisData);
      break;
    
    case 'COMPREHENSIVE_EXPERTISE':
    case 'FULL_REPORT':
      addComprehensiveAnalysisContent(doc, aiAnalysisData);
      break;
    
    default:
      addGenericAnalysisContent(doc, aiAnalysisData);
  }
}

/**
 * Hasar Analizi İçeriği
 */
function addDamageAnalysisContent(doc: InstanceType<typeof PDFDocument>, data: any): void {
  // Genel puan
  const overallScore = data.overallScore || 
                      data.genelDeğerlendirme?.satışDeğeri || 
                      data.genelDeğerlendirme?.genelPuan || 0;
  
  if (overallScore > 0) {
    doc.font('Helvetica-Bold').text(`Genel Puan: ${overallScore}/100`);
    doc.font('Helvetica');
    doc.moveDown(0.5);
  }

  // Hasar alanları
  const hasarAlanları = data.hasarAlanları || data.damageAreas || [];
  if (hasarAlanları.length > 0) {
    doc.font('Helvetica-Bold').text(`Tespit Edilen Hasar Sayısı: ${hasarAlanları.length}`);
    doc.font('Helvetica');
    doc.moveDown(0.5);

    hasarAlanları.slice(0, 10).forEach((hasar: any, index: number) => {
      const konum = hasar.konum || hasar.location || hasar.bölge || 'Belirtilmemiş';
      const şiddet = hasar.şiddet || hasar.severity || hasar.derece || 'Bilinmiyor';
      const maliyet = hasar.tahminiMaliyet || hasar.estimatedCost || 0;
      
      doc.text(`${index + 1}. ${konum} - Şiddet: ${şiddet}${maliyet > 0 ? ` (Tahmini Maliyet: ${maliyet.toLocaleString('tr-TR')} ₺)` : ''}`);
    });

    if (hasarAlanları.length > 10) {
      doc.text(`... ve ${hasarAlanları.length - 10} hasar daha`);
    }
    doc.moveDown(0.5);
  }

  // Hasar şiddeti
  const damageSeverity = data.damageSeverity || 
                         data.genelDeğerlendirme?.hasarŞiddeti || 
                         data.hasarŞiddeti || null;
  
  if (damageSeverity) {
    doc.text(`Hasar Şiddeti: ${damageSeverity}`);
    doc.moveDown(0.5);
  }

  // Toplam tahmini maliyet
  const totalCost = data.estimatedRepairCost || 
                   data.tahminiOnarımMaliyeti || 
                   data.genelDeğerlendirme?.tahminiMaliyet || 0;
  
  if (totalCost > 0) {
    doc.font('Helvetica-Bold')
       .fillColor('#dc2626')
       .text(`Toplam Tahmini Onarım Maliyeti: ${totalCost.toLocaleString('tr-TR')} ₺`);
    doc.font('Helvetica')
       .fillColor('#000000');
    doc.moveDown(0.5);
  }

  // Öneriler
  const recommendations = data.recommendations || 
                          data.öneriler || 
                          data.genelDeğerlendirme?.öneriler || [];
  
  if (Array.isArray(recommendations) && recommendations.length > 0) {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Öneriler:');
    doc.font('Helvetica');
    doc.moveDown(0.3);
    recommendations.slice(0, 5).forEach((rec: string, index: number) => {
      doc.text(`${index + 1}. ${rec}`, { indent: 10 });
    });
  }
}

/**
 * Boya Analizi İçeriği
 */
function addPaintAnalysisContent(doc: InstanceType<typeof PDFDocument>, data: any): void {
  // Genel puan
  const overallScore = data.overallScore || 
                      data.boyaKalitesi?.genelPuan || 
                      data.boyaDurumu?.genelPuan || 0;
  
  if (overallScore > 0) {
    doc.font('Helvetica-Bold').text(`Genel Puan: ${overallScore}/100`);
    doc.font('Helvetica');
    doc.moveDown(0.5);
  }

  // Boya durumu
  const boyaDurumu = data.boyaDurumu || data.paintCondition || {};
  if (boyaDurumu.durum || boyaDurumu.condition) {
    doc.text(`Boya Durumu: ${boyaDurumu.durum || boyaDurumu.condition}`);
    doc.moveDown(0.5);
  }

  // Boya kalınlığı
  const boyaKalınlığı = data.boyaKalitesi?.ortalamaKalınlık || 
                        data.technicalDetails?.totalThickness || 
                        data.boyaKalınlığı || 0;
  
  if (boyaKalınlığı > 0) {
    doc.text(`Ortalama Boya Kalınlığı: ${boyaKalınlığı} mikron`);
    doc.moveDown(0.5);
  }

  // Renk analizi
  const renkAnalizi = data.renkAnalizi || data.colorAnalysis || {};
  if (renkAnalizi.anaRenk || renkAnalizi.primaryColor) {
    doc.text(`Ana Renk: ${renkAnalizi.anaRenk || renkAnalizi.primaryColor}`);
    doc.moveDown(0.5);
  }

  // Yüzey analizi
  const yüzeyAnalizi = data.yüzeyAnalizi || data.surfaceAnalysis || {};
  if (yüzeyAnalizi.durum || yüzeyAnalizi.condition) {
    doc.text(`Yüzey Durumu: ${yüzeyAnalizi.durum || yüzeyAnalizi.condition}`);
    doc.moveDown(0.5);
  }

  // Öneriler
  const recommendations = data.recommendations || data.öneriler || [];
  if (Array.isArray(recommendations) && recommendations.length > 0) {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Öneriler:');
    doc.font('Helvetica');
    doc.moveDown(0.3);
    recommendations.slice(0, 5).forEach((rec: string, index: number) => {
      doc.text(`${index + 1}. ${rec}`, { indent: 10 });
    });
  }
}

/**
 * Ses Analizi İçeriği
 */
function addAudioAnalysisContent(doc: InstanceType<typeof PDFDocument>, data: any): void {
  // Genel puan
  const overallScore = data.overallScore || 0;
  if (overallScore > 0) {
    doc.font('Helvetica-Bold').text(`Genel Puan: ${overallScore}/100`);
    doc.font('Helvetica');
    doc.moveDown(0.5);
  }

  // RPM analizi
  const rpmAnalysis = data.rpmAnalysis || {};
  if (rpmAnalysis.idleRpm) {
    doc.text(`Rölanti RPM: ${rpmAnalysis.idleRpm}`);
    doc.moveDown(0.5);
  }

  // Motor sağlığı
  const engineHealth = data.engineHealth || data.motorSağlığı || 'Bilinmiyor';
  doc.text(`Motor Sağlığı: ${engineHealth}`);
  doc.moveDown(0.5);

  // Tespit edilen sorunlar
  const detectedIssues = data.detectedIssues || data.tespitEdilenSorunlar || [];
  if (Array.isArray(detectedIssues) && detectedIssues.length > 0) {
    doc.font('Helvetica-Bold').text(`Tespit Edilen Sorunlar (${detectedIssues.length}):`);
    doc.font('Helvetica');
    doc.moveDown(0.3);
    detectedIssues.slice(0, 5).forEach((issue: any, index: number) => {
      const issueText = typeof issue === 'string' ? issue : (issue.sorun || issue.issue || 'Bilinmeyen sorun');
      doc.text(`${index + 1}. ${issueText}`, { indent: 10 });
    });
    doc.moveDown(0.5);
  }

  // Öneriler
  const recommendations = data.recommendations || data.öneriler || [];
  if (Array.isArray(recommendations) && recommendations.length > 0) {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Öneriler:');
    doc.font('Helvetica');
    doc.moveDown(0.3);
    recommendations.slice(0, 5).forEach((rec: string, index: number) => {
      doc.text(`${index + 1}. ${rec}`, { indent: 10 });
    });
  }
}

/**
 * Değer Tahmini İçeriği
 */
function addValueEstimationContent(doc: InstanceType<typeof PDFDocument>, data: any): void {
  // Tahmini değer
  const estimatedValue = data.estimatedValue || 
                        data.tahminiDeğer || 
                        data.marketValue?.estimatedValue || 0;
  
  if (estimatedValue > 0) {
    doc.font('Helvetica-Bold')
       .fontSize(16)
       .fillColor('#059669')
       .text(`Tahmini Piyasa Değeri: ${estimatedValue.toLocaleString('tr-TR')} ₺`);
    doc.font('Helvetica')
       .fontSize(12)
       .fillColor('#000000');
    doc.moveDown(0.5);
  }

  // Piyasa analizi
  const marketAnalysis = data.marketAnalysis || data.piyasaAnalizi || {};
  if (marketAnalysis.priceRange) {
    const range = marketAnalysis.priceRange;
    doc.text(`Piyasa Aralığı: ${(range.min || 0).toLocaleString('tr-TR')} ₺ - ${(range.max || 0).toLocaleString('tr-TR')} ₺`);
    doc.moveDown(0.5);
  }

  // Değer kaybı
  const depreciation = data.depreciation || 
                      data.vehicleCondition?.depreciation || 
                      data.değerKaybı || 0;
  
  if (depreciation > 0) {
    doc.text(`Değer Kaybı: %${depreciation}`);
    doc.moveDown(0.5);
  }

  // Piyasa durumu
  const marketPosition = data.marketPosition || data.piyasaDurumu || {};
  if (marketPosition.priceComparison || marketPosition.durum) {
    doc.text(`Piyasa Durumu: ${marketPosition.priceComparison || marketPosition.durum}`);
    doc.moveDown(0.5);
  }
}

/**
 * Kapsamlı Ekspertiz İçeriği
 */
function addComprehensiveAnalysisContent(doc: InstanceType<typeof PDFDocument>, data: any): void {
  // Genel puan
  const overallScore = data.overallScore || 0;
  if (overallScore > 0) {
    doc.font('Helvetica-Bold')
       .fontSize(16)
       .text(`Genel Puan: ${overallScore}/100`);
    doc.font('Helvetica')
       .fontSize(12);
    doc.moveDown(0.5);
  }

  // Ekspertiz notu
  const expertiseGrade = data.expertiseGrade || data.ekspertizNotu || null;
  if (expertiseGrade) {
    doc.text(`Ekspertiz Notu: ${expertiseGrade}`);
    doc.moveDown(0.5);
  }

  // Özet
  const summary = data.comprehensiveSummary || 
                  data.kapsamlıÖzet || 
                  data.summary || null;
  
  if (summary) {
    doc.font('Helvetica-Bold').text('Özet:');
    doc.font('Helvetica');
    doc.moveDown(0.3);
    doc.text(summary, { indent: 10 });
    doc.moveDown(0.5);
  }

  // Güçlü yönler
  const strengths = data.strengths || data.güçlüYönler || [];
  if (Array.isArray(strengths) && strengths.length > 0) {
    doc.font('Helvetica-Bold').text('Güçlü Yönler:');
    doc.font('Helvetica');
    doc.moveDown(0.3);
    strengths.slice(0, 5).forEach((strength: string, index: number) => {
      doc.text(`${index + 1}. ${strength}`, { indent: 10 });
    });
    doc.moveDown(0.5);
  }

  // Zayıf yönler
  const weaknesses = data.weaknesses || data.zayıfYönler || [];
  if (Array.isArray(weaknesses) && weaknesses.length > 0) {
    doc.font('Helvetica-Bold').text('Zayıf Yönler:');
    doc.font('Helvetica');
    doc.moveDown(0.3);
    weaknesses.slice(0, 5).forEach((weakness: string, index: number) => {
      doc.text(`${index + 1}. ${weakness}`, { indent: 10 });
    });
    doc.moveDown(0.5);
  }

  // Öneriler
  const recommendations = data.recommendations || data.öneriler || [];
  if (Array.isArray(recommendations) && recommendations.length > 0) {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Öneriler:');
    doc.font('Helvetica');
    doc.moveDown(0.3);
    recommendations.slice(0, 5).forEach((rec: string, index: number) => {
      doc.text(`${index + 1}. ${rec}`, { indent: 10 });
    });
  }
}

/**
 * Genel Analiz İçeriği (bilinmeyen rapor tipleri için)
 */
function addGenericAnalysisContent(doc: InstanceType<typeof PDFDocument>, data: any): void {
  // Genel puan
  if (data.overallScore !== undefined) {
    doc.font('Helvetica-Bold').text(`Genel Puan: ${data.overallScore}/100`);
    doc.font('Helvetica');
    doc.moveDown(0.5);
  }

  // Tüm anahtar-değer çiftlerini göster
  Object.keys(data).slice(0, 10).forEach((key) => {
    if (key !== 'overallScore' && typeof data[key] !== 'object') {
      doc.text(`${key}: ${data[key]}`);
    }
  });
}

/**
 * AI Verileri Yoksa Bilgilendirme Bölümü
 */
function addNoAnalysisDataSection(doc: InstanceType<typeof PDFDocument>): void {
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#dc2626')
     .text('AI Analizi Durumu', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#000000')
     .text('AI analizi henüz tamamlanmamış veya veri alınamamıştır.', { indent: 10 });
  
  doc.moveDown(0.3);
  doc.text('Bu rapor yalnızca temel araç bilgilerini içermektedir.', { indent: 10 });
  
  doc.moveDown(0.3);
  doc.text('Detaylı analiz sonuçları için lütfen daha sonra tekrar deneyin.', { indent: 10 });
}

/**
 * Uzman Notları Bölümü
 */
function addExpertNotesSection(doc: InstanceType<typeof PDFDocument>, notes: string): void {
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('Uzman Notları', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(11)
     .font('Helvetica')
     .fillColor('#000000')
     .text(notes, { indent: 10 });
}

/**
 * Görseller Bölümü
 */
async function addImagesSection(
  doc: InstanceType<typeof PDFDocument>,
  images: any[]
): Promise<void> {
  if (!images || images.length === 0) {
    return;
  }

  doc.addPage();
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('Görseller', { underline: true });
  
  doc.moveDown(1);

  let imagesAdded = 0;
  const maxImages = 5; // PDF boyutunu kontrol etmek için maksimum görsel sayısı

  for (const image of images.slice(0, maxImages)) {
    try {
      const imagePath = image.imageUrl || image.imagePath || image.path;
      if (!imagePath) continue;

      // Dosya yolunu kontrol et
      let fullPath: string;
      if (fs.existsSync(imagePath)) {
        fullPath = imagePath;
      } else if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        // URL ise atla (PDFKit URL'den direkt yükleyemez)
        logDebug('URL görsel atlandı', { imagePath });
        continue;
      } else {
        // Göreceli yol olabilir
        fullPath = path.join(process.cwd(), 'uploads', imagePath);
        if (!fs.existsSync(fullPath)) {
          logDebug('Görsel bulunamadı', { imagePath, fullPath });
          continue;
        }
      }

      // Sayfa kontrolü
      if (doc.y > doc.page.height - 200) {
        doc.addPage();
      }

      // Görseli ekle
      doc.image(fullPath, {
        fit: [500, 300],
        align: 'center',
      });

      doc.moveDown(0.5);
      if (image.imageType) {
        doc.fontSize(10)
           .fillColor('#6b7280')
           .text(`Görsel Tipi: ${image.imageType}`, { align: 'center' });
      }

      doc.moveDown(1);
      imagesAdded++;

    } catch (error) {
      logError('Görsel eklenirken hata', error, { imagePath: image.imageUrl });
      // Hata olsa bile devam et
    }
  }

  if (imagesAdded === 0) {
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text('Görseller yüklenemedi veya bulunamadı.', { align: 'center' });
  } else if (images.length > maxImages) {
    doc.moveDown(0.5);
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text(`Not: Toplam ${images.length} görsel var, ${maxImages} tanesi gösterildi.`, { align: 'center' });
  }
}

/**
 * Footer
 */
function addFooter(doc: InstanceType<typeof PDFDocument>, report: any): void {
  const pageCount = doc.bufferedPageRange().count;
  
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    
    doc.fontSize(8)
       .fillColor('#6b7280')
       .text(
         `Bu rapor Mivvo Expertiz tarafından oluşturulmuştur. Rapor ID: ${report.id} | Sayfa ${i + 1}/${pageCount}`,
         doc.page.width / 2,
         doc.page.height - 30,
         { align: 'center' }
       );
  }
}

/**
 * Rapor tipi adını döndür
 */
function getReportTypeName(reportType: string): string {
  const typeNames: { [key: string]: string } = {
    FULL_REPORT: 'Tam Expertiz',
    PAINT_ANALYSIS: 'Boya Analizi',
    DAMAGE_ANALYSIS: 'Hasar Analizi',
    DAMAGE_ASSESSMENT: 'Hasar Değerlendirmesi',
    DAMAGE_DETECTION: 'Hasar Tespiti',
    VALUE_ESTIMATION: 'Değer Tahmini',
    ENGINE_SOUND_ANALYSIS: 'Motor Sesi Analizi',
    AUDIO_ANALYSIS: 'Ses Analizi',
    COMPREHENSIVE_EXPERTISE: 'Kapsamlı Expertiz',
  };

  return typeNames[reportType] || reportType || 'Genel Rapor';
}
