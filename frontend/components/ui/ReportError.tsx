/**
 * Report Error Component
 * 
 * Kullanıcı dostu hata mesajları - Tüm analiz raporları için
 * Kredi iade bilgisi, tekrar deneme ve destek seçenekleri
 */

import { 
  ExclamationTriangleIcon,
  ClockIcon,
  WifiIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { Card } from './Card'
import { Button } from './Button'
import Link from 'next/link'

export interface ReportErrorProps {
  /** Hata tipi */
  type: 'ai_busy' | 'ai_failed' | 'insufficient_credit' | 'network_error' | 'not_found' | 'generic'
  
  /** Başlık (opsiyonel - type'a göre default gelir) */
  title?: string
  
  /** Mesaj (opsiyonel - type'a göre default gelir) */
  message?: string
  
  /** Kredi iade edildi mi? */
  creditRefunded?: boolean
  
  /** Kalan kredi bakiyesi */
  remainingCredit?: number
  
  /** İade edilen kredi miktarı */
  refundedAmount?: number
  
  /** Tekrar deneme callback */
  onRetry?: () => void
  
  /** Dashboard'a dön linki göster */
  showDashboardLink?: boolean
  
  /** Destek iletişim linki göster */
  showSupportLink?: boolean
}

/**
 * Hata tiplerine göre yapılandırma
 */
const errorConfig = {
  ai_busy: {
    icon: ClockIcon,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'AI Servis Yoğun',
    message: 'AI servis yoğunluğu nedeniyle rapor oluşturulamadı. Lütfen birkaç dakika sonra tekrar deneyiniz.',
    badge: '✅ Kredileriniz Korunmuştur',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-800'
  },
  ai_failed: {
    icon: ExclamationTriangleIcon,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    title: 'Rapor Oluşturulamadı',
    message: 'AI analizi tamamlanamadı. Kredileriniz iade edilmiştir. Lütfen tekrar deneyiniz.',
    badge: '✅ Kredileriniz İade Edildi',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-800'
  },
  insufficient_credit: {
    icon: ShieldCheckIcon,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    title: 'Yetersiz Kredi',
    message: 'Bu analiz için yeterli krediniz bulunmamaktadır. Lütfen kredi satın alınız.',
    badge: '💳 Kredi Gerekli',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800'
  },
  network_error: {
    icon: WifiIcon,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    title: 'Bağlantı Hatası',
    message: 'İnternet bağlantınızı kontrol ediniz ve tekrar deneyiniz.',
    badge: '📡 Bağlantı Sorunu',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800'
  },
  not_found: {
    icon: ExclamationTriangleIcon,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    title: 'Rapor Bulunamadı',
    message: 'İstediğiniz rapor bulunamadı veya erişim yetkiniz yok.',
    badge: '🔍 Bulunamadı',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-800'
  },
  generic: {
    icon: ExclamationTriangleIcon,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    title: 'Bir Hata Oluştu',
    message: 'Beklenmedik bir hata oluştu. Lütfen tekrar deneyiniz.',
    badge: '⚠️ Hata',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800'
  }
}

export function ReportError({
  type,
  title,
  message,
  creditRefunded = false,
  remainingCredit,
  refundedAmount,
  onRetry,
  showDashboardLink = true,
  showSupportLink = true
}: ReportErrorProps) {
  const config = errorConfig[type] || errorConfig.generic
  const Icon = config.icon
  const displayTitle = title || config.title
  const displayMessage = message || config.message

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card padding="none" className="max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-white p-8 text-center border-b border-gray-200">
          {/* Icon */}
          <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-10 h-10 ${config.iconColor}`} />
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{displayTitle}</h2>
          
          {/* Badge */}
          <div className={`inline-block ${config.badgeBg} ${config.badgeText} px-4 py-2 rounded-full text-sm font-bold mb-4`}>
            {config.badge}
          </div>
          
          {/* Message */}
          <p className="text-gray-700 leading-relaxed">{displayMessage}</p>
        </div>

        {/* Credit Info */}
        {(creditRefunded || remainingCredit !== undefined || refundedAmount !== undefined) && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-t-2 border-green-200 p-6">
            <div className="flex items-start">
              <ShieldCheckIcon className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-2">Kredi Güvencesi</h3>
                <div className="space-y-1 text-sm">
                  {creditRefunded && (
                    <p className="text-green-800">
                      <strong>✅ Kredileriniz iade edildi</strong>
                      {refundedAmount && ` (${refundedAmount} TL)`}
                    </p>
                  )}
                  {!creditRefunded && type === 'ai_busy' && (
                    <p className="text-green-800">
                      <strong>✅ Hiçbir kredi kullanılmadı</strong>
                    </p>
                  )}
                  {remainingCredit !== undefined && (
                    <p className="text-green-700">
                      Mevcut bakiyeniz: <strong>{remainingCredit} TL</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 bg-gray-50 space-y-3">
          {/* Retry Button */}
          {onRetry && (
            <Button
              variant="primary"
              size="lg"
              onClick={onRetry}
              className="w-full flex items-center justify-center"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Tekrar Dene
            </Button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Dashboard Link */}
            {showDashboardLink && (
              <Link href="/dashboard">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full flex items-center justify-center"
                >
                  <HomeIcon className="w-5 h-5 mr-2" />
                  Dashboard&apos;a Dön
                </Button>
              </Link>
            )}

            {/* Support Link */}
            {showSupportLink && (
              <Link href="/contact">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full flex items-center justify-center"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                  Destek Al
                </Button>
              </Link>
            )}
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Sorun devam ederse lütfen destek ekibimizle iletişime geçiniz.
          </p>
        </div>
      </Card>
    </div>
  )
}

