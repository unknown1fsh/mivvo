/**
 * Winston Logger Utility
 * 
 * Detaylı logging sistemi için Winston yapılandırması.
 * 
 * Özellikler:
 * - Konsol için renkli format (development)
 * - Dosya için JSON format (production + development)
 * - Günlük rotating dosyalar
 * - Log seviyeleri: error, warn, info, http, debug
 * - 30 gün retention policy
 * - Structured logging (JSON)
 * 
 * Kullanım:
 * ```typescript
 * import { logger } from '../utils/logger'
 * 
 * logger.info('Kullanıcı giriş yaptı', { userId: 123, email: 'user@example.com' })
 * logger.error('Database bağlantı hatası', { error: error.message, stack: error.stack })
 * ```
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// ===== LOG LEVELS =====

/**
 * Log Seviyeleri
 * 
 * error: 0   - Sadece hatalar
 * warn:  1   - Uyarılar ve hatalar
 * info:  2   - Bilgi mesajları, uyarılar ve hatalar
 * http:  3   - HTTP istekleri, bilgi mesajları, uyarılar ve hatalar
 * debug: 4   - Tüm loglar (en detaylı)
 */
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// ===== CUSTOM COLORS =====

/**
 * Konsol renkleri
 * 
 * Her log seviyesi için farklı renk
 */
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Winston'a renkleri kaydet
winston.addColors(logColors);

// ===== LOG FORMATS =====

/**
 * Konsol Format
 * 
 * Development için renkli, okunabilir format
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Ana log mesajı (sadeleştirilmiş, detayları mesajda zaten var)
    return `[${timestamp}] ${message}`;
  })
);

/**
 * JSON Format
 * 
 * Dosya için structured JSON format
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ===== LOG DIRECTORY =====

/**
 * Log dosyaları için dizin
 */
const logDir = path.join(process.cwd(), 'logs');

// ===== TRANSPORTS =====

/**
 * Transport Konfigürasyonları
 */

// Konsol transport (her zaman aktif)
const consoleTransport = new winston.transports.Console({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: consoleFormat,
});

// Genel log dosyası
const appFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: jsonFormat,
  level: 'debug',
});

// Hata log dosyası
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: jsonFormat,
  level: 'warn',
});

// HTTP request log dosyası
const httpFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: jsonFormat,
  level: 'http',
});

// Database operation log dosyası
const databaseFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'database-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: jsonFormat,
  level: 'debug',
});

// AI Analysis log dosyası
const aiAnalysisFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'ai-analysis-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: jsonFormat,
  level: 'debug',
});

// ===== LOGGER INSTANCE =====

/**
 * Ana Logger Instance
 * 
 * Tüm uygulama için merkezi logger
 */
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transports: [
    consoleTransport,
    appFileTransport,
    errorFileTransport,
  ],
  // Hata durumunda exit yapma
  exitOnError: false,
});

// ===== SPECIALIZED LOGGERS =====

/**
 * HTTP Request Logger
 * 
 * Sadece HTTP istekleri için
 */
export const httpLogger = winston.createLogger({
  levels: logLevels,
  level: 'http',
  transports: [
    consoleTransport,
    httpFileTransport,
  ],
  exitOnError: false,
});

/**
 * Database Logger
 * 
 * Sadece database operasyonları için
 */
export const databaseLogger = winston.createLogger({
  levels: logLevels,
  level: 'debug',
  transports: [
    consoleTransport,
    databaseFileTransport,
  ],
  exitOnError: false,
});

/**
 * AI Analysis Logger
 * 
 * Sadece AI analiz işlemleri için
 */
export const aiAnalysisLogger = winston.createLogger({
  levels: logLevels,
  level: 'debug',
  transports: [
    consoleTransport,
    aiAnalysisFileTransport,
  ],
  exitOnError: false,
});

// ===== UTILITY FUNCTIONS =====

/**
 * Request Context Helper
 * 
 * HTTP request bilgilerini log için hazırlar
 */
export const createRequestContext = (req: any) => {
  return {
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    userEmail: req.user?.email,
  };
};

/**
 * Error Context Helper
 * 
 * Error bilgilerini log için hazırlar
 */
export const createErrorContext = (error: any, req?: any) => {
  const context: any = {
    message: error.message,
    name: error.name,
    stack: error.stack,
  };

  if (req) {
    context.request = createRequestContext(req);
  }

  return context;
};

/**
 * Performance Timer Helper
 * 
 * İşlem süresini ölçmek için
 */
export const createTimer = (label: string) => {
  const start = Date.now();
  
  return {
    end: () => {
      const duration = Date.now() - start;
      logger.debug(`Timer [${label}]: ${duration}ms`);
      return duration;
    },
    log: (message: string) => {
      const duration = Date.now() - start;
      logger.debug(`Timer [${label}] - ${message}: ${duration}ms`);
    }
  };
};

// ===== LOGGER METHODS =====

/**
 * Logger Methods
 * 
 * Her log seviyesi için özel methodlar
 */

// Error logging
export const logError = (message: string, error?: any, context?: any) => {
  logger.error(message, {
    error: error ? createErrorContext(error) : undefined,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Warning logging
export const logWarning = (message: string, context?: any) => {
  logger.warn(message, {
    context,
    timestamp: new Date().toISOString(),
  });
};

// Info logging
export const logInfo = (message: string, context?: any) => {
  logger.info(message, {
    context,
    timestamp: new Date().toISOString(),
  });
};

// Debug logging
export const logDebug = (message: string, context?: any) => {
  logger.debug(message, {
    context,
    timestamp: new Date().toISOString(),
  });
};

// HTTP request logging
export const logHttpRequest = (message: string, context?: any) => {
  httpLogger.http(message, {
    context,
    timestamp: new Date().toISOString(),
  });
};

// Database operation logging
export const logDatabaseOperation = (operation: string, model: string, duration?: number, context?: any) => {
  databaseLogger.debug(`DB ${operation}`, {
    operation,
    model,
    duration,
    context,
    timestamp: new Date().toISOString(),
  });
};

// AI Analysis logging
export const logAiAnalysis = (step: string, reportId: string, context?: any) => {
  aiAnalysisLogger.info(`AI Analysis [${step}]`, {
    step,
    reportId,
    context,
    timestamp: new Date().toISOString(),
  });
};

// ===== EXPORTS =====

export default logger;
export { logger };
