/**
 * Value Report Component
 * 
 * Değer tahmini raporu için özel render component'i
 * Backend ValueEstimationService'den gelen veriyi güzel bir şekilde gösterir
 * Görsel analiz (boya, kaporta durumu) dahil
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
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  PaintBrushIcon,
  TruckIcon
} from '@heroicons/react/24/outline'

interface ValueReportProps {
  data: any
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
  // ❌ VERİ KONTROLÜ - Mock/Fallback veri OLMAYACAK!
  
  // Veri hiç yoksa
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border-2 border-red-200 p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🚫 AI Analiz Verisi Alınamadı
            </h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-left">
              <p className="text-red-800 font-medium mb-2">
                Değer tahmini yapılamadı
              </p>
              <p className="text-red-700 text-sm">
                AI servisi yanıt vermedi veya görsel analizi gerçekleştirilemedi. 
                Bu durum için krediniz otomatik olarak iade edilmiştir.
              </p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 text-left">
              <p className="text-green-800 font-medium mb-2">
                ✅ Krediniz İade Edildi
              </p>
              <p className="text-green-700 text-sm">
                Analiz başarısız olduğu için kullandığınız kredi otomatik olarak hesabınıza iade edilmiştir.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tekrar Dene
              </button>
              <a
                href="/dashboard"
                className="px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                Dashboard'a Dön
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // estimatedValue ZORUNLU - yoksa hata göster
  if (!data.estimatedValue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border-2 border-orange-200 p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ⚠️ Eksik Analiz Verisi
            </h2>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 text-left">
              <p className="text-orange-800 font-medium mb-2">
                Değer tahmini verisi eksik
              </p>
              <p className="text-orange-700 text-sm">
                AI analizi tamamlandı ancak tahmini değer bilgisi alınamadı.
                Lütfen analizi tekrar başlatın.
              </p>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
              <p className="text-blue-800 font-medium mb-2">
                💡 Ne Yapmalısınız?
              </p>
              <ul className="text-blue-700 text-sm list-disc list-inside space-y-1">
                <li>Fotoğrafların net ve araç görüntüsünü içerdiğinden emin olun</li>
                <li>Farklı açılardan birden fazla fotoğraf yükleyin</li>
                <li>İnternet bağlantınızı kontrol edin</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Değer verilerini çıkar (yeni ve eski format desteği)
  const estimatedValue = data.estimatedValue?.recommendedValue || data.estimatedValue?.tahminiDeğer || 
                         (typeof data.estimatedValue === 'number' ? data.estimatedValue : 0)
  const minValue = data.estimatedValue?.minValue || data.piyasaAnalizi?.fiyatAralığı?.min || 0
  const maxValue = data.estimatedValue?.maxValue || data.piyasaAnalizi?.fiyatAralığı?.max || 0
  const quickSaleValue = data.estimatedValue?.quickSaleValue || Math.round(estimatedValue * 0.95)
  const confidence = data.sonuçÖzeti?.güvenSeviyesi || data.confidence || 75

  // Görsel analiz verisi
  const görselAnaliz = data.görselAnaliz || {}
  const boyaDurumu = görselAnaliz.boyaDurumu || {}
  const kaportaDurumu = görselAnaliz.kaportaDurumu || {}
  const lastikJant = görselAnaliz.lastikJant || {}
  const içMekan = görselAnaliz.içMekan || {}

  // Değer hesaplama
  const değerHesaplama = data.değerHesaplama || {}

  // Araç durum özeti
  const araçDurum = data.araçDurumÖzeti || {}

  // Piyasa analizi
  const piyasaAnalizi = data.piyasaAnalizi || data.marketAnalysis || {}

  // Öneriler
  const öneriler = data.öneriler || data.recommendations || {}

  // Puan rengi helper
  const getPuanColor = (puan: number) => {
    if (puan >= 80) return 'text-green-600 bg-green-100'
    if (puan >= 60) return 'text-yellow-600 bg-yellow-100'
    if (puan >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getPuanLabel = (puan: number) => {
    if (puan >= 80) return 'Çok İyi'
    if (puan >= 60) return 'İyi'
    if (puan >= 40) return 'Orta'
    return 'Kötü'
  }

  return (
    <div className="space-y-6">
      {/* Yüklenen Fotoğraflar */}
      {vehicleImages && vehicleImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <EyeIcon className="w-5 h-5 text-blue-500 mr-2" />
            Analiz Edilen Fotoğraflar
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {vehicleImages.map((img, index) => (
              <div key={img.id || index} className="relative">
                <img
                  src={img.imageUrl}
                  alt={`Araç fotoğrafı ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Ana Değer Kartı */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium opacity-90">Tahmini Piyasa Değeri</h3>
          <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
            Güven: %{confidence}
          </div>
        </div>
        
        <div className="text-center py-4">
          <div className="text-5xl font-bold mb-2">
            {estimatedValue.toLocaleString('tr-TR')}₺
          </div>
          <div className="text-white/80 text-sm">
            Önerilen satış fiyatı
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="text-2xl font-semibold">{minValue.toLocaleString('tr-TR')}₺</div>
            <div className="text-xs text-white/70">Minimum</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold">{maxValue.toLocaleString('tr-TR')}₺</div>
            <div className="text-xs text-white/70">Maksimum</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold">{quickSaleValue.toLocaleString('tr-TR')}₺</div>
            <div className="text-xs text-white/70">Hızlı Satış</div>
          </div>
        </div>
      </motion.div>

      {/* Görsel Analiz - Boya ve Kaporta */}
      {görselAnaliz.yapıldıMı && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PaintBrushIcon className="w-5 h-5 text-purple-500 mr-2" />
            Görsel Analiz Sonuçları
            <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              Fotoğraflardan Analiz Edildi
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Boya Durumu */}
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">🎨 Boya Durumu</h4>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getPuanColor(boyaDurumu.puan || 0)}`}>
                  {boyaDurumu.puan || 0}/100
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Durum: <span className="font-medium capitalize">{boyaDurumu.genelDurum || 'Bilinmiyor'}</span>
              </div>
              {boyaDurumu.tespitler && boyaDurumu.tespitler.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">Tespitler:</div>
                  <ul className="space-y-1">
                    {boyaDurumu.tespitler.map((tespit: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        {tespit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {boyaDurumu.boyaDeğerEtkisi && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Değer Etkisi: </span>
                  <span className={`font-semibold ${boyaDurumu.boyaDeğerEtkisi < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {boyaDurumu.boyaDeğerEtkisi.toLocaleString('tr-TR')}₺
                  </span>
                </div>
              )}
            </div>

            {/* Kaporta Durumu */}
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">🚗 Kaporta Durumu</h4>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getPuanColor(kaportaDurumu.puan || 0)}`}>
                  {kaportaDurumu.puan || 0}/100
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Durum: <span className="font-medium capitalize">{kaportaDurumu.genelDurum || 'Bilinmiyor'}</span>
              </div>
              {kaportaDurumu.tespitler && kaportaDurumu.tespitler.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">Tespitler:</div>
                  <ul className="space-y-1">
                    {kaportaDurumu.tespitler.map((tespit: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        {tespit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {kaportaDurumu.kaportaDeğerEtkisi && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Değer Etkisi: </span>
                  <span className={`font-semibold ${kaportaDurumu.kaportaDeğerEtkisi < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {kaportaDurumu.kaportaDeğerEtkisi.toLocaleString('tr-TR')}₺
                  </span>
                </div>
              )}
            </div>

            {/* Lastik/Jant */}
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">🛞 Lastik & Jant</h4>
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {lastikJant.durum || 'Bilinmiyor'}
                </span>
              </div>
              {lastikJant.tespitler && lastikJant.tespitler.length > 0 && (
                <ul className="space-y-1">
                  {lastikJant.tespitler.map((tespit: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {tespit}
                    </li>
                  ))}
                </ul>
              )}
              {lastikJant.değerEtkisi && (
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Değer Etkisi: </span>
                  <span className={`font-semibold ${lastikJant.değerEtkisi < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {lastikJant.değerEtkisi.toLocaleString('tr-TR')}₺
                  </span>
                </div>
              )}
            </div>

            {/* İç Mekan */}
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">🪑 İç Mekan</h4>
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {içMekan.durum || 'Bilinmiyor'}
                </span>
              </div>
              {içMekan.tespitler && içMekan.tespitler.length > 0 && (
                <ul className="space-y-1">
                  {içMekan.tespitler.map((tespit: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {tespit}
                    </li>
                  ))}
                </ul>
              )}
              {içMekan.değerEtkisi && (
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Değer Etkisi: </span>
                  <span className={`font-semibold ${içMekan.değerEtkisi < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {içMekan.değerEtkisi.toLocaleString('tr-TR')}₺
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Genel İzlenim */}
          {görselAnaliz.genelİzlenim && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <EyeIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800 mb-1">Genel İzlenim</div>
                  <p className="text-sm text-blue-700">{görselAnaliz.genelİzlenim}</p>
                </div>
              </div>
              {görselAnaliz.toplamGörselEtki && (
                <div className="mt-2 text-right">
                  <span className="text-sm text-blue-600">Toplam Görsel Etki: </span>
                  <span className={`font-bold ${görselAnaliz.toplamGörselEtki < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {görselAnaliz.toplamGörselEtki.toLocaleString('tr-TR')}₺
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Değer Hesaplama Kırılımı */}
      {değerHesaplama.sıfırAraçFiyatı && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 text-green-500 mr-2" />
            Değer Hesaplama Kırılımı
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Sıfır Araç Referans Fiyatı</span>
              <span className="font-semibold text-gray-900">
                {değerHesaplama.sıfırAraçFiyatı?.toLocaleString('tr-TR')}₺
              </span>
            </div>
            
            {değerHesaplama.modelYılıDüşüşü && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Model Yılı Düşüşü</span>
                <span className="font-semibold text-red-600">
                  {değerHesaplama.modelYılıDüşüşü.toLocaleString('tr-TR')}₺
                </span>
              </div>
            )}
            
            {değerHesaplama.kmEtkisi && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Kilometre Etkisi</span>
                <span className="font-semibold text-red-600">
                  {değerHesaplama.kmEtkisi.toLocaleString('tr-TR')}₺
                </span>
              </div>
            )}
            
            {değerHesaplama.boyaDurumuEtkisi && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Boya Durumu Etkisi</span>
                <span className={`font-semibold ${değerHesaplama.boyaDurumuEtkisi < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {değerHesaplama.boyaDurumuEtkisi.toLocaleString('tr-TR')}₺
                </span>
              </div>
            )}
            
            {değerHesaplama.kaportaEtkisi && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Kaporta Durumu Etkisi</span>
                <span className={`font-semibold ${değerHesaplama.kaportaEtkisi < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {değerHesaplama.kaportaEtkisi.toLocaleString('tr-TR')}₺
                </span>
              </div>
            )}
            
            {değerHesaplama.genelDurumEtkisi && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Genel Durum Etkisi</span>
                <span className={`font-semibold ${değerHesaplama.genelDurumEtkisi < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {değerHesaplama.genelDurumEtkisi.toLocaleString('tr-TR')}₺
                </span>
              </div>
            )}
            
            {değerHesaplama.piyasaDurumu && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Piyasa Durumu Etkisi</span>
                <span className={`font-semibold ${değerHesaplama.piyasaDurumu < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {değerHesaplama.piyasaDurumu.toLocaleString('tr-TR')}₺
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-3 bg-emerald-50 rounded-lg px-4 mt-2">
              <span className="font-semibold text-emerald-800">Hesaplanan Değer</span>
              <span className="text-xl font-bold text-emerald-600">
                {(değerHesaplama.hesaplananDeğer || estimatedValue).toLocaleString('tr-TR')}₺
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Araç Durum Özeti */}
      {araçDurum.genelPuan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ShieldCheckIcon className="w-5 h-5 text-blue-500 mr-2" />
            Araç Durum Özeti
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-3xl font-bold ${getPuanColor(araçDurum.genelPuan).split(' ')[0]}`}>
                {araçDurum.genelPuan}
              </div>
              <div className="text-sm text-gray-500 mt-1">Genel Puan</div>
              <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${getPuanColor(araçDurum.genelPuan)}`}>
                {getPuanLabel(araçDurum.genelPuan)}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-3xl font-bold ${getPuanColor(araçDurum.boyaPuan || 0).split(' ')[0]}`}>
                {araçDurum.boyaPuan || '-'}
              </div>
              <div className="text-sm text-gray-500 mt-1">Boya Puanı</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-3xl font-bold ${getPuanColor(araçDurum.kaportaPuan || 0).split(' ')[0]}`}>
                {araçDurum.kaportaPuan || '-'}
              </div>
              <div className="text-sm text-gray-500 mt-1">Kaporta Puanı</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-3xl font-bold ${getPuanColor(araçDurum.mekanikTahmin || 0).split(' ')[0]}`}>
                {araçDurum.mekanikTahmin || '-'}
              </div>
              <div className="text-sm text-gray-500 mt-1">Mekanik Tahmin</div>
            </div>
          </div>

          {araçDurum.durumAçıklaması && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">{araçDurum.durumAçıklaması}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Piyasa Analizi */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ArrowTrendingUpIcon className="w-5 h-5 text-indigo-500 mr-2" />
          Piyasa Analizi
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Ortalama Piyasa Fiyatı</div>
            <div className="text-xl font-bold text-gray-900">
              {(piyasaAnalizi.ortalamaFiyat || piyasaAnalizi.priceRange?.average || 0).toLocaleString('tr-TR')}₺
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Piyasa Trendi</div>
            <div className="text-lg font-semibold text-gray-900">
              {piyasaAnalizi.piyasaTrendi || piyasaAnalizi.marketTrend || 'Bilinmiyor'}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Talep Durumu</div>
            <div className="text-lg font-semibold text-gray-900">
              {piyasaAnalizi.talepDurumu || piyasaAnalizi.demandLevel || 'Bilinmiyor'}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Arz Durumu</div>
            <div className="text-lg font-semibold text-gray-900">
              {piyasaAnalizi.arzDurumu || piyasaAnalizi.supplyLevel || 'Bilinmiyor'}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg col-span-2">
            <div className="text-sm text-gray-500 mb-1">Tahmini Satış Süresi</div>
            <div className="text-lg font-semibold text-gray-900">
              {piyasaAnalizi.satışSüresiTahmini || '20-30 gün'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Satış/Alım Önerileri */}
      {öneriler && (öneriler.satışİçin || öneriler.alımİçin) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <LightBulbIcon className="w-5 h-5 text-yellow-500 mr-2" />
            Fiyat Önerileri
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Satış İçin */}
            {öneriler.satışİçin && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
                  Satış Fiyatı Önerisi
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700">Önerilen Fiyat:</span>
                    <span className="font-bold text-green-800">
                      {(öneriler.satışİçin.önerilenfiyat || öneriler.satışİçin.önerilen || 0).toLocaleString('tr-TR')}₺
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Minimum Fiyat:</span>
                    <span className="font-semibold text-green-700">
                      {(öneriler.satışİçin.minimumFiyat || öneriler.satışİçin.min || 0).toLocaleString('tr-TR')}₺
                    </span>
                  </div>
                  {öneriler.satışİçin.pazarlıkPayı && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Pazarlık Payı:</span>
                      <span className="font-semibold text-green-700">{öneriler.satışİçin.pazarlıkPayı}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Alım İçin */}
            {öneriler.alımİçin && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <ArrowTrendingDownIcon className="w-4 h-4 mr-2" />
                  Alım Fiyatı Önerisi
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Hedef Fiyat:</span>
                    <span className="font-bold text-blue-800">
                      {(öneriler.alımİçin.hedefFiyat || öneriler.alımİçin.hedef || 0).toLocaleString('tr-TR')}₺
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Maksimum Öde:</span>
                    <span className="font-semibold text-blue-700">
                      {(öneriler.alımİçin.maksimumÖde || öneriler.alımİçin.max || 0).toLocaleString('tr-TR')}₺
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* İyileştirme Önerileri */}
      {öneriler.iyileştirmeler && öneriler.iyileştirmeler.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <WrenchScrewdriverIcon className="w-5 h-5 text-orange-500 mr-2" />
            Değer Artırma Önerileri
          </h3>

          <div className="space-y-3">
            {öneriler.iyileştirmeler.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{item.işlem}</div>
                  <div className="text-sm text-gray-500">Maliyet: {item.maliyet?.toLocaleString('tr-TR')}₺</div>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-bold">+{item.değerArtışı?.toLocaleString('tr-TR')}₺</div>
                  <div className="text-xs text-gray-400">Tahmini Artış</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sonuç Özeti */}
      {data.sonuçÖzeti && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg p-6 text-white"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-emerald-400 mr-2" />
            Sonuç Özeti
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                {data.sonuçÖzeti.tahminiDeğer?.toLocaleString('tr-TR')}₺
              </div>
              <div className="text-gray-400">Tahmini Piyasa Değeri</div>
              <div className="mt-2 text-sm text-gray-300">
                Güven Seviyesi: %{data.sonuçÖzeti.güvenSeviyesi}
              </div>
            </div>
            
            <div>
              {data.sonuçÖzeti.değerlendirmeNotu && (
                <div className="mb-3">
                  <div className="text-sm text-gray-400 mb-1">Değerlendirme</div>
                  <div className="text-white">{data.sonuçÖzeti.değerlendirmeNotu}</div>
                </div>
              )}
              
              {data.sonuçÖzeti.önemliNotlar && data.sonuçÖzeti.önemliNotlar.length > 0 && (
                <div>
                  <div className="text-sm text-gray-400 mb-2">Önemli Notlar</div>
                  <ul className="space-y-1">
                    {data.sonuçÖzeti.önemliNotlar.map((not: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        {not}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
