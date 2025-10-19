/**
 * NextAuth.js Type Definitions
 * 
 * NextAuth.js için genişletilmiş tip tanımları.
 * 
 * Bu dosya, NextAuth.js'in varsayılan User ve Session
 * tiplerini genişletir ve custom field'ları ekler.
 */

import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  /**
   * Extended User Interface
   * 
   * NextAuth.js User tipini genişletir.
   */
  interface User extends DefaultUser {
    id: string
    firstName?: string
    lastName?: string
    role?: string
    emailVerified?: boolean
    accessToken?: string
  }

  /**
   * Extended Session Interface
   * 
   * NextAuth.js Session tipini genişletir.
   */
  interface Session extends DefaultSession {
    user: {
      id: string
      firstName?: string
      lastName?: string
      role?: string
      emailVerified?: boolean
    } & DefaultSession['user']
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT Interface
   * 
   * NextAuth.js JWT tipini genişletir.
   */
  interface JWT extends DefaultJWT {
    id: string
    firstName?: string
    lastName?: string
    role?: string
    emailVerified?: boolean
    accessToken?: string
  }
}

/**
 * OAuth Provider Types
 * 
 * Desteklenen OAuth provider'ları.
 */
export type OAuthProvider = 'google' | 'facebook'

/**
 * User Role Types
 * 
 * Kullanıcı rollerini tanımlar.
 */
export type UserRole = 'USER' | 'ADMIN' | 'EXPERT'

/**
 * Authentication Method Types
 * 
 * Desteklenen authentication yöntemlerini tanımlar.
 */
export type AuthMethod = 'credentials' | 'google' | 'facebook'
