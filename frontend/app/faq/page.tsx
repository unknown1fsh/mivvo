'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  CameraIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { Accordion } from '@/components/ui'

interface FAQ {
  id: string
  question: string
  answer: string | JSX.Element
  category: string
  keywords: string[]
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [helpful, setHelpful] = useState<{ [key: string]: boolean | null }>({})

  const categories = [
    { id: 'all', label: 'Tümü', icon: QuestionMarkCircleIcon },
    { id: 'genel', label: 'Genel', icon: QuestionMarkCircleIcon },
    { id: 'hesap', label: 'Hesap & Üyelik', icon: UserGroupIcon },
    { id: 'kredi', label: 'Kredi & Ödeme', icon: CreditCardIcon },
    { id: 'hizmetler', label: 'Hizmetler', icon: CameraIcon },
    { id: 'teknik', label: 'Teknik', icon: Cog6ToothIcon },
    { id: 'guvenlik', label: 'Güvenlik', icon: ShieldCheckIcon }
  ]

  const faqs: FAQ[] = [
    // Genel Sorular
    {
      id: 'q1',
      category: 'genel',
      question: 'Mivvo Expertiz nedir?',
      keywords: ['nedir', 'hakkında', 'tanıtım', 'platform'],
      answer: (
        <div className="space-y-3">
          <p>
            Mivvo Expertiz, yapay zeka teknolojisi kullanarak araç görselleri üzerinden boya analizi, hasar tespiti, değer tahmini ve kapsamlı expertiz hizmeti sunan online bir platformdur.
          </p>
          <p>
            Geleneksel expertiz yöntemlerinin aksine, dakikalar içinde detaylı analiz sonuçları alabilir, profesyonel raporlar oluşturabilir ve aracınızın durumu hakkında kapsamlı bilgi edinebilirsiniz.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-blue-800">
              <strong>Temel Özellikler:</strong> AI destekli analiz, hızlı sonuçlar, profesyonel raporlar, 7/24 erişim
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'q2',
      category: 'genel',
      question: 'Nasıl çalışır?',
      keywords: ['nasıl', 'çalışma', 'kullanım', 'işleyiş'],
      answer: (
        <div className="space-y-3">
          <p>Mivvo Expertiz 4 basit adımda çalışır:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Hesap Oluşturun:</strong> Ücretsiz hesap açın ve giriş yapın</li>
            <li><strong>Kredi Yükleyin:</strong> Analiz için kredi satın alın</li>
            <li><strong>Fotoğraf Yükleyin:</strong> Aracınızın fotoğraflarını platforma yükleyin</li>
            <li><strong>Rapor Alın:</strong> 2-5 dakika içinde detaylı analiz raporunuzu görüntüleyin</li>
          </ol>
          <p className="text-sm text-gray-600">
            Yapay zeka modellerimiz, yüklediğiniz görselleri analiz ederek boya durumu, hasarlar ve değer tahmini hakkında detaylı bilgiler sunar.
          </p>
        </div>
      )
    },
    {
      id: 'q3',
      category: 'genel',
      question: 'Sonuçlar ne kadar güvenilir?',
      keywords: ['güvenilir', 'doğruluk', 'kesinlik', 'garanti'],
      answer: (
        <div className="space-y-3">
          <p>
            Yapay zeka modellerimiz, binlerce araç görseli üzerinde eğitilmiş olup yüksek doğruluk oranına sahiptir. Ancak, sonuçlar:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Güçlü Yönler
              </h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Görsel hasarların tespiti</li>
                <li>• Boya kalitesi değerlendirmesi</li>
                <li>• Pazar değeri analizi</li>
                <li>• Hızlı ve objektif değerlendirme</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
                <XCircleIcon className="w-5 h-5 mr-2" />
                Sınırlamalar
              </h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• İç mekanik sorunları tespit edemez</li>
                <li>• Profesyonel muayene gerektiren durumlar var</li>
                <li>• Fotoğraf kalitesine bağımlıdır</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Önemli:</strong> Sonuçlarımız bilgilendirme amaçlıdır. Kritik alım-satım kararları için profesyonel expertiz önerilir.
          </p>
        </div>
      )
    },
    {
      id: 'q4',
      category: 'genel',
      question: 'Hangi araç türlerini destekliyor?',
      keywords: ['araç', 'türü', 'desteklenen', 'marka', 'model'],
      answer: (
        <div className="space-y-3">
          <p>Platformumuz şu araç türlerini desteklemektedir:</p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 mb-2">✓ Desteklenen</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Otomobiller (sedan, hatchback, SUV)</li>
                <li>• Hafif ticari araçlar</li>
                <li>• Pick-up araçlar</li>
                <li>• Motosikletler (yakında)</li>
              </ul>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 mb-2">✗ Şu anda desteklenmeyen</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ağır vasıta (kamyon, TIR)</li>
                <li>• İş makineleri</li>
                <li>• Klasik/antika araçlar (özel paket)</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },

    // Hesap ve Üyelik
    {
      id: 'q5',
      category: 'hesap',
      question: 'Nasıl kayıt olurum?',
      keywords: ['kayıt', 'üyelik', 'hesap', 'açma'],
      answer: (
        <div className="space-y-3">
          <p>Kayıt olmak çok kolay:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Ana sayfada <strong>"Kayıt Ol"</strong> butonuna tıklayın</li>
            <li>E-posta, şifre, ad-soyad bilgilerinizi girin</li>
            <li>Kullanım şartlarını ve gizlilik politikasını onaylayın</li>
            <li>E-postanıza gelen doğrulama linkine tıklayın</li>
            <li>Hesabınız aktif oldu, giriş yapabilirsiniz!</li>
          </ol>
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-sm text-green-800">
              <strong>Bonus:</strong> Yeni üyelere 1 adet ücretsiz boya analizi hediye!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'q6',
      category: 'hesap',
      question: 'Üyelik olmadan kullanabilir miyim?',
      keywords: ['üyeliksiz', 'misafir', 'giriş', 'zorunlu'],
      answer: (
        <div className="space-y-3">
          <p>
            Hayır, platformumuzdan yararlanmak için üyelik gereklidir. Bunun nedenleri:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Raporlarınızı güvenli şekilde saklamak</li>
            <li>Analiz geçmişinizi takip edebilmek</li>
            <li>Kredi sistemi ve ödeme güvenliği</li>
            <li>Kişiselleştirilmiş deneyim sunmak</li>
          </ul>
          <p className="text-sm text-gray-600">
            Üyelik ücretsizdir ve sadece birkaç dakika sürer.
          </p>
        </div>
      )
    },
    {
      id: 'q7',
      category: 'hesap',
      question: 'Şifremi unuttum, ne yapmalıyım?',
      keywords: ['şifre', 'unutma', 'sıfırlama', 'değiştirme'],
      answer: (
        <div className="space-y-3">
          <p>Şifre sıfırlama işlemi:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Giriş sayfasında <strong>"Şifremi Unuttum"</strong> linkine tıklayın</li>
            <li>Kayıtlı e-posta adresinizi girin</li>
            <li>E-postanıza gelen sıfırlama linkine tıklayın (5 dakika içinde)</li>
            <li>Yeni şifrenizi belirleyin</li>
            <li>Yeni şifrenizle giriş yapın</li>
          </ol>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <p className="text-sm text-amber-800">
              <strong>Not:</strong> E-posta gelmiyorsa spam/gereksiz klasörünü kontrol edin. Sorun devam ederse destek ekibimize yazın.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'q8',
      category: 'hesap',
      question: 'Hesabımı nasıl silerim?',
      keywords: ['hesap', 'silme', 'kapatma', 'iptal'],
      answer: (
        <div className="space-y-3">
          <p>Hesabınızı kalıcı olarak silmek için:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Ayarlar → Hesap Yönetimi'ne gidin</li>
            <li>Sayfanın altında <strong>"Hesabı Kapat"</strong> butonuna tıklayın</li>
            <li>Silme nedenini belirtin (isteğe bağlı)</li>
            <li>Şifrenizi girin ve onaylayın</li>
          </ol>
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-800 mb-2">
              <strong>⚠️ Dikkat:</strong> Bu işlem geri alınamaz!
            </p>
            <ul className="text-xs text-red-700 space-y-1">
              <li>• Tüm raporlarınız silinecek</li>
              <li>• Kullanılmamış kredileriniz iade edilecek (14 gün içinde)</li>
              <li>• Kişisel verileriniz KVKK'ya uygun olarak silinecek</li>
            </ul>
          </div>
        </div>
      )
    },

    // Kredi ve Ödeme
    {
      id: 'q9',
      category: 'kredi',
      question: 'Kredi sistemi nasıl çalışır?',
      keywords: ['kredi', 'sistem', 'nasıl', 'çalışma'],
      answer: (
        <div className="space-y-3">
          <p>
            Platformumuz kredi bazlı çalışır. Her analiz belirli miktarda kredi tüketir:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hizmet</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kredi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr><td className="px-4 py-2 text-sm">Boya Analizi</td><td className="px-4 py-2 text-sm font-semibold">25₺</td></tr>
                <tr><td className="px-4 py-2 text-sm">Hasar Değerlendirmesi</td><td className="px-4 py-2 text-sm font-semibold">35₺</td></tr>
                <tr><td className="px-4 py-2 text-sm">Değer Tahmini</td><td className="px-4 py-2 text-sm font-semibold">20₺</td></tr>
                <tr><td className="px-4 py-2 text-sm">Motor Ses Analizi</td><td className="px-4 py-2 text-sm font-semibold">30₺</td></tr>
                <tr className="bg-blue-50"><td className="px-4 py-2 text-sm font-semibold">Tam Expertiz</td><td className="px-4 py-2 text-sm font-semibold text-blue-600">75₺</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-600">
            Krediler geçerlilik süresi yoktur ve hesabınız aktif olduğu sürece kullanılabilir.
          </p>
        </div>
      )
    },
    {
      id: 'q10',
      category: 'kredi',
      question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
      keywords: ['ödeme', 'yöntem', 'kart', 'banka'],
      answer: (
        <div className="space-y-3">
          <p>Aşağıdaki ödeme yöntemlerini kabul ediyoruz:</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <CreditCardIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-900 mb-1">Kredi Kartı</h4>
              <p className="text-xs text-blue-700">Visa, Mastercard, Troy</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CreditCardIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-900 mb-1">Banka Kartı</h4>
              <p className="text-xs text-green-700">Tüm banka kartları</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <CreditCardIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-900 mb-1">Havale/EFT</h4>
              <p className="text-xs text-purple-700">Banka havalesi</p>
            </div>
          </div>
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-sm text-green-800">
              <strong>Güvenlik:</strong> Tüm ödemeler PCI-DSS sertifikalı ödeme sağlayıcıları üzerinden SSL ile şifrelenir.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'q11',
      category: 'kredi',
      question: 'Kredi iade politikası nedir?',
      keywords: ['iade', 'para', 'geri', 'ödeme'],
      answer: (
        <div className="space-y-3">
          <p>İade politikamız şu şekildedir:</p>
          <div className="space-y-3">
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h4 className="font-semibold text-green-900 mb-2">✓ İade Edilir</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Satın alma sonrası 14 gün içinde kullanılmamış krediler (tam iade)</li>
                <li>• Teknik hata nedeniyle tüketilen krediler (otomatik iade)</li>
                <li>• Tamamlanamayan analizler (otomatik iade)</li>
              </ul>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h4 className="font-semibold text-red-900 mb-2">✗ İade Edilmez</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Tamamlanmış ve rapor alınmış analizler</li>
                <li>• 14 gün sonra kullanılmamış krediler</li>
                <li>• Promosyon ve hediye krediler</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            İade talepleri için: <a href="mailto:refund@mivvo.com" className="text-blue-600 underline">refund@mivvo.com</a>
          </p>
        </div>
      )
    },
    {
      id: 'q12',
      category: 'kredi',
      question: 'Fatura alabilir miyim?',
      keywords: ['fatura', 'kurumsal', 'vergi'],
      answer: (
        <div className="space-y-3">
          <p>
            Evet, tüm ödemeler için otomatik olarak e-fatura düzenlenir ve kayıtlı e-posta adresinize gönderilir.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Bireysel Fatura</h4>
              <p className="text-sm text-blue-800">
                Otomatik olarak düzenlenir ve e-posta ile gönderilir.
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Kurumsal Fatura</h4>
              <p className="text-sm text-purple-800 mb-2">
                Şirket unvanı ve vergi bilgilerinizi profil ayarlarından ekleyin.
              </p>
              <p className="text-xs text-purple-700">
                İletişim: <a href="mailto:invoice@mivvo.com" className="underline">invoice@mivvo.com</a>
              </p>
            </div>
          </div>
        </div>
      )
    },

    // Hizmetler
    {
      id: 'q13',
      category: 'hizmetler',
      question: 'Analiz ne kadar sürer?',
      keywords: ['süre', 'zaman', 'hız', 'ne kadar'],
      answer: (
        <div className="space-y-3">
          <p>Analiz süreleri hizmet türüne göre değişir:</p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
              <span><strong>Boya Analizi:</strong> 2-3 dakika</span>
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
              <span><strong>Hasar Değerlendirmesi:</strong> 3-4 dakika</span>
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
              <span><strong>Değer Tahmini:</strong> 2 dakika</span>
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
              <span><strong>Tam Expertiz:</strong> 5-7 dakika</span>
            </li>
          </ul>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <p className="text-sm text-amber-800">
              <strong>Not:</strong> Yoğun saatlerde süre 2-3 dakika uzayabilir. 15 dakikayı geçerse lütfen destek ekibimize bildirin.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'q14',
      category: 'hizmetler',
      question: 'Birden fazla araç ekleyebilir miyim?',
      keywords: ['araç', 'garaj', 'birden', 'fazla'],
      answer: (
        <div className="space-y-3">
          <p>
            Evet, "Araç Garajım" özelliği ile sınırsız sayıda araç ekleyebilir ve yönetebilirsiniz.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Araç Garajı Özellikleri:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Sınırsız araç ekleme</li>
              <li>✓ Her araç için ayrı analiz geçmişi</li>
              <li>✓ Favorilere ekleme</li>
              <li>✓ Not ve etiket ekleme</li>
              <li>✓ Karşılaştırma yapma</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'q15',
      category: 'hizmetler',
      question: 'Raporlar ne kadar süre saklanır?',
      keywords: ['rapor', 'saklama', 'süre', 'silme'],
      answer: (
        <div className="space-y-3">
          <p>Rapor saklama süreleri üyelik tipinize göre değişir:</p>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Ücretsiz Hesap</h4>
              <p className="text-sm text-gray-600">30 gün saklama</p>
            </div>
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h4 className="font-semibold text-blue-900 mb-2">Ücretli Kullanıcılar</h4>
              <p className="text-sm text-blue-800">2 yıl saklama</p>
            </div>
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <h4 className="font-semibold text-purple-900 mb-2">Premium Üyeler</h4>
              <p className="text-sm text-purple-800">Sınırsız saklama</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Süre dolmadan önce raporlarınızı PDF olarak indirip saklayabilirsiniz.
          </p>
        </div>
      )
    },

    // Teknik Sorular
    {
      id: 'q16',
      category: 'teknik',
      question: 'Hangi resim formatlarını kabul ediyorsunuz?',
      keywords: ['format', 'resim', 'fotoğraf', 'dosya'],
      answer: (
        <div className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">✓ Desteklenen Formatlar</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• JPG / JPEG</li>
                <li>• PNG</li>
                <li>• WEBP</li>
                <li>• HEIC (iOS)</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📏 Özellikler</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Maksimum boyut: 10 MB</li>
                <li>• Minimum çözünürlük: 800x600</li>
                <li>• Önerilen: 1920x1080+</li>
              </ul>
            </div>
          </div>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <p className="text-sm text-amber-800">
              <strong>İpucu:</strong> En iyi sonuçlar için yüksek çözünürlüklü, net ve gün ışığında çekilmiş fotoğraflar kullanın.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'q17',
      category: 'teknik',
      question: 'Mobil uygulama var mı?',
      keywords: ['mobil', 'uygulama', 'app', 'android', 'ios'],
      answer: (
        <div className="space-y-3">
          <p>
            Şu anda native mobil uygulamamız bulunmuyor, ancak web platformumuz tamamen mobil uyumludur ve tüm cihazlardan kullanılabilir.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📱 Mobil Tarayıcıdan Kullanım</h4>
            <p className="text-sm text-blue-800 mb-3">
              Telefonunuzun tarayıcısından <strong>mivvo.com</strong> adresine girerek tüm özelliklere erişebilirsiniz:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Responsive tasarım</li>
              <li>✓ Doğrudan kameradan fotoğraf çekme</li>
              <li>✓ Push bildirimler</li>
              <li>✓ Ana ekrana ekle özelliği</li>
            </ul>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <strong>Yakında:</strong> iOS ve Android için native uygulamalar geliştirme aşamasında! Bildirim almak için e-bültenimize abone olun.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'q18',
      category: 'teknik',
      question: 'API hizmeti sunuyor musunuz?',
      keywords: ['api', 'entegrasyon', 'geliştirici', 'developer'],
      answer: (
        <div className="space-y-3">
          <p>
            Evet, profesyonel ve kurumsal müşterilerimiz için RESTful API hizmeti sunuyoruz.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">API Özellikleri</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• RESTful JSON API</li>
              <li>• Webhook desteği</li>
              <li>• Detaylı dokümantasyon</li>
              <li>• SDK'lar (JavaScript, Python, PHP)</li>
              <li>• Rate limiting: 1000 istek/saat</li>
            </ul>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>API Erişimi:</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Profesyonel Plan: Dahil</li>
              <li>• Kurumsal Plan: Dahil + Özel limitle r</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              Detaylı bilgi için: <a href="mailto:api@mivvo.com" className="text-blue-600 underline">api@mivvo.com</a>
            </p>
          </div>
        </div>
      )
    },

    // Güvenlik ve Gizlilik
    {
      id: 'q19',
      category: 'guvenlik',
      question: 'Verilerim güvende mi?',
      keywords: ['güvenlik', 'veri', 'koruma', 'gizlilik'],
      answer: (
        <div className="space-y-3">
          <p>
            Evet, verilerinizin güvenliği en önemli önceliğimizdir. Sektörün en yüksek güvenlik standartlarını uyguluyoruz:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">🔒 Teknik Güvenlik</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• 256-bit SSL/TLS şifreleme</li>
                <li>• Bcrypt şifre hashleme</li>
                <li>• DDoS koruması</li>
                <li>• Düzenli güvenlik testleri</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📜 Uyumluluk</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• KVKK uyumlu</li>
                <li>• GDPR uyumlu</li>
                <li>• ISO 27001 (süreçte)</li>
                <li>• PCI-DSS (ödeme)</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Detaylı bilgi için <Link href="/privacy" className="text-blue-600 underline">Gizlilik Politikamızı</Link> inceleyebilirsiniz.
          </p>
        </div>
      )
    },
    {
      id: 'q20',
      category: 'guvenlik',
      question: 'Resimlerim ne kadar süre saklanır?',
      keywords: ['resim', 'saklama', 'silme', 'süre'],
      answer: (
        <div className="space-y-3">
          <p>Yüklediğiniz araç görselleri:</p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Analiz tamamlandıktan sonra <strong>30 gün</strong> boyunca saklanır</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>30 gün sonunda otomatik olarak güvenli şekilde silinir</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>İsterseniz istediğiniz zaman manuel olarak silebilirsiniz</span>
            </li>
          </ul>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-blue-800">
              <strong>Önemli:</strong> Görseller yalnızca analiz amacıyla kullanılır ve üçüncü taraflarla (AI sağlayıcıları hariç) paylaşılmaz.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'q21',
      category: 'guvenlik',
      question: 'Verilerimi silebilir miyim?',
      keywords: ['veri', 'silme', 'kaldırma', 'haklar'],
      answer: (
        <div className="space-y-3">
          <p>
            Evet, KVKK ve GDPR kapsamında verileriniz üzerinde tam kontrole sahipsiniz:
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Manuel Silme</h4>
              <p className="text-sm text-blue-800 mb-2">Ayarlar → Gizlilik → Veri Yönetimi üzerinden:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Tek tek görselleri sil</li>
                <li>• Raporları sil</li>
                <li>• Analiz geçmişini temizle</li>
              </ul>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Tam Veri Silme Talebi</h4>
              <p className="text-sm text-purple-800">
                Tüm verilerinizin silinmesini talep edebilirsiniz. Talebiniz 30 gün içinde işleme alınır.
              </p>
              <p className="text-xs text-purple-700 mt-2">
                <a href="mailto:privacy@mivvo.com" className="underline">privacy@mivvo.com</a>
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            * Yasal saklama yükümlülüğü bulunan veriler (ödeme kayıtları vb.) ilgili süre sonunda silinir.
          </p>
        </div>
      )
    },
    {
      id: 'q22',
      category: 'guvenlik',
      question: 'KVKK\'ya uyumlu musunuz?',
      keywords: ['kvkk', 'gdpr', 'uyumluluk', 'yasal'],
      answer: (
        <div className="space-y-3">
          <p>
            Evet, platformumuz 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve GDPR\'a tam uyumludur.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">✓ Kullanıcı Hakları</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Bilgi talep etme</li>
                <li>• Düzeltme hakkı</li>
                <li>• Silme hakkı</li>
                <li>• İtiraz hakkı</li>
                <li>• Veri taşınabilirliği</li>
                <li>• Şikayet hakkı</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Belgeler</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li><Link href="/privacy" className="underline">Gizlilik Politikası</Link></li>
                <li><Link href="/terms" className="underline">Kullanım Şartları</Link></li>
                <li>KVK Aydınlatma Metni</li>
                <li>Çerez Politikası</li>
              </ul>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Veri Sorumlusu:</strong> Mivvo Teknoloji A.Ş.<br />
              <strong>İletişim:</strong> <a href="mailto:privacy@mivvo.com" className="text-blue-600 underline">privacy@mivvo.com</a>
            </p>
          </div>
        </div>
      )
    }
  ]

  const filteredFAQs = useMemo(() => {
    let filtered = faqs

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        (typeof faq.answer === 'string' && faq.answer.toLowerCase().includes(query)) ||
        faq.keywords.some(keyword => keyword.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [searchQuery, selectedCategory, faqs])

  const handleFeedback = (faqId: string, isHelpful: boolean) => {
    setHelpful(prev => ({ ...prev, [faqId]: isHelpful }))
    // Here you would typically send this to your analytics/backend
  }

  const relatedFAQs = (currentFaqId: string) => {
    const currentFaq = faqs.find(f => f.id === currentFaqId)
    if (!currentFaq) return []
    
    return faqs
      .filter(f => f.id !== currentFaqId && f.category === currentFaq.category)
      .slice(0, 3)
  }

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
              <Link href="/help" className="text-gray-700 hover:text-blue-600 transition-colors">Yardım</Link>
              <Link href="/faq" className="text-blue-600 font-medium">SSS</Link>
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
            <span className="text-gray-900 font-medium">Sık Sorulan Sorular</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
              <QuestionMarkCircleIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Sık Sorulan Sorular
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Merak ettiğiniz her şeyin cevabı burada
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Soru arayın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-900"
              />
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-5 h-5 mr-2" />
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <FadeInUp key={faq.id} delay={index * 0.05}>
                  <div className="bg-white rounded-lg shadow-sm">
                    <Accordion title={faq.question}>
                      <div className="prose prose-sm max-w-none mb-4">
                        {faq.answer}
                      </div>

                      {/* Feedback */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">Bu yanıt yardımcı oldu mu?</p>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleFeedback(faq.id, true)}
                              className={`p-2 rounded-lg transition-colors ${
                                helpful[faq.id] === true
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                              }`}
                            >
                              <HandThumbUpIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleFeedback(faq.id, false)}
                              className={`p-2 rounded-lg transition-colors ${
                                helpful[faq.id] === false
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                              }`}
                            >
                              <HandThumbDownIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Related Questions */}
                        {relatedFAQs(faq.id).length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-2">İlgili Sorular:</p>
                            <ul className="space-y-1">
                              {relatedFAQs(faq.id).map((related) => (
                                <li key={related.id}>
                                  <button
                                    onClick={() => {
                                      const element = document.getElementById(`faq-${related.id}`)
                                      element?.scrollIntoView({ behavior: 'smooth' })
                                    }}
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    → {related.question}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </Accordion>
                  </div>
                </FadeInUp>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <QuestionMarkCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sonuç bulunamadı</h3>
              <p className="text-gray-600 mb-6">
                Aradığınız kriterlere uygun soru bulunamadı. Farklı bir arama deneyin veya tüm soruları görüntüleyin.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="btn btn-primary"
              >
                Tüm Soruları Göster
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StaggerItem>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{faqs.length}</div>
                <p className="text-sm text-gray-600">Toplam Soru</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
                <p className="text-sm text-gray-600">Çözüm Oranı</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">&lt;2dk</div>
                <p className="text-sm text-gray-600">Ort. Cevap Süresi</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                <p className="text-sm text-gray-600">Destek</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-center text-white">
              <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                Cevabını bulamadınız mı?
              </h2>
              <p className="text-blue-100 mb-6">
                Destek ekibimiz size yardımcı olmak için 7/24 hazır
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="btn btn-secondary btn-lg">
                  Destek Ekibiyle İletişime Geç
                </Link>
                <Link href="/help" className="btn btn-ghost btn-lg text-white hover:bg-white/20 border border-white/30">
                  Yardım Merkezini İncele
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
                <li><Link href="/help" className="hover:text-white transition-colors">Yardım Merkezi</Link></li>
                <li><Link href="/faq" className="text-white font-medium">SSS</Link></li>
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

