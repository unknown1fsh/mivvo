'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { authAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'

const schema = yup.object({
  firstName: yup.string().required('Ad zorunludur'),
  lastName: yup.string().required('Soyad zorunludur'),
  email: yup.string().email('Geçerli bir email adresi giriniz').required('Email zorunludur'),
  phone: yup.string().matches(/^[0-9+\-\s()]+$/, 'Geçerli bir telefon numarası giriniz'),
  password: yup.string().min(6, 'Şifre en az 6 karakter olmalıdır').required('Şifre zorunludur'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Şifreler eşleşmiyor').required('Şifre tekrarı zorunludur'),
  terms: yup.boolean().oneOf([true], 'Kullanım şartlarını kabul etmelisiniz'),
})

type FormData = yup.InferType<typeof schema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const password = watch('password', '')

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.match(/[a-z]/)) strength++
    if (password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    return strength
  }

  const strength = getPasswordStrength(password)
  const strengthLabels = ['Çok zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok güçlü']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const response = await authAPI.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      
      console.log('Register response:', response.data)
      toast.success('Kayıt başarılı! Email adresinizi kontrol edin.')
      
      // Redirect to login page
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      
    } catch (error: any) {
      console.error('Register error:', error)
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Kayıt başarısız! Lütfen tekrar deneyin.')
      }
    } finally {
      setIsLoading(false)
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
              <SparklesIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Mivvo</span>
              <span className="text-xl font-semibold text-gray-700 ml-1">Expertiz</span>
            </div>
          </Link>
        </div>

        {/* Register Form */}
        <div className="card p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Hesap Oluşturun</h1>
            <p className="text-gray-600">Ücretsiz hesap oluşturun ve başlayın</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  id="firstName"
                  className="input w-full"
                  placeholder="Adınız"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Soyad
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  id="lastName"
                  className="input w-full"
                  placeholder="Soyadınız"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Adresi
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="input w-full"
                placeholder="ornek@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefon Numarası
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                className="input w-full"
                placeholder="+90 555 123 45 67"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="input w-full pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          level <= strength ? strengthColors[strength - 1] : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Şifre gücü: {strengthLabels[strength - 1] || 'Çok zayıf'}
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre Tekrarı
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="input w-full pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                {...register('terms')}
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                  Kullanım şartlarını
                </Link>{' '}
                ve{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                  gizlilik politikasını
                </Link>{' '}
                kabul ediyorum
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600">{errors.terms.message}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Kayıt oluşturuluyor...
                </div>
              ) : (
                'Hesap Oluştur'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            Ücretsiz hesap oluşturun
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            İlk analiz ücretsiz
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            Profesyonel raporlar
          </div>
        </div>
      </motion.div>
    </div>
  )
}
