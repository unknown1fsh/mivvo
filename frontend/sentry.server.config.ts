/**
 * Sentry Server Configuration
 * 
 * Next.js server-side için Sentry yapılandırması.
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  beforeSend(event, hint) {
    // Production'da hassas bilgileri filtrele
    if (process.env.NODE_ENV === 'production') {
      if (event.request) {
        if (event.request.data) {
          delete event.request.data.password;
          delete event.request.data.token;
        }
      }
    }
    return event;
  },
});

