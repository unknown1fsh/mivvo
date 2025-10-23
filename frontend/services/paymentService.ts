/**
 * Payment Service (Ödeme Servisi)
 * 
 * Clean Architecture - Service Layer (Servis Katmanı)
 * 
 * Bu servis, ödeme işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Ödeme başlatma
 * - Ödeme doğrulama
 * - Para iadesi
 * 
 * Kullanım:
 * ```typescript
 * import { paymentService } from './paymentService'
 * 
 * const payment = await paymentService.initiatePayment({
 *   packageId: 'professional',
 *   paymentMethod: 'card'
 * })
 * ```
 */

import { apiClient } from './apiClient'

// ===== INTERFACES =====

export interface PaymentInitiateRequest {
  packageId: 'starter' | 'professional' | 'enterprise'
  paymentMethod: 'card' | 'bank' | 'mobile'
}

export interface PaymentInitiateResponse {
  success: boolean
  message: string
  data: {
    paymentId: string
    paymentUrl: string
    amount: number
    package: {
      id: string
      credits: number
      bonus: number
      price: number
    }
  }
}

export interface PaymentVerifyRequest {
  paymentId: string
  status: 'success' | 'failed' | 'pending'
}

export interface PaymentVerifyResponse {
  success: boolean
  message: string
  data?: {
    creditsAdded: number
    bonusCredits: number
    newBalance: number
  }
}

export interface RefundRequest {
  paymentId: string
}

export interface RefundResponse {
  success: boolean
  message: string
}

// ===== SERVICE METHODS =====

/**
 * Ödeme İşlemini Başlat
 * 
 * @param request - Ödeme başlatma parametreleri
 * @returns Promise<PaymentInitiateResponse> - Ödeme başlatma sonucu
 * @throws Error - API hatası
 */
export const initiatePayment = async (request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> => {
  try {
    const response = await apiClient.post('/payment/initiate', request)
    const data = response.data as any
    
    if (data.success) {
      return data
    } else {
      throw new Error(data.message || 'Ödeme başlatılamadı')
    }
  } catch (error: any) {
    console.error('Payment initiation error:', error)
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else if (error.message) {
      throw error
    } else {
      throw new Error('Ödeme işlemi başlatılamadı')
    }
  }
}

/**
 * Ödeme İşlemini Doğrula
 * 
 * @param request - Ödeme doğrulama parametreleri
 * @returns Promise<PaymentVerifyResponse> - Ödeme doğrulama sonucu
 * @throws Error - API hatası
 */
export const verifyPayment = async (request: PaymentVerifyRequest): Promise<PaymentVerifyResponse> => {
  try {
    const response = await apiClient.post('/payment/verify', request)
    const data = response.data as any
    
    if (data.success) {
      return data
    } else {
      throw new Error(data.message || 'Ödeme doğrulanamadı')
    }
  } catch (error: any) {
    console.error('Payment verification error:', error)
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else if (error.message) {
      throw error
    } else {
      throw new Error('Ödeme doğrulanamadı')
    }
  }
}

/**
 * Para İadesi Başlat
 * 
 * @param request - İade parametreleri
 * @returns Promise<RefundResponse> - İade sonucu
 * @throws Error - API hatası
 */
export const refundPayment = async (request: RefundRequest): Promise<RefundResponse> => {
  try {
    const response = await apiClient.post('/payment/refund', request)
    const data = response.data as any
    
    if (data.success) {
      return data
    } else {
      throw new Error(data.message || 'İade işlemi başlatılamadı')
    }
  } catch (error: any) {
    console.error('Payment refund error:', error)
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else if (error.message) {
      throw error
    } else {
      throw new Error('İade işlemi başlatılamadı')
    }
  }
}

// ===== SERVICE OBJECT =====

export const paymentService = {
  initiatePayment,
  verifyPayment,
  refundPayment
}
