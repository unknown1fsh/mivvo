/**
 * HTTP Request Logger Middleware
 * 
 * Morgan + Winston entegrasyonu ile detaylı HTTP request loglama.
 * 
 * Özellikler:
 * - Her HTTP request için detaylı log
 * - Method, URL, status code, response time
 * - Request body (POST/PUT/PATCH için)
 * - Query parameters
 * - User info (authenticated requests için)
 * - IP adresi
 * - User-Agent
 * - Request/Response headers (opsiyonel)
 * 
 * Kullanım:
 * ```typescript
 * import { requestLogger } from './middleware/requestLogger'
 * 
 * app.use(requestLogger)
 * ```
 */

import { Request, Response, NextFunction } from 'express';
import { httpLogger, createRequestContext } from '../utils/logger';

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}


// ===== REQUEST LOGGER MIDDLEWARE =====

/**
 * HTTP Request Logger Middleware
 * 
 * Tüm HTTP isteklerini loglar
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Request başlangıcı zamanı
  const startTime = Date.now();
  
  // Response time hesaplama için middleware
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    // Header zaten gönderilmiş olabilir, kontrol et
    if (!res.headersSent) {
      res.set('X-Response-Time', responseTime.toString());
    }
    
    // Detaylı request context oluştur
    const requestContext = createRequestContext(req);
    
    // Request body ekle (POST/PUT/PATCH için)
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      (requestContext as any).body = req.body;
      
      // Hassas bilgileri gizle
      if ((requestContext as any).body?.password) {
        (requestContext as any).body.password = '[HIDDEN]';
      }
      if ((requestContext as any).body?.token) {
        (requestContext as any).body.token = '[HIDDEN]';
      }
      if ((requestContext as any).body?.refreshToken) {
        (requestContext as any).body.refreshToken = '[HIDDEN]';
      }
    }
    
    // Response bilgileri ekle
    const responseContext = {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      responseTime,
      contentLength: res.get('Content-Length') || '0',
      contentType: res.get('Content-Type'),
    };
    
    // Log seviyesini status code'a göre belirle
    let logLevel: 'info' | 'warn' | 'error' = 'info';
    if (res.statusCode >= 400 && res.statusCode < 500) {
      logLevel = 'warn';
    } else if (res.statusCode >= 500) {
      logLevel = 'error';
    }
    
    // Türkçe ve detaylı format
    const statusText = res.statusCode >= 200 && res.statusCode < 300 ? '✓' : 
                       res.statusCode >= 300 && res.statusCode < 400 ? '↗' : '✗';
    
    // Mesaj oluştur
    let message = `${statusText} ${req.method.padEnd(6)} ${req.path.padEnd(40)} ${res.statusCode}`;
    
    // Süre ve kullanıcı bilgisi ekle
    const extraInfo = [];
    if (responseTime) extraInfo.push(`${responseTime}ms`);
    if (req.user?.id) extraInfo.push(`Kullanıcı:${req.user.id}`);
    
    if (extraInfo.length > 0) {
      message += ` (${extraInfo.join(', ')})`;
    }
    
    httpLogger.log(logLevel, message, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userId: req.user?.id,
    });
    
    // Yavaş istekler için uyarı (3 saniye üzeri)
    if (responseTime > 3000) {
      httpLogger.warn(`⏱️  Yavaş İstek: ${req.method} ${req.path} ${responseTime}ms sürdü`, {
        responseTime,
        userId: req.user?.id,
      });
    }
  });
  
  next();
};

// ===== DETAILED REQUEST LOGGER =====

/**
 * Detaylı Request Logger Middleware
 * 
 * Daha fazla detay ile request loglar
 * (Development için)
 */
export const detailedRequestLogger = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'development') {
    return next();
  }
  
  const startTime = Date.now();
  
  // Request başlangıcı logla
  httpLogger.debug('Request Started', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  });
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Response detayları logla
    httpLogger.debug('Request Completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      responseHeaders: res.getHeaders(),
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });
  });
  
  next();
};

// ===== ERROR REQUEST LOGGER =====

/**
 * Error Request Logger Middleware
 * 
 * Sadece hatalı istekleri loglar
 */
export const errorRequestLogger = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      const requestContext = createRequestContext(req);
      
      httpLogger.error('HTTP Error Request', {
        request: requestContext,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        timestamp: new Date().toISOString(),
      });
    }
  });
  
  next();
};

export default requestLogger;
