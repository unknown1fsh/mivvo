const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportDatabase() {
  try {
    console.log('🔄 Railway database\'den data export ediliyor...');
    
    // Basit export - sadece temel tablolar
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const userCredits = await prisma.userCredits.findMany();
    const creditTransactions = await prisma.creditTransaction.findMany();
    const vehicleReports = await prisma.vehicleReport.findMany();
    const servicePricing = await prisma.servicePricing.findMany();
    const systemSettings = await prisma.systemSetting.findMany();
    const vinLookups = await prisma.vINLookup.findMany();

    const exportData = {
      users,
      userCredits,
      creditTransactions,
      vehicleReports,
      servicePricing,
      systemSettings,
      vinLookups,
      exportedAt: new Date().toISOString(),
      totalUsers: users.length,
      totalReports: vehicleReports.length
    };

    const exportPath = path.join(__dirname, '../../railway_backup.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log('✅ Database export tamamlandı!');
    console.log(`📊 Export edilen data:`);
    console.log(`   - Kullanıcılar: ${exportData.totalUsers}`);
    console.log(`   - Raporlar: ${exportData.totalReports}`);
    console.log(`   - Kullanıcı kredileri: ${userCredits.length}`);
    console.log(`   - Kredi işlemleri: ${creditTransactions.length}`);
    console.log(`   - Servis fiyatları: ${servicePricing.length}`);
    console.log(`   - Sistem ayarları: ${systemSettings.length}`);
    console.log(`   - VIN lookup'lar: ${vinLookups.length}`);
    console.log(`📁 Dosya: ${exportPath}`);

  } catch (error) {
    console.error('❌ Export hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportDatabase().catch(console.error);
