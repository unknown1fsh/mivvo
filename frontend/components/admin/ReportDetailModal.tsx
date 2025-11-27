'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  User, 
  Car, 
  Calendar, 
  DollarSign, 
  FileText, 
  Image, 
  Volume2,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { RefundReportPayload } from '@/types/admin'
import adminService from '@/services/adminService'
import toast from 'react-hot-toast'

interface ReportDetailModalProps {
  reportId: number | null
  isOpen: boolean
  onClose: () => void
}

interface ReportDetail {
  id: number
  reportType: string
  status: string
  vehiclePlate: string
  vehicleBrand: string
  vehicleModel: string
  vehicleYear: number
  totalCost: number
  createdAt: string
  completedAt?: string
  expertNotes?: string
  user: {
    id: number
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  vehicleImages: Array<{
    id: number
    imageUrl: string
    uploadDate: string
  }>
  vehicleAudios: Array<{
    id: number
    audioPath: string
    uploadDate: string
  }>
  failedReason?: string
  refundStatus?: string
}

export default function ReportDetailModal({ reportId, isOpen, onClose }: ReportDetailModalProps) {
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [isRefunding, setIsRefunding] = useState(false)

  const fetchReportDetail = async () => {
    if (!reportId) return

    try {
      setLoading(true)
      const response = await adminService.getReportDetail(reportId)
      
      if (response.success) {
        setReport(response.data)
      } else {
        toast.error('Rapor detayları yüklenemedi')
      }
    } catch (error) {
      console.error('Report detail error:', error)
      toast.error('Rapor detayları yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleManualRefund = async () => {
    if (!report) return

    try {
      setIsRefunding(true)
      const payload: RefundReportPayload = { reason: 'Admin manuel iade' }
      await adminService.refundReportCredits(report.id, payload)
      toast.success('Kredi iadesi başarıyla gerçekleştirildi')
      fetchReportDetail()
    } catch (error) {
      console.error('Manual refund error:', error)
      toast.error('Kredi iadesi sırasında hata oluştu')
    } finally {
      setIsRefunding(false)
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
        return <Badge variant="success">✅ Tamamlandı</Badge>
      case 'FAILED':
        return <Badge variant="error">❌ Başarısız</Badge>
      case 'PROCESSING':
        return <Badge variant="warning">⏳ İşleniyor</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const shouldShowManualRefund = report?.status?.toLowerCase?.() === 'failed' && report?.refundStatus !== 'REFUNDED'
  const getRefundStatusLabel = (status?: string) => {
    switch (status) {
      case 'REFUNDED':
        return 'Kredi iadesi tamamlandı'
      case 'FAILED':
        return 'Kredi iadesi başarısız'
      case 'PENDING':
        return 'Kredi iade bekleniyor'
      default:
        return 'Kredi iade durumu kaydedilmedi'
    }
  }

  // Modal açıldığında veriyi çek
  useState(() => {
    if (isOpen && reportId) {
      fetchReportDetail()
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Rapor Detayları</h2>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : report ? (
          <div className="p-6 space-y-6">
            {/* Rapor Özeti */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Rapor Özeti</span>
                  {getStatusBadge(report.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Rapor Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Rapor ID:</span>
                        <span className="font-medium">#{report.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Rapor Türü:</span>
                        <span className="font-medium">{getReportTypeName(report.reportType)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Oluşturulma:</span>
                        <span className="font-medium">{formatDate(report.createdAt)}</span>
                      </div>
                      {report.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tamamlanma:</span>
                          <span className="font-medium">{formatDate(report.completedAt)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Toplam Maliyet:</span>
                        <span className="font-medium text-green-600">{report.totalCost} TL</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Araç Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Plaka:</span>
                        <span className="font-medium">{report.vehiclePlate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Marka:</span>
                        <span className="font-medium">{report.vehicleBrand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Model:</span>
                        <span className="font-medium">{report.vehicleModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Yıl:</span>
                        <span className="font-medium">{report.vehicleYear}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {report.failedReason && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="font-semibold">AI analizi tamamlanamadı</p>
                <p className="mt-1">{report.failedReason}</p>
                <p className="mt-1 text-xs text-red-600">{getRefundStatusLabel(report.refundStatus)}</p>
                {shouldShowManualRefund && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleManualRefund}
                      disabled={isRefunding}
                    >
                      {isRefunding ? 'İade hazırlanıyor...' : 'Kredi iadesi yap'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Kullanıcı Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Kullanıcı Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Ad Soyad</div>
                    <div className="font-medium">{report.user.firstName} {report.user.lastName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Email</div>
                    <div className="font-medium">{report.user.email}</div>
                  </div>
                  {report.user.phone && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Telefon</div>
                      <div className="font-medium">{report.user.phone}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Kullanıcı ID</div>
                    <div className="font-medium">#{report.user.id}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Uzman Notları */}
            {report.expertNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Uzman Notları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{report.expertNotes}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Yüklenen Dosyalar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resimler */}
              {report.vehicleImages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Image className="h-5 w-5 mr-2" />
                      Yüklenen Resimler ({report.vehicleImages.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {report.vehicleImages.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.imageUrl}
                            alt={`Araç resmi ${image.id}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            {formatDate(image.uploadDate)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ses Dosyaları */}
              {report.vehicleAudios.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Volume2 className="h-5 w-5 mr-2" />
                      Yüklenen Ses Dosyaları ({report.vehicleAudios.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {report.vehicleAudios.map((audio) => (
                        <div key={audio.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <Volume2 className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">Ses Dosyası #{audio.id}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(audio.uploadDate)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Rapor detayları yüklenemedi</p>
          </div>
        )}
      </div>
    </div>
  )
}
