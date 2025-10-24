const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createTestUser() {
  try {
    console.log('👤 Test kullanıcısı oluşturuluyor...');
    
    // Test kullanıcısı oluştur
    const user = await prisma.user.create({
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
    console.log(`   ID: ${user.id}`);
    
    // UserCredits oluştur
    console.log('💰 Kullanıcı kredisi oluşturuluyor...');
    await prisma.userCredits.create({
      data: {
        userId: user.id,
        balance: 10,
        totalPurchased: 10,
        totalUsed: 0
      }
    });
    
    console.log('✅ Test kullanıcısına 10 kredi eklendi');
    
    // Database istatistikleri
    console.log('\n📊 Database İstatistikleri:');
    const userCount = await prisma.user.count();
    const creditCount = await prisma.userCredits.count();
    
    console.log(`   Kullanıcılar: ${userCount}`);
    console.log(`   Kredi kayıtları: ${creditCount}`);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Test kullanıcısı zaten mevcut');
    } else {
      console.error('❌ Hata:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
