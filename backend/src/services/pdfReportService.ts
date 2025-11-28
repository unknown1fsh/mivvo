/**
 * PDF Report Service - Profesyonel Rapor Oluşturucu
 * 
 * Türkçe karakter desteği ile premium kalitede PDF raporlar oluşturur.
 * Roboto fontu kullanılarak tam Türkçe karakter desteği sağlanır.
 */

import PDFDocument from 'pdfkit';
import { getPrismaClient } from '../utils/prisma';
import { logError, logInfo, logDebug } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

const prisma = getPrismaClient();

// Font dosyalarının yolları
const FONTS_DIR = path.join(__dirname, '../assets/fonts');
const FONT_REGULAR = path.join(FONTS_DIR, 'Roboto-Regular.ttf');
const FONT_BOLD = path.join(FONTS_DIR, 'Roboto-Bold.ttf');

/**
 * Türkçe karakterleri ASCII eşdeğerlerine dönüştür
 * PDFKit standart fontları Türkçe karakterleri desteklemediği için gerekli
 */
function turkishToAscii(text: string): string {
  if (!text) return '';
  return text
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ə/g, 'e').replace(/Ə/g, 'E');
}

/**
 * Sayıyı Türk formatında string'e çevir
 */
function formatNumber(num: number): string {
  return num.toLocaleString('tr-TR');
}

/**
 * Tarihi Türk formatında string'e çevir
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const months = ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 
                  'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Renkler
const COLORS = {
  primary: '#1e40af',      // Mavi
  secondary: '#6b7280',    // Gri
  success: '#059669',      // Yeşil
  danger: '#dc2626',       // Kırmızı
  warning: '#d97706',      // Turuncu
  black: '#111827',
  white: '#ffffff',
  lightGray: '#f3f4f6',
  darkGray: '#374151',
  border: '#e5e7eb',
};

// Sayfa boyutları
const PAGE = {
  width: 595.28,  // A4
  height: 841.89,
  margin: 50,
  contentWidth: 495.28, // width - 2 * margin
};

/**
 * PDF Rapor Seçenekleri
 */
export interface PDFReportOptions {
  reportId: number;
  userId: number;
  includeImages?: boolean;
  includeCharts?: boolean;
}

/**
 * Font dosyalarının varlığını kontrol et
 */
function checkFonts(): boolean {
  const regularExists = fs.existsSync(FONT_REGULAR);
  const boldExists = fs.existsSync(FONT_BOLD);
  
  if (!regularExists || !boldExists) {
    logDebug('Font dosyaları bulunamadı, varsayılan fontlar kullanılacak', {
      regularExists,
      boldExists,
      fontDir: FONTS_DIR
    });
    return false;
  }
  
  return true;
}

/**
 * PDF dokümanına font kaydet
 */
function registerFonts(doc: InstanceType<typeof PDFDocument>): boolean {
  try {
    if (checkFonts()) {
      doc.registerFont('Roboto', FONT_REGULAR);
      doc.registerFont('Roboto-Bold', FONT_BOLD);
      return true;
    }
    return false;
  } catch (error) {
    logError('Font kayıt hatası', error);
    return false;
  }
}

/**
 * Ana PDF oluşturma fonksiyonu
 */
export async function generatePDFReport(options: PDFReportOptions): Promise<Buffer> {
  const { reportId, userId, includeImages = true } = options;

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
      margins: { top: PAGE.margin, bottom: PAGE.margin, left: PAGE.margin, right: PAGE.margin },
      bufferPages: true,
      info: {
        Title: `Mivvo Expertiz Raporu - ${report.vehicleBrand} ${report.vehicleModel}`,
        Author: 'Mivvo Expertiz',
        Subject: getReportTypeName(report.reportType || 'UNKNOWN'),
        Creator: 'Mivvo Expertiz Platform',
      }
    });

    // Fontları kaydet
    const hasTurkishFonts = registerFonts(doc);
    const fontRegular = hasTurkishFonts ? 'Roboto' : 'Helvetica';
    const fontBold = hasTurkishFonts ? 'Roboto-Bold' : 'Helvetica-Bold';

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // AI verilerini parse et
    let aiAnalysisData: any = null;
    try {
      if (report.aiAnalysisData) {
        if (typeof report.aiAnalysisData === 'string') {
          aiAnalysisData = JSON.parse(report.aiAnalysisData);
        } else {
          aiAnalysisData = report.aiAnalysisData;
        }
      }
    } catch (parseError) {
      logError('AI verileri parse edilemedi', parseError);
    }

    // PDF içeriği oluştur
    await generatePDFContent(doc, report, aiAnalysisData, { 
      includeImages, 
      fontRegular, 
      fontBold 
    });

    // Footer ekle
    addFooter(doc, report, fontRegular);

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
  options: { includeImages: boolean; fontRegular: string; fontBold: string }
): Promise<void> {
  const { includeImages, fontRegular, fontBold } = options;
  const reportType = report.reportType || 'UNKNOWN';

  // ===== HEADER =====
  drawHeader(doc, report, fontRegular, fontBold);
  
  doc.moveDown(2);

  // ===== ARAÇ BİLGİLERİ KARTI =====
  drawVehicleInfoCard(doc, report, fontRegular, fontBold);
  
  doc.moveDown(1.5);

  // ===== ANALİZ SONUÇLARI =====
  if (aiAnalysisData && Object.keys(aiAnalysisData).length > 0) {
    drawAnalysisResultsSection(doc, reportType, aiAnalysisData, fontRegular, fontBold);
  } else {
    drawNoDataSection(doc, fontRegular, fontBold);
  }

  // ===== UZMAN NOTLARI =====
  if (report.expertNotes) {
    doc.moveDown(1);
    drawExpertNotesSection(doc, report.expertNotes, fontRegular, fontBold);
  }

  // ===== GÖRSELLER =====
  if (includeImages && report.vehicleImages && report.vehicleImages.length > 0) {
    doc.addPage();
    await drawImagesSection(doc, report.vehicleImages, fontRegular, fontBold);
  }
}

/**
 * Header çiz
 */
function drawHeader(
  doc: InstanceType<typeof PDFDocument>,
  report: any,
  fontRegular: string,
  fontBold: string
): void {
  const startY = doc.y;
  
  // Logo/Marka alanı (sol)
  doc.font(fontBold)
     .fontSize(24)
     .fillColor(COLORS.primary)
     .text('MIVVO', PAGE.margin, startY);
  
  doc.font(fontRegular)
     .fontSize(10)
     .fillColor(COLORS.secondary)
     .text('Profesyonel Arac Ekspertiz', PAGE.margin, doc.y);

  // Rapor başlığı (orta)
  const reportTitle = turkishToAscii(getReportTypeName(report.reportType || 'UNKNOWN'));
  doc.font(fontBold)
     .fontSize(18)
     .fillColor(COLORS.black)
     .text(reportTitle.toUpperCase(), PAGE.margin, startY, {
       align: 'center',
       width: PAGE.contentWidth
     });
  
  doc.font(fontRegular)
     .fontSize(10)
     .fillColor(COLORS.secondary)
     .text('EKSPERTIZ RAPORU', {
       align: 'center',
       width: PAGE.contentWidth
     });

  // Tarih ve ID (sağ)
  const dateStr = formatDate(report.createdAt);
  
  doc.font(fontRegular)
     .fontSize(9)
     .fillColor(COLORS.secondary)
     .text(`Tarih: ${dateStr}`, PAGE.margin, startY, {
       align: 'right',
       width: PAGE.contentWidth
     });
  
  doc.text(`Rapor No: #${report.id}`, {
    align: 'right',
    width: PAGE.contentWidth
  });

  doc.moveDown(0.5);
  
  // Çizgi
  doc.strokeColor(COLORS.border)
     .lineWidth(1)
     .moveTo(PAGE.margin, doc.y + 10)
     .lineTo(PAGE.width - PAGE.margin, doc.y + 10)
     .stroke();
  
  doc.y += 20;
}

/**
 * Araç bilgileri kartı çiz
 */
function drawVehicleInfoCard(
  doc: InstanceType<typeof PDFDocument>,
  report: any,
  fontRegular: string,
  fontBold: string
): void {
  const startY = doc.y;
  const cardPadding = 15;
  const cardWidth = PAGE.contentWidth;
  
  // Başlık
  doc.font(fontBold)
     .fontSize(14)
     .fillColor(COLORS.primary)
     .text('ARAC BILGILERI', PAGE.margin, startY);
  
  doc.moveDown(0.5);
  
  // Kart arka planı
  const cardStartY = doc.y;
  
  // Araç bilgileri - 2 sütun
  const col1X = PAGE.margin + cardPadding;
  const col2X = PAGE.margin + cardWidth / 2;
  const lineHeight = 20;
  let currentY = cardStartY + cardPadding;

  const vehicleData = [
    [
      { label: 'Marka', value: turkishToAscii(report.vehicleBrand || 'Belirtilmemis') },
      { label: 'Model', value: turkishToAscii(report.vehicleModel || 'Belirtilmemis') }
    ],
    [
      { label: 'Yil', value: report.vehicleYear ? report.vehicleYear.toString() : 'Belirtilmemis' },
      { label: 'Plaka', value: turkishToAscii(report.vehiclePlate || 'Belirtilmemis') }
    ],
    [
      { label: 'Kilometre', value: report.mileage ? `${formatNumber(report.mileage)} km` : 'Belirtilmemis' },
      { label: 'Renk', value: turkishToAscii(report.vehicleColor || 'Belirtilmemis') }
    ]
  ];

  vehicleData.forEach((row) => {
    // Sol sütun
    doc.font(fontRegular)
       .fontSize(9)
       .fillColor(COLORS.secondary)
       .text(row[0].label, col1X, currentY);
    
    doc.font(fontBold)
       .fontSize(11)
       .fillColor(COLORS.black)
       .text(row[0].value, col1X, currentY + 10);

    // Sağ sütun
    doc.font(fontRegular)
       .fontSize(9)
       .fillColor(COLORS.secondary)
       .text(row[1].label, col2X, currentY);
    
    doc.font(fontBold)
       .fontSize(11)
       .fillColor(COLORS.black)
       .text(row[1].value, col2X, currentY + 10);

    currentY += lineHeight + 15;
  });

  // Kart çerçevesi
  const cardHeight = currentY - cardStartY + cardPadding;
  doc.rect(PAGE.margin, cardStartY, cardWidth, cardHeight)
     .strokeColor(COLORS.border)
     .lineWidth(1)
     .stroke();

  doc.y = cardStartY + cardHeight;
}

/**
 * Analiz sonuçları bölümü
 */
function drawAnalysisResultsSection(
  doc: InstanceType<typeof PDFDocument>,
  reportType: string,
  aiAnalysisData: any,
  fontRegular: string,
  fontBold: string
): void {
  // Başlık
  doc.font(fontBold)
     .fontSize(14)
     .fillColor(COLORS.primary)
     .text('ANALIZ SONUCLARI', PAGE.margin, doc.y);
  
  doc.moveDown(0.5);

  // Rapor tipine göre içerik
  switch (reportType) {
    case 'DAMAGE_ASSESSMENT':
    case 'DAMAGE_DETECTION':
    case 'DAMAGE_ANALYSIS':
      drawDamageAnalysis(doc, aiAnalysisData, fontRegular, fontBold);
      break;
    
    case 'PAINT_ANALYSIS':
      drawPaintAnalysis(doc, aiAnalysisData, fontRegular, fontBold);
      break;
    
    case 'ENGINE_SOUND_ANALYSIS':
    case 'AUDIO_ANALYSIS':
      drawAudioAnalysis(doc, aiAnalysisData, fontRegular, fontBold);
      break;
    
    case 'VALUE_ESTIMATION':
      drawValueEstimation(doc, aiAnalysisData, fontRegular, fontBold);
      break;
    
    case 'COMPREHENSIVE_EXPERTISE':
    case 'FULL_REPORT':
      drawComprehensiveAnalysis(doc, aiAnalysisData, fontRegular, fontBold);
      break;
    
    default:
      drawGenericAnalysis(doc, aiAnalysisData, fontRegular, fontBold);
  }
}

/**
 * Hasar Analizi içeriği
 */
function drawDamageAnalysis(
  doc: InstanceType<typeof PDFDocument>,
  data: any,
  fontRegular: string,
  fontBold: string
): void {
  const startY = doc.y;
  
  // Genel Değerlendirme Kartı
  const genelDegerlendirme = data.genelDegerlendirme || data.genelDeğerlendirme || {};
  const overallScore = data.overallScore || genelDegerlendirme.satisDeferi || genelDegerlendirme.satışDeğeri || 0;
  
  // Skor göstergesi
  if (overallScore > 0) {
    drawScoreIndicator(doc, overallScore, fontRegular, fontBold);
    doc.moveDown(1);
  }

  // Hasar özeti
  const hasarAlanlari = data.hasarAlanlari || data.hasarAlanları || [];
  const toplamHasar = hasarAlanlari.length;
  const kritikHasar = hasarAlanlari.filter((h: any) => 
    (h.siddet || h.şiddet || '').toLowerCase().includes('kritik') || 
    (h.siddet || h.şiddet || '').toLowerCase().includes('yuksek') ||
    (h.siddet || h.şiddet || '').toLowerCase().includes('yüksek')
  ).length;

  // Özet kutuları
  const boxWidth = (PAGE.contentWidth - 20) / 3;
  const boxY = doc.y;

  // Toplam Hasar
  drawInfoBox(doc, 'Toplam Hasar', toplamHasar.toString(), COLORS.primary, PAGE.margin, boxY, boxWidth, fontRegular, fontBold);
  
  // Kritik Hasar
  drawInfoBox(doc, 'Kritik Hasar', kritikHasar.toString(), COLORS.danger, PAGE.margin + boxWidth + 10, boxY, boxWidth, fontRegular, fontBold);
  
  // Tahmini Maliyet
  const toplamMaliyet = data.estimatedRepairCost || genelDegerlendirme.toplamOnarimMaliyeti || genelDegerlendirme.toplamOnarımMaliyeti || 0;
  drawInfoBox(doc, 'Tahmini Maliyet', toplamMaliyet > 0 ? `${toplamMaliyet.toLocaleString('tr-TR')} TL` : 'Hesaplanmadi', COLORS.warning, PAGE.margin + (boxWidth + 10) * 2, boxY, boxWidth, fontRegular, fontBold);

  doc.y = boxY + 70;
  doc.moveDown(1);

  // Hasar listesi
  if (hasarAlanlari.length > 0) {
    doc.font(fontBold)
       .fontSize(11)
       .fillColor(COLORS.black)
       .text('Tespit Edilen Hasarlar:', PAGE.margin, doc.y);
    
    doc.moveDown(0.5);

    hasarAlanlari.slice(0, 8).forEach((hasar: any, index: number) => {
      const konum = turkishToAscii(hasar.konum || hasar.bolge || hasar.bölge || 'Belirtilmemis');
      const siddet = turkishToAscii(hasar.siddet || hasar.şiddet || 'Bilinmiyor');
      const aciklama = turkishToAscii(hasar.aciklama || hasar.açıklama || '');
      
      const siddetLower = siddet.toLowerCase();
      const siddetColor = siddetLower.includes('kritik') || siddetLower.includes('yuksek') 
        ? COLORS.danger 
        : siddetLower.includes('orta') 
          ? COLORS.warning 
          : COLORS.success;

      doc.font(fontRegular)
         .fontSize(10)
         .fillColor(COLORS.black)
         .text(`${index + 1}. `, PAGE.margin, doc.y, { continued: true })
         .font(fontBold)
         .text(konum, { continued: true })
         .font(fontRegular)
         .fillColor(siddetColor)
         .text(` (${siddet})`, { continued: aciklama ? true : false });
      
      if (aciklama) {
        doc.fillColor(COLORS.secondary)
           .text(` - ${aciklama}`);
      }
      
      doc.moveDown(0.3);
    });

    if (hasarAlanlari.length > 8) {
      doc.font(fontRegular)
         .fontSize(9)
         .fillColor(COLORS.secondary)
         .text(`... ve ${hasarAlanlari.length - 8} hasar daha`, PAGE.margin, doc.y);
    }
  }

  // Öneriler
  drawRecommendations(doc, data, fontRegular, fontBold);
}

/**
 * Boya Analizi içeriği
 */
function drawPaintAnalysis(
  doc: InstanceType<typeof PDFDocument>,
  data: any,
  fontRegular: string,
  fontBold: string
): void {
  const boyaKalitesi = data.boyaKalitesi || {};
  const overallScore = boyaKalitesi.genelPuan || data.overallScore || 0;
  
  // Skor göstergesi
  if (overallScore > 0) {
    drawScoreIndicator(doc, overallScore, fontRegular, fontBold);
    doc.moveDown(1);
  }

  // Boya durumu
  const boyaDurumu = turkishToAscii(data.boyaDurumu || 'Belirtilmemis');
  doc.font(fontBold)
     .fontSize(11)
     .fillColor(COLORS.black)
     .text('Boya Durumu: ', PAGE.margin, doc.y, { continued: true })
     .font(fontRegular)
     .fillColor(COLORS.primary)
     .text(boyaDurumu);
  
  doc.moveDown(0.5);

  // Renk analizi
  const renkAnalizi = data.renkAnalizi || {};
  if (renkAnalizi.renkAdi || renkAnalizi.renkAdı) {
    doc.font(fontBold)
       .fontSize(11)
       .fillColor(COLORS.black)
       .text('Renk: ', PAGE.margin, doc.y, { continued: true })
       .font(fontRegular)
       .text(turkishToAscii(renkAnalizi.renkAdi || renkAnalizi.renkAdı));
    
    doc.moveDown(0.3);
  }

  // Yüzey analizi
  const yuzeyAnalizi = data.yuzeyAnalizi || data.yüzeyAnalizi || {};
  if (yuzeyAnalizi.durum) {
    doc.font(fontBold)
       .fontSize(11)
       .fillColor(COLORS.black)
       .text('Yuzey Durumu: ', PAGE.margin, doc.y, { continued: true })
       .font(fontRegular)
       .text(turkishToAscii(yuzeyAnalizi.durum));
    
    doc.moveDown(0.3);
  }

  // Boya kusurları
  const kusurlar = data.boyaKusurlari || data.boyaKusurları || [];
  if (Array.isArray(kusurlar) && kusurlar.length > 0) {
    doc.moveDown(0.5);
    doc.font(fontBold)
       .fontSize(11)
       .fillColor(COLORS.black)
       .text('Tespit Edilen Kusurlar:', PAGE.margin, doc.y);
    
    doc.moveDown(0.3);
    
    kusurlar.slice(0, 5).forEach((kusur: any, index: number) => {
      const tip = turkishToAscii(kusur.tip || kusur.tur || kusur.tür || 'Kusur');
      const konum = turkishToAscii(kusur.konum || '');
      
      doc.font(fontRegular)
         .fontSize(10)
         .fillColor(COLORS.black)
         .text(`${index + 1}. ${tip}${konum ? ` - ${konum}` : ''}`, PAGE.margin + 10, doc.y);
      
      doc.moveDown(0.2);
    });
  }

  // Öneriler
  drawRecommendations(doc, data, fontRegular, fontBold);
}

/**
 * Motor Ses Analizi içeriği
 */
function drawAudioAnalysis(
  doc: InstanceType<typeof PDFDocument>,
  data: any,
  fontRegular: string,
  fontBold: string
): void {
  const overallScore = data.overallScore || 0;
  
  // Skor göstergesi
  if (overallScore > 0) {
    drawScoreIndicator(doc, overallScore, fontRegular, fontBold);
    doc.moveDown(1);
  }

  // Motor sağlığı
  const motorSagligi = turkishToAscii(data.engineHealth || data.motorSagligi || data.motorSağlığı || 'Bilinmiyor');
  doc.font(fontBold)
     .fontSize(11)
     .fillColor(COLORS.black)
     .text('Motor Sagligi: ', PAGE.margin, doc.y, { continued: true })
     .font(fontRegular)
     .fillColor(COLORS.primary)
     .text(motorSagligi);
  
  doc.moveDown(0.5);

  // Tespit edilen sorunlar
  const sorunlar = data.detectedIssues || data.tespitEdilenSorunlar || [];
  if (Array.isArray(sorunlar) && sorunlar.length > 0) {
    doc.font(fontBold)
       .fontSize(11)
       .fillColor(COLORS.black)
       .text(`Tespit Edilen Sorunlar (${sorunlar.length}):`, PAGE.margin, doc.y);
    
    doc.moveDown(0.3);
    
    sorunlar.slice(0, 5).forEach((sorun: any, index: number) => {
      const sorunText = turkishToAscii(typeof sorun === 'string' ? sorun : (sorun.sorun || sorun.issue || 'Bilinmeyen sorun'));
      
      doc.font(fontRegular)
         .fontSize(10)
         .fillColor(COLORS.danger)
         .text(`${index + 1}. ${sorunText}`, PAGE.margin + 10, doc.y);
      
      doc.moveDown(0.2);
    });
  } else {
    doc.font(fontRegular)
       .fontSize(10)
       .fillColor(COLORS.success)
       .text('Herhangi bir sorun tespit edilmedi.', PAGE.margin, doc.y);
  }

  // Öneriler
  drawRecommendations(doc, data, fontRegular, fontBold);
}

/**
 * Değer Tahmini içeriği
 */
function drawValueEstimation(
  doc: InstanceType<typeof PDFDocument>,
  data: any,
  fontRegular: string,
  fontBold: string
): void {
  const tahminiDeger = data.estimatedValue || data.tahminiDeger || data.tahminiDeğer || 0;
  
  // Büyük değer gösterimi
  if (tahminiDeger > 0) {
    doc.font(fontBold)
       .fontSize(28)
       .fillColor(COLORS.success)
       .text(`${tahminiDeger.toLocaleString('tr-TR')} TL`, PAGE.margin, doc.y, {
         align: 'center',
         width: PAGE.contentWidth
       });
    
    doc.font(fontRegular)
       .fontSize(10)
       .fillColor(COLORS.secondary)
       .text('Tahmini Piyasa Degeri', {
         align: 'center',
         width: PAGE.contentWidth
       });
    
    doc.moveDown(1);
  }

  // Piyasa aralığı
  const piyasaAnalizi = data.marketAnalysis || data.piyasaAnalizi || {};
  if (piyasaAnalizi.priceRange) {
    const range = piyasaAnalizi.priceRange;
    doc.font(fontRegular)
       .fontSize(10)
       .fillColor(COLORS.black)
       .text(`Piyasa Araligi: ${(range.min || 0).toLocaleString('tr-TR')} TL - ${(range.max || 0).toLocaleString('tr-TR')} TL`, PAGE.margin, doc.y);
    
    doc.moveDown(0.3);
  }

  // Değer kaybı
  const degerKaybi = data.depreciation || data.degerKaybi || data.değerKaybı || 0;
  if (degerKaybi > 0) {
    doc.font(fontRegular)
       .fontSize(10)
       .fillColor(COLORS.warning)
       .text(`Deger Kaybi: %${degerKaybi}`, PAGE.margin, doc.y);
    
    doc.moveDown(0.3);
  }

  // Öneriler
  drawRecommendations(doc, data, fontRegular, fontBold);
}

/**
 * Kapsamlı Ekspertiz içeriği
 */
function drawComprehensiveAnalysis(
  doc: InstanceType<typeof PDFDocument>,
  data: any,
  fontRegular: string,
  fontBold: string
): void {
  const overallScore = data.overallScore || 0;
  
  // Skor göstergesi
  if (overallScore > 0) {
    drawScoreIndicator(doc, overallScore, fontRegular, fontBold);
    doc.moveDown(1);
  }

  // Ekspertiz notu
  const ekspertizNotu = data.expertiseGrade || data.ekspertizNotu || null;
  if (ekspertizNotu) {
    doc.font(fontBold)
       .fontSize(11)
       .fillColor(COLORS.black)
       .text('Ekspertiz Notu: ', PAGE.margin, doc.y, { continued: true })
       .font(fontRegular)
       .fillColor(COLORS.primary)
       .text(turkishToAscii(ekspertizNotu));
    
    doc.moveDown(0.5);
  }

  // Özet
  const ozet = data.comprehensiveSummary || data.kapsamliOzet || data.kapsamlıÖzet || data.summary || null;
  if (ozet) {
    doc.font(fontBold)
       .fontSize(11)
       .fillColor(COLORS.black)
       .text('Ozet:', PAGE.margin, doc.y);
    
    doc.moveDown(0.3);
    
    doc.font(fontRegular)
       .fontSize(10)
       .fillColor(COLORS.darkGray)
       .text(turkishToAscii(ozet), PAGE.margin + 10, doc.y, { width: PAGE.contentWidth - 20 });
    
    doc.moveDown(0.5);
  }

  // Güçlü yönler
  const gucluYonler = data.strengths || data.gucluYonler || data.güçlüYönler || [];
  if (Array.isArray(gucluYonler) && gucluYonler.length > 0) {
    doc.font(fontBold)
       .fontSize(11)
       .fillColor(COLORS.success)
       .text('Guclu Yonler:', PAGE.margin, doc.y);
    
    doc.moveDown(0.3);
    
    gucluYonler.slice(0, 5).forEach((yon: string) => {
      doc.font(fontRegular)
         .fontSize(10)
         .fillColor(COLORS.black)
         .text(`+ ${turkishToAscii(yon)}`, PAGE.margin + 10, doc.y);
      
      doc.moveDown(0.2);
    });
    
    doc.moveDown(0.3);
  }

  // Zayıf yönler
  const zayifYonler = data.weaknesses || data.zayifYonler || data.zayıfYönler || [];
  if (Array.isArray(zayifYonler) && zayifYonler.length > 0) {
    doc.font(fontBold)
       .fontSize(11)
       .fillColor(COLORS.danger)
       .text('Zayif Yonler:', PAGE.margin, doc.y);
    
    doc.moveDown(0.3);
    
    zayifYonler.slice(0, 5).forEach((yon: string) => {
      doc.font(fontRegular)
         .fontSize(10)
         .fillColor(COLORS.black)
         .text(`- ${turkishToAscii(yon)}`, PAGE.margin + 10, doc.y);
      
      doc.moveDown(0.2);
    });
  }

  // Öneriler
  drawRecommendations(doc, data, fontRegular, fontBold);
}

/**
 * Genel analiz içeriği
 */
function drawGenericAnalysis(
  doc: InstanceType<typeof PDFDocument>,
  data: any,
  fontRegular: string,
  fontBold: string
): void {
  if (data.overallScore !== undefined) {
    drawScoreIndicator(doc, data.overallScore, fontRegular, fontBold);
    doc.moveDown(1);
  }

  // Tüm anahtar-değer çiftlerini göster
  Object.keys(data).slice(0, 10).forEach((key) => {
    if (key !== 'overallScore' && typeof data[key] !== 'object') {
      doc.font(fontBold)
         .fontSize(10)
         .fillColor(COLORS.black)
         .text(`${key}: `, PAGE.margin, doc.y, { continued: true })
         .font(fontRegular)
         .text(String(data[key]));
      
      doc.moveDown(0.3);
    }
  });

  drawRecommendations(doc, data, fontRegular, fontBold);
}

/**
 * Skor göstergesi çiz
 */
function drawScoreIndicator(
  doc: InstanceType<typeof PDFDocument>,
  score: number,
  fontRegular: string,
  fontBold: string
): void {
  const centerX = PAGE.width / 2;
  const y = doc.y;
  const radius = 35;
  
  // Skor rengini belirle
  const scoreColor = score >= 80 ? COLORS.success : 
                     score >= 60 ? COLORS.warning : 
                     COLORS.danger;

  // Dış çember
  doc.circle(centerX, y + radius, radius)
     .strokeColor(COLORS.border)
     .lineWidth(3)
     .stroke();

  // İç çember (skor göstergesi)
  doc.circle(centerX, y + radius, radius - 5)
     .fillColor(scoreColor)
     .fillOpacity(0.1)
     .fill();

  // Skor metni
  doc.fillOpacity(1)
     .font(fontBold)
     .fontSize(24)
     .fillColor(scoreColor)
     .text(score.toString(), centerX - 20, y + radius - 15, {
       width: 40,
       align: 'center'
     });

  doc.font(fontRegular)
     .fontSize(8)
     .fillColor(COLORS.secondary)
     .text('/100', centerX - 15, y + radius + 10, {
       width: 30,
       align: 'center'
     });

  // Etiket
  doc.font(fontRegular)
     .fontSize(10)
     .fillColor(COLORS.black)
     .text('Genel Puan', centerX - 40, y + radius + 40, {
       width: 80,
       align: 'center'
     });

  doc.y = y + radius * 2 + 20;
}

/**
 * Bilgi kutusu çiz
 */
function drawInfoBox(
  doc: InstanceType<typeof PDFDocument>,
  label: string,
  value: string,
  color: string,
  x: number,
  y: number,
  width: number,
  fontRegular: string,
  fontBold: string
): void {
  const height = 60;
  
  // Kutu arka planı
  doc.rect(x, y, width, height)
     .fillColor(color)
     .fillOpacity(0.1)
     .fill();
  
  // Kutu çerçevesi
  doc.rect(x, y, width, height)
     .strokeColor(color)
     .lineWidth(1)
     .stroke();

  // Değer
  doc.fillOpacity(1)
     .font(fontBold)
     .fontSize(16)
     .fillColor(color)
     .text(value, x, y + 15, {
       width: width,
       align: 'center'
     });

  // Etiket
  doc.font(fontRegular)
     .fontSize(9)
     .fillColor(COLORS.secondary)
     .text(label, x, y + 40, {
       width: width,
       align: 'center'
     });
}

/**
 * Öneriler bölümü
 */
function drawRecommendations(
  doc: InstanceType<typeof PDFDocument>,
  data: any,
  fontRegular: string,
  fontBold: string
): void {
  const oneriler = data.recommendations || data.oneriler || data.öneriler || 
                   data.genelDegerlendirme?.oneriler || data.genelDeğerlendirme?.öneriler || [];
  
  if (!Array.isArray(oneriler) || oneriler.length === 0) return;

  doc.moveDown(1);
  
  doc.font(fontBold)
     .fontSize(11)
     .fillColor(COLORS.primary)
     .text('Oneriler:', PAGE.margin, doc.y);
  
  doc.moveDown(0.3);

  oneriler.slice(0, 5).forEach((oneri: string, index: number) => {
    doc.font(fontRegular)
       .fontSize(10)
       .fillColor(COLORS.black)
       .text(`${index + 1}. ${turkishToAscii(oneri)}`, PAGE.margin + 10, doc.y, { 
         width: PAGE.contentWidth - 20 
       });
    
    doc.moveDown(0.3);
  });
}

/**
 * Veri yok bölümü
 */
function drawNoDataSection(
  doc: InstanceType<typeof PDFDocument>,
  fontRegular: string,
  fontBold: string
): void {
  doc.font(fontBold)
     .fontSize(14)
     .fillColor(COLORS.warning)
     .text('AI ANALIZI DURUMU', PAGE.margin, doc.y);
  
  doc.moveDown(0.5);
  
  doc.font(fontRegular)
     .fontSize(11)
     .fillColor(COLORS.black)
     .text('AI analizi henuz tamamlanmamis veya veri alinamamistir.', PAGE.margin + 10, doc.y);
  
  doc.moveDown(0.3);
  doc.text('Bu rapor yalnizca temel arac bilgilerini icermektedir.', PAGE.margin + 10, doc.y);
}

/**
 * Uzman notları bölümü
 */
function drawExpertNotesSection(
  doc: InstanceType<typeof PDFDocument>,
  notes: string,
  fontRegular: string,
  fontBold: string
): void {
  doc.font(fontBold)
     .fontSize(11)
     .fillColor(COLORS.primary)
     .text('UZMAN NOTLARI', PAGE.margin, doc.y);
  
  doc.moveDown(0.5);
  
  doc.font(fontRegular)
     .fontSize(10)
     .fillColor(COLORS.darkGray)
     .text(turkishToAscii(notes), PAGE.margin + 10, doc.y, { width: PAGE.contentWidth - 20 });
}

/**
 * Görseller bölümü
 */
async function drawImagesSection(
  doc: InstanceType<typeof PDFDocument>,
  images: any[],
  fontRegular: string,
  fontBold: string
): Promise<void> {
  doc.font(fontBold)
     .fontSize(14)
     .fillColor(COLORS.primary)
     .text('GORSELLER', PAGE.margin, doc.y);
  
  doc.moveDown(1);

  let imagesAdded = 0;
  const maxImages = 4;

  for (const image of images.slice(0, maxImages)) {
    try {
      const imagePath = image.imageUrl || image.imagePath || image.path;
      if (!imagePath) continue;

      const { type, data } = resolveImageSource(imagePath);
      
      if (!type || !data || type === 'url') continue;

      // Sayfa kontrolü
      if (doc.y > PAGE.height - 250) {
        doc.addPage();
      }

      // Görseli ekle
      doc.image(data, PAGE.margin, doc.y, {
        fit: [PAGE.contentWidth, 200],
        align: 'center',
      });

      doc.moveDown(0.5);
      
      if (image.imageType) {
        doc.font(fontRegular)
           .fontSize(9)
           .fillColor(COLORS.secondary)
           .text(`Gorsel Tipi: ${turkishToAscii(image.imageType)}`, {
             align: 'center',
             width: PAGE.contentWidth
           });
      }

      doc.moveDown(1);
      imagesAdded++;

    } catch (error) {
      logError('Görsel eklenirken hata', error);
    }
  }

  if (imagesAdded === 0) {
    doc.font(fontRegular)
       .fontSize(10)
       .fillColor(COLORS.secondary)
       .text('Gorseller yuklenemedi veya bulunamadi.', {
         align: 'center',
         width: PAGE.contentWidth
       });
  }
}

/**
 * Footer çiz
 */
function addFooter(
  doc: InstanceType<typeof PDFDocument>,
  report: any,
  fontRegular: string
): void {
  try {
    const range = doc.bufferedPageRange();
    const pageCount = range.count;
    const startPage = range.start;
    
    if (pageCount === 0) return;
    
    for (let i = 0; i < pageCount; i++) {
      try {
        const pageIndex = startPage + i;
        doc.switchToPage(pageIndex);
        
        const footerY = PAGE.height - 30;
        
        // Çizgi
        doc.strokeColor(COLORS.border)
           .lineWidth(0.5)
           .moveTo(PAGE.margin, footerY - 10)
           .lineTo(PAGE.width - PAGE.margin, footerY - 10)
           .stroke();

        // Footer metni
        doc.font(fontRegular)
           .fontSize(8)
           .fillColor(COLORS.secondary)
           .text(
             `Mivvo Expertiz | Rapor #${report.id} | Sayfa ${i + 1}/${pageCount}`,
             PAGE.margin,
             footerY,
             { 
               align: 'center',
               width: PAGE.contentWidth
             }
           );
      } catch (pageError) {
        logError('PDF footer sayfa hatası', pageError);
      }
    }
  } catch (error) {
    logError('PDF footer ekleme hatası', error);
  }
}

/**
 * Base64 to Buffer
 */
function base64ToBuffer(base64String: string): Buffer | null {
  try {
    const matches = base64String.match(/^data:image\/[^;]+;base64,(.+)$/);
    const base64Data = matches ? matches[1] : base64String;
    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    return null;
  }
}

/**
 * Görsel kaynağını çözümle
 */
function resolveImageSource(imagePath: string): { type: 'file' | 'base64' | 'url' | null, data: string | Buffer | null } {
  if (!imagePath) return { type: null, data: null };

  if (imagePath.startsWith('data:image/')) {
    const buffer = base64ToBuffer(imagePath);
    return buffer ? { type: 'base64', data: buffer } : { type: null, data: null };
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return { type: 'url', data: imagePath };
  }

  if (fs.existsSync(imagePath)) {
    return { type: 'file', data: imagePath };
  }

  const fullPath = path.join(process.cwd(), 'uploads', imagePath);
  if (fs.existsSync(fullPath)) {
    return { type: 'file', data: fullPath };
  }

  return { type: null, data: null };
}

/**
 * Rapor tipi adı
 */
function getReportTypeName(reportType: string): string {
  const typeNames: { [key: string]: string } = {
    FULL_REPORT: 'Kapsamli Ekspertiz',
    PAINT_ANALYSIS: 'Boya Analizi',
    DAMAGE_ANALYSIS: 'Hasar Analizi',
    DAMAGE_ASSESSMENT: 'Hasar Degerlendirmesi',
    DAMAGE_DETECTION: 'Hasar Tespiti',
    VALUE_ESTIMATION: 'Deger Tahmini',
    ENGINE_SOUND_ANALYSIS: 'Motor Sesi Analizi',
    AUDIO_ANALYSIS: 'Ses Analizi',
    COMPREHENSIVE_EXPERTISE: 'Kapsamli Ekspertiz',
  };

  return typeNames[reportType] || 'Genel Rapor';
}
