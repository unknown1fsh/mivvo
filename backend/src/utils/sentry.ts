/**
 * Sentry Error Tracking
 * 
 * Sentry entegrasyonu için utility.
 */

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { getEnv, isProduction } from './envValidation';

let sentryInitialized = false;

/**
 * Sentry'yi başlat
 */
export function initSentry(): void {
  if (sentryInitialized) {
    return;
  }

  const env = getEnv();
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('⚠️ SENTRY_DSN bulunamadı, Sentry devre dışı');
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        nodeProfilingIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: isProduction() ? 0.1 : 1.0, // Production'da %10, development'ta %100
      // Profiling
      profilesSampleRate: isProduction() ? 0.1 : 1.0,
      // Release tracking
      release: process.env.RAILWAY_DEPLOYMENT_ID || undefined,
      // Before send hook
      beforeSend(event, hint) {
        // Production'da hassas bilgileri filtrele
        if (isProduction()) {
          if (event.request && event.request.data && typeof event.request.data === 'object') {
            // Request body'den hassas bilgileri kaldır
            const data = event.request.data as any;
            if (data.password) delete data.password;
            if (data.passwordHash) delete data.passwordHash;
            if (data.token) delete data.token;
          }
        }
        return event;
      },
    });

    sentryInitialized = true;
    console.log('✅ Sentry initialized');
  } catch (error) {
    console.error('❌ Sentry initialization failed:', error);
  }
}

/**
 * Error'ı Sentry'ye gönder
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (!sentryInitialized) {
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setContext(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Message'ı Sentry'ye gönder
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>): void {
  if (!sentryInitialized) {
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setContext(key, context[key]);
      });
    }
    Sentry.captureMessage(message, level);
  });
}

/**
 * User context'i set et
 */
export function setUser(user: { id: number | string; email?: string; username?: string }): void {
  if (!sentryInitialized) {
    return;
  }

  Sentry.setUser({
    id: user.id.toString(),
    email: user.email,
    username: user.username,
  });
}

/**
 * Transaction başlat (Sentry v8+ API)
 */
export function startTransaction<T>(name: string, op: string, callback: () => T): T {
  if (!sentryInitialized) {
    return callback();
  }

  // Sentry v8+ API değişikliği - startSpan kullan
  return Sentry.startSpan({
    name,
    op,
  }, callback);
}

