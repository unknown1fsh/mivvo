/**
 * Basit Kredi Sistemi Testi
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('🧪 Atomik Transaction Testi\n');

  try {
    // İlk kullanıcıyı al
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('❌ Kullanıcı bulunamadı');
      return;
    }

    console.log('✅ Kullanıcı:', user.email);

    // Kredi bakiyesini kontrol et
    let credits = await prisma.userCredits.findUnique({
      where: { userId: user.id }
    });

    if (!credits) {
      console.log('❌ Kredi kaydı bulunamadı');
      return;
    }

    console.log('📊 Mevcut Durum:');
    console.log('  Bakiye:', credits.balance.toString(), 'TL');
    console.log('  Total Used:', credits.totalUsed.toString(), 'TL');

    // Test: Atomik transaction ile kredi düş
    const testAmount = 50;
    
    console.log(`\n💳 ${testAmount} TL kredi düşürülüyor...`);

    await prisma.$transaction(async (tx) => {
      // Kredi düş
      const updated = await tx.userCredits.update({
        where: { userId: user.id },
        data: {
          balance: { decrement: testAmount },
          totalUsed: { increment: testAmount }
        }
      });

      // Transaction kaydet
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          transactionType: 'USAGE',
          amount: testAmount,
          description: 'Test Transaction',
          referenceId: 'TEST_' + Date.now(),
          status: 'COMPLETED'
        }
      });

      console.log('✅ Başarılı! Yeni bakiye:', updated.balance.toString(), 'TL');
    });

    // Sonucu kontrol et
    credits = await prisma.userCredits.findUnique({
      where: { userId: user.id }
    });

    console.log('\n📊 Son Durum:');
    console.log('  Bakiye:', credits.balance.toString(), 'TL');
    console.log('  Total Used:', credits.totalUsed.toString(), 'TL');

    console.log('\n✅ TEST BAŞARILI!');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();

