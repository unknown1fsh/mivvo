'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import { User, LoginCredentials } from '@/types'
import toast from 'react-hot-toast'

interface AuthHook {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  requireAuth: () => boolean
}

export const useAuth = (): AuthHook => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const checkAuthStatus = useCallback(() => {
    try {
      const authenticated = authService.isAuthenticated()
      setIsAuthenticated(authenticated)
      
      if (authenticated) {
        const currentUser = authService.getCurrentUser()
        setUser(currentUser)
      } else {
        setUser(null)
      }
      
      setIsLoading(false)
    } catch (error) {
      setIsAuthenticated(false)
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    console.log('🔑 useAuth login başlatıldı:', { email: credentials.email })
    setIsLoading(true)
    
    try {
      console.log('📞 authService.login çağrılıyor...')
      const authData = await authService.login(credentials)
      
      console.log('📥 authService.login sonucu:', {
        hasAuthData: !!authData,
        hasUser: !!authData?.user,
        hasToken: !!authData?.token,
        userEmail: authData?.user?.email
      })
      
      if (authData) {
        console.log('✅ Login başarılı - State güncelleniyor')
        setIsAuthenticated(true)
        setUser(authData.user)
        toast.success('Giriş başarılı!')
        console.log('🎉 Login tamamlandı!')
        return true
      } else {
        console.error('❌ Login başarısız - authData null')
        toast.error('Giriş başarısız! Email veya şifrenizi kontrol edin.')
        return false
      }
    } catch (error: any) {
      console.error('💥 useAuth login hatası:', error)
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack
      })
      toast.error(error.message || 'Giriş başarısız! Bir hata oluştu.')
      return false
    } finally {
      console.log('🏁 useAuth login tamamlandı')
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setIsAuthenticated(false)
      setUser(null)
      toast.success('Başarıyla çıkış yapıldı')
      router.push('/login')
    } catch (error) {
      toast.error('Çıkış yapılırken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const requireAuth = useCallback(() => {
    if (!isAuthenticated && !isLoading) {
      toast.error('Bu sayfaya erişmek için giriş yapmalısınız')
      router.push('/login')
      return false
    }
    return true
  }, [isAuthenticated, isLoading, router])

  return { isAuthenticated, isLoading, user, login, logout, requireAuth }
}
