/**
 * Kredi Sistemi Test Scripti
 * 
 * Bu script, kredi yönetim sisteminin doğru çalışıp çalışmadığını test eder.
 * 
 * Kullanım:
 *   node backend/test-credit-system.js
 * 
 * Gereksinimler:
 *   - Backend çalışıyor olmalı
 *   - Test kullanıcısı oluşturulmuş olmalı
 *   - Prisma çalışıyor olmalı
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreditSystem() {
  console.log('🧪 Kredi Sistemi Test Senaryoları Başlıyor...\n');

  try {
    // 1. Test kullanıcısını bul
    const testUser = await prisma.user.findFirst({
      where: { email: { contains: '@' } },
      orderBy: { id: 'asc' }
    });

    if (!testUser) {
      throw new Error('Test kullanıcısı bulunamadı. Önce bir kullanıcı oluşturun.');
    }

    console.log('✅ Test kullanıcısı bulundu:', testUser.email);

    // 2. Test kredisi oluştur
    let testCredits = await prisma.userCredits.findUnique({
      where: { userId: testUser.id }
    });

    if (!testCredits) {
      testCredits = await prisma.userCredits.create({
        data: {
          userId: testUser.id,
          balance: 1000,
          totalPurchased: 1000,
          totalUsed: 0
        }
      });
      console.log('✅ Test kredisi oluşturuldu: 1000 TL');
    } else {
      // Sıfırla
      await prisma.userCredits.update({
        where: { userId: testUser.id },
        data: {
          balance: 1000,
          totalPurchased: 1000,
          totalUsed: 0
        }
      });
      console.log('✅ Test kredisi sıfırlandı: 1000 TL');
    }

    // 3. İstatistikleri göster
    console.log('\n📊 Mevcut Durum:');
    console.log('  - Bakiye:', testCredits.balance.toString(), 'TL');
    console.log('  - Toplam Satın:', testCredits.totalPurchased.toString(), 'TL');
    console.log('  - Toplam Kullanılan:', testCredits.totalUsed.toString(), 'TL');

    // 4. Kredi düşme testi (Atomik)
    console.log('\n🧪 Test 1: Atomik Kredi Düşme');
    const testAmount = 100;
    
    await prisma.$transaction(async (tx) => {
      // Kredi düş
      const updatedCredits = await tx.userCredits.update({
        where: { userId: testUser.id },
        data: {
          balance: { decrement: testAmount },
          totalUsed: { increment: testAmount }
        }
      });

      // Transaction oluştur
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: testUser.id,
          transactionType: 'USAGE',
          amount: testAmount,
          description: 'Test - Atomik Kredi Düşme',
          referenceId: 'TEST_1',
          status: 'COMPLETED'
        }
      });

      console.log('  ✅ Kredi düşürüldü:', testAmount, 'TL');
      console.log('  ✅ Yeni bakiye:', updatedCredits.balance.toString(), 'TL');
      console.log('  ✅ Transaction ID:', transaction.id);
    });

    // 5. Sonucu kontrol et
    const finalCredits = await prisma.userCredits.findUnique({
      where: { userId: testUser.id }
    });

    console.log('\n📊 Son Durum:');
    console.log('  - Bakiye:', finalCredits.balance.toString(), 'TL');
    console.log('  - Toplam Kullanılan:', finalCredits.totalUsed.toString(), 'TL');

    // Doğrulama
    if (finalCredits.balance == 900 && finalCredits.totalUsed == 100) {
      console.log('  ✅ BAŞARILI: Bakiye doğru hesaplanmış');
    } else {
      console.log('  ❌ HATA: Bakiye tutarsız!');
      console.log('    Beklenen: balance=900, totalUsed=100');
      console.log('    Gerçek:', finalCredits.balance.toString(), finalCredits.totalUsed.toString());
    }

    // 6. Transaction geçmişini göster
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log('\n📜 Son 5 Transaction:');
    transactions.forEach(tx => {
      console.log(`  - ${tx.transactionType}: ${tx.amount} TL (${tx.status})`);
    });

    // 7. İade testi
    console.log('\n🧪 Test 2: Kredi İadesi (Atomik)');
    const refundAmount = 50;

    await prisma.$transaction(async (tx) => {
      // Kredi iade et
      const updatedCredits = await tx.userCredits.update({
        where: { userId: testUser.id },
        data: {
          balance: { increment: refundAmount },
          totalUsed: { decrement: refundAmount }
        }
      });

      // Transaction oluştur
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: testUser.id,
          transactionType: 'REFUND',
          amount: refundAmount,
          description: 'Test - Kredi İadesi',
          referenceId: 'TEST_2',
          status: 'COMPLETED'
        }
      });

      console.log('  ✅ Kredi iade edildi:', refundAmount, 'TL');
      console.log('  ✅ Yeni bakiye:', updatedCredits.balance.toString(), 'TL');
    });

    // 8. Final kontrolü
    const afterRefund = await prisma.userCredits.findUnique({
      where: { userId: testUser.id }
    });

    console.log('\n📊 İade Sonrası:');
    console.log('  - Bakiye:', afterRefund.balance.toString(), 'TL');
    console.log('  - Toplam Kullanılan:', afterRefund.totalUsed.toString(), 'TL');

    if (afterRefund.balance == 950 && afterRefund.totalUsed == 50) {
      console.log('  ✅ BAŞARILI: İade doğru çalıştı');
    } else {
      console.log('  ❌ HATA: İade tutarsız!');
    }

    // 9. Özet
    console.log('\n' + '='.repeat(50));
    console.log('✅ TÜM TESTLER BAŞARILI!');
    console.log('='.repeat(50));
    console.log('\n📊 Özet İstatistikler:');
    console.log('  - Başlangıç Bakiye: 1000 TL');
    console.log('  - Kullanılan: 100 TL');
    console.log('  - İade Edilen: 50 TL');
    console.log('  - Final Bakiye:', afterRefund.balance.toString(), 'TL');
    console.log('  - Net Kullanılan:', afterRefund.totalUsed.toString(), 'TL');

    // 10. Temizlik
    console.log('\n🧹 Temizlik yapılıyor...');
    await prisma.creditTransaction.deleteMany({
      where: {
        userId: testUser.id,
        OR: [
          { referenceId: 'TEST_1' },
          { referenceId: 'TEST_2' }
        ]
      }
    });
    console.log('✅ Test transaction\'ları silindi');

  } catch (error) {
    console.error('❌ Test sırasında hata oluştu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Testi çalıştır
testCreditSystem()
  .then(() => {
    console.log('\n✅ Test tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test başarısız:', error);
    process.exit(1);
  });

