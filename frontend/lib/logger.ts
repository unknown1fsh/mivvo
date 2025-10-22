/**
 * Frontend Logger Utility
 * 
 * Frontend için detaylı logging sistemi.
 * 
 * Özellikler:
 * - Development: detaylı konsol logları (renkli)
 * - Production: minimal logları (sadece error/warning)
 * - Log levels: debug, info, warn, error
 * - Context bilgisi (component, action, timestamp)
 * - API request/response logging
 * - State management logging
 * - Error boundary logging
 * 
 * Kullanım:
 * ```typescript
 * import { logger } from '../lib/logger'
 * 
 * logger.info('Component mounted', { component: 'UserProfile', userId: 123 })
 * logger.error('API request failed', { endpoint: '/api/users', error: error.message })
 * ```
 */

// ===== LOG LEVELS =====

/**
 * Log Seviyeleri
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// ===== LOG COLORS =====

/**
 * Konsol renkleri
 */
const colors = {
  debug: '#888888',
  info: '#00ff00',
  warn: '#ffaa00',
  error: '#ff0000',
  reset: '#ffffff',
};

// ===== LOGGER CONFIGURATION =====

/**
 * Logger yapılandırması
 */
const config = {
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.WARN,
  enableConsole: true,
  enableFile: false, // Frontend'de dosya loglama yok
  enableTimestamp: true,
  enableContext: true,
};

// ===== LOGGER INTERFACE =====

/**
 * Log entry interface
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  context?: any;
  timestamp: string;
  component?: string;
  action?: string;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Timestamp oluşturucu
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Log level string dönüştürücü
 */
function getLevelString(level: LogLevel): string {
  switch (level) {
    case LogLevel.DEBUG: return 'DEBUG';
    case LogLevel.INFO: return 'INFO';
    case LogLevel.WARN: return 'WARN';
    case LogLevel.ERROR: return 'ERROR';
    default: return 'UNKNOWN';
  }
}

/**
 * Konsol renk formatı
 */
function getColorFormat(level: LogLevel): string {
  switch (level) {
    case LogLevel.DEBUG: return colors.debug;
    case LogLevel.INFO: return colors.info;
    case LogLevel.WARN: return colors.warn;
    case LogLevel.ERROR: return colors.error;
    default: return colors.reset;
  }
}

/**
 * Log mesajını formatla
 */
function formatMessage(entry: LogEntry): string {
  const { level, message, context, timestamp, component, action } = entry;
  
  let formattedMessage = `%c[${getLevelString(level)}]`;
  
  if (config.enableTimestamp) {
    formattedMessage += ` ${timestamp}`;
  }
  
  if (component) {
    formattedMessage += ` [${component}]`;
  }
  
  if (action) {
    formattedMessage += ` [${action}]`;
  }
  
  formattedMessage += `: ${message}`;
  
  return formattedMessage;
}

/**
 * Context'i formatla
 */
function formatContext(context: any): string {
  if (!context || Object.keys(context).length === 0) {
    return '';
  }
  
  return `\n${JSON.stringify(context, null, 2)}`;
}

// ===== LOGGER CLASS =====

/**
 * Frontend Logger Class
 */
class FrontendLogger {
  private level: LogLevel;
  
  constructor() {
    this.level = config.level;
  }
  
  /**
   * Log seviyesini kontrol et
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }
  
  /**
   * Log yazdır
   */
  private log(level: LogLevel, message: string, context?: any, component?: string, action?: string): void {
    if (!this.shouldLog(level)) {
      return;
    }
    
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: getTimestamp(),
      component,
      action,
    };
    
    if (config.enableConsole) {
      this.logToConsole(entry);
    }
  }
  
  /**
   * Konsola log yazdır
   */
  private logToConsole(entry: LogEntry): void {
    const formattedMessage = formatMessage(entry);
    const color = getColorFormat(entry.level);
    const contextString = entry.context ? formatContext(entry.context) : '';
    
    // Console method'unu seç
    let consoleMethod: keyof Console;
    switch (entry.level) {
      case LogLevel.DEBUG:
        consoleMethod = 'log';
        break;
      case LogLevel.INFO:
        consoleMethod = 'info';
        break;
      case LogLevel.WARN:
        consoleMethod = 'warn';
        break;
      case LogLevel.ERROR:
        consoleMethod = 'error';
        break;
      default:
        consoleMethod = 'log';
    }
    
    // Log yazdır
    if (contextString) {
      console[consoleMethod](formattedMessage, `color: ${color}`, contextString);
    } else {
      console[consoleMethod](formattedMessage, `color: ${color}`);
    }
  }
  
  // ===== PUBLIC METHODS =====
  
  /**
   * Debug log
   */
  debug(message: string, context?: any, component?: string, action?: string): void {
    this.log(LogLevel.DEBUG, message, context, component, action);
  }
  
  /**
   * Info log
   */
  info(message: string, context?: any, component?: string, action?: string): void {
    this.log(LogLevel.INFO, message, context, component, action);
  }
  
  /**
   * Warning log
   */
  warn(message: string, context?: any, component?: string, action?: string): void {
    this.log(LogLevel.WARN, message, context, component, action);
  }
  
  /**
   * Error log
   */
  error(message: string, context?: any, component?: string, action?: string): void {
    this.log(LogLevel.ERROR, message, context, component, action);
  }
  
  // ===== SPECIALIZED METHODS =====
  
  /**
   * API Request log
   */
  apiRequest(method: string, url: string, context?: any): void {
    this.info(`API Request: ${method} ${url}`, {
      method,
      url,
      ...context,
    }, 'API', 'REQUEST');
  }
  
  /**
   * API Response log
   */
  apiResponse(method: string, url: string, status: number, duration?: number, context?: any): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API Response: ${method} ${url} - ${status}`, {
      method,
      url,
      status,
      duration,
      ...context,
    }, 'API', 'RESPONSE');
  }
  
  /**
   * API Error log
   */
  apiError(method: string, url: string, error: any, context?: any): void {
    this.error(`API Error: ${method} ${url}`, {
      method,
      url,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    }, 'API', 'ERROR');
  }
  
  /**
   * Component lifecycle log
   */
  componentLifecycle(component: string, lifecycle: 'mount' | 'unmount' | 'update', context?: any): void {
    this.debug(`Component ${lifecycle}: ${component}`, context, component, lifecycle.toUpperCase());
  }
  
  /**
   * State change log
   */
  stateChange(store: string, action: string, prevState: any, nextState: any): void {
    this.debug(`State Change: ${store}.${action}`, {
      store,
      action,
      prevState,
      nextState,
      changes: this.getStateChanges(prevState, nextState),
    }, 'STATE', 'CHANGE');
  }
  
  /**
   * User action log
   */
  userAction(action: string, context?: any): void {
    this.info(`User Action: ${action}`, context, 'USER', 'ACTION');
  }
  
  /**
   * Performance log
   */
  performance(label: string, duration: number, context?: any): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG;
    this.log(level, `Performance: ${label} - ${duration}ms`, {
      label,
      duration,
      ...context,
    }, 'PERFORMANCE', 'TIMING');
  }
  
  /**
   * Error boundary log
   */
  errorBoundary(error: Error, errorInfo: any, component?: string): void {
    this.error(`Error Boundary: ${error.message}`, {
      error: error.message,
      stack: error.stack,
      errorInfo,
      component,
    }, component || 'ERROR_BOUNDARY', 'ERROR');
  }
  
  // ===== UTILITY METHODS =====
  
  /**
   * State değişikliklerini tespit et
   */
  private getStateChanges(prevState: any, nextState: any): any {
    if (!prevState || !nextState) return {};
    
    const changes: any = {};
    
    Object.keys(nextState).forEach(key => {
      if (prevState[key] !== nextState[key]) {
        changes[key] = {
          from: prevState[key],
          to: nextState[key],
        };
      }
    });
    
    return changes;
  }
  
  /**
   * Log seviyesini değiştir
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  /**
   * Mevcut log seviyesini al
   */
  getLevel(): LogLevel {
    return this.level;
  }
}

// ===== SINGLETON INSTANCE =====

/**
 * Singleton logger instance
 */
export const logger = new FrontendLogger();

/**
 * Default export
 */
export default logger;

// ===== CONVENIENCE EXPORTS =====

/**
 * Convenience functions
 */
export const logDebug = (message: string, context?: any, component?: string, action?: string) => 
  logger.debug(message, context, component, action);

export const logInfo = (message: string, context?: any, component?: string, action?: string) => 
  logger.info(message, context, component, action);

export const logWarn = (message: string, context?: any, component?: string, action?: string) => 
  logger.warn(message, context, component, action);

export const logError = (message: string, context?: any, component?: string, action?: string) => 
  logger.error(message, context, component, action);

// Logger başlatma mesajı
logger.info('🚀 Frontend Logger başlatıldı', {
  environment: process.env.NODE_ENV,
  logLevel: getLevelString(logger.getLevel()),
  enableConsole: config.enableConsole,
  enableTimestamp: config.enableTimestamp,
});
