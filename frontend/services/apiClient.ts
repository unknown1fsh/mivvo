// API Client - Merkezi HTTP istemcisi

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://mivvo-expertiz.vercel.app'
  : 'http://localhost:3001'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

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

    // Token varsa ekle
    const token = this.getToken()
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }

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
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      // FormData ise Content-Type header'ını kaldır
      let requestBody: string | FormData | undefined
      if (body instanceof FormData) {
        delete requestHeaders['Content-Type']
        requestBody = body
        console.log('📁 FormData kullanılıyor, Content-Type header kaldırıldı')
      } else if (body) {
        requestBody = JSON.stringify(body)
        console.log('📝 JSON body hazırlandı:', body)
      }

      console.log('🚀 Fetch isteği gönderiliyor...')
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log('📡 Response alındı:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        console.error('❌ HTTP Hatası:', {
          status: response.status,
          statusText: response.statusText,
          url
        })
        
        // 401 hatası durumunda token'ı temizle
        if (response.status === 401) {
          console.log('🔒 401 hatası - Token temizleniyor')
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            localStorage.removeItem('refresh_token')
          }
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Response data parse edildi:', data)
      
      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error('💥 API Request Error:', error)
      console.error('💥 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        url,
        method
      })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      }
    }
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  // HTTP Methods
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers })
  }

  async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, headers })
  }

  async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers })
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers })
  }

  async patch<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, headers })
  }

  // File upload
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

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

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/health')
  }
}

// Singleton instance
export const apiClient = new ApiClient()

// Default export
export default apiClient
