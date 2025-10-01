import jsPDF from 'jspdf'
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
  success: '#16a34a',
  warning: '#f97316',
  danger: '#dc2626',
}

const drawHeader = (pdf: jsPDF, vehicleInfo: any, reportDate: string) => {
  const pageWidth = pdf.internal.pageSize.getWidth()

  // Header background
  pdf.setFillColor(15, 23, 42) // midnight
  pdf.rect(0, 0, pageWidth, 55, 'F')

  // Gradient effect simulation
  pdf.setFillColor(59, 130, 246) // blue
  pdf.rect(pageWidth * 0.6, 0, pageWidth * 0.4, 55, 'F')

  ensureTurkishFont(pdf)
  pdf.setFontSize(24)
  pdf.setTextColor(255, 255, 255)
  pdf.text('MİVVO EXPERTİZ', 20, 22)

  pdf.setFontSize(14)
  pdf.text('Değer Tahmini Raporu', 20, 34)

  pdf.setFontSize(10)
  pdf.text(`Rapor Tarihi: ${reportDate}`, 20, 44)

  // Vehicle info
  pdf.setFontSize(11)
  pdf.text(`${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`, pageWidth - 20, 24, { align: 'right' })
  pdf.setFontSize(9)
  pdf.text(`Plaka: ${vehicleInfo.plate}`, pageWidth - 20, 32, { align: 'right' })
}

const drawSectionTitle = (pdf: jsPDF, title: string, y: number, icon?: string) => {
  ensureTurkishFont(pdf)
  pdf.setFillColor(248, 250, 252)
  pdf.rect(20, y - 6, pdf.internal.pageSize.getWidth() - 40, 12, 'F')
  
  pdf.setFontSize(13)
  pdf.setTextColor(30, 58, 138)
  pdf.setFont('helvetica', 'bold')
  pdf.text(title, 24, y + 2)
  pdf.setFont('helvetica', 'normal')
  
  pdf.setDrawColor(226, 232, 240)
  pdf.setLineWidth(0.5)
  pdf.line(20, y + 8, pdf.internal.pageSize.getWidth() - 20, y + 8)
}

const drawValueCard = (pdf: jsPDF, x: number, y: number, title: string, value: string, color: string = palette.navy) => {
  ensureTurkishFont(pdf)
  
  // Card background
  pdf.setFillColor(248, 250, 252)
  pdf.roundedRect(x, y, 85, 28, 3, 3, 'F')
  pdf.setDrawColor(226, 232, 240)
  pdf.setLineWidth(0.3)
  pdf.roundedRect(x, y, 85, 28, 3, 3, 'S')
  
  pdf.setFontSize(9)
  pdf.setTextColor(148, 163, 184)
  pdf.text(title, x + 5, y + 8)
  
  pdf.setFontSize(14)
  pdf.setTextColor(color)
  pdf.setFont('helvetica', 'bold')
  pdf.text(value, x + 5, y + 18)
  pdf.setFont('helvetica', 'normal')
}

const drawKeyValue = (pdf: jsPDF, label: string, value: string, x: number, y: number) => {
  ensureTurkishFont(pdf)
  pdf.setFontSize(10)
  pdf.setTextColor(100, 116, 139)
  pdf.text(`${label}:`, x, y)
  
  pdf.setTextColor(15, 23, 42)
  const labelWidth = pdf.getTextWidth(`${label}: `)
  pdf.text(value, x + labelWidth, y)
}

const drawBulletList = (pdf: jsPDF, items: string[], startY: number, startX: number = 24, maxWidth: number = 165) => {
  let y = startY
  ensureTurkishFont(pdf)
  pdf.setFontSize(10)
  pdf.setTextColor(30, 41, 59)
  
  items.forEach(item => {
    // Draw bullet
    pdf.setFillColor(59, 130, 246)
    pdf.circle(startX, y - 1.5, 1, 'F')
    
    // Draw text
    const lines = pdf.splitTextToSize(item, maxWidth)
    pdf.text(lines, startX + 4, y)
    y += lines.length * 5 + 2
    
    // Check if need new page
    if (y > 270) {
      pdf.addPage()
      drawFooter(pdf)
      y = 30
    }
  })
  
  return y
}

const drawPriceBreakdown = (pdf: jsPDF, breakdown: any[], startY: number) => {
  let y = startY
  ensureTurkishFont(pdf)
  
  breakdown.forEach((item, index) => {
    if (y > 260) {
      pdf.addPage()
      drawFooter(pdf)
      y = 30
    }
    
    const impact = item.impact || 0
    const color = impact >= 0 ? '#16a34a' : '#dc2626'
    const sign = impact >= 0 ? '+' : ''
    
    // Background
    if (index % 2 === 0) {
      pdf.setFillColor(249, 250, 251)
      pdf.rect(20, y - 5, pdf.internal.pageSize.getWidth() - 40, 14, 'F')
    }
    
    pdf.setFontSize(10)
    pdf.setTextColor(30, 41, 59)
    pdf.text(item.factor || '', 24, y)
    
    pdf.setTextColor(color)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${sign}${impact.toLocaleString('tr-TR')} TL`, pdf.internal.pageSize.getWidth() - 24, y, { align: 'right' })
    pdf.setFont('helvetica', 'normal')
    
    pdf.setFontSize(8)
    pdf.setTextColor(100, 116, 139)
    const description = pdf.splitTextToSize(item.description || '', 140)
    pdf.text(description, 24, y + 5)
    
    y += 16
  })
  
  return y
}

const drawComparableVehicles = (pdf: jsPDF, vehicles: any[], startY: number) => {
  let y = startY
  ensureTurkishFont(pdf)
  
  vehicles.forEach((vehicle, index) => {
    if (y > 250) {
      pdf.addPage()
      drawFooter(pdf)
      y = 30
    }
    
    // Card
    pdf.setFillColor(248, 250, 252)
    pdf.roundedRect(20, y, pdf.internal.pageSize.getWidth() - 40, 32, 3, 3, 'F')
    pdf.setDrawColor(226, 232, 240)
    pdf.setLineWidth(0.3)
    pdf.roundedRect(20, y, pdf.internal.pageSize.getWidth() - 40, 32, 3, 3, 'S')
    
    // Vehicle info
    pdf.setFontSize(11)
    pdf.setTextColor(30, 58, 138)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${vehicle.year} ${vehicle.make} ${vehicle.model}`, 26, y + 8)
    pdf.setFont('helvetica', 'normal')
    
    // Details
    pdf.setFontSize(9)
    pdf.setTextColor(100, 116, 139)
    pdf.text(`Kilometre: ${vehicle.mileage?.toLocaleString('tr-TR') || 'N/A'} km`, 26, y + 16)
    pdf.text(`Durum: ${vehicle.condition || 'İyi'}`, 26, y + 22)
    pdf.text(`Konum: ${vehicle.location || 'Türkiye'}`, 26, y + 28)
    
    // Price
    pdf.setFontSize(13)
    pdf.setTextColor(22, 163, 74)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${vehicle.price?.toLocaleString('tr-TR') || '0'} TL`, pdf.internal.pageSize.getWidth() - 26, y + 16, { align: 'right' })
    pdf.setFont('helvetica', 'normal')
    
    pdf.setFontSize(8)
    pdf.setTextColor(148, 163, 184)
    pdf.text(`Benzerlik: %${vehicle.similarity || 90}`, pdf.internal.pageSize.getWidth() - 26, y + 24, { align: 'right' })
    
    y += 38
  })
  
  return y
}

const drawFooter = (pdf: jsPDF) => {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  
  pdf.setDrawColor(226, 232, 240)
  pdf.setLineWidth(0.5)
  pdf.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20)
  
  ensureTurkishFont(pdf)
  pdf.setFontSize(9)
  pdf.setTextColor(148, 163, 184)
  pdf.text('Bu rapor Mivvo Expertiz yapay zeka analiz sistemince hazırlanmıştır.', pageWidth / 2, pageHeight - 13, { align: 'center' })
  pdf.text('Gizlidir ve sadece yetkili kişi/kurumlarla paylaşılmalıdır.', pageWidth / 2, pageHeight - 8, { align: 'center' })
  
  // Page number
  const pageNumber = (pdf as any).internal.getCurrentPageInfo().pageNumber
  pdf.text(`Sayfa ${pageNumber}`, pageWidth - 20, pageHeight - 13, { align: 'right' })
}

export const generateValueEstimationPDF = async (report: any, analysis: any) => {
  const pdf = new jsPDF()
  ensureTurkishFont(pdf)
  
  // Page 1: Header and Overview
  drawHeader(pdf, report.vehicleInfo, new Date(report.createdAt).toLocaleDateString('tr-TR'))
  drawFooter(pdf)
  
  let y = 70
  
  // Estimated Value Cards
  drawValueCard(pdf, 20, y, 'TAHMİNİ DEĞER', `${analysis.estimatedValue?.toLocaleString('tr-TR') || '0'} TL`, '#16a34a')
  drawValueCard(pdf, 110, y, 'GÜVEN SEVİYESİ', `%${analysis.confidence || 0}`, '#2563eb')
  
  y += 38
  
  // Market Analysis
  drawSectionTitle(pdf, '📊 PİYASA ANALİZİ', y)
  y += 18
  
  if (analysis.marketAnalysis) {
    const ma = analysis.marketAnalysis
    drawKeyValue(pdf, 'Piyasa Değeri', `${ma.currentMarketValue?.toLocaleString('tr-TR') || '0'} TL`, 24, y)
    y += 7
    drawKeyValue(pdf, 'Piyasa Trendi', ma.marketTrend || 'Bilinmiyor', 24, y)
    y += 7
    drawKeyValue(pdf, 'Talep Seviyesi', ma.demandLevel || 'Orta', 24, y)
    y += 7
    drawKeyValue(pdf, 'Arz Seviyesi', ma.supplyLevel || 'Orta', 24, y)
    y += 12
    
    if (ma.priceRange) {
      drawValueCard(pdf, 24, y, 'MIN FİYAT', `${ma.priceRange.min?.toLocaleString('tr-TR') || '0'} TL`, '#dc2626')
      drawValueCard(pdf, 64, y, 'ORTALAMA', `${ma.priceRange.average?.toLocaleString('tr-TR') || '0'} TL`, '#f97316')
      drawValueCard(pdf, 104, y, 'MAX FİYAT', `${ma.priceRange.max?.toLocaleString('tr-TR') || '0'} TL`, '#16a34a')
      y += 35
    }
    
    if (ma.marketInsights && ma.marketInsights.length > 0) {
      drawSectionTitle(pdf, '💡 PİYASA GÖRÜŞLERİ', y)
      y += 12
      y = drawBulletList(pdf, ma.marketInsights.slice(0, 5), y)
      y += 5
    }
  }
  
  // Vehicle Condition
  if (y > 230) {
    pdf.addPage()
    drawFooter(pdf)
    y = 30
  }
  
  drawSectionTitle(pdf, '🚗 ARAÇ DURUMU', y)
  y += 18
  
  if (analysis.vehicleCondition) {
    const vc = analysis.vehicleCondition
    drawKeyValue(pdf, 'Genel Durum', vc.overallCondition || 'İyi', 24, y)
    y += 7
    drawKeyValue(pdf, 'Durum Skoru', `${vc.conditionScore || 0}/100`, 24, y)
    y += 7
    drawKeyValue(pdf, 'Kilometre Etkisi', vc.mileageImpact || 'Normal', 24, y)
    y += 7
    drawKeyValue(pdf, 'Yaş Etkisi', vc.ageImpact || 'Normal', 24, y)
    y += 12
    
    if (vc.conditionNotes && vc.conditionNotes.length > 0) {
      y = drawBulletList(pdf, vc.conditionNotes.slice(0, 5), y)
      y += 5
    }
  }
  
  // Price Breakdown
  if (analysis.priceBreakdown && analysis.priceBreakdown.breakdown) {
    if (y > 200) {
      pdf.addPage()
      drawFooter(pdf)
      y = 30
    }
    
    drawSectionTitle(pdf, '💰 FİYAT DETAYI', y)
    y += 12
    y = drawPriceBreakdown(pdf, analysis.priceBreakdown.breakdown, y)
    y += 10
  }
  
  // Market Position
  if (analysis.marketPosition) {
    if (y > 220) {
      pdf.addPage()
      drawFooter(pdf)
      y = 30
    }
    
    drawSectionTitle(pdf, '📍 PİYASA KONUMU', y)
    y += 18
    
    const mp = analysis.marketPosition
    drawKeyValue(pdf, 'Rekabet Pozisyonu', mp.competitivePosition || 'Orta', 24, y)
    y += 7
    drawKeyValue(pdf, 'Yüzdelik Dilim', `%${mp.percentile || 50}`, 24, y)
    y += 12
    
    if (mp.marketAdvantages && mp.marketAdvantages.length > 0) {
      ensureTurkishFont(pdf)
      pdf.setFontSize(11)
      pdf.setTextColor(22, 163, 74)
      pdf.setFont('helvetica', 'bold')
      pdf.text('✓ Avantajlar', 24, y)
      pdf.setFont('helvetica', 'normal')
      y += 8
      y = drawBulletList(pdf, mp.marketAdvantages.slice(0, 4), y)
      y += 5
    }
    
    if (mp.marketDisadvantages && mp.marketDisadvantages.length > 0) {
      if (y > 240) {
        pdf.addPage()
        drawFooter(pdf)
        y = 30
      }
      
      ensureTurkishFont(pdf)
      pdf.setFontSize(11)
      pdf.setTextColor(220, 38, 38)
      pdf.setFont('helvetica', 'bold')
      pdf.text('⚠ Dezavantajlar', 24, y)
      pdf.setFont('helvetica', 'normal')
      y += 8
      y = drawBulletList(pdf, mp.marketDisadvantages.slice(0, 4), y)
      y += 5
    }
  }
  
  // Recommendations
  if (analysis.recommendations) {
    pdf.addPage()
    drawFooter(pdf)
    y = 30
    
    drawSectionTitle(pdf, '💡 ÖNERİLER', y)
    y += 18
    
    const rec = analysis.recommendations
    
    if (rec.sellingPrice) {
      drawValueCard(pdf, 24, y, 'SATIŞ FİYATI (MIN)', `${rec.sellingPrice.min?.toLocaleString('tr-TR') || '0'} TL`, '#dc2626')
      drawValueCard(pdf, 64, y, 'OPTİMAL FİYAT', `${rec.sellingPrice.optimal?.toLocaleString('tr-TR') || '0'} TL`, '#f97316')
      drawValueCard(pdf, 104, y, 'MAX FİYAT', `${rec.sellingPrice.max?.toLocaleString('tr-TR') || '0'} TL`, '#16a34a')
      y += 35
    }
    
    if (rec.negotiationTips && rec.negotiationTips.length > 0) {
      drawSectionTitle(pdf, '🤝 PAZARLIK İPUÇLARI', y)
      y += 12
      y = drawBulletList(pdf, rec.negotiationTips.slice(0, 5), y)
      y += 5
    }
    
    if (rec.timingAdvice && rec.timingAdvice.length > 0) {
      if (y > 220) {
        pdf.addPage()
        drawFooter(pdf)
        y = 30
      }
      
      drawSectionTitle(pdf, '⏰ ZAMANLAMA TAVSİYELERİ', y)
      y += 12
      y = drawBulletList(pdf, rec.timingAdvice.slice(0, 5), y)
      y += 5
    }
  }
  
  // Comparable Vehicles
  if (analysis.comparableVehicles && analysis.comparableVehicles.length > 0) {
    pdf.addPage()
    drawFooter(pdf)
    y = 30
    
    drawSectionTitle(pdf, '🚙 BENZER ARAÇLAR', y)
    y += 12
    y = drawComparableVehicles(pdf, analysis.comparableVehicles.slice(0, 3), y)
  }
  
  // Investment Analysis
  if (analysis.investmentAnalysis) {
    if (y > 180 || pdf.internal.pages.length === 1) {
      pdf.addPage()
      drawFooter(pdf)
      y = 30
    }
    
    drawSectionTitle(pdf, '📈 YATIRIM ANALİZİ', y)
    y += 18
    
    const ia = analysis.investmentAnalysis
    drawKeyValue(pdf, 'Yatırım Notu', ia.investmentGrade || 'B', 24, y)
    y += 7
    drawKeyValue(pdf, 'Değer Artış Potansiyeli', ia.appreciationPotential || 'Düşük', 24, y)
    y += 7
    drawKeyValue(pdf, 'Değer Kaybı Oranı', ia.depreciationRate || 'Normal', 24, y)
    y += 7
    drawKeyValue(pdf, 'Likidite Skoru', `${ia.liquidityScore || 0}/100`, 24, y)
    y += 7
    drawKeyValue(pdf, 'Risk Seviyesi', ia.riskLevel || 'Orta', 24, y)
    y += 12
    
    if (ia.investmentNotes && ia.investmentNotes.length > 0) {
      y = drawBulletList(pdf, ia.investmentNotes.slice(0, 5), y)
    }
  }
  
  // Final page with AI info
  pdf.addPage()
  drawFooter(pdf)
  y = 30
  
  drawSectionTitle(pdf, 'ℹ️ RAPOR BİLGİLERİ', y)
  y += 18
  
  ensureTurkishFont(pdf)
  pdf.setFontSize(10)
  pdf.setTextColor(100, 116, 139)
  
  pdf.text(`AI Provider: ${analysis.aiProvider || 'OpenAI'}`, 24, y)
  y += 7
  pdf.text(`Güvenilirlik: %${analysis.confidence || 0}`, 24, y)
  y += 7
  pdf.text(`Analiz Zamanı: ${new Date(analysis.analysisTimestamp || report.createdAt).toLocaleString('tr-TR')}`, 24, y)
  y += 15
  
  pdf.setFillColor(239, 246, 255)
  pdf.roundedRect(20, y, pdf.internal.pageSize.getWidth() - 40, 30, 3, 3, 'F')
  
  pdf.setFontSize(9)
  pdf.setTextColor(37, 99, 235)
  const disclaimerText = 'Bu rapor yapay zeka destekli analiz sonuçlarını içermektedir. Nihai kararlar için profesyonel bir ekspertiz uzmanına danışmanız önerilir. Piyasa değerleri güncel verilere dayanmakta olup değişkenlik gösterebilir.'
  const lines = pdf.splitTextToSize(disclaimerText, pdf.internal.pageSize.getWidth() - 50)
  pdf.text(lines, 25, y + 8)
  
  // Save PDF
  const fileName = `Mivvo_Deger_Tahmini_${report.vehicleInfo.plate}_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.pdf`
  pdf.save(fileName)
}
