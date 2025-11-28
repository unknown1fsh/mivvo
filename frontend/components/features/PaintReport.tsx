/**
 * Paint Report Component
 * 
 * Boya analizi raporu için özel render component'i
 * Backend PaintAnalysisService'den gelen veriyi güzel bir şekilde gösterir
 */

import { motion } from 'framer-motion'
import { 
  PaintBrushIcon,
  EyeIcon,
  ChartBarIcon,
  BeakerIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { PaintAnalysisResult } from '@/types/paintAnalysis'

interface PaintReportProps {
  report: any
  vehicleInfo: {
    plate: string
    brand: string
    model: string
    year: number
  }
  vehicleImages?: Array<{ imageUrl: string; id?: number }>
  onGeneratePDF?: () => void
  isGeneratingPDF?: boolean
}

export function PaintReport({ report, vehicleInfo, vehicleImages = [], onGeneratePDF, isGeneratingPDF }: PaintReportProps) {
  // Backend'den gelen veriyi direkt kullan - artık mapping gerek yok
  const data = report as any
  
  // Debug: Gelen veriyi kontrol et
  console.log('🎨 PaintReport Debug:', {
    hasReport: !!report,
    reportKeys: report ? Object.keys(report) : [],
    reportContent: report ? JSON.stringify(report).substring(0, 300) + '...' : 'No report data',
    vehicleInfo: vehicleInfo
  });

  // Güvenli string render helper - nesne ise string'e çevir
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return 'Bilinmiyor';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      // Nesneyi okunabilir formata çevir
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return 'Veri görüntülenemiyor';
      }
    }
    return String(value);
  };

  // Nesne içindeki değeri güvenli şekilde al
  const safeGet = (obj: any, path: string, defaultValue: any = 'Bilinmiyor'): any => {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result === null || result === undefined) return defaultValue;
      result = result[key];
    }
    return result ?? defaultValue;
  };
  const getQualityColor = (condition: string) => {
    switch (condition) {
      case 'mükemmel': return 'text-green-600 bg-green-100'
      case 'iyi': return 'text-blue-600 bg-blue-100'
      case 'orta': return 'text-yellow-600 bg-yellow-100'
      case 'kötü': return 'text-orange-600 bg-orange-100'
      case 'kritik': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getQualityDescription = (condition: string) => {
    switch (condition) {
      case 'mükemmel': return 'Mükemmel'
      case 'iyi': return 'İyi'
      case 'orta': return 'Orta'
      case 'kötü': return 'Kötü'
      case 'kritik': return 'Kritik'
      default: return 'Bilinmiyor'
    }
  }

  // Veri kontrolü - AI analiz verisi eksikse hata göster
  if (!report || !data || !data.boyaKalitesi || !data.renkAnalizi || !data.yüzeyAnalizi) {
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
                Boya analizi verileri eksik veya AI servisinden veri alınamadı. Bu durum genellikle geçici bir sorundur.
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
          <ChartBarIcon className="w-6 h-6 text-blue-500 mr-2" />
          Genel Değerlendirme
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {typeof data.boyaKalitesi?.genelPuan === 'number' ? data.boyaKalitesi.genelPuan : 
               typeof data.boyaKalitesi?.genelSkor === 'number' ? data.boyaKalitesi.genelSkor : 0}
            </div>
            <div className="text-sm text-gray-500">Genel Puan</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${typeof data.boyaKalitesi?.genelPuan === 'number' ? data.boyaKalitesi.genelPuan : 
                         typeof data.boyaKalitesi?.genelSkor === 'number' ? data.boyaKalitesi.genelSkor : 0}%` }}
              />
            </div>
          </div>
          
          <div className="text-center">
            {(() => {
              const durumValue = data.boyaDurumu?.genelDurum;
              const durumStr = typeof durumValue === 'string' ? durumValue : 'bilinmiyor';
              return (
                <>
                  <div className={`text-2xl font-bold mb-2 ${getQualityColor(durumStr).split(' ')[0]}`}>
                    {getQualityDescription(durumStr)}
                  </div>
                  <div className="text-sm text-gray-500">Boya Kalitesi</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getQualityColor(durumStr)}`}>
                    {durumStr}
                  </div>
                </>
              );
            })()}
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {(typeof data.onarımTahmini?.toplamMaliyet === 'number' ? data.onarımTahmini.toplamMaliyet : 
                typeof data.maliyetTahmini?.toplamMaliyet === 'number' ? data.maliyetTahmini.toplamMaliyet : 0).toLocaleString()}₺
            </div>
            <div className="text-sm text-gray-500">Tahmini Maliyet</div>
            <div className="text-xs text-gray-400 mt-1">
              Onarım önceliği: {safeRender(data.onarımTahmini?.öncelik ?? data.maliyetTahmini?.öncelik ?? 'Bilinmiyor')}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Boya Durumu Detayları */}
      {data.boyaDurumu && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <PaintBrushIcon className="w-6 h-6 text-blue-500 mr-2" />
            Boya Durumu Detayları
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Genel Durum</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Durum:</span>
                  {(() => {
                    const durumValue = data.boyaDurumu.genelDurum;
                    const durumStr = typeof durumValue === 'string' ? durumValue : 'bilinmiyor';
                    return (
                      <span className={`font-medium ${getQualityColor(durumStr).split(' ')[0]}`}>
                        {getQualityDescription(durumStr)}
                      </span>
                    );
                  })()}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Boya Kalınlığı:</span>
                  <span className="font-medium">{safeRender(data.boyaDurumu.boyaKalınlığı ?? data.yüzeyAnalizi?.boyaKalınlığı)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Boya Kusur Durumu</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Boya Kusuru Var:</span>
                  <span className={`font-medium ${data.boyaDurumu.hasarVar === true ? 'text-red-600' : 'text-green-600'}`}>
                    {data.boyaDurumu.hasarVar === true ? 'Evet' : data.boyaDurumu.hasarVar === false ? 'Hayır' : safeRender(data.boyaDurumu.hasarVar)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Boya Çiziği Var:</span>
                  <span className={`font-medium ${data.boyaDurumu.çizikVar === true ? 'text-orange-600' : 'text-green-600'}`}>
                    {data.boyaDurumu.çizikVar === true ? 'Evet' : data.boyaDurumu.çizikVar === false ? 'Hayır' : safeRender(data.boyaDurumu.çizikVar)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Soyulma/Kabarcık Var:</span>
                  <span className={`font-medium ${data.boyaDurumu.çukurVar === true ? 'text-red-600' : 'text-green-600'}`}>
                    {data.boyaDurumu.çukurVar === true ? 'Evet' : data.boyaDurumu.çukurVar === false ? 'Hayır' : safeRender(data.boyaDurumu.çukurVar)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pas Belirtisi Var:</span>
                  <span className={`font-medium ${data.boyaDurumu.pasVar === true ? 'text-red-600' : 'text-green-600'}`}>
                    {data.boyaDurumu.pasVar === true ? 'Evet' : data.boyaDurumu.pasVar === false ? 'Hayır' : safeRender(data.boyaDurumu.pasVar)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Renk Analizi */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <EyeIcon className="w-6 h-6 text-purple-500 mr-2" />
          Boya Kalitesi Detayları
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Kalite Metrikleri</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Genel Skor:</span>
                <span className="font-medium">{safeRender(data.boyaKalitesi?.genelSkor ?? data.boyaKalitesi?.genelPuan ?? 0)}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Parlaklık:</span>
                <span className="font-medium">{safeRender(data.boyaKalitesi?.parlaklık ?? data.boyaKalitesi?.parlaklıkSeviyesi ?? 0)}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Düzgünlük:</span>
                <span className="font-medium">{safeRender(data.boyaKalitesi?.düzgünlük ?? data.boyaKalitesi?.pürüzsüzlük ?? 0)}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Renk Eşleşmesi:</span>
                <span className="font-medium">{safeRender(data.boyaKalitesi?.renkEşleşmesi ?? data.renkAnalizi?.renkEşleşmesi ?? 0)}/100</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Kalite Değerlendirmesi</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Kalite:</span>
                <span className={`font-medium ${getQualityColor(typeof data.boyaKalitesi?.kalite === 'string' ? data.boyaKalitesi.kalite : 'bilinmiyor').split(' ')[0]}`}>
                  {getQualityDescription(typeof data.boyaKalitesi?.kalite === 'string' ? data.boyaKalitesi.kalite : 'bilinmiyor')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Güven Skoru:</span>
                <span className="font-medium">{safeRender(data.güven ?? data.güvenSeviyesi ?? 0)}/100</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ek bilgiler varsa göster */}
        {data.boyaKalitesi && typeof data.boyaKalitesi === 'object' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-700 mb-2">Detaylı Metrikler</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(data.boyaKalitesi).map(([key, value]) => {
                // Zaten yukarıda gösterilenleri atla
                if (['genelSkor', 'genelPuan', 'parlaklık', 'parlaklıkSeviyesi', 'düzgünlük', 'pürüzsüzlük', 'renkEşleşmesi', 'kalite'].includes(key)) return null;
                return (
                  <div key={key} className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500 text-xs block capitalize">{key}</span>
                    <span className="font-medium">{safeRender(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Yüzey Kusurları - Boya Analizi İçin */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 mr-2" />
          Yüzey Kusurları
        </h3>
        
        {/* boyaKusurları veya yüzeyAnalizi.yüzeyKusurları alanlarını kontrol et */}
        {(data.boyaKusurları?.yüzeyKusurları && data.boyaKusurları.yüzeyKusurları.length > 0) || 
         (data.yüzeyAnalizi?.yüzeyKusurları && data.yüzeyAnalizi.yüzeyKusurları.length > 0) ? (
          <div className="space-y-4">
            {(data.boyaKusurları?.yüzeyKusurları || data.yüzeyAnalizi?.yüzeyKusurları || []).map((kusur: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Kusur Bilgileri</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Konum:</span>
                        <span className="font-medium">{kusur.konum || 'Bilinmiyor'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tür:</span>
                        <span className="font-medium">{kusur.tür || 'Bilinmiyor'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Şiddet:</span>
                        <span className={`font-medium ${getQualityColor(kusur.şiddet || 'bilinmiyor').split(' ')[0]}`}>
                          {getQualityDescription(kusur.şiddet || 'bilinmiyor')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Boyut:</span>
                        <span className="font-medium">{kusur.boyut ? `${kusur.boyut} cm²` : 'Bilinmiyor'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Onarılabilir:</span>
                        <span className={`font-medium ${kusur.onarılabilir ? 'text-green-600' : 'text-red-600'}`}>
                          {kusur.onarılabilir ? 'Evet' : 'Hayır'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Maliyet Bilgileri</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Onarım Maliyeti:</span>
                        <span className="font-medium text-green-600">{(kusur.onarımMaliyeti || 0).toLocaleString()}₺</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {kusur.açıklama && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="font-medium text-gray-700 mb-2">Açıklama</h5>
                    <p className="text-sm text-gray-600">{kusur.açıklama}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Yüzey Kusuru Tespit Edilmedi</h4>
            <p className="text-gray-500">Boya yüzeyinde görünür bir kusur bulunamadı.</p>
          </div>
        )}
      </motion.div>

      {/* Teknik Analiz */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <SparklesIcon className="w-6 h-6 text-indigo-500 mr-2" />
          Teknik Analiz
        </h3>
        
        <div className="space-y-4">
          {data.teknikAnaliz && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Analiz Detayları</h4>
              {typeof data.teknikAnaliz === 'object' ? (
                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg space-y-2">
                  {Object.entries(data.teknikAnaliz).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500 capitalize">{key}:</span>
                      <span className="font-medium">{safeRender(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {safeRender(data.teknikAnaliz)}
                </p>
              )}
            </div>
          )}
          
          {data.güvenlikDeğerlendirmesi && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Güvenlik Değerlendirmesi</h4>
              {typeof data.güvenlikDeğerlendirmesi === 'object' ? (
                <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg space-y-2">
                  {Object.entries(data.güvenlikDeğerlendirmesi).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500 capitalize">{key}:</span>
                      <span className="font-medium">{safeRender(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                  {safeRender(data.güvenlikDeğerlendirmesi)}
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Genel Değerlendirme */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <LightBulbIcon className="w-6 h-6 text-yellow-500 mr-2" />
          Genel Değerlendirme
        </h3>
        
        {data.genelDeğerlendirme && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            {typeof data.genelDeğerlendirme === 'object' ? (
              <div className="space-y-2 text-sm text-gray-700">
                {Object.entries(data.genelDeğerlendirme).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium capitalize">{key}: </span>
                    {Array.isArray(value) ? (
                      <ul className="list-disc list-inside ml-2">
                        {(value as any[]).map((item, idx) => (
                          <li key={idx}>{safeRender(item)}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>{safeRender(value)}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-700">{safeRender(data.genelDeğerlendirme)}</p>
            )}
          </div>
        )}
      </motion.div>

      {/* Onarım Tahmini */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <CurrencyDollarIcon className="w-6 h-6 text-green-500 mr-2" />
          Onarım Tahmini
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {(typeof data.onarımTahmini?.toplamMaliyet === 'number' ? data.onarımTahmini.toplamMaliyet :
                typeof data.maliyetTahmini?.toplamMaliyet === 'number' ? data.maliyetTahmini.toplamMaliyet : 0).toLocaleString()}₺
            </div>
            <div className="text-sm text-gray-500">Toplam Maliyet</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {safeRender(data.onarımTahmini?.süre ?? data.maliyetTahmini?.süre ?? 'Bilinmiyor')}
            </div>
            <div className="text-sm text-gray-500">Tahmini Süre</div>
          </div>
          
          <div className="text-center">
            {(() => {
              const oncelikValue = data.onarımTahmini?.öncelik ?? data.maliyetTahmini?.öncelik;
              const oncelikStr = typeof oncelikValue === 'string' ? oncelikValue : 'bilinmiyor';
              return (
                <div className={`text-2xl font-bold mb-2 ${getQualityColor(oncelikStr).split(' ')[0]}`}>
                  {getQualityDescription(oncelikStr)}
                </div>
              );
            })()}
            <div className="text-sm text-gray-500">Öncelik</div>
          </div>
        </div>
        
        {/* Öneriler varsa göster */}
        {(data.öneriler || data.onarımTahmini?.öneriler || data.maliyetTahmini?.öneriler) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-700 mb-2">Öneriler</h4>
            {(() => {
              const oneriler = data.öneriler || data.onarımTahmini?.öneriler || data.maliyetTahmini?.öneriler;
              if (Array.isArray(oneriler)) {
                return (
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {oneriler.map((oneri: any, idx: number) => (
                      <li key={idx}>{safeRender(oneri)}</li>
                    ))}
                  </ul>
                );
              } else if (typeof oneriler === 'object') {
                return (
                  <div className="text-sm text-gray-600 space-y-2">
                    {Object.entries(oneriler).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium capitalize">{key}: </span>
                        {Array.isArray(value) ? (
                          <ul className="list-disc list-inside ml-2">
                            {(value as any[]).map((item, idx) => (
                              <li key={idx}>{safeRender(item)}</li>
                            ))}
                          </ul>
                        ) : (
                          <span>{safeRender(value)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              }
              return <p className="text-sm text-gray-600">{safeRender(oneriler)}</p>;
            })()}
          </div>
        )}
      </motion.div>

    </div>
  )
}
