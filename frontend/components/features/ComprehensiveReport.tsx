/**
 * Premium Comprehensive Report Component
 * 
 * Kapsamlı ekspertiz raporu için premium render component'i
 * 2025-2026 gerçekçi fiyatlandırma ve detaylı analiz ile
 */

import { motion } from 'framer-motion'
import {
  SparklesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  StarIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  HeartIcon,
  EyeIcon,
  WrenchIcon,
  PaintBrushIcon,
  SpeakerWaveIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon as Clock,
  FireIcon,
  BoltIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import { ComprehensiveExpertiseResult, ExpertiseGrade, ExpertRecommendation, InvestmentDecisionType } from '@/types'

interface ComprehensiveReportProps {
  data: ComprehensiveExpertiseResult
  vehicleInfo: {
    plate: string
    brand: string
    model: string
    year: number
  }
  vehicleImages?: Array<{ imageUrl: string; id?: number }>
  showActions?: boolean
}

export function ComprehensiveReport({ data, vehicleInfo, vehicleImages = [], showActions = false }: ComprehensiveReportProps) {
  // Veri kontrolü - AI analiz verisi eksikse hata göster
  if ((data as any).error || !data || !data.overallScore || !data.expertiseGrade || !data.comprehensiveSummary || !data.expertOpinion) {
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
                Kapsamlı ekspertiz verileri eksik veya AI servisinden veri alınamadı. Bu durum genellikle geçici bir sorundur.
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
  const getGradeColor = (grade: ExpertiseGrade) => {
    switch (grade) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getGradeDescription = (grade: ExpertiseGrade) => {
    switch (grade) {
      case 'excellent': return 'Mükemmel'
      case 'good': return 'İyi'
      case 'fair': return 'Orta'
      case 'poor': return 'Kötü'
      case 'critical': return 'Kritik'
      default: return 'Değerlendiriliyor'
    }
  }

  const getRecommendationColor = (rec: ExpertRecommendation) => {
    switch (rec) {
      case 'strongly_buy': return 'text-green-600 bg-green-100'
      case 'buy': return 'text-blue-600 bg-blue-100'
      case 'neutral': return 'text-gray-600 bg-gray-100'
      case 'avoid': return 'text-orange-600 bg-orange-100'
      case 'strongly_avoid': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRecommendationDescription = (rec: ExpertRecommendation) => {
    switch (rec) {
      case 'strongly_buy': return 'Kesinlikle Al'
      case 'buy': return 'Al'
      case 'neutral': return 'Nötr'
      case 'avoid': return 'Kaçın'
      case 'strongly_avoid': return 'Kesinlikle Kaçın'
      default: return 'Değerlendiriliyor'
    }
  }

  const getInvestmentColor = (decision: InvestmentDecisionType) => {
    switch (decision) {
      case 'excellent_investment': return 'text-green-600 bg-green-100'
      case 'good_investment': return 'text-blue-600 bg-blue-100'
      case 'fair_investment': return 'text-yellow-600 bg-yellow-100'
      case 'poor_investment': return 'text-orange-600 bg-orange-100'
      case 'avoid': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'kritik': return 'bg-red-100 text-red-800'
      case 'yüksek': return 'bg-orange-100 text-orange-800'
      case 'orta': return 'bg-yellow-100 text-yellow-800'
      case 'düşük': return 'bg-green-100 text-green-800'
      case 'önerilen': return 'bg-blue-100 text-blue-800'
      case 'planlama': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
      case 'düşük': return 'bg-green-100 text-green-800'
      case 'medium':
      case 'orta': return 'bg-yellow-100 text-yellow-800'
      case 'high':
      case 'yüksek': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOpportunityColor = (opportunityLevel: string) => {
    switch (opportunityLevel.toLowerCase()) {
      case 'excellent':
      case 'mükemmel': return 'bg-green-100 text-green-800'
      case 'good':
      case 'iyi': return 'bg-blue-100 text-blue-800'
      case 'fair':
      case 'orta': return 'bg-yellow-100 text-yellow-800'
      case 'poor':
      case 'kötü': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInvestmentDescription = (decision: InvestmentDecisionType) => {
    switch (decision) {
      case 'excellent_investment': return 'Mükemmel Yatırım'
      case 'good_investment': return 'İyi Yatırım'
      case 'fair_investment': return 'Orta Yatırım'
      case 'poor_investment': return 'Kötü Yatırım'
      case 'avoid': return 'Kaçınılmalı'
      default: return 'Değerlendiriliyor'
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
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Premium Ekspertiz Raporu</h1>
              <p className="text-white/80 text-lg">AI Destekli Kapsamlı Analiz • 2025-2026 Projeksiyonları</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{vehicleInfo.plate}</div>
            <div className="text-white/80">{vehicleInfo.brand} {vehicleInfo.model} {vehicleInfo.year}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-5xl font-bold mb-2">{data.overallScore > 0 ? data.overallScore : '-'}</div>
            <div className="text-white/80 mb-3">Genel Puan</div>
            {data.overallScore > 0 ? (
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${data.overallScore}%` }}
                />
              </div>
            ) : (
              <div className="text-sm text-white/60 bg-white/10 rounded-full px-3 py-1 inline-block">
                Yetersiz Veri
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">{getGradeDescription(data.expertiseGrade as ExpertiseGrade)}</div>
            <div className="text-white/80 mb-3">Ekspertiz Notu</div>
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
              <StarIcon className="w-4 h-4 mr-2" />
              {getGradeDescription(data.expertiseGrade as ExpertiseGrade)}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">{getRecommendationDescription((data.expertOpinion as any)?.recommendation as ExpertRecommendation)}</div>
            <div className="text-white/80 mb-3">Uzman Önerisi</div>
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
              <HeartIcon className="w-4 h-4 mr-2" />
              {getRecommendationDescription((data.expertOpinion as any)?.recommendation as ExpertRecommendation)}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">{getInvestmentDescription((data.investmentDecision as any)?.decision as InvestmentDecisionType)}</div>
            <div className="text-white/80 mb-3">Yatırım Kararı</div>
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
              <TrendingUpIcon className="w-4 h-4 mr-2" />
              {getInvestmentDescription((data.investmentDecision as any)?.decision as InvestmentDecisionType)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Analiz Özeti */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
            <EyeIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">AI Destekli Analiz Özeti</h3>
            <p className="text-gray-600">2025 Piyasa Verileri ile Kapsamlı Değerlendirme</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Güçlü Yönler
              </h4>
              <div className="space-y-3">
                {(data.comprehensiveSummary as any)?.strengths?.map((strength: string, index: number) => (
                  <div key={index} className="flex items-start text-sm text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                    <span>{strength}</span>
                  </div>
                )) || <div className="text-sm text-gray-500">Değerlendiriliyor...</div>}
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
              <h4 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                Dikkat Edilmesi Gerekenler
              </h4>
              <div className="space-y-3">
                {(data.comprehensiveSummary as any)?.weaknesses?.map((weakness: string, index: number) => (
                  <div key={index} className="flex items-start text-sm text-orange-700">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                    <span>{weakness}</span>
                  </div>
                )) || <div className="text-sm text-gray-500">Değerlendiriliyor...</div>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Genel Durum
              </h4>
              <p className="text-blue-700 text-sm leading-relaxed">{(data.comprehensiveSummary as any)?.overallCondition || 'Değerlendiriliyor...'}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2" />
                Pazar Konumu
              </h4>
              <p className="text-purple-700 text-sm leading-relaxed">
                {(data.comprehensiveSummary as any)?.marketPosition
                  ? (typeof (data.comprehensiveSummary as any).marketPosition === 'object'
                    ? ((data.comprehensiveSummary as any).marketPosition as any)?.competitivePosition || 'Segment lideri konumda'
                    : (data.comprehensiveSummary as any).marketPosition)
                  : 'Segment lideri konumda'
                }
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
              <h4 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                <TrendingUpIcon className="w-5 h-5 mr-2" />
                Yatırım Potansiyeli
              </h4>
              <p className="text-amber-700 text-sm leading-relaxed">{(data.comprehensiveSummary as any)?.investmentPotential || 'Değerlendiriliyor...'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Teknik Analizler */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
            <CpuChipIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Premium Teknik Analizler</h3>
            <p className="text-gray-600">AI Destekli Detaylı İnceleme Sonuçları</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hasar Analizi */}
          {data.damageAnalysis && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mr-3">
                  <WrenchIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-red-800">🔍 Hasar Tespiti Analizi</h4>
                  <p className="text-red-600 text-sm">Fiziksel Hasar Değerlendirmesi</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {(data.damageAnalysis as any)?.genelDeğerlendirme?.genelPuan || 0}
                  </div>
                  <div className="text-xs text-gray-500">Genel Puan</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {(data.damageAnalysis as any)?.damageSeverity === 'low' ? 'Düşük' :
                      (data.damageAnalysis as any)?.damageSeverity === 'medium' ? 'Orta' :
                        (data.damageAnalysis as any)?.damageSeverity === 'high' ? 'Yüksek' :
                          (data.damageAnalysis as any)?.damageSeverity === 'minimal' ? 'Minimal' :
                            (data.damageAnalysis as any)?.damageSeverity || 'Minimal'}
                  </div>
                  <div className="text-xs text-gray-500">Hasar Şiddeti</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {(data.damageAnalysis as any)?.hasarAlanları?.length ||
                      (data.damageAnalysis as any)?.damages?.length ||
                      (data.damageAnalysis as any)?.totalDamages || 0}
                  </div>
                  <div className="text-xs text-gray-500">Toplam Hasar</div>
                </div>
              </div>

              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-sm text-red-700 leading-relaxed">
                  <strong>Detay:</strong> Çizik, göçük, pas, çatlak, yapısal hasar tespit edildi.
                  Onarım maliyeti: <span className="font-bold">{(data.damageAnalysis as any)?.genelDeğerlendirme?.toplamOnarımMaliyeti?.toLocaleString() || '0'} TL</span>.
                  Güvenlik etkisi ve sigorta durumu değerlendirildi.
                </p>
              </div>
            </div>
          )}

          {/* Boya Analizi */}
          {data.paintAnalysis && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                  <PaintBrushIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-blue-800">🎨 Boya Kalitesi Analizi</h4>
                  <p className="text-blue-600 text-sm">Yüzey ve Renk Değerlendirmesi</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {(data.paintAnalysis as any)?.paintCondition === 'good' ? 'İyi' :
                      (data.paintAnalysis as any)?.paintCondition === 'excellent' ? 'Mükemmel' :
                        (data.paintAnalysis as any)?.paintCondition === 'fair' ? 'Orta' :
                          (data.paintAnalysis as any)?.paintCondition === 'poor' ? 'Kötü' :
                            (data.paintAnalysis as any)?.condition === 'good' ? 'İyi' :
                              (data.paintAnalysis as any)?.condition === 'excellent' ? 'Mükemmel' :
                                (data.paintAnalysis as any)?.condition === 'fair' ? 'Orta' :
                                  (data.paintAnalysis as any)?.condition === 'poor' ? 'Kötü' :
                                    'İyi'}
                  </div>
                  <div className="text-xs text-gray-500">Boya Durumu</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    {(data.paintAnalysis as any)?.technicalDetails?.totalThickness ||
                      (data.paintAnalysis as any)?.surfaceAnalysis?.totalThickness ||
                      (data.paintAnalysis as any)?.paintThickness || 0}μm
                  </div>
                  <div className="text-xs text-gray-500">Boya Kalınlığı</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{(data.paintAnalysis as any)?.colorAnalysis?.colorCode || 'Orijinal'}</div>
                  <div className="text-xs text-gray-500">Renk Kodu</div>
                </div>
              </div>

              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-sm text-blue-700 leading-relaxed">
                  <strong>Detay:</strong>
                  Boya durumu: {(data.paintAnalysis as any)?.paintCondition}.
                  Boya kalınlığı: {(data.paintAnalysis as any)?.technicalDetails?.totalThickness || 0} mikron.
                  Yüzey kusurları tespit edildi.
                </p>
              </div>
            </div>
          )}

          {/* Motor Ses Analizi */}
          {data.audioAnalysis && (
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-6 border border-cyan-200">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center mr-3">
                  <SpeakerWaveIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-cyan-800">🔊 Motor Ses Analizi</h4>
                  <p className="text-cyan-600 text-sm">Akustik Performans Değerlendirmesi</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-cyan-600 mb-1">
                    {(data.audioAnalysis as any)?.engineHealth === 'good' ? 'İyi' :
                      (data.audioAnalysis as any)?.engineHealth === 'excellent' ? 'Mükemmel' :
                        (data.audioAnalysis as any)?.engineHealth === 'fair' ? 'Orta' :
                          (data.audioAnalysis as any)?.engineHealth === 'poor' ? 'Kötü' :
                            data.audioAnalysis.engineHealth || 'İyi'}
                  </div>
                  <div className="text-xs text-gray-500">Motor Sağlığı</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-teal-600 mb-1">
                    {(data.audioAnalysis as any)?.rpmAnalysis?.idleRpm ||
                      (data.audioAnalysis as any)?.idleRpm ||
                      (data.audioAnalysis as any)?.engineRpm || 0}
                  </div>
                  <div className="text-xs text-gray-500">Rölanti RPM</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">{data.audioAnalysis.detectedIssues?.length || 0}</div>
                  <div className="text-xs text-gray-500">Tespit Edilen Sorun</div>
                </div>
              </div>

              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-sm text-cyan-700 leading-relaxed">
                  <strong>Detay:</strong> RPM, titreşim, motor sesi, frekans analizi.
                  Motor sağlığı, arıza tespiti, performans değerlendirildi.
                  Tahmini onarım: <span className="font-bold">{data.audioAnalysis.costEstimate?.totalCost?.toLocaleString() || '0'} TL</span>.
                </p>
              </div>
            </div>
          )}

          {/* Değer Tahmini */}
          {data.valueEstimation && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mr-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-green-800">💰 Piyasa Değeri Tahmini</h4>
                  <p className="text-green-600 text-sm">2025-2026 Projeksiyonları</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {(data.valueEstimation as any)?.estimatedValue?.toLocaleString('tr-TR') ||
                      (data.valueEstimation as any)?.marketValue?.toLocaleString('tr-TR') ||
                      '0'}₺
                  </div>
                  <div className="text-xs text-gray-500">Tahmini Değer</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">%{data.valueEstimation.confidence}</div>
                  <div className="text-xs text-gray-500">Güven Seviyesi</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-lime-600 mb-1">
                    {typeof data.valueEstimation.marketPosition === 'object'
                      ? data.valueEstimation.marketPosition?.competitivePosition || 'Segment lideri'
                      : data.valueEstimation.marketPosition || 'Segment lideri'
                    }
                  </div>
                  <div className="text-xs text-gray-500">Piyasa Pozisyonu</div>
                </div>
              </div>

              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-sm text-green-700 leading-relaxed">
                  <strong>Detay:</strong> Tahmini değer, piyasa pozisyonu ve likidite analizi.
                  Güncel piyasa koşulları ve araç durumu değerlendirildi.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Premium Uzman Görüşü */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
            <LightBulbIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Uzman Görüşü</h3>
            <p className="text-gray-600">2025 Piyasa Analizi ve Yatırım Önerileri</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Gerekçeler
              </h4>
              <div className="space-y-3">
                {Array.isArray((data.expertOpinion as any)?.reasoning)
                  ? (data.expertOpinion as any).reasoning.map((reason: string, index: number) => (
                    <div key={index} className="flex items-start text-sm text-blue-700">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span>{reason}</span>
                    </div>
                  ))
                  : <div className="text-sm text-blue-700">{(data.expertOpinion as any)?.reasoning || 'Değerlendiriliyor...'}</div>
                }
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                <StarIcon className="w-5 h-5 mr-2" />
                Uzman Notları
              </h4>
              <div className="space-y-3">
                {data.expertOpinion.expertNotes.map((note, index) => (
                  <div key={index} className="flex items-start text-sm text-purple-700">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Risk Değerlendirmesi
              </h4>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-700">Risk Seviyesi:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(data.expertOpinion.riskAssessment.level)}`}>
                    {data.expertOpinion.riskAssessment.level === 'low' ? 'Düşük' :
                      data.expertOpinion.riskAssessment.level === 'medium' ? 'Orta' :
                        data.expertOpinion.riskAssessment.level === 'high' ? 'Yüksek' :
                          data.expertOpinion.riskAssessment.level === 'very_high' ? 'Çok Yüksek' :
                            data.expertOpinion.riskAssessment.level}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {data.expertOpinion.riskAssessment.factors.map((factor, index) => (
                  <div key={index} className="flex items-start text-sm text-green-700">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
              <h4 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                <TrendingUpIcon className="w-5 h-5 mr-2" />
                Fırsat Değerlendirmesi
              </h4>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-amber-700">Fırsat Seviyesi:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOpportunityColor(data.expertOpinion.opportunityAssessment.level)}`}>
                    {data.expertOpinion.opportunityAssessment.level === 'excellent' ? 'Mükemmel' :
                      data.expertOpinion.opportunityAssessment.level === 'good' ? 'İyi' :
                        data.expertOpinion.opportunityAssessment.level === 'fair' ? 'Orta' :
                          data.expertOpinion.opportunityAssessment.level === 'poor' ? 'Kötü' :
                            data.expertOpinion.opportunityAssessment.level === 'critical' ? 'Kritik' :
                              data.expertOpinion.opportunityAssessment.level}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {data.expertOpinion.opportunityAssessment.factors.map((factor, index) => (
                  <div key={index} className="flex items-start text-sm text-amber-700">
                    <TrendingUpIcon className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Nihai Öneriler */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-4">
            <WrenchIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Premium Bakım Önerileri</h3>
            <p className="text-gray-600">2025-2026 Maliyet Analizi ile Detaylı Planlama</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Acil Öneriler */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mr-3">
                <FireIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-red-800">Acil Öneriler</h4>
                <p className="text-red-600 text-sm">Kritik Bakım Kalemleri</p>
              </div>
            </div>

            <div className="space-y-4">
              {data.finalRecommendations.immediate.map((rec, index) => (
                <div key={index} className="bg-white/70 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-red-800 text-sm">{rec.action}</h5>
                    <span className="text-lg font-bold text-red-600">{rec.cost.toLocaleString()}₺</span>
                  </div>
                  <p className="text-xs text-red-700 leading-relaxed">{rec.benefit}</p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority === 'high' ? 'Yüksek' :
                        rec.priority === 'medium' ? 'Orta' :
                          rec.priority === 'low' ? 'Düşük' :
                            rec.priority === 'critical' ? 'Kritik' :
                              rec.priority === 'recommended' ? 'Önerilen' :
                                rec.priority === 'planning' ? 'Planlama' :
                                  rec.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kısa Vadeli Öneriler */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-blue-800">Kısa Vadeli Öneriler</h4>
                <p className="text-blue-600 text-sm">3-6 Ay İçinde Yapılacaklar</p>
              </div>
            </div>

            <div className="space-y-4">
              {data.finalRecommendations.shortTerm.map((rec, index) => (
                <div key={index} className="bg-white/70 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-blue-800 text-sm">{rec.action}</h5>
                    <span className="text-lg font-bold text-blue-600">{rec.cost.toLocaleString()}₺</span>
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">{rec.benefit}</p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority === 'high' ? 'Yüksek' :
                        rec.priority === 'medium' ? 'Orta' :
                          rec.priority === 'low' ? 'Düşük' :
                            rec.priority === 'critical' ? 'Kritik' :
                              rec.priority === 'recommended' ? 'Önerilen' :
                                rec.priority === 'planning' ? 'Planlama' :
                                  rec.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Uzun Vadeli Öneriler */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mr-3">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-green-800">Uzun Vadeli Öneriler</h4>
                <p className="text-green-600 text-sm">6+ Ay Planlama</p>
              </div>
            </div>

            <div className="space-y-4">
              {data.finalRecommendations.longTerm.map((rec, index) => (
                <div key={index} className="bg-white/70 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-green-800 text-sm">{rec.action}</h5>
                    <span className="text-lg font-bold text-green-600">{rec.cost.toLocaleString()}₺</span>
                  </div>
                  <p className="text-xs text-green-700 leading-relaxed">{rec.benefit}</p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority === 'high' ? 'Yüksek' :
                        rec.priority === 'medium' ? 'Orta' :
                          rec.priority === 'low' ? 'Düşük' :
                            rec.priority === 'critical' ? 'Kritik' :
                              rec.priority === 'recommended' ? 'Önerilen' :
                                rec.priority === 'planning' ? 'Planlama' :
                                  rec.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
            <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <BoltIcon className="w-5 h-5 mr-2" />
              Bakım Önerileri
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.finalRecommendations.maintenance.map((rec, index) => (
                <div key={index} className="bg-white/70 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-purple-800 text-sm">{rec.action}</h5>
                    <span className="text-lg font-bold text-purple-600">{rec.cost.toLocaleString()}₺</span>
                  </div>
                  <div className="text-xs text-purple-700">Sıklık: {rec.frequency}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Yatırım Kararı */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Yatırım Kararı</h3>
            <p className="text-gray-600">2025-2026 Finansal Projeksiyonlar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Yatırım Değerlendirmesi
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Beklenen Getiri:</span>
                  <span className="text-2xl font-bold text-green-600">%{data.investmentDecision.expectedReturn}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Geri Ödeme Süresi:</span>
                  <span className="text-lg font-bold text-green-600">{data.investmentDecision.paybackPeriod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Risk Seviyesi:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(data.investmentDecision.riskLevel)}`}>
                    {data.investmentDecision.riskLevel === 'low' ? 'Düşük' :
                      data.investmentDecision.riskLevel === 'medium' ? 'Orta' :
                        data.investmentDecision.riskLevel === 'high' ? 'Yüksek' :
                          data.investmentDecision.riskLevel === 'critical' ? 'Kritik' :
                            data.investmentDecision.riskLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Likidite Skoru:</span>
                  <span className="text-lg font-bold text-green-600">{data.investmentDecision.liquidityScore}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Pazar Zamanlaması:</span>
                  <span className="text-lg font-bold text-green-600">
                    {data.investmentDecision.marketTiming === 'poor' ? 'Kötü' :
                      data.investmentDecision.marketTiming === 'fair' ? 'Orta' :
                        data.investmentDecision.marketTiming === 'good' ? 'İyi' :
                          data.investmentDecision.marketTiming === 'excellent' ? 'Mükemmel' :
                            data.investmentDecision.marketTiming}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                Finansal Özet
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700">Satın Alma Fiyatı:</span>
                  <span className="text-lg font-bold text-purple-600">{data.investmentDecision.financialSummary.purchasePrice.toLocaleString()}₺</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700">Acil Onarımlar:</span>
                  <span className="text-lg font-bold text-purple-600">{data.investmentDecision.financialSummary.immediateRepairs.toLocaleString()}₺</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700">Aylık Bakım:</span>
                  <span className="text-lg font-bold text-purple-600">{data.investmentDecision.financialSummary.monthlyMaintenance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700">Tahmini Satış Değeri:</span>
                  <span className="text-lg font-bold text-purple-600">{data.investmentDecision.financialSummary.estimatedResaleValue.toLocaleString()}₺</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
            <h4 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
              <TrendingUpIcon className="w-5 h-5 mr-2" />
              Yatırım Sonuçları
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/70 rounded-xl p-4 border border-amber-200">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {data.investmentDecision.financialSummary.expectedProfit.toLocaleString()}₺
                </div>
                <div className="text-sm text-amber-700">Beklenen Kar</div>
              </div>
              <div className="bg-white/70 rounded-xl p-4 border border-amber-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  %{data.investmentDecision.financialSummary.roi}
                </div>
                <div className="text-sm text-amber-700">ROI</div>
              </div>
              <div className="bg-white/70 rounded-xl p-4 border border-amber-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {data.investmentDecision.financialSummary.totalInvestment.toLocaleString()}₺
                </div>
                <div className="text-sm text-amber-700">Toplam Yatırım</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
