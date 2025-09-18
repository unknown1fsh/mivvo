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
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
    
    if (response.success && response.data) {
      // Token'ı localStorage'a kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      return response.data
    }
    
    return null
  }

  // Kayıt ol
  async register(userData: RegisterData): Promise<AuthResponse | null> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', userData)
    
    if (response.success && response.data) {
      // Token'ı localStorage'a kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      return response.data
    }
    
    return null
  }

  // Çıkış yap
  async logout(): Promise<boolean> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Local storage'ı temizle
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        localStorage.removeItem('refresh_token')
      }
    }
    return true
  }

  // Token yenile
  async refreshToken(): Promise<string | null> {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refresh_token') 
      : null

    if (!refreshToken) return null

    const response = await apiClient.post<{ token: string }>('/auth/refresh', {
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
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error('User parse error:', error)
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
    const token = this.getToken()
    if (!token) return false

    try {
      // JWT token'ı decode et ve expire kontrolü yap
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      return payload.exp > now
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }

  // Şifre sıfırlama
  async requestPasswordReset(email: string): Promise<boolean> {
    const response = await apiClient.post('/auth/forgot-password', { email })
    return response.success
  }

  // Şifre sıfırlama doğrulama
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      password: newPassword
    })
    return response.success
  }

  // Email doğrulama
  async verifyEmail(token: string): Promise<boolean> {
    const response = await apiClient.post('/auth/verify-email', { token })
    return response.success
  }

  // Email doğrulama tekrar gönder
  async resendVerificationEmail(): Promise<boolean> {
    const response = await apiClient.post('/auth/resend-verification')
    return response.success
  }
}

export const authService = new AuthService()
export default authService
