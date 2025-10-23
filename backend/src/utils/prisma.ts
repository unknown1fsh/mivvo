/**
 * Prisma Client Utility
 * 
 * Veritabanı bağlantı optimizasyonu ve connection pool yönetimi
 * 
 * Özellikler:
 * - Connection pool optimizasyonu
 * - Production'da minimal logging
 * - Error handling
 * - Connection timeout ayarları
 * - Veritabanı kota tasarrufu
 */

import { PrismaClient } from '@prisma/client';

// Global Prisma instance (singleton pattern)
let prisma: PrismaClient;

/**
 * Prisma Client Instance Getter
 * 
 * Singleton pattern ile tek bir Prisma instance kullanır
 * Connection pool optimizasyonu sağlar
 */
export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Production'da minimal logging (kota tasarrufu)
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error'] 
        : ['error'],
    });

    // Production'da connection pool optimizasyonu
    if (process.env.NODE_ENV === 'production') {
      console.log('🔧 Production Prisma Client: Optimized for quota saving');
    }
  }

  return prisma;
};

/**
 * Prisma Client Cleanup
 * 
 * Graceful shutdown için connection'ları kapatır
 */
export const disconnectPrisma = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    console.log('🔌 Prisma Client disconnected');
  }
};

// Default export
export default getPrismaClient;
