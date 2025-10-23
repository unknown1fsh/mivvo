const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Local database connection
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:%26rEXMe%5E%25%7D%7Dx_2Vga@localhost:5432/mivvo_expertiz"
    }
  }
});

// Neon database connection
const neonPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_pSrXLy7oEfv9@ep-divine-shadow-a4c0v8bu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

async function exportFromLocalToNeon() {
  try {
    console.log('🔄 Local database\'den Neon\'a data export ediliyor...');
    
    // Local database'den data çek
    const users = await localPrisma.user.findMany();
    const userCredits = await localPrisma.userCredits.findMany();
    const creditTransactions = await localPrisma.creditTransaction.findMany();
    const vehicleReports = await localPrisma.vehicleReport.findMany();
    const servicePricing = await localPrisma.servicePricing.findMany();
    const systemSettings = await localPrisma.systemSetting.findMany();
    const vinLookups = await localPrisma.vINLookup.findMany();
    
    console.log(`📊 Local database'den çekilen data:`);
    console.log(`   - Kullanıcılar: ${users.length}`);
    console.log(`   - Raporlar: ${vehicleReports.length}`);
    console.log(`   - Krediler: ${userCredits.length}`);
    console.log(`   - İşlemler: ${creditTransactions.length}`);
    console.log(`   - Servis fiyatları: ${servicePricing.length}`);
    console.log(`   - Sistem ayarları: ${systemSettings.length}`);
    console.log(`   - VIN lookup'lar: ${vinLookups.length}`);
    
    // Neon database'e data ekle
    console.log('👥 Kullanıcılar Neon\'a ekleniyor...');
    for (const user of users) {
      try {
        await neonPrisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            hasSeenGuide: user.hasSeenGuide,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        });
        console.log(`   ✅ Kullanıcı eklendi: ${user.email}`);
      } catch (error) {
        console.error(`   ❌ Kullanıcı ekleme hatası: ${user.email}`, error.message);
      }
    }
    
    console.log('💰 Kullanıcı kredileri Neon\'a ekleniyor...');
    for (const credit of userCredits) {
      try {
        await neonPrisma.userCredits.create({
          data: credit
        });
        console.log(`   ✅ Kredi eklendi: ${credit.userId}`);
      } catch (error) {
        console.error(`   ❌ Kredi ekleme hatası: ${credit.userId}`, error.message);
      }
    }
    
    console.log('💳 Kredi işlemleri Neon\'a ekleniyor...');
    for (const transaction of creditTransactions) {
      try {
        await neonPrisma.creditTransaction.create({
          data: transaction
        });
        console.log(`   ✅ İşlem eklendi: ${transaction.id}`);
      } catch (error) {
        console.error(`   ❌ İşlem ekleme hatası: ${transaction.id}`, error.message);
      }
    }
    
    console.log('🚗 Araç raporları Neon\'a ekleniyor...');
    for (const report of vehicleReports) {
      try {
        await neonPrisma.vehicleReport.create({
          data: report
        });
        console.log(`   ✅ Rapor eklendi: ${report.id}`);
      } catch (error) {
        console.error(`   ❌ Rapor ekleme hatası: ${report.id}`, error.message);
      }
    }
    
    console.log('💵 Servis fiyatları Neon\'a ekleniyor...');
    for (const pricing of servicePricing) {
      try {
        await neonPrisma.servicePricing.create({
          data: pricing
        });
        console.log(`   ✅ Fiyat eklendi: ${pricing.id}`);
      } catch (error) {
        console.error(`   ❌ Fiyat ekleme hatası: ${pricing.id}`, error.message);
      }
    }
    
    console.log('⚙️ Sistem ayarları Neon\'a ekleniyor...');
    for (const setting of systemSettings) {
      try {
        await neonPrisma.systemSetting.create({
          data: setting
        });
        console.log(`   ✅ Ayar eklendi: ${setting.id}`);
      } catch (error) {
        console.error(`   ❌ Ayar ekleme hatası: ${setting.id}`, error.message);
      }
    }
    
    console.log('🔍 VIN lookup\'lar Neon\'a ekleniyor...');
    for (const vin of vinLookups) {
      try {
        await neonPrisma.vINLookup.create({
          data: vin
        });
        console.log(`   ✅ VIN eklendi: ${vin.id}`);
      } catch (error) {
        console.error(`   ❌ VIN ekleme hatası: ${vin.id}`, error.message);
      }
    }
    
    console.log('✅ Local database\'den Neon\'a data export tamamlandı!');
    
    // Neon'da kontrol et
    const neonUserCount = await neonPrisma.user.count();
    const neonReportCount = await neonPrisma.vehicleReport.count();
    const neonCreditCount = await neonPrisma.userCredits.count();
    const neonTransactionCount = await neonPrisma.creditTransaction.count();
    
    console.log(`📊 Neon database'deki data:`);
    console.log(`   - Kullanıcılar: ${neonUserCount}`);
    console.log(`   - Raporlar: ${neonReportCount}`);
    console.log(`   - Krediler: ${neonCreditCount}`);
    console.log(`   - İşlemler: ${neonTransactionCount}`);

  } catch (error) {
    console.error('❌ Export hatası:', error);
    throw error;
  } finally {
    await localPrisma.$disconnect();
    await neonPrisma.$disconnect();
  }
}

exportFromLocalToNeon().catch(console.error);
