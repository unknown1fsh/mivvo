/**
 * Payment Controller (Ödeme Kontrolcüsü)
 * 
 * Clean Architecture - Controller Layer (Kontrolcü Katmanı)
 * 
 * Bu dosya, ödeme işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Ödeme başlatma
 * - Ödeme doğrulama
 * - Kredi yükleme
 * - Transaction kayıtları
 * 
 * Kullanım:
 * - POST /api/payments/initiate - Ödeme başlat
 * - POST /api/payments/verify - Ödeme doğrula
 * - POST /api/payments/refund - Para iadesi
 */

import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { CREDIT_PRICING } from '../constants/CreditPricing'
import { getPrismaClient } from '../utils/prisma'

const prisma = getPrismaClient()

// ===== INTERFACES =====

export interface PaymentInitiateRequest {
  packageId: 'starter' | 'professional' | 'enterprise'
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET'
  amount: number
}

export interface PaymentInitiateResponse {
  success: boolean
  message: string
  data?: {
    paymentId: string
    paymentUrl?: string
    amount: number
    package: any
  }
}

export interface PaymentVerifyRequest {
  paymentId: string
  transactionId?: string
  status: 'success' | 'failed' | 'pending'
}

// ===== CONTROLLER METHODS =====

/**
 * Ödeme İşlemini Başlat
 * 
 * @route   POST /api/payments/initiate
 * @access  Private
 * 
 * @returns 200 - Ödeme başlatıldı
 * @returns 400 - Geçersiz paket
 * @returns 401 - Yetkisiz erişim
 * @returns 500 - Sunucu hatası
 * 
 * @example
 * POST /api/payments/initiate
 * Body: { packageId: 'professional', paymentMethod: 'card' }
 * Response: { success: true, data: { paymentId: '...', amount: 649 } }
 */
export const initiatePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { packageId, paymentMethod }: PaymentInitiateRequest = req.body
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Yetkilendirme gerekli'
      })
      return
    }

    // Paket bilgilerini CREDIT_PRICING'den al
    let packageData: any = null
    
    switch (packageId) {
      case 'starter':
        packageData = CREDIT_PRICING.PACKAGES.STARTER
        break
      case 'professional':
        packageData = CREDIT_PRICING.PACKAGES.PROFESSIONAL
        break
      case 'enterprise':
        packageData = CREDIT_PRICING.PACKAGES.ENTERPRISE
        break
      default:
        res.status(400).json({
          success: false,
          message: 'Geçersiz paket ID'
        })
        return
    }

    // Ödeme kaydı oluştur (pending status)
    const paymentRecord = await prisma.payment.create({
      data: {
        userId,
        amount: packageData.price,
        paymentMethod,
        paymentStatus: 'PENDING',
        currency: 'TRY',
        paymentProvider: 'mock-gateway',
        referenceNumber: `PKG-${packageId}-${Date.now()}`
      }
    })

    // TODO: Gerçek ödeme gateway entegrasyonu
    // Şimdilik mock response
    const paymentUrl = `https://payment-gateway.com/pay/${paymentRecord.id}`

    res.json({
      success: true,
      message: 'Ödeme işlemi başlatıldı',
      data: {
        paymentId: paymentRecord.id,
        paymentUrl,
        amount: packageData.price,
        package: {
          id: packageId,
          credits: packageData.credits,
          bonus: packageData.realValue - packageData.price,
          price: packageData.price
        }
      }
    })

  } catch (error) {
    console.error('Payment initiation error:', error)
    res.status(500).json({
      success: false,
      message: 'Ödeme işlemi başlatılamadı'
    })
  }
}

/**
 * Ödeme İşlemini Doğrula ve Kredi Yükle
 * 
 * @route   POST /api/payments/verify
 * @access  Private
 * 
 * @returns 200 - Ödeme doğrulandı ve kredi yüklendi
 * @returns 400 - Geçersiz ödeme
 * @returns 404 - Ödeme bulunamadı
 * @returns 500 - Sunucu hatası
 */
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentId, status }: PaymentVerifyRequest = req.body
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Yetkilendirme gerekli'
      })
      return
    }

    // Ödeme kaydını bul
    const payment = await prisma.payment.findFirst({
      where: {
        id: parseInt(paymentId),
        userId
      }
    })

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Ödeme kaydı bulunamadı'
      })
      return
    }

    if (payment.paymentStatus !== 'PENDING') {
      res.status(400).json({
        success: false,
        message: 'Bu ödeme zaten işlenmiş'
      })
      return
    }

    if (status === 'success') {
      // Paket bilgilerini al - referenceNumber'dan packageId çıkar
      const packageId = payment.referenceNumber?.split('-')[1] || 'professional'
      let packageData: any = null
      
      switch (packageId) {
        case 'starter':
          packageData = CREDIT_PRICING.PACKAGES.STARTER
          break
        case 'professional':
          packageData = CREDIT_PRICING.PACKAGES.PROFESSIONAL
          break
        case 'enterprise':
          packageData = CREDIT_PRICING.PACKAGES.ENTERPRISE
          break
      }

      // Transaction başlat
      await prisma.$transaction(async (tx) => {
        // Ödeme durumunu güncelle
        await tx.payment.update({
          where: { id: parseInt(paymentId) },
          data: {
            paymentStatus: 'COMPLETED'
          }
        })

        // Kullanıcı kredilerini güncelle
        const userCredits = await tx.userCredits.findUnique({
          where: { userId }
        })

        if (!userCredits) {
          throw new Error('Kullanıcı kredisi bulunamadı')
        }

        const newBalance = userCredits.balance.add(packageData.credits)
        const newTotalPurchased = userCredits.totalPurchased.add(packageData.price)

        await tx.userCredits.update({
          where: { userId },
          data: {
            balance: newBalance,
            totalPurchased: newTotalPurchased
          }
        })

        // Credit transaction kaydı oluştur
        await tx.creditTransaction.create({
          data: {
            userId,
            transactionType: 'PURCHASE',
            amount: packageData.credits,
            description: `${packageData.credits} kredi satın alma (${packageId} paketi)`,
            referenceId: paymentId
          }
        })

        // Bonus kredi varsa ekle
        const bonusCredits = packageData.realValue - packageData.price
        if (bonusCredits > 0) {
          const newBalanceWithBonus = newBalance.add(bonusCredits)
          
          await tx.userCredits.update({
            where: { userId },
            data: {
              balance: newBalanceWithBonus
            }
          })

          await tx.creditTransaction.create({
            data: {
              userId,
              transactionType: 'PURCHASE',
              amount: bonusCredits,
              description: `${bonusCredits} TL bonus kredi`,
              referenceId: paymentId
            }
          })
        }
      })

      res.json({
        success: true,
        message: 'Ödeme başarıyla tamamlandı ve krediler yüklendi',
        data: {
          creditsAdded: packageData.credits,
          bonusCredits: packageData.realValue - packageData.price,
          newBalance: await getUserCreditBalance(userId)
        }
      })

    } else {
      // Ödeme başarısız
      await prisma.payment.update({
        where: { id: parseInt(paymentId) },
        data: {
          paymentStatus: 'FAILED'
        }
      })

      res.json({
        success: false,
        message: 'Ödeme başarısız oldu'
      })
    }

  } catch (error) {
    console.error('Payment verification error:', error)
    res.status(500).json({
      success: false,
      message: 'Ödeme doğrulanamadı'
    })
  }
}

/**
 * Para İadesi
 * 
 * @route   POST /api/payments/refund
 * @access  Private
 * 
 * @returns 200 - İade başlatıldı
 * @returns 400 - İade edilemez
 * @returns 500 - Sunucu hatası
 */
export const refundPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.body
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Yetkilendirme gerekli'
      })
      return
    }

    // Ödeme kaydını bul
    const payment = await prisma.payment.findFirst({
      where: {
        id: parseInt(paymentId),
        userId,
        paymentStatus: 'COMPLETED'
      }
    })

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Tamamlanmış ödeme bulunamadı'
      })
      return
    }

    // 7 gün kontrolü
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    if (payment.updatedAt && payment.updatedAt < sevenDaysAgo) {
      res.status(400).json({
        success: false,
        message: 'İade süresi dolmuş (7 gün)'
      })
      return
    }

    // TODO: Gerçek ödeme gateway'den iade işlemi
    // Şimdilik mock
    await prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        paymentStatus: 'REFUNDED'
      }
    })

    res.json({
      success: true,
      message: 'İade işlemi başlatıldı'
    })

  } catch (error) {
    console.error('Payment refund error:', error)
    res.status(500).json({
      success: false,
      message: 'İade işlemi başlatılamadı'
    })
  }
}

// ===== HELPER FUNCTIONS =====

async function getUserCreditBalance(userId: number): Promise<number> {
  const userCredits = await prisma.userCredits.findUnique({
    where: { userId }
  })
  
  return userCredits ? Number(userCredits.balance) : 0
}