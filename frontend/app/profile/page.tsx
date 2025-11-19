'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'

const schema = yup.object({
  firstName: yup.string().required('Ad zorunludur'),
  lastName: yup.string().required('Soyad zorunludur'),
  email: yup.string().email('Geçerli bir email adresi giriniz').required('Email zorunludur'),
  phone: yup.string().matches(/^[0-9+\-\s()]+$/, 'Geçerli bir telefon numarası giriniz'),
  address: yup.string().oneOf(['Çankaya / ANKARA'], 'Sadece Çankaya / ANKARA adresi kabul edilir'),
  currentPassword: yup.string().required('Mevcut şifre zorunludur'),
  newPassword: yup.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır'),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Şifreler eşleşmiyor'),
})

type FormData = yup.InferType<typeof schema>

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      email: 'ahmet@email.com',
      phone: '+90 555 123 45 67',
      address: 'Çankaya / ANKARA',
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      // TODO: API call to update profile
      console.log('Profile update data:', data)
      toast.success('Profil başarıyla güncellendi!')
    } catch (error) {
      toast.error('Profil güncellenemedi!')
    } finally {
      setIsLoading(false)
    }
  }

  const stats = [
    { label: 'Toplam Rapor', value: '12', icon: DocumentTextIcon, color: 'text-blue-600' },
    { label: 'Toplam Harcama', value: '450₺', icon: CreditCardIcon, color: 'text-green-600' },
    { label: 'Kredi Bakiyesi', value: '150₺', icon: ChartBarIcon, color: 'text-purple-600' },
    { label: 'Üyelik Süresi', value: '6 ay', icon: CalendarIcon, color: 'text-orange-600' },
  ]

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
        {/* Profile Header */}
        <FadeInUp>
          <div className="card p-8 mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ahmet Yılmaz</h1>
                <p className="text-gray-600">ahmet@email.com</p>
                <p className="text-sm text-gray-500">Üye olma tarihi: 15 Temmuz 2023</p>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Stats */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <FadeInUp delay={0.2}>
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profil Bilgileri</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        activeTab === 'profile' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Profil
                    </button>
                    <button
                      onClick={() => setActiveTab('password')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        activeTab === 'password' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Şifre
                    </button>
                  </div>
                </div>

                {activeTab === 'profile' && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          Ad
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...register('firstName')}
                            type="text"
                            id="firstName"
                            className="input w-full pl-10"
                            placeholder="Adınız"
                          />
                        </div>
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Soyad
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...register('lastName')}
                            type="text"
                            id="lastName"
                            className="input w-full pl-10"
                            placeholder="Soyadınız"
                          />
                        </div>
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                        )}
                      </div>

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

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Telefon Numarası
                        </label>
                        <div className="relative">
                          <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...register('phone')}
                            type="tel"
                            id="phone"
                            className="input w-full pl-10"
                            placeholder="+90 555 123 45 67"
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                          Adres
                        </label>
                        <div className="relative">
                          <input
                            {...register('address')}
                            type="text"
                            id="address"
                            className="input w-full"
                            value="Çankaya / ANKARA"
                            readOnly
                            disabled
                          />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Adres bilgisi sabit olarak &ldquo;Çankaya / ANKARA&rdquo; olarak ayarlanmıştır.
                        </p>
                        {errors.address && (
                          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary btn-lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Güncelleniyor...
                        </div>
                      ) : (
                        'Profili Güncelle'
                      )}
                    </button>
                  </form>
                )}

                {activeTab === 'password' && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Mevcut Şifre
                      </label>
                      <input
                        {...register('currentPassword')}
                        type="password"
                        id="currentPassword"
                        className="input w-full"
                        placeholder="••••••••"
                      />
                      {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Yeni Şifre
                      </label>
                      <input
                        {...register('newPassword')}
                        type="password"
                        id="newPassword"
                        className="input w-full"
                        placeholder="••••••••"
                      />
                      {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Yeni Şifre Tekrarı
                      </label>
                      <input
                        {...register('confirmPassword')}
                        type="password"
                        id="confirmPassword"
                        className="input w-full"
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary btn-lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Güncelleniyor...
                        </div>
                      ) : (
                        'Şifreyi Güncelle'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </FadeInUp>
          </div>

          {/* Quick Actions */}
          <div>
            <FadeInUp delay={0.4}>
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
                <div className="space-y-3">
                  <Link href="/payment/add-credits" className="btn btn-primary btn-md w-full">
                    Kredi Yükle
                  </Link>
                  <Link href="/reports" className="btn btn-secondary btn-md w-full">
                    Raporlarım
                  </Link>
                  <Link href="/transactions" className="btn btn-secondary btn-md w-full">
                    İşlem Geçmişi
                  </Link>
                  <Link href="/support" className="btn btn-secondary btn-md w-full">
                    Destek
                  </Link>
                </div>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.6}>
              <div className="card p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesap Ayarları</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="ml-2 text-sm text-gray-600">Email bildirimleri</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="ml-2 text-sm text-gray-600">SMS bildirimleri</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-600">Pazarlama e-postaları</span>
                  </label>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </div>
    </div>
  )
}
