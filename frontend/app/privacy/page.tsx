'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserIcon,
  LockClosedIcon,
  ClockIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PrinterIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { Accordion } from '@/components/ui'

export default function PrivacyPage() {
  const lastUpdated = '11 Ekim 2024'

  const handlePrint = () => {
    window.print()
  }

  const sections = [
    {
      icon: DocumentTextIcon,
      title: '1. Genel Bilgiler ve Veri Sorumlusu',
      content: (
        <>
          <p className="mb-4">
            Mivvo Expertiz (&ldquo;Biz&rdquo;, &ldquo;Bizim&rdquo;, &ldquo;Platform&rdquo;), kullanıcılarımızın (&ldquo;Siz&rdquo;, &ldquo;Kullanıcı&rdquo;) gizliliğine önem verir ve kişisel verilerinizi 6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (&ldquo;GDPR&rdquo;) kapsamında korumayı taahhüt eder.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">Veri Sorumlusu</h4>
            <p className="text-blue-800 text-sm">
              <strong>Şirket Adı:</strong> Mivvo Teknoloji A.Ş.<br />
              <strong>Adres:</strong> [Şirket Adresi]<br />
              <strong>E-posta:</strong> privacy@mivvo.com<br />
              <strong>KEP Adresi:</strong> mivvo@hs03.kep.tr
            </p>
          </div>
          <p>
            Bu gizlilik politikası, platformumuzda toplanan, işlenen ve saklanan kişisel verilerinizin kullanımı hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.
          </p>
        </>
      )
    },
    {
      icon: UserIcon,
      title: '2. Toplanan Kişisel Veriler',
      content: (
        <>
          <p className="mb-4">Platformumuz aracılığıyla aşağıdaki kişisel veriler toplanmaktadır:</p>
          
          <h4 className="font-semibold text-gray-900 mb-3 mt-6">2.1. Kimlik ve İletişim Bilgileri</h4>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Ad, soyad</li>
            <li>E-posta adresi</li>
            <li>Telefon numarası</li>
            <li>TC Kimlik Numarası (isteğe bağlı, fatura için)</li>
          </ul>

          <h4 className="font-semibold text-gray-900 mb-3 mt-6">2.2. Araç ve Analiz Verileri</h4>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Yüklenen araç fotoğrafları ve görselleri</li>
            <li>Araç plakası (isteğe bağlı)</li>
            <li>Araç markası, modeli, yılı</li>
            <li>Yapay zeka analiz sonuçları</li>
            <li>Expertiz raporları ve değerlendirmeler</li>
          </ul>

          <h4 className="font-semibold text-gray-900 mb-3 mt-6">2.3. Hesap ve İşlem Bilgileri</h4>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Kullanıcı adı ve şifre (şifrelenmiş)</li>
            <li>Kredi bakiyesi ve işlem geçmişi</li>
            <li>Ödeme bilgileri (üçüncü taraf ödeme sağlayıcıları üzerinden)</li>
            <li>Platform kullanım geçmişi</li>
          </ul>

          <h4 className="font-semibold text-gray-900 mb-3 mt-6">2.4. Teknik Veriler</h4>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>IP adresi</li>
            <li>Tarayıcı türü ve versiyonu</li>
            <li>Cihaz bilgileri</li>
            <li>Konum bilgisi (izninizle)</li>
            <li>Çerez verileri</li>
          </ul>
        </>
      )
    },
    {
      icon: GlobeAltIcon,
      title: '3. Verilerin Kullanım Amaçları',
      content: (
        <>
          <p className="mb-4">Toplanan kişisel verileriniz aşağıdaki amaçlarla kullanılmaktadır:</p>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🎯 Hizmet Sunumu</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Yapay zeka destekli araç analizi ve expertiz hizmetlerinin sağlanması</li>
                <li>Analiz sonuçlarının ve raporların oluşturulması</li>
                <li>Kullanıcı hesabınızın yönetimi</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">💳 Ödeme İşlemleri</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Kredi yükleme ve ödeme işlemlerinin gerçekleştirilmesi</li>
                <li>Fatura ve mali belgelerin düzenlenmesi</li>
                <li>İşlem geçmişinin kayıt altına alınması</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">📞 İletişim ve Destek</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Müşteri destek hizmetlerinin sağlanması</li>
                <li>Bildirim ve güncellemelerin iletilmesi</li>
                <li>Kullanıcı geri bildirimlerinin alınması</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🔒 Güvenlik ve Yasal Yükümlülükler</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Platform güvenliğinin sağlanması</li>
                <li>Dolandırıcılık önleme ve tespit</li>
                <li>Yasal düzenlemelere uyum</li>
                <li>Hukuki süreçlerin yürütülmesi</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">📊 Analiz ve Geliştirme</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Platform performansının izlenmesi ve iyileştirilmesi</li>
                <li>Yapay zeka modellerinin geliştirilmesi (anonimleştirilmiş verilerle)</li>
                <li>Kullanıcı deneyiminin optimize edilmesi</li>
              </ul>
            </div>
          </div>
        </>
      )
    },
    {
      icon: LockClosedIcon,
      title: '4. Veri Güvenliği',
      content: (
        <>
          <p className="mb-4">
            Kişisel verilerinizin güvenliğini en üst düzeyde sağlamak için aşağıdaki teknik ve idari tedbirleri almaktayız:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-2" />
                Teknik Güvenlik
              </h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>SSL/TLS şifreleme (256-bit)</li>
                <li>Güvenli veri aktarımı (HTTPS)</li>
                <li>Şifre hashleme (bcrypt)</li>
                <li>Düzenli güvenlik testleri</li>
                <li>Güvenlik duvarı koruması</li>
                <li>DDoS saldırı önleme</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <LockClosedIcon className="w-5 h-5 text-blue-500 mr-2" />
                İdari Güvenlik
              </h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Sınırlı erişim yetkilendirmesi</li>
                <li>Çalışan gizlilik sözleşmeleri</li>
                <li>Düzenli güvenlik eğitimleri</li>
                <li>Veri işleme prosedürleri</li>
                <li>Olay müdahale planları</li>
                <li>Düzenli denetimler</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <p className="text-amber-800 text-sm">
              <strong>Önemli Not:</strong> Hiçbir internet tabanlı sistem %100 güvenli değildir. Ancak, verilerinizi korumak için sektördeki en iyi uygulamaları takip ediyoruz ve güvenlik önlemlerimizi sürekli güncel tutuyoruz.
            </p>
          </div>
        </>
      )
    },
    {
      icon: ClockIcon,
      title: '5. Veri Saklama Süreleri',
      content: (
        <>
          <p className="mb-4">
            Kişisel verileriniz, işlendikleri amaç için gerekli olan süre boyunca ve yasal saklama yükümlülüklerine uygun olarak saklanmaktadır:
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Veri Türü</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saklama Süresi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yasal Dayanak</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm">Hesap Bilgileri</td>
                  <td className="px-4 py-3 text-sm">Hesap aktif olduğu sürece</td>
                  <td className="px-4 py-3 text-sm">Hizmet sözleşmesi</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Araç Fotoğrafları</td>
                  <td className="px-4 py-3 text-sm">30 gün (analiz sonrası)</td>
                  <td className="px-4 py-3 text-sm">Hizmet gerekliliği</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Analiz Raporları</td>
                  <td className="px-4 py-3 text-sm">2 yıl</td>
                  <td className="px-4 py-3 text-sm">İspat yükümlülüğü</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Ödeme Kayıtları</td>
                  <td className="px-4 py-3 text-sm">10 yıl</td>
                  <td className="px-4 py-3 text-sm">Vergi Usul Kanunu</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">İletişim Kayıtları</td>
                  <td className="px-4 py-3 text-sm">3 yıl</td>
                  <td className="px-4 py-3 text-sm">Borçlar Kanunu</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Log Kayıtları</td>
                  <td className="px-4 py-3 text-sm">1 yıl</td>
                  <td className="px-4 py-3 text-sm">Güvenlik gerekliliği</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Saklama süreleri sonunda verileriniz güvenli bir şekilde silinir veya anonimleştirilir.
          </p>
        </>
      )
    },
    {
      icon: ShieldCheckIcon,
      title: '6. Kullanıcı Hakları (KVKK/GDPR)',
      content: (
        <>
          <p className="mb-4">
            KVKK ve GDPR kapsamında aşağıdaki haklara sahipsiniz:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-2">✅ Bilgi Talep Etme Hakkı</h4>
              <p className="text-sm text-gray-600">
                Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işleniyorsa bunlar hakkında bilgi talep etme hakkınız vardır.
              </p>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-2">📝 Düzeltme Hakkı</h4>
              <p className="text-sm text-gray-600">
                Eksik veya yanlış işlenmiş kişisel verilerinizin düzeltilmesini talep edebilirsiniz.
              </p>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-2">🗑️ Silme Hakkı</h4>
              <p className="text-sm text-gray-600">
                Yasal saklama yükümlülüğü olmadığı durumlarda verilerinizin silinmesini talep edebilirsiniz.
              </p>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-2">🚫 İtiraz Hakkı</h4>
              <p className="text-sm text-gray-600">
                Kişisel verilerinizin işlenmesine itiraz etme ve işlemenin durdurulmasını talep etme hakkınız vardır.
              </p>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-2">📤 Veri Taşınabilirliği</h4>
              <p className="text-sm text-gray-600">
                Verilerinizi yapılandırılmış ve yaygın kullanılan bir formatta talep edebilirsiniz.
              </p>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-2">⚖️ Şikayet Hakkı</h4>
              <p className="text-sm text-gray-600">
                Kişisel Verileri Koruma Kurumu&apos;na şikayette bulunma hakkınız vardır.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Haklarınızı Nasıl Kullanabilirsiniz?</h4>
            <p className="text-sm text-blue-800 mb-3">
              Yukarıdaki haklarınızı kullanmak için aşağıdaki yöntemlerle başvuruda bulunabilirsiniz:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-blue-800">
              <li>E-posta: <a href="mailto:privacy@mivvo.com" className="underline">privacy@mivvo.com</a></li>
              <li>KEP: mivvo@hs03.kep.tr</li>
              <li>Platform içi: Ayarlar → Gizlilik → Veri Talebi</li>
              <li>Posta: [Şirket Adresi]</li>
            </ul>
            <p className="text-xs text-blue-700 mt-3">
              Başvurularınız en geç 30 gün içinde yanıtlanacaktır.
            </p>
          </div>
        </>
      )
    },
    {
      icon: GlobeAltIcon,
      title: '7. Çerezler ve İzleme Teknolojileri',
      content: (
        <>
          <p className="mb-4">
            Platformumuz, kullanıcı deneyimini iyileştirmek ve hizmetlerimizi optimize etmek için çerezler ve benzer teknolojiler kullanmaktadır.
          </p>

          <h4 className="font-semibold text-gray-900 mb-3">Kullandığımız Çerez Türleri:</h4>
          
          <div className="space-y-3 mb-4">
            <div className="border-l-4 border-green-500 bg-green-50 p-3">
              <h5 className="font-semibold text-green-900 mb-1">Zorunlu Çerezler</h5>
              <p className="text-sm text-green-800">
                Platformun çalışması için gerekli olan temel çerezlerdir. Oturum yönetimi, güvenlik ve temel işlevsellik için kullanılır.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 bg-blue-50 p-3">
              <h5 className="font-semibold text-blue-900 mb-1">Fonksiyonel Çerezler</h5>
              <p className="text-sm text-blue-800">
                Tercihlerinizi hatırlayan ve kişiselleştirilmiş deneyim sunan çerezlerdir. Dil seçimi, tema tercihleri gibi bilgileri saklar.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 bg-purple-50 p-3">
              <h5 className="font-semibold text-purple-900 mb-1">Analitik Çerezler</h5>
              <p className="text-sm text-purple-800">
                Platform kullanımını analiz eden çerezlerdir. Google Analytics gibi araçlarla kullanıcı davranışlarını anlamamıza yardımcı olur.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 bg-orange-50 p-3">
              <h5 className="font-semibold text-orange-900 mb-1">Pazarlama Çerezleri</h5>
              <p className="text-sm text-orange-800">
                Size özel reklamlar sunmak için kullanılan çerezlerdir. Yalnızca izninizle kullanılır.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-2">Çerez Yönetimi</h5>
            <p className="text-sm text-gray-600 mb-3">
              Çerez tercihlerinizi platform ayarlarından veya tarayıcınızın ayarlarından yönetebilirsiniz. Ancak, zorunlu çerezlerin devre dışı bırakılması platformun düzgün çalışmasını engelleyebilir.
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Çerez Ayarlarını Yönet →
            </button>
          </div>
        </>
      )
    },
    {
      icon: GlobeAltIcon,
      title: '8. Üçüncü Taraf Paylaşımları',
      content: (
        <>
          <p className="mb-4">
            Kişisel verileriniz, yalnızca aşağıdaki durumlarda ve sınırlı kapsamda üçüncü taraflarla paylaşılabilir:
          </p>

          <div className="space-y-4">
            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-2">💳 Ödeme Hizmet Sağlayıcıları</h4>
              <p className="text-sm text-gray-600 mb-2">
                Ödeme işlemlerini gerçekleştirmek için güvenli ödeme sağlayıcıları ile çalışıyoruz:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                <li>İyzico (PCI-DSS sertifikalı)</li>
                <li>Banka ve kredi kartı kuruluşları</li>
              </ul>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-2">🤖 AI Hizmet Sağlayıcıları</h4>
              <p className="text-sm text-gray-600 mb-2">
                Yapay zeka analizi için yalnızca araç görselleri şu sağlayıcılarla paylaşılır:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                <li>Mivvo AI (Vision API)</li>
                <li>Google Cloud (Gemini AI)</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                * Kimlik bilgileriniz bu platformlarla paylaşılmaz.
              </p>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-2">📊 Analitik Araçları</h4>
              <p className="text-sm text-gray-600 mb-2">
                Platform performansını ölçmek için:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                <li>Google Analytics (anonimleştirilmiş)</li>
              </ul>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-2">☁️ Bulut Hizmet Sağlayıcıları</h4>
              <p className="text-sm text-gray-600 mb-2">
                Veri barındırma ve altyapı hizmetleri için:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                <li>Railway (Hosting)</li>
                <li>Neon Postgres (Database)</li>
                <li>AWS S3 (File Storage)</li>
              </ul>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-2">⚖️ Yasal Yükümlülükler</h4>
              <p className="text-sm text-gray-600">
                Yasal bir zorunluluk olması durumunda, verileriniz yetkili kamu kurum ve kuruluşları ile paylaşılabilir.
              </p>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Önemli:</strong> Tüm üçüncü taraf hizmet sağlayıcılarımız, KVKK ve GDPR uyumlu veri işleme sözleşmeleri imzalamış ve güvenlik standartlarına uygunluğu onaylanmış firmalardır.
            </p>
          </div>
        </>
      )
    },
    {
      icon: EnvelopeIcon,
      title: '9. İletişim ve Başvuru',
      content: (
        <>
          <p className="mb-4">
            Gizlilik politikamız hakkında sorularınız veya kişisel verilerinizle ilgili talepleriniz için bizimle iletişime geçebilirsiniz:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-3">📧 E-posta</h4>
              <a href="mailto:privacy@mivvo.com" className="text-blue-600 hover:text-blue-700">
                privacy@mivvo.com
              </a>
              <p className="text-xs text-gray-500 mt-2">Yanıt süresi: 24-48 saat</p>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-3">📮 KEP Adresi</h4>
              <p className="text-gray-800">mivvo@hs03.kep.tr</p>
              <p className="text-xs text-gray-500 mt-2">Resmi başvurular için</p>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🏢 Posta Adresi</h4>
              <p className="text-gray-800 text-sm">
                Mivvo Teknoloji A.Ş.<br />
                [Şirket Adresi]<br />
                Türkiye
              </p>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-3">💬 Platform Üzerinden</h4>
              <p className="text-gray-800 text-sm mb-2">
                Ayarlar → Gizlilik → Veri Talebi
              </p>
              <Link href="/settings" className="text-blue-600 hover:text-blue-700 text-sm">
                Ayarlara Git →
              </Link>
            </div>
          </div>

          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">🛡️ Kişisel Verileri Koruma Kurumu</h4>
            <p className="text-sm text-green-800 mb-2">
              Başvurularınız sonucunda yeterli cevap alamazsanız, Kişisel Verileri Koruma Kurumu&apos;na başvurabilirsiniz:
            </p>
            <p className="text-sm text-green-800">
              <strong>Web:</strong> <a href="https://www.kvkk.gov.tr" target="_blank" rel="noopener noreferrer" className="underline">www.kvkk.gov.tr</a><br />
              <strong>E-posta:</strong> kvkk@kvkk.gov.tr
            </p>
          </div>
        </>
      )
    },
    {
      icon: DocumentTextIcon,
      title: '10. Politika Değişiklikleri',
      content: (
        <>
          <p className="mb-4">
            Bu gizlilik politikası, yasal düzenlemeler, teknolojik gelişmeler veya iş süreçlerimizde yapılan değişiklikler nedeniyle güncellenebilir.
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📢 Bildirim Süreci</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm text-blue-800">
                <li>Önemli değişiklikler e-posta ile bildirilir</li>
                <li>Platform üzerinde bildirim gösterilir</li>
                <li>30 gün önceden duyuru yapılır</li>
                <li>Değişiklikleri kabul etme veya hesabı kapatma seçeneği sunulur</li>
              </ul>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-2">📅 Son Güncelleme</h4>
              <p className="text-gray-600 mb-2">
                Bu gizlilik politikası en son <strong>{lastUpdated}</strong> tarihinde güncellenmiştir.
              </p>
              <p className="text-sm text-gray-500">
                Politikamızı düzenli olarak gözden geçirmenizi öneririz.
              </p>
            </div>
          </div>

          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-2">Versiyon Geçmişi</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex justify-between">
                <span>v1.2 - KVKK ve GDPR uyumluluğu</span>
                <span className="text-gray-500">11 Ekim 2024</span>
              </li>
              <li className="flex justify-between">
                <span>v1.1 - Çerez politikası eklendi</span>
                <span className="text-gray-500">1 Eylül 2024</span>
              </li>
              <li className="flex justify-between">
                <span>v1.0 - İlk yayın</span>
                <span className="text-gray-500">15 Ağustos 2024</span>
              </li>
            </ul>
          </div>
        </>
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
              <Link href="/help" className="text-gray-700 hover:text-blue-600 transition-colors">Yardım</Link>
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
            <span className="text-gray-900 font-medium">Gizlilik Politikası</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Gizlilik Politikası
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Kişisel verilerinizi nasıl koruduğumuzu ve yönettiğimizi öğrenin
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Son güncelleme: {lastUpdated}
                </span>
                <button
                  onClick={handlePrint}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <PrinterIcon className="w-4 h-4 mr-1" />
                  Yazdır
                </button>
              </div>
            </div>
          </FadeInUp>

          {/* Trust Badges */}
          <FadeInUp delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <ShieldCheckIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-900">KVKK Uyumlu</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <LockClosedIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-900">GDPR Uyumlu</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <ShieldCheckIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-900">SSL Şifreleme</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <UserIcon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-900">Kullanıcı Hakları</p>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {sections.map((section, index) => (
              <FadeInUp key={index} delay={index * 0.05}>
                <Accordion title={section.title} defaultOpen={index === 0}>
                  <div className="prose prose-sm max-w-none">
                    {section.content}
                  </div>
                </Accordion>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Sorularınız mı var?</h2>
              <p className="text-blue-100 mb-6">
                Gizlilik politikamız hakkında daha fazla bilgi almak için bizimle iletişime geçin
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="btn btn-secondary btn-lg">
                  İletişime Geç
                </Link>
                <Link href="/help" className="btn btn-ghost btn-lg text-white hover:bg-white/20 border border-white/30">
                  Yardım Merkezi
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
                <li><Link href="/privacy" className="text-white font-medium">Gizlilik</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Kullanım Şartları</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Destek</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/help" className="hover:text-white transition-colors">Yardım Merkezi</Link></li>
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

