import rateLimit from 'express-rate-limit';

const loginAttempts = new Map<string, { count: number; resetAt: number }>()

export async function getLoginAttempts(ip: string): Promise<number> {
  const data = loginAttempts.get(ip)
  if (!data) return 0
  
  if (Date.now() > data.resetAt) {
    loginAttempts.delete(ip)
    return 0
  }
  
  return data.count
}

export async function incrementLoginAttempts(ip: string): Promise<void> {
  const data = loginAttempts.get(ip)
  const resetAt = Date.now() + 15 * 60 * 1000 // 15 dakika
  
  if (!data) {
    loginAttempts.set(ip, { count: 1, resetAt })
  } else {
    data.count++
  }
}

export async function resetLoginAttempts(ip: string): Promise<void> {
  loginAttempts.delete(ip)
}

/**
 * Rate limiting middleware factory
 * @param maxRequests - Maximum requests per window
 * @param windowMs - Window in milliseconds
 * @returns Express rate limit middleware
 */
export function createRateLimit(maxRequests: number, windowMs: number) {
  // Test ortamında rate limiting'i devre dışı bırak
  if (process.env.NODE_ENV === 'test') {
    return rateLimit({
      windowMs,
      max: 10000, // Test ortamında çok yüksek limit (pratikte limitsiz)
      message: {
        success: false,
        error: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        // Test ortamında her test için farklı key (rate limit bypass)
        return `${req.ip}-${Date.now()}-${Math.random()}`;
      }
    });
  }
  
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      success: false,
      error: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    }
  });
}
