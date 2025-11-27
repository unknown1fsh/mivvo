/**
 * JSON Parser Utilities
 * AI yanıtlarını parse etmek ve validate etmek için yardımcı fonksiyonlar
 */

/**
 * AI yanıtından JSON çıkarır ve parse eder
 * @param rawText - AI'dan gelen ham metin
 * @returns Parse edilmiş JSON objesi
 */
export function parseAIResponse(rawText: string): any {
  try {
    // Önce direkt parse dene
    return JSON.parse(rawText)
  } catch (directParseError) {
    console.warn('[JSON Parser] Direkt JSON parse başarısız, fallback deneniyor...')
    
    // Fallback 1: JSON code block içinde olabilir
    const codeBlockMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/)
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1])
      } catch (e) {
        console.error('[JSON Parser] Code block içinde JSON parse hatası:', e)
      }
    }
    
    // Fallback 2: İlk { ve son } arası
    const start = rawText.indexOf('{')
    const end = rawText.lastIndexOf('}') + 1
    
    if (start === -1 || end === 0) {
      console.error('[JSON Parser] JSON bulunamadı. Raw response:', rawText.substring(0, 500))
      throw new Error('JSON payload bulunamadı. API yanıtı beklenmeyen formatta.')
    }
    
    const json = rawText.slice(start, end)
    try {
      return JSON.parse(json)
    } catch (e) {
      console.error('[JSON Parser] Extracted JSON parse hatası:', e)
      console.error('[JSON Parser] Extracted content:', json.substring(0, 500))
      throw new Error('JSON parse başarısız. API yanıtı geçersiz JSON formatında.')
    }
  }
}

/**
 * Objede eksik field'ları kontrol eder
 * @param obj - Kontrol edilecek obje
 * @param requiredFields - Zorunlu field'ların listesi
 * @returns Eksik field'ların listesi
 */
export function checkMissingFields(obj: any, requiredFields: string[]): string[] {
  if (!obj || typeof obj !== 'object') {
    return requiredFields
  }
  
  const missingFields: string[] = []
  
  for (const field of requiredFields) {
    if (!(field in obj)) {
      missingFields.push(field)
    }
  }
  
  return missingFields
}
