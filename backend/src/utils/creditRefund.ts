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
  const maxRetries = 3
  let lastError: Error | null = null

  // Retry mekanizması ile kredi iade
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Kredi iade deneniyor (Deneme ${attempt}/${maxRetries})...`, {
        userId,
        reportId,
        serviceCost,
        reason
      })

      // Atomik işlem: Kredi iade + Transaction oluştur + Rapor güncelle
      const result = await prisma.$transaction(async (tx) => {
        // 1. Kullanıcı kredisini güncelle (iade et)
        const updatedCredits = await tx.userCredits.update({
          where: { userId },
          data: {
            balance: { increment: serviceCost },
            totalUsed: { decrement: serviceCost }
          }
        })

        // 2. İade transaction kaydı oluştur
        const transaction = await tx.creditTransaction.create({
          data: {
            userId,
            transactionType: 'REFUND',
            amount: serviceCost,
            description: `Rapor #${reportId} - ${reason}`,
            referenceId: `REFUND_REPORT_${reportId}_${Date.now()}`,
            status: 'COMPLETED'
          }
        })

        // 3. Rapor durumunu FAILED olarak işaretle (eğer zaten FAILED değilse)
        try {
          await tx.vehicleReport.update({
            where: { id: reportId },
            data: {
              status: 'FAILED',
              expertNotes: reason
            }
          })
        } catch (updateError) {
          // Rapor güncelleme hatası olsa bile devam et (kredi iade edildi)
          console.warn('⚠️ Rapor güncelleme hatası (kredi iade edildi):', updateError)
        }

        return {
          newBalance: parseFloat(updatedCredits.balance.toString()),
          transactionId: transaction.id
        }
      })

      console.log(`✅ Kredi iade edildi: ${serviceCost} TL (User: ${userId}, Report: ${reportId})`)

      return {
        success: true,
        refundedAmount: serviceCost,
        newBalance: result.newBalance,
        transactionId: result.transactionId
      }
    } catch (error: any) {
      lastError = error
      console.error(`❌ Kredi iade hatası (Deneme ${attempt}/${maxRetries}):`, error)

      // Son deneme ise alternatif yöntemleri dene
      if (attempt === maxRetries) {
        // Alternatif yöntem 1: Sadece kredi güncelle (transaction olmadan)
        try {
          console.log('🔄 Alternatif yöntem deneniyor: Sadece kredi güncelleme...')
          
          const updatedCredits = await prisma.userCredits.update({
            where: { userId },
            data: {
              balance: { increment: serviceCost },
              totalUsed: { decrement: serviceCost }
            }
          })

          // Transaction kaydı oluştur (başarısız olsa bile devam et)
          try {
            await prisma.creditTransaction.create({
              data: {
                userId,
                transactionType: 'REFUND',
                amount: serviceCost,
                description: `Rapor #${reportId} - ${reason} (Alternatif yöntem)`,
                referenceId: `REFUND_REPORT_${reportId}_${Date.now()}`,
                status: 'COMPLETED'
              }
            })
          } catch (txError) {
            console.warn('⚠️ Transaction kaydı oluşturulamadı (kredi iade edildi):', txError)
          }

          console.log(`✅ Kredi iade edildi (alternatif yöntem): ${serviceCost} TL`)

          return {
            success: true,
            refundedAmount: serviceCost,
            newBalance: parseFloat(updatedCredits.balance.toString()),
            transactionId: 0 // Transaction kaydı oluşturulamadı
          }
        } catch (altError) {
          console.error('❌ Alternatif yöntem de başarısız:', altError)
          // Tüm yöntemler başarısız, hata fırlat
          throw new Error(`Kredi iade işlemi başarısız oldu (${maxRetries} deneme + alternatif yöntem başarısız)`)
        }
      }

      // Retry arasında bekle (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Max 5 saniye
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // Buraya gelmemeli ama yine de
  throw lastError || new Error('Kredi iade işlemi başarısız oldu')
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

