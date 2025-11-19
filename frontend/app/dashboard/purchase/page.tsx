'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { authService } from '@/services/authService'
import { pricingService } from '@/services/pricingService'
import { paymentService } from '@/services/paymentService'
import { FadeInUp } from '@/components/motion'
import toast from 'react-hot-toast'

export default function PurchasePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [allPackages, setAllPackages] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card')
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    holder: ''
  })
  const [bankInfo, setBankInfo] = useState({
    accountName: '',
    bankName: '',
    iban: '',
    description: ''
  })
  
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    
    // Backend'ten paket bilgilerini çek
    fetchPackages()
  }, [searchParams, router])
  
  const fetchPackages = async () => {
    try {
      const packages = await pricingService.getPricingPackages()
      setAllPackages(packages)
      
      const packageId = searchParams.get('package')
      const pkg = packages.find(p => p.id === packageId)
      if (pkg) {
        setSelectedPackage(pkg)
      } else {
        // Paket bulunamadıysa varsayılan olarak professional paketi göster
        const defaultPkg = packages.find(p => p.id === 'professional')
        setSelectedPackage(defaultPkg)
      }
    } catch (error) {
      console.error('Packages fetch error:', error)
      toast.error('Paket bilgileri yüklenemedi')
    }
  }
  
  const handlePurchase = async () => {
    if (!selectedPackage) return
    
    if (paymentMethod === 'card') {
      if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvv || !cardInfo.holder) {
        toast.error('Lütfen kart bilgilerini eksiksiz doldurun')
        return
      }
    } else {
      if (!bankInfo.accountName || !bankInfo.bankName || !bankInfo.iban) {
        toast.error('Lütfen banka havalesi için gerekli alanları doldurun')
        return
      }
    }

    setIsProcessing(true)
    try {
      // Gerçek backend ödeme API'si
      const response = await paymentService.initiatePayment({
        packageId: selectedPackage.id,
        paymentMethod
      })
      
      toast.success(paymentMethod === 'bank' ? 'Havale/EFT talimatınız alındı. Finans ekibimiz en kısa sürede sizinle iletişime geçecek.' : 'Ödeme işlemi başlatıldı!')

      if (paymentMethod === 'bank') {
        router.push('/dashboard')
        return
      }
      
      // Gerçek ödeme gateway'e yönlendir
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl
      } else {
        // Mock success (gerçek gateway entegrasyonu yoksa)
        setTimeout(async () => {
          try {
            await paymentService.verifyPayment({
              paymentId: response.data.paymentId,
              status: 'success'
            })
            toast.success('Ödeme başarılı! Kredileriniz hesabınıza yüklendi.')
            router.push('/dashboard')
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError)
            toast.error('Ödeme doğrulanamadı')
          }
        }, 2000)
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error)
      toast.error(error.message || 'Ödeme işlemi başlatılamadı')
    } finally {
      setIsProcessing(false)
    }
  }
  
  if (!user || !selectedPackage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Dashboard&apos;a Dön</span>
            </Link>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">Mivvo Expertiz</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FadeInUp>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kredi Paketi Satın Al</h1>
            <p className="text-gray-600">Güvenli ödeme ile kredilerinizi anında hesabınıza yükleyin</p>
          </div>
        </FadeInUp>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sol: Paket Detayları */}
          <FadeInUp delay={0.1}>
            <div className="card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedPackage.name}</h2>
                {selectedPackage.badge && (
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {selectedPackage.badge}
                  </span>
                )}
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Kredi Miktarı:</span>
                  <span className="font-bold text-lg">{selectedPackage.credits} Kredi</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Bonus Kredi:</span>
                  <span className="font-bold text-lg text-green-600">+{selectedPackage.bonus}₺</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Bonus Oranı:</span>
                  <span className="font-bold text-lg text-blue-600">%{((selectedPackage.bonus/selectedPackage.credits)*100).toFixed(1)}</span>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between items-center py-3 bg-blue-50 rounded-lg px-4">
                  <span className="text-xl font-semibold text-gray-900">Toplam Ödeme:</span>
                  <span className="text-3xl font-bold text-blue-600">{selectedPackage.price}₺</span>
                </div>
              </div>

              {/* Paket Özellikleri */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Paket İçeriği:</h3>
                <ul className="space-y-2">
                  {selectedPackage.features.slice(0, 5).map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Güvenlik Bilgileri */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <ShieldCheckIcon className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-semibold text-green-800">Güvenli Ödeme</span>
                </div>
                <p className="text-sm text-green-700">
                  Tüm ödemeleriniz SSL ile şifrelenir ve güvenli şekilde işlenir.
                </p>
              </div>
            </div>
          </FadeInUp>
          
          {/* Sağ: Ödeme Formu */}
          <FadeInUp delay={0.2}>
            <div className="card p-8">
              <div className="flex items-center mb-6">
                <CreditCardIcon className="w-6 h-6 text-gray-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Ödeme Bilgileri</h3>
              </div>

              {/* Ödeme Yöntemleri */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Ödeme Yöntemi:</h4>
                <div className="space-y-3">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      className="mr-3"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <div>
                      <div className="font-medium">Kredi/Banka Kartı</div>
                      <div className="text-sm text-gray-600">Visa, Mastercard, American Express</div>
                    </div>
                  </label>
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${paymentMethod === 'bank' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="bank"
                      className="mr-3"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                    />
                    <div>
                      <div className="font-medium">Banka Havalesi</div>
                      <div className="text-sm text-gray-600">EFT, Havale ile ödeme</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Ödeme Formu Placeholder */}
              <div className="mb-6">
                {paymentMethod === 'card' ? (
                  <>
                    <h4 className="font-semibold text-gray-900 mb-3">Kart Bilgileri:</h4>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Kart Numarası" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={cardInfo.number}
                        onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          placeholder="Son Kullanma" 
                          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={cardInfo.expiry}
                          onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                        />
                        <input 
                          type="text" 
                          placeholder="CVV" 
                          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={cardInfo.cvv}
                          onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Kart Sahibi Adı"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={cardInfo.holder}
                        onChange={(e) => setCardInfo({ ...cardInfo, holder: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="font-semibold text-gray-900 mb-3">Havale/EFT Bilgileri:</h4>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Gönderen Adı Soyadı" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={bankInfo.accountName}
                        onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })}
                      />
                      <input 
                        type="text" 
                        placeholder="Banka Adı" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={bankInfo.bankName}
                        onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                      />
                      <input 
                        type="text" 
                        placeholder="IBAN" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={bankInfo.iban}
                        onChange={(e) => setBankInfo({ ...bankInfo, iban: e.target.value })}
                      />
                      <textarea
                        placeholder="Açıklama / Dekont Notu (Opsiyonel)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                        value={bankInfo.description}
                        onChange={(e) => setBankInfo({ ...bankInfo, description: e.target.value })}
                      />
                      <div className="bg-blue-50 border border-blue-100 text-sm text-blue-700 rounded-lg p-4">
                        Havale/EFT işlemlerinde dekontu ve açıklama kısmını paylaşmayı unutmayın. Finans ekibimiz ödemenizi en kısa sürede onaylayacaktır.
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Ödeme Butonu */}
              <button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="btn btn-primary w-full btn-lg mb-4"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    İşleniyor...
                  </div>
                ) : (
                  `${selectedPackage.price}₺ Ödemeyi Tamamla`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Ödeme yaparak <Link href="/terms" className="text-blue-600 hover:underline">Kullanım Şartları</Link> ve 
                <Link href="/privacy" className="text-blue-600 hover:underline ml-1">Gizlilik Politikası</Link>&apos;nı kabul etmiş olursunuz.
              </p>
            </div>
          </FadeInUp>
        </div>

        {/* Diğer Paketler */}
        <FadeInUp delay={0.3}>
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Diğer Paketler</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {allPackages.filter(pkg => pkg.id !== selectedPackage.id).map((pkg) => (
                <div key={pkg.id} className="card p-6 text-center">
                  <h4 className="font-bold text-lg mb-2">{pkg.name}</h4>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{pkg.price}₺</div>
                  <div className="text-sm text-green-600 mb-4">+{pkg.bonus}₺ Bonus</div>
                  <Link 
                    href={`/dashboard/purchase?package=${pkg.id}`}
                    className="btn btn-secondary btn-sm w-full"
                  >
                    Bu Paketi Seç
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
