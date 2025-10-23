/**
 * NextAuth.js API Route
 * 
 * NextAuth.js authentication yapılandırması.
 * 
 * Özellikler:
 * - Google OAuth provider
 * - Facebook OAuth provider  
 * - Credentials provider (mevcut email/password sistemi)
 * - JWT token yönetimi
 * - Session callback'leri
 * - Backend API ile entegrasyon
 * 
 * OAuth Provider'lar:
 * - Google: Google Cloud Console OAuth 2.0
 * - Facebook: Facebook Developers App
 * 
 * Environment Variables:
 * - NEXTAUTH_URL: Frontend URL
 * - NEXTAUTH_SECRET: NextAuth secret key
 * - GOOGLE_CLIENT_ID: Google OAuth client ID
 * - GOOGLE_CLIENT_SECRET: Google OAuth client secret
 * - FACEBOOK_CLIENT_ID: Facebook app ID
 * - FACEBOOK_CLIENT_SECRET: Facebook app secret
 */

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NextAuthOptions } from 'next-auth'

/**
 * NextAuth Options Configuration
 */
const authOptions: NextAuthOptions = {
  providers: [
    /**
     * Google OAuth Provider
     */
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile'
        }
      }
    }),

    /**
     * Facebook OAuth Provider
     */
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'email'
        }
      }
    }),

    /**
     * Credentials Provider (Email/Password)
     * 
     * Mevcut backend API ile entegre edilmiş.
     */
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Backend API'ye login isteği gönder
          const backendUrl = process.env.BACKEND_URL || 'https://mivvo-backend-production.up.railway.app'
          const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data = await response.json()

          if (response.ok && data.success && data.data) {
            // Backend'den gelen user ve token bilgilerini döndür
            return {
              id: data.data.user.id.toString(),
              email: data.data.user.email,
              name: `${data.data.user.firstName} ${data.data.user.lastName}`,
              image: null,
              // Custom fields
              firstName: data.data.user.firstName,
              lastName: data.data.user.lastName,
              role: data.data.user.role,
              emailVerified: data.data.user.emailVerified,
              accessToken: data.data.token,
            }
          }

          return null
        } catch (error) {
          console.error('Credentials authorization error:', error)
          return null
        }
      }
    })
  ],

  /**
   * Session Configuration
   */
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 gün
  },

  /**
   * JWT Configuration
   */
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 gün
  },

  /**
   * Callbacks
   */
  callbacks: {
    /**
     * JWT Callback
     * 
     * JWT token oluşturulurken çalışır.
     */
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.role = user.role
        token.emailVerified = Boolean(user.emailVerified)
      }

      // OAuth sign in
      if (account && (account.provider === 'google' || account.provider === 'facebook')) {
        try {
          // Backend'e OAuth kullanıcısı gönder
          const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/oauth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              provider: account.provider,
              providerId: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              accessToken: account.access_token,
            }),
          })

          const data = await response.json()

          if (response.ok && data.success && data.data) {
            token.accessToken = data.data.token
            token.firstName = data.data.user.firstName
            token.lastName = data.data.user.lastName
            token.role = data.data.user.role
            token.emailVerified = Boolean(data.data.user.emailVerified)
            token.id = data.data.user.id.toString()
          }
        } catch (error) {
          console.error('OAuth backend integration error:', error)
        }
      }

      return token
    },

    /**
     * Session Callback
     * 
     * Session oluşturulurken çalışır.
     */
    async session({ session, token }) {
      // Token'dan session'a veri aktar
      if (token) {
        session.user.id = token.id as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.role = token.role as string
        session.user.emailVerified = token.emailVerified as boolean
        session.accessToken = token.accessToken as string
      }

      return session
    },

    /**
     * Sign In Callback
     * 
     * Kullanıcı giriş yaparken çalışır.
     */
    async signIn({ user, account, profile }) {
      // OAuth provider'lar için profil bilgilerini kontrol et
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        if (!user.email || !user.name) {
          return false
        }
      }

      return true
    },

    /**
     * Redirect Callback
     * 
     * Giriş sonrası yönlendirme.
     */
    async redirect({ url, baseUrl }) {
      // Relative URL ise base URL ile birleştir
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // Same origin ise direkt döndür
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      // Default olarak dashboard'a yönlendir
      return `${baseUrl}/dashboard`
    }
  },

  /**
   * Pages Configuration
   */
  pages: {
    signIn: '/login',
    error: '/login', // OAuth hatalarında login sayfasına yönlendir
  },

  /**
   * Events
   */
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', {
        email: user.email,
        provider: account?.provider,
        isNewUser
      })
    },
    async signOut({ token, session }) {
      console.log('User signed out:', {
        email: session?.user?.email
      })
    }
  },

  /**
   * Debug Configuration
   */
  debug: process.env.NODE_ENV === 'development',

  /**
   * Secret
   */
  secret: process.env.NEXTAUTH_SECRET,
}

/**
 * NextAuth Handler
 */
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
