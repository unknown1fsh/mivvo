/**
 * UI Constants (UI Sabitleri)
 * 
 * Clean Architecture - Constants Layer (Sabitler Katmanı)
 * 
 * Bu dosya, kullanıcı arayüzü için kullanılan sabitleri içerir.
 * 
 * İçerik:
 * - ANIMATION: Animasyon sabitleri (süre, easing)
 * - BREAKPOINTS: Responsive tasarım breakpoint'leri
 * - COLORS: Renk paleti
 * - SPACING: Boşluk sabitleri
 * 
 * Kullanım:
 * ```typescript
 * import { UI_CONSTANTS } from '@/constants'
 * 
 * const style = {
 *   transition: `all ${UI_CONSTANTS.ANIMATION.DURATION.NORMAL}ms ${UI_CONSTANTS.ANIMATION.EASING.EASE_IN_OUT}`
 * }
 * ```
 */

/**
 * UI Constants Object
 * 
 * Tüm UI sabitlerini kategorilere göre gruplar.
 */
export const UI_CONSTANTS = {
  /**
   * Animation Constants (Animasyon Sabitleri)
   * 
   * Animasyon süresi ve easing fonksiyonları.
   */
  ANIMATION: {
    /**
     * Duration (Süre)
     * 
     * Milisaniye cinsinden animasyon süreleri.
     */
    DURATION: {
      /** Hızlı animasyon (200ms) */
      FAST: 200,
      
      /** Normal animasyon (300ms) */
      NORMAL: 300,
      
      /** Yavaş animasyon (500ms) */
      SLOW: 500
    },
    
    /**
     * Easing (Hızlanma Fonksiyonları)
     * 
     * CSS cubic-bezier easing fonksiyonları.
     */
    EASING: {
      /** Yumuşak başlangıç ve bitiş */
      EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      
      /** Yumuşak bitiş */
      EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
      
      /** Yumuşak başlangıç */
      EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)'
    }
  },
  
  /**
   * Breakpoints (Responsive Kırılım Noktaları)
   * 
   * Tailwind CSS ile uyumlu responsive tasarım breakpoint'leri.
   * 
   * Kullanım:
   * ```css
   * @media (min-width: ${UI_CONSTANTS.BREAKPOINTS.MD}) {
   *   // Tablet ve üzeri için stil
   * }
   * ```
   */
  BREAKPOINTS: {
    /** Small - 640px (Büyük telefon) */
    SM: '640px',
    
    /** Medium - 768px (Tablet) */
    MD: '768px',
    
    /** Large - 1024px (Küçük laptop) */
    LG: '1024px',
    
    /** Extra Large - 1280px (Laptop) */
    XL: '1280px',
    
    /** 2X Extra Large - 1536px (Büyük ekran) */
    '2XL': '1536px'
  },
  
  /**
   * Colors (Renkler)
   * 
   * Ana renk paleti (hex formatında).
   * 
   * Kullanım:
   * ```typescript
   * const buttonColor = UI_CONSTANTS.COLORS.PRIMARY
   * ```
   */
  COLORS: {
    /** Ana renk (Mavi) */
    PRIMARY: '#3B82F6',
    
    /** İkincil renk (Gri) */
    SECONDARY: '#6B7280',
    
    /** Başarı rengi (Yeşil) */
    SUCCESS: '#10B981',
    
    /** Uyarı rengi (Turuncu) */
    WARNING: '#F59E0B',
    
    /** Hata rengi (Kırmızı) */
    ERROR: '#EF4444',
    
    /** Bilgi rengi (Açık Mavi) */
    INFO: '#06B6D4'
  },
  
  /**
   * Spacing (Boşluklar)
   * 
   * Standart boşluk değerleri (rem cinsinden).
   * 
   * Kullanım:
   * ```typescript
   * const padding = UI_CONSTANTS.SPACING.MD // '1rem'
   * ```
   */
  SPACING: {
    /** Extra Small - 0.25rem (4px) */
    XS: '0.25rem',
    
    /** Small - 0.5rem (8px) */
    SM: '0.5rem',
    
    /** Medium - 1rem (16px) */
    MD: '1rem',
    
    /** Large - 1.5rem (24px) */
    LG: '1.5rem',
    
    /** Extra Large - 2rem (32px) */
    XL: '2rem',
    
    /** 2X Extra Large - 3rem (48px) */
    '2XL': '3rem'
  }
}
