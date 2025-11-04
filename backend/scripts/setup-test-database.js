/**
 * Test Database Setup Script
 * 
 * Test veritabanını oluşturur ve migration'ları çalıştırır
 * 
 * Kullanım:
 *   node scripts/setup-test-database.js
 * 
 * Veya:
 *   npm run test:setup
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

async function setupTestDatabase() {
  console.log('🧪 Test Veritabanı Kurulumu');
  console.log('============================\n');

  if (!TEST_DATABASE_URL) {
    console.error('❌ TEST_DATABASE_URL veya DATABASE_URL environment variable bulunamadı!');
    console.error('   .env.test dosyasını oluşturduğunuzdan emin olun.');
    process.exit(1);
  }

  console.log('📊 Test Database URL:', TEST_DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

  try {
    // Prisma Client oluştur
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: TEST_DATABASE_URL,
        },
      },
    });

    // Database bağlantısını test et
    console.log('\n🔌 Veritabanı bağlantısı test ediliyor...');
    await prisma.$connect();
    console.log('✅ Veritabanı bağlantısı başarılı!');

    // Database'in var olup olmadığını kontrol et
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Veritabanı mevcut');
    } catch (error) {
      console.error('❌ Veritabanı bağlantısı başarısız!');
      console.error('   Lütfen veritabanının oluşturulduğundan emin olun.');
      console.error('   PostgreSQL komutu:');
      console.error(`   CREATE DATABASE mivvo_expertiz_test;`);
      await prisma.$disconnect();
      process.exit(1);
    }

    // Migration'ları çalıştır
    console.log('\n🔄 Migration\'lar çalıştırılıyor...');
    try {
      execSync(`npx prisma migrate deploy`, {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..'),
        env: {
          ...process.env,
          DATABASE_URL: TEST_DATABASE_URL,
        },
      });
      console.log('✅ Migration\'lar başarıyla uygulandı!');
    } catch (error) {
      console.warn('⚠️  Migration hatası:', error.message);
      console.log('   Prisma schema\'yı generate ediliyor...');
      try {
        execSync(`npx prisma generate`, {
          stdio: 'inherit',
          cwd: path.resolve(__dirname, '..'),
        });
        console.log('✅ Prisma client generate edildi');
      } catch (genError) {
        console.error('❌ Prisma generate hatası:', genError.message);
      }
    }

    // Test veritabanını temizle (opsiyonel)
    console.log('\n🧹 Test veritabanı temizleniyor...');
    try {
      await prisma.$transaction([
        prisma.creditTransaction.deleteMany(),
        prisma.userCredits.deleteMany(),
        prisma.vehicleAudio.deleteMany(),
        prisma.vehicleImage.deleteMany(),
        prisma.vehicleGarageImage.deleteMany(),
        prisma.vehicleReport.deleteMany(),
        prisma.vehicleGarage.deleteMany(),
        prisma.contactInquiry.deleteMany(),
        prisma.careerApplication.deleteMany(),
        prisma.supportTicket.deleteMany(),
        prisma.notification.deleteMany(),
        prisma.vINLookup.deleteMany(),
        prisma.user.deleteMany(),
      ]);
      console.log('✅ Test veritabanı temizlendi');
    } catch (error) {
      console.warn('⚠️  Veritabanı temizleme hatası (normal olabilir):', error.message);
    }

    await prisma.$disconnect();

    console.log('\n✅ Test veritabanı kurulumu tamamlandı!');
    console.log('\n📝 Testleri çalıştırmak için:');
    console.log('   npm test');
    console.log('   veya');
    console.log('   npm run test:watch\n');

  } catch (error) {
    console.error('\n❌ Test veritabanı kurulumu başarısız!');
    console.error('Hata:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.error('\n💡 Çözüm:');
      console.error('   1. PostgreSQL sunucunuzun çalıştığından emin olun');
      console.error('   2. .env.test dosyasındaki DATABASE_URL\'yi kontrol edin');
      console.error('   3. Veritabanı kullanıcı adı ve şifresinin doğru olduğundan emin olun');
    } else if (error.message.includes('does not exist')) {
      console.error('\n💡 Çözüm:');
      console.error('   1. Test veritabanını oluşturun:');
      console.error('      CREATE DATABASE mivvo_expertiz_test;');
      console.error('   2. Scripti tekrar çalıştırın');
    }
    
    process.exit(1);
  }
}

// Script'i çalıştır
setupTestDatabase();

