/**
 * Kredi İade Utility
 * 
 * AI analizi başarısız olduğunda krediyi otomatik iade eden fonksiyon
 */

import { PrismaClient } from '@prisma/client'
import { ERROR_MESSAGES } from '../constants/ErrorMessages'

const prisma = new PrismaClient()

export interface CreditRefundResult {
  success: boolean
  refundedAmount: number
  newBalance: number
  transactionId: number
}

/**
 * AI Analizi Başarısız Olduğunda Kredi İade Et
 * 
 * @param userId - Kullanıcı ID
 * @param reportId - Rapor ID
 * @param serviceCost - İade edilecek kredi miktarı
 * @param reason - İade sebebi
 * @returns İade sonucu
 */
export async function refundCreditForFailedAnalysis(
  userId: number,
  reportId: number,
  serviceCost: number,
  reason: string = 'AI analizi başarısız'
): Promise<CreditRefundResult> {
  try {
    // 1. Kullanıcı kredisini güncelle (iade et)
    const updatedCredits = await prisma.userCredits.update({
      where: { userId },
      data: {
        balance: { increment: serviceCost },
        totalUsed: { decrement: serviceCost }
      }
    })

    // 2. İade transaction kaydı oluştur
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId,
        transactionType: 'REFUND',
        amount: serviceCost,
        description: `Rapor #${reportId} - ${reason}`,
        referenceId: `REFUND_REPORT_${reportId}_${Date.now()}`
      }
    })

    // 3. Rapor durumunu FAILED olarak işaretle
    await prisma.vehicleReport.update({
      where: { id: reportId },
      data: {
        status: 'FAILED',
        expertNotes: reason
      }
    })

    console.log(`✅ Kredi iade edildi: ${serviceCost} TL (User: ${userId}, Report: ${reportId})`)

    return {
      success: true,
      refundedAmount: serviceCost,
      newBalance: parseFloat(updatedCredits.balance.toString()),
      transactionId: transaction.id
    }
  } catch (error) {
    console.error('❌ Kredi iade hatası:', error)
    throw new Error('Kredi iade işlemi başarısız oldu')
  }
}

/**
 * Rapor Durumunu FAILED Olarak İşaretle (Kredi iade etmeden)
 * 
 * Kredi zaten alınmamışsa veya farklı sebeplerle sadece raporu işaretle
 * 
 * @param reportId - Rapor ID
 * @param reason - Başarısızlık sebebi
 */
export async function markReportAsFailed(
  reportId: number,
  reason: string = 'İşlem başarısız'
): Promise<void> {
  try {
    await prisma.vehicleReport.update({
      where: { id: reportId },
      data: {
        status: 'FAILED',
        expertNotes: reason
      }
    })

    console.log(`⚠️ Rapor FAILED olarak işaretlendi: #${reportId}`)
  } catch (error) {
    console.error('❌ Rapor güncelleme hatası:', error)
  }
}

