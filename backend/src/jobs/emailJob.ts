/**
 * Email Job
 * 
 * Email gönderme işlemlerini background job olarak işler.
 */

import { createWorker, addJob, getQueue } from '../services/queueService';
import { emailService } from '../services/emailService';
import { logError, logInfo } from '../utils/logger';

export const EMAIL_QUEUE = 'email';

/**
 * Email Job Data
 */
export interface EmailJobData {
  type: 'verification' | 'password-reset' | 'welcome' | 'report-ready' | 'custom';
  to: string;
  subject?: string;
  html?: string;
  text?: string;
  token?: string;
  userName?: string;
  reportId?: number;
  customData?: any;
}

/**
 * Email Job ekle
 */
export async function addEmailJob(data: EmailJobData): Promise<string | null> {
  return addJob(EMAIL_QUEUE, 'send-email', data, {
    priority: 1,
    jobId: `email-${data.type}-${Date.now()}`,
  });
}

/**
 * Email Worker'ı başlat
 */
export function startEmailWorker(): void {
  const worker = createWorker<EmailJobData>(EMAIL_QUEUE, async (job) => {
    const { type, to, subject, html, text, token, userName, reportId, customData } = job.data;

    logInfo('Email job başlatıldı', { type, to });

    try {
      let result;

      switch (type) {
        case 'verification':
          if (!token) {
            throw new Error('Verification token is required');
          }
          result = await emailService.sendVerificationEmail(to, token, userName);
          break;

        case 'password-reset':
          if (!token) {
            throw new Error('Reset token is required');
          }
          result = await emailService.sendPasswordResetEmail(to, token, userName);
          break;

        case 'welcome':
          result = await emailService.sendWelcomeEmail(to, userName);
          break;

        case 'report-ready':
          // Rapor hazır email'i
          if (!reportId) {
            throw new Error('Report ID is required');
          }
          const reportReadyHtml = `
            <!DOCTYPE html>
            <html lang="tr">
            <head>
              <meta charset="UTF-8">
              <title>Raporunuz Hazır - Mivvo Expertiz</title>
            </head>
            <body>
              <h2>Raporunuz Hazır! 🎉</h2>
              <p>Merhaba ${userName || 'Değerli Kullanıcı'},</p>
              <p>Raporunuz hazır. Detayları görüntülemek için <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reports/${reportId}">buraya tıklayın</a>.</p>
            </body>
            </html>
          `;
          result = await emailService.sendCustomEmail(
            to,
            'Raporunuz Hazır - Mivvo Expertiz',
            reportReadyHtml
          );
          break;

        case 'custom':
          if (!subject || !html) {
            throw new Error('Subject and HTML are required for custom emails');
          }
          result = await emailService.sendCustomEmail(to, subject, html, text);
          break;

        default:
          throw new Error(`Unknown email type: ${type}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Email gönderilemedi');
      }

      logInfo('Email job tamamlandı', { type, to, messageId: result.messageId });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      logError('Email job hatası', error, { type, to });
      throw error;
    }
  });

  if (worker) {
    logInfo('Email worker başlatıldı', { queueName: EMAIL_QUEUE });
  } else {
    logError('Email worker başlatılamadı: Redis bağlantısı yok', new Error('Worker is null'));
  }
}

