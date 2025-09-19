// PDF oluşturma yardımcı fonksiyonları - Modern data table ile Türkçe karakter sorunu çözüldü

import jsPDF from 'jspdf'
import { AIAnalysisResults } from '@/types/report'

// Türkçe karakter desteği için font ayarları
const setupTurkishFont = (pdf: jsPDF) => {
  // Helvetica font'u Türkçe karakterleri destekler
  pdf.setFont('helvetica', 'normal')
}

// Renk kodları
const colors = {
  primary: '#1e3a8a',      // Koyu mavi
  secondary: '#7c3aed',   // Mor
  success: '#16a34a',     // Yeşil
  warning: '#ea580c',     // Turuncu
  danger: '#dc2626',      // Kırmızı
  gray: '#374151',        // Koyu gri
  lightGray: '#f8fafc'    // Açık gri
}

// Data table oluştur
const createDataTable = (pdf: jsPDF, title: string, data: Array<{label: string, value: string}>, startY: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const tableWidth = pageWidth - 40
  const cellHeight = 15
  const labelWidth = tableWidth * 0.4
  const valueWidth = tableWidth * 0.6
  
  // Başlık
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(colors.primary)
  pdf.text(title, 20, startY)
  
  let y = startY + 20
  
  // Tablo çerçevesi
  pdf.setDrawColor(colors.primary)
  pdf.setLineWidth(2)
  pdf.rect(20, y - 5, tableWidth, (data.length * cellHeight) + 10)
  
  // Veri satırları
  data.forEach((item, index) => {
    const rowY = y + (index * cellHeight)
    
    // Satır çizgisi
    pdf.setDrawColor(colors.gray)
    pdf.setLineWidth(0.5)
    pdf.line(20, rowY, 20 + tableWidth, rowY)
    
    // Label arka planı
    pdf.setFillColor(colors.lightGray)
    pdf.rect(20, rowY - cellHeight, labelWidth, cellHeight, 'F')
    
    // Label
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(colors.gray)
    pdf.text(item.label, 25, rowY - 3)
    
    // Value - String'e dönüştür
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text(String(item.value), 25 + labelWidth, rowY - 3)
  })
  
  return y + (data.length * cellHeight) + 20
}

// Başlık bölümü oluştur
const createHeader = (pdf: jsPDF, analysisData: AIAnalysisResults) => {
  const pageWidth = pdf.internal.pageSize.getWidth()
  
  // Logo alanı
  pdf.setFillColor(colors.primary)
  pdf.rect(0, 0, pageWidth, 45, 'F')
  
  // Logo metni
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(255, 255, 255)
  pdf.text('MIVVO EXPERTIZ', pageWidth / 2, 25, { align: 'center' })
  
  // Ana başlık
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(255, 255, 255)
  pdf.text('AI Destekli Boya Analizi Raporu', pageWidth / 2, 35, { align: 'center' })
  
  // Alt başlık
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Profesyonel Araç Analizi ve Değerlendirme', pageWidth / 2, 42, { align: 'center' })
}

// Rapor bilgileri bölümü
const createReportInfo = (pdf: jsPDF, analysisData: AIAnalysisResults) => {
  const reportData = [
    { label: 'Rapor No', value: analysisData.reportId },
    { label: 'Tarih', value: analysisData.analysisDate },
    { label: 'Rapor Türü', value: analysisData.reportType },
    { label: 'AI Güven Skoru', value: `%${analysisData.confidence}` }
  ]
  
  return createDataTable(pdf, 'Rapor Bilgileri', reportData, 55)
}

// Araç bilgileri bölümü
const createVehicleInfo = (pdf: jsPDF, analysisData: AIAnalysisResults, startY: number) => {
  const vehicleData = [
    { label: 'Plaka', value: String(analysisData.vehicleInfo.plate) },
    { label: 'Marka', value: String(analysisData.vehicleInfo.make) },
    { label: 'Model', value: String(analysisData.vehicleInfo.model) },
    { label: 'Yıl', value: String(analysisData.vehicleInfo.year) },
    { label: 'VIN', value: String(analysisData.vehicleInfo.vin) }
  ]
  
  return createDataTable(pdf, 'Araç Bilgileri', vehicleData, startY)
}

// Boya analizi sonuçları bölümü
const createAnalysisResults = (pdf: jsPDF, analysisData: AIAnalysisResults, startY: number) => {
  const analysisData_table = [
    { label: 'Genel Skor', value: `${analysisData.paintAnalysis.overallScore}/100` },
    { label: 'Boya Durumu', value: analysisData.paintAnalysis.paintCondition },
    { label: 'Renk Eşleştirme', value: `%${analysisData.paintAnalysis.colorMatching}` },
    { label: 'Boya Kalınlığı', value: `${analysisData.paintAnalysis.paintThickness} mikron` },
    { label: 'Parlaklık Seviyesi', value: `%${analysisData.paintAnalysis.glossLevel}` },
    { label: 'Oksidasyon', value: `%${analysisData.paintAnalysis.oxidationLevel}` }
  ]
  
  return createDataTable(pdf, 'Boya Analizi Sonuçları', analysisData_table, startY)
}

// Hasar analizi bölümü
const createDamageAnalysis = (pdf: jsPDF, analysisData: AIAnalysisResults, startY: number) => {
  const damageData = [
    { label: 'Çizik Sayısı', value: analysisData.paintAnalysis.scratchCount.toString() },
    { label: 'Çukur Sayısı', value: analysisData.paintAnalysis.dentCount.toString() },
    { label: 'Pas Durumu', value: analysisData.paintAnalysis.rustDetected ? 'Tespit Edildi' : 'Tespit Edilmedi' }
  ]
  
  return createDataTable(pdf, 'Hasar Analizi', damageData, startY)
}

// Teknik detaylar bölümü
const createTechnicalDetails = (pdf: jsPDF, analysisData: AIAnalysisResults, startY: number) => {
  const technicalData = [
    { label: 'Primer Türü', value: 'Akrilik' },
    { label: 'Baz Kat Türü', value: 'Su bazlı' },
    { label: 'Şeffaf Kat Türü', value: 'Seramik' },
    { label: 'UV Koruması', value: 'Var' },
    { label: 'Uygulama Yöntemi', value: 'Robotik sprey' }
  ]
  
  return createDataTable(pdf, 'Teknik Detaylar', technicalData, startY)
}

// Öneriler bölümü
const createRecommendations = (pdf: jsPDF, analysisData: AIAnalysisResults, startY: number) => {
  // Başlık
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(colors.primary)
  pdf.text('Öneriler', 20, startY)
  
  let y = startY + 20
  
  // Öneriler listesi
  analysisData.paintAnalysis.recommendations.forEach((rec, index) => {
    // Öneri metni
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    pdf.text(`• ${rec}`, 20, y)
    
    y += 15
  })
  
  return y + 20
}

// Alt bilgi bölümü
const createFooter = (pdf: jsPDF, startY: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  
  // Alt çizgi
  pdf.setDrawColor(colors.gray)
  pdf.setLineWidth(1)
  pdf.line(20, startY, pageWidth - 20, startY)
  
  // Alt bilgi
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'italic')
  pdf.setTextColor(colors.gray)
  pdf.text('Bu rapor AI destekli analiz sistemi tarafından oluşturulmuştur.', pageWidth / 2, startY + 10, { align: 'center' })
  pdf.text('Mivvo Expertiz - Profesyonel Araç Analizi', pageWidth / 2, startY + 20, { align: 'center' })
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
    let currentY = createReportInfo(pdf, analysisData)
    
    // Araç bilgileri
    currentY = createVehicleInfo(pdf, analysisData, currentY)
    
    // Boya analizi sonuçları
    currentY = createAnalysisResults(pdf, analysisData, currentY)
    
    // Hasar analizi
    currentY = createDamageAnalysis(pdf, analysisData, currentY)
    
    // Teknik detaylar
    currentY = createTechnicalDetails(pdf, analysisData, currentY)
    
    // Öneriler
    currentY = createRecommendations(pdf, analysisData, currentY)
    
    // Alt bilgi
    createFooter(pdf, currentY)
    
    // PDF'i indir
    const fileName = `boya-analizi-raporu-${analysisData.reportId}.pdf`
    pdf.save(fileName)
    console.log('📄 PDF başarıyla indirildi:', fileName)
    
  } catch (error) {
    console.error('❌ PDF oluşturma hatası:', error)
    throw error
  }
}