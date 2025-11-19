/**
 * Email Verification Banner Component
 * 
 * Bu komponent, email adresi doğrulanmamış kullanıcılar için uyarı banner'ı gösterir.
 * 
 * Özellikler:
 * - Email doğrulama uyarısı
 * - Doğrulama email'i gönderme butonu
 * - Kapatılabilir banner
 * - Responsive tasarım
 * 
 * Kullanım:
 * ```tsx
 * import { EmailVerificationBanner } from '@/components/features/EmailVerificationBanner'
 * 
 * <EmailVerificationBanner 
 *   userEmail="user@example.com"
 *   onResendVerification={handleResend}
 * />
 * ```
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  EnvelopeIcon, 
  XMarkIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'
import { userService } from '@/services/userService'
import toast from 'react-hot-toast'

interface EmailVerificationBannerProps {
  userEmail: string
  onResendVerification?: () => void
  className?: string
}

export function EmailVerificationBanner({ 
  userEmail, 
  onResendVerification,
  className = '' 
}: EmailVerificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isResending, setIsResending] = useState(false)
  const [isResent, setIsResent] = useState(false)

  /**
   * Banner'ı Kapat
   */
  const handleClose = () => {
    setIsVisible(false)
  }

  /**
   * Doğrulama Email'i Yeniden Gönder
   */
  const handleResendVerification = async () => {
    try {
      setIsResending(true)
      
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Doğrulama email\'i yeniden gönderildi!')
        setIsResent(true)
        
        // Custom callback varsa çağır
        if (onResendVerification) {
          onResendVerification()
        }
        
        // 3 saniye sonra banner'ı kapat
        setTimeout(() => {
          setIsVisible(false)
        }, 3000)
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className={`bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6 ${className}`}
        >
          <div className="flex items-start">
            {/* Icon */}
            <div className="flex-shrink-0 mr-3">
              {isResent ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-800">
                    {isResent ? 'Email Gönderildi!' : 'Email Adresinizi Doğrulayın'}
                  </h3>
                  
                  <div className="mt-1">
                    <p className="text-sm text-amber-700">
                      {isResent ? (
                        <>
                          Doğrulama email&apos;i <strong>{userEmail}</strong> adresine gönderildi. 
                          Email kutunuzu kontrol edin ve linke tıklayarak email adresinizi doğrulayın.
                        </>
                      ) : (
                        <>
                          Tüm özelliklerimize erişim için email adresinizi doğrulamanız gerekmektedir. 
                          <strong> {userEmail}</strong> adresine gönderilen doğrulama linkini kontrol edin.
                        </>
                      )}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {!isResent && (
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={handleResendVerification}
                        disabled={isResending}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isResending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mr-2" />
                            Gönderiliyor...
                          </>
                        ) : (
                          <>
                            <EnvelopeIcon className="w-4 h-4 mr-2" />
                            Doğrulama Email&apos;i Gönder
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={handleClose}
                        className="inline-flex items-center px-3 py-2 border border-amber-300 text-sm font-medium rounded-md text-amber-700 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                      >
                        Daha Sonra
                      </button>
                    </div>
                  )}

                  {/* Success Message */}
                  {isResent && (
                    <div className="mt-3">
                      <p className="text-xs text-green-600">
                        ✅ Email gönderildi! Bu bildirim 3 saniye sonra otomatik olarak kapanacak.
                      </p>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <div className="flex-shrink-0 ml-2">
                  <button
                    onClick={handleClose}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-amber-400 hover:text-amber-600 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Default Export
 */
export default EmailVerificationBanner
