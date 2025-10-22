'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileImage,
  Calendar,
  Filter,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import adminService from '@/services/adminService'
import toast from 'react-hot-toast'

interface ExportMenuProps {
  filters: {
    period?: string
    type?: string
    userId?: string
    status?: string
    dateFrom?: string
    dateTo?: string
  }
  onExport: (format: 'csv' | 'pdf' | 'excel', params: any) => Promise<void>
}

interface ExportOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  format: 'csv' | 'pdf' | 'excel'
  recommended?: boolean
}

const exportOptions: ExportOption[] = [
  {
    id: 'csv',
    name: 'CSV Format',
    description: 'Excel ile açılabilir, veri analizi için ideal',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    format: 'csv',
    recommended: true
  },
  {
    id: 'pdf',
    name: 'PDF Rapor',
    description: 'Yazdırılabilir, resmi raporlar için uygun',
    icon: <FileText className="h-5 w-5" />,
    format: 'pdf'
  },
  {
    id: 'excel',
    name: 'Excel Dosyası',
    description: 'Gelişmiş analiz ve grafiklerle birlikte',
    icon: <FileImage className="h-5 w-5" />,
    format: 'excel'
  }
]

export default function ExportMenu({ filters, onExport }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const [exportHistory, setExportHistory] = useState<Array<{
    id: string
    format: string
    timestamp: string
    status: 'success' | 'error'
    filename: string
  }>>([])

  const handleExport = async (option: ExportOption) => {
    try {
      setIsExporting(option.id)
      
      // Filtreleri temizle ve hazırla
      const exportParams = {
        ...filters,
        timestamp: new Date().toISOString(),
        format: option.format
      }

      await onExport(option.format, exportParams)
      
      // Başarılı export'u geçmişe ekle
      setExportHistory(prev => [{
        id: Date.now().toString(),
        format: option.format.toUpperCase(),
        timestamp: new Date().toLocaleString('tr-TR'),
        status: 'success',
        filename: `raporlar-${filters.period || 'all'}-${new Date().toISOString().split('T')[0]}.${option.format === 'excel' ? 'xlsx' : option.format}`
      }, ...prev.slice(0, 4)]) // Son 5 export'u tut
      
    } catch (error) {
      console.error('Export error:', error)
      
      // Hatalı export'u geçmişe ekle
      setExportHistory(prev => [{
        id: Date.now().toString(),
        format: option.format.toUpperCase(),
        timestamp: new Date().toLocaleString('tr-TR'),
        status: 'error',
        filename: 'Export başarısız'
      }, ...prev.slice(0, 4)])
      
    } finally {
      setIsExporting(null)
    }
  }

  const getFilterSummary = () => {
    const parts = []
    if (filters.period) parts.push(`Son ${filters.period}`)
    if (filters.type) parts.push(filters.type.replace(/_/g, ' '))
    if (filters.status) parts.push(filters.status)
    if (filters.userId) parts.push(`Kullanıcı #${filters.userId}`)
    
    return parts.length > 0 ? parts.join(', ') : 'Tüm veriler'
  }

  return (
    <div className="space-y-6">
      {/* Export Seçenekleri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Dışa Aktarma Seçenekleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center text-sm text-blue-800">
              <Filter className="h-4 w-4 mr-2" />
              <span className="font-medium">Aktif Filtreler:</span>
              <span className="ml-2">{getFilterSummary()}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exportOptions.map((option) => (
              <div
                key={option.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  option.recommended ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {option.icon}
                    <h3 className="font-medium ml-2">{option.name}</h3>
                  </div>
                  {option.recommended && (
                    <Badge variant="success" className="text-xs">
                      Önerilen
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                
                <Button
                  onClick={() => handleExport(option)}
                  disabled={isExporting === option.id}
                  className="w-full"
                  variant={option.recommended ? "primary" : "outline"}
                >
                  {isExporting === option.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Dışa Aktarılıyor...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      {option.format.toUpperCase()} İndir
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Geçmişi */}
      {exportHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Son Dışa Aktarmalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exportHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    {item.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <div>
                      <div className="text-sm font-medium">
                        {item.filename}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.timestamp} • {item.format}
                      </div>
                    </div>
                  </div>
                  <Badge variant={item.status === 'success' ? 'success' : 'error'}>
                    {item.status === 'success' ? 'Başarılı' : 'Hatalı'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export İpuçları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Export İpuçları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">CSV Format</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Excel ile açılabilir</li>
                <li>• Veri analizi için ideal</li>
                <li>• Hızlı indirme</li>
                <li>• Küçük dosya boyutu</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">PDF Rapor</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Yazdırılabilir format</li>
                <li>• Resmi raporlar için</li>
                <li>• Grafikler dahil</li>
                <li>• Profesyonel görünüm</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
