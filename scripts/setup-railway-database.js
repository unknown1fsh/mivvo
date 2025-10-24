#!/usr/bin/env node

/**
 * Railway Database Setup Script
 * Bu script Railway PostgreSQL database'i kurar ve test kullanıcısı oluşturur
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupRailwayDatabase() {
  console.log('🚀 Railway PostgreSQL Database Setup');
  console.log('=====================================\n');

  try {
    // Railway connection string al
    const railwayUrl = await askQuestion('Railway PostgreSQL connection string girin: ');
    
    if (!railwayUrl || !railwayUrl.includes('postgresql://')) {
      console.error('❌ Geçersiz connection string!');
      process.exit(1);
    }

    console.log('\n📊 Railway database\'e bağlanılıyor...');
    
    // Prisma client oluştur
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: railwayUrl
        }
      }
    });

    // Database bağlantısını test et
    await prisma.$connect();
    console.log('✅ Database bağlantısı başarılı!');

    // Schema migration çalıştır
    console.log('\n🔄 Schema migration çalıştırılıyor...');
    const { execSync } = require('child_process');
    
    try {
      execSync(`DATABASE_URL="${railwayUrl}" npx prisma migrate deploy`, {
        stdio: 'inherit',
        cwd: './backend'
      });
      console.log('✅ Migration başarılı!');
    } catch (error) {
      console.log('⚠️ Migration hatası, devam ediliyor...');
    }

    // Test kullanıcısı oluştur
    console.log('\n👤 Test kullanıcısı oluşturuluyor...');
    
    try {
      const testUser = await prisma.user.create({
        data: {
          email: 'test@mivvo.org',
          passwordHash: 'test123',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          emailVerified: true,
          isActive: true
        }
      });
      
      console.log('✅ Test kullanıcısı oluşturuldu:');
      console.log(`   Email: test@mivvo.org`);
      console.log(`   Şifre: test123`);
      console.log(`   ID: ${testUser.id}`);
      
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('ℹ️ Test kullanıcısı zaten mevcut');
      } else {
        console.error('❌ Test kullanıcısı oluşturulamadı:', error.message);
      }
    }

    // UserCredits oluştur
    console.log('\n💰 Kullanıcı kredisi oluşturuluyor...');
    
    try {
      const user = await prisma.user.findUnique({
        where: { email: 'test@mivvo.org' }
      });
      
      if (user) {
        await prisma.userCredits.create({
          data: {
            userId: user.id,
            balance: 10,
            totalPurchased: 10,
            totalUsed: 0
          }
        });
        console.log('✅ Test kullanıcısına 10 kredi eklendi');
      }
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('ℹ️ Kullanıcı kredisi zaten mevcut');
      } else {
        console.error('❌ Kullanıcı kredisi oluşturulamadı:', error.message);
      }
    }

    // Database bilgilerini göster
    console.log('\n📊 Database İstatistikleri:');
    const userCount = await prisma.user.count();
    const creditCount = await prisma.userCredits.count();
    const reportCount = await prisma.vehicleReport.count();
    
    console.log(`   Kullanıcılar: ${userCount}`);
    console.log(`   Kredi kayıtları: ${creditCount}`);
    console.log(`   Raporlar: ${reportCount}`);

    console.log('\n🎉 Railway database setup tamamlandı!');
    console.log('\n📋 Vercel Environment Variables:');
    console.log(`DATABASE_URL=${railwayUrl}`);
    console.log('JWT_SECRET=güçlü-secret-key-buraya-yazın');
    console.log('NEXTAUTH_SECRET=güçlü-nextauth-secret-buraya-yazın');
    console.log('NEXTAUTH_URL=https://www.mivvo.org');
    console.log('CORS_ORIGIN=https://www.mivvo.org');
    console.log('NODE_ENV=production');

    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Setup hatası:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Script'i çalıştır
if (require.main === module) {
  setupRailwayDatabase();
}

module.exports = { setupRailwayDatabase };
