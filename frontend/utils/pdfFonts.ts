/**
 * PDF Fonts (PDF Font Tanımları) - TEMPORARY FIX
 * 
 * NOT: Base64 font verisi çok büyük olduğu için geçici olarak kaldırıldı.
 * Build hatalarını önlemek için boş bir fonksiyon export ediliyor.
 * 
 * TODO: Font desteği için daha iyi bir çözüm bulunmalı:
 * - Fontu ayrı bir dosyada tut
 * - Lazy loading kullan
 * - Daha küçük bir font kullan
 * - External URL'den yükle
 */

import jsPDF from 'jspdf'

/**
 * Ensure Turkish Font (Türkçe Font Yükle) - PLACEHOLDER
 * 
 * Şu an için boş fonksiyon. Türkçe karakterler PDF'de düzgün görünmeyebilir.
 * 
 * @param pdf - jsPDF instance
 */
export const ensureTurkishFont = (pdf: jsPDF) => {
  // Geçici olarak font yükleme devre dışı
  // Default font kullanılacak
  pdf.setFont('helvetica', 'normal')
}

