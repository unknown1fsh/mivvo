// Kimlik doğrulama servisi

import { apiClient } from './apiClient'
import { User, LoginCredentials, RegisterData } from '@/types'

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

export interface LoginResponse extends AuthResponse {
  message: string
}

export interface RegisterResponse extends AuthResponse {
  message: string
}

class AuthService {
  // Giriş yap
  async login(credentials: LoginCredentials): Promise<AuthResponse | null> {
    try {
      const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials)
      
      if (response.success && response.data) {
        // Backend response'u doğru şekilde parse et
        const backendData = response.data.data || response.data
        
        // Token ve user bilgilerini kontrol et
        if (!backendData.token) {
          return null
        }
        
        if (!backendData.user) {
          return null
        }
        
        // Token'ı localStorage'a kaydet
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', backendData.token)
          localStorage.setItem('user', JSON.stringify(backendData.user))
        }
        
        return backendData
      } else {
        return null
      }
    } catch (error) {
      return null
    }
  }

  // Kayıt ol
  async register(userData: RegisterData): Promise<AuthResponse | null> {
    try {
      const response = await apiClient.post<RegisterResponse>('/api/auth/register', userData)
      
      if (response.success && response.data) {
        // Backend response'u doğru şekilde parse et
        const backendData = response.data.data || response.data
        
        // Token ve user bilgilerini kontrol et
        if (!backendData.token) {
          return null
        }
        
        if (!backendData.user) {
          return null
        }
        
        // Token'ı localStorage'a kaydet
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', backendData.token)
          localStorage.setItem('user', JSON.stringify(backendData.user))
        }
        
        return backendData
      } else {
        return null
      }
    } catch (error) {
      return null
    }
  }

  // Çıkış yap
  async logout(): Promise<boolean> {
    const token = this.getToken()
    
    try {
      // Sadece geçerli token varsa logout API'sini çağır
      if (token) {
        await apiClient.post('/api/auth/logout')
      }
    } catch (error) {
      // Hata durumunda sessizce devam et
    } finally {
      // Local storage'ı temizle
      this.clearStorage()
    }
    
    return true
  }

  // Token yenile
  async refreshToken(): Promise<string | null> {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refresh_token') 
      : null

    if (!refreshToken) return null

    const response = await apiClient.post<{ token: string }>('/api/auth/refresh', {
      refreshToken
    })

    if (response.success && response.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.token)
      }
      return response.data.token
    }

    return null
  }

  // Mevcut kullanıcıyı al
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    
    const userStr = localStorage.getItem('user')
    if (!userStr || userStr === 'undefined' || userStr === 'null') return null

    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error('User parse error:', error)
      // Geçersiz user verisini temizle
      localStorage.removeItem('user')
      return null
    }
  }

  // Token'ı al
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  // Giriş yapmış mı kontrol et
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    
    const token = this.getToken()
    if (!token) return false

    // Bozuk token kontrolü
    if (token === 'undefined' || token === 'null' || token === '') {
      this.clearStorage()
      return false
    }

    try {
      // Token formatını kontrol et (JWT formatı: header.payload.signature)
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) {
        this.clearStorage()
        return false
      }

      // Token'ın boş olup olmadığını kontrol et
      if (tokenParts[1] === '' || tokenParts[1] === 'undefined' || tokenParts[1] === 'null') {
        this.clearStorage()
        return false
      }

      // Payload kısmını decode et
      const payload = JSON.parse(atob(tokenParts[1]))
      const now = Date.now() / 1000
      
      // Token'ın süresi dolmuşsa temizle
      if (payload.exp && payload.exp <= now) {
        this.clearStorage()
        return false
      }
      
      return true
    } catch (error) {
      // Geçersiz token'ı temizle
      this.clearStorage()
      return false
    }
  }

  // LocalStorage'ı temizle
  clearStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('globalVehicleImages')
    }
  }

  // Şifre sıfırlama
  async requestPasswordReset(email: string): Promise<boolean> {
    const response = await apiClient.post('/api/auth/forgot-password', { email })
    return response.success
  }

  // Şifre sıfırlama doğrulama
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const response = await apiClient.post('/api/auth/reset-password', {
      token,
      password: newPassword
    })
    return response.success
  }

  // Email doğrulama
  async verifyEmail(token: string): Promise<boolean> {
    const response = await apiClient.post('/api/auth/verify-email', { token })
    return response.success
  }

  // Email doğrulama tekrar gönder
  async resendVerificationEmail(): Promise<boolean> {
    const response = await apiClient.post('/api/auth/resend-verification')
    return response.success
  }
}

export const authService = new AuthService()
export default authService
