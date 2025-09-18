// PDF oluşturma yardımcı fonksiyonları - Temiz ve kullanıcı dostu tasarım

import jsPDF from 'jspdf'
import { AIAnalysisResults } from '@/types/report'

// Türkçe karakter desteği için font ayarları
const setupTurkishFont = (pdf: jsPDF) => {
  // Helvetica font'u Türkçe karakterleri destekler
  pdf.setFont('helvetica', 'normal')
}

// Renk kodları
const colors = {
  primary: '#2563eb',      // Mavi
  secondary: '#7c3aed',   // Mor
  success: '#16a34a',     // Yeşil
  warning: '#ea580c',     // Turuncu
  danger: '#dc2626',      // Kırmızı
  gray: '#6b7280',        // Gri
  lightGray: '#f8fafc'    // Açık gri
}

// Başlık bölümü oluştur
const createHeader = (pdf: jsPDF, analysisData: AIAnalysisResults) => {
  const pageWidth = pdf.internal.pageSize.getWidth()
  
  // Logo alanı
  pdf.setFillColor(colors.primary)
  pdf.rect(0, 0, pageWidth, 40, 'F')
  
  // Logo metni
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(255, 255, 255)
  pdf.text('MIVVO EXPERTIZ', pageWidth / 2, 20, { align: 'center' })
  
  // Ana başlık
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(255, 255, 255)
  pdf.text('AI Destekli Boya Analizi Raporu', pageWidth / 2, 30, { align: 'center' })
  
  // Alt başlık
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Profesyonel Araç Analizi ve Değerlendirme', pageWidth / 2, 36, { align: 'center' })
}

// Rapor bilgileri bölümü
const createReportInfo = (pdf: jsPDF, analysisData: AIAnalysisResults) => {
  let y = 50
  
  // Bölüm başlığı
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(colors.primary)
  pdf.text('Rapor Bilgileri', 20, y)
  
  y += 15
  
  // Bilgi kartları
  const infoCards = [
    { label: 'Rapor No', value: analysisData.reportId },
    { label: 'Tarih', value: analysisData.analysisDate },
    { label: 'Rapor Türü', value: analysisData.reportType },
    { label: 'AI Güven Skoru', value: `%${analysisData.confidence}` }
  ]
  
  infoCards.forEach((card, index) => {
    const x = 20 + (index % 2) * 85
    const cardY = y + Math.floor(index / 2) * 20
    
    // Label
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(colors.gray)
    pdf.text(card.label, x, cardY)
    
    // Value
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text(String(card.value), x, cardY + 8)
  })
}

// Araç bilgileri bölümü
const createVehicleInfo = (pdf: jsPDF, analysisData: AIAnalysisResults) => {
  let y = 130
  
  // Bölüm başlığı
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(colors.primary)
  pdf.text('Araç Bilgileri', 20, y)
  
  y += 15
  
  // Araç bilgileri tablosu
  const vehicleInfo = [
    { label: 'Plaka', value: analysisData.vehicleInfo.plate },
    { label: 'Marka', value: analysisData.vehicleInfo.brand },
    { label: 'Model', value: analysisData.vehicleInfo.model },
    { label: 'Yıl', value: analysisData.vehicleInfo.year },
    { label: 'Renk', value: analysisData.vehicleInfo.color },
    { label: 'Kilometre', value: analysisData.vehicleInfo.mileage }
  ]
  
  vehicleInfo.forEach((info, index) => {
    const x = 20 + (index % 2) * 85
    const infoY = y + Math.floor(index / 2) * 20
    
    // Label
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(colors.gray)
    pdf.text(info.label, x, infoY)
    
    // Value
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text(String(info.value), x, infoY + 8)
  })
}

// Boya analizi sonuçları bölümü
const createAnalysisResults = (pdf: jsPDF, analysisData: AIAnalysisResults) => {
  let y = 210
  
  // Bölüm başlığı
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(colors.primary)
  pdf.text('Boya Analizi Sonuçları', 20, y)
  
  y += 15
  
  // Genel skor
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(0, 0, 0)
  pdf.text('Genel Skor:', 20, y)
  pdf.text(`${analysisData.paintAnalysis.overallScore}/100`, 60, y)
  
  y += 15
  
  // Boya durumu
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(0, 0, 0)
  pdf.text('Boya Durumu:', 20, y)
  pdf.text(analysisData.paintAnalysis.paintCondition, 60, y)
  
  y += 15
  
  // Detaylı metrikler
  const metrics = [
    { label: 'Renk Eşleştirme', value: `%${analysisData.paintAnalysis.colorMatch}` },
    { label: 'Boya Kalınlığı', value: `${analysisData.paintAnalysis.paintThickness} mikron` },
    { label: 'Parlaklık Seviyesi', value: `%${analysisData.paintAnalysis.glossLevel}` },
    { label: 'Oksidasyon', value: `%${analysisData.paintAnalysis.oxidation}` }
  ]
  
  metrics.forEach((metric, index) => {
    const x = 20 + (index % 2) * 85
    const metricY = y + Math.floor(index / 2) * 15
    
    // Label
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(colors.gray)
    pdf.text(metric.label, x, metricY)
    
    // Value
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text(String(metric.value), x, metricY + 8)
  })
  
  y += 50
  
  // Hasar bilgileri
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(colors.primary)
  pdf.text('Hasar Analizi', 20, y)
  
  y += 15
  
  const damageInfo = [
    { label: 'Çizik Sayısı', value: analysisData.paintAnalysis.scratches.toString() },
    { label: 'Çukur Sayısı', value: analysisData.paintAnalysis.dents.toString() },
    { label: 'Pas Durumu', value: analysisData.paintAnalysis.rust ? 'Tespit Edildi' : 'Tespit Edilmedi' }
  ]
  
  damageInfo.forEach((damage, index) => {
    const x = 20 + (index % 2) * 85
    const damageY = y + Math.floor(index / 2) * 15
    
    // Label
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(colors.gray)
    pdf.text(damage.label, x, damageY)
    
    // Value
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(damage.value.includes('Tespit Edildi') ? colors.danger : colors.success)
    pdf.text(String(damage.value), x, damageY + 8)
  })
}

// Öneriler bölümü
const createRecommendations = (pdf: jsPDF, analysisData: AIAnalysisResults) => {
  let y = 300
  
  // Bölüm başlığı
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(colors.primary)
  pdf.text('Öneriler', 20, y)
  
  y += 15
  
  // Öneriler listesi
  analysisData.paintAnalysis.recommendations.forEach((rec, index) => {
    // Öneri metni
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    pdf.text(`• ${rec}`, 20, y)
    
    y += 12
  })
}

// Teknik detaylar bölümü
const createTechnicalDetails = (pdf: jsPDF, analysisData: AIAnalysisResults) => {
  let y = 360
  
  // Bölüm başlığı
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(colors.primary)
  pdf.text('Teknik Detaylar', 20, y)
  
  y += 15
  
  // Teknik detaylar tablosu
  const technicalDetails = [
    { label: 'Primer Türü', value: analysisData.paintAnalysis.technicalDetails.primerType },
    { label: 'Baz Kat Türü', value: analysisData.paintAnalysis.technicalDetails.baseCoatType },
    { label: 'Şeffaf Kat Türü', value: analysisData.paintAnalysis.technicalDetails.clearCoatType },
    { label: 'UV Koruması', value: analysisData.paintAnalysis.technicalDetails.uvProtection ? 'Var' : 'Yok' },
    { label: 'Uygulama Yöntemi', value: analysisData.paintAnalysis.technicalDetails.applicationMethod }
  ]
  
  technicalDetails.forEach((detail, index) => {
    const x = 20 + (index % 2) * 85
    const detailY = y + Math.floor(index / 2) * 15
    
    // Label
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(colors.gray)
    pdf.text(detail.label, x, detailY)
    
    // Value
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text(String(detail.value), x, detailY + 8)
  })
}

// Alt bilgi bölümü
const createFooter = (pdf: jsPDF) => {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  
  // Alt çizgi
  pdf.setDrawColor(colors.gray)
  pdf.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30)
  
  // Alt bilgi
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'italic')
  pdf.setTextColor(colors.gray)
  pdf.text('Bu rapor AI destekli analiz sistemi tarafından oluşturulmuştur.', pageWidth / 2, pageHeight - 20, { align: 'center' })
  pdf.text('Mivvo Expertiz - Profesyonel Araç Analizi', pageWidth / 2, pageHeight - 10, { align: 'center' })
}

export const generatePaintAnalysisPDF = async (analysisData: AIAnalysisResults): Promise<void> => {
  try {
    console.log('📄 PDF oluşturma başlatıldı:', analysisData)
    
    // PDF oluştur
    const pdf = new jsPDF('p', 'mm', 'a4')
    console.log('📄 PDF instance oluşturuldu')
    
    // Türkçe karakter desteği
    setupTurkishFont(pdf)
    
    // Başlık
    createHeader(pdf, analysisData)
    
    // Rapor bilgileri
    createReportInfo(pdf, analysisData)
    
    // Araç bilgileri
    createVehicleInfo(pdf, analysisData)
    
    // Boya analizi sonuçları
    createAnalysisResults(pdf, analysisData)
    
    // Öneriler
    createRecommendations(pdf, analysisData)
    
    // Teknik detaylar
    createTechnicalDetails(pdf, analysisData)
    
    // Alt bilgi
    createFooter(pdf)
    
    // PDF'i indir
    const fileName = `boya-analizi-raporu-${analysisData.reportId}.pdf`
    pdf.save(fileName)
    console.log('📄 PDF başarıyla indirildi:', fileName)
    
  } catch (error) {
    console.error('❌ PDF oluşturma hatası:', error)
    throw error
  }
}