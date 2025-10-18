/**
 * Notification Service (Bildirim Servisi)
 * 
 * Clean Architecture - Service Layer (İş Mantığı Katmanı)
 * 
 * Bu servis, bildirim oluşturma ve yönetimi için iş mantığını içerir.
 * 
 * Sorumluluklar:
 * - Bildirim oluşturma
 * - Bildirim şablonları
 * - Toplu bildirim gönderimi
 * - Bildirim kategorileri
 * 
 * Kullanım:
 * - Rapor tamamlandığında bildirim oluştur
 * - Kredi yüklendiğinde bildirim oluştur
 * - Ödeme başarısız olduğunda bildirim oluştur
 * - Sistem güncellemeleri için bildirim oluştur
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationData {
  userId: number;
  title: string;
  message: string;
  type: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';
  actionUrl?: string;
}

export class NotificationService {
  /**
   * Bildirim Oluştur
   * 
   * @param data - Bildirim verileri
   * @returns Oluşturulan bildirim
   */
  static async createNotification(data: CreateNotificationData) {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        actionUrl: data.actionUrl,
      },
    });
  }

  /**
   * Rapor Tamamlandı Bildirimi
   * 
   * @param userId - Kullanıcı ID
   * @param reportType - Rapor türü
   * @param vehiclePlate - Araç plakası
   * @param reportId - Rapor ID
   */
  static async createReportCompletedNotification(
    userId: number,
    reportType: string,
    vehiclePlate: string,
    reportId: number
  ) {
    const reportTypeNames: Record<string, string> = {
      'PAINT_ANALYSIS': 'Boya Analizi',
      'DAMAGE_ANALYSIS': 'Hasar Analizi',
      'DAMAGE_ASSESSMENT': 'Hasar Değerlendirmesi',
      'ENGINE_SOUND_ANALYSIS': 'Motor Ses Analizi',
      'VALUE_ESTIMATION': 'Değer Tahmini',
      'COMPREHENSIVE_EXPERTISE': 'Kapsamlı Ekspertiz',
      'FULL_REPORT': 'Tam Rapor'
    };

    const reportTypeName = reportTypeNames[reportType] || reportType;

    return await this.createNotification({
      userId,
      title: 'Rapor Tamamlandı',
      message: `${vehiclePlate} plakalı araç için ${reportTypeName} raporunuz hazır.`,
      type: 'SUCCESS',
      actionUrl: `/reports/${reportId}`,
    });
  }

  /**
   * Kredi Yüklendi Bildirimi
   * 
   * @param userId - Kullanıcı ID
   * @param amount - Yüklenen miktar
   * @param newBalance - Yeni bakiye
   */
  static async createCreditAddedNotification(
    userId: number,
    amount: number,
    newBalance: number
  ) {
    return await this.createNotification({
      userId,
      title: 'Kredi Yüklendi',
      message: `Hesabınıza ${amount}₺ kredi yüklendi. Yeni bakiyeniz: ${newBalance}₺`,
      type: 'INFO',
      actionUrl: '/dashboard',
    });
  }

  /**
   * Ödeme Başarısız Bildirimi
   * 
   * @param userId - Kullanıcı ID
   * @param amount - Başarısız miktar
   */
  static async createPaymentFailedNotification(
    userId: number,
    amount: number
  ) {
    return await this.createNotification({
      userId,
      title: 'Ödeme Başarısız',
      message: `${amount}₺ kredi yükleme işleminiz başarısız oldu. Lütfen tekrar deneyin.`,
      type: 'WARNING',
      actionUrl: '/payment/add-credits',
    });
  }

  /**
   * Rapor İşleniyor Bildirimi
   * 
   * @param userId - Kullanıcı ID
   * @param reportType - Rapor türü
   * @param vehiclePlate - Araç plakası
   */
  static async createReportProcessingNotification(
    userId: number,
    reportType: string,
    vehiclePlate: string
  ) {
    const reportTypeNames: Record<string, string> = {
      'PAINT_ANALYSIS': 'boya analizi',
      'DAMAGE_ANALYSIS': 'hasar analizi',
      'DAMAGE_ASSESSMENT': 'hasar değerlendirmesi',
      'ENGINE_SOUND_ANALYSIS': 'motor ses analizi',
      'VALUE_ESTIMATION': 'değer tahmini',
      'COMPREHENSIVE_EXPERTISE': 'kapsamlı ekspertiz',
      'FULL_REPORT': 'tam rapor'
    };

    const reportTypeName = reportTypeNames[reportType] || reportType;

    return await this.createNotification({
      userId,
      title: 'Rapor İşleniyor',
      message: `${vehiclePlate} plakalı araç için ${reportTypeName} devam ediyor.`,
      type: 'INFO',
      actionUrl: '/reports',
    });
  }

  /**
   * Hoş Geldiniz Bildirimi
   * 
   * @param userId - Kullanıcı ID
   * @param firstName - Kullanıcı adı
   */
  static async createWelcomeNotification(
    userId: number,
    firstName: string
  ) {
    return await this.createNotification({
      userId,
      title: 'Hoş Geldiniz!',
      message: `${firstName}, Mivvo Expertiz'e hoş geldiniz! İlk raporunuzu oluşturmak için başlayın.`,
      type: 'SUCCESS',
      actionUrl: '/vehicle/new-report',
    });
  }

  /**
   * Sistem Bakım Bildirimi
   * 
   * @param userId - Kullanıcı ID
   * @param message - Bakım mesajı
   */
  static async createSystemMaintenanceNotification(
    userId: number,
    message: string
  ) {
    return await this.createNotification({
      userId,
      title: 'Sistem Bakımı',
      message,
      type: 'WARNING',
      actionUrl: '/dashboard',
    });
  }

  /**
   * Toplu Bildirim Gönder
   * 
   * @param userIds - Kullanıcı ID listesi
   * @param data - Bildirim verileri
   */
  static async createBulkNotifications(
    userIds: number[],
    data: Omit<CreateNotificationData, 'userId'>
  ) {
    const notifications = userIds.map(userId => ({
      userId,
      title: data.title,
      message: data.message,
      type: data.type,
      actionUrl: data.actionUrl,
    }));

    return await prisma.notification.createMany({
      data: notifications,
    });
  }
}
