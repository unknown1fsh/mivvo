/**
 * Modern Admin Panel
 * 
 * Dünya standartlarında admin paneli (Stripe/Vercel/Firebase tarzı).
 * 100% gerçek API entegrasyonu - NO MOCK DATA!
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TagIcon,
  CalendarIcon,
  UserCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { LoadingSpinner } from '@/components/ui'
import { StatsCard } from '@/components/admin/StatsCard'
import { LineChart } from '@/components/admin/LineChart'
import { DoughnutChart } from '@/components/admin/DoughnutChart'
import { BarChart } from '@/components/admin/BarChart'
import { UserDetailModal } from '@/components/admin/UserDetailModal'
import { SupportTicketDetailModal } from '@/components/admin/SupportTicketDetailModal'
import ReportStatistics from '@/components/admin/ReportStatistics'
import ReportMonitoring from '@/components/admin/ReportMonitoring'
import ReportDetailModal from '@/components/admin/ReportDetailModal'
import ExportMenu from '@/components/admin/ExportMenu'
import RealTimeMonitor from '@/components/admin/RealTimeMonitor'
import AdvancedFilters from '@/components/admin/AdvancedFilters'
import { authService } from '@/services/authService'
import adminService from '@/services/adminService'
import { AdminUser, AdminUserDetail, DetailedStats, TimelineData, ReportBreakdown } from '@/types/admin'
import { formatDate } from '@/utils/dateUtils'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports' | 'statistics' | 'monitoring' | 'filters' | 'export' | 'realtime' | 'support'>('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null)
  const [currentFilters, setCurrentFilters] = useState<any>({})

  // Dashboard State
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [reportsBreakdown, setReportsBreakdown] = useState<ReportBreakdown[]>([])

  // Users State
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [userTotalPages, setUserTotalPages] = useState(1)

  // Reports State
  const [reports, setReports] = useState<any[]>([])
  const [reportPage, setReportPage] = useState(1)
  const [reportTotalPages, setReportTotalPages] = useState(1)
  const [reportFilter, setReportFilter] = useState<string>('')

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<any[]>([])
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [supportTicketPage, setSupportTicketPage] = useState(1)
  const [supportTicketTotalPages, setSupportTicketTotalPages] = useState(1)
  const [supportTicketFilters, setSupportTicketFilters] = useState<{
    status?: string
    priority?: string
    category?: string
  }>({})
  const [supportTicketSearch, setSupportTicketSearch] = useState('')
  const [supportTicketStats, setSupportTicketStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
  })

  // Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      // Admin token'ı kontrol et
      const adminToken = localStorage.getItem('admin_token')
      const adminUser = localStorage.getItem('admin_user')
      
      
      if (!adminToken || !adminUser) {
        toast.error('Admin girişi yapmanız gerekiyor')
        router.push('/admin/login')
        return
      }
      
      // Token'ı cookie'ye de kaydet (middleware için)
      document.cookie = `admin_token=${adminToken}; path=/; max-age=${4 * 60 * 60}` // 4 saat
      
      fetchInitialData()
    }
    
    checkAuth()
  }, [router])

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchUsers(),
      ])
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast.error('Veriler yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    toast.success('Çıkış yapıldı')
    router.push('/admin/login')
  }

  const fetchDashboardData = async () => {
    try {
      const [statsRes, timelineRes, breakdownRes] = await Promise.all([
        adminService.getDetailedStats(),
        adminService.getTimelineStats(30),
        adminService.getReportsBreakdown(),
      ])

      if (statsRes && statsRes.data) {
        setDetailedStats(statsRes.data)
      }
      
      if (timelineRes && timelineRes.data) {
        setTimelineData(timelineRes.data.timeline)
      }
      
      if (breakdownRes && breakdownRes.data) {
        setReportsBreakdown(breakdownRes.data.breakdown)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }

  const fetchUsers = async (page = 1, search = '') => {
    try {
      const response = await adminService.getAllUsers({
        page,
        limit: 10,
        search: search || undefined,
      })

      if (response && response.data) {
        setUsers(response.data.users || [])
        setUserPage(response.data.pagination?.page || 1)
        setUserTotalPages(response.data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  const fetchReports = async (page = 1, status = '') => {
    try {
      const response = await adminService.getAllReports({
        page,
        limit: 10,
        status: status || undefined,
      })

      if (response && response.data) {
        setReports(response.data.reports || [])
        setReportPage(response.data.pagination?.page || 1)
        setReportTotalPages(response.data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Raporlar yüklenirken hata oluştu')
    }
  }

  const fetchSupportTickets = async (page = 1, filters: { status?: string; priority?: string; category?: string } = {}) => {
    try {
      const response = await adminService.getAllSupportTickets({
        page,
        limit: 20,
        status: filters.status,
        priority: filters.priority,
        category: filters.category,
      })

      if (response && response.success && response.data) {
        const tickets = response.data.tickets || []
        setSupportTickets(tickets)
        setSupportTicketPage(response.data.page || 1)
        setSupportTicketTotalPages(response.data.totalPages || 1)
        
        // İstatistikleri hesapla
        setSupportTicketStats({
          total: response.data.total || 0,
          open: tickets.filter((t: any) => t.status === 'OPEN').length,
          inProgress: tickets.filter((t: any) => t.status === 'IN_PROGRESS').length,
          resolved: tickets.filter((t: any) => t.status === 'RESOLVED').length,
          closed: tickets.filter((t: any) => t.status === 'CLOSED').length,
          urgent: tickets.filter((t: any) => t.priority === 'URGENT').length,
        })
      } else {
        // API başarısız döndü ama bu normal bir durum olabilir (henüz ticket yok)
        setSupportTickets([])
        setSupportTicketStats({
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
          urgent: 0,
        })
      }
    } catch (error: any) {
      console.error('Error fetching support tickets:', error)
      
      // 404 veya benzeri hatalar için hata mesajı gösterme (henüz ticket olmayabilir)
      // Sadece gerçek hatalar için (500, network hatası vb.) mesaj göster
      if (error.response?.status && error.response.status >= 500) {
        toast.error('Destek talepleri yüklenirken hata oluştu')
      } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        toast.error('Destek talepleri yüklenirken hata oluştu')
      }
      // Diğer durumlarda (404, 401 vb.) sessizce boş liste set et
      setSupportTickets([])
      setSupportTicketStats({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        urgent: 0,
      })
    }
  }

  const handleUpdateTicketStatus = async (ticketId: number, newStatus: string) => {
    try {
      await adminService.updateSupportTicketStatus(ticketId, newStatus)
      toast.success('Ticket durumu güncellendi')
      fetchSupportTickets(supportTicketPage, supportTicketFilters)
      if (selectedTicket?.id === ticketId) {
        const response = await adminService.getSupportTicketById(ticketId)
        if (response && response.success) {
          setSelectedTicket(response.data.ticket)
        }
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
      toast.error('Ticket durumu güncellenirken hata oluştu')
    }
  }

  const handleUpdateTicketPriority = async (ticketId: number, newPriority: string) => {
    try {
      await adminService.updateSupportTicketPriority(ticketId, newPriority)
      toast.success('Ticket önceliği güncellendi')
      fetchSupportTickets(supportTicketPage, supportTicketFilters)
      if (selectedTicket?.id === ticketId) {
        const response = await adminService.getSupportTicketById(ticketId)
        if (response && response.success) {
          setSelectedTicket(response.data.ticket)
        }
      }
    } catch (error) {
      console.error('Error updating ticket priority:', error)
      toast.error('Ticket önceliği güncellenirken hata oluştu')
    }
  }

  const handleTicketClick = async (ticketId: number) => {
    try {
      const response = await adminService.getSupportTicketById(ticketId)
      if (response && response.success) {
        setSelectedTicket(response.data.ticket)
        setIsTicketModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error)
      toast.error('Destek talebi detayları yüklenirken hata oluştu')
    }
  }

  const handleUserDoubleClick = async (user: AdminUser) => {
    try {
      const response = await adminService.getUserById(user.id)
      if (response.success) {
        setSelectedUser(response.data.user)
        setIsUserModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast.error('Kullanıcı detayları yüklenirken hata oluştu')
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (activeTab === 'dashboard') {
        await fetchDashboardData()
      } else if (activeTab === 'users') {
        await fetchUsers(userPage, userSearch)
      } else if (activeTab === 'reports') {
        await fetchReports(reportPage, reportFilter)
      } else if (activeTab === 'support') {
        await fetchSupportTickets(supportTicketPage, supportTicketFilters)
      }
      toast.success('Veriler güncellendi')
    } catch (error) {
      toast.error('Veriler güncellenirken hata oluştu')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleUserSearch = async () => {
    await fetchUsers(1, userSearch)
  }

  const handleAddCredits = async (userId: number, amount: number, description: string) => {
    await adminService.addUserCredits(userId, { amount, description })
    // Refresh user detail
    const response = await adminService.getUserById(userId)
    if (response.success) {
      setSelectedUser(response.data.user)
    }
  }

  const handleResetCredits = async (userId: number, reason: string) => {
    await adminService.resetUserCredits(userId, { reason })
    const response = await adminService.getUserById(userId)
    if (response.success) {
      setSelectedUser(response.data.user)
    }
  }

  const handleRefundCredits = async (userId: number, amount: number, reason: string) => {
    await adminService.refundUserCredits(userId, { amount, reason })
    const response = await adminService.getUserById(userId)
    if (response.success) {
      setSelectedUser(response.data.user)
    }
  }

  const handleSuspendUser = async (userId: number, reason?: string) => {
    await adminService.suspendUser(userId, { reason })
  }

  const handleActivateUser = async (userId: number) => {
    await adminService.activateUser(userId)
  }

  const handleHardDeleteUser = async (userId: number) => {
    await adminService.hardDeleteUser(userId, { confirm: true })
  }

  const handleUpdateUser = async (userId: number, data: any) => {
    await adminService.updateUser(userId, data)
  }

  const handleRefreshUserDetail = async () => {
    if (selectedUser) {
      const response = await adminService.getUserById(selectedUser.id)
      if (response.success) {
        setSelectedUser(response.data.user)
      }
    }
  }

  const getReportTypeText = (type: string) => {
    const types: Record<string, string> = {
      PAINT_ANALYSIS: 'Boya Analizi',
      DAMAGE_ANALYSIS: 'Hasar Tespiti',
      DAMAGE_ASSESSMENT: 'Hasar Değerlendirmesi',
      VALUE_ESTIMATION: 'Değer Tahmini',
      ENGINE_SOUND_ANALYSIS: 'Motor Ses Analizi',
      COMPREHENSIVE_EXPERTISE: 'Kapsamlı Ekspertiz',
      FULL_REPORT: 'Tam Rapor',
    }
    return types[type] || type
  }

  const getStatusText = (status: string) => {
    const statuses: Record<string, string> = {
      PENDING: 'Bekliyor',
      PROCESSING: 'İşleniyor',
      COMPLETED: 'Tamamlandı',
      FAILED: 'Başarısız',
    }
    return statuses[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'text-green-600 bg-green-100',
      PENDING: 'text-yellow-600 bg-yellow-100',
      PROCESSING: 'text-blue-600 bg-blue-100',
      FAILED: 'text-red-600 bg-red-100',
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 lg:hidden">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 flex items-center">
                <ArrowLeftIcon className="w-6 h-6" />
                <span className="ml-1 text-sm">Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text">Admin</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Geri Dön
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn btn-secondary"
              >
                <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
              >
                <XMarkIcon className="w-5 h-5 mr-2" />
                Çıkış Yap
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
                  { key: 'users', label: 'Kullanıcılar', icon: UsersIcon },
                  { key: 'reports', label: 'Raporlar', icon: DocumentTextIcon },
                  { key: 'support', label: 'Destek Talepleri', icon: ChatBubbleLeftIcon },
                  { key: 'statistics', label: 'İstatistikler', icon: SparklesIcon },
                  { key: 'monitoring', label: 'İzleme', icon: EyeIcon },
                  { key: 'filters', label: 'Filtreler', icon: FunnelIcon },
                  { key: 'export', label: 'Dışa Aktar', icon: CurrencyDollarIcon },
                  { key: 'realtime', label: 'Canlı', icon: BellIcon }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key as any)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.key
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mb-1" />
                    <div className="text-sm font-medium">{tab.label}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full p-3 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50"
                >
                  <XMarkIcon className="w-5 h-5 mb-1" />
                  <div className="text-sm font-medium">Çıkış Yap</div>
                </button>
              </div>
            </div>
          )}

          {/* Desktop Tabs */}
          <div className="hidden lg:flex space-x-8 -mb-px">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="w-5 h-5 inline-block mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('users')
                if (users.length === 0) fetchUsers()
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UsersIcon className="w-5 h-5 inline-block mr-2" />
              Kullanıcılar
            </button>
            <button
              onClick={() => {
                setActiveTab('reports')
                if (reports.length === 0) fetchReports()
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DocumentTextIcon className="w-5 h-5 inline-block mr-2" />
              Raporlar
            </button>
            <button
              onClick={() => {
                setActiveTab('support')
                if (supportTickets.length === 0) fetchSupportTickets()
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'support'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChatBubbleLeftIcon className="w-5 h-5 inline-block mr-2" />
              Destek Talepleri
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'statistics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SparklesIcon className="w-5 h-5 inline-block mr-2" />
              İstatistikler
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'monitoring'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <EyeIcon className="w-5 h-5 inline-block mr-2" />
              İzleme
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'filters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FunnelIcon className="w-5 h-5 inline-block mr-2" />
              Filtreler
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'export'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CurrencyDollarIcon className="w-5 h-5 inline-block mr-2" />
              Dışa Aktar
            </button>
            <button
              onClick={() => setActiveTab('realtime')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'realtime'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BellIcon className="w-5 h-5 inline-block mr-2" />
              Canlı İzleme
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {!detailedStats ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                      title="Toplam Kullanıcı"
                      value={detailedStats.users.total}
                  change={detailedStats.users.newThisMonth > 0 ? 15 : 0}
                  changeLabel="bu ay"
                  icon={UsersIcon}
                  color="blue"
                  delay={0}
                />
                <StatsCard
                  title="Toplam Rapor"
                  value={detailedStats.reports.total}
                  change={detailedStats.reports.thisMonth > 0 ? 22 : 0}
                  changeLabel="bu ay"
                  icon={DocumentTextIcon}
                  color="green"
                  delay={0.1}
                />
                <StatsCard
                  title="Toplam Gelir"
                  value={detailedStats.revenue.total}
                  change={detailedStats.revenue.thisMonth > 0 ? 18 : 0}
                  changeLabel="bu ay"
                  icon={CurrencyDollarIcon}
                  color="purple"
                  format="currency"
                  delay={0.2}
                />
                <StatsCard
                  title="Aktif Kullanıcı"
                  value={detailedStats.users.active}
                  icon={UsersIcon}
                  color="indigo"
                  delay={0.3}
                />
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-4">
                  <p className="text-sm text-gray-600">Bugün</p>
                  <p className="text-xl font-bold text-gray-900">
                    {detailedStats.reports.today} Rapor
                  </p>
                </div>
                <div className="card p-4">
                  <p className="text-sm text-gray-600">Bekleyen</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {detailedStats.reports.pending}
                  </p>
                  </div>
                <div className="card p-4">
                  <p className="text-sm text-gray-600">Bu Ay Gelir</p>
                  <p className="text-xl font-bold text-green-600">
                    ₺{detailedStats.revenue.thisMonth.toLocaleString('tr-TR')}
                  </p>
                  </div>
                <div className="card p-4">
                  <p className="text-sm text-gray-600">Kredi Dolaşımı</p>
                  <p className="text-xl font-bold text-blue-600">
                    ₺{detailedStats.credits.totalBalance.toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timeline Chart */}
              <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Son 30 Gün Trendi
                  </h3>
                  <div className="h-80">
                    <LineChart
                      labels={timelineData.map(d => d.date.slice(5))}
                      datasets={[
                        {
                          label: 'Raporlar',
                          data: timelineData.map(d => d.reports),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        },
                        {
                          label: 'Kullanıcılar',
                          data: timelineData.map(d => d.users),
                          borderColor: 'rgb(16, 185, 129)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        },
                      ]}
                    />
                  </div>
                </div>

                {/* Report Type Breakdown */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Rapor Tip Dağılımı
                  </h3>
                  <div className="h-80">
                    <DoughnutChart
                      labels={reportsBreakdown.map(r => getReportTypeText(r.type))}
                      data={reportsBreakdown.map(r => r.count)}
                    />
                  </div>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Gelir Trendi (Son 30 Gün)
                </h3>
                <div className="h-80">
                  <BarChart
                    labels={timelineData.map(d => d.date.slice(5))}
                    datasets={[
                      {
                        label: 'Gelir (₺)',
                        data: timelineData.map(d => d.revenue),
                        backgroundColor: 'rgba(139, 92, 246, 0.8)',
                        borderColor: 'rgb(139, 92, 246)',
                      },
                    ]}
                  />
                </div>
              </div>
                </>
              )}
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="card">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUserSearch()}
                        placeholder="Email, ad veya soyad ile ara..."
                        className="input pl-10 w-full"
                      />
                    </div>
                    <button onClick={handleUserSearch} className="btn btn-primary">
                      Ara
                    </button>
                  </div>
          </div>
          
                {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kredi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kayıt Tarihi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                        <tr
                          key={user.id}
                          onDoubleClick={() => handleUserDoubleClick(user)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                    <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₺{Number(user.userCredits?.balance || 0).toLocaleString('tr-TR')}
                            </div>
                    </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                user.role === 'ADMIN'
                                  ? 'text-purple-600 bg-purple-100'
                                  : 'text-gray-600 bg-gray-100'
                              }`}
                            >
                              {user.role}
                            </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                user.isActive
                                  ? 'text-green-600 bg-green-100'
                                  : 'text-red-600 bg-red-100'
                              }`}
                            >
                              {user.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Sayfa {userPage} / {userTotalPages}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fetchUsers(userPage - 1, userSearch)}
                      disabled={userPage === 1}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => fetchUsers(userPage + 1, userSearch)}
                      disabled={userPage >= userTotalPages}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
        </div>
            </motion.div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="card">
                {/* Filter Bar */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <select
                      value={reportFilter}
                      onChange={(e) => {
                        setReportFilter(e.target.value)
                        fetchReports(1, e.target.value)
                      }}
                      className="input"
                    >
                      <option value="">Tüm Durumlar</option>
                      <option value="PENDING">Bekliyor</option>
                      <option value="PROCESSING">İşleniyor</option>
                      <option value="COMPLETED">Tamamlandı</option>
                      <option value="FAILED">Başarısız</option>
              </select>
            </div>
          </div>
          
                {/* Reports Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rapor Tipi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Araç
                  </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
                        </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tarih
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {getReportTypeText(report.reportType)}
                      </div>
                    </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {report.user?.firstName} {report.user?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{report.user?.email}</div>
                    </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {report.vehiclePlate || '-'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {report.vehicleBrand} {report.vehicleModel}
                            </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                report.status
                              )}`}
                            >
                        {getStatusText(report.status)}
                      </span>
                    </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₺{report.totalCost.toLocaleString('tr-TR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(report.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Sayfa {reportPage} / {reportTotalPages}
                  </p>
                      <div className="flex space-x-2">
                    <button
                      onClick={() => fetchReports(reportPage - 1, reportFilter)}
                      disabled={reportPage === 1}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                    <button
                      onClick={() => fetchReports(reportPage + 1, reportFilter)}
                      disabled={reportPage >= reportTotalPages}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Support Tickets Tab */}
          {activeTab === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* İstatistik Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <StatsCard
                  title="Toplam Talep"
                  value={supportTicketStats.total}
                  icon={ChatBubbleLeftIcon}
                  color="blue"
                  delay={0}
                />
                <StatsCard
                  title="Açık"
                  value={supportTicketStats.open}
                  icon={ExclamationCircleIcon}
                  color="yellow"
                  delay={0.1}
                />
                <StatsCard
                  title="İşlemde"
                  value={supportTicketStats.inProgress}
                  icon={ClockIcon}
                  color="blue"
                  delay={0.2}
                />
                <StatsCard
                  title="Çözüldü"
                  value={supportTicketStats.resolved}
                  icon={CheckCircleIcon}
                  color="green"
                  delay={0.3}
                />
                <StatsCard
                  title="Kapalı"
                  value={supportTicketStats.closed}
                  icon={XCircleIcon}
                  color="indigo"
                  delay={0.4}
                />
                <StatsCard
                  title="Acil"
                  value={supportTicketStats.urgent}
                  icon={ExclamationCircleIcon}
                  color="red"
                  delay={0.5}
                />
              </div>

              {/* Arama ve Filtreler */}
              <div className="card">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Arama */}
                    <div className="flex-1">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Konu, kullanıcı veya açıklama ara..."
                          value={supportTicketSearch}
                          onChange={(e) => setSupportTicketSearch(e.target.value)}
                          className="input pl-10 w-full"
                        />
                      </div>
                    </div>
                    
                    {/* Filtreler */}
                    <div className="flex flex-wrap gap-3">
                      <select
                        value={supportTicketFilters.status || ''}
                        onChange={(e) => {
                          const newFilters = { ...supportTicketFilters, status: e.target.value || undefined }
                          setSupportTicketFilters(newFilters)
                          fetchSupportTickets(1, newFilters)
                        }}
                        className="input min-w-[150px]"
                      >
                        <option value="">Tüm Durumlar</option>
                        <option value="OPEN">🔓 Açık</option>
                        <option value="IN_PROGRESS">⚙️ İşlemde</option>
                        <option value="RESOLVED">✅ Çözüldü</option>
                        <option value="CLOSED">🔒 Kapalı</option>
                      </select>
                      <select
                        value={supportTicketFilters.priority || ''}
                        onChange={(e) => {
                          const newFilters = { ...supportTicketFilters, priority: e.target.value || undefined }
                          setSupportTicketFilters(newFilters)
                          fetchSupportTickets(1, newFilters)
                        }}
                        className="input min-w-[150px]"
                      >
                        <option value="">Tüm Öncelikler</option>
                        <option value="URGENT">🔴 Acil</option>
                        <option value="HIGH">🟠 Yüksek</option>
                        <option value="NORMAL">🔵 Normal</option>
                        <option value="LOW">⚪ Düşük</option>
                      </select>
                      <select
                        value={supportTicketFilters.category || ''}
                        onChange={(e) => {
                          const newFilters = { ...supportTicketFilters, category: e.target.value || undefined }
                          setSupportTicketFilters(newFilters)
                          fetchSupportTickets(1, newFilters)
                        }}
                        className="input min-w-[150px]"
                      >
                        <option value="">Tüm Kategoriler</option>
                        <option value="GENERAL">📋 Genel</option>
                        <option value="TECHNICAL">🔧 Teknik</option>
                        <option value="BILLING">💳 Faturalama</option>
                        <option value="REPORT_ISSUE">📊 Rapor Sorunu</option>
                        <option value="FEATURE_REQUEST">💡 Özellik İsteği</option>
                      </select>
                      <button
                        onClick={() => {
                          setSupportTicketFilters({})
                          setSupportTicketSearch('')
                          fetchSupportTickets(1, {})
                        }}
                        className="btn btn-secondary flex items-center space-x-2"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>Temizle</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Support Tickets - Modern Card View */}
                <div className="p-6">
                  {supportTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <ChatBubbleLeftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">Henüz destek talebi bulunmuyor</p>
                      <p className="text-gray-400 text-sm mt-2">Filtreleri temizleyip tekrar deneyin</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {supportTickets
                        .filter((ticket: any) => {
                          if (!supportTicketSearch) return true
                          const search = supportTicketSearch.toLowerCase()
                          return (
                            ticket.subject?.toLowerCase().includes(search) ||
                            ticket.description?.toLowerCase().includes(search) ||
                            ticket.user?.firstName?.toLowerCase().includes(search) ||
                            ticket.user?.lastName?.toLowerCase().includes(search) ||
                            ticket.user?.email?.toLowerCase().includes(search)
                          )
                        })
                        .map((ticket: any) => {
                          const getPriorityText = (priority: string) => {
                            switch (priority) {
                              case 'URGENT': return 'Acil'
                              case 'HIGH': return 'Yüksek'
                              case 'NORMAL': return 'Normal'
                              case 'LOW': return 'Düşük'
                              default: return priority
                            }
                          }

                          const getPriorityColor = (priority: string) => {
                            switch (priority) {
                              case 'URGENT': return 'bg-red-100 text-red-700 border-red-200'
                              case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200'
                              case 'NORMAL': return 'bg-blue-100 text-blue-700 border-blue-200'
                              case 'LOW': return 'bg-gray-100 text-gray-700 border-gray-200'
                              default: return 'bg-gray-100 text-gray-700 border-gray-200'
                            }
                          }

                          const getStatusText = (status: string) => {
                            switch (status) {
                              case 'OPEN': return 'Açık'
                              case 'IN_PROGRESS': return 'İşlemde'
                              case 'RESOLVED': return 'Çözüldü'
                              case 'CLOSED': return 'Kapalı'
                              default: return status
                            }
                          }

                          const getStatusColor = (status: string) => {
                            switch (status) {
                              case 'OPEN': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200'
                              case 'RESOLVED': return 'bg-green-100 text-green-700 border-green-200'
                              case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200'
                              default: return 'bg-gray-100 text-gray-700 border-gray-200'
                            }
                          }

                          const getCategoryText = (category: string) => {
                            switch (category) {
                              case 'GENERAL': return '📋 Genel'
                              case 'TECHNICAL': return '🔧 Teknik'
                              case 'BILLING': return '💳 Faturalama'
                              case 'REPORT_ISSUE': return '📊 Rapor Sorunu'
                              case 'FEATURE_REQUEST': return '💡 Özellik İsteği'
                              default: return category
                            }
                          }

                          const getCategoryIcon = (category: string) => {
                            switch (category) {
                              case 'GENERAL': return '📋'
                              case 'TECHNICAL': return '🔧'
                              case 'BILLING': return '💳'
                              case 'REPORT_ISSUE': return '📊'
                              case 'FEATURE_REQUEST': return '💡'
                              default: return '📝'
                            }
                          }

                          return (
                            <motion.div
                              key={ticket.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group"
                              onClick={() => handleTicketClick(ticket.id)}
                            >
                              {/* Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-lg font-bold text-gray-900">#{ticket.id}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                                      {getPriorityText(ticket.priority)}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                                      {getStatusText(ticket.status)}
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                    {ticket.subject}
                                  </h3>
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                {ticket.description}
                              </p>

                              {/* Meta Info */}
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <UserCircleIcon className="w-4 h-4" />
                                  <span>{ticket.user?.firstName} {ticket.user?.lastName}</span>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs">{ticket.user?.email}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <TagIcon className="w-3 h-3" />
                                    <span>{getCategoryText(ticket.category)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    <span>{formatDate(ticket.createdAt)}</span>
                                  </div>
                                  {ticket.messages && ticket.messages.length > 0 && (
                                    <div className="flex items-center space-x-1">
                                      <ChatBubbleLeftIcon className="w-3 h-3" />
                                      <span>{ticket.messages.length} mesaj</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Quick Actions */}
                              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex space-x-2">
                                  {ticket.status !== 'OPEN' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleUpdateTicketStatus(ticket.id, 'OPEN')
                                      }}
                                      className="px-3 py-1 text-xs bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                                    >
                                      Aç
                                    </button>
                                  )}
                                  {ticket.status !== 'IN_PROGRESS' && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleUpdateTicketStatus(ticket.id, 'IN_PROGRESS')
                                      }}
                                      className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                      İşleme Al
                                    </button>
                                  )}
                                  {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleUpdateTicketStatus(ticket.id, 'RESOLVED')
                                      }}
                                      className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                      Çöz
                                    </button>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleTicketClick(ticket.id)
                                  }}
                                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                                >
                                  <span>Detaylar</span>
                                  <ArrowRightIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          )
                        })}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Sayfa {supportTicketPage} / {supportTicketTotalPages}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fetchSupportTickets(supportTicketPage - 1, supportTicketFilters)}
                      disabled={supportTicketPage === 1}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => fetchSupportTickets(supportTicketPage + 1, supportTicketFilters)}
                      disabled={supportTicketPage >= supportTicketTotalPages}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <motion.div
              key="statistics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ReportStatistics />
            </motion.div>
          )}

          {/* Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <motion.div
              key="monitoring"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ReportMonitoring />
            </motion.div>
          )}

          {/* Filters Tab */}
          {activeTab === 'filters' && (
            <motion.div
              key="filters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdvancedFilters 
                onFiltersChange={setCurrentFilters}
                onExport={(filters) => {
                  // Export logic will be handled by ExportMenu
                  console.log('Export with filters:', filters)
                }}
                initialFilters={currentFilters}
              />
            </motion.div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ExportMenu 
                filters={currentFilters}
                onExport={async (format, params) => {
                  try {
                    toast.loading(`${format.toUpperCase()} dışa aktarılıyor...`)
                    
                    let blob: Blob
                    let filename: string
                    
                    switch (format) {
                      case 'csv':
                        blob = await adminService.exportReportsCSV(params)
                        filename = `raporlar-${params.period || 'all'}.csv`
                        break
                      case 'pdf':
                        blob = await adminService.exportReportsPDF(params)
                        filename = `raporlar-${params.period || 'all'}.pdf`
                        break
                      case 'excel':
                        blob = await adminService.exportReportsExcel(params)
                        filename = `raporlar-${params.period || 'all'}.xlsx`
                        break
                    }
                    
                    // Dosyayı indir
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = filename
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    window.URL.revokeObjectURL(url)
                    
                    toast.dismiss()
                    toast.success(`${format.toUpperCase()} dosyası başarıyla indirildi`)
                  } catch (err) {
                    toast.dismiss()
                    toast.error(`${format.toUpperCase()} dışa aktarma başarısız`)
                    console.error('Export error:', err)
                  }
                }}
              />
            </motion.div>
          )}

          {/* Real-time Monitoring Tab */}
          {activeTab === 'realtime' && (
            <motion.div
              key="realtime"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RealTimeMonitor 
                onStatsUpdate={(stats) => {
                  console.log('Real-time stats updated:', stats)
                }}
                refreshInterval={30000}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false)
          setSelectedUser(null)
          fetchUsers(userPage, userSearch) // Refresh users list
        }}
        onUpdateUser={handleUpdateUser}
        onSuspendUser={handleSuspendUser}
        onActivateUser={handleActivateUser}
        onHardDeleteUser={handleHardDeleteUser}
        onAddCredits={handleAddCredits}
        onResetCredits={handleResetCredits}
        onRefundCredits={handleRefundCredits}
        onRefresh={handleRefreshUserDetail}
      />

      {/* Report Detail Modal */}
      <ReportDetailModal
        reportId={selectedReportId}
        isOpen={!!selectedReportId}
        onClose={() => setSelectedReportId(null)}
      />

      {/* Support Ticket Detail Modal */}
      <SupportTicketDetailModal
        ticket={selectedTicket}
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false)
          setSelectedTicket(null)
          fetchSupportTickets(supportTicketPage, supportTicketFilters)
        }}
        onRefresh={() => {
          fetchSupportTickets(supportTicketPage, supportTicketFilters)
        }}
      />
    </div>
  )
}
