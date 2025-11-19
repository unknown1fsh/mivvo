/**
 * Payment Webhook Controller
 * 
 * İyzico webhook'larını işler.
 */

import { Request, Response } from 'express';
import { getPrismaClient } from '../utils/prisma';
import { verifyWebhookSignature, verifyPayment as iyzicoVerifyPayment } from '../services/paymentService';
import { logError, logInfo } from '../utils/logger';
import { CREDIT_PRICING } from '../constants/CreditPricing';

const prisma = getPrismaClient();

/**
 * İyzico Webhook Handler
 * 
 * İyzico'dan gelen ödeme bildirimlerini işler.
 * 
 * @route   POST /api/payments/webhook/iyzico
 * @access  Public (İyzico'dan gelen istekler)
 */
export const handleIyzicoWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // Webhook signature doğrulama
    const signature = req.headers['x-iyzico-signature'] as string;
    const body = JSON.stringify(req.body);

    if (!verifyWebhookSignature(signature, body)) {
      logError('İyzico webhook signature doğrulama başarısız', new Error('Invalid signature'));
      res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
      return;
    }

    const webhookData = req.body;

    logInfo('İyzico webhook alındı', { 
      event: webhookData.event,
      paymentId: webhookData.paymentId,
      conversationId: webhookData.conversationId,
    });

    // Conversation ID'den payment ID'yi çıkar (format: PAYMENT-{id})
    const conversationId = webhookData.conversationId || '';
    const paymentIdMatch = conversationId.match(/PAYMENT-(\d+)/);
    
    if (!paymentIdMatch) {
      logError('İyzico webhook: Payment ID bulunamadı', new Error('Invalid conversationId'));
      res.status(400).json({
        success: false,
        message: 'Invalid conversationId'
      });
      return;
    }

    const paymentId = parseInt(paymentIdMatch[1]);

    // Ödeme kaydını bul
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      logError('İyzico webhook: Ödeme kaydı bulunamadı', new Error(`Payment ${paymentId} not found`));
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }

    // Ödeme zaten işlenmişse tekrar işleme
    if (payment.paymentStatus !== 'PENDING') {
      logInfo('İyzico webhook: Ödeme zaten işlenmiş', { paymentId, status: payment.paymentStatus });
      res.json({
        success: true,
        message: 'Payment already processed'
      });
      return;
    }

    // İyzico'dan ödeme durumunu doğrula
    if (webhookData.token && webhookData.conversationId) {
      const verifyResult = await iyzicoVerifyPayment({
        token: webhookData.token,
        conversationId: webhookData.conversationId,
      });

      if (verifyResult.success && verifyResult.paymentId) {
        // Ödeme başarılı - kredileri yükle
        const packageId = payment.referenceNumber?.split('-')[1] || 'professional';
        let packageData: any = null;
        
        switch (packageId) {
          case 'starter':
            packageData = CREDIT_PRICING.PACKAGES.STARTER;
            break;
          case 'professional':
            packageData = CREDIT_PRICING.PACKAGES.PROFESSIONAL;
            break;
          case 'enterprise':
            packageData = CREDIT_PRICING.PACKAGES.ENTERPRISE;
            break;
        }

        if (packageData) {
          await prisma.$transaction(async (tx) => {
            // Ödeme durumunu güncelle
            await tx.payment.update({
              where: { id: paymentId },
              data: {
                paymentStatus: 'COMPLETED',
                transactionId: verifyResult.paymentId,
              }
            });

            // Kullanıcı kredilerini güncelle
            const userCredits = await tx.userCredits.findUnique({
              where: { userId: payment.userId }
            });

            if (userCredits) {
              const newBalance = userCredits.balance.add(packageData.credits);
              const newTotalPurchased = userCredits.totalPurchased.add(packageData.price);

              await tx.userCredits.update({
                where: { userId: payment.userId },
                data: {
                  balance: newBalance,
                  totalPurchased: newTotalPurchased
                }
              });

              // Credit transaction kaydı oluştur
              await tx.creditTransaction.create({
                data: {
                  userId: payment.userId,
                  transactionType: 'PURCHASE',
                  amount: packageData.credits,
                  description: `${packageData.credits} kredi satın alma (${packageId} paketi)`,
                  referenceId: paymentId.toString()
                }
              });

              // Bonus kredi varsa ekle
              const bonusCredits = packageData.realValue - packageData.price;
              if (bonusCredits > 0) {
                const newBalanceWithBonus = newBalance.add(bonusCredits);
                
                await tx.userCredits.update({
                  where: { userId: payment.userId },
                  data: {
                    balance: newBalanceWithBonus
                  }
                });

                await tx.creditTransaction.create({
                  data: {
                    userId: payment.userId,
                    transactionType: 'PURCHASE',
                    amount: bonusCredits,
                    description: `${bonusCredits} TL bonus kredi`,
                    referenceId: paymentId.toString()
                  }
                });
              }
            }
          });

          logInfo('İyzico webhook: Ödeme başarıyla işlendi', { paymentId, userId: payment.userId });
        }
      } else {
        // Ödeme başarısız
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            paymentStatus: 'FAILED'
          }
        });

        logInfo('İyzico webhook: Ödeme başarısız', { paymentId, error: verifyResult.error });
      }
    }

    res.json({
      success: true,
      message: 'Webhook processed'
    });
  } catch (error) {
    logError('İyzico webhook işleme hatası', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

