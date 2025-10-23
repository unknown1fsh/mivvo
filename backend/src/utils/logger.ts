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
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`;
    
    // Meta data varsa ekle
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
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
 * Vercel'de dosya sistemi erişimi olmadığı için sadece konsol kullan
 */
const logDir = process.env.VERCEL ? '/tmp/logs' : path.join(process.cwd(), 'logs');

// ===== TRANSPORTS =====

/**
 * Transport Konfigürasyonları
 * Vercel'de sadece konsol transport kullan
 */

// Konsol transport (her zaman aktif)
const consoleTransport = new winston.transports.Console({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: consoleFormat,
});

// Vercel'de dosya transport'ları devre dışı bırak
const isVercel = process.env.VERCEL;

// Genel log dosyası (sadece local development için)
const appFileTransport = !isVercel ? new DailyRotateFile({
  filename: path.join(logDir, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: jsonFormat,
  level: 'debug',
}) : null;

// Hata log dosyası (sadece local development için)
const errorFileTransport = !isVercel ? new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: jsonFormat,
  level: 'warn',
}) : null;

// HTTP request log dosyası (sadece local development için)
const httpFileTransport = !isVercel ? new DailyRotateFile({
  filename: path.join(logDir, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: jsonFormat,
  level: 'http',
}) : null;

// Database operation log dosyası (sadece local development için)
const databaseFileTransport = !isVercel ? new DailyRotateFile({
  filename: path.join(logDir, 'database-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: jsonFormat,
  level: 'debug',
}) : null;

// AI Analysis log dosyası (sadece local development için)
const aiAnalysisFileTransport = !isVercel ? new DailyRotateFile({
  filename: path.join(logDir, 'ai-analysis-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: jsonFormat,
  level: 'debug',
}) : null;

// ===== LOGGER INSTANCE =====

/**
 * Ana Logger Instance
 * 
 * Tüm uygulama için merkezi logger
 * Vercel'de sadece konsol transport kullan
 */
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transports: [
    consoleTransport,
    ...(appFileTransport ? [appFileTransport] : []),
    ...(errorFileTransport ? [errorFileTransport] : []),
  ],
  // Hata durumunda exit yapma
  exitOnError: false,
});

// ===== SPECIALIZED LOGGERS =====

/**
 * HTTP Request Logger
 * 
 * Sadece HTTP istekleri için
 * Vercel'de sadece konsol transport kullan
 */
export const httpLogger = winston.createLogger({
  levels: logLevels,
  level: 'http',
  transports: [
    consoleTransport,
    ...(httpFileTransport ? [httpFileTransport] : []),
  ],
  exitOnError: false,
});

/**
 * Database Logger
 * 
 * Sadece database operasyonları için
 * Vercel'de sadece konsol transport kullan
 */
export const databaseLogger = winston.createLogger({
  levels: logLevels,
  level: 'debug',
  transports: [
    consoleTransport,
    ...(databaseFileTransport ? [databaseFileTransport] : []),
  ],
  exitOnError: false,
});

/**
 * AI Analysis Logger
 * 
 * Sadece AI analiz işlemleri için
 * Vercel'de sadece konsol transport kullan
 */
export const aiAnalysisLogger = winston.createLogger({
  levels: logLevels,
  level: 'debug',
  transports: [
    consoleTransport,
    ...(aiAnalysisFileTransport ? [aiAnalysisFileTransport] : []),
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

// Logger başlatma mesajı
logger.info('🚀 Winston Logger başlatıldı', {
  environment: process.env.NODE_ENV,
  logLevel: logger.level,
  transports: logger.transports.map(t => t.constructor.name),
});
