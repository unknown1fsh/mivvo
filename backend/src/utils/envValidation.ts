/**
 * Environment Variable Validation
 * 
 * Uygulama başlangıcında tüm kritik environment variable'ları validate eder.
 * Eksik veya geçersiz değerler varsa uygulama başlamadan hata verir.
 */

import { z } from 'zod';

/**
 * Environment Variable Schema
 * 
 * Zod schema ile environment variable'ları validate eder.
 */
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('3001'),

  // Database Configuration
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT Configuration
  JWT_SECRET: z.string()
    .trim()
    .min(32, 'JWT_SECRET must be at least 32 characters long. Please set a secure random string in Railway environment variables.')
    .refine(
      (secret) => {
        // Test modunda daha esnek
        if (process.env.NODE_ENV === 'test') {
          return secret.length >= 16;
        }
        
        // Debug: JWT_SECRET'ın ilk birkaç karakterini logla (güvenlik için tam değeri değil)
        const secretPreview = secret.length > 10 
          ? `${secret.substring(0, 6)}...${secret.substring(secret.length - 4)}` 
          : '***';
        console.log(`[JWT_SECRET Validation] Checking secret (length: ${secret.length}, preview: ${secretPreview})`);
        
        // Production ve development'ta sıkı kontrol
        // Sadece çok açık default pattern'leri kontrol et
        const defaultPatterns = [
          'your-secret',
          'change-this',
          'your-jwt-secret',
          'test-jwt-secret-key-for-testing-only',
          'your-super-secret-jwt-key-change-this-in-production'
        ];
        
        const secretLower = secret.toLowerCase().trim();
        
        // Eğer secret tam olarak bir default pattern'e eşitse veya içeriyorsa, reddet
        // Ama eğer secret 32+ karakter ve base64 benzeri görünüyorsa, geçerli kabul et
        const isExactDefault = defaultPatterns.some(pattern => 
          secretLower === pattern.toLowerCase() || secretLower === `your-super-secret-jwt-key-change-this-in-production`
        );
        
        // Eğer secret tam olarak default değilse ve 32+ karakter ise, geçerli kabul et
        // (kullanıcı kendi formatını kullanıyor olabilir)
        if (isExactDefault) {
          console.error(`[JWT_SECRET Validation] ❌ Secret is exactly a default value. Current value preview: ${secretPreview}`);
          console.error(`[JWT_SECRET Validation] Please set a secure random string in Railway. Generate using:`);
          console.error(`[JWT_SECRET Validation]   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`);
          return false;
        }
        
        // Eğer secret default pattern içeriyorsa ama tam eşleşme değilse, yine de kontrol et
        const containsDefaultPattern = defaultPatterns.some(pattern => 
          secretLower.includes(pattern.toLowerCase()) && secret.length < 60
        );
        
        if (containsDefaultPattern) {
          console.error(`[JWT_SECRET Validation] ❌ Secret contains default pattern and seems too short. Current value preview: ${secretPreview}`);
          console.error(`[JWT_SECRET Validation] Please set a secure random string in Railway. Generate using:`);
          console.error(`[JWT_SECRET Validation]   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`);
          return false;
        }
        
        // Eğer default pattern içermiyorsa ve 32+ karakter ise, geçerli kabul et
        console.log(`[JWT_SECRET Validation] ✅ Secret validation passed (length: ${secret.length}, no default patterns found)`);
        return true;
      },
      {
        message: 'JWT_SECRET must be changed from default value. Please set a secure random string (at least 32 characters) in Railway environment variables. Generate using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"',
      }
    ),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // AI Services Configuration
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required').optional(),

  // NextAuth Configuration (for frontend)
  NEXTAUTH_SECRET: z.string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters long')
    .refine(
      (secret) => {
        // Test modunda daha esnek
        if (process.env.NODE_ENV === 'test') {
          return secret.length >= 16;
        }
        // Production ve development'ta sıkı kontrol
        return !secret.includes('your-secret') && 
               !secret.includes('change-this') &&
               !secret.includes('your-secret-key-here');
      },
      {
        message: 'NEXTAUTH_SECRET must be changed from default value',
      }
    )
    .optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().int().positive()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().int().positive()).default('100'),

  // CORS
  CORS_ORIGIN: z.string().url().optional(),

  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).pipe(z.number().int().min(10).max(15)).default('12'),
  SESSION_SECRET: z.string().min(32).optional(),

  // Optional configurations
  GEMINI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  IYZICO_API_KEY: z.string().optional(),
  IYZICO_SECRET_KEY: z.string().optional(),
  IYZICO_BASE_URL: z.string().url().optional(),
});

/**
 * Validated Environment Variables
 * 
 * Type-safe environment variables after validation.
 */
export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Validate Environment Variables
 * 
 * Uygulama başlangıcında çağrılmalı.
 * Eksik veya geçersiz değerler varsa hata fırlatır.
 * 
 * @returns Validated environment variables
 * @throws Error if validation fails
 */
export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => {
        return `${err.path.join('.')}: ${err.message}`;
      }).join('\n');

      console.error('❌ Environment Variable Validation Failed:');
      console.error(errorMessages);
      console.error('\n💡 Please check your .env file and ensure all required variables are set correctly.');
      
      // Railway için özel mesaj
      if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_NAME) {
        console.error('\n🚂 Railway Deployment Detected:');
        console.error('   Please set the required environment variables in Railway dashboard:');
        console.error('   1. Go to your Railway project');
        console.error('   2. Select your service');
        console.error('   3. Go to Variables tab');
        console.error('   4. Add the missing environment variables');
        console.error('   \n   Required variables:');
        error.errors.forEach((err) => {
          const varName = err.path.join('.');
          if (varName === 'JWT_SECRET') {
            console.error(`   • ${varName}: Generate using: openssl rand -base64 32`);
          } else {
            console.error(`   • ${varName}`);
          }
        });
      }
      
      throw new Error(`Environment validation failed:\n${errorMessages}`);
    }
    throw error;
  }
}

/**
 * Get Validated Environment Variable
 * 
 * Validated environment variable'ı döndürür.
 * Önce validateEnv() çağrılmalı.
 * 
 * @returns Validated environment variables
 * @throws Error if validation has not been run
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error('Environment variables have not been validated. Call validateEnv() first.');
  }
  return validatedEnv;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

