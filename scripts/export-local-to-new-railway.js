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

// Yeni Railway database connection
const railwayPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:OgMIbLAsuZXYIEXHxOSpMoWgcPUtXRTC@shuttle.proxy.rlwy.net:35219/railway"
    }
  }
});

async function exportFromLocalToRailway() {
  try {
    console.log('🔄 Local database\'den yeni Railway\'e data export ediliyor...');
    
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
    
    // Yeni Railway database'e data ekle
    console.log('👥 Kullanıcılar yeni Railway\'e ekleniyor...');
    for (const user of users) {
      try {
        await railwayPrisma.user.create({
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
    
    console.log('💰 Kullanıcı kredileri yeni Railway\'e ekleniyor...');
    for (const credit of userCredits) {
      try {
        await railwayPrisma.userCredits.create({
          data: credit
        });
        console.log(`   ✅ Kredi eklendi: ${credit.userId}`);
      } catch (error) {
        console.error(`   ❌ Kredi ekleme hatası: ${credit.userId}`, error.message);
      }
    }
    
    console.log('💳 Kredi işlemleri yeni Railway\'e ekleniyor...');
    for (const transaction of creditTransactions) {
      try {
        await railwayPrisma.creditTransaction.create({
          data: transaction
        });
        console.log(`   ✅ İşlem eklendi: ${transaction.id}`);
      } catch (error) {
        console.error(`   ❌ İşlem ekleme hatası: ${transaction.id}`, error.message);
      }
    }
    
    console.log('🚗 Araç raporları yeni Railway\'e ekleniyor...');
    for (const report of vehicleReports) {
      try {
        await railwayPrisma.vehicleReport.create({
          data: report
        });
        console.log(`   ✅ Rapor eklendi: ${report.id}`);
      } catch (error) {
        console.error(`   ❌ Rapor ekleme hatası: ${report.id}`, error.message);
      }
    }
    
    console.log('💵 Servis fiyatları yeni Railway\'e ekleniyor...');
    for (const pricing of servicePricing) {
      try {
        await railwayPrisma.servicePricing.create({
          data: pricing
        });
        console.log(`   ✅ Fiyat eklendi: ${pricing.id}`);
      } catch (error) {
        console.error(`   ❌ Fiyat ekleme hatası: ${pricing.id}`, error.message);
      }
    }
    
    console.log('⚙️ Sistem ayarları yeni Railway\'e ekleniyor...');
    for (const setting of systemSettings) {
      try {
        await railwayPrisma.systemSetting.create({
          data: setting
        });
        console.log(`   ✅ Ayar eklendi: ${setting.id}`);
      } catch (error) {
        console.error(`   ❌ Ayar ekleme hatası: ${setting.id}`, error.message);
      }
    }
    
    console.log('🔍 VIN lookup\'lar yeni Railway\'e ekleniyor...');
    for (const vin of vinLookups) {
      try {
        await railwayPrisma.vINLookup.create({
          data: vin
        });
        console.log(`   ✅ VIN eklendi: ${vin.id}`);
      } catch (error) {
        console.error(`   ❌ VIN ekleme hatası: ${vin.id}`, error.message);
      }
    }
    
    console.log('✅ Local database\'den yeni Railway\'e data export tamamlandı!');
    
    // Yeni Railway'de kontrol et
    const railwayUserCount = await railwayPrisma.user.count();
    const railwayReportCount = await railwayPrisma.vehicleReport.count();
    const railwayCreditCount = await railwayPrisma.userCredits.count();
    const railwayTransactionCount = await railwayPrisma.creditTransaction.count();
    
    console.log(`📊 Yeni Railway database'deki data:`);
    console.log(`   - Kullanıcılar: ${railwayUserCount}`);
    console.log(`   - Raporlar: ${railwayReportCount}`);
    console.log(`   - Krediler: ${railwayCreditCount}`);
    console.log(`   - İşlemler: ${railwayTransactionCount}`);

  } catch (error) {
    console.error('❌ Export hatası:', error);
    throw error;
  } finally {
    await localPrisma.$disconnect();
    await railwayPrisma.$disconnect();
  }
}

exportFromLocalToRailway().catch(console.error);
