'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Filter, 
  Calendar, 
  Search, 
  DollarSign, 
  Users, 
  FileText,
  X,
  RotateCcw,
  Save,
  Download
} from 'lucide-react'
import adminService from '@/services/adminService'
import toast from 'react-hot-toast'

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  onExport: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

interface FilterState {
  period: string
  reportType: string
  status: string
  userId: string
  dateFrom: string
  dateTo: string
  minCost: string
  maxCost: string
  searchTerm: string
}

const defaultFilters: FilterState = {
  period: '7d',
  reportType: 'all',
  status: 'all',
  userId: 'all',
  dateFrom: '',
  dateTo: '',
  minCost: '',
  maxCost: '',
  searchTerm: ''
}

const reportTypes = [
  { value: 'all', label: 'Tüm Türler' },
  { value: 'DAMAGE_ASSESSMENT', label: 'Hasar Analizi' },
  { value: 'PAINT_ANALYSIS', label: 'Boya Analizi' },
  { value: 'ENGINE_SOUND_ANALYSIS', label: 'Motor Sesi Analizi' },
  { value: 'VALUE_ESTIMATION', label: 'Değer Tahmini' },
  { value: 'COMPREHENSIVE_EXPERTISE', label: 'Kapsamlı Ekspertiz' },
  { value: 'FULL_REPORT', label: 'Tam Rapor' }
]

const statusOptions = [
  { value: 'all', label: 'Tüm Durumlar' },
  { value: 'COMPLETED', label: 'Tamamlandı' },
  { value: 'FAILED', label: 'Başarısız' },
  { value: 'PROCESSING', label: 'İşleniyor' },
  { value: 'PENDING', label: 'Bekliyor' }
]

const periodOptions = [
  { value: '24h', label: 'Son 24 Saat' },
  { value: '7d', label: 'Son 7 Gün' },
  { value: '30d', label: 'Son 30 Gün' },
  { value: '90d', label: 'Son 3 Ay' },
  { value: '1y', label: 'Son 1 Yıl' },
  { value: 'custom', label: 'Özel Tarih Aralığı' }
]

export default function AdvancedFilters({ 
  onFiltersChange, 
  onExport, 
  initialFilters = {} 
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters
  })
  const [users, setUsers] = useState<Array<{ id: number; name: string; email: string }>>([])
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; filters: FilterState }>>([])

  // Kullanıcıları yükle
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminService.getAllUsers({ limit: 100 })
        if (response.success) {
          setUsers(response.data.users.map((user: any) => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email
          })))
        }
      } catch (error) {
        console.error('Users fetch error:', error)
      }
    }
    
    fetchUsers()
  }, [])

  // Filtreleri güncelle
  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // "all" değerleri boş string olarak gönder
    const filtersToSend = { ...newFilters }
    if (value === 'all') {
      filtersToSend[key] = ''
    }
    
    onFiltersChange(filtersToSend)
  }

  // Filtreleri sıfırla
  const resetFilters = () => {
    setFilters(defaultFilters)
    setIsCustomDateRange(false)
    
    // "all" değerleri boş string olarak gönder
    const filtersToSend = { ...defaultFilters }
    Object.keys(filtersToSend).forEach(key => {
      if (filtersToSend[key as keyof FilterState] === 'all') {
        filtersToSend[key as keyof FilterState] = ''
      }
    })
    
    onFiltersChange(filtersToSend)
    toast.success('Filtreler sıfırlandı')
  }

  // Filtreleri kaydet
  const saveFilters = () => {
    const filterName = prompt('Filtre adı girin:')
    if (filterName) {
      const newSavedFilter = { name: filterName, filters: { ...filters } }
      setSavedFilters(prev => [...prev, newSavedFilter])
      toast.success('Filtreler kaydedildi')
    }
  }

  // Kaydedilmiş filtreyi yükle
  const loadSavedFilter = (savedFilter: { name: string; filters: FilterState }) => {
    setFilters(savedFilter.filters)
    setIsCustomDateRange(savedFilter.filters.period === 'custom')
    
    // "all" değerleri boş string olarak gönder
    const filtersToSend = { ...savedFilter.filters }
    Object.keys(filtersToSend).forEach(key => {
      if (filtersToSend[key as keyof FilterState] === 'all') {
        filtersToSend[key as keyof FilterState] = ''
      }
    })
    
    onFiltersChange(filtersToSend)
    toast.success(`"${savedFilter.name}" filtresi yüklendi`)
  }

  // Aktif filtre sayısını hesapla
  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      return value !== '' && value !== 'all' && value !== defaultFilters[key as keyof FilterState]
    }).length
  }

  // Filtre özetini oluştur
  const getFilterSummary = () => {
    const parts = []
    if (filters.period && filters.period !== '7d') parts.push(`Son ${filters.period}`)
    if (filters.reportType && filters.reportType !== 'all') parts.push(reportTypes.find(t => t.value === filters.reportType)?.label)
    if (filters.status && filters.status !== 'all') parts.push(statusOptions.find(s => s.value === filters.status)?.label)
    if (filters.userId && filters.userId !== 'all') parts.push(`Kullanıcı #${filters.userId}`)
    if (filters.minCost || filters.maxCost) parts.push('Fiyat filtresi')
    if (filters.searchTerm) parts.push('Arama')
    
    return parts.length > 0 ? parts.join(', ') : 'Filtre yok'
  }

  return (
    <div className="space-y-6">
      {/* Ana Filtreler */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Gelişmiş Filtreler
              {getActiveFilterCount() > 0 && (
                <Badge variant="success" className="ml-2">
                  {getActiveFilterCount()} aktif
                </Badge>
              )}
            </CardTitle>
            <div className="flex space-x-2">
              <Button onClick={saveFilters} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-1" />
                Kaydet
              </Button>
              <Button onClick={resetFilters} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-1" />
                Sıfırla
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtre Özeti */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Aktif Filtreler:</strong> {getFilterSummary()}
            </div>
          </div>

          {/* Filtre Formu */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Zaman Aralığı */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Zaman Aralığı
              </label>
              <Select 
                value={filters.period} 
                onValueChange={(value) => {
                  updateFilter('period', value)
                  setIsCustomDateRange(value === 'custom')
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rapor Türü */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Rapor Türü
              </label>
              <Select 
                value={filters.reportType} 
                onValueChange={(value) => updateFilter('reportType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Türler" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Durum */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                Durum
              </label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Durumlar" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kullanıcı */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Kullanıcı
              </label>
              <Select 
                value={filters.userId} 
                onValueChange={(value) => updateFilter('userId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Kullanıcılar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Minimum Fiyat */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Min. Fiyat (TL)
              </label>
              <input
                type="number"
                value={filters.minCost}
                onChange={(e) => updateFilter('minCost', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Maksimum Fiyat */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Max. Fiyat (TL)
              </label>
              <input
                type="number"
                value={filters.maxCost}
                onChange={(e) => updateFilter('maxCost', e.target.value)}
                placeholder="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Özel Tarih Aralığı */}
          {isCustomDateRange && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Arama */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2 flex items-center">
              <Search className="h-4 w-4 mr-1" />
              Arama Terimi
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              placeholder="Plaka, kullanıcı adı veya rapor içeriği ara..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Kaydedilmiş Filtreler */}
      {savedFilters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kaydedilmiş Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedFilters.map((savedFilter, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => loadSavedFilter(savedFilter)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{savedFilter.name}</h4>
                      <p className="text-xs text-gray-500">
                        {Object.values(savedFilter.filters).filter(v => v !== '').length} filtre
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSavedFilters(prev => prev.filter((_, i) => i !== index))
                        toast.success('Filtre silindi')
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hızlı Aksiyonlar */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı Aksiyonlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => onExport(filters)}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Filtrelenmiş Verileri Dışa Aktar
            </Button>
            <Button
              onClick={() => {
                updateFilter('status', 'FAILED')
                toast.success('Başarısız raporlar filtrelendi')
              }}
              variant="outline"
            >
              Sadece Başarısız Raporlar
            </Button>
            <Button
              onClick={() => {
                updateFilter('status', 'COMPLETED')
                toast.success('Tamamlanan raporlar filtrelendi')
              }}
              variant="outline"
            >
              Sadece Tamamlanan Raporlar
            </Button>
            <Button
              onClick={() => {
                updateFilter('period', '24h')
                toast.success('Son 24 saat filtrelendi')
              }}
              variant="outline"
            >
              Son 24 Saat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
