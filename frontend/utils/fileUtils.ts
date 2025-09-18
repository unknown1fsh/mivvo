// Dosya işlemleri yardımcı fonksiyonları

import { UploadedImage } from '@/types/vehicle'
import { FILE_CONSTRAINTS } from '@/constants/formValidation'

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

export const createImagePreview = (file: File): UploadedImage => {
  const id = Math.random().toString(36).substr(2, 9)
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

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const revokeImagePreview = (image: UploadedImage): void => {
  URL.revokeObjectURL(image.preview)
}
