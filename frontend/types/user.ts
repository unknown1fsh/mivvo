/**
 * User Types (Kullanıcı Tipleri)
 * 
 * Clean Architecture - Type Layer (Tip Katmanı)
 * 
 * Bu dosya, kullanıcı ile ilgili tüm TypeScript tiplerini tanımlar.
 * 
 * İçerik:
 * - User (Kullanıcı bilgileri)
 * - LoginCredentials (Giriş bilgileri)
 * - RegisterData (Kayıt bilgileri)
 * - UserSettings (Kullanıcı ayarları)
 * - UserProfile (Kullanıcı profili)
 * 
 * Kullanım:
 * ```typescript
 * import { User, LoginCredentials, RegisterData } from '@/types'
 * 
 * const user: User = await authService.getCurrentUser()
 * const credentials: LoginCredentials = { email, password }
 * ```
 */

// ===== USER INTERFACE =====

/**
 * User (Kullanıcı)
 * 
 * Ana kullanıcı bilgileri.
 * 
 * Backend'den dönen user objesi ile eşleşir.
 */
export interface User {
  /** Kullanıcı ID */
  id: string
  
  /** Email adresi */
  email: string
  
  /** Ad Soyad */
  name: string
  
  /** Kullanıcı rolü */
  role: 'USER' | 'ADMIN' | 'EXPERT'
  
  /** Profil fotoğrafı URL */
  avatar?: string
  
  /** Kredi bakiyesi */
  credits: number
  
  /** Oluşturulma tarihi */
  createdAt: Date
  
  /** Güncellenme tarihi */
  updatedAt: Date
}

// ===== LOGIN CREDENTIALS INTERFACE =====

/**
 * Login Credentials (Giriş Bilgileri)
 * 
 * Kullanıcı girişi için gerekli bilgiler.
 * 
 * Kullanım:
 * ```typescript
 * const credentials: LoginCredentials = {
 *   email: 'user@example.com',
 *   password: '123456'
 * }
 * await authService.login(credentials)
 * ```
 */
export interface LoginCredentials {
  /** Email adresi */
  email: string
  
  /** Şifre */
  password: string
}

// ===== REGISTER DATA INTERFACE =====

/**
 * Register Data (Kayıt Bilgileri)
 * 
 * Yeni kullanıcı kaydı için gerekli bilgiler.
 * 
 * Kullanım:
 * ```typescript
 * const registerData: RegisterData = {
 *   email: 'newuser@example.com',
 *   password: '123456',
 *   name: 'John Doe',
 *   phone: '+905551234567'
 * }
 * await authService.register(registerData)
 * ```
 */
export interface RegisterData {
  /** Email adresi */
  email: string
  
  /** Şifre */
  password: string
  
  /** Ad Soyad */
  name: string
  
  /** Telefon numarası (opsiyonel) */
  phone?: string
}

// ===== USER SETTINGS INTERFACE =====

/**
 * User Settings (Kullanıcı Ayarları)
 * 
 * Kullanıcının uygulama ayarları.
 * 
 * 3 ana kategori:
 * - Bildirimler (Email, SMS, Push)
 * - Gizlilik (Profil görünürlüğü, bilgi paylaşımı)
 * - Tercihler (Dil, saat dilimi, para birimi)
 */
export interface UserSettings {
  /** Bildirim ayarları */
  notifications: {
    /** Email bildirimleri */
    email: boolean
    
    /** SMS bildirimleri */
    sms: boolean
    
    /** Push bildirimleri */
    push: boolean
  }
  
  /** Gizlilik ayarları */
  privacy: {
    /** Profil görünürlüğü */
    profileVisibility: 'public' | 'private' | 'friends'
    
    /** Email'i göster */
    showEmail: boolean
    
    /** Telefonu göster */
    showPhone: boolean
  }
  
  /** Tercih ayarları */
  preferences: {
    /** Dil (örn: 'tr', 'en') */
    language: string
    
    /** Saat dilimi (örn: 'Europe/Istanbul') */
    timezone: string
    
    /** Para birimi (örn: 'TRY', 'USD') */
    currency: string
  }
}

// ===== USER PROFILE INTERFACE =====

/**
 * User Profile (Kullanıcı Profili)
 * 
 * Detaylı kullanıcı profil bilgileri.
 * 
 * User interface'inden farklı olarak:
 * - Daha fazla kişisel bilgi
 * - Adres bilgisi
 * - Tercihler
 */
export interface UserProfile {
  /** Kullanıcı ID */
  id: string
  
  /** Email adresi */
  email: string
  
  /** Ad Soyad */
  name: string
  
  /** Telefon numarası */
  phone?: string
  
  /** Adres */
  address?: string
  
  /** Profil fotoğrafı URL */
  avatar?: string
  
  /** Kullanıcı tercihleri */
  preferences: {
    /** Bildirimler aktif mi? */
    notifications: boolean
    
    /** Email güncellemeleri */
    emailUpdates: boolean
    
    /** SMS güncellemeleri */
    smsUpdates: boolean
  }
}
