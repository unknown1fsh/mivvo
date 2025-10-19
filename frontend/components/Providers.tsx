/**
 * Providers Component (Client Component)
 * 
 * Bu komponent, NextAuth.js SessionProvider'ını Client Component olarak sarar.
 * Next.js 13+ App Router'da Server Component'lerde React Context kullanılamaz.
 */

'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}

export default Providers
