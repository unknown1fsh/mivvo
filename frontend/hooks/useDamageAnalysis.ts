'use client'

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { VehicleInfo, UploadedImage } from '@/types/vehicle'
import { validateImageFile, formatValidationErrors } from '@/utils/fileValidation'

interface DamageAnalysisResult {
  reportId: string | number
  analysisResult: any
  message?: string
}

export const useDamageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const startDamageAnalysis = useCallback(async (
    vehicleInfo: VehicleInfo,
    images: UploadedImage[]
  ): Promise<DamageAnalysisResult> => {
    const toastId = 'damage-analysis'

    if (!vehicleInfo) {
      toast.error('Araç bilgileri eksik')
      throw new Error('Vehicle information is required')
    }

    const files = images?.filter(image => image?.file).map(image => image.file) || []

    if (files.length === 0) {
      toast.error('Hasar analizi için en az bir resim yüklemelisiniz')
      throw new Error('No images provided for damage analysis')
    }

    // Client-side resim validasyonu - sadece kritik hatalar kontrol edilir
    try {
      for (const file of files) {
        const validation = await validateImageFile(file, { strictMode: false }) // strictMode false - kalite uyarıları kaldırıldı
        if (!validation.isValid) {
          const formattedErrors = formatValidationErrors(validation.errors)
          toast.error(formattedErrors[0] || 'Resim formatı desteklenmiyor')
          throw new Error('Image validation failed')
        }
        // Kalite uyarıları kaldırıldı - kullanıcı deneyimi için
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Image validation failed') {
        throw error
      }
      console.error('Resim validasyon hatası:', error)
      toast.error('Resim dosyaları kontrol edilemedi')
      throw new Error('Image validation error')
    }

    setIsAnalyzing(true)

    try {
      toast.loading('Hasar analizi raporu hazırlanıyor...', { id: toastId })

      const endpoint = '/api/damage-analysis/start'
      const reportResponse = await api.post(endpoint, {
        vehicleInfo,
        analysisType: 'damage'
      })

      if (!reportResponse.data?.success) {
        throw new Error(reportResponse.data?.message || 'Rapor oluşturulamadı')
      }

      const reportId = reportResponse.data.data?.reportId
      if (!reportId) {
        throw new Error('Rapor ID alınamadı')
      }

      toast.loading('Fotoğraflar yükleniyor...', { id: toastId })

      const formData = new FormData()
      files.forEach(file => {
        formData.append('images', file)
      })

      const uploadResponse = await api.post(`/api/damage-analysis/${reportId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (!uploadResponse.data?.success) {
        throw new Error(uploadResponse.data?.message || 'Fotoğraflar yüklenemedi')
      }

      toast.loading('AI analizi başlatıldı...', { id: toastId })

      const analysisResponse = await api.post(`/api/damage-analysis/${reportId}/analyze`, {}, {
        timeout: 600000
      })

      if (!analysisResponse.data?.success) {
        throw new Error(analysisResponse.data?.message || 'AI analizi tamamlanamadı')
      }

      toast.success('Hasar analizi tamamlandı!', { id: toastId })

      return {
        reportId: analysisResponse.data.data?.reportId ?? reportId,
        analysisResult: analysisResponse.data.data?.analysisResult,
        message: analysisResponse.data.data?.message
      }
    } catch (error: any) {
      console.error('Damage analysis error:', error)
      const message = error?.response?.data?.message || error?.message || 'Hasar analizi sırasında bir hata oluştu'
      
      // Servis yoğunluğu mesajını özel olarak göster
      if (message.includes('servis yoğunluğu') || message.includes('yoğun ilgi')) {
        toast.error('🚨 ' + message, { 
          id: toastId, 
          duration: 8000,
          style: {
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #f59e0b'
          }
        })
      }
      // Kredi iadesi mesajını özel olarak göster
      else if (message.includes('iade') || error.response?.data?.creditRefunded) {
        toast.success('💳 ' + message, { id: toastId, duration: 5000 })
      } else {
        toast.error(message, { id: toastId })
      }
      
      throw new Error(message)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  return {
    isAnalyzing,
    startDamageAnalysis
  }
}
