/**
 * Save Page as PDF Utility
 * 
 * html2pdf.js kullanarak bir HTML elementini PDF olarak kaydet
 * Beyaz arka planlı, yüksek kaliteli, okunaklı PDF çıktısı
 */

interface SavePageOptions {
  elementId: string
  filename: string
  margin?: number
  scale?: number
}

/**
 * HTML elementini PDF olarak indir
 * 
 * @param elementId - PDF'e dönüştürülecek element ID
 * @param filename - İndirilecek PDF dosya adı
 */
export async function savePageAsPDF(
  elementId: string, 
  filename: string
): Promise<void> {
  const element = document.getElementById(elementId)
  
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`)
  }
  
  // PDF için compact CSS ekle
  const styleElement = document.createElement('style')
  styleElement.id = 'pdf-export-styles'
  styleElement.innerHTML = `
    .pdf-exporting {
      padding: 0 !important;
      margin: 0 !important;
    }
    .pdf-exporting > * {
      margin-bottom: 8px !important;
    }
    .pdf-exporting .p-8 {
      padding: 12px !important;
    }
    .pdf-exporting .p-10 {
      padding: 16px !important;
    }
    .pdf-exporting .py-12 {
      padding-top: 16px !important;
      padding-bottom: 16px !important;
    }
    .pdf-exporting .mb-8 {
      margin-bottom: 8px !important;
    }
    .pdf-exporting .mb-6 {
      margin-bottom: 6px !important;
    }
    .pdf-exporting header,
    .pdf-exporting .no-print {
      display: none !important;
    }
  `
  document.head.appendChild(styleElement)
  
  // Element'e PDF class'ı ekle
  element.classList.add('pdf-exporting')
  
  const options: any = {
    margin: [5, 5, 5, 5],
    filename: filename,
    image: { 
      type: 'jpeg', 
      quality: 0.98 
    },
    html2canvas: { 
      scale: 2, 
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      letterRendering: true,
      scrollY: 0,
      scrollX: 0,
      windowWidth: 1200
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['.avoid-break', 'tr', 'td', 'img', '.card', 'table']
    }
  }
  
  try {
    const html2pdf = (await import('html2pdf.js')).default
    await html2pdf().set(options).from(element).save()
  } catch (error) {
    console.error('PDF oluşturma hatası:', error)
    throw error
  } finally {
    // Temizlik: Class ve style'ı kaldır
    element.classList.remove('pdf-exporting')
    const styleEl = document.getElementById('pdf-export-styles')
    if (styleEl) {
      styleEl.remove()
    }
  }
}

/**
 * Gelişmiş seçeneklerle PDF kaydet
 */
export async function savePageAsPDFWithOptions(
  options: SavePageOptions
): Promise<void> {
  const element = document.getElementById(options.elementId)
  
  if (!element) {
    throw new Error(`Element with ID "${options.elementId}" not found`)
  }
  
  const pdfOptions: any = {
    margin: options.margin || 10,
    filename: options.filename,
    image: { 
      type: 'jpeg', 
      quality: 0.98 
    },
    html2canvas: { 
      scale: options.scale || 2, 
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  }
  
  try {
    const html2pdf = (await import('html2pdf.js')).default
    await html2pdf().set(pdfOptions).from(element).save()
  } catch (error) {
    console.error('PDF oluşturma hatası:', error)
    throw error
  }
}

