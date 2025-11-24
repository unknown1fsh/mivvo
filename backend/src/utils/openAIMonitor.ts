/**
 * OpenAI Monitoring Utility
 * 
 * OpenAI bağlantı durumunu, request/response'ları izler ve loglar.
 * 
 * Özellikler:
 * - OpenAI bağlantı testi
 * - Request/Response logging
 * - Hata tespiti ve analizi
 * - Database'e kayıt
 */

import OpenAI from 'openai';
import { getPrismaClient } from './prisma';
import { logError, logInfo, logDebug } from './logger';

const prisma = getPrismaClient();

/**
 * OpenAI Bağlantı Test Sonucu
 */
export interface OpenAIConnectionTestResult {
  success: boolean;
  reachable: boolean;
  apiKeyValid: boolean;
  responseTime?: number;
  error?: string;
  errorType?: 'NETWORK' | 'API_KEY' | 'TIMEOUT' | 'RATE_LIMIT' | 'UNKNOWN';
}

/**
 * OpenAI Request Log
 */
export interface OpenAIRequestLog {
  reportId?: number;
  userId?: number;
  serviceType: string;
  model: string;
  requestTimestamp: Date;
  requestSize?: number;
  responseTimestamp?: Date;
  responseTime?: number;
  success: boolean;
  responseSize?: number;
  errorType?: string;
  errorMessage?: string;
  responseContent?: string;
  hasValidResponse?: boolean;
  missingFields?: string[];
}

/**
 * OpenAI Bağlantı Testi
 * 
 * OpenAI'a ulaşıp ulaşamadığını test eder.
 * 
 * @returns Test sonucu
 */
export async function testOpenAIConnection(): Promise<OpenAIConnectionTestResult> {
  const startTime = Date.now();
  
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        reachable: false,
        apiKeyValid: false,
        error: 'OpenAI API key bulunamadı',
        errorType: 'API_KEY'
      };
    }

    // API key format kontrolü (sk- ile başlamalı)
    if (!apiKey.startsWith('sk-')) {
      return {
        success: false,
        reachable: false,
        apiKeyValid: false,
        error: 'OpenAI API key formatı geçersiz',
        errorType: 'API_KEY'
      };
    }

    // Basit bir test request gönder
    const testClient = new OpenAI({
      apiKey,
      timeout: 10000, // 10 saniye test timeout
      maxRetries: 1
    });

    try {
      // Minimal test request (sadece bağlantıyı test etmek için)
      await testClient.models.list();
      
      const responseTime = Date.now() - startTime;
      
      logInfo('OpenAI bağlantı testi başarılı', { responseTime });
      
      return {
        success: true,
        reachable: true,
        apiKeyValid: true,
        responseTime
      };
    } catch (apiError: any) {
      const responseTime = Date.now() - startTime;
      
      // Hata tipini belirle
      let errorType: 'NETWORK' | 'API_KEY' | 'TIMEOUT' | 'RATE_LIMIT' | 'UNKNOWN' = 'UNKNOWN';
      let errorMessage = apiError.message || 'Bilinmeyen hata';
      
      if (apiError.status === 401 || apiError.status === 403) {
        errorType = 'API_KEY';
        errorMessage = 'OpenAI API key geçersiz veya yetkisiz';
      } else if (apiError.code === 'ETIMEDOUT' || apiError.code === 'ECONNABORTED') {
        errorType = 'TIMEOUT';
        errorMessage = 'OpenAI bağlantı zaman aşımı';
      } else if (apiError.status === 429) {
        errorType = 'RATE_LIMIT';
        errorMessage = 'OpenAI rate limit aşıldı';
      } else if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ENOTFOUND') {
        errorType = 'NETWORK';
        errorMessage = 'OpenAI ağ bağlantı hatası';
      }
      
      logError('OpenAI bağlantı testi başarısız', apiError, {
        errorType,
        responseTime
      });
      
      return {
        success: false,
        reachable: errorType === 'NETWORK' ? false : true,
        apiKeyValid: errorType !== 'API_KEY',
        responseTime,
        error: errorMessage,
        errorType
      };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    logError('OpenAI bağlantı testi hatası', error, { responseTime });
    
    return {
      success: false,
      reachable: false,
      apiKeyValid: false,
      responseTime,
      error: error.message || 'Bilinmeyen hata',
      errorType: 'UNKNOWN'
    };
  }
}

/**
 * OpenAI Request Logla
 * 
 * OpenAI API çağrısını loglar ve database'e kaydeder.
 * 
 * @param log - Request log bilgileri
 */
export async function logOpenAIRequest(log: OpenAIRequestLog): Promise<void> {
  try {
    // Console'a log
    const logMessage = log.success 
      ? `✅ OpenAI Request Başarılı - ${log.serviceType} (${log.responseTime}ms)`
      : `❌ OpenAI Request Başarısız - ${log.serviceType}: ${log.errorMessage}`;
    
    console.log(logMessage, {
      reportId: log.reportId,
      userId: log.userId,
      model: log.model,
      responseTime: log.responseTime,
      errorType: log.errorType,
      hasValidResponse: log.hasValidResponse,
      missingFields: log.missingFields
    });

    // Database'e kaydet (eğer tablo varsa)
    // Not: ai_request_logs tablosu oluşturulmalı
    try {
      // Prisma schema'da tablo yoksa sadece console'a log
      // Gelecekte database'e kaydedilebilir
      logDebug('OpenAI request logged', log);
    } catch (dbError) {
      // Database hatası olsa bile devam et
      logError('OpenAI request log database hatası', dbError);
    }
  } catch (error) {
    // Log hatası olsa bile uygulama çalışmaya devam etmeli
    console.error('OpenAI request loglama hatası:', error);
  }
}

/**
 * OpenAI Response Analiz Et
 * 
 * Response'un geçerli olup olmadığını, eksik alanlar olup olmadığını kontrol eder.
 * 
 * @param response - OpenAI response içeriği
 * @param requiredFields - Zorunlu alanlar listesi
 * @returns Analiz sonucu
 */
export function analyzeOpenAIResponse(
  response: string | null | undefined,
  requiredFields: string[] = []
): {
  isValid: boolean;
  isEmpty: boolean;
  isJson: boolean;
  parsedData?: any;
  missingFields: string[];
  error?: string;
} {
  // Boş response kontrolü
  if (!response || response.trim().length === 0) {
    return {
      isValid: false,
      isEmpty: true,
      isJson: false,
      missingFields: requiredFields
    };
  }

  // JSON parse kontrolü
  let parsedData: any;
  try {
    parsedData = JSON.parse(response);
  } catch (parseError) {
    return {
      isValid: false,
      isEmpty: false,
      isJson: false,
      missingFields: requiredFields,
      error: `JSON parse hatası: ${parseError instanceof Error ? parseError.message : 'Bilinmeyen hata'}`
    };
  }

  // Zorunlu alanlar kontrolü
  const missingFields: string[] = [];
  for (const field of requiredFields) {
    if (!parsedData[field] && parsedData[field] !== 0 && parsedData[field] !== false) {
      missingFields.push(field);
    }
  }

  return {
    isValid: missingFields.length === 0,
    isEmpty: false,
    isJson: true,
    parsedData,
    missingFields
  };
}

/**
 * OpenAI Request Wrapper
 * 
 * OpenAI API çağrısını sarmalar, loglar ve hataları yakalar.
 * 
 * @param serviceType - Servis tipi (damage, paint, audio, value, comprehensive)
 * @param model - OpenAI model adı
 * @param requestFn - OpenAI API çağrı fonksiyonu
 * @param reportId - Rapor ID (opsiyonel)
 * @param userId - Kullanıcı ID (opsiyonel)
 * @param requiredFields - Zorunlu response alanları (opsiyonel)
 * @returns OpenAI response
 */
export async function wrapOpenAIRequest<T>(
  serviceType: string,
  model: string,
  requestFn: () => Promise<T>,
  reportId?: number,
  userId?: number,
  requiredFields: string[] = []
): Promise<T> {
  const requestTimestamp = new Date();
  let responseTimestamp: Date | undefined;
  let success = false;
  let errorType: string | undefined;
  let errorMessage: string | undefined;
  let responseContent: string | undefined;
  let hasValidResponse = false;
  let missingFields: string[] = [];

  try {
    logDebug('OpenAI request başlatılıyor', {
      serviceType,
      model,
      reportId,
      userId
    });

    // Request gönder
    const response = await requestFn();
    
    responseTimestamp = new Date();
    const responseTime = responseTimestamp.getTime() - requestTimestamp.getTime();
    success = true;

    // Response içeriğini analiz et (eğer string ise)
    if (typeof response === 'object' && response !== null) {
      const responseStr = JSON.stringify(response);
      responseContent = responseStr.substring(0, 1000); // İlk 1000 karakter
      
      if (requiredFields.length > 0) {
        const analysis = analyzeOpenAIResponse(responseStr, requiredFields);
        hasValidResponse = analysis.isValid;
        missingFields = analysis.missingFields;
        
        if (!hasValidResponse) {
          logError('OpenAI response eksik alanlar içeriyor', new Error('Missing fields'), {
            missingFields,
            serviceType,
            reportId
          });
        }
      } else {
        hasValidResponse = true;
      }
    }

    // Başarılı request logla
    await logOpenAIRequest({
      reportId,
      userId,
      serviceType,
      model,
      requestTimestamp,
      responseTimestamp,
      responseTime,
      success: true,
      responseSize: responseContent?.length,
      hasValidResponse,
      missingFields
    });

    logInfo('OpenAI request başarılı', {
      serviceType,
      model,
      reportId,
      responseTime,
      hasValidResponse
    });

    return response;

  } catch (error: any) {
    responseTimestamp = new Date();
    const responseTime = responseTimestamp.getTime() - requestTimestamp.getTime();
    success = false;

    // Hata tipini belirle
    if (error.status === 401 || error.status === 403) {
      errorType = 'API_KEY';
      errorMessage = 'OpenAI API key geçersiz veya yetkisiz';
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorType = 'TIMEOUT';
      errorMessage = 'OpenAI bağlantı zaman aşımı';
    } else if (error.status === 429) {
      errorType = 'RATE_LIMIT';
      errorMessage = 'OpenAI rate limit aşıldı';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorType = 'NETWORK';
      errorMessage = 'OpenAI ağ bağlantı hatası';
    } else {
      errorType = 'UNKNOWN';
      errorMessage = error.message || 'Bilinmeyen hata';
    }

    // Hatalı request logla
    await logOpenAIRequest({
      reportId,
      userId,
      serviceType,
      model,
      requestTimestamp,
      responseTimestamp,
      responseTime,
      success: false,
      errorType,
      errorMessage,
      hasValidResponse: false,
      missingFields: requiredFields
    });

    logError('OpenAI request başarısız', error, {
      serviceType,
      model,
      reportId,
      errorType,
      responseTime
    });

    throw error;
  }
}

/**
 * OpenAI Bağlantı Durumunu Kontrol Et
 * 
 * Periyodik olarak OpenAI bağlantısını kontrol eder.
 * 
 * @returns Bağlantı durumu
 */
export async function checkOpenAIConnectionStatus(): Promise<{
  isConnected: boolean;
  lastCheck: Date;
  testResult?: OpenAIConnectionTestResult;
}> {
  const testResult = await testOpenAIConnection();
  
  return {
    isConnected: testResult.success && testResult.reachable && testResult.apiKeyValid,
    lastCheck: new Date(),
    testResult
  };
}

