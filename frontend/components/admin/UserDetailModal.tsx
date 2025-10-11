/**
 * User Detail Modal Component
 * 
 * Kullanıcı detaylarını gösteren ve yönetim işlemlerini yapan modal.
 */

'use client'

import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition, Tab } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  UserIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { AdminUserDetail } from '@/types/admin'
import { CreditManagement } from './CreditManagement'
import { formatDate } from '@/utils/dateUtils'
import toast from 'react-hot-toast'

interface UserDetailModalProps {
  user: AdminUserDetail | null
  isOpen: boolean
  onClose: () => void
  onUpdateUser: (userId: number, data: any) => Promise<void>
  onSuspendUser: (userId: number, reason?: string) => Promise<void>
  onActivateUser: (userId: number) => Promise<void>
  onHardDeleteUser: (userId: number) => Promise<void>
  onAddCredits: (userId: number, amount: number, description: string) => Promise<void>
  onResetCredits: (userId: number, reason: string) => Promise<void>
  onRefundCredits: (userId: number, amount: number, reason: string) => Promise<void>
  onRefresh: () => void
}

export function UserDetailModal({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  onSuspendUser,
  onActivateUser,
  onHardDeleteUser,
  onAddCredits,
  onResetCredits,
  onRefundCredits,
  onRefresh,
}: UserDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!user) return null

  const handleSuspend = async () => {
    const reason = window.prompt('Dondurma sebebini girin:')
    if (!reason) return

    setIsLoading(true)
    try {
      await onSuspendUser(user.id, reason)
      toast.success('Kullanıcı donduruldu')
      onRefresh()
    } catch (error) {
      toast.error('Kullanıcı dondurulurken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivate = async () => {
    setIsLoading(true)
    try {
      await onActivateUser(user.id)
      toast.success('Kullanıcı aktifleştirildi')
      onRefresh()
    } catch (error) {
      toast.error('Kullanıcı aktifleştirilirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleHardDelete = async () => {
    const confirm1 = window.confirm(
      'UYARI: Bu işlem kullanıcıyı ve TÜM verilerini kalıcı olarak silecektir. Bu işlem GERİ ALINAMAZ!\n\nDevam etmek istediğinizden emin misiniz?'
    )
    if (!confirm1) return

    const confirm2 = window.prompt(
      'Onaylamak için kullanıcının email adresini yazın:'
    )
    if (confirm2 !== user.email) {
      toast.error('Email adresi eşleşmiyor')
      return
    }

    setIsLoading(true)
    try {
      await onHardDeleteUser(user.id)
      toast.success('Kullanıcı kalıcı olarak silindi')
      onClose()
    } catch (error) {
      toast.error('Kullanıcı silinirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (newRole: 'USER' | 'ADMIN') => {
    if (!window.confirm(`Kullanıcı rolünü ${newRole} olarak değiştirmek istediğinizden emin misiniz?`)) {
      return
    }

    setIsLoading(true)
    try {
      await onUpdateUser(user.id, { role: newRole })
      toast.success('Kullanıcı rolü güncellendi')
      onRefresh()
    } catch (error) {
      toast.error('Rol güncellenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'PROCESSING':
        return 'text-blue-600 bg-blue-100'
      case 'FAILED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Tamamlandı'
      case 'PENDING':
        return 'Bekliyor'
      case 'PROCESSING':
        return 'İşleniyor'
      case 'FAILED':
        return 'Başarısız'
      default:
        return status
    }
  }

  const getReportTypeText = (type: string) => {
    switch (type) {
      case 'PAINT_ANALYSIS':
        return 'Boya Analizi'
      case 'DAMAGE_ANALYSIS':
        return 'Hasar Tespiti'
      case 'VALUE_ESTIMATION':
        return 'Değer Tahmini'
      case 'ENGINE_SOUND_ANALYSIS':
        return 'Motor Ses Analizi'
      case 'COMPREHENSIVE_EXPERTISE':
        return 'Kapsamlı Ekspertiz'
      case 'FULL_REPORT':
        return 'Tam Rapor'
      default:
        return type
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-bold text-gray-900">
                        {user.firstName} {user.lastName}
                      </Dialog.Title>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.isActive ? (
                        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full text-red-600 bg-red-100">
                          <XCircleIcon className="w-4 h-4 mr-1" />
                          Pasif
                        </span>
                      )}
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        user.role === 'ADMIN' ? 'text-purple-600 bg-purple-100' : 'text-gray-600 bg-gray-100'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRoleChange.bind(null, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                        disabled={isLoading}
                        className="btn btn-secondary text-sm"
                      >
                        {user.role === 'ADMIN' ? 'User Yap' : 'Admin Yap'}
                      </button>
                      {user.isActive ? (
                        <button
                          onClick={handleSuspend}
                          disabled={isLoading}
                          className="btn bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                        >
                          <ShieldExclamationIcon className="w-4 h-4 mr-1" />
                          Dondur
                        </button>
                      ) : (
                        <button
                          onClick={handleActivate}
                          disabled={isLoading}
                          className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
                        >
                          <ShieldCheckIcon className="w-4 h-4 mr-1" />
                          Aktifleştir
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleHardDelete}
                      disabled={isLoading}
                      className="btn bg-red-600 hover:bg-red-700 text-white text-sm"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Kalıcı Sil
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <Tab.Group>
                  <Tab.List className="flex border-b border-gray-200 px-6">
                    <Tab className={({ selected }) =>
                      `py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                        selected
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`
                    }>
                      <UserIcon className="w-5 h-5 inline-block mr-2" />
                      Genel Bilgiler
                    </Tab>
                    <Tab className={({ selected }) =>
                      `py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                        selected
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`
                    }>
                      <CreditCardIcon className="w-5 h-5 inline-block mr-2" />
                      Kredi Yönetimi
                    </Tab>
                    <Tab className={({ selected }) =>
                      `py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                        selected
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`
                    }>
                      <DocumentTextIcon className="w-5 h-5 inline-block mr-2" />
                      Raporlar ({user.vehicleReports.length})
                    </Tab>
                    <Tab className={({ selected }) =>
                      `py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                        selected
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`
                    }>
                      <CurrencyDollarIcon className="w-5 h-5 inline-block mr-2" />
                      Ödemeler ({user.payments.length})
                    </Tab>
                  </Tab.List>

                  <Tab.Panels className="p-6 max-h-[600px] overflow-y-auto">
                    {/* Genel Bilgiler */}
                    <Tab.Panel>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Ad
                          </label>
                          <p className="text-gray-900">{user.firstName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Soyad
                          </label>
                          <p className="text-gray-900">{user.lastName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Email
                          </label>
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Telefon
                          </label>
                          <p className="text-gray-900">{user.phone || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Rol
                          </label>
                          <p className="text-gray-900">{user.role}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Durum
                          </label>
                          <p className="text-gray-900">
                            {user.isActive ? 'Aktif' : 'Pasif'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Email Doğrulanmış
                          </label>
                          <p className="text-gray-900">
                            {user.emailVerified ? 'Evet' : 'Hayır'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Kayıt Tarihi
                          </label>
                          <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>

                      {/* İstatistikler */}
                      <div className="mt-8">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Toplam Rapor</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {user.vehicleReports.length}
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Toplam Ödeme</p>
                            <p className="text-2xl font-bold text-green-600">
                              {user.payments.length}
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Toplam Harcama</p>
                            <p className="text-2xl font-bold text-purple-600">
                              ₺{user.payments
                                .filter(p => p.paymentStatus === 'COMPLETED')
                                .reduce((sum, p) => sum + p.amount, 0)
                                .toLocaleString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Tab.Panel>

                    {/* Kredi Yönetimi */}
                    <Tab.Panel>
                      <CreditManagement
                        userId={user.id}
                        currentBalance={Number(user.userCredits?.balance || 0)}
                        totalPurchased={Number(user.userCredits?.totalPurchased || 0)}
                        totalUsed={Number(user.userCredits?.totalUsed || 0)}
                        transactions={user.creditTransactions}
                        onAddCredits={(amount, description) =>
                          onAddCredits(user.id, amount, description)
                        }
                        onResetCredits={(reason) => onResetCredits(user.id, reason)}
                        onRefundCredits={(amount, reason) =>
                          onRefundCredits(user.id, amount, reason)
                        }
                      />
                    </Tab.Panel>

                    {/* Raporlar */}
                    <Tab.Panel>
                      <div className="space-y-3">
                        {user.vehicleReports.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            Henüz rapor bulunmuyor
                          </div>
                        ) : (
                          user.vehicleReports.map((report) => (
                            <div
                              key={report.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h5 className="font-medium text-gray-900">
                                      {getReportTypeText(report.reportType)}
                                    </h5>
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                        report.status
                                      )}`}
                                    >
                                      {getStatusText(report.status)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {report.vehiclePlate && `Plaka: ${report.vehiclePlate}`}
                                    {report.vehicleBrand && ` • ${report.vehicleBrand}`}
                                    {report.vehicleModel && ` ${report.vehicleModel}`}
                                    {report.vehicleYear && ` (${report.vehicleYear})`}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(report.createdAt)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-900">
                                    ₺{report.totalCost.toLocaleString('tr-TR')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Tab.Panel>

                    {/* Ödemeler */}
                    <Tab.Panel>
                      <div className="space-y-3">
                        {user.payments.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            Henüz ödeme bulunmuyor
                          </div>
                        ) : (
                          user.payments.map((payment) => (
                            <div
                              key={payment.id}
                              className="bg-white border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                        payment.paymentStatus === 'COMPLETED'
                                          ? 'text-green-600 bg-green-100'
                                          : payment.paymentStatus === 'PENDING'
                                          ? 'text-yellow-600 bg-yellow-100'
                                          : 'text-red-600 bg-red-100'
                                      }`}
                                    >
                                      {payment.paymentStatus === 'COMPLETED'
                                        ? 'Tamamlandı'
                                        : payment.paymentStatus === 'PENDING'
                                        ? 'Bekliyor'
                                        : payment.paymentStatus === 'FAILED'
                                        ? 'Başarısız'
                                        : 'İade Edildi'}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {payment.paymentMethod === 'CREDIT_CARD'
                                        ? 'Kredi Kartı'
                                        : payment.paymentMethod === 'BANK_TRANSFER'
                                        ? 'Banka Havalesi'
                                        : 'Dijital Cüzdan'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(payment.createdAt)}
                                  </p>
                                  {payment.transactionId && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      ID: {payment.transactionId}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-900">
                                    ₺{payment.amount.toLocaleString('tr-TR')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

