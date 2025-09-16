'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { 
  SparklesIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp } from '@/components/motion'
import toast from 'react-hot-toast'

const schema = yup.object({
  email: yup.string().email('Geçerli bir email adresi giriniz').required('Email zorunludur'),
})

type FormData = yup.InferType<typeof schema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      // TODO: API call to send reset email
      console.log('Reset password data:', data)
      toast.success('Şifre sıfırlama bağlantısı email adresinize gönderildi!')
      setIsEmailSent(true)
    } catch (error) {
      toast.error('Email gönderilemedi!')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Gönderildi!</h1>
            <p className="text-gray-600 mb-6">
              Şifre sıfırlama bağlantısı email adresinize gönderildi. 
              Lütfen email kutunuzu kontrol edin ve bağlantıya tıklayın.
            </p>
            
            <div className="space-y-4">
              <Link href="/login" className="btn btn-primary btn-lg w-full">
                Giriş Sayfasına Dön
              </Link>
              <button
                onClick={() => setIsEmailSent(false)}
                className="btn btn-secondary w-full"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
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
              <SparklesIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Mivvo</span>
              <span className="text-xl font-semibold text-gray-700 ml-1">Expertiz</span>
            </div>
          </Link>
        </div>

        {/* Forgot Password Form */}
        <div className="card p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Şifremi Unuttum</h1>
            <p className="text-gray-600">Email adresinizi girin, şifre sıfırlama bağlantısı gönderelim</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Adresi
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="input w-full pl-10"
                  placeholder="ornek@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Gönderiliyor...
                </div>
              ) : (
                'Şifre Sıfırlama Bağlantısı Gönder'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Şifrenizi hatırladınız mı?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
