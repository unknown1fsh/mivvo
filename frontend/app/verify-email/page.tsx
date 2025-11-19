/**
 * Email Verification Page (Email Doğrulama Sayfası)
 * 
 * Bu sayfa, kullanıcıların email adreslerini doğrulamak için kullanılır.
 * 
 * Özellikler:
 * - Token ile email doğrulama
 * - Başarılı/başarısız durumlar
 * - Yeniden gönderme butonu
 * - Dashboard'a yönlendirme
 * 
 * URL Format:
 * /verify-email?token=<verification-token>
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  EnvelopeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { userService } from '@/services/userService'
import toast from 'react-hot-toast'

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired' | 'invalid'

function VerifyEmailContent() {
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      setMessage('Geçersiz doğrulama linki.')
      return
    }

    verifyEmail(token)
  }, [token])

  /**
   * Email Doğrulama Fonksiyonu
   */
  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('loading')
      
      // Backend API'ye doğrulama isteği gönder
      const response = await fetch(`/api/auth/verify-email/${verificationToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus('success')
        setMessage('Email adresiniz başarıyla doğrulandı!')
        
        // 3 saniye sonra dashboard'a yönlendir
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        if (response.status === 400) {
          setStatus('expired')
          setMessage('Doğrulama linki geçersiz veya süresi dolmuş.')
        } else {
          setStatus('error')
          setMessage('Email doğrulama sırasında bir hata oluştu.')
        }
      }
    } catch (error) {
      console.error('Email verification error:', error)
      setStatus('error')
      setMessage('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  /**
   * Yeniden Gönderme Fonksiyonu
   */
  const handleResendVerification = async () => {
    if (!userEmail) {
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
        body: JSON.stringify({ email: userEmail }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Doğrulama email\'i yeniden gönderildi!')
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
   * Status Icon Component
   */
  const StatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-16 h-16 text-green-500" />
      case 'error':
      case 'expired':
      case 'invalid':
        return <XCircleIcon className="w-16 h-16 text-red-500" />
      default:
        return (
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        )
    }
  }

  /**
   * Status Title Component
   */
  const StatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Email Doğrulandı!'
      case 'expired':
        return 'Link Süresi Dolmuş'
      case 'invalid':
        return 'Geçersiz Link'
      case 'error':
        return 'Doğrulama Hatası'
      default:
        return 'Email Doğrulanıyor...'
    }
  }

  /**
   * Status Message Component
   */
  const StatusMessage = () => {
    switch (status) {
      case 'success':
        return (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <p className="text-sm text-gray-500">
              Dashboard&apos;a yönlendiriliyorsunuz...
            </p>
          </div>
        )
      case 'expired':
      case 'invalid':
      case 'error':
        return (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Yeni bir doğrulama email&apos;i gönderebilirsiniz.
            </p>
          </div>
        )
      default:
        return (
          <div className="text-center">
            <p className="text-gray-600">
              Email adresiniz doğrulanıyor, lütfen bekleyin...
            </p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <EnvelopeIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Mivvo</span>
              <span className="text-xl font-semibold text-gray-700 ml-1">Expertiz</span>
            </div>
          </Link>
        </div>

        {/* Verification Card */}
        <div className="card p-8 text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            <StatusIcon />
          </div>

          {/* Status Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            <StatusTitle />
          </h1>

          {/* Status Message */}
          <StatusMessage />

          {/* Action Buttons */}
          {status === 'success' && (
            <div className="mt-6">
              <Link
                href="/dashboard"
                className="btn btn-primary btn-lg w-full inline-flex items-center justify-center"
              >
                Dashboard&apos;a Git
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          )}

          {(status === 'expired' || status === 'invalid' || status === 'error') && (
            <div className="mt-6 space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="btn btn-secondary btn-lg w-full"
              >
                {isResending ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Gönderiliyor...
                  </div>
                ) : (
                  'Doğrulama Email\'i Gönder'
                )}
              </button>
              
              <Link
                href="/login"
                className="btn btn-outline btn-lg w-full"
              >
                Giriş Sayfasına Dön
              </Link>
            </div>
          )}

          {status === 'loading' && (
            <div className="mt-6">
              <div className="flex items-center justify-center text-gray-500">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                Doğrulanıyor...
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-sm font-medium text-yellow-800">
                  Yardıma mı ihtiyacınız var?
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Email doğrulama ile ilgili sorunlarınız varsa{' '}
                  <Link href="/contact" className="underline hover:text-yellow-800">
                    bizimle iletişime geçin
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Yükleniyor...</h1>
            <p className="text-gray-600">Email doğrulama sayfası yükleniyor...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
