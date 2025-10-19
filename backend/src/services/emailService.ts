/**
 * Email Service (Email Servisi)
 * 
 * Clean Architecture - Service Layer (Servis Katmanı)
 * 
 * Bu servis, email gönderme işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Email doğrulama linkleri gönderme
 * - Şifre sıfırlama linkleri gönderme
 * - Hoşgeldin email'leri gönderme
 * - Sistem bildirimleri gönderme
 * 
 * Özellikler:
 * - Nodemailer ile SMTP entegrasyonu
 * - HTML email template'leri
 * - Development/Production ortam desteği
 * - Email gönderme hata yönetimi
 * - Template rendering
 * 
 * SMTP Sağlayıcıları:
 * - Resend (önerilen): 100 email/gün ücretsiz
 * - Brevo: 300 email/gün ücretsiz
 * - Gmail SMTP: Gmail hesabı ile
 * 
 * Kullanım:
 * ```typescript
 * import { emailService } from './emailService'
 * 
 * await emailService.sendVerificationEmail(userEmail, token)
 * await emailService.sendPasswordResetEmail(userEmail, token)
 * ```
 */

import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'

// ===== INTERFACES =====

/**
 * Email Template Data Interface
 * 
 * Email template'leri için veri yapısı.
 */
interface EmailTemplateData {
  userName?: string
  userEmail: string
  token?: string
  resetLink?: string
  verificationLink?: string
  frontendUrl: string
}

/**
 * Email Send Result Interface
 * 
 * Email gönderme sonucu.
 */
interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

// ===== EMAIL SERVICE CLASS =====

/**
 * Email Service Class
 * 
 * Email gönderme işlemlerini yöneten servis.
 */
class EmailService {
  private transporter: nodemailer.Transporter
  private prisma: PrismaClient

  /**
   * Constructor
   * 
   * Email servisi başlatır ve SMTP transporter'ı yapılandırır.
   */
  constructor() {
    this.prisma = new PrismaClient()
    this.transporter = this.createTransporter()
  }

  /**
   * Create Transporter (Transporter Oluştur)
   * 
   * Nodemailer transporter'ı yapılandırır.
   * 
   * @returns nodemailer.Transporter
   */
  private createTransporter(): nodemailer.Transporter {
    // Development ortamında test transporter kullan
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      console.log('🔧 Development mod - Test email transporter kullanılıyor')
      
      // Test transporter (console'a email içeriği yazdırır)
      return nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      })
    }

    // Production ortamında gerçek SMTP kullan
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.resend.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // 465 için true, 587 için false
      auth: {
        user: process.env.SMTP_USER || 'resend',
        pass: process.env.SMTP_PASSWORD || process.env.RESEND_API_KEY
      },
      // TLS ayarları
      tls: {
        rejectUnauthorized: false
      }
    })
  }

  /**
   * Send Email (Email Gönder)
   * 
   * Genel email gönderme fonksiyonu.
   * 
   * @param to - Alıcı email adresi
   * @param subject - Email konusu
   * @param html - HTML içerik
   * @param text - Plain text içerik (opsiyonel)
   * 
   * @returns EmailSendResult
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<EmailSendResult> {
    try {
      const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@mivvo.com'
      const fromName = process.env.SMTP_FROM_NAME || 'Mivvo Expertiz'

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      }

      console.log('📧 Email gönderiliyor:', {
        to,
        subject,
        from: `${fromName} <${fromEmail}>`
      })

      // Development ortamında email içeriğini console'a yazdır
      if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
        console.log('📧 EMAIL CONTENT:')
        console.log('To:', to)
        console.log('Subject:', subject)
        console.log('HTML:', html)
        console.log('Text:', text || this.stripHtml(html))
        
        return {
          success: true,
          messageId: 'dev-' + Date.now()
        }
      }

      const info = await this.transporter.sendMail(mailOptions)
      
      console.log('✅ Email başarıyla gönderildi:', info.messageId)
      
      return {
        success: true,
        messageId: info.messageId
      }
    } catch (error) {
      console.error('❌ Email gönderme hatası:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      }
    }
  }

  /**
   * Strip HTML (HTML Temizle)
   * 
   * HTML içeriğinden plain text oluşturur.
   * 
   * @param html - HTML içerik
   * @returns Plain text
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // HTML tag'lerini kaldır
      .replace(/&nbsp;/g, ' ') // &nbsp; karakterlerini boşluk yap
      .replace(/&amp;/g, '&') // &amp; karakterlerini & yap
      .replace(/&lt;/g, '<') // &lt; karakterlerini < yap
      .replace(/&gt;/g, '>') // &gt; karakterlerini > yap
      .replace(/\s+/g, ' ') // Çoklu boşlukları tek boşluk yap
      .trim()
  }

  /**
   * Generate Verification Link (Doğrulama Linki Oluştur)
   * 
   * Email doğrulama linki oluşturur.
   * 
   * @param token - Doğrulama token'ı
   * @returns Doğrulama linki
   */
  private generateVerificationLink(token: string): string {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    return `${frontendUrl}/verify-email?token=${token}`
  }

  /**
   * Generate Reset Link (Sıfırlama Linki Oluştur)
   * 
   * Şifre sıfırlama linki oluşturur.
   * 
   * @param token - Reset token'ı
   * @returns Sıfırlama linki
   */
  private generateResetLink(token: string): string {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    return `${frontendUrl}/reset-password?token=${token}`
  }

  // ===== EMAIL TEMPLATES =====

  /**
   * Get Verification Email Template (Doğrulama Email Template'i)
   * 
   * Email doğrulama için HTML template.
   * 
   * @param data - Template verileri
   * @returns HTML içerik
   */
  private getVerificationEmailTemplate(data: EmailTemplateData): string {
    const { userName, userEmail, verificationLink } = data
    
    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Doğrulama - Mivvo Expertiz</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #3b82f6; }
          .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .content { padding: 30px 0; }
          .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background-color: #2563eb; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚗 Mivvo Expertiz</div>
          </div>
          
          <div class="content">
            <h2>Email Adresinizi Doğrulayın</h2>
            
            <p>Merhaba ${userName || 'Değerli Kullanıcı'},</p>
            
            <p>Mivvo Expertiz'e hoş geldiniz! Hesabınızı aktifleştirmek için email adresinizi doğrulamanız gerekiyor.</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Email Adresimi Doğrula</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Önemli:</strong> Bu link 24 saat geçerlidir. Link çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayın:
              <br><br>
              <code style="background-color: #f3f4f6; padding: 5px; border-radius: 3px; word-break: break-all;">${verificationLink}</code>
            </div>
            
            <p>Email doğrulama işlemi tamamlandıktan sonra tüm özelliklerimize erişebileceksiniz.</p>
            
            <p>Herhangi bir sorunuz varsa, bizimle iletişime geçebilirsiniz.</p>
            
            <p>İyi günler,<br><strong>Mivvo Expertiz Ekibi</strong></p>
          </div>
          
          <div class="footer">
            <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
            <p>© 2024 Mivvo Expertiz. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Get Password Reset Email Template (Şifre Sıfırlama Email Template'i)
   * 
   * Şifre sıfırlama için HTML template.
   * 
   * @param data - Template verileri
   * @returns HTML içerik
   */
  private getPasswordResetEmailTemplate(data: EmailTemplateData): string {
    const { userName, userEmail, resetLink } = data
    
    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Şifre Sıfırlama - Mivvo Expertiz</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #ef4444; }
          .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .content { padding: 30px 0; }
          .button { display: inline-block; background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background-color: #dc2626; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          .warning { background-color: #fef2f2; border: 1px solid #fca5a5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚗 Mivvo Expertiz</div>
          </div>
          
          <div class="content">
            <h2>Şifre Sıfırlama Talebi</h2>
            
            <p>Merhaba ${userName || 'Değerli Kullanıcı'},</p>
            
            <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni şifre belirlemek için aşağıdaki butona tıklayın:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Şifremi Sıfırla</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Güvenlik Uyarısı:</strong> Bu link 1 saat geçerlidir ve sadece bir kez kullanılabilir. Eğer bu talebi siz yapmadıysanız, bu email'i görmezden gelebilirsiniz.
              <br><br>
              <strong>Link çalışmıyorsa:</strong>
              <br>
              <code style="background-color: #f3f4f6; padding: 5px; border-radius: 3px; word-break: break-all;">${resetLink}</code>
            </div>
            
            <p>Herhangi bir sorunuz varsa, bizimle iletişime geçebilirsiniz.</p>
            
            <p>İyi günler,<br><strong>Mivvo Expertiz Ekibi</strong></p>
          </div>
          
          <div class="footer">
            <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
            <p>© 2024 Mivvo Expertiz. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Get Welcome Email Template (Hoşgeldin Email Template'i)
   * 
   * Yeni kullanıcı hoşgeldin email'i için HTML template.
   * 
   * @param data - Template verileri
   * @returns HTML içerik
   */
  private getWelcomeEmailTemplate(data: EmailTemplateData): string {
    const { userName, userEmail } = data
    
    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hoş Geldiniz - Mivvo Expertiz</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #10b981; }
          .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .content { padding: 30px 0; }
          .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background-color: #059669; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          .feature { background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚗 Mivvo Expertiz</div>
          </div>
          
          <div class="content">
            <h2>Hoş Geldiniz! 🎉</h2>
            
            <p>Merhaba ${userName || 'Değerli Kullanıcı'},</p>
            
            <p>Mivvo Expertiz ailesine katıldığınız için çok mutluyuz! Artık yapay zeka destekli araç expertiz hizmetlerimizden faydalanabilirsiniz.</p>
            
            <h3>Neler Yapabilirsiniz?</h3>
            
            <div class="feature">
              <strong>🔍 Araç Expertizi:</strong> Araçlarınızın detaylı analizini yapın
            </div>
            
            <div class="feature">
              <strong>🎨 Boya Analizi:</strong> Araç boyasının durumunu öğrenin
            </div>
            
            <div class="feature">
              <strong>🔧 Hasar Tespiti:</strong> Görünür ve gizli hasarları tespit edin
            </div>
            
            <div class="feature">
              <strong>💰 Değer Tahmini:</strong> Araçınızın piyasa değerini öğrenin
            </div>
            
            <div style="text-align: center;">
              <a href="${data.frontendUrl}/dashboard" class="button">Dashboard'a Git</a>
            </div>
            
            <p>Herhangi bir sorunuz varsa, 7/24 müşteri hizmetlerimizden destek alabilirsiniz.</p>
            
            <p>İyi kullanımlar,<br><strong>Mivvo Expertiz Ekibi</strong></p>
          </div>
          
          <div class="footer">
            <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
            <p>© 2024 Mivvo Expertiz. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // ===== PUBLIC METHODS =====

  /**
   * Send Verification Email (Doğrulama Email'i Gönder)
   * 
   * Email doğrulama linki gönderir.
   * 
   * @param userEmail - Kullanıcı email adresi
   * @param token - Doğrulama token'ı
   * @param userName - Kullanıcı adı (opsiyonel)
   * 
   * @returns EmailSendResult
   * 
   * @example
   * const result = await emailService.sendVerificationEmail('user@example.com', 'token123', 'John Doe')
   */
  async sendVerificationEmail(
    userEmail: string,
    token: string,
    userName?: string
  ): Promise<EmailSendResult> {
    const verificationLink = this.generateVerificationLink(token)
    
    const templateData: EmailTemplateData = {
      userName,
      userEmail,
      verificationLink,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
    }

    const html = this.getVerificationEmailTemplate(templateData)
    
    return this.sendEmail(
      userEmail,
      'Email Adresinizi Doğrulayın - Mivvo Expertiz',
      html
    )
  }

  /**
   * Send Password Reset Email (Şifre Sıfırlama Email'i Gönder)
   * 
   * Şifre sıfırlama linki gönderir.
   * 
   * @param userEmail - Kullanıcı email adresi
   * @param token - Reset token'ı
   * @param userName - Kullanıcı adı (opsiyonel)
   * 
   * @returns EmailSendResult
   * 
   * @example
   * const result = await emailService.sendPasswordResetEmail('user@example.com', 'resetToken123', 'John Doe')
   */
  async sendPasswordResetEmail(
    userEmail: string,
    token: string,
    userName?: string
  ): Promise<EmailSendResult> {
    const resetLink = this.generateResetLink(token)
    
    const templateData: EmailTemplateData = {
      userName,
      userEmail,
      resetLink,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
    }

    const html = this.getPasswordResetEmailTemplate(templateData)
    
    return this.sendEmail(
      userEmail,
      'Şifre Sıfırlama - Mivvo Expertiz',
      html
    )
  }

  /**
   * Send Welcome Email (Hoşgeldin Email'i Gönder)
   * 
   * Yeni kullanıcı hoşgeldin email'i gönderir.
   * 
   * @param userEmail - Kullanıcı email adresi
   * @param userName - Kullanıcı adı (opsiyonel)
   * 
   * @returns EmailSendResult
   * 
   * @example
   * const result = await emailService.sendWelcomeEmail('user@example.com', 'John Doe')
   */
  async sendWelcomeEmail(
    userEmail: string,
    userName?: string
  ): Promise<EmailSendResult> {
    const templateData: EmailTemplateData = {
      userName,
      userEmail,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
    }

    const html = this.getWelcomeEmailTemplate(templateData)
    
    return this.sendEmail(
      userEmail,
      'Hoş Geldiniz! - Mivvo Expertiz',
      html
    )
  }

  /**
   * Send Custom Email (Özel Email Gönder)
   * 
   * Özel içerikli email gönderir.
   * 
   * @param userEmail - Kullanıcı email adresi
   * @param subject - Email konusu
   * @param html - HTML içerik
   * @param text - Plain text içerik (opsiyonel)
   * 
   * @returns EmailSendResult
   * 
   * @example
   * const result = await emailService.sendCustomEmail('user@example.com', 'Özel Mesaj', '<h1>Merhaba</h1>')
   */
  async sendCustomEmail(
    userEmail: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<EmailSendResult> {
    return this.sendEmail(userEmail, subject, html, text)
  }

  /**
   * Test Email Connection (Email Bağlantısını Test Et)
   * 
   * SMTP bağlantısını test eder.
   * 
   * @returns boolean
   * 
   * @example
   * const isConnected = await emailService.testConnection()
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log('✅ Email servisi bağlantısı başarılı')
      return true
    } catch (error) {
      console.error('❌ Email servisi bağlantı hatası:', error)
      return false
    }
  }
}

// ===== SINGLETON INSTANCE =====

/**
 * Singleton Instance
 * 
 * Uygulama genelinde tek bir email service instance kullanılır.
 */
export const emailService = new EmailService()

/**
 * Default Export
 */
export default emailService
