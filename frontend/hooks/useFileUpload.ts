// Dosya yükleme custom hook'u

import { useState, useRef, useCallback } from 'react'
import { UploadedImage } from '@/types/vehicle'
import { validateFile, createImagePreview, revokeImagePreview } from '@/utils/fileUtils'
import toast from 'react-hot-toast'

export const useFileUpload = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFiles = useCallback((files: File[]) => {
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach(file => {
      const validation = validateFile(file)
      if (validation.isValid) {
        validFiles.push(file)
      } else {
        errors.push(validation.error!)
      }
    })

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
    }

    if (validFiles.length === 0) {
      toast.error('Geçerli resim dosyası bulunamadı!')
      return
    }

    setIsUploading(true)
    
    validFiles.forEach(file => {
      const newImage = createImagePreview(file)
      setUploadedImages(prev => [...prev, newImage])
    })
    
    setIsUploading(false)
    toast.success(`${validFiles.length} resim başarıyla yüklendi!`)
  }, [])

  const removeImage = useCallback((id: string) => {
    setUploadedImages(prev => {
      const image = prev.find(img => img.id === id)
      if (image) {
        revokeImagePreview(image)
      }
      return prev.filter(img => img.id !== id)
    })
  }, [])

  const clearAllImages = useCallback(() => {
    uploadedImages.forEach(revokeImagePreview)
    setUploadedImages([])
  }, [uploadedImages])

  return {
    uploadedImages,
    dragActive,
    isUploading,
    fileInputRef,
    handleDrag,
    handleDrop,
    handleFiles,
    removeImage,
    clearAllImages
  }
}
