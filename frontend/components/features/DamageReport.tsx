/**
 * Damage Report Component - TÜRKÇE FIELD'LAR
 * 
 * Hasar analizi raporu için özel render component'i
 * Backend DamageAnalysisService'den gelen veriyi güzel bir şekilde gösterir
 */

import { motion } from 'framer-motion'
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  WrenchIcon,
  CurrencyDollarIcon,
  ClockIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  EyeIcon,
  ChartBarIcon,
  XMarkIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'
import { DamageAnalysisResult } from '@/types/damageAnalysis'

interface DamageReportProps {
  data: DamageAnalysisResult
  vehicleInfo: {
    plate: string
    brand: string
    model: string
    year: number
  }
  showActions?: boolean
}

export function DamageReport({ data, vehicleInfo, showActions = false }: DamageReportProps) {
  // Veri kontrolü - backend'den gelen veri yapısını kontrol et
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Veri Yüklenemedi</h3>
          <p className="text-gray-500 mb-6">
            Hasar analizi verileri henüz yüklenmedi veya eksik. Lütfen sayfayı yenileyin.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  // Backend'den gelen veri yapısını kontrol et ve debug bilgisi göster
  console.log('🔍 DamageReport Debug - Backend Data:', {
    hasData: !!data,
    dataKeys: data ? Object.keys(data) : [],
    dataStructure: data ? JSON.stringify(data, null, 2).substring(0, 500) + '...' : 'No data',
    hasDetailedAnalysis: !!(data.genelDeğerlendirme || data.hasarAlanları),
    aiProvider: data.aiSağlayıcı || data.model
  });

  // AI'dan gelen detaylı analiz varsa onu kullan, yoksa basit veriyi kullan
  const isDetailedAnalysis = !!(data.genelDeğerlendirme || data.hasarAlanları);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minimal': return 'text-gray-600 bg-gray-100'
      case 'düşük': return 'text-blue-600 bg-blue-100'
      case 'orta': return 'text-yellow-600 bg-yellow-100'
      case 'yüksek': return 'text-orange-600 bg-orange-100'
      case 'kritik': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityDescription = (severity: string) => {
    switch (severity) {
      case 'minimal': return 'Minimal'
      case 'düşük': return 'Düşük'
      case 'orta': return 'Orta'
      case 'yüksek': return 'Yüksek'
      case 'kritik': return 'Kritik'
      default: return 'Bilinmiyor'
    }
  }

  const getDamageLevelColor = (level: string) => {
    switch (level) {
      case 'mükemmel': return 'text-green-600 bg-green-100'
      case 'iyi': return 'text-blue-600 bg-blue-100'
      case 'orta': return 'text-yellow-600 bg-yellow-100'
      case 'kötü': return 'text-orange-600 bg-orange-100'
      case 'kritik': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRoadworthinessColor = (status: string) => {
    switch (status) {
      case 'güvenli': return 'text-green-600 bg-green-100'
      case 'koşullu': return 'text-yellow-600 bg-yellow-100'
      case 'güvensiz': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-8">
      {/* Araç Bilgileri */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-8 h-8 text-blue-600 mr-3" />
          Hasar Analizi Raporu
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Plaka:</span>
            <div className="font-semibold text-gray-900">{vehicleInfo.plate}</div>
          </div>
          <div>
            <span className="text-gray-500">Marka:</span>
            <div className="font-semibold text-gray-900">{vehicleInfo.brand}</div>
          </div>
          <div>
            <span className="text-gray-500">Model:</span>
            <div className="font-semibold text-gray-900">{vehicleInfo.model}</div>
          </div>
          <div>
            <span className="text-gray-500">Yıl:</span>
            <div className="font-semibold text-gray-900">{vehicleInfo.year}</div>
          </div>
        </div>
      </motion.div>

      {/* Genel Değerlendirme */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 text-red-500 mr-2" />
          Genel Değerlendirme
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${getDamageLevelColor(
              isDetailedAnalysis ? data.genelDeğerlendirme?.hasarSeviyesi : (data as any).damageSeverity || 'bilinmiyor'
            ).split(' ')[0]}`}>
              {isDetailedAnalysis ? data.genelDeğerlendirme?.hasarSeviyesi : (data as any).damageSeverity || 'Bilinmiyor'}
            </div>
            <div className="text-sm text-gray-500">Hasar Seviyesi</div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getDamageLevelColor(
              isDetailedAnalysis ? data.genelDeğerlendirme?.hasarSeviyesi : (data as any).damageSeverity || 'bilinmiyor'
            )}`}>
              {isDetailedAnalysis ? data.genelDeğerlendirme?.hasarSeviyesi : (data as any).damageSeverity || 'Bilinmiyor'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {(isDetailedAnalysis ? data.genelDeğerlendirme?.toplamOnarımMaliyeti : (data as any).estimatedRepairCost || 0).toLocaleString()}₺
            </div>
            <div className="text-sm text-gray-500">Toplam Onarım Maliyeti</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {isDetailedAnalysis ? data.genelDeğerlendirme?.satışDeğeri : (data as any).overallScore || 0}/100
            </div>
            <div className="text-sm text-gray-500">{isDetailedAnalysis ? 'Satış Değeri' : 'Genel Puan'}</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {isDetailedAnalysis ? data.hasarAlanları?.length : (data as any).totalDamages || 0}
            </div>
            <div className="text-sm text-gray-500">Toplam Hasar</div>
          </div>
        </div>

        {/* Detaylı Analiz */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Analiz Özeti</h4>
          <p className="text-sm text-gray-600">
            {isDetailedAnalysis ? 
              data.genelDeğerlendirme?.detaylıAnaliz || 'Detaylı analiz bilgisi mevcut değil.' :
              (data as any).summary ?
                `Toplam ${(data as any).summary.totalDamages || 0} hasar tespit edildi. ${(data as any).summary.criticalDamages || 0} kritik hasar bulunuyor. Tahmini onarım maliyeti ${((data as any).summary.estimatedRepairCost || 0).toLocaleString()}₺.` :
                'Detaylı analiz bilgisi mevcut değil.'
            }
          </p>
        </div>

        {/* Güçlü ve Zayıf Yönler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="font-medium text-green-700 mb-2 flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Güçlü Yönler
            </h4>
            <ul className="space-y-1">
              {(isDetailedAnalysis ? data.genelDeğerlendirme?.güçlüYönler : (data as any).summary?.strengths || []).map((item, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-red-700 mb-2 flex items-center">
              <XMarkIcon className="w-5 h-5 mr-2" />
              Zayıf Yönler
            </h4>
            <ul className="space-y-1">
              {(isDetailedAnalysis ? data.genelDeğerlendirme?.zayıfYönler : (data as any).summary?.weaknesses || []).map((item, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <XMarkIcon className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Hasar Alanları */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <EyeIcon className="w-6 h-6 text-blue-500 mr-2" />
          Tespit Edilen Hasar Alanları ({isDetailedAnalysis ? data.hasarAlanları?.length : (data as any).totalDamages || 0})
        </h3>
        
        {(isDetailedAnalysis ? data.hasarAlanları?.length : (data as any).totalDamages || 0) === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Hasar Tespit Edilmedi</h4>
            <p className="text-gray-600">Araçta herhangi bir hasar tespit edilmedi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {isDetailedAnalysis ? (
              // AI'dan gelen detaylı hasar alanları
              data.hasarAlanları?.map((hasar, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{hasar.tür || 'Hasar'}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(hasar.şiddet || 'orta')}`}>
                        {getSeverityDescription(hasar.şiddet || 'orta')}
                      </span>
                      <span className="text-xs text-gray-500">Güven: %{hasar.güven || 0}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{hasar.açıklama || 'Açıklama mevcut değil'}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Bölge:</span>
                      <span className="ml-2 font-medium">{hasar.bölge || 'Bilinmiyor'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Onarım Maliyeti:</span>
                      <span className="ml-2 font-medium text-green-600">{(hasar.onarımMaliyeti || 0).toLocaleString()}₺</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Etkilenen Parçalar:</span>
                      <span className="ml-2 font-medium">{(hasar.etkilenenParçalar || []).join(', ') || 'Bilinmiyor'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Onarım Önceliği:</span>
                      <span className="ml-2 font-medium">{hasar.onarımÖnceliği || 'Normal'}</span>
                    </div>
                  </div>
                  
                  {hasar.onarımYöntemi && (
                    <div className="mt-3 p-2 bg-blue-50 rounded">
                      <span className="text-xs text-blue-700 font-medium">Onarım Yöntemi:</span>
                      <p className="text-xs text-blue-600 mt-1">{hasar.onarımYöntemi}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Basit analiz sonuçları
              ((data as any).analysisResults || []).map((result: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Resim Analizi #{index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(result.damageAreas || []).map((area, areaIndex) => (
                      <div key={areaIndex} className="border border-gray-100 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-800">{area.type || 'Hasar'}</h5>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(area.severity || 'minimal')}`}>
                            {getSeverityDescription(area.severity || 'minimal')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{area.description || 'Açıklama mevcut değil'}</p>
                        <div className="text-xs text-gray-500">
                          Güven: %{area.confidence || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>

      {/* Teknik Analiz */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <WrenchIcon className="w-6 h-6 text-purple-500 mr-2" />
          Teknik Analiz
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Analiz Detayları</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Analiz Metodu</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                  {(data as any).technicalDetails?.analysisMethod || 'AI Analizi'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Model</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                  {(data as any).technicalDetails?.aiModel || 'GPT-4 Vision'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Güven Seviyesi</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium text-purple-600 bg-purple-100">
                  %{(data as any).technicalDetails?.confidence || 95}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">İşlem Süresi</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium text-orange-600 bg-orange-100">
                  {(data as any).technicalDetails?.processingTime || '3-5 saniye'}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Analiz İstatistikleri</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Analiz Edilen Resim</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                  {(data as any).technicalDetails?.imagesAnalyzed || 0} resim
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Resim Kalitesi</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                  {(data as any).technicalDetails?.imageQuality || 'Yüksek'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kritik Hasar</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${(data as any).criticalDamages > 0 ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
                  {(data as any).criticalDamages || 0} adet
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sigorta Etkisi</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
                  {(data as any).summary?.insuranceImpact || 'Değerlendiriliyor'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </motion.div>

      {/* Güvenlik Değerlendirmesi */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="w-6 h-6 text-green-500 mr-2" />
          Güvenlik Değerlendirmesi
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Güvenlik Durumu</h4>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${(data as any).criticalDamages > 0 ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
              {(data as any).criticalDamages > 0 ? 'Dikkat Gerekli' : 'Güvenli'}
            </div>
            
            <h4 className="font-medium text-gray-700 mb-2">Güvenlik Endişeleri</h4>
            <ul className="space-y-1">
              {((data as any).summary?.safetyConcerns || []).map((concern: any, index: number) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  {concern}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Öneriler</h4>
            <ul className="space-y-1">
              {((data as any).summary?.recommendations || []).map((rec: any, index: number) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Piyasa Değeri Etkisi</h4>
              <div className="text-lg font-semibold text-blue-600">
                %{(data as any).summary?.marketValueImpact || 0}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Onarım Tahmini */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <CurrencyDollarIcon className="w-6 h-6 text-green-500 mr-2" />
          Onarım Tahmini
        </h3>
        
        {/* Maliyet Özeti */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {((data as any).estimatedRepairCost || 0).toLocaleString()}₺
            </div>
            <div className="text-sm text-gray-500">Toplam Maliyet</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600 mb-1">
              {(data as any).totalDamages || 0}
            </div>
            <div className="text-sm text-gray-500">Toplam Hasar</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600 mb-1">
              {(data as any).criticalDamages || 0}
            </div>
            <div className="text-sm text-gray-500">Kritik Hasar</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-xl font-bold text-orange-600 mb-1">
              {(data as any).overallScore || 0}/100
            </div>
            <div className="text-sm text-gray-500">Genel Puan</div>
          </div>
        </div>

        {/* Sigorta Durumu */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Sigorta Durumu</h4>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600">Sigorta Etkisi:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${(data as any).summary?.insuranceImpact === 'onarılabilir' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                {(data as any).summary?.insuranceImpact || 'Değerlendiriliyor'}
              </span>
            </div>
            <span className="text-sm text-gray-600">Piyasa Değeri Etkisi: %{(data as any).summary?.marketValueImpact || 0}</span>
          </div>
        </div>
      </motion.div>

      {/* Öneriler */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <LightBulbIcon className="w-6 h-6 text-yellow-500 mr-2" />
          Öneriler
        </h3>
        
        <div className="space-y-4">
          {((data as any).summary?.recommendations || []).map((rec: any, index: number) => (
            <div key={index} className="flex items-start text-sm text-gray-600">
              <LightBulbIcon className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              {rec}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}