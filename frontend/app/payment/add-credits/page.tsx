'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCardIcon, 
  SparklesIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { userService } from '@/services'

const schema = yup.object({
  amount: yup.number().min(10, 'Minimum 10₺ yükleyebilirsiniz').required('Tutar zorunludur'),
  paymentMethod: yup.string().required('Ödeme yöntemi seçiniz'),
})

type FormData = yup.InferType<typeof schema>

interface CreditTransaction {
  id: string
  type: 'purchase' | 'usage' | string
  amount: number
  description: string
  date: string
  status: 'completed' | 'pending' | 'failed' | string
}

const creditPackages = [
  {
    id: 'starter',
    name: 'Başlangıç Paketi',
    credits: 300,
    price: 300,
    bonus: 0,
    description: 'Küçük işlemler için ideal',
    popular: false
  },
  {
    id: 'standard',
    name: 'Standart Paket',
    credits: 500,
    price: 500,
    bonus: 0,
    description: 'En popüler seçenek',
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium Paket',
    credits: 700,
    price: 700,
    bonus: 0,
    description: 'Büyük işlemler için',
    popular: false
  },
  {
    id: 'enterprise',
    name: 'Kurumsal Paket',
    credits: 1000,
    price: 1000,
    bonus: 0,
    description: 'Profesyonel kullanım',
    popular: false
  }
]

export default function AddCreditsPage() {
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [currentBalance, setCurrentBalance] = useState(0)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoadingData(true)
      
      // Kredi bakiyesini ve işlem geçmişini paralel olarak çek
      const [creditsResponse, transactionsResponse] = await Promise.all([
        userService.getUserCredits(),
        userService.getCreditTransactions()
      ])
      
      // Kredi bakiyesini güncelle
      if (creditsResponse) {
        console.log('💰 Credits Response:', creditsResponse)
        const balance = creditsResponse.credits?.balance || 0
        console.log('💰 Balance:', balance)
        setCurrentBalance(Number(balance))
      }
      
      // İşlem geçmişini güncelle
      if (transactionsResponse) {
        const formattedTransactions = transactionsResponse.map((transaction: any) => ({
          id: transaction.id.toString(),
          type: transaction.transactionType === 'PURCHASE' ? 'purchase' : 'usage',
          amount: transaction.transactionType === 'PURCHASE' ? Number(transaction.amount) : -Number(transaction.amount),
          description: transaction.description || (transaction.transactionType === 'PURCHASE' ? 'Kredi Yükleme' : 'Kredi Kullanımı'),
          date: new Date(transaction.createdAt).toLocaleDateString('tr-TR'),
          status: 'completed'
        }))
        setTransactions(formattedTransactions)
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error)
      toast.error('Veriler yüklenirken bir hata oluştu')
    } finally {
      setIsLoadingData(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      // Kredi yükleme işlemi
      const success = await userService.purchaseCredits(data.amount)
      
      if (success) {
        toast.success('Kredi başarıyla yüklendi!')
        // Verileri yeniden yükle
        await fetchData()
        // Formu temizle
        setSelectedPackage(null)
        setValue('amount', 0)
        setValue('paymentMethod', '')
      } else {
        toast.error('Kredi yükleme işlemi başarısız!')
      }
    } catch (error: any) {
      console.error('Ödeme hatası:', error)
      toast.error(error.response?.data?.message || 'Ödeme işlemi başarısız!')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePackageSelect = (pkg: any) => {
    setSelectedPackage(pkg)
    setValue('amount', pkg.price)
    setValue('paymentMethod', 'card')
  }

  const getTransactionIcon = (type: string) => {
    return type === 'purchase' ? (
      <CreditCardIcon className="w-5 h-5 text-green-500" />
    ) : (
      <DocumentTextIcon className="w-5 h-5 text-blue-500" />
    )
  }

  const getTransactionColor = (type: string) => {
    return type === 'purchase' ? 'text-green-600' : 'text-red-600'
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
                <span className="text-xl font-bold gradient-text">Mivvo Expertiz</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <FadeInUp>
          <div className="card p-8 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Kredi Bakiyeniz</h1>
                <p className="text-blue-100 mb-4">Mevcut kredi bakiyenizi görüntüleyin ve yeni kredi yükleyin</p>
                <div className="text-4xl font-bold">
                  {isLoadingData ? (
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    `${currentBalance}₺`
                  )}
                </div>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-10 h-10" />
              </div>
            </div>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Credit Packages */}
          <div className="lg:col-span-2">
            <FadeInUp delay={0.2}>
              <div className="card p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Kredi Paketleri</h2>
                
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creditPackages.map((pkg) => (
                    <StaggerItem key={pkg.id}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`card card-hover p-6 cursor-pointer relative overflow-visible ${
                          selectedPackage?.id === pkg.id ? 'ring-2 ring-blue-500' : ''
                        } ${pkg.popular ? 'ring-2 ring-purple-500' : ''}`}
                        onClick={() => handlePackageSelect(pkg)}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                              En Popüler
                            </span>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                          <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                          
                          <div className="mb-4">
                            <div className="text-2xl font-bold gradient-text">{pkg.credits}₺</div>
                            <div className="text-sm text-gray-600">Kredi</div>
                          </div>
                          
                          <div className="mb-4">
                            <div className="text-lg font-semibold text-gray-900">{pkg.price}₺</div>
                            <div className="text-sm text-gray-600">Ödeme</div>
                          </div>
                          
                          {pkg.bonus > 0 && (
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                              +{pkg.bonus}₺ Bonus
                            </div>
                          )}
                          
                          <button className={`btn w-full ${
                            selectedPackage?.id === pkg.id ? 'btn-primary' : 'btn-secondary'
                          }`}>
                            {selectedPackage?.id === pkg.id ? 'Seçildi' : 'Seç'}
                          </button>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </FadeInUp>

            {/* Payment Form */}
            {selectedPackage && (
              <FadeInUp delay={0.4}>
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Ödeme Bilgileri</h2>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                          Tutar
                        </label>
                        <input
                          {...register('amount')}
                          type="number"
                          id="amount"
                          className="input w-full"
                          placeholder="0"
                          min="10"
                        />
                        {errors.amount && (
                          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                          Ödeme Yöntemi
                        </label>
                        <select
                          {...register('paymentMethod')}
                          id="paymentMethod"
                          className="input w-full"
                        >
                          <option value="">Seçiniz</option>
                          <option value="card">Kredi/Banka Kartı</option>
                          <option value="bank">Banka Havalesi</option>
                          <option value="mobile">Mobil Ödeme</option>
                        </select>
                        {errors.paymentMethod && (
                          <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Payment Method Details */}
                    {watch('paymentMethod') === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kart Bilgileri
                          </label>
                          <div className="space-y-3">
                            <input
                              type="text"
                              className="input w-full"
                              placeholder="Kart Numarası"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                className="input w-full"
                                placeholder="Son Kullanma Tarihi"
                              />
                              <input
                                type="text"
                                className="input w-full"
                                placeholder="CVV"
                              />
                            </div>
                            <input
                              type="text"
                              className="input w-full"
                              placeholder="Kart Sahibi Adı"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm text-blue-800">
                          Güvenli ödeme ile korunuyorsunuz. Tüm işlemler SSL ile şifrelenir.
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary btn-lg w-full"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          İşleniyor...
                        </div>
                      ) : (
                        `${selectedPackage.price}₺ Öde ve ${selectedPackage.credits}₺ Kredi Yükle`
                      )}
                    </button>
                  </form>
                </div>
              </FadeInUp>
            )}
          </div>

          {/* Transaction History */}
          <div>
            <FadeInUp delay={0.6}>
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">İşlem Geçmişi</h2>
                
                {isLoadingData ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">İşlem geçmişi yükleniyor...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Henüz işlem yok</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-xs text-gray-600">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}₺
                          </p>
                          <div className="flex items-center">
                            {transaction.status === 'completed' ? (
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            ) : transaction.status === 'pending' ? (
                              <ClockIcon className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-xs text-gray-600 ml-1 capitalize">{transaction.status}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Link href="/transactions" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                    Tüm İşlemleri Gör
                  </Link>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </div>
    </div>
  )
}
