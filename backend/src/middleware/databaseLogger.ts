/**
 * Database Operation Logger Middleware
 * 
 * Prisma middleware ile database operasyonlarını loglar.
 * 
 * Özellikler:
 * - Query type (findMany, create, update, delete)
 * - Model name
 * - Duration
 * - Result count
 * - Query parameters (opsiyonel)
 * - Error handling
 * - Performance monitoring
 * 
 * Kullanım:
 * ```typescript
 * import { databaseLogger } from './middleware/databaseLogger'
 * 
 * // Prisma client'a middleware ekle
 * prisma.$use(databaseLogger)
 * ```
 */

import { Prisma } from '@prisma/client';
import { databaseLogger, createTimer } from '../utils/logger';

// ===== DATABASE LOGGER MIDDLEWARE =====

/**
 * Database Operation Logger Middleware
 * 
 * Prisma client'a eklenen middleware
 * Tüm database operasyonlarını loglar
 */
export const databaseLoggerMiddleware: Prisma.Middleware = async (params, next) => {
  const timer = createTimer(`DB-${params.model}-${params.action}`);
  
  // Request context oluştur
  const requestContext = {
    model: params.model,
    action: params.action,
    args: sanitizeArgs(params.args),
    timestamp: new Date().toISOString(),
  };
  
  try {
    // Operasyonu çalıştır
    const result = await next(params);
    
    // Süre hesapla
    const duration = timer.end();
    
    // Sadece yavaş veya önemli operasyonları logla
    const resultCount = getResultCount(result, params.action);
    
    if (duration > 500) {
      // Yavaş operasyonlar için uyarı
      databaseLogger.warn(`⏱️  Yavaş Sorgu: ${params.model}.${params.action} ${duration}ms sürdü, ${resultCount} kayıt`, {
        duration,
        resultCount,
      });
    } else {
      // Sadece önemli işlemlerini logla (create, update, delete)
      const importantActions = ['create', 'update', 'delete', 'updateMany', 'deleteMany'];
      if (importantActions.includes(params.action)) {
        const actionNames: { [key: string]: string } = {
          'create': 'Oluşturuldu',
          'update': 'Güncellendi',
          'delete': 'Silindi',
          'updateMany': 'Toplu Güncellendi',
          'deleteMany': 'Toplu Silindi',
        };
        
        databaseLogger.debug(`💾 Veritabanı: ${params.model} tablosunda ${actionNames[params.action] || params.action} (${resultCount} kayıt, ${duration}ms)`, {
          duration,
          resultCount,
        });
      }
    }
    
    return result;
    
  } catch (error) {
    const duration = timer.end();
    
    // Hata logla
    databaseLogger.error(`❌ Veritabanı Hatası: ${params.model} tablosunda ${params.action} işlemi başarısız (${duration}ms) - ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`, {
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    throw error;
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Args sanitization
 * 
 * Hassas bilgileri gizler
 */
function sanitizeArgs(args: any): any {
  if (!args) return args;
  
  const sanitized = { ...args };
  
  // Password, token gibi hassas alanları gizle
  if (sanitized.data) {
    sanitized.data = sanitizeObject(sanitized.data);
  }
  
  if (sanitized.where) {
    sanitized.where = sanitizeObject(sanitized.where);
  }
  
  return sanitized;
}

/**
 * Object sanitization
 * 
 * Obje içindeki hassas alanları gizler
 */
function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  
  // Hassas alanları gizle
  const sensitiveFields = ['password', 'token', 'refreshToken', 'secret', 'key'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[HIDDEN]';
    }
  });
  
  // Nested objeleri de sanitize et
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  });
  
  return sanitized;
}

/**
 * Result count hesaplama
 * 
 * Operasyon sonucundaki kayıt sayısını hesaplar
 */
function getResultCount(result: any, action: string): number {
  if (!result) return 0;
  
  switch (action) {
    case 'findMany':
    case 'findFirst':
    case 'findUnique':
      return Array.isArray(result) ? result.length : (result ? 1 : 0);
    
    case 'create':
    case 'update':
    case 'upsert':
      return 1;
    
    case 'delete':
    case 'deleteMany':
      return result.count || 0;
    
    case 'createMany':
      return result.count || 0;
    
    case 'updateMany':
      return result.count || 0;
    
    case 'count':
      return result;
    
    case 'aggregate':
    case 'groupBy':
      return Array.isArray(result) ? result.length : 1;
    
    default:
      return Array.isArray(result) ? result.length : (result ? 1 : 0);
  }
}

// ===== SPECIALIZED LOGGERS =====

/**
 * Query Performance Logger
 * 
 * Sadece yavaş query'leri loglar
 */
export const queryPerformanceLogger: Prisma.Middleware = async (params, next) => {
  const timer = createTimer(`PERF-${params.model}-${params.action}`);
  
  try {
    const result = await next(params);
    const duration = timer.end();
    
    // Sadece yavaş operasyonları logla
    if (duration > 500) { // 500ms
      databaseLogger.warn(`Slow Query Detected`, {
        model: params.model,
        action: params.action,
        duration,
        args: sanitizeArgs(params.args),
        resultCount: getResultCount(result, params.action),
        timestamp: new Date().toISOString(),
      });
    }
    
    return result;
  } catch (error) {
    const duration = timer.end();
    
    databaseLogger.error(`Query Performance Error`, {
      model: params.model,
      action: params.action,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    
    throw error;
  }
};

/**
 * Error Only Logger
 * 
 * Sadece hatalı operasyonları loglar
 */
export const errorOnlyLogger: Prisma.Middleware = async (params, next) => {
  try {
    return await next(params);
  } catch (error) {
    databaseLogger.error(`Database Error`, {
      model: params.model,
      action: params.action,
      args: sanitizeArgs(params.args),
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'UnknownError',
        stack: error instanceof Error ? error.stack : undefined,
      },
      timestamp: new Date().toISOString(),
    });
    
    throw error;
  }
};

/**
 * Audit Logger
 * 
 * Create, Update, Delete operasyonlarını audit loglar
 */
export const auditLogger: Prisma.Middleware = async (params, next) => {
  const auditActions = ['create', 'update', 'delete', 'deleteMany', 'updateMany'];
  
  if (!auditActions.includes(params.action)) {
    return await next(params);
  }
  
  const timer = createTimer(`AUDIT-${params.model}-${params.action}`);
  
  try {
    const result = await next(params);
    const duration = timer.end();
    
    databaseLogger.info(`Database Audit`, {
      model: params.model,
      action: params.action,
      args: sanitizeArgs(params.args),
      resultCount: getResultCount(result, params.action),
      duration,
      timestamp: new Date().toISOString(),
    });
    
    return result;
  } catch (error) {
    const duration = timer.end();
    
    databaseLogger.error(`Database Audit Error`, {
      model: params.model,
      action: params.action,
      args: sanitizeArgs(params.args),
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    
    throw error;
  }
};

// ===== LOGGER CONFIGURATION =====

/**
 * Logger Configuration
 * 
 * Farklı ortamlar için logger yapılandırması
 */
export const getDatabaseLoggerConfig = () => {
  const config: Prisma.Middleware[] = [];
  
  // Development: Tüm operasyonları logla
  if (process.env.NODE_ENV === 'development') {
    config.push(databaseLoggerMiddleware);
  }
  
  // Production: Sadece hataları ve yavaş operasyonları logla
  if (process.env.NODE_ENV === 'production') {
    config.push(errorOnlyLogger);
    config.push(queryPerformanceLogger);
    config.push(auditLogger);
  }
  
  // Test: Minimal logging
  if (process.env.NODE_ENV === 'test') {
    config.push(errorOnlyLogger);
  }
  
  return config;
};

export default databaseLoggerMiddleware;
