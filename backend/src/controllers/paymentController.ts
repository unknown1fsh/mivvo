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
import { initiatePayment as iyzicoInitiatePayment, verifyPayment as iyzicoVerifyPayment, refundPayment as iyzicoRefundPayment } from '../services/paymentService'
import { getEnv } from '../utils/envValidation'
import { logError, logInfo } from '../utils/logger'

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

    // Kullanıcı bilgilerini al
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true }
    })

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
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
        paymentProvider: 'iyzico',
        referenceNumber: `PKG-${packageId}-${Date.now()}`
      }
    })

    // İyzico ödeme başlatma
    const env = getEnv()
    const callbackUrl = `${env.CORS_ORIGIN || process.env.CORS_ORIGIN || 'http://localhost:3000'}/payment/callback?paymentId=${paymentRecord.id}`
    
    const iyzicoResult = await iyzicoInitiatePayment({
      userId,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      amount: packageData.price,
      packageId,
      paymentId: paymentRecord.id,
      callbackUrl,
    })

    if (!iyzicoResult.success) {
      // İyzico başarısız, ödeme kaydını FAILED olarak işaretle
      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: { paymentStatus: 'FAILED' }
      })

      res.status(500).json({
        success: false,
        message: iyzicoResult.error || 'Ödeme işlemi başlatılamadı'
      })
      return
    }

    // İyzico'dan gelen payment URL veya form'u döndür
    res.json({
      success: true,
      message: 'Ödeme işlemi başlatıldı',
      data: {
        paymentId: paymentRecord.id,
        paymentUrl: iyzicoResult.paymentUrl,
        paymentForm: iyzicoResult.paymentForm, // 3D Secure için HTML form
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
    const { paymentId, token, conversationId, status }: PaymentVerifyRequest & { token?: string; conversationId?: string } = req.body
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

    // İyzico doğrulama (token ve conversationId varsa)
    let iyzicoVerified = false
    if (token && conversationId) {
      const iyzicoResult = await iyzicoVerifyPayment({ token, conversationId })
      iyzicoVerified = iyzicoResult.success
      
      if (iyzicoVerified && iyzicoResult.paymentId) {
        // İyzico transaction ID'yi kaydet
        await prisma.payment.update({
          where: { id: payment.id },
          data: { transactionId: iyzicoResult.paymentId }
        })
      }
    }

    // Status kontrolü (frontend'den gelen status veya İyzico doğrulama sonucu)
    const isSuccess = status === 'success' || iyzicoVerified

    if (isSuccess) {
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

        const newBalance = Number(userCredits.balance) + packageData.credits
        const newTotalPurchased = Number(userCredits.totalPurchased) + packageData.price

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
          const newBalanceWithBonus = newBalance + bonusCredits
          
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

    // İyzico iade işlemi
    if (payment.transactionId) {
      const iyzicoResult = await iyzicoRefundPayment({
        paymentId: payment.transactionId,
        amount: Number(payment.amount), // Kısmi iade için amount parametresi gönderilebilir
        reason: req.body.reason,
      })

      if (!iyzicoResult.success) {
        logError('İyzico iade hatası', new Error(iyzicoResult.error || 'Unknown error'))
        res.status(500).json({
          success: false,
          message: iyzicoResult.error || 'İade işlemi başlatılamadı'
        })
        return
      }

      logInfo('İyzico iade başarılı', { paymentId: payment.id, refundId: iyzicoResult.refundId })
    }

    // Ödeme durumunu REFUNDED olarak güncelle
    await prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        paymentStatus: 'REFUNDED'
      }
    })

    // Kullanıcıdan kredileri düş (iade edilen tutar kadar)
    const userCredits = await prisma.userCredits.findUnique({
      where: { userId }
    })

    if (userCredits) {
      const refundAmount = Number(payment.amount)
      const newBalance = Math.max(0, Number(userCredits.balance) - refundAmount)

      await prisma.userCredits.update({
        where: { userId },
        data: {
          balance: newBalance
        }
      })

      // Refund transaction kaydı oluştur
      await prisma.creditTransaction.create({
        data: {
          userId,
          transactionType: 'REFUND',
          amount: -refundAmount,
          description: `İade: ${refundAmount} TL`,
          referenceId: paymentId.toString()
        }
      })
    }

    res.json({
      success: true,
      message: 'İade işlemi başarıyla tamamlandı'
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