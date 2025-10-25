/**
 * Merkezi Kredi Yönetimi Utility
 * 
 * Tüm kredi işlemlerini atomik ve güvenli şekilde yönetir.
 * 
 * Strateji: "Önce Rezerve Et, Sonra Onayla"
 * 1. Kredi rezerve et (PENDING transaction oluştur)
 * 2. İşlem yap
 * 3. Başarılı ise onayla (COMPLETED)
 * 4. Başarısız ise iade et (REFUNDED)
 * 
 * Bu yaklaşım:
 * - Yarım kalan işlemleri önler
 * - Transaction atomikliği sağlar
 * - İade işlemlerini otomatikleştirir
 */

import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from './prisma';

const prisma = getPrismaClient();

export interface CreditReservation {
  id: number;
  userId: number;
  amount: number;
  reportId?: number;
  status: 'PENDING' | 'COMPLETED' | 'REFUNDED';
}

export interface CreditOperationResult {
  success: boolean;
  transactionId: number;
  newBalance: number;
  message?: string;
}

/**
 * Kredi Rezerve Et
 * 
 * Analiz başlangıcında krediyi rezerve eder (henüz düşmez)
 * 
 * @param userId - Kullanıcı ID
 * @param amount - Rezerve edilecek miktar
 * @param description - İşlem açıklaması
 * @param referenceId - Referans ID (örn: reportId)
 * @param metadata - Ek bilgiler (JSON)
 * @returns Rezerve edilen transaction bilgisi
 */
export async function reserveCredits(
  userId: number,
  amount: number,
  description: string,
  referenceId?: string,
  metadata?: any
): Promise<CreditOperationResult> {
  try {
    // 1. Kullanıcı kredisini kontrol et
    const userCredits = await prisma.userCredits.findUnique({
      where: { userId },
    });

    if (!userCredits) {
      throw new Error('Kullanıcı kredisi bulunamadı');
    }

    // 2. Bakiyeyi kontrol et
    const currentBalance = parseFloat(userCredits.balance.toString());
    if (currentBalance < amount) {
      return {
        success: false,
        transactionId: 0,
        newBalance: currentBalance,
        message: 'Yetersiz kredi bakiyesi',
      };
    }

    // 3. Transaction kaydı oluştur (PENDING)
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId,
        transactionType: 'USAGE',
        amount,
        description,
        referenceId,
        status: 'PENDING',
        metadata: metadata || null,
      },
    });

    console.log(`✅ Kredi rezerve edildi: ${amount} TL (User: ${userId}, Transaction: ${transaction.id})`);

    return {
      success: true,
      transactionId: transaction.id,
      newBalance: currentBalance,
    };
  } catch (error) {
    console.error('❌ Kredi rezerve hatası:', error);
    throw new Error('Kredi rezervasyonu başarısız oldu');
  }
}

/**
 * Kredi Onayla ve Düş
 * 
 * Analiz başarılı olduğunda krediyi tam olarak düşer
 * 
 * @param transactionId - Transaction ID
 * @returns İşlem sonucu
 */
export async function confirmCredits(transactionId: number): Promise<CreditOperationResult> {
  try {
    // 1. Transaction'ı bul
    const transaction = await prisma.creditTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error('Transaction bulunamadı');
    }

    if (transaction.status !== 'PENDING') {
      throw new Error('Transaction zaten işlenmiş');
    }

    // 2. Atomik işlem: Kredi düş + Transaction onayla
    const result = await prisma.$transaction(async (tx) => {
      // Kredi düş
      const updatedCredits = await tx.userCredits.update({
        where: { userId: transaction.userId },
        data: {
          balance: { decrement: transaction.amount },
          totalUsed: { increment: transaction.amount },
        },
      });

      // Transaction'ı COMPLETED olarak işaretle
      await tx.creditTransaction.update({
        where: { id: transactionId },
        data: { status: 'COMPLETED' },
      });

      return {
        newBalance: parseFloat(updatedCredits.balance.toString()),
        transactionId: transactionId,
      };
    });

    console.log(`✅ Kredi onaylandı ve düşüldü: ${transaction.amount} TL (Transaction: ${transactionId})`);

    return {
      success: true,
      transactionId: transactionId,
      newBalance: result.newBalance,
    };
  } catch (error) {
    console.error('❌ Kredi onaylama hatası:', error);
    throw new Error('Kredi onaylama başarısız oldu');
  }
}

/**
 * Kredi İade Et
 * 
 * Analiz başarısız olduğunda krediyi iade eder
 * 
 * @param transactionId - Transaction ID
 * @param reason - İade sebebi
 * @returns İşlem sonucu
 */
export async function refundCredits(
  transactionId: number,
  reason: string = 'Analiz başarısız'
): Promise<CreditOperationResult> {
  try {
    // 1. Transaction'ı bul
    const transaction = await prisma.creditTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error('Transaction bulunamadı');
    }

    if (transaction.status !== 'PENDING') {
      console.log(`⚠️ Transaction zaten ${transaction.status} durumunda, iade edilemedi`);
      return {
        success: false,
        transactionId: transactionId,
        newBalance: 0,
        message: `Transaction zaten ${transaction.status} durumunda`,
      };
    }

    // 2. Transaction'ı REFUNDED olarak işaretle
    // (Zaten PENDING olduğu için kredi düşmemişti, sadece işaretle)
    await prisma.creditTransaction.update({
      where: { id: transactionId },
      data: {
        status: 'REFUNDED',
        description: `${transaction.description} (İptal: ${reason})`,
      },
    });

    console.log(`✅ Kredi iade edildi: ${transaction.amount} TL (Transaction: ${transactionId})`);

    // Kullanıcının güncel bakiyesini al
    const userCredits = await prisma.userCredits.findUnique({
      where: { userId: transaction.userId },
    });

    return {
      success: true,
      transactionId: transactionId,
      newBalance: userCredits ? parseFloat(userCredits.balance.toString()) : 0,
    };
  } catch (error) {
    console.error('❌ Kredi iade hatası:', error);
    throw new Error('Kredi iadesi başarısız oldu');
  }
}

/**
 * Kredi Düş (Eski Yöntem - Backward Compatibility)
 * 
 * Eski kodda kullanılan kredi düşme yöntemi
 * YENİ: Bu yöntemi reserve + confirm ile değiştirmek önerilir
 * 
 * @param userId - Kullanıcı ID
 * @param amount - Düşülecek miktar
 * @param description - İşlem açıklaması
 * @param referenceId - Referans ID
 * @returns İşlem sonucu
 */
export async function deductCredits(
  userId: number,
  amount: number,
  description: string,
  referenceId?: string
): Promise<CreditOperationResult> {
  try {
    // Atomik işlem: Kredi düş + Transaction oluştur
    const result = await prisma.$transaction(async (tx) => {
      // 1. Kullanıcı kredisini kontrol et
      const userCredits = await tx.userCredits.findUnique({
        where: { userId },
      });

      if (!userCredits) {
        throw new Error('Kullanıcı kredisi bulunamadı');
      }

      const currentBalance = parseFloat(userCredits.balance.toString());
      if (currentBalance < amount) {
        throw new Error('Yetersiz kredi bakiyesi');
      }

      // 2. Kredi düş
      const updatedCredits = await tx.userCredits.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
          totalUsed: { increment: amount },
        },
      });

      // 3. Transaction kaydı oluştur
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          transactionType: 'USAGE',
          amount,
          description,
          referenceId,
          status: 'COMPLETED',
        },
      });

      return {
        newBalance: parseFloat(updatedCredits.balance.toString()),
        transactionId: transaction.id,
      };
    });

    console.log(`✅ Kredi düşüldü: ${amount} TL (User: ${userId})`);

    return {
      success: true,
      transactionId: result.transactionId,
      newBalance: result.newBalance,
    };
  } catch (error) {
    console.error('❌ Kredi düşme hatası:', error);
    throw error;
  }
}

/**
 * Kredi Ekle (Satın Alma, Admin Yükleme, vs)
 * 
 * @param userId - Kullanıcı ID
 * @param amount - Eklenen miktar
 * @param description - İşlem açıklaması
 * @param referenceId - Referans ID
 * @returns İşlem sonucu
 */
export async function addCredits(
  userId: number,
  amount: number,
  description: string,
  referenceId?: string
): Promise<CreditOperationResult> {
  try {
    // Atomik işlem: Kredi ekle + Transaction oluştur
    const result = await prisma.$transaction(async (tx) => {
      // 1. Kullanıcı kredisini bul
      const userCredits = await tx.userCredits.findUnique({
        where: { userId },
      });

      if (!userCredits) {
        throw new Error('Kullanıcı kredisi bulunamadı');
      }

      // 2. Kredi ekle
      const updatedCredits = await tx.userCredits.update({
        where: { userId },
        data: {
          balance: { increment: amount },
          totalPurchased: { increment: amount },
        },
      });

      // 3. Transaction kaydı oluştur
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          transactionType: 'PURCHASE',
          amount,
          description,
          referenceId,
          status: 'COMPLETED',
        },
      });

      return {
        newBalance: parseFloat(updatedCredits.balance.toString()),
        transactionId: transaction.id,
      };
    });

    console.log(`✅ Kredi eklendi: ${amount} TL (User: ${userId})`);

    return {
      success: true,
      transactionId: result.transactionId,
      newBalance: result.newBalance,
    };
  } catch (error) {
    console.error('❌ Kredi ekleme hatası:', error);
    throw error;
  }
}

