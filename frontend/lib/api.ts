import axios from 'axios'

// Resolve API base URL
function getApiBaseUrl(): string {
  // Debug logging
  console.log('🔍 lib/api.ts - API Base URL Resolution:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    isClient: typeof window !== 'undefined',
    currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'server'
  });

  // Railway deployment için NEXT_PUBLIC_API_URL kullan
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim()
  if (apiUrl) {
    console.log('🚀 lib/api.ts - API URL kullanılıyor:', apiUrl)
    // Eğer https:// ile başlamıyorsa ekle
    if (apiUrl.startsWith('https://') || apiUrl.startsWith('http://')) {
      return apiUrl.replace(/\/$/, '')
    }
    return `https://${apiUrl}`.replace(/\/$/, '')
  }

  // Development için localhost
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔧 lib/api.ts - Development mod - localhost kullanılıyor')
    return 'http://localhost:3001'
  }

  // Production'da NEXT_PUBLIC_API_URL yoksa hata ver
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ lib/api.ts - HATA: NEXT_PUBLIC_API_URL environment variable tanımlı değil!')
    console.error('❌ Railway\'de Frontend service\'inin NEXT_PUBLIC_API_URL environment variable\'ını backend service URL\'ine ayarlayın')
    // Production'da fallback kullanma, direkt backend URL'i kullan (güvenlik riski olabilir ama çalışması için)
    if (typeof window !== 'undefined') {
      // Production'da window.location.origin yerine direkt backend URL kullan (eğer NEXT_PUBLIC_API_URL yoksa)
      const origin = window.location.origin
      // www.mivvo.org ise backend URL'ini oluştur
      if (origin.includes('mivvo.org')) {
        const backendUrl = 'https://mivvobackend.up.railway.app'
        console.warn('⚠️ lib/api.ts - Fallback backend URL kullanılıyor:', backendUrl)
        return backendUrl
      }
      console.error('❌ lib/api.ts - Production ortamında NEXT_PUBLIC_API_URL tanımlı değil ve origin tespit edilemedi')
    }
    throw new Error('NEXT_PUBLIC_API_URL environment variable is required in production')
  }

  // Fallback: relative URL (aynı origin) - sadece development için
  console.log('⚠️ lib/api.ts - Fallback - relative URL kullanılıyor')
  return ''
}

// API Base URL'i dinamik olarak çözümle (runtime'da)
function getApiBaseUrlRuntime(): string {
  // Client-side'da runtime'da çözümle
  if (typeof window !== 'undefined') {
    // NEXT_PUBLIC_API_URL environment variable'ı build zamanında inject edilir
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (apiUrl) {
      // Eğer https:// ile başlamıyorsa ekle
      if (apiUrl.startsWith('https://') || apiUrl.startsWith('http://')) {
        return apiUrl.replace(/\/$/, '')
      }
      return `https://${apiUrl}`.replace(/\/$/, '')
    }
    
    // Production ortamında ve NEXT_PUBLIC_API_URL yoksa backend URL'i kullan
    if (process.env.NODE_ENV === 'production') {
      // Railway backend URL'ini direkt kullan
      return 'https://mivvobackend.up.railway.app'
    }
    
    // Development ortamında localhost kullan
    return 'http://localhost:3001'
  }
  
  // Server-side (SSR) için build zamanındaki değeri kullan
  return getApiBaseUrl()
}

// Create axios instance with dynamic base URL interceptor
const api = axios.create({
  baseURL: typeof window !== 'undefined' ? '' : getApiBaseUrl(), // Client-side'da boş, interceptor ile doldurulacak
  timeout: 300000, // 5 dakika timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to dynamically set base URL and add auth token
api.interceptors.request.use(
  (config) => {
    // Client-side'da baseURL'i runtime'da ayarla
    if (typeof window !== 'undefined') {
      const runtimeBaseUrl = getApiBaseUrlRuntime()
      // Eğer config.url relative değilse (absolute URL ise), olduğu gibi bırak
      if (!config.url?.startsWith('http://') && !config.url?.startsWith('https://')) {
        // Relative URL ise baseURL ile birleştir
        if (config.baseURL && !config.baseURL.startsWith('http')) {
          // BaseURL relative ise runtime URL ile değiştir
          config.baseURL = runtimeBaseUrl
        } else if (!config.baseURL) {
          config.baseURL = runtimeBaseUrl
        }
      }
      
      console.log('🔍 lib/api.ts - Axios Request:', {
        url: config.url,
        baseURL: config.baseURL,
        fullURL: config.baseURL ? `${config.baseURL}${config.url || ''}` : config.url,
        method: config.method
      })
    }
    
    // Token ekle
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)


// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  
  register: (userData: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    password: string
  }) =>
    api.post('/api/auth/register', userData),
  
  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/api/auth/reset-password', { token, password }),
  
  verifyEmail: (token: string) =>
    api.post('/api/auth/verify-email', { token }),
}

// User API
export const userAPI = {
  getProfile: () =>
    api.get('/api/user/profile'),
  
  updateProfile: (userData: any) =>
    api.put('/api/user/profile', userData),
  
  getCredits: () =>
    api.get('/api/user/credits'),
  
  addCredits: (amount: number) =>
    api.post('/api/user/credits', { amount }),
}

// Vehicle API
export const vehicleAPI = {
  createReport: (reportData: {
    reportType: string
    vehiclePlate: string
    vehicleBrand: string
    vehicleModel: string
    vehicleYear: number
    vehicleColor: string
    mileage?: number
    images: File[]
  }) => {
    const formData = new FormData()
    Object.keys(reportData).forEach(key => {
      if (key === 'images') {
        reportData.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image)
        })
      } else {
        formData.append(key, reportData[key])
      }
    })
    
    return api.post('/api/vehicle/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // 10 dakika timeout for AI analysis
    })
  },
  
  getReports: (page = 1, limit = 10) =>
    api.get(`/api/vehicle/reports?page=${page}&limit=${limit}`),
  
  getReport: (id: string) =>
    api.get(`/api/vehicle/reports/${id}`),
  
  updateReport: (id: string, data: any) =>
    api.put(`/api/vehicle/reports/${id}`, data),
  
  deleteReport: (id: string) =>
    api.delete(`/api/vehicle/reports/${id}`),
}

// Payment API
export const paymentAPI = {
  createPayment: (paymentData: {
    amount: number
    method: string
    packageId?: string
  }) =>
    api.post('/api/payment/create', paymentData),
  
  getPayments: (page = 1, limit = 10) =>
    api.get(`/api/payment/history?page=${page}&limit=${limit}`),
  
  getPayment: (id: string) =>
    api.get(`/api/payment/${id}`),
  
  processPayment: (id: string, paymentData: any) =>
    api.post(`/api/payment/${id}/process`, paymentData),
}

// Analysis API
export const analysisAPI = {
  // Damage Analysis
  damageAnalysis: {
    start: (vehicleInfo: { plate: string; make?: string; model?: string; year?: number }) =>
      api.post('/api/damage-analysis/start', { vehicleInfo }),
    
    uploadImages: (reportId: string, images: File[]) => {
      const formData = new FormData()
      images.forEach((image, index) => {
        formData.append('images', image)
      })
      return api.post(`/api/damage-analysis/${reportId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
      })
    },
    
    analyze: (reportId: string) =>
      api.post(`/api/damage-analysis/${reportId}/analyze`, {}, { timeout: 300000 }),
    
    getReport: (reportId: string) =>
      api.get(`/api/damage-analysis/${reportId}`),
  },
  
  // Paint Analysis
  paintAnalysis: {
    start: (vehicleInfo: { plate: string; make?: string; model?: string; year?: number }) =>
      api.post('/api/paint-analysis/start', { vehicleInfo }),
    
    uploadImages: (reportId: string, images: File[]) => {
      const formData = new FormData()
      images.forEach((image, index) => {
        formData.append('images', image)
      })
      return api.post(`/api/paint-analysis/${reportId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
      })
    },
    
    analyze: (reportId: string) =>
      api.post(`/api/paint-analysis/${reportId}/analyze`, {}, { timeout: 300000 }),
    
    getReport: (reportId: string) =>
      api.get(`/api/paint-analysis/${reportId}`),
  },
  
  // Audio Analysis
  audioAnalysis: {
    analyze: (vehicleInfo: { plate: string; make?: string; model?: string; year?: number }, audioFiles: File[]) => {
      const formData = new FormData()
      formData.append('vehicleInfo', JSON.stringify(vehicleInfo))
      audioFiles.forEach((audio, index) => {
        formData.append('audioFiles', audio)
      })
      return api.post('/api/engine-sound-analysis/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
      })
    },
    
    getReport: (reportId: string) =>
      api.get(`/api/engine-sound-analysis/${reportId}`),
    
    getHistory: () =>
      api.get('/api/engine-sound-analysis/history'),
    
    getStatus: (reportId: string) =>
      api.get(`/api/engine-sound-analysis/${reportId}/status`),
  },
  
  // Value Estimation
  valueEstimation: {
    start: (vehicleInfo: { plate: string; make?: string; model?: string; year?: number }) =>
      api.post('/api/value-estimation/start', { vehicleInfo }),
    
    uploadImages: (reportId: string, images: File[]) => {
      const formData = new FormData()
      images.forEach((image, index) => {
        formData.append('images', image)
      })
      return api.post(`/api/value-estimation/${reportId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
      })
    },
    
    analyze: (reportId: string) =>
      api.post(`/api/value-estimation/${reportId}/analyze`, {}, { timeout: 300000 }),
    
    getReport: (reportId: string) =>
      api.get(`/api/value-estimation/${reportId}`),
  },
  
  // Comprehensive Expertise
  comprehensiveExpertise: {
    start: (vehicleInfo: { plate: string; make?: string; model?: string; year?: number }) =>
      api.post('/api/comprehensive-expertise/start', { vehicleInfo }),
    
    uploadImages: (reportId: string, images: File[]) => {
      const formData = new FormData()
      images.forEach((image, index) => {
        formData.append('images', image)
      })
      return api.post(`/api/comprehensive-expertise/${reportId}/upload-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
      })
    },
    
    uploadAudio: (reportId: string, audioFiles: File[]) => {
      const formData = new FormData()
      audioFiles.forEach((audio, index) => {
        formData.append('audioFiles', audio)
      })
      return api.post(`/api/comprehensive-expertise/${reportId}/upload-audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
      })
    },
    
    analyze: (reportId: string) =>
      api.post(`/api/comprehensive-expertise/${reportId}/analyze`, {}, { timeout: 600000 }),
    
    getReport: (reportId: string) =>
      api.get(`/api/comprehensive-expertise/${reportId}`),
  },
}

// Admin API
export const adminAPI = {
  getUsers: (page = 1, limit = 10) =>
    api.get(`/api/admin/users?page=${page}&limit=${limit}`),
  
  getUser: (id: string) =>
    api.get(`/api/admin/users/${id}`),
  
  updateUser: (id: string, userData: any) =>
    api.put(`/api/admin/users/${id}`, userData),
  
  deleteUser: (id: string) =>
    api.delete(`/api/admin/users/${id}`),
  
  getReports: (page = 1, limit = 10) =>
    api.get(`/api/admin/reports?page=${page}&limit=${limit}`),
  
  getReport: (id: string) =>
    api.get(`/api/admin/reports/${id}`),
  
  updateReport: (id: string, data: any) =>
    api.put(`/api/admin/reports/${id}`, data),
  
  getPayments: (page = 1, limit = 10) =>
    api.get(`/api/admin/payments?page=${page}&limit=${limit}`),
  
  getStats: () =>
    api.get('/api/admin/stats'),
  
  getServicePricing: () =>
    api.get('/api/admin/service-pricing'),
  
  updateServicePricing: (pricing: any) =>
    api.put('/api/admin/service-pricing', pricing),
}

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token)
  api.defaults.headers.Authorization = `Bearer ${token}`
}

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
  delete api.defaults.headers.Authorization
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token')
}

export default api
