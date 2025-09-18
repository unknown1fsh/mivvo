'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { 
  SparklesIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp } from '@/components/motion'
import { ProgressBar } from '@/components/ui'
import { Card } from '@/components/ui/Card'

// Types
import { ReportType, VehicleInfo } from '@/types'

// Components
import { ReportTypeSelector } from '@/components/features/ReportTypeSelector'
import { VehicleInfoForm } from '@/components/features/VehicleInfoForm'
import { ImageUploader } from '@/components/features/ImageUploader'
import { ReportSummary } from '@/components/features/ReportSummary'
import { StepIndicator } from '@/components/features/StepIndicator'

// Constants
import { REPORT_TYPES, STEPS } from '@/constants'

// Hooks
import { useFormSteps } from '@/hooks/useFormSteps'
import { useFileUpload } from '@/hooks/useFileUpload'
import { usePaintAnalysis } from '@/hooks/usePaintAnalysis'

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

export default function NewReportPage() {
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null)
  
  const { currentStep, nextStep, prevStep, progress } = useFormSteps(STEPS)
  const fileUploadProps = useFileUpload()
  const { isAnalyzing, performAnalysis } = usePaintAnalysis()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!selectedReportType) return

    try {
      const vehicleInfo: VehicleInfo = {
        plate: data.vehiclePlate || 'Belirtilmemiş',
        brand: data.vehicleBrand || 'Belirtilmemiş',
        model: data.vehicleModel || 'Belirtilmemiş',
        year: data.vehicleYear || 'Belirtilmemiş',
        color: data.vehicleColor || 'Belirtilmemiş',
        mileage: data.mileage || 'Belirtilmemiş'
      }

      const results = await performAnalysis(vehicleInfo, fileUploadProps.uploadedImages.length)
      
      // Rapor sayfasına yönlendir
      setTimeout(() => {
        window.open(`/vehicle/paint-analysis/report?reportId=${results.reportId}`, '_blank')
      }, 1000)
      
    } catch (error) {
      console.error('Rapor oluşturma hatası:', error)
    }
  }

  const handleReportTypeSelect = (reportType: ReportType) => {
    setSelectedReportType(reportType)
    nextStep()
  }

  const renderStep = () => {
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
          />
        )
      
      case 3:
        return (
          <ImageUploader
            {...fileUploadProps}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      
      case 4:
        return (
          <ReportSummary
            selectedReportType={selectedReportType}
            formData={watch()}
            uploadedImages={fileUploadProps.uploadedImages}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={isAnalyzing}
            onPrev={prevStep}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <StepIndicator steps={STEPS} currentStep={currentStep} />
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
    </div>
  )
}
