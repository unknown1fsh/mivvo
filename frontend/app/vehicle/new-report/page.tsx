'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { 
  SparklesIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp } from '@/components/motion'
import { ProgressBar } from '@/components/ui'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// Types
import { ReportType, VehicleInfo } from '@/types'

// Components
import { ReportTypeSelector } from '@/components/features/ReportTypeSelector'
import { VehicleInfoForm } from '@/components/features/VehicleInfoForm'
import { ImageUploader } from '@/components/features/ImageUploader'
import { AudioRecorder } from '@/components/features/AudioRecorder'
import { ReportSummary } from '@/components/features/ReportSummary'
import { StepIndicator } from '@/components/features/StepIndicator'
import DamageAnalysisGuide from '@/components/features/DamageAnalysisGuide'
import PhotoQualityChecker from '@/components/features/PhotoQualityChecker'

// Constants
import { REPORT_TYPES, STEPS, getStepsForReportType } from '@/constants'

// Hooks
import { useFormSteps } from '@/hooks/useFormSteps'
import { useFileUpload } from '@/hooks/useFileUpload'
import { usePaintAnalysis } from '@/hooks/usePaintAnalysis'
import { useAudioRecording } from '@/hooks/useAudioRecording'
import { useAuth } from '@/hooks'

// Services
import { vehicleGarageService } from '@/services'
import { VehicleGarage } from '@/types'

// Utils
import toast from 'react-hot-toast'

const schema = yup.object({
  vehiclePlate: yup.string().matches(/^[0-9]{2}\s[A-Z]{1,3}\s[0-9]{2,4}$/, 'Geçerli plaka formatı: 34 ABC 123'),
  vehicleBrand: yup.string().required('Marka zorunludur'),
  vehicleModel: yup.string().required('Model zorunludur'),
  vehicleYear: yup.number().min(1900).max(new Date().getFullYear() + 1).required('Yıl zorunludur'),
  vehicleColor: yup.string().required('Renk zorunludur'),
  mileage: yup.number().min(0).optional(),
})

type FormData = yup.InferType<typeof schema>

function NewReportPageContent() {
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading, requireAuth } = useAuth()
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null)
  const [vehicles, setVehicles] = useState<VehicleGarage[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleGarage | null>(null)
  const [useGarageVehicle, setUseGarageVehicle] = useState(false)
  const [useGlobalImages, setUseGlobalImages] = useState(true)
  const [reportSpecificImages, setReportSpecificImages] = useState<any[]>([])
  
  // Dinamik adımları hesapla
  const currentSteps = selectedReportType 
    ? getStepsForReportType(selectedReportType.id) 
    : STEPS
  
  const { currentStep, nextStep, prevStep, progress } = useFormSteps(currentSteps)
  const fileUploadProps = useFileUpload()
  const { isAnalyzing, performAnalysis } = usePaintAnalysis()
  const audioRecordingProps = useAudioRecording()

  // Hasar analizi fonksiyonu
  const performDamageAnalysis = async (vehicleInfo: VehicleInfo, imageCount: number) => {
    try {
      console.log('🔧 Hasar analizi başlatılıyor:', { vehicleInfo, imageCount })
      
      // Resim kontrolü
      if (imageCount === 0 || fileUploadProps.uploadedImages.length === 0) {
        throw new Error('Hasar analizi için en az bir resim gereklidir')
      }

      // İlk olarak hasar analizi raporu oluştur
      console.log('📝 Hasar analizi raporu oluşturuluyor...')
      const reportResponse = await api.post('/damage-analysis/start', {
        vehicleInfo,
        analysisType: 'damage'
      })
      
      if (reportResponse.data.success) {
        const reportId = reportResponse.data.data.reportId
        console.log('✅ Hasar analizi raporu oluşturuldu:', reportId)
        
        // Resimleri yükle
        console.log('📸 Resimler yükleniyor...')
        const formData = new FormData()
        
        fileUploadProps.uploadedImages.forEach((image, index) => {
          if (image.file) {
            formData.append('images', image.file)
          }
        })
        
        const uploadResponse = await api.post(`/damage-analysis/${reportId}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        if (uploadResponse.data.success) {
          console.log('✅ Resimler yüklendi')
          
          // Raporu tamamla - Backend'de AI analizi yapılacak
          console.log('🔍 Backend AI analizi başlatılıyor...')
          const analysisResponse = await api.post(`/damage-analysis/${reportId}/analyze`, {}, {
            timeout: 600000 // 10 dakika timeout
          })
          
          if (analysisResponse.data.success) {
            console.log('✅ AI analizi tamamlandı')
            return {
              id: reportId,
              reportId: reportId,
              status: 'completed',
              analysisResult: analysisResponse.data.data.analysisResult
            }
          } else {
            throw new Error('AI analizi başarısız')
          }
        } else {
          throw new Error('Resimler yüklenemedi')
        }
      } else {
        throw new Error('Rapor oluşturulamadı')
      }
    } catch (error) {
      console.error('❌ Hasar analizi hatası:', error)
      throw error
    }
  }


  // Global resimleri yükle
  useEffect(() => {
    const savedImages = localStorage.getItem('globalVehicleImages')
    if (savedImages) {
      try {
        const images = JSON.parse(savedImages)
        images.forEach((imageData: any) => {
          if (imageData.preview) {
            const mockFile = new File([''], imageData.name, { type: 'image/jpeg' })
            Object.defineProperty(mockFile, 'preview', {
              value: imageData.preview,
              writable: false
            })
            
            const uploadedImage = {
              id: imageData.id,
              file: mockFile,
              preview: imageData.preview,
              name: imageData.name,
              size: imageData.size,
              status: 'uploaded' as const,
              type: imageData.type || 'exterior'
            }
            
            fileUploadProps.setUploadedImages(prev => {
              const exists = prev.some(img => img.id === imageData.id)
              if (!exists) {
                return [...prev, uploadedImage]
              }
              return prev
            })
          }
        })
      } catch (error) {
        console.error('Global resim verileri yüklenirken hata:', error)
      }
    }
  }, [])

  // Araç Garajı yükle
  useEffect(() => {
    const loadVehicles = async () => {
      if (!authLoading && requireAuth()) {
        try {
          const data = await vehicleGarageService.getVehicleGarage()
          setVehicles(data)
          
          // URL'den vehicleId varsa o aracı seç
          const vehicleId = searchParams.get('vehicleId')
          if (vehicleId && data.length > 0) {
            const vehicle = data.find(v => v.id === parseInt(vehicleId))
            if (vehicle) {
              setSelectedVehicle(vehicle)
              setUseGarageVehicle(true)
              
              // Form değerlerini doldur
              setValue('vehiclePlate', vehicle.plate)
              setValue('vehicleBrand', vehicle.brand)
              setValue('vehicleModel', vehicle.model)
              setValue('vehicleYear', vehicle.year)
              setValue('vehicleColor', vehicle.color || '')
              setValue('mileage', vehicle.mileage || 0)
            }
          }
        } catch (error) {
          console.error('Araç garajı yüklenirken hata:', error)
        }
      }
    }
    
    loadVehicles()
  }, [authLoading, isAuthenticated, searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    console.log('🚀 Rapor oluşturma başlatıldı:', { selectedReportType, data })
    
    if (!selectedReportType) {
      console.error('❌ Rapor türü seçilmemiş')
      return
    }

    try {
      // Araç Garajı'ndan seçilmişse o bilgileri kullan, yoksa form verilerini kullan
      const vehicleInfo: VehicleInfo = selectedVehicle 
        ? vehicleGarageService.convertToVehicleInfo(selectedVehicle)
        : {
            plate: data.vehiclePlate || 'Belirtilmemiş',
            make: data.vehicleBrand || 'Belirtilmemiş',
            model: data.vehicleModel || 'Belirtilmemiş',
            year: data.vehicleYear || 'Belirtilmemiş',
            vin: 'Belirtilmemiş'
          }

      console.log('🚗 Araç bilgileri:', vehicleInfo)

      let results
      
      // Kullanılacak resim sayısını belirle
      const imageCount = useGlobalImages 
        ? fileUploadProps.uploadedImages.length 
        : reportSpecificImages.length
      
      console.log('📸 Resim sayısı:', imageCount)
      
      // Rapor türüne göre analiz yap
      if (selectedReportType.id === 'ENGINE_SOUND_ANALYSIS') {
        console.log('🔊 Motor sesi analizi yapılıyor...')
        results = await audioRecordingProps.performEngineSoundAnalysis(vehicleInfo)
      } else if (selectedReportType.id === 'DAMAGE_ANALYSIS') {
        console.log('🔧 Hasar analizi yapılıyor...')
        // Hasar analizi için özel işlem
        results = await performDamageAnalysis(vehicleInfo, imageCount)
      } else {
        console.log('🎨 Boya analizi yapılıyor...')
        results = await performAnalysis(vehicleInfo, imageCount)
      }
      
      console.log('📊 Analiz sonucu:', results)
      
      if (results) {
        console.log('✅ Rapor oluşturuldu, yönlendiriliyor...')
        // Rapor sayfasına yönlendir
        setTimeout(() => {
          let reportType = 'paint-analysis'
          if (selectedReportType.id === 'ENGINE_SOUND_ANALYSIS') {
            reportType = 'engine-sound-analysis'
          } else if (selectedReportType.id === 'DAMAGE_ANALYSIS') {
            reportType = 'damage-analysis'
          }
          const reportId = results.reportId || results.id
          const reportUrl = `/vehicle/${reportType}/report?reportId=${reportId}`
          console.log('🔗 Rapor URL:', reportUrl)
          console.log('🔢 Report ID:', reportId, 'Type:', typeof reportId)
          window.open(reportUrl, '_blank')
        }, 1000)
      } else {
        console.error('❌ Rapor oluşturulamadı')
      }
      
    } catch (error) {
      console.error('💥 Rapor oluşturma hatası:', error)
    }
  }

  const handleReportTypeSelect = (reportType: ReportType) => {
    setSelectedReportType(reportType)
    nextStep()
  }

  const renderStep = () => {
    const stepName = currentSteps.find(step => step.id === currentStep)?.name || ''
    
    switch (currentStep) {
      case 1:
        return (
          <ReportTypeSelector
            reportTypes={REPORT_TYPES}
            onSelect={handleReportTypeSelect}
          />
        )
      
      case 2:
        return (
          <VehicleInfoForm
            register={register}
            errors={errors}
            onNext={nextStep}
            onPrev={prevStep}
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            useGarageVehicle={useGarageVehicle}
            onVehicleSelect={(vehicle) => {
              setSelectedVehicle(vehicle)
              if (vehicle) {
                setValue('vehiclePlate', vehicle.plate)
                setValue('vehicleBrand', vehicle.brand)
                setValue('vehicleModel', vehicle.model)
                setValue('vehicleYear', vehicle.year)
                setValue('vehicleColor', vehicle.color || '')
                setValue('mileage', vehicle.mileage || 0)
              }
            }}
            onUseGarageToggle={(use) => {
              setUseGarageVehicle(use)
              if (!use) {
                setSelectedVehicle(null)
              }
            }}
            selectedReportType={selectedReportType}
          />
        )
      
      case 3:
        // Rapor türüne göre 3. adımı belirle
        if (selectedReportType?.id === 'ENGINE_SOUND_ANALYSIS') {
          // Motor ses analizi için ses kaydı
          return (
            <AudioRecorder
              {...audioRecordingProps}
              onNext={nextStep}
              onPrev={prevStep}
              selectedReportType={selectedReportType}
              onAudiosChange={() => {}}
            />
          )
        } else if (selectedReportType?.id === 'DAMAGE_ANALYSIS') {
          // Hasar analizi için özel resim yükleme
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Hasar Analizi Fotoğrafları</h2>
                <p className="text-gray-600">
                  AI'nın en iyi sonuçları vermesi için kaliteli fotoğraflar yükleyin
                </p>
              </div>

              {/* Hasar Analizi Rehberi */}
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      📸 Hasar Analizi Fotoğraf Rehberi
                    </h3>
                    <p className="text-blue-700 text-sm">
                      AI'nın en iyi sonuçları vermesi için fotoğraf çekme ipuçları
                    </p>
                  </div>
                  <DamageAnalysisGuide />
                </div>
              </div>

              {/* Fotoğraf Kalite Kontrolü */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">
                  🔍 Fotoğraf Kalite Kontrolü
                </h3>
                <PhotoQualityChecker />
              </div>

              {/* Resim Yükleme */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📁 Hasar Fotoğraflarını Yükleyin
                </h3>
                <ImageUploader
                  {...fileUploadProps}
                  onNext={nextStep}
                  onPrev={prevStep}
                  useGlobalImages={useGlobalImages}
                  onUseGlobalImagesToggle={(use) => {
                    setUseGlobalImages(use)
                    if (!use) {
                      setReportSpecificImages([])
                    }
                  }}
                  selectedReportType={selectedReportType}
                />
              </div>
            </div>
          )
        } else {
          // Diğer rapor türleri için resim yükleme
          return (
            <ImageUploader
              {...fileUploadProps}
              onNext={nextStep}
              onPrev={prevStep}
              useGlobalImages={useGlobalImages}
              onUseGlobalImagesToggle={(use) => {
                setUseGlobalImages(use)
                if (!use) {
                  setReportSpecificImages([])
                }
              }}
              selectedReportType={selectedReportType}
            />
          )
        }
      
      case 4:
        // Tam expertiz için ses kaydı adımı
        if (selectedReportType?.id === 'FULL_REPORT') {
          return (
            <AudioRecorder
              {...audioRecordingProps}
              onNext={nextStep}
              onPrev={prevStep}
              selectedReportType={selectedReportType}
              onAudiosChange={() => {}}
            />
          )
        } else {
          // Diğer rapor türleri için özet
          return (
            <ReportSummary
              selectedReportType={selectedReportType}
              formData={watch()}
              uploadedImages={useGlobalImages ? fileUploadProps.uploadedImages : reportSpecificImages}
              uploadedAudios={audioRecordingProps.recordedAudios}
              onSubmit={handleSubmit(onSubmit)}
              isLoading={isAnalyzing}
              onPrev={prevStep}
              useGlobalImages={useGlobalImages}
            />
          )
        }
      
      case 5:
        // Tam expertiz için özet adımı
        return (
          <ReportSummary
            selectedReportType={selectedReportType}
            formData={watch()}
            uploadedImages={useGlobalImages ? fileUploadProps.uploadedImages : reportSpecificImages}
            uploadedAudios={audioRecordingProps.recordedAudios}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={isAnalyzing}
            onPrev={prevStep}
            useGlobalImages={useGlobalImages}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Authentication Loading */}
      {authLoading && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Kimlik doğrulanıyor...</p>
          </div>
        </div>
      )}

      {/* Unauthenticated - will redirect via requireAuth */}
      {!authLoading && !isAuthenticated && null}

      {/* Authenticated Content */}
      {!authLoading && isAuthenticated && (
        <>
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Geri Dön
                  </Link>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                      Mivvo Expertiz
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Progress */}
            <FadeInUp>
              <div className="mb-8">
                <StepIndicator steps={currentSteps} currentStep={currentStep} />
                <ProgressBar value={progress} />
              </div>
            </FadeInUp>

            {/* Step Content */}
            <FadeInUp>
              <Card padding="lg">
                {renderStep()}
              </Card>
            </FadeInUp>
          </div>
        </>
      )}
    </div>
  )
}

// Loading component
function NewReportPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}

// Ana component Suspense ile sarmalanmış
export default function NewReportPage() {
  return (
    <Suspense fallback={<NewReportPageLoading />}>
      <NewReportPageContent />
    </Suspense>
  )
}
