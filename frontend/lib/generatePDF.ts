/**
 * Basit PDF Generator - Türkçe karakter desteği ile
 * jsPDF ve jspdf-autotable kullanarak rapor PDF'i oluşturur
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// PDF oluşturma için tip tanımları
export interface PDFReportData {
  title: string
  vehicleInfo: {
    brand: string
    model: string
    year: number
    plate?: string
    vin?: string
  }
  reportType: 'damage' | 'paint' | 'audio' | 'value' | 'comprehensive'
  analysisData: any
  images?: string[]
  charts?: string[]
  createdAt: string
  reportId: string
}

export interface PDFOptions {
  includeQRCode?: boolean
  includeImages?: boolean
  includeCharts?: boolean
  pageSize?: 'A4' | 'Letter'
  orientation?: 'portrait' | 'landscape'
}

class PDFGenerator {
  private doc: jsPDF
  private options: PDFOptions

  constructor(options: PDFOptions = {}) {
    this.options = {
      pageSize: 'A4',
      orientation: 'portrait',
      includeQRCode: true,
      includeImages: true,
      includeCharts: true,
      ...options
    }
    
    this.doc = new jsPDF({
      orientation: this.options.orientation,
      unit: 'mm',
      format: this.options.pageSize
    })
    
    this.setupDocument()
  }

  private setupDocument() {
    // Varsayılan font ayarları
    this.doc.setFont('helvetica')
    this.doc.setFontSize(12)
  }

  // Ana PDF oluşturma fonksiyonu
  generateReport(data: PDFReportData): jsPDF {
    this.addHeader(data)
    this.addVehicleInfo(data.vehicleInfo)
    this.addAnalysisContent(data)
    this.addFooter(data)
    
    return this.doc
  }

  private addHeader(data: PDFReportData) {
    const pageWidth = this.doc.internal.pageSize.getWidth()
    
    // Logo alanı (şimdilik text)
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('MIVVO', 20, 20)
    
    // Rapor başlığı
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(data.title, 20, 30)
    
    // Rapor türü
    this.doc.setFontSize(12)
    this.doc.text(`Rapor Türü: ${this.getReportTypeName(data.reportType)}`, 20, 40)
    
    // Tarih
    const reportDate = new Date(data.createdAt).toLocaleDateString('tr-TR')
    this.doc.text(`Rapor Tarihi: ${reportDate}`, pageWidth - 60, 40)
    
    // Çizgi
    this.doc.setLineWidth(0.5)
    this.doc.line(20, 45, pageWidth - 20, 45)
  }

  private addVehicleInfo(vehicleInfo: PDFReportData['vehicleInfo']) {
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Araç Bilgileri', 20, 55)
    
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    
    const vehicleData = [
      ['Marka', vehicleInfo.brand],
      ['Model', vehicleInfo.model],
      ['Yıl', vehicleInfo.year.toString()],
      ['Plaka', vehicleInfo.plate || 'Belirtilmemiş'],
      ['Şase No', vehicleInfo.vin || 'Belirtilmemiş']
    ]
    
    autoTable(this.doc, {
      startY: 60,
      head: [['Özellik', 'Değer']],
      body: vehicleData,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 10 }
    })
  }

  private addAnalysisContent(data: PDFReportData) {
    const finalY = (this.doc as any).lastAutoTable.finalY || 80
    
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Analiz Sonuçları', 20, finalY + 10)
    
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    
    // Analiz türüne göre içerik ekle
    switch (data.reportType) {
      case 'damage':
        this.addDamageAnalysis(data.analysisData, finalY + 20)
        break
      case 'paint':
        this.addPaintAnalysis(data.analysisData, finalY + 20)
        break
      case 'audio':
        this.addAudioAnalysis(data.analysisData, finalY + 20)
        break
      case 'value':
        this.addValueAnalysis(data.analysisData, finalY + 20)
        break
      case 'comprehensive':
        this.addComprehensiveAnalysis(data.analysisData, finalY + 20)
        break
    }
  }

  private addDamageAnalysis(data: any, startY: number) {
    const tableData = [
      ['Genel Skor', `${data.overallScore || 'N/A'}/100`],
      ['Hasar Seviyesi', data.damageSeverity || 'N/A'],
      ['Tahmini Onarım Maliyeti', `${data.estimatedRepairCost || 0} TL`],
      ['Tahmini Onarım Süresi', `${data.estimatedRepairTime || 0} gün`]
    ]
    
    autoTable(this.doc, {
      startY: startY,
      head: [['Özellik', 'Değer']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [220, 53, 69] },
      styles: { fontSize: 10 }
    })
  }

  private addPaintAnalysis(data: any, startY: number) {
    const tableData = [
      ['Genel Skor', `${data.overallScore || 'N/A'}/100`],
      ['Boya Kalitesi', data.paintQuality || 'N/A'],
      ['Renk Kodu', data.colorAnalysis?.colorCode || 'N/A'],
      ['Renk Adı', data.colorAnalysis?.colorName || 'N/A'],
      ['Metalik', data.colorAnalysis?.isMetallic ? 'Evet' : 'Hayır'],
      ['Renk Eşleşmesi', `${data.colorAnalysis?.colorMatch || 0}%`]
    ]
    
    autoTable(this.doc, {
      startY: startY,
      head: [['Özellik', 'Değer']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 123, 255] },
      styles: { fontSize: 10 }
    })
  }

  private addAudioAnalysis(data: any, startY: number) {
    const tableData = [
      ['Genel Skor', `${data.overallScore || 'N/A'}/100`],
      ['Motor Sağlığı', data.engineHealth || 'N/A'],
      ['Boşta RPM', `${data.rpmAnalysis?.idleRpm || 0} rpm`],
      ['Maksimum RPM', `${data.rpmAnalysis?.maxRpm || 0} rpm`],
      ['RPM Kararlılığı', `${data.rpmAnalysis?.rpmStability || 0}%`],
      ['Ses Kalitesi', `${data.soundQuality?.overallQuality || 0}/100`]
    ]
    
    autoTable(this.doc, {
      startY: startY,
      head: [['Özellik', 'Değer']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [23, 162, 184] },
      styles: { fontSize: 10 }
    })
  }

  private addValueAnalysis(data: any, startY: number) {
    const tableData = [
      ['Tahmini Değer', `${data.estimatedValue || 0} TL`],
      ['Güven Skoru', `${data.confidence || 0}%`],
      ['Pazar Değeri', `${data.marketAnalysis?.currentMarketValue || 0} TL`],
      ['Pazar Trendi', data.marketAnalysis?.marketTrend || 'N/A'],
      ['Talep Seviyesi', data.marketAnalysis?.demandLevel || 'N/A'],
      ['Risk Seviyesi', data.investmentAnalysis?.riskLevel || 'N/A']
    ]
    
    autoTable(this.doc, {
      startY: startY,
      head: [['Özellik', 'Değer']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [40, 167, 69] },
      styles: { fontSize: 10 }
    })
  }

  private addComprehensiveAnalysis(data: any, startY: number) {
    const tableData = [
      ['Genel Skor', `${data.overallScore || 'N/A'}/100`],
      ['Ekspertiz Notu', data.expertiseGrade || 'N/A'],
      ['Uzman Önerisi', data.expertOpinion?.recommendation || 'N/A'],
      ['Yatırım Kararı', data.investmentDecision?.decision || 'N/A'],
      ['Beklenen Getiri', `%${data.investmentDecision?.expectedReturn || 0}`],
      ['Geri Ödeme Süresi', data.investmentDecision?.paybackPeriod || 'N/A']
    ]
    
    autoTable(this.doc, {
      startY: startY,
      head: [['Özellik', 'Değer']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [255, 193, 7] },
      styles: { fontSize: 10 }
    })
  }

  private addFooter(data: PDFReportData) {
    const pageHeight = this.doc.internal.pageSize.getHeight()
    const pageWidth = this.doc.internal.pageSize.getWidth()
    
    // Footer çizgisi
    this.doc.setLineWidth(0.5)
    this.doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30)
    
    // Footer metni
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Bu rapor MIVVO AI sistemi tarafından oluşturulmuştur.', 20, pageHeight - 20)
    this.doc.text(`Rapor ID: ${data.reportId}`, 20, pageHeight - 15)
    this.doc.text('Sorumluluk reddi: Bu rapor bilgilendirme amaçlıdır.', 20, pageHeight - 10)
    
    // Sayfa numarası
    const pageCount = this.doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      this.doc.text(`Sayfa ${i} / ${pageCount}`, pageWidth - 30, pageHeight - 10)
    }
  }

  private getReportTypeName(type: string): string {
    const typeNames: { [key: string]: string } = {
      'damage': 'Hasar Analizi',
      'paint': 'Boya Analizi',
      'audio': 'Motor Ses Analizi',
      'value': 'Değer Tahmini',
      'comprehensive': 'Kapsamlı Ekspertiz'
    }
    return typeNames[type] || type
  }
}

// Ana export fonksiyonu
export const generatePDFFromElement = async (
  element: HTMLElement,
  data: PDFReportData,
  options: PDFOptions = {}
): Promise<jsPDF> => {
  try {
    const generator = new PDFGenerator(options)
    const pdf = generator.generateReport(data)
    
    return pdf
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw new Error('PDF oluşturma başarısız oldu')
  }
}

// Basit PDF oluşturma fonksiyonu
export const createSimplePDF = (data: PDFReportData): jsPDF => {
  const generator = new PDFGenerator()
  return generator.generateReport(data)
}

// PDF indirme utility fonksiyonu
export const downloadPDF = (pdf: jsPDF, filename: string) => {
  try {
    pdf.save(filename)
  } catch (error) {
    console.error('PDF download failed:', error)
    throw new Error('PDF indirme başarısız oldu')
  }
}

export default PDFGenerator