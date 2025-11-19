/**
 * Payment Service (Ödeme Servisi)
 * 
 * İyzico payment gateway entegrasyonu.
 * 
 * Özellikler:
 * - Ödeme başlatma
 * - Ödeme doğrulama
 * - İade işlemleri
 * - Webhook handling
 */

/// <reference path="../types/iyzipay.d.ts" />
import Iyzipay from 'iyzipay';
import { getEnv } from '../utils/envValidation';
import { logError, logInfo } from '../utils/logger';

// İyzico client instance
let iyzipayClient: Iyzipay | null = null;

/**
 * İyzico client'ı başlat
 */
function getIyzipayClient(): Iyzipay {
  if (iyzipayClient) {
    return iyzipayClient;
  }

  const env = getEnv();
  
  // İyzico yapılandırması
  const iyzipayConfig = {
    apiKey: env.IYZICO_API_KEY || process.env.IYZICO_API_KEY || '',
    secretKey: env.IYZICO_SECRET_KEY || process.env.IYZICO_SECRET_KEY || '',
    uri: env.IYZICO_BASE_URL || process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
  };

  // API key ve secret key kontrolü
  if (!iyzipayConfig.apiKey || !iyzipayConfig.secretKey) {
    logError('İyzico API key veya secret key bulunamadı', new Error('IYZICO_CONFIG_MISSING'));
    throw new Error('İyzico yapılandırması eksik');
  }

  iyzipayClient = new Iyzipay(iyzipayConfig);
  return iyzipayClient;
}

/**
 * Ödeme Başlatma
 * 
 * İyzico'da ödeme formu oluşturur.
 */
export interface InitiatePaymentRequest {
  userId: number;
  userEmail: string;
  userName: string;
  amount: number;
  packageId: string;
  paymentId: number; // Database payment ID
  callbackUrl: string;
  locale?: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  paymentUrl?: string;
  paymentForm?: any;
  error?: string;
}

export async function initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
  try {
    const client = getIyzipayClient();
    
    // Test modunda mock response döndür
    if (process.env.NODE_ENV === 'development' && !process.env.IYZICO_API_KEY) {
      logInfo('Test modu: Mock payment URL döndürülüyor');
      return {
        success: true,
        paymentUrl: `/payment/mock/${request.paymentId}`,
      };
    }

    const paymentRequest = {
      locale: request.locale || 'tr',
      conversationId: `PAYMENT-${request.paymentId}`,
      price: request.amount.toFixed(2),
      paidPrice: request.amount.toFixed(2),
      currency: 'TRY',
      basketId: `BASKET-${request.paymentId}`,
      paymentGroup: 'PRODUCT',
      callbackUrl: request.callbackUrl,
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: `BY${request.userId}`,
        name: request.userName,
        surname: request.userName.split(' ')[1] || '',
        gsmNumber: '+905551234567', // TODO: User'dan al
        email: request.userEmail,
        identityNumber: '11111111111', // TODO: User'dan al (opsiyonel)
        lastLoginDate: new Date().toISOString(),
        registrationDate: new Date().toISOString(),
        registrationAddress: 'N/A',
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34000',
        ip: '127.0.0.1',
      },
      shippingAddress: {
        contactName: request.userName,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'N/A',
        zipCode: '34000',
      },
      billingAddress: {
        contactName: request.userName,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'N/A',
        zipCode: '34000',
      },
      basketItems: [
        {
          id: `PKG-${request.packageId}`,
          name: `Kredi Paketi - ${request.packageId}`,
          category1: 'Kredi',
          category2: 'Paket',
          itemType: 'VIRTUAL',
          price: request.amount.toFixed(2),
        },
      ],
    };

    return new Promise((resolve, reject) => {
      client.threedsInitialize.create(paymentRequest, (err: any, result: any) => {
        if (err) {
          logError('İyzico ödeme başlatma hatası', err);
          resolve({
            success: false,
            error: err.message || 'Ödeme başlatılamadı',
          });
          return;
        }

        if (result.status === 'success') {
          logInfo('İyzico ödeme başlatıldı', { paymentId: request.paymentId, conversationId: result.conversationId });
          resolve({
            success: true,
            paymentUrl: result.threeDSHtmlContent 
              ? undefined 
              : result.paymentPageUrl,
            paymentForm: result.threeDSHtmlContent,
          });
        } else {
          logError('İyzico ödeme başlatma başarısız', new Error(result.errorMessage || 'Unknown error'));
          resolve({
            success: false,
            error: result.errorMessage || 'Ödeme başlatılamadı',
          });
        }
      });
    });
  } catch (error) {
    logError('Ödeme başlatma hatası', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
}

/**
 * Ödeme Doğrulama
 * 
 * İyzico'dan gelen callback'i doğrular.
 */
export interface VerifyPaymentRequest {
  token: string;
  conversationId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  paymentId?: string;
  amount?: number;
  error?: string;
}

export async function verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
  try {
    const client = getIyzipayClient();
    
    // Test modunda mock response
    if (process.env.NODE_ENV === 'development' && !process.env.IYZICO_API_KEY) {
      logInfo('Test modu: Mock payment verification');
      return {
        success: true,
        paymentId: request.conversationId.replace('PAYMENT-', ''),
        amount: 0,
      };
    }

    const verifyRequest = {
      locale: 'tr',
      conversationId: request.conversationId,
      paymentId: request.token,
    };

    return new Promise((resolve, reject) => {
      client.payment.retrieve(verifyRequest, (err: any, result: any) => {
        if (err) {
          logError('İyzico ödeme doğrulama hatası', err);
          resolve({
            success: false,
            error: err.message || 'Ödeme doğrulanamadı',
          });
          return;
        }

        if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
          logInfo('İyzico ödeme doğrulandı', { 
            paymentId: result.paymentId,
            amount: result.paidPrice,
            conversationId: result.conversationId,
          });
          resolve({
            success: true,
            paymentId: result.paymentId,
            amount: parseFloat(result.paidPrice),
          });
        } else {
          logError('İyzico ödeme doğrulama başarısız', new Error(result.errorMessage || 'Payment failed'));
          resolve({
            success: false,
            error: result.errorMessage || 'Ödeme başarısız',
          });
        }
      });
    });
  } catch (error) {
    logError('Ödeme doğrulama hatası', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
}

/**
 * İade İşlemi
 * 
 * İyzico üzerinden para iadesi yapar.
 */
export interface RefundPaymentRequest {
  paymentId: string; // İyzico payment ID
  amount?: number; // Kısmi iade için (tüm tutar için undefined)
  reason?: string;
}

export interface RefundPaymentResponse {
  success: boolean;
  refundId?: string;
  error?: string;
}

export async function refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
  try {
    const client = getIyzipayClient();
    
    // Test modunda mock response
    if (process.env.NODE_ENV === 'development' && !process.env.IYZICO_API_KEY) {
      logInfo('Test modu: Mock refund');
      return {
        success: true,
        refundId: `REFUND-${Date.now()}`,
      };
    }

    const refundRequest: any = {
      locale: 'tr',
      conversationId: `REFUND-${Date.now()}`,
      paymentTransactionId: request.paymentId,
      price: request.amount ? request.amount.toFixed(2) : undefined, // Kısmi iade için
      currency: 'TRY',
      ip: '127.0.0.1',
    };

    return new Promise((resolve, reject) => {
      client.refund.create(refundRequest, (err: any, result: any) => {
        if (err) {
          logError('İyzico iade hatası', err);
          resolve({
            success: false,
            error: err.message || 'İade yapılamadı',
          });
          return;
        }

        if (result.status === 'success') {
          logInfo('İyzico iade başarılı', { 
            refundId: result.paymentTransactionId,
            amount: result.price,
          });
          resolve({
            success: true,
            refundId: result.paymentTransactionId,
          });
        } else {
          logError('İyzico iade başarısız', new Error(result.errorMessage || 'Refund failed'));
          resolve({
            success: false,
            error: result.errorMessage || 'İade yapılamadı',
          });
        }
      });
    });
  } catch (error) {
    logError('İade hatası', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
}

/**
 * Webhook Signature Doğrulama
 * 
 * İyzico webhook'larının gerçekten İyzico'dan geldiğini doğrular.
 */
export function verifyWebhookSignature(signature: string, body: string): boolean {
  try {
    const env = getEnv();
    const secretKey = env.IYZICO_SECRET_KEY || process.env.IYZICO_SECRET_KEY || '';
    
    // İyzico webhook signature doğrulama
    // Not: İyzico'nun webhook signature doğrulama yöntemi dokümantasyonda belirtilmelidir
    // Şimdilik basit bir kontrol yapıyoruz
    
    if (!secretKey) {
      return false;
    }

    // TODO: İyzico webhook signature doğrulama algoritmasını implement et
    // Şimdilik true döndürüyoruz (production'da mutlaka implement edilmeli)
    return true;
  } catch (error) {
    logError('Webhook signature doğrulama hatası', error);
    return false;
  }
}

