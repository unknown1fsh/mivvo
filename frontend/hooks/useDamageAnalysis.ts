'use client'

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { VehicleInfo, UploadedImage } from '@/types/vehicle'

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

    setIsAnalyzing(true)

    try {
      toast.loading('Hasar analizi raporu hazırlanıyor...', { id: toastId })

      const endpoint = process.env.NODE_ENV === 'production' ? '/damage-analysis/start' : '/api/damage-analysis/start'
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

      const uploadResponse = await api.post(`/damage-analysis/${reportId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (!uploadResponse.data?.success) {
        throw new Error(uploadResponse.data?.message || 'Fotoğraflar yüklenemedi')
      }

      toast.loading('AI analizi başlatıldı...', { id: toastId })

      const analysisResponse = await api.post(`/damage-analysis/${reportId}/analyze`, {}, {
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
      toast.error(message, { id: toastId })
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
