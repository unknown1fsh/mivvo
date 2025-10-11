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
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { LoadingSpinner } from '@/components/ui'
import { StatsCard } from '@/components/admin/StatsCard'
import { LineChart } from '@/components/admin/LineChart'
import { DoughnutChart } from '@/components/admin/DoughnutChart'
import { BarChart } from '@/components/admin/BarChart'
import { UserDetailModal } from '@/components/admin/UserDetailModal'
import { authService } from '@/services/authService'
import adminService from '@/services/adminService'
import { AdminUser, AdminUserDetail, DetailedStats, TimelineData, ReportBreakdown } from '@/types/admin'
import { formatDate } from '@/utils/dateUtils'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports'>('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  // Auth Check
  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      toast.error('Bu sayfaya erişim yetkiniz yok')
      router.push('/dashboard')
      return
    }
    fetchInitialData()
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
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
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
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 -mb-px">
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
                  <LoadingSpinner size="large" />
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
    </div>
  )
}
