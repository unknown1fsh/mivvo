import jsPDF from 'jspdf'
import { AIAnalysisResults } from '@/types/report'
import { ensureTurkishFont } from './pdfFonts'

const palette = {
  midnight: '#0f172a',
  navy: '#1e3a8a',
  indigo: '#4c1d95',
  cyan: '#06b6d4',
  slate: '#475569',
  muted: '#94a3b8',
  surface: '#f8fafc',
  border: '#e2e8f0',
  accent: '#38bdf8',
}

const mm = (value: number) => Number(value.toFixed(2))

const drawSectionTitle = (pdf: jsPDF, title: string, y: number) => {
  ensureTurkishFont(pdf)
  pdf.setTextColor(palette.navy)
  pdf.setFontSize(14)
  pdf.text(title.toUpperCase(), 20, y)
  pdf.setDrawColor(palette.border)
  pdf.setLineWidth(0.6)
  pdf.line(20, y + 2, pdf.internal.pageSize.getWidth() - 20, y + 2)
}

const drawKeyValue = (pdf: jsPDF, label: string, value: string, x: number, y: number) => {
  ensureTurkishFont(pdf)
  pdf.setFontSize(10)
  pdf.setTextColor(palette.muted)
  pdf.text(label, x, y)
  pdf.setFontSize(12)
  pdf.setTextColor(palette.midnight)
  pdf.text(value, x, y + 6)
}

const drawSummaryCard = (pdf: jsPDF, options: { x: number; y: number; title: string; value: string; helper?: string; background?: string }) => {
  const { x, y, title, value, helper, background = '#ffffff' } = options
  ensureTurkishFont(pdf)
  pdf.setDrawColor(255, 255, 255)
  pdf.setFillColor(background)
  pdf.roundedRect(x, y, 55, 32, 4, 4, 'F')
  pdf.setDrawColor(palette.border)
  pdf.roundedRect(x, y, 55, 32, 4, 4, 'S')

  pdf.setFontSize(9)
  pdf.setTextColor(palette.muted)
  pdf.text(title.toUpperCase(), x + 4, y + 8)

  pdf.setFontSize(14)
  pdf.setTextColor(palette.navy)
  pdf.text(value, x + 4, y + 18)

  if (helper) {
    pdf.setFontSize(9)
    pdf.setTextColor(palette.slate)
    pdf.text(helper, x + 4, y + 26)
  }
}

const splitParagraph = (pdf: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5) => {
  ensureTurkishFont(pdf)
  pdf.setFontSize(11)
  pdf.setTextColor(palette.midnight)
  const lines = pdf.splitTextToSize(text, maxWidth)
  lines.forEach((line, index) => {
    pdf.text(line, x, y + index * lineHeight)
  })
  return y + lines.length * lineHeight
}

const drawRecommendationList = (pdf: jsPDF, items: string[], startY: number) => {
  let cursorY = startY
  const pageWidth = pdf.internal.pageSize.getWidth()
  const maxWidth = pageWidth - 40

  items.forEach((item) => {
    cursorY = splitParagraph(pdf, `• ${item}`, 24, cursorY, maxWidth)
    cursorY += 2
  })
  return cursorY
}

const drawFooter = (pdf: jsPDF) => {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  pdf.setDrawColor(palette.border)
  pdf.setLineWidth(0.5)
  pdf.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20)

  ensureTurkishFont(pdf)
  pdf.setFontSize(9)
  pdf.setTextColor(palette.muted)
  pdf.text('Bu rapor Mivvo Expertiz yapay zekâ analiz sistemince hazırlanmıştır.', pageWidth / 2, pageHeight - 13, { align: 'center' })
  pdf.text('Gizlidir ve sadece yetkili kişi/kurumlarla paylaşılmalıdır.', pageWidth / 2, pageHeight - 8, { align: 'center' })
}

const drawHeader = (pdf: jsPDF, analysis: AIAnalysisResults) => {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const gradientHeight = 58
  pdf.setFillColor(palette.navy)
  pdf.rect(0, 0, pageWidth, gradientHeight, 'F')
  pdf.setFillColor(palette.indigo)
  pdf.rect(pageWidth * 0.45, 0, pageWidth * 0.55, gradientHeight, 'F')

  ensureTurkishFont(pdf)
  pdf.setFontSize(22)
  pdf.setTextColor(255, 255, 255)
  pdf.text('MİVVO EXPERTİZ', 20, 24)

  pdf.setFontSize(13)
  pdf.text('AI Destekli Boya Analizi Raporu', 20, 36)

  pdf.setFontSize(10)
  pdf.text(`Rapor No: ${analysis.reportId}`, 20, 46)
  pdf.text(`Oluşturulma Tarihi: ${analysis.analysisDate}`, 20, 52)

  // Sağ taraf
  const severityBoxX = pageWidth - 80
  pdf.setFillColor(255, 255, 255, 0.12)
  pdf.roundedRect(severityBoxX, 16, 60, 32, 4, 4, 'F')
  pdf.setFontSize(12)
  pdf.text('AI Güven Skoru', severityBoxX + 5, 30)
  pdf.setFontSize(20)
  pdf.text(`${analysis.confidence}%`, severityBoxX + 5, 45)
}

export const generatePaintAnalysisPDF = async (analysisData: AIAnalysisResults): Promise<void> => {
  if (!analysisData.paintAnalysis) {
    throw new Error('Boya analizi verisi bulunamadı')
  }

  const pdf = new jsPDF('p', 'mm', 'a4')
  ensureTurkishFont(pdf)

  drawHeader(pdf, analysisData)

  // Özet kartları
  const { paintAnalysis } = analysisData
  const startY = 70
  drawSummaryCard(pdf, {
    x: 20,
    y: startY,
    title: 'Genel Skor',
    value: `${paintAnalysis.overallScore}/100`,
    helper: 'Genel boya kondisyonu'
  })
  drawSummaryCard(pdf, {
    x: 80,
    y: startY,
    title: 'Renk Eşleşmesi',
    value: `%${paintAnalysis.colorMatching}`,
    helper: 'Orijinal renkle uyum'
  })
  drawSummaryCard(pdf, {
    x: 140,
    y: startY,
    title: 'Parlaklık Seviyesi',
    value: `%${paintAnalysis.glossLevel}`,
    helper: 'Yüzey parlaklığı'
  })

  // Rapor bilgileri
  drawSectionTitle(pdf, 'RAPOR ÖZETİ', startY + 45)
  drawKeyValue(pdf, 'Rapor Numarası', analysisData.reportId, 20, startY + 58)
  drawKeyValue(pdf, 'Rapor Türü', analysisData.reportType, 90, startY + 58)
  drawKeyValue(pdf, 'Analiz Tarihi', analysisData.analysisDate, 20, startY + 74)
  drawKeyValue(pdf, 'Yüklenen Görseller', `${analysisData.uploadedImages} adet`, 90, startY + 74)

  // Araç bilgileri
  const vehicleInfoY = startY + 98
  drawSectionTitle(pdf, 'ARAÇ BİLGİLERİ', vehicleInfoY)
  const v = analysisData.vehicleInfo
  drawKeyValue(pdf, 'Plaka', v.plate || 'Belirtilmedi', 20, vehicleInfoY + 13)
  drawKeyValue(pdf, 'Marka', v.make || 'Belirtilmedi', 90, vehicleInfoY + 13)
  drawKeyValue(pdf, 'Model', v.model || 'Belirtilmedi', 20, vehicleInfoY + 29)
  drawKeyValue(pdf, 'Model Yılı', String(v.year || 'Belirtilmedi'), 90, vehicleInfoY + 29)
  drawKeyValue(pdf, 'Şasi / VIN', v.vin || 'Belirtilmedi', 20, vehicleInfoY + 45)

  // Boya analiz detayları
  const analysisY = vehicleInfoY + 70
  drawSectionTitle(pdf, 'ANALİZ DETAYLARI', analysisY)

  const detailRows = [
    { label: 'Boya Durumu', value: paintAnalysis.paintCondition },
    { label: 'Boya Kalınlığı', value: `${paintAnalysis.paintThickness} mikron` },
    { label: 'Çizik Sayısı', value: `${paintAnalysis.scratchCount} adet` },
    { label: 'Çukur Sayısı', value: `${paintAnalysis.dentCount} adet` },
    { label: 'Pas Durumu', value: paintAnalysis.rustDetected ? 'Tespit edildi' : 'Tespit edilmedi' },
    { label: 'Oksidasyon Oranı', value: `%${paintAnalysis.oxidationLevel}` }
  ]

  let detailY = analysisY + 13
  detailRows.forEach((row, index) => {
    const columnX = index % 2 === 0 ? 20 : 90
    const rowY = detailY + Math.floor(index / 2) * 18
    drawKeyValue(pdf, row.label, row.value, columnX, rowY)
  })

  // Öneriler
  let recommendationY = detailY + Math.ceil(detailRows.length / 2) * 18 + 12
  drawSectionTitle(pdf, 'BAKIM VE ONARIM ÖNERİLERİ', recommendationY)
  recommendationY = drawRecommendationList(pdf, paintAnalysis.recommendations, recommendationY + 12)

  // Footer
  drawFooter(pdf)

  const fileName = `mivvo-boya-analizi-${analysisData.reportId}.pdf`
  pdf.save(fileName)
}
