'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { ShieldCheckIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔐 Giriş denemesi:', { username, password })
    setIsLoading(true)
    
    try {
      const response = await fetch('http://localhost:3001/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, captchaToken: 'test-token' })
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      
      const data = await response.json()
      console.log('📦 Response data:', data)
      
      if (data.success) {
        // Token'ı hem localStorage hem de cookie'ye kaydet
        localStorage.setItem('admin_token', data.token)
        localStorage.setItem('admin_user', JSON.stringify(data.user))
        
        // Cookie'ye de kaydet (middleware için)
        document.cookie = `admin_token=${data.token}; path=/; max-age=${4 * 60 * 60}` // 4 saat
        
        console.log('✅ Token kaydedildi:', data.token.substring(0, 20) + '...')
        console.log('👤 User kaydedildi:', data.user)
        
        toast.success('Giriş başarılı! Yönlendiriliyorsunuz...')
        router.push('/admin')
      } else {
        console.error('❌ Giriş başarısız:', data.error)
        toast.error(data.error || 'Giriş başarısız')
      }
    } catch (error) {
      console.error('💥 Hata:', error)
      toast.error('Bir hata oluştu: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo ve Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-300">Güvenli giriş yapın</p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Kullanıcı Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı / Email
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>
            
            {/* Şifre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            {/* CAPTCHA - DEVRE DIŞI */}
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <p className="text-sm text-green-600">✓ Güvenlik doğrulaması devre dışı (Test modu)</p>
              </div>
            </div>
            
            {/* Giriş Butonu */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Güvenli Giriş'}
            </Button>
          </form>
          
          {/* Güvenlik Uyarısı */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
              🔒 Bu sayfa güvenli bir bağlantı ile korunmaktadır. 
              Giriş bilgilerinizi kimseyle paylaşmayın.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            © 2024 MIVVO Ekspertiz. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  )
}
