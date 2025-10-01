import jsPDF from 'jspdf'
import { ensureTurkishFont } from './pdfFonts'
import { DamageAnalysisReportData, DamageAnalysisImageArea } from '@/types/damageAnalysis'

const palette = {
  midnight: '#0f172a',
  danger: '#dc2626',
  warning: '#f97316',
  success: '#16a34a',
  info: '#2563eb',
  indigo: '#4338ca',
  border: '#e2e8f0',
  muted: '#94a3b8',
  surface: '#f8fafc',
}

const severityColors: Record<string, string> = {
  low: '#22c55e',
  medium: '#f97316',
  high: '#dc2626',
  critical: '#991b1b',
}

const drawHeader = (pdf: jsPDF, report: DamageAnalysisReportData) => {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const severityColor = severityColors[report.damageSeverity] ?? palette.info

  pdf.setFillColor(palette.midnight)
  pdf.rect(0, 0, pageWidth, 58, 'F')
  pdf.setFillColor(severityColor)
  pdf.rect(pageWidth * 0.55, 0, pageWidth * 0.45, 58, 'F')

  ensureTurkishFont(pdf)
  pdf.setFontSize(22)
  pdf.setTextColor(255, 255, 255)
  pdf.text('MİVVO EXPERTİZ', 20, 24)

  pdf.setFontSize(13)
  pdf.text('Hasar Analizi Raporu', 20, 36)

  pdf.setFontSize(10)
  pdf.text(`Rapor No: ${report.id}`, 20, 46)
  pdf.text(`Analiz Tarihi: ${report.analysisDate}`, 20, 52)

  pdf.setFontSize(12)
  pdf.text('Hasar Seviyesi', pageWidth - 65, 24)
  pdf.setFontSize(20)
  pdf.text(report.damageSeverity.toUpperCase(), pageWidth - 65, 40)
  pdf.setFontSize(11)
  pdf.text(`Genel Skor: ${report.overallScore}/100`, pageWidth - 65, 50)
}

const drawKeyValue = (pdf: jsPDF, label: string, value: string, x: number, y: number) => {
  ensureTurkishFont(pdf)
  pdf.setFontSize(9)
  pdf.setTextColor(palette.muted)
  pdf.text(label, x, y)
  pdf.setFontSize(12)
  pdf.setTextColor(palette.midnight)
  pdf.text(value, x, y + 6)
}

const drawSummaryStrip = (pdf: jsPDF, report: DamageAnalysisReportData, startY: number) => {
  const totalCost = report.summary.estimatedRepairCost.toLocaleString('tr-TR')

  const cards = [
    { label: 'Toplam Hasar', value: `${report.summary.totalDamages} adet` },
    { label: 'Kritik Hasar', value: `${report.summary.criticalDamages} adet` },
    { label: 'Tahmini Onarım Bedeli', value: `₺${totalCost}` },
    { label: 'Sigorta Etkisi', value: report.summary.insuranceImpact }
  ]

  cards.forEach((card, index) => {
    const x = 20 + index * 45
    pdf.setDrawColor(palette.border)
    pdf.setFillColor(palette.surface)
    pdf.roundedRect(x, startY, 40, 30, 3, 3, 'F')
    pdf.roundedRect(x, startY, 40, 30, 3, 3, 'S')

    ensureTurkishFont(pdf)
    pdf.setFontSize(9)
    pdf.setTextColor(palette.muted)
    pdf.text(card.label, x + 4, startY + 8)
    pdf.setFontSize(11)
    pdf.setTextColor(palette.midnight)
    pdf.text(card.value, x + 4, startY + 19)
  })
}

const drawDamageTable = (pdf: jsPDF, areas: DamageAnalysisImageArea[], startY: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const columnWidths = [25, 35, 28, 30, 40]
  const headers = ['Alan', 'Açıklama', 'Şiddet', 'Onarım Süresi', 'Tahmini Maliyet']

  pdf.setFillColor(palette.surface)
  pdf.setDrawColor(palette.border)
  pdf.rect(20, startY, pageWidth - 40, 10, 'F')
  pdf.rect(20, startY, pageWidth - 40, 10, 'S')

  let cursorX = 22
  headers.forEach((header, index) => {
    ensureTurkishFont(pdf)
    pdf.setFontSize(10)
    pdf.setTextColor(palette.midnight)
    pdf.text(header, cursorX, startY + 7)
    cursorX += columnWidths[index]
  })

  let currentY = startY + 14
  const displayAreas = areas.slice(0, 8)
  displayAreas.forEach((area) => {
    ensureTurkishFont(pdf)
    pdf.setFontSize(9)
    pdf.setTextColor(palette.slate)
    const values = [
      area.type.toUpperCase(),
      area.description,
      area.severity.toUpperCase(),
      `${area.estimatedRepairCost > 0 ? Math.max(2, Math.ceil(area.estimatedRepairCost / 1200)) : 1} saat`,
      `₺${area.estimatedRepairCost.toLocaleString('tr-TR')}`
    ]

    let cellX = 22
    const rowHeight = 8
    values.forEach((value, idx) => {
      const text = pdf.splitTextToSize(value, columnWidths[idx] - 4)
      pdf.text(text, cellX, currentY)
      cellX += columnWidths[idx]
    })
    pdf.setDrawColor(palette.border)
    pdf.line(20, currentY + 2, pageWidth - 20, currentY + 2)
    currentY += rowHeight
  })

  return currentY
}

const drawSectionTitle = (pdf: jsPDF, title: string, y: number) => {
  ensureTurkishFont(pdf)
  pdf.setFontSize(13)
  pdf.setTextColor(palette.indigo)
  pdf.text(title.toUpperCase(), 20, y)
  pdf.setDrawColor(palette.border)
  pdf.line(20, y + 1.5, pdf.internal.pageSize.getWidth() - 20, y + 1.5)
}

const drawBulletList = (pdf: jsPDF, items: string[], x: number, startY: number, maxWidth: number) => {
  let cursorY = startY
  items.forEach((item) => {
    ensureTurkishFont(pdf)
    pdf.setFontSize(10)
    pdf.setTextColor(palette.midnight)
    const lines = pdf.splitTextToSize(`• ${item}`, maxWidth)
    lines.forEach((line, index) => {
      pdf.text(line, x, cursorY + index * 5)
    })
    cursorY += lines.length * 5 + 2
  })
  return cursorY
}

export const generateDamageAnalysisPDF = async (report: DamageAnalysisReportData): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4')
  ensureTurkishFont(pdf)

  drawHeader(pdf, report)
  drawSummaryStrip(pdf, report, 68)

  // Araç bilgileri
  drawSectionTitle(pdf, 'ARAÇ BİLGİLERİ', 110)
  drawKeyValue(pdf, 'Marka', report.vehicleInfo.make || 'Belirtilmedi', 20, 123)
  drawKeyValue(pdf, 'Model', report.vehicleInfo.model || 'Belirtilmedi', 90, 123)
  drawKeyValue(pdf, 'Model Yılı', String(report.vehicleInfo.year || 'Belirtilmedi'), 20, 139)
  drawKeyValue(pdf, 'Plaka', report.vehicleInfo.plate || 'Belirtilmedi', 90, 139)
  drawKeyValue(pdf, 'Şasi / VIN', report.vehicleInfo.vin || 'Belirtilmedi', 20, 155)

  // Hasar tablosu
  const flattenedAreas = report.images.flatMap((image) => image.damageAreas.map(area => ({ ...area, angle: image.angle })))
  const tableEnd = drawDamageTable(pdf, flattenedAreas, 176)

  let cursorY = tableEnd + 10
  drawSectionTitle(pdf, 'GÜVENLİK ÖZETİ', cursorY)
  cursorY = drawBulletList(pdf, report.summary.safetyConcerns, 24, cursorY + 8, pdf.internal.pageSize.getWidth() - 40)

  drawSectionTitle(pdf, 'ÖNERİLEN ADIMLAR', cursorY + 6)
  cursorY = drawBulletList(pdf, report.summary.recommendations, 24, cursorY + 14, pdf.internal.pageSize.getWidth() - 40)

  // Teknik detaylar
  cursorY += 4
  drawSectionTitle(pdf, 'TEKNİK DETAYLAR', cursorY + 12)
  drawKeyValue(pdf, 'Analiz Metodu', report.technicalDetails.analysisMethod, 20, cursorY + 26)
  drawKeyValue(pdf, 'AI Modeli', report.technicalDetails.aiModel, 90, cursorY + 26)
  drawKeyValue(pdf, 'İşleme Süresi', report.technicalDetails.processingTime, 20, cursorY + 42)
  drawKeyValue(pdf, 'Güven Skoru', `%${report.technicalDetails.confidence}`, 90, cursorY + 42)
  drawKeyValue(pdf, 'Görsel Kalitesi', report.technicalDetails.imageQuality, 20, cursorY + 58)

  // Footer
  const pageHeight = pdf.internal.pageSize.getHeight()
  pdf.setDrawColor(palette.border)
  pdf.line(20, pageHeight - 20, pdf.internal.pageSize.getWidth() - 20, pageHeight - 20)
  ensureTurkishFont(pdf)
  pdf.setFontSize(9)
  pdf.setTextColor(palette.muted)
  pdf.text('Bu rapor Mivvo Expertiz AI platformu tarafından hazırlanmıştır.', pdf.internal.pageSize.getWidth() / 2, pageHeight - 12, { align: 'center' })
  pdf.text('Detaylı teknik destek için support@mivvo.com adresiyle iletişime geçebilirsiniz.', pdf.internal.pageSize.getWidth() / 2, pageHeight - 7, { align: 'center' })

  pdf.save(`mivvo-hasar-analizi-${report.id}.pdf`)
}
