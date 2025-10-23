const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importData() {
  try {
    console.log('🔄 Railway backup\'ını Neon database\'e import ediliyor...');
    
    // Backup dosyasını oku
    const backupPath = path.join(__dirname, '../../railway_backup.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log(`📊 Import edilecek data:`);
    console.log(`   - Kullanıcılar: ${backupData.users.length}`);
    console.log(`   - Raporlar: ${backupData.vehicleReports.length}`);
    console.log(`   - Kullanıcı kredileri: ${backupData.userCredits.length}`);
    console.log(`   - Kredi işlemleri: ${backupData.creditTransactions.length}`);
    console.log(`   - Servis fiyatları: ${backupData.servicePricing.length}`);
    console.log(`   - Sistem ayarları: ${backupData.systemSettings.length}`);
    console.log(`   - VIN lookup'lar: ${backupData.vinLookups.length}`);
    
    // Kullanıcıları import et
    console.log('👥 Kullanıcılar import ediliyor...');
    for (const user of backupData.users) {
      try {
        await prisma.user.create({
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
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        });
        console.log(`   ✅ Kullanıcı import edildi: ${user.email}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️ Kullanıcı zaten mevcut: ${user.email}`);
        } else {
          console.error(`   ❌ Kullanıcı import hatası: ${user.email}`, error.message);
        }
      }
    }
    
    // Kullanıcı kredilerini import et
    console.log('💰 Kullanıcı kredileri import ediliyor...');
    for (const credit of backupData.userCredits) {
      try {
        await prisma.userCredits.create({
          data: credit
        });
        console.log(`   ✅ Kredi import edildi: ${credit.userId}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️ Kredi zaten mevcut: ${credit.userId}`);
        } else {
          console.error(`   ❌ Kredi import hatası: ${credit.userId}`, error.message);
        }
      }
    }
    
    // Kredi işlemlerini import et
    console.log('💳 Kredi işlemleri import ediliyor...');
    for (const transaction of backupData.creditTransactions) {
      try {
        await prisma.creditTransaction.create({
          data: transaction
        });
        console.log(`   ✅ İşlem import edildi: ${transaction.id}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️ İşlem zaten mevcut: ${transaction.id}`);
        } else {
          console.error(`   ❌ İşlem import hatası: ${transaction.id}`, error.message);
        }
      }
    }
    
    // Araç raporlarını import et
    console.log('🚗 Araç raporları import ediliyor...');
    for (const report of backupData.vehicleReports) {
      try {
        await prisma.vehicleReport.create({
          data: report
        });
        console.log(`   ✅ Rapor import edildi: ${report.id}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️ Rapor zaten mevcut: ${report.id}`);
        } else {
          console.error(`   ❌ Rapor import hatası: ${report.id}`, error.message);
        }
      }
    }
    
    // Servis fiyatlarını import et
    console.log('💵 Servis fiyatları import ediliyor...');
    for (const pricing of backupData.servicePricing) {
      try {
        await prisma.servicePricing.create({
          data: pricing
        });
        console.log(`   ✅ Fiyat import edildi: ${pricing.id}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️ Fiyat zaten mevcut: ${pricing.id}`);
        } else {
          console.error(`   ❌ Fiyat import hatası: ${pricing.id}`, error.message);
        }
      }
    }
    
    // Sistem ayarlarını import et
    console.log('⚙️ Sistem ayarları import ediliyor...');
    for (const setting of backupData.systemSettings) {
      try {
        await prisma.systemSetting.create({
          data: setting
        });
        console.log(`   ✅ Ayar import edildi: ${setting.id}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️ Ayar zaten mevcut: ${setting.id}`);
        } else {
          console.error(`   ❌ Ayar import hatası: ${setting.id}`, error.message);
        }
      }
    }
    
    // VIN lookup'ları import et
    console.log('🔍 VIN lookup\'lar import ediliyor...');
    for (const vin of backupData.vinLookups) {
      try {
        await prisma.vINLookup.create({
          data: vin
        });
        console.log(`   ✅ VIN import edildi: ${vin.id}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️ VIN zaten mevcut: ${vin.id}`);
        } else {
          console.error(`   ❌ VIN import hatası: ${vin.id}`, error.message);
        }
      }
    }
    
    console.log('✅ Data import tamamlandı!');
    
    // Import edilen data'yı kontrol et
    const importedUsers = await prisma.user.count();
    const importedReports = await prisma.vehicleReport.count();
    const importedCredits = await prisma.userCredits.count();
    const importedTransactions = await prisma.creditTransaction.count();
    
    console.log(`📊 Import edilen data:`);
    console.log(`   - Kullanıcılar: ${importedUsers}`);
    console.log(`   - Raporlar: ${importedReports}`);
    console.log(`   - Krediler: ${importedCredits}`);
    console.log(`   - İşlemler: ${importedTransactions}`);

  } catch (error) {
    console.error('❌ Import hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importData().catch(console.error);
