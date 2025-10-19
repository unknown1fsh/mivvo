/**
 * NextAuth.js Custom Hook
 * 
 * NextAuth.js için özelleştirilmiş hook'lar.
 * 
 * Özellikler:
 * - Session yönetimi
 * - OAuth ile giriş
 * - Çıkış işlemi
 * - Loading durumları
 * - Error handling
 * 
 * Kullanım:
 * ```typescript
 * import { useNextAuth } from '@/hooks/useNextAuth'
 * 
 * const { session, signIn, signOut, isLoading } = useNextAuth()
 * ```
 */

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { useCallback } from 'react'
import { toast } from 'react-hot-toast'

/**
 * OAuth Provider Types
 */
type OAuthProvider = 'google' | 'facebook'

/**
 * Sign In Options
 */
interface SignInOptions {
  provider?: OAuthProvider
  redirect?: boolean
  callbackUrl?: string
}

/**
 * NextAuth Hook Return Type
 */
interface UseNextAuthReturn {
  session: any
  user: any
  isLoading: boolean
  signIn: (options?: SignInOptions) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  isEmailVerified: boolean
  userRole: string | undefined
}

/**
 * NextAuth Hook
 * 
 * NextAuth.js session yönetimi ve authentication işlemleri.
 * 
 * @returns UseNextAuthReturn
 */
export function useNextAuth(): UseNextAuthReturn {
  const { data: session, status } = useSession()

  /**
   * Sign In Function
   * 
   * Kullanıcı girişi yapar.
   * 
   * @param options - Giriş seçenekleri
   */
  const signIn = useCallback(async (options?: SignInOptions) => {
    try {
      const { provider, redirect = true, callbackUrl } = options || {}

      if (provider) {
        // OAuth ile giriş
        await nextAuthSignIn(provider, {
          redirect,
          callbackUrl: callbackUrl || '/dashboard'
        })
      } else {
        // Credentials ile giriş (login sayfasına yönlendir)
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Giriş yapılırken bir hata oluştu')
    }
  }, [])

  /**
   * Sign Out Function
   * 
   * Kullanıcı çıkışı yapar.
   */
  const signOut = useCallback(async () => {
    try {
      await nextAuthSignOut({
        redirect: true,
        callbackUrl: '/login'
      })
      toast.success('Başarıyla çıkış yaptınız')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Çıkış yapılırken bir hata oluştu')
    }
  }, [])

  return {
    session,
    user: session?.user,
    isLoading: status === 'loading',
    signIn,
    signOut,
    isAuthenticated: !!session?.user,
    isEmailVerified: session?.user?.emailVerified ?? false,
    userRole: session?.user?.role,
  }
}

/**
 * OAuth Sign In Helper
 * 
 * Belirli bir OAuth provider ile giriş yapar.
 * 
 * @param provider - OAuth provider
 * @param callbackUrl - Başarılı giriş sonrası yönlendirilecek URL
 */
export async function signInWithProvider(provider: OAuthProvider, callbackUrl?: string) {
  try {
    await nextAuthSignIn(provider, {
      redirect: true,
      callbackUrl: callbackUrl || '/dashboard'
    })
  } catch (error) {
    console.error(`${provider} sign in error:`, error)
    toast.error(`${provider} ile giriş yapılırken bir hata oluştu`)
  }
}

/**
 * Google Sign In
 * 
 * Google ile giriş yapar.
 * 
 * @param callbackUrl - Başarılı giriş sonrası yönlendirilecek URL
 */
export async function signInWithGoogle(callbackUrl?: string) {
  return signInWithProvider('google', callbackUrl)
}

/**
 * Facebook Sign In
 * 
 * Facebook ile giriş yapar.
 * 
 * @param callbackUrl - Başarılı giriş sonrası yönlendirilecek URL
 */
export async function signInWithFacebook(callbackUrl?: string) {
  return signInWithProvider('facebook', callbackUrl)
}

/**
 * Default Export
 */
export default useNextAuth
