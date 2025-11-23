// Rapor türü seçici bileşeni

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ReportType } from '@/types/report'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { StaggerContainer, StaggerItem } from '@/components/motion'
import { userAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface ReportTypeSelectorProps {
  reportTypes: ReportType[]
  onSelect: (reportType: ReportType) => void
}

export const ReportTypeSelector = ({ reportTypes, onSelect }: ReportTypeSelectorProps) => {
  const router = useRouter()
  const [userBalance, setUserBalance] = useState<number | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)

  useEffect(() => {
    fetchUserBalance()
  }, [])

  const fetchUserBalance = async () => {
    try {
      setIsLoadingBalance(true)
      const response = await userAPI.getCredits()
      console.log('📊 ReportTypeSelector - Credits API Response:', response)
      
      // Backend response yapısı: { success: true, data: { credits: { balance: ... } } }
      if (response?.data?.success && response?.data?.data?.credits?.balance !== undefined) {
        const balance = Number(response.data.data.credits.balance)
        console.log('✅ ReportTypeSelector - Balance loaded:', balance)
        setUserBalance(balance)
      } else if (response?.data?.success && response?.data?.data?.balance !== undefined) {
        // Fallback: direkt balance varsa
        const balance = Number(response.data.data.balance)
        console.log('✅ ReportTypeSelector - Balance loaded (fallback):', balance)
        setUserBalance(balance)
      } else if (response?.data?.balance !== undefined) {
        // Fallback 2: root seviyesinde balance varsa
        const balance = Number(response.data.balance)
        console.log('✅ ReportTypeSelector - Balance loaded (fallback 2):', balance)
        setUserBalance(balance)
      } else {
        console.warn('⚠️ ReportTypeSelector - Balance data not found in response')
        // Veri gelmediyse güvenlik için 0 olarak ayarla
        setUserBalance(0)
      }
    } catch (error) {
      console.error('❌ ReportTypeSelector - Kredi bakiyesi yüklenemedi:', error)
      // Hata durumunda güvenlik için 0 olarak ayarla, böylece tüm kartlar kilitli görünür
      setUserBalance(0)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const hasEnoughCredits = (price: number): boolean => {
    // Yüklenirken veya bakiye null ise kilitli göster (güvenlik için)
    if (isLoadingBalance || userBalance === null) return false
    return userBalance >= price
  }

  const handleCardClick = (reportType: ReportType) => {
    if (!hasEnoughCredits(reportType.price)) {
      toast.error(`Yetersiz bakiye! Bu rapor için ${reportType.price}₺ gereklidir. Mevcut bakiyeniz: ${userBalance}₺`)
      router.push('/dashboard/purchase')
      return
    }
    onSelect(reportType)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Rapor Türü Seçin</h1>
        <p className="text-gray-600">İhtiyacınıza uygun analiz türünü seçin</p>
      </div>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((reportType) => {
          const isDisabled = !hasEnoughCredits(reportType.price)
          return (
          <StaggerItem key={reportType.id}>
            <motion.div
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              className={isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
              onClick={() => handleCardClick(reportType)}
            >
              <Card 
                variant={reportType.popular ? 'elevated' : 'default'}
                className={`relative overflow-visible ${
                  reportType.popular && !isDisabled ? 'ring-2 ring-blue-500' : ''
                } ${isDisabled ? 'bg-gray-100 grayscale' : ''}`}
              >
                {reportType.popular && !isDisabled && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      En Popüler
                    </span>
                  </div>
                )}
                
                {isDisabled && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                      <LockClosedIcon className="w-4 h-4" />
                      Kilitli
                    </div>
                  </div>
                )}
                
                <div className={`text-center ${isDisabled ? 'relative' : ''}`}>
                  <div className="text-4xl mb-4">{reportType.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{reportType.name}</h3>
                  <p className="text-gray-600 mb-4">{reportType.description}</p>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
                    {reportType.price}₺
                  </div>
                  
                  <ul className="text-sm text-gray-600 space-y-1 mb-6">
                    {reportType.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center justify-center">
                        <CheckCircleIcon className={`w-4 h-4 mr-2 ${isDisabled ? 'text-gray-400' : 'text-green-500'}`} />
                        <span className={isDisabled ? 'text-gray-400' : ''}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {isDisabled && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-700 font-semibold mb-1">
                        Yetersiz Bakiye
                      </p>
                      <p className="text-xs text-red-600">
                        Gerekli: {reportType.price}₺ • Mevcut: {userBalance || 0}₺
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    className={`w-full ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                    disabled={isDisabled}
                  >
                    {isDisabled ? (
                      <span className="flex items-center justify-center gap-2">
                        <LockClosedIcon className="w-4 h-4" />
                        Yetersiz Bakiye
                      </span>
                    ) : (
                      'Seç'
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </StaggerItem>
          )
        })}
      </StaggerContainer>
    </div>
  )
}
