'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  BarChart3,
  DollarSign,
  RotateCcw
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { LoadingSpinner } from '@/components/ui'
import adminService from '@/services/adminService'
import toast from 'react-hot-toast'

interface ReportStatisticsData {
  overview: {
    totalReports: number
    completedReports: number
    failedReports: number
    processingReports: number
    overallSuccessRate: number
    totalRefunded: number
  }
  reportStats: Array<{
    reportType: string
    status: string
    _count: number
  }>
  successRates: Array<{
    reportType: string
    total: number
    completed: number
    failed: number
    successRate: number
  }>
  recentTrends: {
    failedLast7Days: number
    failureRateLast7Days: number
  }
}

const COLORS = ['#00C49F', '#FF8042', '#FFBB28', '#0088FE'] // Completed, Failed, Processing, Refunded

const FadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const StatsCard = ({ title, value, icon, description }: {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
)

export default function ReportStatistics() {
  const [stats, setStats] = useState<ReportStatisticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchReportStatistics = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await adminService.getReportStatistics()
      if (response.success) {
        setStats(response.data)
      } else {
        toast.error(response.error || 'Rapor istatistikleri alınamadı.')
      }
    } catch (error) {
      console.error('Rapor istatistikleri çekilirken hata oluştu:', error)
      toast.error('Rapor istatistikleri yüklenirken bir sorun oluştu.')
    } finally {
      setIsRefreshing(false)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReportStatistics()
  }, [fetchReportStatistics])

  const handleRefresh = async () => {
    await fetchReportStatistics()
    toast.success('İstatistikler yenilendi')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Rapor istatistikleri yüklenemedi.</p>
        <Button
          onClick={fetchReportStatistics}
          className="mt-4"
          variant="outline"
        >
          <RefreshCw className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Tekrar Dene
        </Button>
      </div>
    )
  }

  const pieChartData = [
    { name: 'Tamamlandı', value: stats.overview.completedReports, color: COLORS[0] },
    { name: 'Başarısız', value: stats.overview.failedReports, color: COLORS[1] },
    { name: 'İşleniyor', value: stats.overview.processingReports, color: COLORS[2] },
  ]

  const barChartData = stats.successRates.map(item => ({
    name: item.reportType.replace(/_/g, ' '),
    'Başarı Oranı': item.successRate,
    'Tamamlandı': item.completed,
    'Başarısız': item.failed,
  }))

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Rapor İstatistikleri</h2>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
        >
          <RotateCcw className={`-ml-1 mr-2 h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Yenileniyor...' : 'Yenile'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Toplam Rapor"
          value={stats.overview.totalReports}
          icon={<BarChart3 className="h-6 w-6 text-blue-500" />}
          description="Sistemdeki tüm raporlar"
        />
        <StatsCard
          title="Tamamlanan Rapor"
          value={stats.overview.completedReports}
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
          description={`Genel başarı oranı: %${stats.overview.overallSuccessRate}`}
        />
        <StatsCard
          title="Başarısız Rapor"
          value={stats.overview.failedReports}
          icon={<AlertCircle className="h-6 w-6 text-red-500" />}
          description={`Son 7 günde: ${stats.recentTrends.failedLast7Days} başarısız`}
        />
        <StatsCard
          title="İade Edilen Kredi"
          value={`${stats.overview.totalRefunded.toFixed(2)} TL`}
          icon={<DollarSign className="h-6 w-6 text-yellow-500" />}
          description="Başarısız analizler için iade edilen toplam kredi"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rapor Durum Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rapor Türüne Göre Başarı Oranları</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={barChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Başarı Oranı" fill="#82ca9d" />
                <Bar dataKey="Tamamlandı" fill="#8884d8" />
                <Bar dataKey="Başarısız" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detaylı Rapor Durumları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rapor Tipi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sayı
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.reportStats.map((stat, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.reportType.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.status === 'COMPLETED' && <Badge variant="success">Tamamlandı</Badge>}
                      {stat.status === 'FAILED' && <Badge variant="error">Başarısız</Badge>}
                      {stat.status === 'PROCESSING' && <Badge variant="warning">İşleniyor</Badge>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat._count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}