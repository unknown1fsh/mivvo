// Tam expertiz custom hook'u

import { useState, useCallback } from 'react'
import { VehicleInfo, UploadedImage } from '@/types'
import toast from 'react-hot-toast'
import api from '@/lib/api'

export const useComprehensiveExpertise = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const performAnalysis = useCallback(async (
    vehicleInfo: VehicleInfo, 
    uploadedImages: UploadedImage[],
    audioFiles: any[]
  ) => {
    setIsAnalyzing(true)
    
    try {
      // 1. Analizi başlat
      toast.loading('Tam expertiz başlatılıyor...', { id: 'comprehensive-expertise' })
      
      const startResponse = await api.post('/comprehensive-expertise/start', {
        vehicleInfo: {
          plate: vehicleInfo.plate,
          make: vehicleInfo.make,
          model: vehicleInfo.model,
          year: vehicleInfo.year
        }
      })

      if (!startResponse.data.success) {
        throw new Error(startResponse.data.message || 'Analiz başlatılamadı')
      }

      const reportId = startResponse.data.data.reportId
      console.log('✅ Tam expertiz başlatıldı, Report ID:', reportId)

      // 2. Resimleri yükle
      if (uploadedImages.length > 0) {
        toast.loading('Resimler yükleniyor...', { id: 'comprehensive-expertise' })
        
        const formData = new FormData()
        
        for (const imageData of uploadedImages) {
          if (imageData.preview) {
            // Base64'ü blob'a çevir
            const response = await fetch(imageData.preview)
            const blob = await response.blob()
            formData.append('images', blob, imageData.name)
          }
        }

        await api.post(`/comprehensive-expertise/${reportId}/upload-images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        console.log('✅ Resimler yüklendi')
      }

      // 3. Ses dosyalarını yükle
      if (audioFiles.length > 0) {
        toast.loading('Ses dosyaları yükleniyor...', { id: 'comprehensive-expertise' })
        
        const formData = new FormData()
        
        for (const audio of audioFiles) {
          if (audio.file) {
            formData.append('audioFiles', audio.file)
          }
        }

        await api.post(`/comprehensive-expertise/${reportId}/upload-audio`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        console.log('✅ Ses dosyaları yüklendi')
      }

      // 4. Kapsamlı AI analizi gerçekleştir
      toast.loading('OpenAI ile kapsamlı analiz yapılıyor...', { id: 'comprehensive-expertise' })
      
      const analyzeResponse = await api.post(`/comprehensive-expertise/${reportId}/analyze`)

      if (!analyzeResponse.data.success) {
        throw new Error(analyzeResponse.data.message || 'Analiz gerçekleştirilemedi')
      }

      console.log('✅ Tam expertiz tamamlandı')

      toast.dismiss('comprehensive-expertise')
      toast.success('📋 Tam expertiz raporu başarıyla oluşturuldu!')
      
      return {
        reportId,
        id: reportId,
        ...analyzeResponse.data.data
      }
      
    } catch (error: any) {
      console.error('❌ Tam expertiz hatası:', error)
      toast.dismiss('comprehensive-expertise')
      toast.error(error.response?.data?.message || error.message || 'Tam expertiz başarısız oldu')
      throw error
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  return {
    isAnalyzing,
    performAnalysis
  }
}
