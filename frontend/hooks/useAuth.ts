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
    setIsLoading(true)
    try {
      const authData = await authService.login(credentials)
      
      if (authData) {
        setIsAuthenticated(true)
        setUser(authData.user)
        toast.success('Giriş başarılı!')
        return true
      } else {
        toast.error('Giriş başarısız! Email veya şifrenizi kontrol edin.')
        return false
      }
    } catch (error: any) {
      toast.error(error.message || 'Giriş başarısız! Bir hata oluştu.')
      return false
    } finally {
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
