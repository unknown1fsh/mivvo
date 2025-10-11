'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  QuestionMarkCircleIcon,
  RocketLaunchIcon,
  CreditCardIcon,
  ChartBarIcon,
  CameraIcon,
  WrenchIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { Tabs } from '@/components/ui'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('başlangıç')

  const categories = [
    { id: 'başlangıç', label: 'Başlangıç', icon: RocketLaunchIcon },
    { id: 'hizmetler', label: 'Hizmetler', icon: CameraIcon },
    { id: 'raporlar', label: 'Raporlar', icon: DocumentTextIcon },
    { id: 'hesap', label: 'Hesap', icon: UserCircleIcon },
    { id: 'sorun-giderme', label: 'Sorun Giderme', icon: WrenchIcon }
  ]

  const gettingStartedSteps = [
    {
      number: 1,
      title: 'Hesap Oluşturun',
      description: 'Mivvo Expertiz\'e kaydolarak başlayın',
      details: (
        <div className="space-y-4">
          <p>Hesap oluşturmak için şu adımları izleyin:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Ana sayfada <strong>"Kayıt Ol"</strong> butonuna tıklayın</li>
            <li>E-posta adresinizi ve güvenli bir şifre girin</li>
            <li>Ad, soyad ve telefon bilgilerinizi ekleyin</li>
            <li>Kullanım şartlarını ve gizlilik politikasını onaylayın</li>
            <li>E-posta adresinize gelen doğrulama linkine tıklayın</li>
          </ol>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-blue-800">
              <strong>İpucu:</strong> Güvenli bir şifre oluşturmak için en az 8 karakter kullanın ve büyük harf, küçük harf, rakam ve özel karakter içermeye dikkat edin.
            </p>
          </div>
        </div>
      )
    },
    {
      number: 2,
      title: 'Kredi Yükleyin',
      description: 'Analizler için kredi satın alın',
      details: (
        <div className="space-y-4">
          <p>Platform, kredi bazlı çalışır. Kredi yüklemek için:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Dashboard\'dan <strong>"Kredi Yükle"</strong> seçeneğine tıklayın</li>
            <li>Yüklemek istediğiniz kredi miktarını seçin</li>
            <li>Ödeme yöntemini belirleyin (Kredi kartı, banka kartı)</li>
            <li>Ödeme bilgilerinizi güvenli formda girin</li>
            <li>İşlemi onaylayın ve kredileriniz anında hesabınıza yüklensin</li>
          </ol>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-green-900 mb-2">Kredi Paketleri</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• 100₺ = 100 Kredi</li>
              <li>• 250₺ = 250 Kredi + %10 bonus</li>
              <li>• 500₺ = 500 Kredi + %20 bonus</li>
              <li>• 1000₺ = 1000 Kredi + %30 bonus</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      number: 3,
      title: 'Dashboard\'u Keşfedin',
      description: 'Platfor m özelliklerini tanıyın',
      details: (
        <div className="space-y-4">
          <p>Dashboard, tüm işlemlerinizi yönetebileceğiniz ana merkezdir:</p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">🏠 Ana Panel</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Kredi bakiyenizi görün</li>
                <li>• Son analizlerinizi inceleyin</li>
                <li>• Hızlı işlem kısayolları</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">📊 Raporlarım</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Tüm analizlerinizi listeleyin</li>
                <li>• Raporları görüntüleyin</li>
                <li>• PDF olarak indirin</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">🚗 Araçlarım</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Araç garajınızı yönetin</li>
                <li>• Geçmiş analizleri görün</li>
                <li>• Favorilere ekleyin</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">⚙️ Ayarlar</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Profil bilgilerini düzenleyin</li>
                <li>• Bildirim tercihlerini ayarlayın</li>
                <li>• Güvenlik ayarları</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ]

  const serviceGuides = [
    {
      icon: CameraIcon,
      title: 'Boya Analizi',
      price: '25₺',
      description: 'Araç boyasının durumu ve kalitesini analiz edin',
      steps: [
        'Aracın tüm yönlerinden (ön, yan, arka, üst) net fotoğraflar çekin',
        'Gün ışığında veya parlak ışıkta çekim yapın',
        'Dashboard\'dan "Boya Analizi" seçeneğini seçin',
        'Fotoğrafları sürükle-bırak ile yükleyin (min 4, max 12)',
        '"Analiz Başlat" butonuna tıklayın',
        '2-3 dakika içinde sonuçları alın'
      ],
      tips: [
        'Net ve odaklanmış fotoğraflar kullanın',
        'Her paneli (kapı, kaput, bagaj) ayrı ayrı çekin',
        'Kirli veya ıslak araç fotoğraflarından kaçının',
        'Açık fotoğraf bulunan yerlerde çekim yapın'
      ],
      expectedResults: [
        'Boya kalitesi değerlendirmesi',
        'Orijinal boya tespiti',
        'Boyalı panel belirleme',
        'Renk uyumu analizi',
        'Çizik ve kusur tespiti'
      ]
    },
    {
      icon: WrenchIcon,
      title: 'Hasar Değerlendirmesi',
      price: '35₺',
      description: 'Araç hasarlarını tespit edin ve değerlendirin',
      steps: [
        'Hasarlı bölgelerin yakın çekimlerini yapın',
        'Farklı açılardan fotoğraflar çekin',
        '"Hasar Değerlendirmesi" hizmetini seçin',
        'Fotoğrafları yükleyin (min 3, max 15)',
        'Hasar türünü belirtin (isteğe bağlı)',
        'Analizi başlatın ve sonucu bekleyin'
      ],
      tips: [
        'Hasarın boyutunu gösterir nesne (kalem, bozuk para) koyun',
        'Işık yansımasından kaçının',
        'Mikro çizikleri yakından çekin',
        'Ezik bölgeleri farklı açılardan gösterin'
      ],
      expectedResults: [
        'Hasar türü belirleme (çarpma, çizik, ezik)',
        'Hasar şiddeti değerlendirmesi',
        'Tahmini onarım maliyeti',
        'Etkilenen parçaların listesi',
        'Öneri ve dikkat edilmesi gerekenler'
      ]
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Değer Tahmini',
      price: '20₺',
      description: 'Aracın piyasa değerini tahmin edin',
      steps: [
        'Araç bilgilerini girin (marka, model, yıl, km)',
        'Genel durumu değerlendirin',
        'Araç fotoğraflarını yükleyin',
        'Ek özellikler ve aksesuar bilgilerini ekleyin',
        '"Değer Hesapla" butonuna tıklayın',
        'Detaylı değer raporunu inceleyin'
      ],
      tips: [
        'Kilometre bilgisini doğru girin',
        'Ekipman ve aksesuar bilgilerini eksiksiz doldurun',
        'Aracın genel durumunu objektif değerlendirin',
        'Son bakım ve servis kayıtlarını hazır bulundurun'
      ],
      expectedResults: [
        'Piyasa değer tahmini',
        'Değer aralığı (min-max)',
        'Fiyat faktörleri analizi',
        'Benzer araçlarla karşılaştırma',
        'Satış stratejisi önerileri'
      ]
    },
    {
      icon: DocumentTextIcon,
      title: 'Tam Expertiz',
      price: '75₺',
      description: 'Kapsamlı araç expertiz raporu alın',
      steps: [
        '"Tam Expertiz" paketini seçin',
        'Araç bilgilerini detaylı doldurun',
        'Tüm yönlerden fotoğraflar yükleyin (min 10)',
        'Motor, iç mekan ve bagaj fotoğrafları ekleyin',
        'Varsa servis kayıtlarını ekleyin',
        'Kapsamlı analizi başlatın (5-7 dakika)',
        'Tüm raporları tek PDF\'te indirin'
      ],
      tips: [
        'Mümkün olduğunca çok fotoğraf ekleyin',
        'Motor kaputunu açık çekin',
        'İç mekan detaylarını gösterin',
        'Lastik, jant ve fren disklerini çekin',
        'VIN numarasını net çekin'
      ],
      expectedResults: [
        'Boya analizi raporu',
        'Hasar değerlendirme raporu',
        'Değer tahmini raporu',
        'Motor ses analizi (ses dosyası varsa)',
        'Genel durum özeti',
        'Satın alma/satış önerileri',
        'Dikkat edilmesi gereken noktalar'
      ]
    }
  ]

  const reportGuides = [
    {
      icon: DocumentTextIcon,
      title: 'Rapor Görüntüleme',
      content: (
        <div className="space-y-4">
          <p>Oluşturulan raporlarınızı görüntülemek için:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Dashboard\'dan <strong>"Raporlarım"</strong> sekmesine gidin</li>
            <li>Görmek istediğiniz raporu listeden seçin</li>
            <li>Rapor detay sayfası açılacaktır</li>
          </ol>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Rapor İçeriği</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Analiz Özeti:</strong> Genel değerlendirme ve ana bulgular</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Detaylı Bulgular:</strong> Panel bazında inceleme sonuçları</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Görsel İşaretlemeler:</strong> Sorunlu alanların görseller üzerinde işaretlenmesi</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Öneriler:</strong> Yapılması gereken işlemler ve dikkat edilmesi gerekenler</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      icon: DocumentTextIcon,
      title: 'PDF İndirme ve Paylaşma',
      content: (
        <div className="space-y-4">
          <p>Raporlarınızı PDF olarak indirebilir ve paylaşabilirsiniz:</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">PDF İndirme</h4>
            <ol className="list-decimal pl-6 space-y-1 text-sm text-blue-800">
              <li>Rapor sayfasında <strong>"PDF İndir"</strong> butonuna tıklayın</li>
              <li>Rapor otomatik olarak oluşturulur (birkaç saniye)</li>
              <li>PDF dosyası bilgisayarınıza indirilir</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Paylaşma Seçenekleri</h4>
            <ul className="space-y-1 text-sm text-green-800">
              <li>• <strong>Link ile Paylaş:</strong> Güvenli paylaşım linki oluşturun</li>
              <li>• <strong>E-posta Gönder:</strong> Doğrudan e-posta ile gönderin</li>
              <li>• <strong>WhatsApp:</strong> WhatsApp üzerinden paylaşın</li>
            </ul>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <p className="text-sm text-amber-800">
              <strong>Gizlilik:</strong> Paylaşım linkleri 30 gün geçerlidir ve istediğiniz zaman iptal edebilirsiniz.
            </p>
          </div>
        </div>
      )
    },
    {
      icon: ChartBarIcon,
      title: 'Rapor Geçmişi',
      content: (
        <div className="space-y-4">
          <p>Tüm eski raporlarınıza erişebilir ve yönetebilirsiniz:</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Filtreleme</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Tarih aralığına göre</li>
                <li>• Analiz türüne göre</li>
                <li>• Araç plakasına göre</li>
                <li>• Duruma göre (tamamlandı, beklemede)</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Yönetim</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Favorilere ekle</li>
                <li>• Not ekle</li>
                <li>• Raporu sil</li>
                <li>• Yeniden analiz et</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Saklama Süreleri</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Ücretsiz Hesap:</strong> 30 gün</li>
              <li>• <strong>Ücretli Kullanıcılar:</strong> 2 yıl</li>
              <li>• <strong>Premium Üyeler:</strong> Sınırsız</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  const accountGuides = [
    {
      icon: UserCircleIcon,
      title: 'Profil Güncelleme',
      content: (
        <div className="space-y-4">
          <p>Profil bilgilerinizi güncellemek için:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Sağ üst köşeden profil menüsüne tıklayın</li>
            <li><strong>"Profil"</strong> seçeneğini seçin</li>
            <li>Güncellemek istediğiniz bilgileri değiştirin</li>
            <li><strong>"Kaydet"</strong> butonuna tıklayın</li>
          </ol>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-blue-900 mb-2">Güncellenebilir Bilgiler</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Ad Soyad</li>
              <li>✓ Telefon numarası</li>
              <li>✓ Profil fotoğrafı</li>
              <li>✓ Adres bilgileri</li>
              <li>✗ E-posta adresi (Doğrulama gerektirir)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      icon: Cog6ToothIcon,
      title: 'Şifre Değiştirme',
      content: (
        <div className="space-y-4">
          <p>Güvenliğiniz için düzenli olarak şifrenizi değiştirmenizi öneririz:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Profil sayfasından <strong>"Güvenlik"</strong> sekmesine gidin</li>
            <li><strong>"Şifre Değiştir"</strong> butonuna tıklayın</li>
            <li>Mevcut şifrenizi girin</li>
            <li>Yeni şifrenizi iki kez girin</li>
            <li>Değişiklikleri kaydedin</li>
          </ol>
          
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <h4 className="font-semibold text-green-900 mb-2">Güvenli Şifre Oluşturma</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• En az 8 karakter uzunluğunda</li>
              <li>• Büyük ve küçük harf içermeli</li>
              <li>• En az bir rakam içermeli</li>
              <li>• Özel karakter (@, #, $, vb.) kullanın</li>
              <li>• Tahmin edilmesi kolay kelimelerden kaçının</li>
            </ul>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <p className="text-sm text-amber-800">
              <strong>Şifremi Unuttum:</strong> Giriş sayfasında "Şifremi Unuttum" linkine tıklayarak e-postanıza sıfırlama linki alabilirsiniz.
            </p>
          </div>
        </div>
      )
    },
    {
      icon: CreditCardIcon,
      title: 'Ödeme Yöntemleri',
      content: (
        <div className="space-y-4">
          <p>Kayıtlı ödeme yöntemlerinizi yönetebilirsiniz:</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Kart Ekleme</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Ayarlar → Ödeme Yöntemleri</li>
                <li>2. "Yeni Kart Ekle" butonuna tıklayın</li>
                <li>3. Kart bilgilerini girin</li>
                <li>4. Güvenli olarak kaydedin</li>
              </ol>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Otomatik Yükleme</h4>
              <p className="text-sm text-gray-600 mb-2">
                Kredi bakiyeniz belirli seviyenin altına düştüğünde otomatik yükleme yapabilirsiniz.
              </p>
              <p className="text-xs text-gray-500">
                İsterseniz her zaman iptal edebilirsiniz.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">🔒 Güvenlik</h4>
            <p className="text-sm text-blue-800">
              Tüm ödeme işlemleri PCI-DSS sertifikalı ödeme sağlayıcıları üzerinden 256-bit SSL şifreleme ile güvenli şekilde işlenir. Kart bilgileriniz sunucularımızda saklanmaz.
            </p>
          </div>
        </div>
      )
    }
  ]

  const troubleshootingGuides = [
    {
      question: 'Fotoğraf yüklenemiyor',
      answer: (
        <div className="space-y-3">
          <p>Fotoğraf yükleme sorunları için şunları deneyin:</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li><strong>Dosya boyutu:</strong> Maksimum 10 MB olmalı</li>
            <li><strong>Format:</strong> JPG, PNG, WEBP, HEIC desteklenir</li>
            <li><strong>İnternet bağlantısı:</strong> Stabil bağlantı olduğundan emin olun</li>
            <li><strong>Tarayıcı önbelleği:</strong> Önbelleği temizlemeyi deneyin</li>
            <li><strong>Farklı tarayıcı:</strong> Chrome veya Firefox deneyin</li>
          </ul>
        </div>
      )
    },
    {
      question: 'Analiz tamamlanmıyor',
      answer: (
        <div className="space-y-3">
          <p>Analiz uzun sürüyorsa:</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Normal süre: 2-5 dakika</li>
            <li>Yoğun saatlerde 5-10 dakikaya kadar uzayabilir</li>
            <li>15 dakikadan fazla sürüyorsa sayfayı yenileyin</li>
            <li>Sorun devam ederse destek ekibimize bildirin</li>
            <li>Kredileriniz otomatik olarak iade edilecektir</li>
          </ul>
        </div>
      )
    },
    {
      question: 'Raporu görüntüleyemiyorum',
      answer: (
        <div className="space-y-3">
          <p>Rapor görüntüleme sorunları:</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Rapor oluşturulması 1-2 dakika sürebilir</li>
            <li>Tarayıcınızın pop-up engelleyicisini kontrol edin</li>
            <li>JavaScript'in etkin olduğundan emin olun</li>
            <li>PDF indirme için farklı tarayıcı deneyin</li>
            <li>Raporun süresinin dolmadığından emin olun</li>
          </ul>
        </div>
      )
    },
    {
      question: 'Kredi yüklenmiyor',
      answer: (
        <div className="space-y-3">
          <p>Ödeme sorunları için:</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Kart bilgilerini doğru girdiğinizden emin olun</li>
            <li>Kartınızda yeterli bakiye olduğunu kontrol edin</li>
            <li>3D Secure doğrulamasını tamamlayın</li>
            <li>Farklı bir kart deneyin</li>
            <li>Bankanızla iletişime geçin (bazen banka bloklar)</li>
            <li>Sorun devam ederse: <a href="mailto:payment@mivvo.com" className="text-blue-600 underline">payment@mivvo.com</a></li>
          </ul>
        </div>
      )
    },
    {
      question: 'Hesaba giriş yapamıyorum',
      answer: (
        <div className="space-y-3">
          <p>Giriş sorunları için:</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>E-posta ve şifrenizi doğru girdiğinizden emin olun</li>
            <li>Caps Lock kapalı olmalı</li>
            <li>Şifrenizi unuttuysan "Şifremi Unuttum" kullanın</li>
            <li>E-posta doğrulamasını tamamladığınızdan emin olun</li>
            <li>Hesabınız askıya alınmış olabilir - destek ile iletişime geçin</li>
          </ul>
        </div>
      )
    }
  ]

  const tabsContent = [
    {
      id: 'başlangıç',
      label: 'Başlangıç Rehberi',
      content: (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mivvo Expertiz\'e Hoş Geldiniz!</h2>
            <p className="text-gray-600 mb-6">
              Platformumuzu kullanmaya başlamak için aşağıdaki adımları izleyin. Her adım detaylı açıklamalarla birlikte sunulmuştur.
            </p>
          </div>

          <div className="space-y-6">
            {gettingStartedSteps.map((step, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="card p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {step.details}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'hizmetler',
      label: 'Hizmet Kullanımı',
      content: (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hizmet Kullanım Kılavuzları</h2>
            <p className="text-gray-600 mb-6">
              Her hizmet için detaylı kullanım talimatları, ipuçları ve beklenen sonuçlar
            </p>
          </div>

          <div className="grid gap-6">
            {serviceGuides.map((service, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="card p-6">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                        <span className="text-lg font-bold text-blue-600">{service.price}</span>
                      </div>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                        Adım Adım
                      </h4>
                      <ol className="space-y-2">
                        {service.steps.map((step, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex">
                            <span className="font-semibold text-blue-600 mr-2">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <LightBulbIcon className="w-5 h-5 text-yellow-500 mr-2" />
                        İpuçları
                      </h4>
                      <ul className="space-y-2">
                        {service.tips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="text-yellow-500 mr-2">💡</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <ChartBarIcon className="w-5 h-5 text-purple-500 mr-2" />
                        Beklenen Sonuçlar
                      </h4>
                      <ul className="space-y-2">
                        {service.expectedResults.map((result, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'raporlar',
      label: 'Raporlar',
      content: (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rapor Yönetimi</h2>
            <p className="text-gray-600 mb-6">
              Raporlarınızı nasıl görüntüleyeceğinizi, indireceğinizi ve yöneteceğinizi öğrenin
            </p>
          </div>

          <div className="space-y-6">
            {reportGuides.map((guide, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="card p-6">
                  <div className="flex items-center mb-4">
                    <guide.icon className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">{guide.title}</h3>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    {guide.content}
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'hesap',
      label: 'Hesap Yönetimi',
      content: (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hesap ve Ayarlar</h2>
            <p className="text-gray-600 mb-6">
              Profil bilgilerinizi güncelleyin, güvenlik ayarlarını yönetin
            </p>
          </div>

          <div className="space-y-6">
            {accountGuides.map((guide, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="card p-6">
                  <div className="flex items-center mb-4">
                    <guide.icon className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">{guide.title}</h3>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    {guide.content}
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'sorun-giderme',
      label: 'Sorun Giderme',
      content: (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sık Karşılaşılan Sorunlar</h2>
            <p className="text-gray-600 mb-6">
              Yaygın sorunlar ve çözüm önerileri
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <div className="flex items-start">
              <ExclamationCircleIcon className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Sorun hala devam ediyor mu?</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Aşağıdaki çözümler işe yaramadıysa, destek ekibimizle iletişime geçin:
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="mailto:support@mivvo.com" className="text-sm text-blue-600 hover:underline font-medium">
                    support@mivvo.com
                  </a>
                  <Link href="/contact" className="text-sm text-blue-600 hover:underline font-medium">
                    İletişim Formu
                  </Link>
                  <span className="text-sm text-blue-800">
                    Canlı Destek: 09:00 - 18:00 (Hafta içi)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {troubleshootingGuides.map((item, index) => (
              <FadeInUp key={index} delay={index * 0.05}>
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <ExclamationCircleIcon className="w-5 h-5 text-orange-500 mr-2" />
                    {item.question}
                  </h3>
                  <div className="text-gray-600">
                    {item.answer}
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Mivvo Expertiz</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Ana Sayfa</Link>
              <Link href="/help" className="text-blue-600 font-medium">Yardım</Link>
              <Link href="/faq" className="text-gray-700 hover:text-blue-600 transition-colors">SSS</Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">İletişim</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Yardım Merkezi</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-6">
              <QuestionMarkCircleIcon className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Yardım Merkezi
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Mivvo Expertiz platformunu kullanırken ihtiyacınız olan tüm bilgiler burada
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Aradığınız konuyu yazın..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-2 border-transparent focus:border-blue-500 focus:outline-none text-gray-900"
                />
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <StaggerItem key={category.id}>
                <button
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full p-4 rounded-xl text-center transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <category.icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">{category.label}</p>
                </button>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs tabs={tabsContent} defaultTab={selectedCategory} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <QuestionMarkCircleIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Cevabını bulamadınız mı?
              </h2>
              <p className="text-gray-600 mb-6">
                Destek ekibimiz size yardımcı olmak için hazır
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="btn btn-primary btn-lg">
                  Bize Ulaşın
                </Link>
                <Link href="/faq" className="btn btn-secondary btn-lg">
                  SSS'yi İncele
                </Link>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Mivvo Expertiz</span>
              </div>
              <p className="text-gray-400 text-sm">
                Yapay zeka teknolojisi ile araç expertizi hizmetleri sunuyoruz.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Hizmetler</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/services" className="hover:text-white transition-colors">Boya Analizi</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Hasar Değerlendirmesi</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Değer Tahmini</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Tam Expertiz</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Şirket</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">Hakkımızda</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">İletişim</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Gizlilik</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Kullanım Şartları</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Destek</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/help" className="text-white font-medium">Yardım Merkezi</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">SSS</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Destek</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Mivvo Expertiz. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

