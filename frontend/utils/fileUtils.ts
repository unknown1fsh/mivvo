/**
 * File Utils (Dosya Yardımcı Fonksiyonları)
 * 
 * Clean Architecture - Utility Layer (Yardımcı Katman)
 * 
 * Bu dosya, dosya işlemleri için yardımcı fonksiyonlar sağlar.
 * 
 * Fonksiyonlar:
 * - validateFile: Dosya doğrulama
 * - createImagePreview: Görsel önizleme oluşturma
 * - formatFileSize: Dosya boyutu formatlama
 * - revokeImagePreview: Önizleme temizleme
 * 
 * Kullanım:
 * ```typescript
 * import { validateFile, createImagePreview } from '@/utils'
 * 
 * const { isValid, error } = validateFile(file)
 * const preview = createImagePreview(file)
 * ```
 */

import { UploadedImage } from '@/types/vehicle'
import { FILE_CONSTRAINTS } from '@/constants/formValidation'

/**
 * Validate File (Dosya Doğrula)
 * 
 * Yüklenen dosyanın geçerliliğini kontrol eder.
 * 
 * Kontroller:
 * - Dosya tipi (image/jpeg, image/png, image/webp, image/heic)
 * - Dosya boyutu (max 15MB)
 * 
 * @param file - Doğrulanacak dosya
 * 
 * @returns { isValid: boolean, error?: string }
 * 
 * @example
 * const { isValid, error } = validateFile(file)
 * if (!isValid) {
 *   alert(error)
 * }
 */
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const isValidType = FILE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)
  const isValidSize = file.size <= FILE_CONSTRAINTS.MAX_SIZE
  
  if (!isValidType) {
    return { isValid: false, error: `${file.name} geçerli bir resim dosyası değil!` }
  }
  
  if (!isValidSize) {
    return { isValid: false, error: `${file.name} çok büyük! Maksimum 15MB olmalı.` }
  }
  
  return { isValid: true }
}

/**
 * Create Image Preview (Görsel Önizleme Oluştur)
 * 
 * Yüklenen dosyadan UploadedImage objesi oluşturur.
 * 
 * Özellikler:
 * - Benzersiz ID oluşturur
 * - Blob URL preview oluşturur (URL.createObjectURL)
 * - UploadedImage tipinde obje döner
 * 
 * @param file - Görsel dosyası
 * 
 * @returns UploadedImage objesi
 * 
 * @example
 * const preview = createImagePreview(file)
 * setImages([...images, preview])
 * 
 * // Component'te göster:
 * <img src={preview.preview} alt={preview.name} />
 */
export const createImagePreview = (file: File): UploadedImage => {
  // Benzersiz ID oluştur
  const id = Math.random().toString(36).substr(2, 9)
  
  // Blob URL oluştur
  const preview = URL.createObjectURL(file)
  
  return {
    id,
    file,
    preview,
    name: file.name,
    size: file.size,
    status: 'uploaded'
  }
}

/**
 * Format File Size (Dosya Boyutu Formatla)
 * 
 * Byte cinsinden dosya boyutunu okunabilir formata çevirir.
 * 
 * @param bytes - Byte cinsinden boyut
 * 
 * @returns Formatlanmış boyut (örn: "1.5 MB")
 * 
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1536000) // "1.46 MB"
 * formatFileSize(15728640) // "15 MB"
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Revoke Image Preview (Görsel Önizleme Temizle)
 * 
 * createImagePreview ile oluşturulan Blob URL'i temizler.
 * 
 * ÖNEMLİ:
 * - Memory leak'i önlemek için mutlaka çağrılmalı!
 * - Component unmount olduğunda çağırılmalı
 * - Görsel silindiğinde çağırılmalı
 * 
 * @param image - UploadedImage objesi
 * 
 * @example
 * // Component cleanup
 * useEffect(() => {
 *   return () => {
 *     images.forEach(revokeImagePreview)
 *   }
 * }, [images])
 * 
 * // Görsel silme
 * const removeImage = (image: UploadedImage) => {
 *   revokeImagePreview(image)
 *   setImages(images.filter(img => img.id !== image.id))
 * }
 */
export const revokeImagePreview = (image: UploadedImage): void => {
  URL.revokeObjectURL(image.preview)
}
