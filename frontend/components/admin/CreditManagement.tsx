/**
 * Credit Management Component
 * 
 * Kullanıcı kredi yönetimi için component.
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { CreditTransaction } from '@/types/admin'
import { formatDate } from '@/utils/dateUtils'
import toast from 'react-hot-toast'

interface CreditManagementProps {
  userId: number
  currentBalance: number
  totalPurchased: number
  totalUsed: number
  transactions: CreditTransaction[]
  onAddCredits: (amount: number, description: string) => Promise<void>
  onResetCredits: (reason: string) => Promise<void>
  onRefundCredits: (amount: number, reason: string) => Promise<void>
}

export function CreditManagement({
  userId,
  currentBalance,
  totalPurchased,
  totalUsed,
  transactions,
  onAddCredits,
  onResetCredits,
  onRefundCredits,
}: CreditManagementProps) {
  const [activeTab, setActiveTab] = useState<'add' | 'refund' | 'reset'>('add')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAddCredits = async () => {
    const creditAmount = parseFloat(amount)
    if (!creditAmount || creditAmount <= 0) {
      toast.error('Geçerli bir miktar girin')
      return
    }

    setIsLoading(true)
    try {
      await onAddCredits(creditAmount, description)
      setAmount('')
      setDescription('')
      toast.success('Kredi başarıyla eklendi')
    } catch (error) {
      toast.error('Kredi eklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefundCredits = async () => {
    const refundAmount = parseFloat(amount)
    if (!refundAmount || refundAmount <= 0) {
      toast.error('Geçerli bir miktar girin')
      return
    }

    setIsLoading(true)
    try {
      await onRefundCredits(refundAmount, reason)
      setAmount('')
      setReason('')
      toast.success('İade başarıyla yapıldı')
    } catch (error) {
      toast.error('İade yapılırken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetCredits = async () => {
    if (!window.confirm('Tüm kredileri sıfırlamak istediğinizden emin misiniz?')) {
      return
    }

    setIsLoading(true)
    try {
      await onResetCredits(reason)
      setReason('')
      toast.success('Krediler sıfırlandı')
    } catch (error) {
      toast.error('Krediler sıfırlanırken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return 'Satın Alma'
      case 'USAGE':
        return 'Kullanım'
      case 'REFUND':
        return 'İade'
      default:
        return type
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return 'text-green-600 bg-green-100'
      case 'USAGE':
        return 'text-red-600 bg-red-100'
      case 'REFUND':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Kredi Özeti */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Mevcut Bakiye</p>
          <p className="text-2xl font-bold text-blue-600">₺{currentBalance.toLocaleString('tr-TR')}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Toplam Satın Alınan</p>
          <p className="text-2xl font-bold text-green-600">₺{totalPurchased.toLocaleString('tr-TR')}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Toplam Kullanılan</p>
          <p className="text-2xl font-bold text-purple-600">₺{totalUsed.toLocaleString('tr-TR')}</p>
        </div>
      </div>

      {/* İşlem Seçenekleri */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab('add')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'add'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PlusIcon className="w-5 h-5 inline-block mr-2" />
            Kredi Ekle
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'refund'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ArrowPathIcon className="w-5 h-5 inline-block mr-2" />
            İade Yap
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reset'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MinusIcon className="w-5 h-5 inline-block mr-2" />
            Sıfırla
          </button>
        </nav>
      </div>

      {/* İşlem Formu */}
      <div className="bg-gray-50 rounded-lg p-6">
        {activeTab === 'add' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eklenecek Kredi Miktarı (₺)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input w-full"
                placeholder="1000"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama (Opsiyonel)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input w-full"
                placeholder="Bonus kredi"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleAddCredits}
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Ekleniyor...' : 'Kredi Ekle'}
            </button>
          </div>
        )}

        {activeTab === 'refund' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İade Miktarı (₺)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input w-full"
                placeholder="100"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İade Sebebi
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input w-full"
                placeholder="Hatalı işlem"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleRefundCredits}
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'İade Yapılıyor...' : 'İade Yap'}
            </button>
          </div>
        )}

        {activeTab === 'reset' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Uyarı:</strong> Bu işlem tüm kredileri sıfırlayacaktır ve geri alınamaz!
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sıfırlama Sebebi
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input w-full"
                placeholder="Hesap kapatma talebi"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleResetCredits}
              disabled={isLoading}
              className="btn bg-red-600 hover:bg-red-700 text-white w-full"
            >
              {isLoading ? 'Sıfırlanıyor...' : 'Kredileri Sıfırla'}
            </button>
          </div>
        )}
      </div>

      {/* İşlem Geçmişi */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ClockIcon className="w-5 h-5 mr-2" />
          İşlem Geçmişi
        </h3>
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Henüz işlem geçmişi bulunmuyor
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(
                          transaction.transactionType
                        )}`}
                      >
                        {getTransactionTypeLabel(transaction.transactionType)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </span>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-gray-700 mt-1">
                        {transaction.description}
                      </p>
                    )}
                    {transaction.referenceId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Ref: {transaction.referenceId}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.transactionType === 'USAGE'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {transaction.transactionType === 'USAGE' ? '-' : '+'}₺
                      {transaction.amount.toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

