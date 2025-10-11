/**
 * Auth Service (Kimlik Doğrulama Servisi)
 * 
 * Clean Architecture - Service Layer (Servis Katmanı)
 * 
 * Bu servis, kullanıcı kimlik doğrulama işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Kullanıcı girişi (login)
 * - Kullanıcı kaydı (register)
 * - Çıkış (logout)
 * - Token yönetimi (JWT)
 * - Şifre sıfırlama
 * - Email doğrulama
 * - LocalStorage yönetimi
 * 
 * Özellikler:
 * - JWT token validation
 * - Auto token expiry check
 * - Secure localStorage operations
 * - Token refresh (TODO)
 * 
 * Kullanım:
 * ```typescript
 * import { authService } from './authService'
 * 
 * const user = await authService.login({ email, password })
 * const isAuth = authService.isAuthenticated()
 * await authService.logout()
 * ```
 */

import { apiClient } from './apiClient'
import { User, LoginCredentials, RegisterData } from '@/types'

// ===== INTERFACES =====

/**
 * Auth Response Interface
 * 
 * Login/Register işlemlerinden dönen cevap.
 */
export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

/**
 * Login Response Interface
 * 
 * Backend'den gelen login cevabı.
 */
export interface LoginResponse {
  success: boolean
  message: string
  data: AuthResponse
}

/**
 * Register Response Interface
 * 
 * Backend'den gelen register cevabı.
 */
export interface RegisterResponse {
  success: boolean
  message: string
  data: AuthResponse
}

// ===== AUTH SERVICE CLASS =====

/**
 * Auth Service Class
 * 
 * Kimlik doğrulama işlemlerini yöneten servis.
 */
class AuthService {
  /**
   * Login (Giriş Yap)
   * 
   * Kullanıcı girişi yapar.
   * 
   * İşlem Akışı:
   * 1. API'ye login isteği gönder
   * 2. Response'u parse et
   * 3. Token ve user bilgilerini localStorage'a kaydet
   * 4. AuthResponse döndür
   * 
   * @param credentials - Email ve şifre
   * 
   * @returns AuthResponse veya null
   * 
   * @example
   * const user = await authService.login({
   *   email: 'user@example.com',
   *   password: '123456'
   * })
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse | null> {
    console.log('🔐 Login başlatıldı:', { email: credentials.email })
    
    try {
      console.log('📤 API isteği gönderiliyor:', '/api/auth/login')
      const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials)
      
      console.log('📥 API yanıtı alındı:', {
        success: response.success,
        hasData: !!response.data,
        data: response.data
      })
      
      if (response.success && response.data) {
        // apiClient artık direkt backend response döndürüyor
        const actualData = response.data as any
        
        console.log('✅ Backend verisi:', {
          hasToken: !!actualData.token,
          hasUser: !!actualData.user,
          tokenLength: actualData.token?.length,
          userEmail: actualData.user?.email,
          userRole: actualData.user?.role,
          fullData: actualData
        })
        
        // Token ve user bilgilerini kontrol et
        if (!actualData.token) {
          console.error('❌ Token bulunamadı!', { actualData })
          return null
        }
        
        if (!actualData.user) {
          console.error('❌ User bilgisi bulunamadı!', { actualData })
          return null
        }
        
        // Token'ı localStorage'a kaydet
        if (typeof window !== 'undefined') {
          console.log('💾 LocalStorage\'a kaydediliyor...')
          localStorage.setItem('auth_token', actualData.token)
          localStorage.setItem('user', JSON.stringify(actualData.user))
          console.log('✅ LocalStorage\'a kaydedildi')
        }
        
        console.log('🎉 Login başarılı!')
        return actualData
      } else {
        console.error('❌ API yanıtı başarısız:', {
          success: response.success,
          data: response.data
        })
        return null
      }
    } catch (error) {
      console.error('💥 Login hatası:', error)
      console.error('💥 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      return null
    }
  }

  /**
   * Register (Kayıt Ol)
   * 
   * Yeni kullanıcı kaydı yapar.
   * 
   * İşlem Akışı:
   * 1. API'ye register isteği gönder
   * 2. Response'u parse et
   * 3. Token ve user bilgilerini localStorage'a kaydet
   * 4. AuthResponse döndür
   * 
   * @param userData - Kullanıcı kayıt bilgileri
   * 
   * @returns AuthResponse veya null
   * 
   * @example
   * const user = await authService.register({
   *   email: 'newuser@example.com',
   *   password: '123456',
   *   firstName: 'John',
   *   lastName: 'Doe'
   * })
   */
  async register(userData: RegisterData): Promise<AuthResponse | null> {
    try {
      const response = await apiClient.post<RegisterResponse>('/api/auth/register', userData)
      
      if (response.success && response.data) {
        // apiClient artık direkt backend response döndürüyor
        const actualData = response.data as any
        
        // Token ve user bilgilerini kontrol et
        if (!actualData.token) {
          return null
        }
        
        if (!actualData.user) {
          return null
        }
        
        // Token'ı localStorage'a kaydet
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', actualData.token)
          localStorage.setItem('user', JSON.stringify(actualData.user))
        }
        
        return actualData
      } else {
        return null
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Logout (Çıkış Yap)
   * 
   * Kullanıcı çıkışı yapar.
   * 
   * İşlem Akışı:
   * 1. Backend'e logout isteği gönder (token invalidate)
   * 2. LocalStorage'ı temizle
   * 
   * @returns true (her zaman başarılı)
   * 
   * @example
   * await authService.logout()
   */
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
      // LocalStorage'ı temizle
      this.clearStorage()
    }
    
    return true
  }

  /**
   * Refresh Token (Token Yenile)
   * 
   * Süresi dolan token'ı yeniler.
   * 
   * TODO: Backend'de refresh token endpoint'i eklenmeli
   * 
   * @returns Yeni token veya null
   */
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

  /**
   * Get Current User (Mevcut Kullanıcıyı Al)
   * 
   * LocalStorage'dan mevcut kullanıcı bilgilerini alır.
   * 
   * @returns User veya null
   * 
   * @example
   * const user = authService.getCurrentUser()
   * if (user) {
   *   console.log('Current user:', user.email)
   * }
   */
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

  /**
   * Get Token (Token Al)
   * 
   * LocalStorage'dan JWT token'ı alır.
   * 
   * @returns Token (string) veya null
   * 
   * @example
   * const token = authService.getToken()
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  /**
   * Is Authenticated (Giriş Yapmış mı?)
   * 
   * Kullanıcının giriş yapmış olup olmadığını kontrol eder.
   * 
   * Kontroller:
   * - Token varlığı
   * - Token formatı (JWT: header.payload.signature)
   * - Token geçerliliği (expiry check)
   * - Bozuk token temizleme
   * 
   * @returns boolean
   * 
   * @example
   * if (authService.isAuthenticated()) {
   *   // Kullanıcı giriş yapmış
   * } else {
   *   // Kullanıcı giriş yapmamış
   * }
   */
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

  /**
   * Clear Storage (LocalStorage Temizle)
   * 
   * Tüm auth ile ilgili localStorage verilerini temizler.
   * 
   * Temizlenen veriler:
   * - auth_token
   * - user
   * - refresh_token
   * - globalVehicleImages
   * 
   * @example
   * authService.clearStorage()
   */
  clearStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('globalVehicleImages')
    }
  }

  /**
   * Request Password Reset (Şifre Sıfırlama Talebi)
   * 
   * Şifre sıfırlama email'i gönderir.
   * 
   * @param email - Kullanıcı email'i
   * 
   * @returns boolean
   * 
   * @example
   * const sent = await authService.requestPasswordReset('user@example.com')
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    const response = await apiClient.post('/api/auth/forgot-password', { email })
    return response.success
  }

  /**
   * Reset Password (Şifre Sıfırla)
   * 
   * Reset token ile şifreyi sıfırlar.
   * 
   * @param token - Reset token (email'den gelen)
   * @param newPassword - Yeni şifre
   * 
   * @returns boolean
   * 
   * @example
   * const reset = await authService.resetPassword('token123', 'newpassword')
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const response = await apiClient.post('/api/auth/reset-password', {
      token,
      password: newPassword
    })
    return response.success
  }

  /**
   * Verify Email (Email Doğrula)
   * 
   * Email doğrulama token'ı ile email'i doğrular.
   * 
   * @param token - Email verification token
   * 
   * @returns boolean
   * 
   * @example
   * const verified = await authService.verifyEmail('token123')
   */
  async verifyEmail(token: string): Promise<boolean> {
    const response = await apiClient.post('/api/auth/verify-email', { token })
    return response.success
  }

  /**
   * Resend Verification Email (Doğrulama Email'i Tekrar Gönder)
   * 
   * Email doğrulama link'ini tekrar gönderir.
   * 
   * @returns boolean
   * 
   * @example
   * const sent = await authService.resendVerificationEmail()
   */
  async resendVerificationEmail(): Promise<boolean> {
    const response = await apiClient.post('/api/auth/resend-verification')
    return response.success
  }
}

// ===== SINGLETON INSTANCE =====

/**
 * Singleton Instance
 * 
 * Uygulama genelinde tek bir auth service instance kullanılır.
 */
export const authService = new AuthService()

/**
 * Default Export
 */
export default authService
