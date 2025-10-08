/**
 * API Client (API İstemci)
 * 
 * Clean Architecture - Service Layer (Servis Katmanı)
 * 
 * Bu dosya, tüm HTTP isteklerini yöneten merkezi API istemcisidir.
 * 
 * Sorumluluklar:
 * - HTTP isteklerini (GET, POST, PUT, DELETE, PATCH) yönetme
 * - JWT token yönetimi (Authorization header)
 * - Request/Response interceptor
 * - Hata yönetimi ve loglama
 * - File upload desteği
 * - Timeout yönetimi
 * 
 * Özellikler:
 * - Singleton pattern
 * - TypeScript generic support
 * - Environment-aware (dev/prod)
 * - FormData desteği (multipart/form-data)
 * - Automatic token injection
 * - Detaylı console loglama
 * - 401 durumunda auto-logout
 * 
 * Kullanım:
 * ```typescript
 * import { apiClient } from './apiClient'
 * 
 * const response = await apiClient.get<User>('/users/me')
 * const response = await apiClient.post<Report>('/reports', { data })
 * ```
 */

// ===== API BASE URL RESOLVER =====

/**
 * Production/Preview ortamlarında güvenli base URL çözümleyici.
 * Öncelik sırası:
 * 1) NEXT_PUBLIC_API_BASE_URL (manuel tanımlanırsa)
 * 2) window ortamı (client) → relative (aynı origin)
 * 3) VERCEL_URL (SSR) → https://{vercel_url}
 * 4) Development → http://localhost:3001
 */
function resolveApiBaseUrl(): string {
  const explicit = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim()
  if (explicit) {
    return explicit.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    // Client tarafında relative istekler (aynı origin)
    return ''
  }

  const vercelUrl = (process.env.VERCEL_URL || '').trim()
  if (vercelUrl) {
    return `https://${vercelUrl}`
  }

  // Production fallback: sabit domain; Development: local backend
  return process.env.NODE_ENV === 'production'
    ? 'https://mivvo-expertiz.vercel.app'
    : 'http://localhost:3001'
}

// ===== INTERFACES =====

/**
 * API Response Interface
 * 
 * Tüm API yanıtları bu formatta döner.
 * 
 * Generic type: T = response data'nın tipi
 */
interface ApiResponse<T = any> {
  success: boolean      // İşlem başarılı mı?
  data?: T             // Response data (başarılı ise)
  error?: string       // Hata mesajı (başarısız ise)
  message?: string     // Bilgi mesajı
}

/**
 * Request Options Interface
 * 
 * HTTP request için opsiyonlar.
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

// ===== API CLIENT CLASS =====

/**
 * API Client Class
 * 
 * Merkezi HTTP istemcisi.
 * 
 * Tüm API istekleri bu class üzerinden yapılır.
 */
class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  /**
   * Constructor
   * 
   * API client'ı başlatır.
   * 
   * @param baseURL - API base URL (default: API_BASE_URL)
   */
  constructor(baseURL: string = resolveApiBaseUrl()) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  /**
   * Request (Genel HTTP İsteği)
   * 
   * Tüm HTTP istekleri bu method üzerinden yapılır.
   * 
   * Özellikler:
   * - Token injection (Authorization header)
   * - FormData desteği (Content-Type auto-remove)
   * - Timeout (default: 120 saniye)
   * - Detaylı loglama
   * - 401 durumunda auto-logout
   * 
   * @param endpoint - API endpoint (örn: '/users/me')
   * @param options - Request opsiyonları
   * 
   * @returns ApiResponse<T>
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 120000 // 2 dakika timeout
    } = options

    const url = `${this.baseURL}${endpoint}`
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    }

    // Token varsa Authorization header'a ekle
    const token = this.getToken()
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }

    // Detaylı console log
    console.log('🌐 API İsteği:', {
      method,
      url,
      endpoint,
      baseURL: this.baseURL,
      hasToken: !!token,
      tokenLength: token?.length,
      headers: requestHeaders,
      body: body ? (body instanceof FormData ? 'FormData' : body) : 'No body'
    })

    try {
      // AbortController ile timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      // FormData ise Content-Type header'ını kaldır (browser otomatik ekler)
      let requestBody: string | FormData | undefined
      if (body instanceof FormData) {
        delete requestHeaders['Content-Type']
        requestBody = body
        console.log('📁 FormData kullanılıyor, Content-Type header kaldırıldı')
      } else if (body) {
        requestBody = JSON.stringify(body)
        console.log('📝 JSON body hazırlandı:', body)
      }

      // Fetch isteği
      console.log('🚀 Fetch isteği gönderiliyor...')
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Response loglama
      console.log('📡 Response alındı:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      // HTTP hata kontrolü
      if (!response.ok) {
        console.error('❌ HTTP Hatası:', {
          status: response.status,
          statusText: response.statusText,
          url
        })

        // 401 hatası durumunda token'ı temizle (unauthorized)
        if (response.status === 401) {
          console.log('🔒 401 hatası - Token temizleniyor')
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            localStorage.removeItem('refresh_token')
          }
        }

        // Hata gövdesini parse etmeye çalış (JSON ise message'ı yüzeye çıkar)
        let errorMessage = response.statusText
        let errorPayload: any = null
        try {
          const contentType = response.headers.get('content-type') || ''
          const raw = await response.text()
          if (contentType.includes('application/json')) {
            try {
              errorPayload = raw ? JSON.parse(raw) : null
            } catch {
              errorPayload = { message: raw }
            }
          } else if (raw) {
            errorPayload = { message: raw }
          }
          if (errorPayload?.message) {
            errorMessage = errorPayload.message
          } else if (errorPayload?.error) {
            errorMessage = errorPayload.error
          }
        } catch {}

        console.error('❌ HTTP Error payload:', errorPayload)
        throw new Error(`HTTP ${response.status}: ${errorMessage}`)
      }

      // Response data parse
      const data = await response.json()
      console.log('✅ Response data parse edildi:', data)
      
      return {
        success: true,
        data,
      }
    } catch (error) {
      // Hata loglama
      console.error('💥 API Request Error:', error)
      console.error('💥 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        url,
        method
      })

      // Abort (timeout/navigasyon) durumlarını daha anlaşılır hale getir ve idempotent GET isteğinde tek seferlik retry yap
      const isAborted = (error as any)?.name === 'AbortError' ||
        (error as any)?.message?.toLowerCase?.().includes('aborted')

      if (isAborted && method === 'GET') {
        try {
          console.warn('⏳ Abort tespit edildi, GET isteği tek seferlik yeniden deneniyor (timeoutsuz)...')
          const retryResponse = await fetch(url, {
            method,
            headers: {
              ...requestHeaders,
            },
          })

          if (!retryResponse.ok) {
            throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`)
          }

          const data = await retryResponse.json()
          return {
            success: true,
            data,
          }
        } catch (retryErr) {
          console.error('❌ Retry başarısız:', retryErr)
          return {
            success: false,
            error: 'İstek iptal edildi veya zaman aşımına uğradı',
          }
        }
      }

      if (isAborted) {
        return {
          success: false,
          error: 'İstek iptal edildi veya zaman aşımına uğradı',
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      }
    }
  }

  /**
   * Get Token (Token Al)
   * 
   * LocalStorage'dan JWT token'ı alır.
   * 
   * @returns Token (string) veya null
   */
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  // ===== HTTP METHODS =====

  /**
   * GET Request
   * 
   * HTTP GET isteği yapar.
   * 
   * @param endpoint - API endpoint
   * @param headers - Ek headers (opsiyonel)
   * 
   * @returns ApiResponse<T>
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers })
  }

  /**
   * POST Request
   * 
   * HTTP POST isteği yapar.
   * 
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param headers - Ek headers (opsiyonel)
   * 
   * @returns ApiResponse<T>
   */
  async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, headers })
  }

  /**
   * PUT Request
   * 
   * HTTP PUT isteği yapar.
   * 
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param headers - Ek headers (opsiyonel)
   * 
   * @returns ApiResponse<T>
   */
  async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers })
  }

  /**
   * DELETE Request
   * 
   * HTTP DELETE isteği yapar.
   * 
   * @param endpoint - API endpoint
   * @param headers - Ek headers (opsiyonel)
   * 
   * @returns ApiResponse<T>
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers })
  }

  /**
   * PATCH Request
   * 
   * HTTP PATCH isteği yapar.
   * 
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param headers - Ek headers (opsiyonel)
   * 
   * @returns ApiResponse<T>
   */
  async patch<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, headers })
  }

  /**
   * File Upload (Dosya Yükleme)
   * 
   * Dosya yükleme işlemi yapar (multipart/form-data).
   * 
   * @param endpoint - API endpoint
   * @param file - Yüklenecek dosya
   * @param additionalData - Ek form verileri (opsiyonel)
   * 
   * @returns ApiResponse<T>
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    // Ek veriler varsa ekle
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    // Token header
    const token = this.getToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error('File Upload Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Dosya yükleme hatası',
      }
    }
  }

  /**
   * Health Check (Sağlık Kontrolü)
   * 
   * Backend API'nin çalışıp çalışmadığını kontrol eder.
   * 
   * @returns ApiResponse<{ status: string; timestamp: string }>
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/health')
  }
}

// ===== SINGLETON INSTANCE =====

/**
 * Singleton Instance
 * 
 * Uygulama genelinde tek bir API client instance kullanılır.
 */
export const apiClient = new ApiClient()

/**
 * Default Export
 * 
 * Named export + default export (esneklik için)
 */
export default apiClient
