import jsPDF from 'jspdf'
import { ensureTurkishFont } from './pdfFonts'

const palette = {
  midnight: '#0f172a',
  purple: '#7c3aed',
  blue: '#2563eb',
  cyan: '#06b6d4',
  slate: '#475569',
  muted: '#94a3b8',
  success: '#16a34a',
  warning: '#f97316',
  danger: '#dc2626',
  border: '#e2e8f0',
}

const drawHeader = (pdf: jsPDF, vehicleInfo: any, reportDate: string) => {
  const pageWidth = pdf.internal.pageSize.getWidth()

  // Gradient header
  pdf.setFillColor(124, 58, 237) // purple
  pdf.rect(0, 0, pageWidth, 55, 'F')
  
  pdf.setFillColor(37, 99, 235) // blue
  pdf.rect(pageWidth * 0.5, 0, pageWidth * 0.5, 55, 'F')

  ensureTurkishFont(pdf)
  pdf.setFontSize(26)
  pdf.setTextColor(255, 255, 255)
  pdf.text('MİVVO EXPERTİZ', 20, 22)

  pdf.setFontSize(15)
  pdf.text('Kapsamlı Expertiz Raporu', 20, 34)

  pdf.setFontSize(10)
  pdf.text(`Rapor Tarihi: ${reportDate}`, 20, 44)

  // Vehicle info
  pdf.setFontSize(12)
  pdf.text(`${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`, pageWidth - 20, 24, { align: 'right' })
  pdf.setFontSize(9)
  pdf.text(`Plaka: ${vehicleInfo.plate}`, pageWidth - 20, 32, { align: 'right' })
}

const drawSectionTitle = (pdf: jsPDF, title: string, y: number) => {
  ensureTurkishFont(pdf)
  pdf.setFillColor(248, 250, 252)
  pdf.rect(20, y - 6, pdf.internal.pageSize.getWidth() - 40, 12, 'F')
  
  pdf.setFontSize(13)
  pdf.setTextColor(124, 58, 237)
  pdf.setFont('helvetica', 'bold')
  pdf.text(title, 24, y + 2)
  pdf.setFont('helvetica', 'normal')
  
  pdf.setDrawColor(226, 232, 240)
  pdf.setLineWidth(0.5)
  pdf.line(20, y + 8, pdf.internal.pageSize.getWidth() - 20, y + 8)
}

const drawScoreCard = (pdf: jsPDF, x: number, y: number, title: string, score: number, maxScore: number = 100) => {
  ensureTurkishFont(pdf)
  
  const percentage = (score / maxScore) * 100
  let color = '#dc2626' // red
  if (percentage >= 80) color = '#16a34a' // green
  else if (percentage >= 60) color = '#f97316' // orange
  else if (percentage >= 40) color = '#f59e0b' // yellow
  
  // Card
  pdf.setFillColor(248, 250, 252)
  pdf.roundedRect(x, y, 85, 32, 3, 3, 'F')
  pdf.setDrawColor(226, 232, 240)
  pdf.setLineWidth(0.3)
  pdf.roundedRect(x, y, 85, 32, 3, 3, 'S')
  
  pdf.setFontSize(9)
  pdf.setTextColor(148, 163, 184)
  pdf.text(title, x + 5, y + 8)
  
  pdf.setFontSize(20)
  pdf.setTextColor(color)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`${score}`, x + 5, y + 20)
  pdf.setFont('helvetica', 'normal')
  
  pdf.setFontSize(12)
  pdf.text(`/ ${maxScore}`, x + 5 + pdf.getTextWidth(`${score}`), y + 20)
  
  // Progress bar
  pdf.setFillColor(226, 232, 240)
  pdf.rect(x + 5, y + 24, 75, 3, 'F')
  pdf.setFillColor(color)
  pdf.rect(x + 5, y + 24, (75 * percentage) / 100, 3, 'F')
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

const drawBulletList = (pdf: jsPDF, items: string[], startY: number, startX: number = 24, color: string = '#2563eb') => {
  let y = startY
  ensureTurkishFont(pdf)
  pdf.setFontSize(10)
  pdf.setTextColor(30, 41, 59)
  
  items.forEach(item => {
    if (y > 270) {
      pdf.addPage()
      drawFooter(pdf)
      y = 30
    }
    
    // Bullet
    pdf.setFillColor(color)
    pdf.circle(startX, y - 1.5, 1, 'F')
    
    // Text
    const maxWidth = pdf.internal.pageSize.getWidth() - startX - 20
    const lines = pdf.splitTextToSize(item, maxWidth)
    pdf.text(lines, startX + 4, y)
    y += lines.length * 5 + 2
  })
  
  return y
}

const drawGradeBox = (pdf: jsPDF, grade: string, y: number) => {
  ensureTurkishFont(pdf)
  const pageWidth = pdf.internal.pageSize.getWidth()
  
  const gradeColors: Record<string, { bg: string; text: string; label: string }> = {
    'excellent': { bg: '#16a34a', text: '#ffffff', label: 'Mükemmel' },
    'good': { bg: '#22c55e', text: '#ffffff', label: 'İyi' },
    'fair': { bg: '#f97316', text: '#ffffff', label: 'Orta' },
    'poor': { bg: '#dc2626', text: '#ffffff', label: 'Zayıf' },
  }
  
  const gradeInfo = gradeColors[grade] || gradeColors['good']
  
  pdf.setFillColor(gradeInfo.bg)
  pdf.roundedRect((pageWidth - 100) / 2, y, 100, 25, 3, 3, 'F')
  
  pdf.setFontSize(11)
  pdf.setTextColor(gradeInfo.text)
  pdf.text('EKSPERTİZ NOTU', pageWidth / 2, y + 10, { align: 'center' })
  
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text(gradeInfo.label.toUpperCase(), pageWidth / 2, y + 20, { align: 'center' })
  pdf.setFont('helvetica', 'normal')
}

const drawRecommendationCard = (pdf: jsPDF, rec: any, y: number) => {
  ensureTurkishFont(pdf)
  const pageWidth = pdf.internal.pageSize.getWidth()
  
  const priorityColors: Record<string, string> = {
    'Yüksek': '#dc2626',
    'Orta': '#f97316',
    'Normal': '#3b82f6',
    'Düşük': '#94a3b8',
  }
  
  const color = priorityColors[rec.priority] || '#3b82f6'
  
  // Card background
  pdf.setFillColor(249, 250, 251)
  pdf.roundedRect(24, y, pageWidth - 48, 28, 2, 2, 'F')
  pdf.setDrawColor(226, 232, 240)
  pdf.setLineWidth(0.3)
  pdf.roundedRect(24, y, pageWidth - 48, 28, 2, 2, 'S')
  
  // Priority badge
  pdf.setFillColor(color)
  pdf.roundedRect(28, y + 4, 30, 6, 1, 1, 'F')
  pdf.setFontSize(7)
  pdf.setTextColor(255, 255, 255)
  pdf.text(rec.priority, 43, y + 8, { align: 'center' })
  
  // Action
  pdf.setFontSize(10)
  pdf.setTextColor(30, 41, 59)
  pdf.setFont('helvetica', 'bold')
  pdf.text(rec.action, 28, y + 16)
  pdf.setFont('helvetica', 'normal')
  
  // Cost & Benefit
  pdf.setFontSize(9)
  pdf.setTextColor(100, 116, 139)
  pdf.text(`Maliyet: ${rec.cost?.toLocaleString('tr-TR') || '0'} TL`, 28, y + 23)
  pdf.text(`Fayda: ${rec.benefit || 'Değer artışı'}`, pageWidth - 32, y + 23, { align: 'right' })
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
  
  const pageNumber = (pdf as any).internal.getCurrentPageInfo().pageNumber
  pdf.text(`Sayfa ${pageNumber}`, pageWidth - 20, pageHeight - 13, { align: 'right' })
}

export const generateComprehensiveExpertisePDF = async (report: any, analysis: any) => {
  const pdf = new jsPDF()
  ensureTurkishFont(pdf)
  
  // Page 1: Header & Overview
  drawHeader(pdf, report.vehicleInfo, new Date(report.createdAt).toLocaleDateString('tr-TR'))
  drawFooter(pdf)
  
  let y = 70
  
  // Overall Score
  drawScoreCard(pdf, 20, y, 'GENEL SKOR', analysis.overallScore || 0, 100)
  drawScoreCard(pdf, 110, y, 'GÜVEN SEVİYESİ', analysis.confidence || 0, 100)
  
  y += 42
  
  // Grade
  if (analysis.expertiseGrade) {
    drawGradeBox(pdf, analysis.expertiseGrade, y)
    y += 35
  }
  
  // Comprehensive Summary
  if (analysis.comprehensiveSummary) {
    drawSectionTitle(pdf, '📋 GENEL DEĞERLENDİRME', y)
    y += 18
    
    const cs = analysis.comprehensiveSummary
    
    if (cs.vehicleOverview) {
      ensureTurkishFont(pdf)
      pdf.setFontSize(10)
      pdf.setTextColor(30, 41, 59)
      const overview = pdf.splitTextToSize(cs.vehicleOverview, pdf.internal.pageSize.getWidth() - 48)
      pdf.text(overview, 24, y)
      y += overview.length * 5 + 10
    }
    
    if (cs.keyFindings && cs.keyFindings.length > 0) {
      ensureTurkishFont(pdf)
      pdf.setFontSize(11)
      pdf.setTextColor(22, 163, 74)
      pdf.setFont('helvetica', 'bold')
      pdf.text('✓ Önemli Bulgular', 24, y)
      pdf.setFont('helvetica', 'normal')
      y += 8
      y = drawBulletList(pdf, cs.keyFindings.slice(0, 5), y, 28, '#16a34a')
      y += 5
    }
    
    if (cs.criticalIssues && cs.criticalIssues.length > 0) {
      if (y > 240) {
        pdf.addPage()
        drawFooter(pdf)
        y = 30
      }
      
      ensureTurkishFont(pdf)
      pdf.setFontSize(11)
      pdf.setTextColor(220, 38, 38)
      pdf.setFont('helvetica', 'bold')
      pdf.text('⚠ Kritik Sorunlar', 24, y)
      pdf.setFont('helvetica', 'normal')
      y += 8
      y = drawBulletList(pdf, cs.criticalIssues.slice(0, 5), y, 28, '#dc2626')
      y += 5
    }
  }
  
  // Strengths & Weaknesses
  if (analysis.comprehensiveSummary?.strengths || analysis.comprehensiveSummary?.weaknesses) {
    if (y > 180) {
      pdf.addPage()
      drawFooter(pdf)
      y = 30
    }
    
    drawSectionTitle(pdf, '⚖️ GÜÇLÜ & ZAYIF YÖNLER', y)
    y += 18
    
    if (analysis.comprehensiveSummary.strengths && analysis.comprehensiveSummary.strengths.length > 0) {
      ensureTurkishFont(pdf)
      pdf.setFontSize(11)
      pdf.setTextColor(22, 163, 74)
      pdf.setFont('helvetica', 'bold')
      pdf.text('💪 Güçlü Yönler', 24, y)
      pdf.setFont('helvetica', 'normal')
      y += 8
      y = drawBulletList(pdf, analysis.comprehensiveSummary.strengths.slice(0, 5), y, 28, '#16a34a')
      y += 5
    }
    
    if (analysis.comprehensiveSummary.weaknesses && analysis.comprehensiveSummary.weaknesses.length > 0) {
      if (y > 240) {
        pdf.addPage()
        drawFooter(pdf)
        y = 30
      }
      
      ensureTurkishFont(pdf)
      pdf.setFontSize(11)
      pdf.setTextColor(220, 38, 38)
      pdf.setFont('helvetica', 'bold')
      pdf.text('⚠️ Zayıf Yönler', 24, y)
      pdf.setFont('helvetica', 'normal')
      y += 8
      y = drawBulletList(pdf, analysis.comprehensiveSummary.weaknesses.slice(0, 5), y, 28, '#f97316')
      y += 5
    }
  }
  
  // Expert Opinion
  if (analysis.expertOpinion) {
    pdf.addPage()
    drawFooter(pdf)
    y = 30
    
    drawSectionTitle(pdf, '👨‍🔧 UZMAN GÖRÜŞÜ', y)
    y += 18
    
    const eo = analysis.expertOpinion
    
    if (eo.recommendation) {
      const recLabels: Record<string, { label: string; color: string }> = {
        'buy': { label: 'SATIN AL', color: '#16a34a' },
        'consider': { label: 'DEĞERLENDİR', color: '#f97316' },
        'avoid': { label: 'UZAK DUR', color: '#dc2626' },
      }
      
      const recInfo = recLabels[eo.recommendation] || recLabels['consider']
      
      pdf.setFillColor(recInfo.color)
      pdf.roundedRect(24, y, 80, 18, 2, 2, 'F')
      
      ensureTurkishFont(pdf)
      pdf.setFontSize(9)
      pdf.setTextColor(255, 255, 255)
      pdf.text('ÖNERİ', 28, y + 7)
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text(recInfo.label, 28, y + 14)
      pdf.setFont('helvetica', 'normal')
      
      y += 25
    }
    
    if (eo.reasoning && eo.reasoning.length > 0) {
      y = drawBulletList(pdf, eo.reasoning.slice(0, 6), y)
      y += 5
    }
    
    if (eo.riskAssessment) {
      if (y > 230) {
        pdf.addPage()
        drawFooter(pdf)
        y = 30
      }
      
      drawSectionTitle(pdf, '⚠️ RİSK DEĞERLENDİRMESİ', y)
      y += 18
      
      drawKeyValue(pdf, 'Risk Seviyesi', eo.riskAssessment.level?.toUpperCase() || 'ORTA', 24, y)
      y += 12
      
      if (eo.riskAssessment.factors && eo.riskAssessment.factors.length > 0) {
        y = drawBulletList(pdf, eo.riskAssessment.factors.slice(0, 5), y)
        y += 5
      }
    }
    
    if (eo.opportunityAssessment) {
      if (y > 230) {
        pdf.addPage()
        drawFooter(pdf)
        y = 30
      }
      
      drawSectionTitle(pdf, '💡 FIRSAT DEĞERLENDİRMESİ', y)
      y += 18
      
      drawKeyValue(pdf, 'Fırsat Seviyesi', eo.opportunityAssessment.level?.toUpperCase() || 'İYİ', 24, y)
      y += 12
      
      if (eo.opportunityAssessment.factors && eo.opportunityAssessment.factors.length > 0) {
        y = drawBulletList(pdf, eo.opportunityAssessment.factors.slice(0, 5), y)
        y += 5
      }
    }
  }
  
  // Recommendations
  if (analysis.finalRecommendations) {
    pdf.addPage()
    drawFooter(pdf)
    y = 30
    
    const fr = analysis.finalRecommendations
    
    if (fr.immediate && fr.immediate.length > 0) {
      drawSectionTitle(pdf, '🚨 ACİL ÖNERİLER', y)
      y += 12
      
      fr.immediate.slice(0, 3).forEach((rec: any) => {
        if (y > 240) {
          pdf.addPage()
          drawFooter(pdf)
          y = 30
        }
        drawRecommendationCard(pdf, rec, y)
        y += 32
      })
      y += 5
    }
    
    if (fr.shortTerm && fr.shortTerm.length > 0) {
      if (y > 200) {
        pdf.addPage()
        drawFooter(pdf)
        y = 30
      }
      
      drawSectionTitle(pdf, '📅 KISA VADELİ ÖNERİLER', y)
      y += 12
      
      fr.shortTerm.slice(0, 3).forEach((rec: any) => {
        if (y > 240) {
          pdf.addPage()
          drawFooter(pdf)
          y = 30
        }
        drawRecommendationCard(pdf, rec, y)
        y += 32
      })
      y += 5
    }
    
    if (fr.longTerm && fr.longTerm.length > 0) {
      if (y > 200) {
        pdf.addPage()
        drawFooter(pdf)
        y = 30
      }
      
      drawSectionTitle(pdf, '🔮 UZUN VADELİ ÖNERİLER', y)
      y += 12
      
      fr.longTerm.slice(0, 3).forEach((rec: any) => {
        if (y > 240) {
          pdf.addPage()
          drawFooter(pdf)
          y = 30
        }
        drawRecommendationCard(pdf, rec, y)
        y += 32
      })
    }
  }
  
  // Investment Decision
  if (analysis.investmentDecision) {
    pdf.addPage()
    drawFooter(pdf)
    y = 30
    
    drawSectionTitle(pdf, '💰 YATIRIM KARARI', y)
    y += 18
    
    const id = analysis.investmentDecision
    
    drawKeyValue(pdf, 'Karar', id.decision?.toUpperCase() || 'İYİ YATIRIM', 24, y)
    y += 7
    drawKeyValue(pdf, 'Beklenen Getiri', `%${id.expectedReturn || 0}`, 24, y)
    y += 7
    drawKeyValue(pdf, 'Geri Ödeme Süresi', id.paybackPeriod || '1-2 yıl', 24, y)
    y += 7
    drawKeyValue(pdf, 'Risk Seviyesi', id.riskLevel?.toUpperCase() || 'ORTA', 24, y)
    y += 7
    drawKeyValue(pdf, 'Likidite Skoru', `${id.liquidityScore || 0}/100`, 24, y)
    y += 15
    
    if (id.financialSummary) {
      const fs = id.financialSummary
      
      drawSectionTitle(pdf, '💵 FİNANSAL ÖZET', y)
      y += 12
      
      pdf.setFillColor(249, 250, 251)
      pdf.roundedRect(24, y, pdf.internal.pageSize.getWidth() - 48, 50, 2, 2, 'F')
      
      ensureTurkishFont(pdf)
      pdf.setFontSize(10)
      pdf.setTextColor(100, 116, 139)
      
      y += 8
      drawKeyValue(pdf, 'Alış Fiyatı', `${fs.purchasePrice?.toLocaleString('tr-TR') || '0'} TL`, 30, y)
      y += 7
      drawKeyValue(pdf, 'Onarım Maliyeti', `${fs.immediateRepairs?.toLocaleString('tr-TR') || '0'} TL`, 30, y)
      y += 7
      drawKeyValue(pdf, 'Aylık Bakım', `${fs.monthlyMaintenance?.toLocaleString('tr-TR') || '0'} TL`, 30, y)
      y += 7
      drawKeyValue(pdf, 'Tahmini Satış Değeri', `${fs.estimatedResaleValue?.toLocaleString('tr-TR') || '0'} TL`, 30, y)
      y += 7
      
      pdf.setFontSize(11)
      pdf.setTextColor(22, 163, 74)
      pdf.setFont('helvetica', 'bold')
      drawKeyValue(pdf, 'Beklenen Kar', `${fs.expectedProfit?.toLocaleString('tr-TR') || '0'} TL (ROI: %${fs.roi || 0})`, 30, y)
      pdf.setFont('helvetica', 'normal')
    }
  }
  
  // Final page - AI Info
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
  
  // Disclaimer
  pdf.setFillColor(243, 244, 246)
  pdf.roundedRect(20, y, pdf.internal.pageSize.getWidth() - 40, 40, 3, 3, 'F')
  
  pdf.setFontSize(9)
  pdf.setTextColor(124, 58, 237)
  const disclaimerText = 'Bu kapsamlı expertiz raporu yapay zeka destekli multi-analiz sonuçlarını içermektedir. Hasar analizi, boya kalitesi, motor sağlığı ve değer tahmini gibi tüm veriler birleştirilerek değerlendirilmiştir. Nihai kararlar için profesyonel bir ekspertiz uzmanına danışmanız önerilir.'
  const lines = pdf.splitTextToSize(disclaimerText, pdf.internal.pageSize.getWidth() - 50)
  pdf.text(lines, 25, y + 8)
  
  // Save
  const fileName = `Mivvo_Kapsamli_Expertiz_${report.vehicleInfo.plate}_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.pdf`
  pdf.save(fileName)
}
