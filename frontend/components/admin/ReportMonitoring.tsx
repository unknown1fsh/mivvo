'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText,
  Eye,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  Search
} from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import adminService from '@/services/adminService'
import toast from 'react-hot-toast'

interface ReportMonitoringData {
  period: string
  dateRange: {
    start: string
    end: string
  }
  summary: {
    totalReports: number
    completedReports: number
    failedReports: number
    processingReports: number
    successRate: number
    avgProcessingTime: number
  }
  reportsByType: Record<string, {
    total: number
    completed: number
    failed: number
    processing: number
    reports: any[]
  }>
  userPerformance: Array<{
    user: {
      id: number
      firstName: string
      lastName: string
      email: string
    }
    total: number
    completed: number
    failed: number
    processing: number
    totalSpent: number
  }>
  failedReportsAnalysis: Array<{
    id: number
    reportType: string
    userId: number
    user: any
    createdAt: string
    expertNotes: string
    totalCost: number
    vehiclePlate: string
  }>
  dailyTrend: Array<{
    date: string
    total: number
    completed: number
    failed: number
    processing: number
  }>
  recentReports: any[]
}

export default function ReportMonitoring() {
  const [data, setData] = useState<ReportMonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedUserId, setSelectedUserId] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchMonitoringData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        period: selectedPeriod,
        ...(selectedType && selectedType !== 'all' && { type: selectedType }),
        ...(selectedUserId && selectedUserId !== 'all' && { userId: selectedUserId })
      }
      
      const response = await adminService.getReportMonitoring(params)
      
      if (response.success) {
        setData(response.data)
      } else {
        throw new Error(response.error || 'İzleme verileri yüklenemedi')
      }
    } catch (err) {
      console.error('Report monitoring error:', err)
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
      toast.error('İzleme verileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod, selectedType, selectedUserId])

  useEffect(() => {
    fetchMonitoringData()
  }, [fetchMonitoringData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchMonitoringData()
    setIsRefreshing(false)
    toast.success('Veriler yenilendi')
  }

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      toast.loading(`${format.toUpperCase()} dışa aktarılıyor...`)
      
      const params = {
        period: selectedPeriod,
        ...(selectedType && selectedType !== 'all' && { type: selectedType }),
        ...(selectedUserId && selectedUserId !== 'all' && { userId: selectedUserId })
      }
      
      let blob: Blob
      let filename: string
      
      switch (format) {
        case 'csv':
          blob = await adminService.exportReportsCSV(params)
          filename = `raporlar-${selectedPeriod}.csv`
          break
        case 'pdf':
          blob = await adminService.exportReportsPDF(params)
          filename = `raporlar-${selectedPeriod}.pdf`
          break
        case 'excel':
          blob = await adminService.exportReportsExcel(params)
          filename = `raporlar-${selectedPeriod}.xlsx`
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
  }

  const getReportTypeName = (type: string) => {
    const names: Record<string, string> = {
      'DAMAGE_ASSESSMENT': 'Hasar Analizi',
      'PAINT_ANALYSIS': 'Boya Analizi',
      'ENGINE_SOUND_ANALYSIS': 'Motor Sesi Analizi',
      'VALUE_ESTIMATION': 'Değer Tahmini',
      'COMPREHENSIVE_EXPERTISE': 'Kapsamlı Ekspertiz',
      'FULL_REPORT': 'Tam Rapor'
    }
    return names[type] || type
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">✅ Tamamlandı</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">❌ Başarısız</Badge>
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-800">⏳ İşleniyor</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">İzleme verileri yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Filtreler ve Aksiyonlar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtreler ve Aksiyonlar</span>
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Yenile
              </Button>
              <Button
                onClick={() => handleExport('csv')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                onClick={() => handleExport('excel')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Zaman Aralığı
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Son 24 Saat</SelectItem>
                  <SelectItem value="7d">Son 7 Gün</SelectItem>
                  <SelectItem value="30d">Son 30 Gün</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Rapor Türü
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Türler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Türler</SelectItem>
                  <SelectItem value="DAMAGE_ASSESSMENT">Hasar Analizi</SelectItem>
                  <SelectItem value="PAINT_ANALYSIS">Boya Analizi</SelectItem>
                  <SelectItem value="ENGINE_SOUND_ANALYSIS">Motor Sesi Analizi</SelectItem>
                  <SelectItem value="VALUE_ESTIMATION">Değer Tahmini</SelectItem>
                  <SelectItem value="COMPREHENSIVE_EXPERTISE">Kapsamlı Ekspertiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Kullanıcı
              </label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Kullanıcılar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                  {data.userPerformance.map((user) => (
                    <SelectItem key={user.user.id} value={user.user.id.toString()}>
                      {user.user.firstName} {user.user.lastName} ({user.user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Rapor</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              {data.dateRange.start.split('T')[0]} - {data.dateRange.end.split('T')[0]}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarılı</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.summary.completedReports}</div>
            <p className="text-xs text-muted-foreground">
              %{data.summary.successRate} başarı oranı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarısız</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.summary.failedReports}</div>
            <p className="text-xs text-muted-foreground">
              İnceleme gereken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ort. Süre</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.summary.avgProcessingTime}</div>
            <p className="text-xs text-muted-foreground">
              dakika
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rapor Türü Analizi */}
      <Card>
        <CardHeader>
          <CardTitle>Rapor Türü Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.reportsByType).map(([type, stats]) => (
              <div key={type} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{getReportTypeName(type)}</h3>
                  <Badge variant="outline">{stats.total} toplam</Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-green-600 font-semibold">{stats.completed}</div>
                    <div className="text-muted-foreground">Başarılı</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-semibold">{stats.failed}</div>
                    <div className="text-muted-foreground">Başarısız</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600 font-semibold">{stats.processing}</div>
                    <div className="text-muted-foreground">İşleniyor</div>
                  </div>
                </div>
                
                {stats.total > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Başarı Oranı: %{Math.round((stats.completed / stats.total) * 100)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Başarısız Raporlar Analizi */}
      {data.failedReportsAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span>Başarısız Raporlar Analizi</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.failedReportsAnalysis.slice(0, 10).map((report) => (
                <div key={report.id} className="border rounded-lg p-3 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">
                        #{report.id} - {getReportTypeName(report.reportType)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {report.user.firstName} {report.user.lastName} • {report.vehiclePlate}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(report.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-red-100 text-red-800">
                        {report.totalCost} TL
                      </Badge>
                    </div>
                  </div>
                  {report.expertNotes && (
                    <div className="mt-2 text-sm text-red-700">
                      <strong>Hata:</strong> {report.expertNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Son Raporlar */}
      <Card>
        <CardHeader>
          <CardTitle>Son Raporlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      #{report.id} - {getReportTypeName(report.reportType)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {report.user.firstName} {report.user.lastName} • {report.vehiclePlate}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(report.status)}
                    <Badge variant="outline">
                      {report.totalCost} TL
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
