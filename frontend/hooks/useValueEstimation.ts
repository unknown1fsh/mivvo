// Değer tahmini custom hook'u

import { useState, useCallback } from 'react'
import { VehicleInfo } from '@/types/vehicle'
import toast from 'react-hot-toast'
import api from '@/lib/api'

export const useValueEstimation = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const performAnalysis = useCallback(async (vehicleInfo: VehicleInfo, uploadedImagesCount: number) => {
    setIsAnalyzing(true)
    
    try {
      // 1. Analizi başlat
      toast.loading('Değer tahmini başlatılıyor...', { id: 'value-estimation' })
      
      const endpoint = process.env.NODE_ENV === 'production' ? '/value-estimation/start' : '/api/value-estimation/start'
      const startResponse = await api.post(endpoint, {
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
      console.log('✅ Değer tahmini başlatıldı, Report ID:', reportId)

      // 2. Resimleri yükle (eğer varsa)
      if (uploadedImagesCount > 0) {
        toast.loading('Resimler yükleniyor...', { id: 'value-estimation' })
        
        // Global resimlerden al
        const savedImages = localStorage.getItem('globalVehicleImages')
        if (savedImages) {
          const images = JSON.parse(savedImages)
          const formData = new FormData()
          
          for (const imageData of images) {
            if (imageData.preview) {
              // Base64'ü blob'a çevir
              const response = await fetch(imageData.preview)
              const blob = await response.blob()
              formData.append('images', blob, imageData.name)
            }
          }

          await api.post(`/api/value-estimation/${reportId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          
          console.log('✅ Resimler yüklendi')
        }
      }

      // 3. AI analizi gerçekleştir
      toast.loading('Mivvo AI ile piyasa analizi yapılıyor...', { id: 'value-estimation' })
      
      const analyzeResponse = await api.post(`/api/value-estimation/${reportId}/analyze`)

      if (!analyzeResponse.data.success) {
        throw new Error(analyzeResponse.data.message || 'Analiz gerçekleştirilemedi')
      }

      console.log('✅ Değer tahmini tamamlandı')

      toast.dismiss('value-estimation')
      toast.success('💰 Değer tahmini raporu başarıyla oluşturuldu!')
      
      return {
        reportId,
        id: reportId,
        ...analyzeResponse.data.data
      }
      
    } catch (error: any) {
      console.error('❌ Değer tahmini hatası:', error)
      toast.dismiss('value-estimation')
      
      const message = error.response?.data?.message || error.message || 'Değer tahmini başarısız oldu'
      
      // Kredi iadesi mesajını özel olarak göster
      if (message.includes('iade') || error.response?.data?.creditRefunded) {
        toast.success('💳 ' + message, { duration: 5000 })
      } else {
        toast.error(message)
      }
      
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
