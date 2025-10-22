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
import morgan from 'morgan';
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

// ===== MORGAN CUSTOM TOKEN =====

/**
 * Morgan için özel token'lar
 */

// Request body token (POST/PUT/PATCH için)
morgan.token('req-body', (req: Request) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    // Hassas bilgileri gizle
    const body = { ...req.body };
    
    // Password, token gibi hassas alanları gizle
    if (body.password) body.password = '[HIDDEN]';
    if (body.token) body.token = '[HIDDEN]';
    if (body.refreshToken) body.refreshToken = '[HIDDEN]';
    if (body.authorization) body.authorization = '[HIDDEN]';
    
    return JSON.stringify(body);
  }
  return '';
});

// User info token
morgan.token('user-info', (req: Request) => {
  if (req.user) {
    return JSON.stringify({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    });
  }
  return '';
});

// Request ID token (unique request identifier)
morgan.token('req-id', () => {
  return Math.random().toString(36).substr(2, 9);
});

// Response time in milliseconds
morgan.token('response-time-ms', (req: Request, res: Response) => {
  const responseTime = res.get('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '';
});

// ===== MORGAN FORMATS =====

/**
 * Konsol Format (Development)
 * 
 * Renkli, okunabilir format
 */
const consoleFormat = ':req-id [:date[clf]] :method :url :status :response-time-ms :res[content-length] - :user-info';

/**
 * JSON Format (File)
 * 
 * Structured JSON format for file logging
 */
const jsonFormat = JSON.stringify({
  reqId: ':req-id',
  timestamp: ':date[iso]',
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time-ms',
  contentLength: ':res[content-length]',
  userAgent: ':req[user-agent]',
  ip: ':remote-addr',
  userInfo: ':user-info',
  reqBody: ':req-body',
});

// ===== MORGAN STREAMS =====

/**
 * Morgan Winston Stream
 * 
 * Morgan'ın çıktısını Winston'a yönlendirir
 */
const morganWinstonStream = {
  write: (message: string) => {
    // Morgan mesajını parse et
    const logData = parseMorganMessage(message);
    
    // Winston ile logla
    httpLogger.http('HTTP Request', logData);
  }
};

/**
 * Morgan mesajını parse eder
 */
function parseMorganMessage(message: string) {
  // Morgan mesajından bilgileri çıkar
  const parts = message.trim().split(' ');
  
  if (parts.length >= 6) {
    return {
      reqId: parts[0],
      timestamp: parts[1] + ' ' + parts[2],
      method: parts[3],
      url: parts[4],
      status: parseInt(parts[5]),
      responseTime: parts[6] || '0ms',
      contentLength: parts[8] || '0',
    };
  }
  
  return { rawMessage: message };
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
    
    // Winston ile logla
    httpLogger.log(logLevel, `HTTP ${req.method} ${req.path}`, {
      request: requestContext,
      response: responseContext,
      timestamp: new Date().toISOString(),
    });
    
    // Özel durumlar için ek loglar
    if (res.statusCode >= 400) {
      httpLogger.warn(`HTTP Error Response`, {
        statusCode: res.statusCode,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Yavaş istekler için uyarı
    if (responseTime > 5000) { // 5 saniye
      httpLogger.warn(`Slow Request Detected`, {
        method: req.method,
        url: req.url,
        responseTime,
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
      });
    }
  });
  
  // Morgan middleware'i çalıştır
  morgan(consoleFormat, { stream: morganWinstonStream })(req, res, next);
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
