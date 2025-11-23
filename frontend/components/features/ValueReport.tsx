/**
 * Value Report Component
 * 
 * Değer tahmini raporu için özel render component'i
 * Backend ValueEstimationService'den gelen veriyi güzel bir şekilde gösterir
 */

import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { ValueEstimationResult, RiskLevel } from '@/types'

interface ValueReportProps {
  data: ValueEstimationResult
  vehicleInfo: {
    plate: string
    brand: string
    model: string
    year: number
  }
  vehicleImages?: Array<{ imageUrl: string; id?: number }>
  showActions?: boolean
}

export function ValueReport({ data, vehicleInfo, vehicleImages = [], showActions = false }: ValueReportProps) {
  // Veri kontrolü - AI analiz verisi eksikse hata göster
  if (!data || !data.estimatedValue || !data.marketAnalysis || !data.vehicleCondition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg border-2 border-red-200 p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              AI Analiz Verisi Alınamadı
            </h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
              <p className="text-gray-800 font-medium mb-2">
                ⚠️ AI Servisinden Veri Alınamadı
              </p>
              <p className="text-gray-600 text-sm">
                Değer tahmini verileri eksik veya AI servisinden veri alınamadı. Bu durum genellikle geçici bir sorundur.
              </p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 text-left">
              <p className="text-green-800 font-medium mb-2">
                ✅ Krediniz Otomatik İade Edildi
              </p>
              <p className="text-green-700 text-sm">
                Analiz başarısız olduğu için kullandığınız kredi otomatik olarak hesabınıza iade edilmiştir.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Tekrar Dene
              </button>
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Dashboard&apos;a Dön
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getRiskColor = (risk: RiskLevel | 'unknown') => {
  const getRiskColor = (risk: RiskLevel | 'unknown') => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskDescription = (risk: RiskLevel | 'unknown') => {
    switch (risk) {
      case 'low': return 'Düşük Risk'
      case 'medium': return 'Orta Risk'
      case 'high': return 'Yüksek Risk'
      default: return 'Bilinmiyor'
    }
  }

  return (
    <div className="space-y-8">
      {/* Yüklenen Fotoğraflar - En Üstte */}
      {vehicleImages && vehicleImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <EyeIcon className="w-6 h-6 text-blue-500 mr-2" />
            Yüklenen Fotoğraflar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleImages.map((img, index) => (
              <div key={img.id || index} className="relative group">
                <img
                  src={img.imageUrl}
                  alt={`Araç fotoğrafı ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Genel Değerlendirme */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 text-green-500 mr-2" />
          Genel Değerlendirme
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {data.estimatedValue.toLocaleString()}₺
            </div>
            <div className="text-sm text-gray-500">Tahmini Değer</div>
            <div className="text-xs text-gray-400 mt-1">
              Güven: %{data.confidence}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {data.marketAnalysis.priceRange.min.toLocaleString()}₺ - {data.marketAnalysis.priceRange.max.toLocaleString()}₺
            </div>
            <div className="text-sm text-gray-500">Piyasa Aralığı</div>
            <div className="text-xs text-gray-400 mt-1">
              Ortalama: {data.marketAnalysis.priceRange.average.toLocaleString()}₺
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${getRiskColor((data.investmentAnalysis?.riskLevel || 'unknown') as any).split(' ')[0]}`}>
              {getRiskDescription((data.investmentAnalysis?.riskLevel || 'unknown') as any)}
            </div>
            <div className="text-sm text-gray-500">Yatırım Riski</div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRiskColor((data.investmentAnalysis?.riskLevel || 'unknown') as any)}`}>
              {data.investmentAnalysis?.riskLevel || 'Bilinmiyor'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pazar Analizi */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <ArrowTrendingUpIcon className="w-6 h-6 text-blue-500 mr-2" />
          Pazar Analizi
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Pazar Durumu</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Güncel Pazar Değeri:</span>
                <span className="font-medium">{data.marketAnalysis.currentMarketValue.toLocaleString()}₺</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pazar Trendi:</span>
                <span className="font-medium">{data.marketAnalysis.marketTrend}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Talep Seviyesi:</span>
                <span className="font-medium">{data.marketAnalysis.demandLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Arz Seviyesi:</span>
                <span className="font-medium">{data.marketAnalysis.supplyLevel}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Pazar Faktörleri</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Bölgesel Fark:</span>
                <span className="font-medium">{data.marketAnalysis.regionalVariation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mevsimsel Etki:</span>
                <span className="font-medium">{data.marketAnalysis.seasonalImpact}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Pazar İçgörüleri</h5>
              <ul className="space-y-1">
                {data.marketAnalysis.marketInsights.map((insight, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Araç Durumu */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <EyeIcon className="w-6 h-6 text-purple-500 mr-2" />
          Araç Durumu
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Durum Değerlendirmesi</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Genel Durum:</span>
                <span className="font-medium">{data.vehicleCondition.overallCondition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Durum Skoru:</span>
                <span className="font-medium">{data.vehicleCondition.conditionScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kilometre Etkisi:</span>
                <span className="font-medium">{data.vehicleCondition.mileageImpact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Yaş Etkisi:</span>
                <span className="font-medium">{data.vehicleCondition.ageImpact}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Geçmiş Bilgileri</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Kaza Geçmişi:</span>
                <span className="font-medium">{data.vehicleCondition.accidentHistory ? 'Var' : 'Yok'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sahiplik Geçmişi:</span>
                <span className="font-medium">{data.vehicleCondition.ownershipHistory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Servis Kayıtları:</span>
                <span className="font-medium">{data.vehicleCondition.serviceRecords ? 'Mevcut' : 'Yok'}</span>
              </div>
            </div>
            
            {data.vehicleCondition.modifications && data.vehicleCondition.modifications.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Modifikasyonlar</h5>
                <ul className="space-y-1">
                  {data.vehicleCondition.modifications.map((mod, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2" />
                      {mod}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Fiyat Kırılımı */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <CurrencyDollarIcon className="w-6 h-6 text-green-500 mr-2" />
          Fiyat Kırılımı
        </h3>
        
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Temel Değer:</span>
                <span className="font-medium">{data.priceBreakdown.baseValue.toLocaleString()}₺</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kilometre Ayarlaması:</span>
                <span className={`font-medium ${data.priceBreakdown.mileageAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.priceBreakdown.mileageAdjustment >= 0 ? '+' : ''}{data.priceBreakdown.mileageAdjustment.toLocaleString()}₺
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Durum Ayarlaması:</span>
                <span className={`font-medium ${data.priceBreakdown.conditionAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.priceBreakdown.conditionAdjustment >= 0 ? '+' : ''}{data.priceBreakdown.conditionAdjustment.toLocaleString()}₺
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Özellik Ayarlaması:</span>
                <span className={`font-medium ${data.priceBreakdown.featuresAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.priceBreakdown.featuresAdjustment >= 0 ? '+' : ''}{data.priceBreakdown.featuresAdjustment.toLocaleString()}₺
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Pazar Ayarlaması:</span>
                <span className={`font-medium ${data.priceBreakdown.marketAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.priceBreakdown.marketAdjustment >= 0 ? '+' : ''}{data.priceBreakdown.marketAdjustment.toLocaleString()}₺
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bölgesel Ayarlama:</span>
                <span className={`font-medium ${data.priceBreakdown.regionalAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.priceBreakdown.regionalAdjustment >= 0 ? '+' : ''}{data.priceBreakdown.regionalAdjustment.toLocaleString()}₺
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mevsimsel Ayarlama:</span>
                <span className={`font-medium ${data.priceBreakdown.seasonalAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.priceBreakdown.seasonalAdjustment >= 0 ? '+' : ''}{data.priceBreakdown.seasonalAdjustment.toLocaleString()}₺
                </span>
              </div>
              
              {/* Hasar Maliyetleri */}
              {data.priceBreakdown.damageRepairCost && (
                <div className="flex justify-between">
                  <span className="text-gray-500">⚠️ Hasar Tamir Maliyeti:</span>
                  <span className="font-medium text-red-600">
                    -{Math.abs(data.priceBreakdown.damageRepairCost).toLocaleString()}₺
                  </span>
                </div>
              )}
              
              {data.priceBreakdown.damageHistoryPenalty && (
                <div className="flex justify-between">
                  <span className="text-gray-500">⚠️ Hasar Geçmişi Cezası:</span>
                  <span className="font-medium text-red-600">
                    -{Math.abs(data.priceBreakdown.damageHistoryPenalty).toLocaleString()}₺
                  </span>
                </div>
              )}
              
              {data.priceBreakdown.structuralDamagePenalty && (
                <div className="flex justify-between">
                  <span className="text-gray-500">🚨 Yapısal Hasar Cezası:</span>
                  <span className="font-medium text-red-600">
                    -{Math.abs(data.priceBreakdown.structuralDamagePenalty).toLocaleString()}₺
                  </span>
                </div>
              )}
              
              {data.priceBreakdown.safetyRiskPenalty && (
                <div className="flex justify-between">
                  <span className="text-gray-500">🚨 Güvenlik Riski Cezası:</span>
                  <span className="font-medium text-red-600">
                    -{Math.abs(data.priceBreakdown.safetyRiskPenalty).toLocaleString()}₺
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex items-center justify-between py-2 font-semibold">
              <span className="text-lg text-gray-900">Final Değer</span>
              <span className="text-xl text-green-600">{data.priceBreakdown.finalValue.toLocaleString()}₺</span>
            </div>
          </div>
          
          {/* Detaylı Fiyat Kırılımı */}
          {data.priceBreakdown.breakdown && data.priceBreakdown.breakdown.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-3">Detaylı Fiyat Kırılımı</h4>
              <div className="space-y-2">
                {data.priceBreakdown.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.factor}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                    <div className={`font-semibold ${item.impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.impact >= 0 ? '+' : ''}{item.impact.toLocaleString()}₺
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pazar Konumu */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <ArrowTrendingUpIcon className="w-6 h-6 text-indigo-500 mr-2" />
          Pazar Konumu
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Konum Analizi</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Yüzdelik Dilim:</span>
                <span className="font-medium">{data.marketPosition.percentile}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rekabetçi Konum:</span>
                <span className="font-medium">{data.marketPosition.competitivePosition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fiyatlandırma Stratejisi:</span>
                <span className="font-medium">{data.marketPosition.pricingStrategy}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Hedef Alıcılar</h4>
            <ul className="space-y-1">
              {data.marketPosition.targetBuyers.map((buyer, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2" />
                  {buyer}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-700 mb-2">Pazar Avantajları</h4>
            <ul className="space-y-1">
              {data.marketPosition.marketAdvantages.map((advantage, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {advantage}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-orange-700 mb-2">Pazar Dezavantajları</h4>
            <ul className="space-y-1">
              {data.marketPosition.marketDisadvantages.map((disadvantage, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <ExclamationTriangleIcon className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
                  {disadvantage}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Yatırım Analizi */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="w-6 h-6 text-green-500 mr-2" />
          Yatırım Analizi
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Yatırım Değerlendirmesi</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Yatırım Notu:</span>
                <span className="font-medium">{data.investmentAnalysis?.investmentGrade || 'Bilinmiyor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Değer Artış Potansiyeli:</span>
                <span className="font-medium">{data.investmentAnalysis?.appreciationPotential || 'Bilinmiyor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Değer Kaybı Oranı:</span>
                <span className="font-medium">{data.investmentAnalysis?.depreciationRate || 'Bilinmiyor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Likidite Skoru:</span>
                <span className="font-medium">{data.investmentAnalysis?.liquidityScore || 'Bilinmiyor'}/100</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Yatırım Detayları</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Aylık Maliyet:</span>
                <span className="font-medium">{data.investmentAnalysis?.holdingCostPerMonth || 'Bilinmiyor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Likidite Skoru:</span>
                <span className="font-medium">{data.investmentAnalysis?.liquidityScore || 'Bilinmiyor'}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Yatırım Süresi:</span>
                <span className="font-medium">{data.investmentAnalysis?.investmentHorizon || 'Bilinmiyor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Risk Seviyesi:</span>
                <span className="font-medium">{data.investmentAnalysis?.riskLevel || 'Bilinmiyor'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {data.recommendations?.sellingPrice?.optimal?.toLocaleString() || 'Bilinmiyor'}₺
              </div>
              <div className="text-sm text-gray-500">Önerilen Satış Fiyatı</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {data.recommendations?.buyingPrice?.optimal?.toLocaleString() || 'Bilinmiyor'}₺
              </div>
              <div className="text-sm text-gray-500">Önerilen Alış Fiyatı</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {data.estimatedValue?.toLocaleString() || 'Bilinmiyor'}₺
              </div>
              <div className="text-sm text-gray-500">Tahmini Değer</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Öneriler */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <LightBulbIcon className="w-6 h-6 text-yellow-500 mr-2" />
          Öneriler
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-700 mb-2">Satış Fiyatları</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Minimum:</span>
                <span className="font-medium">{data.recommendations.sellingPrice.min.toLocaleString()}₺</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Optimal:</span>
                <span className="font-medium text-green-600">{data.recommendations.sellingPrice.optimal.toLocaleString()}₺</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Maksimum:</span>
                <span className="font-medium">{data.recommendations.sellingPrice.max.toLocaleString()}₺</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Satın Alma Fiyatları</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Minimum:</span>
                <span className="font-medium">{data.recommendations.buyingPrice.min.toLocaleString()}₺</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Optimal:</span>
                <span className="font-medium text-blue-600">{data.recommendations.buyingPrice.optimal.toLocaleString()}₺</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Maksimum:</span>
                <span className="font-medium">{data.recommendations.buyingPrice.max.toLocaleString()}₺</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Pazarlık İpuçları</h4>
            <ul className="space-y-1">
              {data.recommendations.negotiationTips.map((tip, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <LightBulbIcon className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Zamanlama Tavsiyeleri</h4>
            <ul className="space-y-1">
              {data.recommendations.timingAdvice.map((advice, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  {advice}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {data.recommendations.improvementSuggestions && data.recommendations.improvementSuggestions.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-2">İyileştirme Önerileri</h4>
            <div className="space-y-3">
              {data.recommendations.improvementSuggestions.map((suggestion, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{suggestion.action}</h5>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">+{suggestion.valueIncrease.toLocaleString()}₺</div>
                      <div className="text-xs text-gray-500">Maliyet: {suggestion.cost.toLocaleString()}₺</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{suggestion.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
