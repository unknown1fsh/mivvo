const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_pSrXLy7oEfv9@ep-divine-shadow-a4c0v8bu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

async function checkNeonDatabase() {
  try {
    console.log('🔄 Neon database bağlantısı kontrol ediliyor...');
    
    // Kullanıcı sayısını kontrol et
    const userCount = await prisma.user.count();
    console.log(`👥 Kullanıcı sayısı: ${userCount}`);
    
    // Rapor sayısını kontrol et
    const reportCount = await prisma.vehicleReport.count();
    console.log(`🚗 Rapor sayısı: ${reportCount}`);
    
    // Kredi sayısını kontrol et
    const creditCount = await prisma.userCredits.count();
    console.log(`💰 Kredi sayısı: ${creditCount}`);
    
    // İşlem sayısını kontrol et
    const transactionCount = await prisma.creditTransaction.count();
    console.log(`💳 İşlem sayısı: ${transactionCount}`);
    
    // VIN lookup sayısını kontrol et
    const vinCount = await prisma.vINLookup.count();
    console.log(`🔍 VIN lookup sayısı: ${vinCount}`);
    
    if (userCount === 0) {
      console.log('❌ Neon database\'de data yok!');
      console.log('💡 Local database\'den Neon\'a data import etmemiz gerekiyor.');
    } else {
      console.log('✅ Neon database\'de data mevcut!');
    }
    
  } catch (error) {
    console.error('❌ Neon database bağlantı hatası:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkNeonDatabase().catch(console.error);
