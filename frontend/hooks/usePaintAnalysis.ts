// Boya analizi custom hook'u

import { useState, useCallback } from 'react'
import { VehicleInfo } from '@/types/vehicle'
import toast from 'react-hot-toast'
import api from '@/lib/api'

export const usePaintAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')

  const performAnalysis = useCallback(async (vehicleInfo: VehicleInfo, uploadedImages: any[]) => {
    setIsAnalyzing(true)
    setProgress(0)
    setCurrentStep('')
    
    try {
      // 1. Analizi başlat
      setCurrentStep('Analiz başlatılıyor...')
      setProgress(10)
      
      const endpoint = '/api/paint-analysis/start'
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
      console.log('✅ Boya analizi başlatıldı, Report ID:', reportId)

      // 2. Resimleri yükle (eğer varsa)
      if (uploadedImages && uploadedImages.length > 0) {
        setCurrentStep('Resimler yükleniyor...')
        setProgress(25)
        
        console.log(`📸 ${uploadedImages.length} resim yüklenecek`)
        const formData = new FormData()
        
        for (const imageData of uploadedImages) {
          if (imageData.preview) {
            try {
              let blob: Blob
              
              // Base64 formatını kontrol et
              if (imageData.preview.startsWith('data:')) {
                // Base64'ü blob'a çevir
                const response = await fetch(imageData.preview)
                if (!response.ok) {
                  console.warn('Resim fetch edilemedi:', imageData.name)
                  continue
                }
                blob = await response.blob()
              } else {
                // URL ise direkt fetch et
                const response = await fetch(imageData.preview)
                if (!response.ok) {
                  console.warn('Resim URL\'si erişilemez:', imageData.name)
                  continue
                }
                blob = await response.blob()
              }
              
              formData.append('images', blob, imageData.name || 'image.jpg')
              console.log(`✅ Resim eklendi: ${imageData.name}`)
            } catch (imageError) {
              console.error('Resim işleme hatası:', imageError, imageData.name)
              continue
            }
          }
        }

        // Eğer formData'da resim varsa yükle
        if (formData.has('images')) {
          console.log('📤 Resimler backend\'e yükleniyor...')
          await api.post(`/api/paint-analysis/${reportId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          console.log('✅ Resimler başarıyla yüklendi')
          setProgress(40)
        } else {
          console.warn('⚠️ Yüklenecek resim bulunamadı - formData boş')
        }
      } else {
        console.warn('⚠️ Yüklenecek resim bulunamadı')
        setProgress(40)
      }

      // 3. AI analizi gerçekleştir
      setCurrentStep('AI analizi yapılıyor...')
      setProgress(60)
      
      // Timeout: 300 saniye (5 dakika) - trafik yoğunluğuna göre yeterli süre
      const analyzeResponse = await api.post(`/api/paint-analysis/${reportId}/analyze`, {}, {
        timeout: 300000 // 300000ms = 300 saniye = 5 dakika
      })

      if (!analyzeResponse.data.success) {
        throw new Error(analyzeResponse.data.message || 'Analiz gerçekleştirilemedi')
      }

      console.log('✅ Boya analizi tamamlandı')
      setProgress(90)
      setCurrentStep('Rapor hazırlanıyor...')

      // Kısa bir bekleme
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProgress(100)
      setCurrentStep('Tamamlandı!')
      
      toast.success('🎨 Boya analizi raporu başarıyla oluşturuldu!')
      
      return {
        reportId,
        id: reportId,
        ...analyzeResponse.data.data
      }
      
    } catch (error: any) {
      console.error('❌ Boya analizi hatası:', error)
      console.error('❌ Hata detayları:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      })
      
      // Daha detaylı hata mesajı
      let errorMessage = 'Boya analizi başarısız oldu'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
        if (error.response.data.details) {
          errorMessage += ` (${error.response.data.details.suggestion || ''})`
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      const statusCode = error?.response?.status
      
      // Yetersiz kredi durumu - direkt satın alma sayfasına yönlendir
      if (statusCode === 402 || errorMessage.includes('Yetersiz kredi') || errorMessage.includes('yetersiz bakiye') || errorMessage.includes('insufficient')) {
        toast.error(`💳 ${errorMessage}`, { 
          duration: 5000,
          action: {
            label: 'Kredi Satın Al',
            onClick: () => {
              window.location.href = '/dashboard/purchase'
            }
          }
        })
        // Otomatik yönlendirme
        setTimeout(() => {
          window.location.href = '/dashboard/purchase'
        }, 2000)
      }
      // Kredi iadesi mesajını özel olarak göster
      else if (errorMessage.includes('iade') || error.response?.data?.creditRefunded) {
        toast.success('💳 ' + errorMessage, { duration: 5000 })
      } else {
        toast.error(errorMessage)
      }
      
      throw error
    } finally {
      setIsAnalyzing(false)
      setProgress(0)
      setCurrentStep('')
    }
  }, [])

  return {
    isAnalyzing,
    progress,
    currentStep,
    performAnalysis
  }
}
