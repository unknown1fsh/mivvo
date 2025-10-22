/**
 * Audio Report Component
 * 
 * Ses analizi raporu için özel render component'i
 * Backend AudioAnalysisService'den gelen veriyi güzel bir şekilde gösterir
 */

import { motion } from 'framer-motion'
import { 
  SpeakerWaveIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  CpuChipIcon,
  ClockIcon,
  WrenchIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { AudioAnalysisResult, EngineHealth, IssueSeverity } from '@/types'

interface AudioReportProps {
  data: AudioAnalysisResult
  vehicleInfo: {
    plate: string
    brand: string
    model: string
    year: number
  }
  showActions?: boolean
}

export function AudioReport({ data, vehicleInfo, showActions = false }: AudioReportProps) {
  // Processing durumunda loading göster
  if (!data || !data.recommendations || !data.rpmAnalysis || !data.soundQuality || 
      !data.performanceMetrics || !data.detectedIssues) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <motion.div 
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CpuChipIcon className="w-12 h-12 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Analiz Yapılıyor
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Motor sesi analizi devam ediyor. Lütfen bekleyin...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </motion.div>
      </div>
    )
  }

  const getHealthColor = (health: EngineHealth) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthDescription = (health: EngineHealth) => {
    switch (health) {
      case 'excellent': return 'Mükemmel'
      case 'good': return 'İyi'
      case 'fair': return 'Orta'
      case 'poor': return 'Kötü'
      case 'critical': return 'Kritik'
      default: return 'Bilinmiyor'
    }
  }

  const getSeverityColor = (severity: IssueSeverity) => {
    switch (severity) {
      case 'minimal': return 'text-gray-600 bg-gray-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityDescription = (severity: IssueSeverity) => {
    switch (severity) {
      case 'minimal': return 'Minimal'
      case 'low': return 'Düşük'
      case 'medium': return 'Orta'
      case 'high': return 'Yüksek'
      case 'critical': return 'Kritik'
      default: return 'Bilinmiyor'
    }
  }

  return (
    <div className="space-y-8">
      {/* Genel Değerlendirme */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 text-blue-500 mr-2" />
          Genel Değerlendirme
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{data.overallScore || 0}</div>
            <div className="text-sm text-gray-500">Genel Puan</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${data.overallScore || 0}%` }}
              />
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${getHealthColor((data.engineHealth as EngineHealth) || EngineHealth.GOOD).split(' ')[0]}`}>
              {getHealthDescription((data.engineHealth as EngineHealth) || EngineHealth.GOOD)}
            </div>
            <div className="text-sm text-gray-500">Motor Sağlığı</div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getHealthColor((data.engineHealth as EngineHealth) || EngineHealth.GOOD)}`}>
              {getHealthDescription((data.engineHealth as EngineHealth) || EngineHealth.GOOD)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {(data.costEstimate as any)?.totalCost?.toLocaleString() || '0'}₺
            </div>
            <div className="text-sm text-gray-500">Tahmini Onarım Maliyeti</div>
            <div className="text-xs text-gray-400 mt-1">
              {(data.detectedIssues as any)?.length || 0} sorun tespit edildi
            </div>
          </div>
        </div>
      </motion.div>

      {/* RPM Analizi */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <CpuChipIcon className="w-6 h-6 text-purple-500 mr-2" />
          RPM Analizi
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">RPM Değerleri</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Rölanti RPM:</span>
                <span className="font-medium">{(data.rpmAnalysis as any)?.idleRpm || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Max RPM:</span>
                <span className="font-medium">{(data.rpmAnalysis as any)?.maxRpm || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">RPM Stabilitesi:</span>
                <span className="font-medium">{(data.rpmAnalysis as any)?.rpmStability || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">RPM Tepkisi:</span>
                <span className="font-medium">{(data.rpmAnalysis as any)?.rpmResponse || 0}%</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Rölanti Kalitesi</h4>
            <p className="text-sm text-gray-600 mb-3">{(data.rpmAnalysis as any)?.idleQuality || 'Normal'}</p>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h5 className="text-sm font-medium text-gray-700 mb-1">RPM Grafiği</h5>
              <div className="flex items-end space-x-1 h-16">
                {[(data.rpmAnalysis as any)?.idleRpm || 0, (data.rpmAnalysis as any)?.maxRpm || 0].map((rpm, index) => (
                  <div 
                    key={index}
                    className="bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(rpm / Math.max((data.rpmAnalysis as any)?.idleRpm || 0, (data.rpmAnalysis as any)?.maxRpm || 0)) * 100}%`,
                      width: '20px'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Ses Kalitesi */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <SpeakerWaveIcon className="w-6 h-6 text-green-500 mr-2" />
          Ses Kalitesi
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Kalite Metrikleri</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Genel Kalite</span>
                  <span className="text-sm font-medium">{(data.soundQuality as any)?.overallQuality || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(data.soundQuality as any)?.overallQuality || 0}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Netlik</span>
                  <span className="text-sm font-medium">{(data.soundQuality as any)?.clarity || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(data.soundQuality as any)?.clarity || 0}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Pürüzsüzlük</span>
                  <span className="text-sm font-medium">{(data.soundQuality as any)?.smoothness || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${(data.soundQuality as any)?.smoothness || 0}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Tutarlılık</span>
                  <span className="text-sm font-medium">{(data.soundQuality as any)?.consistency || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(data.soundQuality as any)?.consistency || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Ses İmzası</h4>
            <p className="text-sm text-gray-600 mb-3">{(data.soundQuality as any)?.soundSignature || 'Normal'}</p>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Frekans Analizi</h5>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Baskın Frekans:</span>
                  <span className="font-medium">{(data as any).frequencyAnalysis?.dominantFrequencies?.[0] || 'N/A'} Hz</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Harmonik Distorsiyon:</span>
                  <span className="font-medium">{(data as any).frequencyAnalysis?.harmonicDistortion || 'N/A'}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Gürültü Seviyesi:</span>
                  <span className="font-medium">{(data as any).frequencyAnalysis?.noiseLevel || 'N/A'} dB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tespit Edilen Sorunlar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 mr-2" />
          Tespit Edilen Sorunlar
        </h3>
        
        <div className="space-y-4">
          {(data.detectedIssues as any)?.map((issue: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{issue.type}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                    {getSeverityDescription(issue.severity)}
                  </span>
                  <span className="text-xs text-gray-500">%{issue.confidence}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
              
              {issue.symptoms && issue.symptoms.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Semptomlar:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {issue.symptoms.map((symptom, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {issue.recommendedActions && issue.recommendedActions.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Önerilen Aksiyonlar:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {issue.recommendedActions.map((action, idx) => (
                      <li key={idx} className="flex items-center">
                        <LightBulbIcon className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Performans Metrikleri */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 text-indigo-500 mr-2" />
          Performans Metrikleri
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{(data.performanceMetrics as any)?.engineEfficiency || 0}%</div>
            <div className="text-sm text-gray-500">Motor Verimliliği</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(data.performanceMetrics as any)?.engineEfficiency || 0}%` }}
              />
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{(data.performanceMetrics as any)?.fuelEfficiency || 0}%</div>
            <div className="text-sm text-gray-500">Yakıt Verimliliği</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(data.performanceMetrics as any)?.fuelEfficiency || 0}%` }}
              />
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{(data.performanceMetrics as any)?.overallPerformance || 0}%</div>
            <div className="text-sm text-gray-500">Genel Performans</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${(data.performanceMetrics as any)?.overallPerformance || 0}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">Performans Notu: <span className="font-medium">{(data.performanceMetrics as any)?.performanceGrade || 'B'}</span></p>
        </div>
      </motion.div>

      {/* Öneriler - Sadece data varsa göster */}
      {data.recommendations && (
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-red-700 mb-2">Acil Öneriler</h4>
              {(data.recommendations as any)?.immediate?.length > 0 ? (
                <ul className="space-y-2">
                  {(data.recommendations as any).immediate.map((rec: any, index: number) => (
                    <li key={index} className="flex items-start text-sm text-gray-600">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Acil öneri bulunmuyor</p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Kısa Vadeli Öneriler</h4>
              {(data.recommendations as any)?.shortTerm?.length > 0 ? (
                <ul className="space-y-2">
                  {(data.recommendations as any).shortTerm.map((rec: any, index: number) => (
                    <li key={index} className="flex items-start text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Kısa vadeli öneri bulunmuyor</p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-green-700 mb-2">Uzun Vadeli Öneriler</h4>
              {(data.recommendations as any)?.longTerm?.length > 0 ? (
                <ul className="space-y-2">
                  {(data.recommendations as any).longTerm.map((rec: any, index: number) => (
                    <li key={index} className="flex items-start text-sm text-gray-600">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Uzun vadeli öneri bulunmuyor</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Maliyet Kırılımı - Sadece data varsa göster */}
      {data.costEstimate && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CurrencyDollarIcon className="w-6 h-6 text-green-500 mr-2" />
            Maliyet Kırılımı
          </h3>
          
          <div className="space-y-3">
            {(data.costEstimate as any)?.breakdown?.length > 0 ? (
              (data.costEstimate as any).breakdown.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <span className="font-medium text-gray-900">{item.category}</span>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <span className="font-semibold text-green-600">{item.cost?.toLocaleString() || '0'}₺</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">Maliyet kırılımı bulunmuyor</p>
            )}
            
            <div className="flex items-center justify-between py-3 border-t-2 border-gray-200 font-semibold">
              <span className="text-lg text-gray-900">Toplam Maliyet</span>
              <span className="text-xl text-green-600">{(data.costEstimate as any)?.totalCost?.toLocaleString() || '0'}₺</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
