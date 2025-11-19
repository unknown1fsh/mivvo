/**
 * PDF Report Service
 * 
 * Raporları PDF formatında oluşturur.
 */

import PDFDocument from 'pdfkit';
import { getPrismaClient } from '../utils/prisma';
import { logError, logInfo } from '../utils/logger';

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

export async function generatePDFReport(options: PDFReportOptions): Promise<Buffer> {
  const { reportId, userId, includeImages = true, includeCharts = true } = options;

  try {
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

    // PDF dokümanı oluştur
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // PDF içeriği oluştur
    await generatePDFContent(doc, report, { includeImages, includeCharts });

    // PDF'i bitir
    doc.end();

    // Buffer'ı bekle
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        logInfo('PDF rapor oluşturuldu', { reportId, size: pdfBuffer.length });
        resolve(pdfBuffer);
      });

      doc.on('error', (error) => {
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
  doc: PDFKit.PDFDocument,
  report: any,
  options: { includeImages: boolean; includeCharts: boolean }
): Promise<void> {
  // Başlık
  doc.fontSize(24).text('Mivvo Expertiz Raporu', { align: 'center' });
  doc.moveDown();

  // Tarih
  doc.fontSize(10).text(`Rapor Tarihi: ${new Date(report.createdAt).toLocaleDateString('tr-TR')}`, { align: 'right' });
  doc.moveDown(2);

  // Araç Bilgileri
  doc.fontSize(18).text('Araç Bilgileri', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(`Marka: ${report.vehicleBrand || 'Belirtilmemiş'}`);
  doc.text(`Model: ${report.vehicleModel || 'Belirtilmemiş'}`);
  doc.text(`Yıl: ${report.vehicleYear || 'Belirtilmemiş'}`);
  doc.text(`Plaka: ${report.vehiclePlate || 'Belirtilmemiş'}`);
  if (report.mileage) {
    doc.text(`Kilometre: ${report.mileage.toLocaleString('tr-TR')} km`);
  }
  doc.moveDown();

  // Rapor Tipi
  doc.fontSize(14).text(`Rapor Tipi: ${getReportTypeName(report.reportType)}`);
  doc.moveDown();

  // Analiz Sonuçları
  if (report.aiAnalysisData && Object.keys(report.aiAnalysisData).length > 0) {
    doc.fontSize(18).text('Analiz Sonuçları', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);

    const analysisData = report.aiAnalysisData;

    // Genel puan
    if (analysisData.overallScore !== undefined) {
      doc.text(`Genel Puan: ${analysisData.overallScore}/100`);
      doc.moveDown(0.5);
    }

    // Hasar şiddeti
    if (analysisData.damageSeverity) {
      doc.text(`Hasar Şiddeti: ${analysisData.damageSeverity}`);
      doc.moveDown(0.5);
    }

    // Toplam hasar
    if (analysisData.totalDamages !== undefined) {
      doc.text(`Toplam Hasar Sayısı: ${analysisData.totalDamages}`);
      doc.moveDown(0.5);
    }

    // Tahmini onarım maliyeti
    if (analysisData.estimatedRepairCost !== undefined) {
      doc.text(`Tahmini Onarım Maliyeti: ${analysisData.estimatedRepairCost.toLocaleString('tr-TR')} ₺`);
      doc.moveDown(0.5);
    }

    // Sigorta durumu
    if (analysisData.insuranceStatus) {
      doc.text(`Sigorta Durumu: ${analysisData.insuranceStatus}`);
      doc.moveDown(0.5);
    }

    // Öneriler
    if (analysisData.recommendations && Array.isArray(analysisData.recommendations)) {
      doc.moveDown();
      doc.fontSize(14).text('Öneriler:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      analysisData.recommendations.forEach((rec: string, index: number) => {
        doc.text(`${index + 1}. ${rec}`);
      });
    }

    doc.moveDown();
  }

  // Uzman Notları
  if (report.expertNotes) {
    doc.fontSize(14).text('Uzman Notları', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(report.expertNotes);
    doc.moveDown();
  }

  // Resimler (opsiyonel)
  if (options.includeImages && report.vehicleImages && report.vehicleImages.length > 0) {
    doc.addPage();
    doc.fontSize(18).text('Görseller', { underline: true });
    doc.moveDown();

    // İlk resmi ekle (örnek - gerçek implementasyonda base64'ü decode edip eklemek gerekir)
    doc.fontSize(10).text('Not: Görseller PDF\'e eklenmek için optimize edilmelidir.');
  }

  // Footer
  doc.fontSize(8).text(
    `Bu rapor Mivvo Expertiz tarafından oluşturulmuştur. Rapor ID: ${report.id}`,
    { align: 'center' }
  );
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
    VALUE_ESTIMATION: 'Değer Tahmini',
    ENGINE_SOUND_ANALYSIS: 'Motor Sesi Analizi',
    COMPREHENSIVE_EXPERTISE: 'Kapsamlı Expertiz',
  };

  return typeNames[reportType] || reportType;
}

