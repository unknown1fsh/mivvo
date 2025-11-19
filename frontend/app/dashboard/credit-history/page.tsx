'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCardIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ClockIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { FadeInUp } from '@/components/motion'
import { LoadingSpinner } from '@/components/ui'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface CreditTransaction {
  id: number
  transactionType: string
  amount: string
  description: string | null
  referenceId: string | null
  status: string
  metadata: any
  createdAt: string
}

export default function CreditHistoryPage() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState({
    type: '',
    status: '',
  })

  useEffect(() => {
    fetchTransactions()
  }, [page, filter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        ...(filter.type && { type: filter.type }),
        ...(filter.status && { status: filter.status }),
      })

      const response = await api.get(`/api/user/credits/history?${params}`)
      
      if (response.data.success) {
        setTransactions(response.data.data.transactions)
        setTotalPages(response.data.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Kredi geçmişi yüklenemedi:', error)
      toast.error('Kredi geçmişi yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return <ArrowUpCircleIcon className="w-6 h-6 text-green-500" />
      case 'USAGE':
        return <ArrowDownCircleIcon className="w-6 h-6 text-red-500" />
      case 'REFUND':
        return <ArrowDownCircleIcon className="w-6 h-6 text-blue-500" />
      default:
        return <ClockIcon className="w-6 h-6 text-gray-500" />
    }
  }

  const getTransactionTypeName = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return 'Kredi Yükleme'
      case 'USAGE':
        return 'Analiz Kullanımı'
      case 'REFUND':
        return 'Kredi İadesi'
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'FAILED':
        return 'text-red-600 bg-red-100'
      case 'REFUNDED':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const exportToCSV = () => {
    const csv = [
      ['Tarih', 'Tip', 'Miktar', 'Durum', 'Açıklama'],
      ...transactions.map(t => [
        new Date(t.createdAt).toLocaleDateString('tr-TR'),
        getTransactionTypeName(t.transactionType),
        t.amount,
        t.status,
        t.description || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kredi-gecmisi-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('CSV dosyası indirildi')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <CreditCardIcon className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold">Kredi Geçmişi</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                CSV İndir
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtreler */}
        <FadeInUp>
          <div className="card p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <FunnelIcon className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Filtreler</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İşlem Tipi
                </label>
                <select
                  value={filter.type}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tümü</option>
                  <option value="PURCHASE">Kredi Yükleme</option>
                  <option value="USAGE">Kullanım</option>
                  <option value="REFUND">İade</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tümü</option>
                  <option value="COMPLETED">Tamamlandı</option>
                  <option value="PENDING">Beklemede</option>
                  <option value="FAILED">Başarısız</option>
                  <option value="REFUNDED">İade Edildi</option>
                </select>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Transactions List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : transactions.length === 0 ? (
          <FadeInUp>
            <div className="card p-12 text-center">
              <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz işlem yok
              </h3>
              <p className="text-gray-600 mb-4">
                Henüz kredi işleminiz bulunmuyor.
              </p>
              <Link href="/dashboard" className="btn btn-primary">
                Dashboard&apos;a Dön
              </Link>
            </div>
          </FadeInUp>
        ) : (
          <FadeInUp>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getTransactionIcon(transaction.transactionType)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getTransactionTypeName(transaction.transactionType)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {transaction.description || 'Açıklama yok'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.transactionType === 'PURCHASE' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transactionType === 'PURCHASE' ? '+' : '-'}
                        {parseFloat(transaction.amount).toFixed(2)} ₺
                      </p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>

                  {transaction.referenceId && (
                    <div className="mt-2 text-xs text-gray-500">
                      Referans: {transaction.referenceId}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </FadeInUp>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Önceki
            </button>

            <span className="px-4 py-2 text-gray-700">
              Sayfa {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

