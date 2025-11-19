'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftIcon,
  PlusIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BoltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { FadeInUp } from '@/components/motion'
import { LoadingSpinner } from '@/components/ui'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface SupportTicket {
  id: number
  subject: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: string
  user: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
}

type TabType = 'all' | 'open' | 'in_progress' | 'resolved'

function SupportTicketsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  
  // URL'den tab parametresini al
  const tabFromUrl = searchParams.get('tab') as TabType | null
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl || 'all')

  useEffect(() => {
    fetchTickets()
  }, [])

  // URL'den tab değiştiğinde state'i güncelle
  useEffect(() => {
    if (tabFromUrl && ['all', 'open', 'in_progress', 'resolved'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  // Tab değiştiğinde URL'i güncelle
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'all') {
      params.delete('tab')
    } else {
      params.set('tab', tab)
    }
    router.push(`/dashboard/support?${params.toString()}`, { scroll: false })
  }

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/support/tickets')
      
      if (response.data.success) {
        setTickets(response.data.data.tickets || [])
      } else {
        // API başarısız döndü ama bu normal bir durum olabilir (henüz ticket yok)
        setTickets([])
      }
    } catch (error: any) {
      console.error('Destek talepleri yüklenemedi:', error)
      
      // 404 veya benzeri hatalar için hata mesajı gösterme (kullanıcının henüz ticket'ı olmayabilir)
      // Sadece gerçek hatalar için (500, network hatası vb.) mesaj göster
      if (error.response?.status && error.response.status >= 500) {
        toast.error('Destek talepleri yüklenirken hata oluştu')
      } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        toast.error('Destek talepleri yüklenirken hata oluştu')
      }
      // Diğer durumlarda (404, 401 vb.) sessizce boş liste set et
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />
      case 'IN_PROGRESS':
        return <ClockIcon className="w-5 h-5 text-blue-500" />
      case 'RESOLVED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'CLOSED':
        return <XCircleIcon className="w-5 h-5 text-gray-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Açık'
      case 'IN_PROGRESS':
        return 'İşlemde'
      case 'RESOLVED':
        return 'Çözüldü'
      case 'CLOSED':
        return 'Kapalı'
      default:
        return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'Acil'
      case 'HIGH':
        return 'Yüksek'
      case 'NORMAL':
        return 'Normal'
      case 'LOW':
        return 'Düşük'
      default:
        return priority
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'NORMAL':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'LOW':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Tab'lere göre filtreleme
  const getFilteredTickets = () => {
    switch (activeTab) {
      case 'open':
        return tickets.filter(t => t.status === 'OPEN')
      case 'in_progress':
        return tickets.filter(t => t.status === 'IN_PROGRESS')
      case 'resolved':
        return tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED')
      default:
        return tickets
    }
  }

  const filteredTickets = getFilteredTickets()

  // Tab istatistikleri
  const tabStats = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    in_progress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <ChatBubbleLeftIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Destek Merkezi</h1>
                <p className="text-blue-100 mt-1 flex items-center space-x-2">
                  <BoltIcon className="w-4 h-4" />
                  <span>Destek talepleriniz ışık hızında yanıtlanır!</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/support/new"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Yeni Talep</span>
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-white/90 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        {!loading && tickets.length > 0 && (
          <div className="mb-6 bg-white rounded-xl shadow-md border border-gray-200 p-2">
            <div className="flex space-x-2 overflow-x-auto">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Tümü
                {tabStats.all > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === 'all' ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {tabStats.all}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => handleTabChange('open')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'open'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Açık
                {tabStats.open > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === 'open' ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {tabStats.open}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => handleTabChange('in_progress')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'in_progress'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                İşlemde
                {tabStats.in_progress > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === 'in_progress' ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {tabStats.in_progress}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => handleTabChange('resolved')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'resolved'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <span>✅ Çözüldü / Arşiv</span>
                </span>
                {tabStats.resolved > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === 'resolved' ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {tabStats.resolved}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && tickets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Talep</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{tickets.length}</p>
                </div>
                <ChatBubbleLeftIcon className="w-10 h-10 text-blue-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Açık Talepler</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {tickets.filter(t => t.status === 'OPEN').length}
                  </p>
                </div>
                <ExclamationCircleIcon className="w-10 h-10 text-yellow-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">İşlemde</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {tickets.filter(t => t.status === 'IN_PROGRESS').length}
                  </p>
                </div>
                <ClockIcon className="w-10 h-10 text-blue-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Çözülen</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length}
                  </p>
                </div>
                <CheckCircleIcon className="w-10 h-10 text-green-500" />
              </div>
            </motion.div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : tickets.length === 0 ? (
          <FadeInUp>
            <div className="card p-12 text-center bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <SparklesIcon className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Henüz destek talebiniz yok
              </h3>
              <p className="text-gray-600 mb-2 text-lg">
                Sorununuz mu var? Endişelenmeyin, biz buradayız!
              </p>
              <p className="text-gray-500 mb-6">
                Destek ekibimiz 7/24 yanınızda. Hemen bir talep oluşturun.
              </p>
              <Link 
                href="/dashboard/support/new" 
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Yeni Talep Oluştur</span>
              </Link>
            </div>
          </FadeInUp>
        ) : filteredTickets.length === 0 ? (
          <FadeInUp>
            <div className="card p-12 text-center bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChatBubbleLeftIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {activeTab === 'resolved' 
                  ? 'Arşivde henüz çözümlenmiş talep yok'
                  : activeTab === 'open'
                  ? 'Açık talep bulunmuyor'
                  : 'İşlemde talep bulunmuyor'}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'resolved'
                  ? 'Çözümlenen talepleriniz burada görünecek'
                  : 'Bu kategoride henüz talep bulunmuyor'}
              </p>
              {activeTab !== 'all' && (
                <button
                  onClick={() => handleTabChange('all')}
                  className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                >
                  <span>Tüm Talepleri Görüntüle</span>
                </button>
              )}
            </div>
          </FadeInUp>
        ) : (
          <FadeInUp>
            {/* Tab başlığı */}
            {activeTab !== 'all' && (
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {activeTab === 'open' && '🔓 Açık Talepler'}
                  {activeTab === 'in_progress' && '⚙️ İşlemdeki Talepler'}
                  {activeTab === 'resolved' && '✅ Çözümlenen Talepler (Arşiv)'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === 'resolved' 
                    ? 'Çözüme kavuşan tüm talepleriniz burada arşivlenir'
                    : `${filteredTickets.length} talep bulundu`}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              {filteredTickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/dashboard/support/${ticket.id}`}>
                    <div className="card p-6 hover:shadow-xl transition-all cursor-pointer bg-white rounded-xl border border-gray-200 hover:border-blue-300 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            {getStatusIcon(ticket.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                {ticket.subject}
                              </h3>
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                📋 Sadece görüntüleme
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {ticket.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-3">
                              <p className="text-xs text-gray-500">
                                📅 {new Date(ticket.createdAt).toLocaleString('tr-TR')}
                              </p>
                              <span className="text-xs text-gray-500">
                                🏷️ {ticket.category === 'GENERAL' ? 'Genel' : 
                                     ticket.category === 'TECHNICAL' ? 'Teknik' :
                                     ticket.category === 'BILLING' ? 'Faturalama' :
                                     ticket.category === 'REPORT_ISSUE' ? 'Rapor Sorunu' :
                                     'Özellik İsteği'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <span className={`px-4 py-2 rounded-full text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                            {getPriorityText(ticket.priority)}
                          </span>
                          <span className="px-4 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            {getStatusText(ticket.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </FadeInUp>
        )}
      </div>
    </div>
  )
}

export default function SupportTicketsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <SupportTicketsContent />
    </Suspense>
  )
}
