import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '/api' : 'http://localhost:3001')

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 dakika timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
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
    api.post(process.env.NODE_ENV === 'production' ? '/auth/login' : '/api/auth/login', { email, password }),
  
  register: (userData: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    password: string
  }) =>
    api.post(process.env.NODE_ENV === 'production' ? '/auth/register' : '/api/auth/register', userData),
  
  forgotPassword: (email: string) =>
    api.post(process.env.NODE_ENV === 'production' ? '/auth/forgot-password' : '/api/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post(process.env.NODE_ENV === 'production' ? '/auth/reset-password' : '/api/auth/reset-password', { token, password }),
  
  verifyEmail: (token: string) =>
    api.post(process.env.NODE_ENV === 'production' ? '/auth/verify-email' : '/api/auth/verify-email', { token }),
}

// User API
export const userAPI = {
  getProfile: () =>
    api.get(process.env.NODE_ENV === 'production' ? '/user/profile' : '/api/user/profile'),
  
  updateProfile: (userData: any) =>
    api.put(process.env.NODE_ENV === 'production' ? '/user/profile' : '/api/user/profile', userData),
  
  getCredits: () =>
    api.get(process.env.NODE_ENV === 'production' ? '/user/credits' : '/api/user/credits'),
  
  addCredits: (amount: number) =>
    api.post(process.env.NODE_ENV === 'production' ? '/user/credits' : '/api/user/credits', { amount }),
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
