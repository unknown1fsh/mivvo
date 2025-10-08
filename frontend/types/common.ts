/**
 * Common Types (Ortak Tipler)
 * 
 * Clean Architecture - Type Layer (Tip Katmanı)
 * 
 * Bu dosya, uygulama genelinde kullanılan ortak TypeScript tiplerini tanımlar.
 * 
 * İçerik:
 * - Step (Form adımları için)
 * - ApiResponse (API yanıtları için)
 * - LoadingState (Yükleme durumu için)
 * - FormField (Form alanları için)
 * 
 * Kullanım:
 * ```typescript
 * import { Step, ApiResponse, LoadingState } from '@/types'
 * 
 * const steps: Step[] = [...]
 * const response: ApiResponse<User> = await api.get('/users/me')
 * const [state, setState] = useState<LoadingState>({ isLoading: false })
 * ```
 */

// ===== STEP INTERFACE =====

/**
 * Step (Adım)
 * 
 * Form wizard veya multi-step işlemler için adım tanımı.
 * 
 * Kullanım Alanları:
 * - Araç ekspertiz formu (3 adım)
 * - Kayıt süreci
 * - Ödeme süreci
 */
export interface Step {
  /** Adım numarası (1, 2, 3, ...) */
  id: number
  
  /** Adım adı (örn: "Araç Bilgileri") */
  name: string
  
  /** Adım açıklaması */
  description: string
}

// ===== API RESPONSE INTERFACE =====

/**
 * API Response (API Yanıtı)
 * 
 * Standart API yanıt formatı.
 * 
 * Generic type: T = response data'nın tipi
 * 
 * Örnekler:
 * ```typescript
 * ApiResponse<User>
 * ApiResponse<Vehicle[]>
 * ApiResponse<{ token: string }>
 * ```
 */
export interface ApiResponse<T = any> {
  /** İşlem başarılı mı? */
  success: boolean
  
  /** Başarı/bilgi mesajı */
  message: string
  
  /** Response data (başarılı ise) */
  data?: T
  
  /** Hata mesajı (başarısız ise) */
  error?: string
}

// ===== LOADING STATE INTERFACE =====

/**
 * Loading State (Yükleme Durumu)
 * 
 * Component'lerde loading ve error durumunu yönetmek için.
 * 
 * Kullanım:
 * ```typescript
 * const [state, setState] = useState<LoadingState>({
 *   isLoading: false
 * })
 * 
 * setState({ isLoading: true })
 * // ... API call
 * setState({ isLoading: false, error: 'Hata oluştu' })
 * ```
 */
export interface LoadingState {
  /** Yükleniyor mu? */
  isLoading: boolean
  
  /** Hata mesajı (varsa) */
  error?: string
}

// ===== FORM FIELD INTERFACE =====

/**
 * Form Field (Form Alanı)
 * 
 * Dinamik form oluşturma için alan tanımı.
 * 
 * Kullanım:
 * ```typescript
 * const fields: FormField[] = [
 *   {
 *     name: 'email',
 *     label: 'Email',
 *     type: 'email',
 *     required: true,
 *     placeholder: 'ornek@email.com',
 *     validation: {
 *       pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
 *       message: 'Geçerli bir email girin'
 *     }
 *   }
 * ]
 * ```
 */
export interface FormField {
  /** Alan adı (form key) */
  name: string
  
  /** Alan etiketi (görünen metin) */
  label: string
  
  /** Alan tipi */
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea'
  
  /** Zorunlu mu? */
  required?: boolean
  
  /** Placeholder metni */
  placeholder?: string
  
  /** Select için seçenekler */
  options?: { value: string; label: string }[]
  
  /** Validasyon kuralları */
  validation?: {
    /** Minimum değer/uzunluk */
    min?: number
    
    /** Maximum değer/uzunluk */
    max?: number
    
    /** Regex pattern */
    pattern?: RegExp
    
    /** Hata mesajı */
    message?: string
  }
}
