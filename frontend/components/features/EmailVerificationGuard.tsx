/**
 * Email Verification Guard Component
 * 
 * Bu komponent, email doğrulanmamış kullanıcıların belirli özelliklere erişimini kısıtlar.
 * 
 * Özellikler:
 * - Email doğrulama kontrolü
 * - Kısıtlı özellikler için modal
 * - Email doğrulama yönlendirmesi
 * - OAuth kullanıcıları için otomatik geçiş
 * 
 * Kullanım:
 * ```tsx
 * import { EmailVerificationGuard } from '@/components/features/EmailVerificationGuard'
 * 
 * <EmailVerificationGuard>
 *   <ProtectedFeature />
 * </EmailVerificationGuard>
 * ```
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ExclamationTriangleIcon, 
  EnvelopeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/userService'
import toast from 'react-hot-toast'

interface EmailVerificationGuardProps {
  children: React.ReactNode
  feature?: string
  requiredFor?: string[]
  className?: string
}

export function EmailVerificationGuard({ 
  children, 
  feature = 'Bu özellik',
  requiredFor = ['Rapor oluşturma', 'Ödeme işlemleri'],
  className = ''
}: EmailVerificationGuardProps) {
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [isResending, setIsResending] = useState(false)

  /**
   * Email Doğrulama Gerekli mi Kontrol Et
   */
  const isEmailVerificationRequired = user && !(user as any).emailVerified

  /**
   * Modal Aç
   */
  const handleFeatureClick = (e: React.MouseEvent) => {
    if (isEmailVerificationRequired) {
      e.preventDefault()
      e.stopPropagation()
      setShowModal(true)
    }
  }

  /**
   * Modal Kapat
   */
  const handleCloseModal = () => {
    setShowModal(false)
  }

  /**
   * Email Doğrulama Yeniden Gönder
   */
  const handleResendVerification = async () => {
    if (!user?.email) {
      toast.error('Email adresi bulunamadı.')
      return
    }

    try {
      setIsResending(true)
      
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Doğrulama email\'i yeniden gönderildi!')
        setShowModal(false)
      } else {
        toast.error(data.message || 'Email gönderilemedi.')
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsResending(false)
    }
  }

  /**
   * Email Doğrulama Sayfasına Git
   */
  const handleGoToVerification = () => {
    window.open('/verify-email', '_blank')
    setShowModal(false)
  }

  // Email doğrulanmışsa veya kullanıcı yoksa direkt render et
  if (!isEmailVerificationRequired) {
    return <div className={className}>{children}</div>
  }

  return (
    <>
      {/* Kısıtlı İçerik */}
      <div 
        className={`${className} relative`}
        onClick={handleFeatureClick}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Email Doğrulama Gerekli</p>
          </div>
        </div>
        
        {/* Orijinal İçerik (blur) */}
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
      </div>

      {/* Email Doğrulama Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={handleCloseModal}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  {/* Header */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        Email Doğrulama Gerekli
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {feature} için email adresinizi doğrulamanız gerekmektedir.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="flex-shrink-0 ml-4"
                    >
                      <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>

                  {/* Features List */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Email doğrulaması şu özellikler için gereklidir:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {requiredFor.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Current Email */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Email Adresi:</strong> {user?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Bu adrese gönderilen doğrulama linkini kontrol edin.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <EnvelopeIcon className="w-4 h-4 mr-2" />
                        Email Gönder
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleGoToVerification}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Doğrulama Sayfası
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </button>
                  
                  <button
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Daha Sonra
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * Default Export
 */
export default EmailVerificationGuard
