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
      toast.error('Ara� bilgileri eksik')
      throw new Error('Vehicle information is required')
    }

    const files = images?.filter(image => image?.file).map(image => image.file) || []

    if (files.length === 0) {
      toast.error('Hasar analizi i�in en az bir resim y�klemelisiniz')
      throw new Error('No images provided for damage analysis')
    }

    setIsAnalyzing(true)

    try {
      toast.loading('Hasar analizi raporu haz�rlan�yor...', { id: toastId })

      const reportResponse = await api.post('/damage-analysis/start', {
        vehicleInfo,
        analysisType: 'damage'
      })

      if (!reportResponse.data?.success) {
        throw new Error(reportResponse.data?.message || 'Rapor olu�turulamad�')
      }

      const reportId = reportResponse.data.data?.reportId
      if (!reportId) {
        throw new Error('Rapor ID al�namad�')
      }

      toast.loading('Foto�raflar y�kleniyor...', { id: toastId })

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
        throw new Error(uploadResponse.data?.message || 'Foto�raflar y�klenemedi')
      }

      toast.loading('AI analizi ba�lat�ld�...', { id: toastId })

      const analysisResponse = await api.post(`/damage-analysis/${reportId}/analyze`, {}, {
        timeout: 600000
      })

      if (!analysisResponse.data?.success) {
        throw new Error(analysisResponse.data?.message || 'AI analizi tamamlanamad�')
      }

      toast.success('Hasar analizi tamamland�!', { id: toastId })

      return {
        reportId: analysisResponse.data.data?.reportId ?? reportId,
        analysisResult: analysisResponse.data.data?.analysisResult,
        message: analysisResponse.data.data?.message
      }
    } catch (error: any) {
      console.error('Damage analysis error:', error)
      const message = error?.response?.data?.message || error?.message || 'Hasar analizi s�ras�nda bir hata olu�tu'
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
