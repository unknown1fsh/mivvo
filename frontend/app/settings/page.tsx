'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  LanguageIcon,
  MoonIcon,
  SunIcon,
  SparklesIcon,
  UserIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { LoadingSpinner } from '@/components/ui'
import toast from 'react-hot-toast'

interface UserSettings {
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    reportUpdates: boolean
    paymentUpdates: boolean
    marketing: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    dataSharing: boolean
    analytics: boolean
  }
  preferences: {
    language: 'tr' | 'en'
    theme: 'light' | 'dark' | 'auto'
    timezone: string
  }
  security: {
    twoFactor: boolean
    loginAlerts: boolean
    sessionTimeout: number
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      reportUpdates: true,
      paymentUpdates: true,
      marketing: false
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true
    },
    preferences: {
      language: 'tr',
      theme: 'light',
      timezone: 'Europe/Istanbul'
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
      sessionTimeout: 30
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('notifications')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    // TODO: Fetch user settings from API
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleNotificationChange = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const handlePrivacyChange = (key: keyof UserSettings['privacy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }))
  }

  const handlePreferenceChange = (key: keyof UserSettings['preferences'], value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
  }

  const handleSecurityChange = (key: keyof UserSettings['security'], value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }))
  }

  const saveSettings = async () => {
    try {
      // TODO: Save settings to API
      toast.success('Ayarlar başarıyla kaydedildi!')
    } catch (error) {
      toast.error('Ayarlar kaydedilirken hata oluştu!')
    }
  }

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor!')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır!')
      return
    }
    
    try {
      // TODO: Change password via API
      toast.success('Şifre başarıyla değiştirildi!')
      setShowPasswordForm(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error('Şifre değiştirilirken hata oluştu!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const tabs = [
    { id: 'notifications', label: 'Bildirimler', icon: BellIcon },
    { id: 'privacy', label: 'Gizlilik', icon: ShieldCheckIcon },
    { id: 'preferences', label: 'Tercihler', icon: CogIcon },
    { id: 'security', label: 'Güvenlik', icon: KeyIcon }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Mivvo Expertiz</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/notifications" className="p-2 text-gray-400 hover:text-gray-600">
                <BellIcon className="w-6 h-6" />
              </Link>
              <Link href="/settings" className="p-2 text-blue-600 hover:text-blue-500">
                <CogIcon className="w-6 h-6" />
              </Link>
              <Link href="/profile" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Kullanıcı</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <FadeInUp>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ayarlar</h1>
            <p className="text-gray-600">Hesap ayarlarınızı buradan yönetebilirsiniz.</p>
          </div>
        </FadeInUp>

        {/* Settings Tabs */}
        <FadeInUp delay={0.1}>
          <div className="card p-6">
            {/* Custom Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-8">
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <StaggerContainer className="space-y-6">
                  <StaggerItem>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bildirim Tercihleri</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'email', label: 'E-posta Bildirimleri', desc: 'Rapor durumu ve önemli güncellemeler için e-posta alın' },
                          { key: 'push', label: 'Push Bildirimleri', desc: 'Tarayıcı push bildirimleri alın' },
                          { key: 'sms', label: 'SMS Bildirimleri', desc: 'Acil durumlar için SMS alın' },
                          { key: 'reportUpdates', label: 'Rapor Güncellemeleri', desc: 'Rapor durumu değişikliklerinde bildirim alın' },
                          { key: 'paymentUpdates', label: 'Ödeme Güncellemeleri', desc: 'Ödeme işlemleri hakkında bildirim alın' },
                          { key: 'marketing', label: 'Pazarlama Bildirimleri', desc: 'Yeni özellikler ve kampanyalar hakkında bilgi alın' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-gray-900">{item.label}</h4>
                              <p className="text-sm text-gray-600">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.notifications[item.key as keyof UserSettings['notifications']]}
                                onChange={(e) => handleNotificationChange(item.key as keyof UserSettings['notifications'], e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </StaggerItem>
                </StaggerContainer>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <StaggerContainer className="space-y-6">
                  <StaggerItem>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Gizlilik Ayarları</h3>
                      <p className="text-sm text-gray-600 mb-6">Kişisel verilerinizin nasıl kullanıldığını ve paylaşıldığını kontrol edin.</p>
                      
                      <div className="space-y-6">
                        {/* Profile Visibility */}
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">Profil Görünürlüğü</h4>
                              <p className="text-sm text-gray-600 mb-4">Profilinizin diğer kullanıcılar tarafından görünürlüğünü ayarlayın</p>
                              <select
                                value={settings.privacy.profileVisibility}
                                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              >
                                <option value="private">🔒 Özel - Sadece ben görebilirim</option>
                                <option value="public">🌐 Herkese Açık - Herkes görebilir</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Data Sharing */}
                        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">Veri Paylaşımı ve Analitik</h4>
                              <p className="text-sm text-gray-600 mb-4">Uygulamanın geliştirilmesi için anonim veri paylaşımı</p>
                              
                              <div className="space-y-4">
                                {[
                                  { 
                                    key: 'dataSharing', 
                                    label: 'Anonim Veri Paylaşımı', 
                                    desc: 'Geliştirme amaçlı anonim kullanım verilerini paylaş',
                                    icon: '📊'
                                  },
                                  { 
                                    key: 'analytics', 
                                    label: 'Kullanım Analitikleri', 
                                    desc: 'Site performansı ve kullanım istatistiklerini topla',
                                    icon: '📈'
                                  }
                                ].map((item) => (
                                  <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-2xl">{item.icon}</span>
                                      <div>
                                        <h5 className="font-medium text-gray-900">{item.label}</h5>
                                        <p className="text-sm text-gray-600">{item.desc}</p>
                                      </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={settings.privacy[item.key as keyof UserSettings['privacy']]}
                                        onChange={(e) => handlePrivacyChange(item.key as keyof UserSettings['privacy'], e.target.checked)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cookie Settings */}
                        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <CogIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">Çerez Ayarları</h4>
                              <p className="text-sm text-gray-600 mb-4">Web sitesi deneyiminizi iyileştirmek için çerezleri yönetin</p>
                              
                              <div className="space-y-3">
                                {[
                                  { label: 'Gerekli Çerezler', desc: 'Site işlevselliği için zorunlu', required: true },
                                  { label: 'Analitik Çerezler', desc: 'Kullanım istatistikleri için', required: false },
                                  { label: 'Pazarlama Çerezleri', desc: 'Kişiselleştirilmiş reklamlar için', required: false }
                                ].map((cookie) => (
                                  <div key={cookie.label} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                    <div>
                                      <h5 className="font-medium text-gray-900">{cookie.label}</h5>
                                      <p className="text-sm text-gray-600">{cookie.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        defaultChecked={cookie.required}
                                        disabled={cookie.required}
                                        className="sr-only peer"
                                      />
                                      <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                                        cookie.required 
                                          ? 'bg-purple-600' 
                                          : 'bg-gray-200 peer-checked:bg-purple-600'
                                      }`}></div>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Data Export */}
                        <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <DocumentTextIcon className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">Veri Yönetimi</h4>
                              <p className="text-sm text-gray-600 mb-4">Kişisel verilerinizi indirin veya silin</p>
                              
                              <div className="flex space-x-3">
                                <button className="btn btn-secondary">
                                  📥 Verilerimi İndir
                                </button>
                                <button className="btn btn-danger">
                                  🗑️ Hesabımı Sil
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Verilerinizi indirmek veya hesabınızı silmek için destek ekibimizle iletişime geçin.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                </StaggerContainer>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <StaggerContainer className="space-y-6">
                  <StaggerItem>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Uygulama Tercihleri</h3>
                      <p className="text-sm text-gray-600 mb-6">Uygulamanızı kişiselleştirin ve deneyiminizi optimize edin.</p>
                      
                      <div className="space-y-6">
                        {/* Language & Region */}
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <LanguageIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">Dil ve Bölge</h4>
                              <p className="text-sm text-gray-600 mb-4">Uygulama dilini ve bölgesel ayarları seçin</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Dil</label>
                                  <select
                                    value={settings.preferences.language}
                                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                  >
                                    <option value="tr">🇹🇷 Türkçe</option>
                                    <option value="en">🇺🇸 English</option>
                                    <option value="de">🇩🇪 Deutsch</option>
                                    <option value="fr">🇫🇷 Français</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Saat Dilimi</label>
                                  <select
                                    value={settings.preferences.timezone}
                                    onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                  >
                                    <option value="Europe/Istanbul">🇹🇷 İstanbul (UTC+3)</option>
                                    <option value="Europe/London">🇬🇧 Londra (UTC+0)</option>
                                    <option value="Europe/Berlin">🇩🇪 Berlin (UTC+1)</option>
                                    <option value="America/New_York">🇺🇸 New York (UTC-5)</option>
                                    <option value="Asia/Tokyo">🇯🇵 Tokyo (UTC+9)</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Theme & Appearance */}
                        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <SunIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">Tema ve Görünüm</h4>
                              <p className="text-sm text-gray-600 mb-4">Uygulamanın görsel temasını seçin</p>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-3">Tema Seçimi</label>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                      { value: 'light', label: 'Açık Tema', icon: SunIcon, desc: 'Parlak ve temiz görünüm', color: 'from-yellow-400 to-orange-500' },
                                      { value: 'dark', label: 'Koyu Tema', icon: MoonIcon, desc: 'Göz yormayan koyu görünüm', color: 'from-gray-700 to-gray-900' },
                                      { value: 'auto', label: 'Otomatik', icon: CogIcon, desc: 'Sistem ayarına göre', color: 'from-blue-500 to-purple-600' }
                                    ].map((theme) => (
                                      <button
                                        key={theme.value}
                                        onClick={() => handlePreferenceChange('theme', theme.value)}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                          settings.preferences.theme === theme.value
                                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }`}
                                      >
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${theme.color} flex items-center justify-center mb-3 mx-auto`}>
                                          <theme.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h5 className="font-medium text-gray-900 mb-1">{theme.label}</h5>
                                        <p className="text-xs text-gray-600">{theme.desc}</p>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <h5 className="font-medium text-gray-900 mb-2">Ek Görünüm Ayarları</h5>
                                  <div className="space-y-3">
                                    <label className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">Animasyonları Etkinleştir</span>
                                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">Yüksek Kontrast</span>
                                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">Büyük Yazı Boyutu</span>
                                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <BellIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">Bildirim Tercihleri</h4>
                              <p className="text-sm text-gray-600 mb-4">Bildirimlerin nasıl ve ne zaman gösterileceğini ayarlayın</p>
                              
                              <div className="space-y-4">
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <h5 className="font-medium text-gray-900 mb-3">Bildirim Zamanlaması</h5>
                                  <div className="space-y-2">
                                    <label className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">Sadece çalışma saatleri (09:00-18:00)</span>
                                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">Hafta sonları bildirim gönderme</span>
                                      <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">Sessiz mod (sadece önemli bildirimler)</span>
                                      <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                    </label>
                                  </div>
                                </div>
                                
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <h5 className="font-medium text-gray-900 mb-3">Bildirim Türleri</h5>
                                  <div className="space-y-2">
                                    <label className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">🔔 Ses ile bildirim</span>
                                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">📳 Titreşim</span>
                                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">💡 Masaüstü bildirimi</span>
                                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Performance Settings */}
                        <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <CogIcon className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">Performans Ayarları</h4>
                              <p className="text-sm text-gray-600 mb-4">Uygulamanın performansını optimize edin</p>
                              
                              <div className="space-y-4">
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <h5 className="font-medium text-gray-900 mb-3">Veri Kullanımı</h5>
                                  <div className="space-y-2">
                                    <label className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">Otomatik resim sıkıştırma</span>
                                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">Düşük veri modu</span>
                                      <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">Önbellek temizleme</span>
                                      <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                    </label>
                                  </div>
                                </div>
                                
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <h5 className="font-medium text-gray-900 mb-3">Otomatik Güncellemeler</h5>
                                  <div className="space-y-2">
                                    <label className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">Otomatik güncelleme kontrolü</span>
                                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">Arka plan senkronizasyonu</span>
                                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                </StaggerContainer>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <StaggerContainer className="space-y-6">
                  <StaggerItem>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Güvenlik Ayarları</h3>
                      <p className="text-sm text-gray-600 mb-6">Hesabınızın güvenliğini artırın ve güvenlik tercihlerinizi yönetin.</p>
                      
                      <div className="space-y-6">
                        {/* Password Management */}
                        <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <KeyIcon className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">Şifre Yönetimi</h4>
                              <p className="text-sm text-gray-600 mb-4">Hesap güvenliğiniz için düzenli olarak şifrenizi değiştirin</p>
                              
                              <div className="space-y-4">
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-medium text-gray-900">Şifre Değiştir</h5>
                                    <button
                                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                                      className="btn btn-secondary btn-sm"
                                    >
                                      {showPasswordForm ? 'İptal' : 'Değiştir'}
                                    </button>
                                  </div>
                                  
                                  {showPasswordForm && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      className="space-y-4"
                                    >
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
                                        <input
                                          type="password"
                                          value={passwordData.currentPassword}
                                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                          placeholder="••••••••"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                                        <input
                                          type="password"
                                          value={passwordData.newPassword}
                                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                          placeholder="••••••••"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre Tekrar</label>
                                        <input
                                          type="password"
                                          value={passwordData.confirmPassword}
                                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                          placeholder="••••••••"
                                        />
                                      </div>
                                      <button
                                        onClick={changePassword}
                                        className="btn btn-primary w-full"
                                      >
                                        🔐 Şifreyi Değiştir
                                      </button>
                                    </motion.div>
                                  )}
                                </div>
                                
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <h5 className="font-medium text-gray-900 mb-2">Şifre Güvenlik Durumu</h5>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">Şifre Güçlü</span>
                                      <span className="text-green-600 text-sm">✅ Güçlü</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">Son Değişiklik</span>
                                      <span className="text-gray-600 text-sm">15 Ocak 2024</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">Önerilen Değişiklik</span>
                                      <span className="text-orange-600 text-sm">⏰ 30 gün içinde</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Two-Factor Authentication */}
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">İki Faktörlü Doğrulama (2FA)</h4>
                              <p className="text-sm text-gray-600 mb-4">Hesabınızı ekstra güvenlik katmanı ile koruyun</p>
                              
                              <div className="space-y-4">
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <h5 className="font-medium text-gray-900">SMS Doğrulama</h5>
                                      <p className="text-sm text-gray-600">Telefon numaranıza gönderilen kod ile doğrulama</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={settings.security.twoFactor}
                                        onChange={(e) => handleSecurityChange('twoFactor', e.target.checked)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    📱 +90 555 *** ** 67 numaralı telefonunuza kod gönderilecek
                                  </div>
                                </div>
                                
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <h5 className="font-medium text-gray-900">Authenticator App</h5>
                                      <p className="text-sm text-gray-600">Google Authenticator veya benzeri uygulama</p>
                                    </div>
                                    <button className="btn btn-secondary btn-sm">
                                      Kurulum
                                    </button>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    🔐 Google Authenticator, Authy gibi uygulamalar ile QR kod tarayarak kurulum yapabilirsiniz
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Login Security */}
                        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <DevicePhoneMobileIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">Giriş Güvenliği</h4>
                              <p className="text-sm text-gray-600 mb-4">Giriş yapma güvenliğinizi artırın</p>
                              
                              <div className="space-y-4">
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <h5 className="font-medium text-gray-900">Giriş Uyarıları</h5>
                                      <p className="text-sm text-gray-600">Yeni cihazlardan giriş yapıldığında bildirim alın</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={settings.security.loginAlerts}
                                        onChange={(e) => handleSecurityChange('loginAlerts', e.target.checked)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                  </div>
                                </div>
                                
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <h5 className="font-medium text-gray-900 mb-3">Oturum Zaman Aşımı</h5>
                                  <p className="text-sm text-gray-600 mb-3">Otomatik çıkış yapma süresi (dakika)</p>
                                  <select
                                    value={settings.security.sessionTimeout}
                                    onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                  >
                                    <option value={15}>⏰ 15 dakika</option>
                                    <option value={30}>⏰ 30 dakika</option>
                                    <option value={60}>⏰ 1 saat</option>
                                    <option value={120}>⏰ 2 saat</option>
                                    <option value={480}>⏰ 8 saat</option>
                                  </select>
                                </div>
                                
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <h5 className="font-medium text-gray-900 mb-3">Aktif Oturumlar</h5>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-700">Chrome - Windows</span>
                                      </div>
                                      <span className="text-xs text-gray-500">Şu anda aktif</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        <span className="text-sm text-gray-700">Safari - iPhone</span>
                                      </div>
                                      <span className="text-xs text-gray-500">2 saat önce</span>
                                    </div>
                                  </div>
                                  <button className="btn btn-secondary btn-sm mt-2 w-full">
                                    🚪 Tüm Oturumları Sonlandır
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Security History */}
                        <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <DocumentTextIcon className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">Güvenlik Geçmişi</h4>
                              <p className="text-sm text-gray-600 mb-4">Son güvenlik aktivitelerinizi görüntüleyin</p>
                              
                              <div className="space-y-3">
                                {[
                                  { action: 'Şifre değiştirildi', time: '15 Ocak 2024, 14:30', status: 'success' },
                                  { action: 'Yeni cihazdan giriş', time: '12 Ocak 2024, 09:15', status: 'warning' },
                                  { action: '2FA etkinleştirildi', time: '10 Ocak 2024, 16:45', status: 'success' },
                                  { action: 'Şüpheli giriş denemesi', time: '8 Ocak 2024, 23:20', status: 'error' }
                                ].map((item, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-2 h-2 rounded-full ${
                                        item.status === 'success' ? 'bg-green-500' :
                                        item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}></div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{item.action}</p>
                                        <p className="text-xs text-gray-600">{item.time}</p>
                                      </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      item.status === 'success' ? 'bg-green-100 text-green-700' :
                                      item.status === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {item.status === 'success' ? '✅ Başarılı' :
                                       item.status === 'warning' ? '⚠️ Uyarı' : '❌ Başarısız'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                </StaggerContainer>
              )}
            </div>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={saveSettings}
                className="btn btn-primary btn-lg"
              >
                Ayarları Kaydet
              </button>
            </div>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
