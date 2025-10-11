'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  DocumentTextIcon,
  ScaleIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { FadeInUp } from '@/components/motion'
import { Accordion } from '@/components/ui'

export default function TermsPage() {
  const lastUpdated = '11 Ekim 2024'
  const [activeSection, setActiveSection] = useState<string>('')

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id)
    }
  }

  const tableOfContents = [
    { id: 'section-1', title: '1. Hizmet Tanımı ve Kapsam' },
    { id: 'section-2', title: '2. Kullanıcı Hesapları ve Sorumluluklar' },
    { id: 'section-3', title: '3. Kredi Sistemi ve Ödeme Koşulları' },
    { id: 'section-4', title: '4. Hizmet Kullanım Kuralları' },
    { id: 'section-5', title: '5. Yapay Zeka Analiz Sonuçları' },
    { id: 'section-6', title: '6. Fikri Mülkiyet Hakları' },
    { id: 'section-7', title: '7. Sorumluluk Sınırlamaları' },
    { id: 'section-8', title: '8. Hizmet Değişiklikleri ve İptal' },
    { id: 'section-9', title: '9. İhtilaf Çözümü ve Uygulanacak Hukuk' },
    { id: 'section-10', title: '10. Diğer Hükümler' }
  ]

  const sections = [
    {
      id: 'section-1',
      icon: DocumentTextIcon,
      title: '1. Hizmet Tanımı ve Kapsam',
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">1.1. Platform Hakkında</h3>
          <p className="mb-4">
            Mivvo Expertiz ("Platform", "Hizmet"), yapay zeka teknolojisi kullanarak araç görselleri üzerinden boya analizi, hasar tespiti, değer tahmini ve kapsamlı expertiz hizmeti sunan bir online platformdur. Platform, Mivvo Teknoloji A.Ş. ("Şirket") tarafından işletilmektedir.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">1.2. Sunulan Hizmetler</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">🎨 Boya Analizi</h4>
              <p className="text-sm text-blue-800">
                Araç boyasının durumu, orijinalliği, renk uyumu ve kalite değerlendirmesi
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">🔧 Hasar Değerlendirmesi</h4>
              <p className="text-sm text-green-800">
                Çizik, çarpma, ezik ve diğer fiziksel hasarların tespiti ve analizi
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">💰 Değer Tahmini</h4>
              <p className="text-sm text-purple-800">
                Araç durumuna göre piyasa değeri tahmini ve fiyatlandırma önerisi
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">📋 Tam Expertiz</h4>
              <p className="text-sm text-orange-800">
                Tüm hizmetlerin dahil olduğu kapsamlı araç değerlendirme raporu
              </p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">1.3. Hizmet Kapsam Dışı Durumlar</h3>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <ul className="space-y-2 text-sm text-amber-900">
              <li className="flex items-start">
                <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Platform, resmi araç muayene istasyonu değildir ve trafik tescili için geçerli resmi belgeler sunmaz.</span>
              </li>
              <li className="flex items-start">
                <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Mekanik aksamların detaylı kontrolü ve motor içi inceleme hizmet kapsamı dışındadır.</span>
              </li>
              <li className="flex items-start">
                <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Sigorta şirketleri nezdinde resmi hasar dosyası açılması platform sorumluluğunda değildir.</span>
              </li>
            </ul>
          </div>
        </>
      )
    },
    {
      id: 'section-2',
      icon: UserGroupIcon,
      title: '2. Kullanıcı Hesapları ve Sorumluluklar',
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">2.1. Hesap Oluşturma</h3>
          <p className="mb-4">
            Platform hizmetlerinden yararlanmak için kullanıcı hesabı oluşturmanız gerekmektedir. Hesap oluşturma sırasında:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>18 yaşını doldurmuş ve medeni hakları kullanma ehliyetine sahip olmalısınız</li>
            <li>Doğru, güncel ve eksiksiz bilgiler sağlamalısınız</li>
            <li>Güvenli bir şifre oluşturmalı ve gizli tutmalısınız</li>
            <li>Bir kişi sadece bir hesap açabilir</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">2.2. Kullanıcı Sorumlulukları</h3>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                Hesap Güvenliği
              </h4>
              <p className="text-sm text-gray-600">
                Kullanıcı adı ve şifrenizin gizliliğinden siz sorumlusunuz. Hesabınızda gerçekleşen tüm işlemlerden sorumlu olacağınızı kabul edersiniz.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                Doğru Bilgi Sağlama
              </h4>
              <p className="text-sm text-gray-600">
                Yüklediğiniz araç görselleri ve sağladığınız bilgilerin doğru, güncel ve yanıltıcı olmadığından emin olmalısınız.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                Yasal Kullanım
              </h4>
              <p className="text-sm text-gray-600">
                Platformu yalnızca yasal amaçlarla kullanacağınızı ve yürürlükteki tüm kanun ve düzenlemelere uyacağınızı kabul edersiniz.
              </p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">2.3. Yasaklanan Davranışlar</h3>
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <ul className="space-y-2 text-sm text-red-900">
              <li>❌ Başkasına ait araç görsellerini izinsiz kullanmak</li>
              <li>❌ Platform güvenliğini tehdit edici faaliyetlerde bulunmak</li>
              <li>❌ Otomatik botlar veya scriptler kullanmak</li>
              <li>❌ Platformu tersine mühendislik yapmak</li>
              <li>❌ Sahte veya manipüle edilmiş görsel yüklemek</li>
              <li>❌ Platformu spam, dolandırıcılık veya zararlı amaçlarla kullanmak</li>
              <li>❌ Diğer kullanıcıların deneyimini bozmak</li>
            </ul>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">2.4. Hesap Askıya Alma ve Kapatma</h3>
          <p className="mb-4">
            Kullanım şartlarını ihlal etmeniz durumunda, Şirket önceden bildirimde bulunmaksızın hesabınızı askıya alabilir veya kalıcı olarak kapatabilir. Bu durumda kullanılmamış kredileriniz iade edilmeyebilir.
          </p>
        </>
      )
    },
    {
      id: 'section-3',
      icon: CreditCardIcon,
      title: '3. Kredi Sistemi ve Ödeme Koşulları',
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">3.1. Kredi Sistemi</h3>
          <p className="mb-4">
            Platform, kredi bazlı bir ödeme sistemi kullanmaktadır. Her analiz türü belirli miktarda kredi tüketir:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hizmet</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kredi/Fiyat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Süre</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm">Boya Analizi</td>
                  <td className="px-4 py-3 text-sm font-semibold">25₺</td>
                  <td className="px-4 py-3 text-sm">~2 dakika</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Hasar Değerlendirmesi</td>
                  <td className="px-4 py-3 text-sm font-semibold">35₺</td>
                  <td className="px-4 py-3 text-sm">~3 dakika</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Değer Tahmini</td>
                  <td className="px-4 py-3 text-sm font-semibold">20₺</td>
                  <td className="px-4 py-3 text-sm">~2 dakika</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Motor Ses Analizi</td>
                  <td className="px-4 py-3 text-sm font-semibold">30₺</td>
                  <td className="px-4 py-3 text-sm">~3 dakika</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="px-4 py-3 text-sm font-semibold">Tam Expertiz (Tümü)</td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">75₺</td>
                  <td className="px-4 py-3 text-sm">~5-7 dakika</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">3.2. Kredi Satın Alma</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Krediler, platform üzerinden çevrimiçi ödeme yöntemleri ile satın alınabilir</li>
            <li>Kabul edilen ödeme yöntemleri: Kredi kartı, banka kartı, banka havalesi</li>
            <li>Tüm ödemeler PCI-DSS sertifikalı ödeme sağlayıcıları üzerinden güvenli şekilde işlenir</li>
            <li>Satın alınan kredilerin geçerlilik süresi yoktur (hesap aktif olduğu sürece)</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">3.3. Fatura ve Vergi</h3>
          <p className="mb-4">
            Tüm ödemeler için e-fatura düzenlenir ve kayıtlı e-posta adresinize gönderilir. Faturalar Türkiye Cumhuriyeti vergi mevzuatına uygun olarak düzenlenir. Kurumsal fatura talebinde bulunmak için iletişime geçebilirsiniz.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">3.4. İade Politikası</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">İade Koşulları</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Satın alma sonrası 14 gün:</strong> Kullanılmamış krediler için tam iade</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Teknik hata:</strong> Platform hatası nedeniyle tüketilen krediler otomatik iade edilir</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Analiz tamamlanamadı:</strong> Başarısız analizler için kredi iadesi yapılır</span>
              </li>
              <li className="flex items-start">
                <XCircleIcon className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>İade edilmez:</strong> Tamamlanmış ve rapor alınmış analizler</span>
              </li>
            </ul>
            <p className="text-xs text-blue-700 mt-3">
              İade talepleri için: <a href="mailto:refund@mivvo.com" className="underline">refund@mivvo.com</a>
            </p>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">3.5. Promosyon ve İndirimler</h3>
          <p className="mb-4">
            Şirket, zaman zaman promosyon kodları, indirimler veya özel kampanyalar sunabilir. Bu kampanyaların kullanım koşulları her kampanya için ayrı ayrı belirlenecek ve kullanıcılara bildirilecektir. Promosyon hakları devredilemez ve nakde çevrilemez.
          </p>
        </>
      )
    },
    {
      id: 'section-4',
      icon: ShieldCheckIcon,
      title: '4. Hizmet Kullanım Kuralları',
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">4.1. Görsel Yükleme Gereksinimleri</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Kabul Edilen Format ve Özellikler
              </h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Formatlar: JPG, PNG, WEBP, HEIC</li>
                <li>• Maksimum dosya boyutu: 10 MB</li>
                <li>• Minimum çözünürlük: 800x600 px</li>
                <li>• Önerilen: Gün ışığında çekilmiş net fotoğraflar</li>
              </ul>
            </div>

            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                <XCircleIcon className="w-5 h-5 mr-2" />
                Kabul Edilmeyen Görseller
              </h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Bulanık veya düşük kaliteli fotoğraflar</li>
                <li>• Aşırı filtre uygulanmış görseller</li>
                <li>• İnsan yüzü veya kimlik bilgisi içeren</li>
                <li>• Telif hakkı ihlali içeren görseller</li>
              </ul>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">4.2. Veri Kullanımı ve Gizlilik</h3>
          <p className="mb-4">
            Yüklediğiniz araç görselleri ve veriler yalnızca analiz amacıyla kullanılır ve <Link href="/privacy" className="text-blue-600 hover:underline">Gizlilik Politikamız</Link> kapsamında korunur. Görselleriniz:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Analiz tamamlandıktan 30 gün sonra otomatik olarak silinir</li>
            <li>Üçüncü taraflarla (AI sağlayıcıları hariç) paylaşılmaz</li>
            <li>Anonimleştirilmiş olarak model eğitiminde kullanılabilir (isterseniz opt-out yapabilirsiniz)</li>
            <li>Yasal zorunluluk olmadıkça satılmaz veya kiraya verilmez</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">4.3. Hizmet Kullanım Limitleri</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Limit Türü</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ücretsiz</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ücretli</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm">Günlük analiz limiti</td>
                  <td className="px-4 py-3 text-sm">5 analiz</td>
                  <td className="px-4 py-3 text-sm">Sınırsız</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Dosya yükleme boyutu</td>
                  <td className="px-4 py-3 text-sm">5 MB</td>
                  <td className="px-4 py-3 text-sm">10 MB</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Rapor saklama süresi</td>
                  <td className="px-4 py-3 text-sm">30 gün</td>
                  <td className="px-4 py-3 text-sm">2 yıl</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">API erişimi</td>
                  <td className="px-4 py-3 text-sm">Yok</td>
                  <td className="px-4 py-3 text-sm">Var (Pro+)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Kötüye kullanım tespit edilirse, Şirket ek limitler uygulama hakkını saklı tutar.
          </p>
        </>
      )
    },
    {
      id: 'section-5',
      icon: ExclamationTriangleIcon,
      title: '5. Yapay Zeka Analiz Sonuçları',
      content: (
        <>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
            <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 mr-2" />
              Önemli Uyarı
            </h4>
            <p className="text-sm text-amber-800">
              Platform tarafından sağlanan tüm analiz sonuçları yapay zeka algoritmalarına dayanmaktadır ve <strong>yalnızca bilgilendirme amaçlıdır</strong>. Bu sonuçlar kesin veya nihai değerlendirme olarak kabul edilmemelidir.
            </p>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">5.1. Analiz Sonuçlarının Niteliği</h3>
          <p className="mb-4">
            Kullanıcılar, AI analiz sonuçlarının:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Yüklenen görsellerin kalitesi ve açısına bağlı olarak değişebileceğini</li>
            <li>Görünmeyen hasarlar veya iç parçaları değerlendiremeyeceğini</li>
            <li>İnsan expertin yerini tutmadığını ve profesyonel muayene gerektirdiğini</li>
            <li>Hukuki veya resmi işlemlerde tek başına delil oluşturmayacağını</li>
          </ul>
          <p className="mb-4">
            kabul ve taahhüt eder.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">5.2. Doğruluk ve Garanti Reddi</h3>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-3">
                Şirket, AI analiz sonuçlarının doğruluğu, tamlığı, güvenilirliği veya zamanında sağlanması konusunda <strong>hiçbir garanti vermemektedir</strong>. Analiz sonuçları:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Yardımcı bilgi kaynağı olarak kullanılabilir</li>
                <li>✓ Ön değerlendirme için referans alınabilir</li>
                <li>✗ Alım-satım kararlarının tek dayanağı olmamalıdır</li>
                <li>✗ Profesyonel expertiz veya muayenenin yerini tutmaz</li>
                <li>✗ Sigorta tazminat taleplerinde tek delil olarak kullanılamaz</li>
              </ul>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">5.3. Model Güncellemeleri</h3>
          <p className="mb-4">
            Yapay zeka modellerimiz sürekli olarak geliştirilmekte ve güncellenmektedir. Bu güncellemeler:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Önceden bildirim yapılmadan uygulanabilir</li>
            <li>Analiz sonuçlarında farklılıklara neden olabilir</li>
            <li>Geçmiş analizlerin yeniden değerlendirilmesine sebep olmaz</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">5.4. Raporların Kullanımı</h3>
          <p className="mb-4">
            Oluşturulan raporlar kişisel kullanımınız içindir. Raporları:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">✓ İzinli Kullanımlar</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Kişisel araç değerlendirmesi</li>
                <li>• Potansiyel alıcılarla paylaşma</li>
                <li>• Destek bilgi olarak uzman kontrolü</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">✗ İzinsiz Kullanımlar</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Ticari amaçlı satış</li>
                <li>• Markanın kaldırılması</li>
                <li>• Rekabet amacıyla kullanım</li>
                <li>• Yanıltıcı şekilde sunma</li>
              </ul>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'section-6',
      icon: ScaleIcon,
      title: '6. Fikri Mülkiyet Hakları',
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">6.1. Platform Fikri Mülkiyeti</h3>
          <p className="mb-4">
            Platform ve tüm içeriği (tasarım, logo, yazılım kodu, AI modelleri, metin, grafik, resim vb.) Mivvo Teknoloji A.Ş.'nin münhasır mülkiyetindedir ve telif hakları, ticari marka hakları ve diğer fikri mülkiyet kanunları ile korunmaktadır.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">6.2. Kullanıcı İçeriği</h3>
          <p className="mb-4">
            Yüklediğiniz araç görselleri ve sağladığınız veriler ("Kullanıcı İçeriği") sizin mülkiyetinizde kalır. Ancak, platformu kullanarak:
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 mb-3">
              Şirkete, analiz hizmetlerini sağlamak, AI modellerini geliştirmek ve platformu iyileştirmek amacıyla Kullanıcı İçeriğinizi kullanma, işleme, saklama ve anonimleştirme konusunda <strong>dünya çapında, gayri münhasır, telifsiz bir lisans</strong> vermiş olursunuz.
            </p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Bu lisans, hesabınızı kapattıktan sonra makul bir süre içinde (veri saklama politikasına uygun olarak) sona erer</li>
              <li>• Kimlik bilgileriniz içeren görseller asla paylaşılmaz veya eğitim için kullanılmaz</li>
            </ul>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">6.3. Ticari Marka</h3>
          <p className="mb-4">
            "Mivvo", "Mivvo Expertiz" ve ilgili logolar Şirketin tescilli ticari markalarıdır. Yazılı izin olmaksızın bu markaların kullanılması yasaktır.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">6.4. Telif Hakkı İhlali Bildirimi</h3>
          <p className="mb-4">
            Telif hakkı ihlali olduğunu düşündüğünüz içerik için:
          </p>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>İletişim:</strong> <a href="mailto:legal@mivvo.com" className="text-blue-600 hover:underline">legal@mivvo.com</a>
            </p>
            <p className="text-xs text-gray-500">
              Bildiriminizde: ihlal edilen eser bilgisi, ihlal içeriğinin konumu, kimlik ve iletişim bilgileriniz, iyi niyetle hareket ettiğinize dair beyan yer almalıdır.
            </p>
          </div>
        </>
      )
    },
    {
      id: 'section-7',
      icon: ExclamationTriangleIcon,
      title: '7. Sorumluluk Sınırlamaları',
      content: (
        <>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
            <h4 className="font-semibold text-amber-900 mb-2">Genel Sorumluluk Reddi</h4>
            <p className="text-sm text-amber-800">
              Platform ve hizmetler <strong>"OLDUĞU GİBİ"</strong> ve <strong>"MEVCUT OLDUĞU ŞEKLIYLE"</strong> sunulmaktadır. Şirket, açık veya zımni hiçbir garanti vermemektedir.
            </p>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">7.1. Hizmet Kesintileri</h3>
          <p className="mb-4">
            Şirket, platformun kesintisiz veya hatasız çalışacağını garanti etmez. Aşağıdaki durumlardan sorumlu değildir:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Teknik arızalar ve bakım çalışmaları</li>
            <li>İnternet bağlantı sorunları</li>
            <li>Üçüncü taraf hizmet sağlayıcılardan kaynaklanan kesintiler</li>
            <li>Siber saldırılar veya güvenlik ihlalleri</li>
            <li>Mücbir sebepler (doğal afetler, savaş, pandemi vb.)</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">7.2. Mali Sorumluluk Limitleri</h3>
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 mb-3">
              Şirketin toplam sorumluluğu, yasal olarak izin verilen azami ölçüde, kullanıcının platform üzerinde son 12 ay içinde ödediği toplam tutarla <strong>sınırlıdır</strong>.
            </p>
            <p className="text-sm text-gray-700">
              Şirket, hiçbir durumda aşağıdakilerden sorumlu olmayacaktır:
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• Dolaylı, arızi veya cezai zararlar</li>
              <li>• Kar kaybı, itibar kaybı veya veri kaybı</li>
              <li>• AI analiz sonuçlarına dayanılarak alınan kararların sonuçları</li>
              <li>• Üçüncü tarafların neden olduğu zararlar</li>
            </ul>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">7.3. Kullanıcı Kararları</h3>
          <p className="mb-4">
            Kullanıcı, platform üzerinden alınan bilgilere dayanarak aldığı tüm kararlardan kendisi sorumludur. Araç alım-satım, sigorta, finansman veya hukuki kararlar almadan önce profesyonel danışmanlık almanızı önemle tavsiye ederiz.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">7.4. Üçüncü Taraf Bağlantılar</h3>
          <p className="mb-4">
            Platform, üçüncü taraf web sitelerine bağlantılar içerebilir. Şirket, bu sitelerin içeriği, gizlilik politikaları veya uygulamalarından sorumlu değildir.
          </p>
        </>
      )
    },
    {
      id: 'section-8',
      icon: DocumentTextIcon,
      title: '8. Hizmet Değişiklikleri ve İptal',
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">8.1. Hizmet Değişiklikleri</h3>
          <p className="mb-4">
            Şirket, herhangi bir zamanda ve önceden bildirimde bulunmaksızın:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Platformun özelliklerini değiştirebilir veya kaldırabilir</li>
            <li>Fiyatlandırmayı güncelleyebilir</li>
            <li>Hizmet limitlerini ayarlayabilir</li>
            <li>Yeni özellikler ekleyebilir</li>
          </ul>
          <p className="text-sm text-gray-600 mb-4">
            Önemli değişiklikler e-posta veya platform bildirimi ile kullanıcılara duyurulur.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">8.2. Kullanıcı Tarafından İptal</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">Hesap İptali</h4>
            <p className="text-sm text-blue-800 mb-3">
              Hesabınızı istediğiniz zaman iptal edebilirsiniz:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Ayarlar → Hesap → Hesabı Kapat</li>
              <li>2. İptal nedenini belirtin (isteğe bağlı)</li>
              <li>3. Onaylayın</li>
            </ul>
            <p className="text-xs text-blue-700 mt-3">
              İptal sonrası kullanılmamış kredileriniz için iade talep edebilirsiniz (14 gün içinde).
            </p>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">8.3. Şirket Tarafından Sonlandırma</h3>
          <p className="mb-4">
            Şirket, aşağıdaki durumlarda hesabınızı askıya alabilir veya kalıcı olarak sonlandırabilir:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Kullanım şartlarının ihlali</li>
            <li>Dolandırıcılık veya kötüye kullanım şüphesi</li>
            <li>Yasal zorunluluk</li>
            <li>90 gün boyunca hesap aktivitesi olmaması</li>
          </ul>
          <p className="text-sm text-gray-600">
            Sonlandırma durumunda, kullanılmamış krediler iade edilir (ihlal durumları hariç).
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">8.4. Sonlandırma Sonrası</h3>
          <p className="mb-4">
            Hesabınız sonlandırıldığında:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Tüm verileriniz gizlilik politikamıza uygun olarak silinir</li>
            <li>Oluşturulmuş raporlara erişiminiz kalkar</li>
            <li>Yedekleme hakkınız bulunmaktadır (sonlandırmadan önce)</li>
            <li>Bazı veriler yasal saklama süresi boyunca tutulabilir</li>
          </ul>
        </>
      )
    },
    {
      id: 'section-9',
      icon: ScaleIcon,
      title: '9. İhtilaf Çözümü ve Uygulanacak Hukuk',
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">9.1. Uygulanacak Hukuk</h3>
          <p className="mb-4">
            Bu kullanım şartları, <strong>Türkiye Cumhuriyeti</strong> kanunlarına tabi olacak ve bu kanunlara göre yorumlanacaktır.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">9.2. İhtilaf Çözümü Süreci</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Adım 1: Doğrudan İletişim</h4>
              <p className="text-sm text-blue-800">
                Herhangi bir anlaşmazlık durumunda, öncelikle destek ekibimizle iletişime geçin: <a href="mailto:support@mivvo.com" className="underline">support@mivvo.com</a>
              </p>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4">
              <h4 className="font-semibold text-green-900 mb-2">Adım 2: Arabuluculuk</h4>
              <p className="text-sm text-green-800">
                Doğrudan çözülemezse, taraflar arabuluculuk yoluyla çözüm aramayı taahhüt eder (60 gün).
              </p>
            </div>

            <div className="border-l-4 border-purple-500 bg-purple-50 p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Adım 3: Hukuki Süreç</h4>
              <p className="text-sm text-purple-800">
                Arabuluculuk başarısız olursa, <strong>İstanbul Merkez (Çağlayan) Mahkemeleri ve İcra Daireleri</strong> yetkilidir.
              </p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">9.3. Tüketici Hakları</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 mb-3">
              6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında tüketici sayılan kullanıcılar, aşağıdaki makamlara başvurabilir:
            </p>
            <ul className="text-sm text-green-800 space-y-2">
              <li>
                <strong>Tüketici Hakem Heyetleri</strong><br />
                <span className="text-xs">Tutarı 81.130 TL'ye kadar olan uyuşmazlıklar için</span>
              </li>
              <li>
                <strong>Tüketici Mahkemeleri</strong><br />
                <span className="text-xs">Tüketici hakem heyeti kararına itiraz veya doğrudan başvuru için</span>
              </li>
              <li>
                <strong>Tüketici Bilgi Hattı:</strong> <span className="font-semibold">1411</span>
              </li>
            </ul>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">9.4. Vazgeçme ve Bölünebilirlik</h3>
          <p className="text-sm text-gray-600">
            Şirketin bu şartların herhangi bir hükmünü uygulamaması, o hükümden vazgeçtiği anlamına gelmez. Bu şartların herhangi bir hükmü geçersiz sayılırsa, diğer hükümler geçerliliğini korur.
          </p>
        </>
      )
    },
    {
      id: 'section-10',
      icon: DocumentTextIcon,
      title: '10. Diğer Hükümler',
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">10.1. Şartların Kabulü</h3>
          <p className="mb-4">
            Platformu kullanarak, bu kullanım şartlarını okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz. Eğer bu şartları kabul etmiyorsanız, platformu kullanmamalısınız.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">10.2. Bildirimlerin</h3>
          <p className="mb-4">
            Şirket, kullanıcılara bildirimlerini aşağıdaki yollarla yapabilir:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Kayıtlı e-posta adresine e-posta göndererek</li>
            <li>Platform üzerinde bildirim göstererek</li>
            <li>SMS veya anlık bildirim göndererek</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">10.3. Devir Yasağı</h3>
          <p className="mb-4">
            Kullanıcı, bu sözleşmeden doğan hak ve yükümlülüklerini üçüncü bir tarafa devredemez. Şirket ise bu sözleşmeyi serbestçe devredebilir.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">10.4. Tam Anlaşma</h3>
          <p className="mb-4">
            Bu kullanım şartları, <Link href="/privacy" className="text-blue-600 hover:underline">Gizlilik Politikası</Link> ile birlikte, kullanıcı ve Şirket arasındaki tam anlaşmayı oluşturur ve önceki tüm yazılı veya sözlü anlaşmaların yerini alır.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">10.5. İletişim Bilgileri</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-3">📧 Genel Sorular</h4>
              <a href="mailto:info@mivvo.com" className="text-blue-600 hover:text-blue-700">
                info@mivvo.com
              </a>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-3">⚖️ Hukuki Konular</h4>
              <a href="mailto:legal@mivvo.com" className="text-blue-600 hover:text-blue-700">
                legal@mivvo.com
              </a>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🏢 Şirket Adresi</h4>
              <p className="text-gray-800 text-sm">
                Mivvo Teknoloji A.Ş.<br />
                [Şirket Adresi]<br />
                Türkiye
              </p>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 mb-3">📋 Ticaret Sicil</h4>
              <p className="text-gray-800 text-sm">
                Mersis No: [MERSIS]<br />
                Vergi No: [VERGİ NO]
              </p>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-2">📅 Son Güncelleme</h5>
            <p className="text-sm text-gray-600 mb-2">
              Bu kullanım şartları en son <strong>{lastUpdated}</strong> tarihinde güncellenmiştir.
            </p>
            <p className="text-sm text-gray-500">
              Yürürlük tarihi: {lastUpdated}
            </p>
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
            <span className="text-gray-900 font-medium">Kullanım Şartları</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <FadeInUp>
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
                    <ScaleIcon className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Kullanım Şartları
                  </h1>
                  <p className="text-xl text-gray-600 mb-6">
                    Mivvo Expertiz platformunu kullanım hak ve yükümlülükleriniz
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      Son güncelleme: {lastUpdated}
                    </span>
                  </div>
                </div>
              </FadeInUp>

              {/* Important Notice */}
              <FadeInUp delay={0.1}>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
                  <h3 className="font-semibold text-blue-900 mb-2">Önemli Bilgilendirme</h3>
                  <p className="text-sm text-blue-800">
                    Bu kullanım şartları sizinle Mivvo Teknoloji A.Ş. arasındaki yasal sözleşmeyi oluşturur. 
                    Platformu kullanarak bu şartları kabul etmiş sayılırsınız. Lütfen dikkatlice okuyun.
                  </p>
                </div>
              </FadeInUp>

              {/* Sections */}
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <FadeInUp key={section.id} delay={index * 0.05}>
                    <div id={section.id}>
                      <Accordion title={section.title} defaultOpen={index === 0}>
                        <div className="prose prose-sm max-w-none">
                          {section.content}
                        </div>
                      </Accordion>
                    </div>
                  </FadeInUp>
                ))}
              </div>
            </div>

            {/* Sidebar - Table of Contents */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <FadeInUp delay={0.2}>
                  <div className="card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Bu Sayfada
                    </h3>
                    <nav className="space-y-2">
                      {tableOfContents.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={`block w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                            activeSection === item.id
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {item.title}
                        </button>
                      ))}
                    </nav>
                  </div>
                </FadeInUp>

                <FadeInUp delay={0.3}>
                  <div className="card p-6 mt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">İlgili Belgeler</h3>
                    <div className="space-y-3">
                      <Link 
                        href="/privacy" 
                        className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ChevronRightIcon className="w-4 h-4 mr-1" />
                        Gizlilik Politikası
                      </Link>
                      <Link 
                        href="/help" 
                        className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ChevronRightIcon className="w-4 h-4 mr-1" />
                        Yardım Merkezi
                      </Link>
                      <Link 
                        href="/faq" 
                        className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ChevronRightIcon className="w-4 h-4 mr-1" />
                        Sık Sorulan Sorular
                      </Link>
                    </div>
                  </div>
                </FadeInUp>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Hala Sorularınız mı var?</h2>
              <p className="text-blue-100 mb-6">
                Kullanım şartlarımız hakkında daha fazla bilgi için destek ekibimizle iletişime geçebilirsiniz
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="btn btn-secondary btn-lg">
                  İletişime Geç
                </Link>
                <Link href="/faq" className="btn btn-ghost btn-lg text-white hover:bg-white/20 border border-white/30">
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
                <li><Link href="/terms" className="text-white font-medium">Kullanım Şartları</Link></li>
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

