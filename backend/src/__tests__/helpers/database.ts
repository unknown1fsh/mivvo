/**
 * Database Test Helpers
 * 
 * Test database setup ve cleanup helper'ları
 */

import { PrismaClient, Role, ReportType, ReportStatus, ServiceType } from '@prisma/client';
import { getPrismaClient } from '../../utils/prisma';

let prisma: PrismaClient;

/**
 * Test için Prisma Client instance'ı döndürür
 */
export function getTestPrisma(): PrismaClient {
  if (!prisma) {
    prisma = getPrismaClient();
  }
  return prisma;
}

/**
 * Test veritabanını temizler (cleanup)
 * 
 * DİKKAT: Bu fonksiyon tüm test verilerini siler!
 * Sadece test ortamında kullanılmalıdır.
 */
export async function cleanDatabase(): Promise<void> {
  const db = getTestPrisma();
  
  // Transaction içinde sırayla sil
  await db.$transaction(async (tx) => {
    // İlişkili tabloları önce sil
    await tx.creditTransaction.deleteMany();
    await tx.userCredits.deleteMany();
    await tx.vehicleAudio.deleteMany();
    await tx.vehicleImage.deleteMany();
    await tx.vehicleGarageImage.deleteMany();
    await tx.vehicleReport.deleteMany();
    await tx.vehicleGarage.deleteMany();
    await tx.contactInquiry.deleteMany();
    await tx.careerApplication.deleteMany();
    await tx.supportTicket.deleteMany();
    await tx.notification.deleteMany();
    await tx.vINLookup.deleteMany();
    
    // Son olarak user'ları sil
    await tx.user.deleteMany();
  });
}

/**
 * Test kullanıcısı oluşturur
 * 
 * @param email - Kullanıcı email'i
 * @param passwordHash - Hashlenmiş şifre
 * @param role - Kullanıcı rolü
 * @param credits - Başlangıç kredisi
 * @returns Oluşturulan kullanıcı
 */
export async function createTestUser(
  email: string = 'test@example.com',
  passwordHash: string = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LS2qN8pZ5Q5e', // 'password123'
  role: Role = Role.USER,
  credits: number = 100
) {
  const db = getTestPrisma();
  
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      firstName: 'Test',
      lastName: 'User',
      role,
      emailVerified: true,
      isActive: true,
      userCredits: {
        create: {
          balance: credits,
          totalPurchased: credits,
          totalUsed: 0,
        },
      },
    },
    include: {
      userCredits: true,
    },
  });
  
  return user;
}

/**
 * Admin test kullanıcısı oluşturur
 * 
 * @param email - Admin email'i
 * @param passwordHash - Hashlenmiş şifre
 * @returns Oluşturulan admin kullanıcı
 */
export async function createTestAdmin(
  email: string = 'admin@example.com',
  passwordHash: string = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LS2qN8pZ5Q5e' // 'password123'
) {
  return createTestUser(email, passwordHash, Role.ADMIN, 1000);
}

/**
 * Test aracı oluşturur
 * 
 * @param userId - Araç sahibi kullanıcı ID'si
 * @param plate - Araç plakası
 * @returns Oluşturulan araç
 */
export async function createTestVehicle(
  userId: number,
  plate: string = '34ABC123',
  isDefault: boolean = false
) {
  const db = getTestPrisma();
  
  const vehicle = await db.vehicleGarage.create({
    data: {
      userId,
      plate,
      brand: 'Test Brand',
      model: 'Test Model',
      year: 2020,
      color: 'White',
      mileage: 50000,
      isDefault,
    },
  });
  
  return vehicle;
}

/**
 * Test raporu oluşturur
 * 
 * @param userId - Rapor sahibi kullanıcı ID'si
 * @param vehicleId - Araç ID'si (opsiyonel)
 * @param reportType - Rapor tipi
 * @param status - Rapor durumu
 * @returns Oluşturulan rapor
 */
export async function createTestReport(
  userId: number,
  vehicleGarageId?: number,
  reportType: ReportType = ReportType.DAMAGE_ASSESSMENT,
  status: ReportStatus = ReportStatus.PROCESSING
) {
  const db = getTestPrisma();
  
  const report = await db.vehicleReport.create({
    data: {
      userId,
      vehicleGarageId: vehicleGarageId || null,
      reportType,
      status,
      vehiclePlate: '34ABC123',
      vehicleBrand: 'Test Brand',
      vehicleModel: 'Test Model',
      vehicleYear: 2020,
      totalCost: 0,
    },
  });
  
  return report;
}

export async function createTestServicePricing(
  serviceType: ServiceType,
  basePrice: number = 100,
  isActive: boolean = true
) {
  const db = getTestPrisma();

  const pricing = await db.servicePricing.create({
    data: {
      serviceType,
      serviceName: `${serviceType} Service`,
      basePrice,
      isActive,
    },
  });

  return pricing;
}

