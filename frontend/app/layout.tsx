import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Mivvo Expertiz - Yapay Zeka Destekli Araç Analizi',
  description: 'Yapay zeka teknolojisi ile araç expertizi, boya analizi ve hasar değerlendirmesi yapın. Profesyonel raporlar, hızlı sonuçlar.',
  keywords: 'expertiz, araç analizi, yapay zeka, boya analizi, hasar tespiti',
  authors: [{ name: 'Mivvo Team' }],
  creator: 'Mivvo Expertiz',
  publisher: 'Mivvo',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://mivvo.com',
    title: 'Mivvo Expertiz - Yapay Zeka Destekli Araç Analizi',
    description: 'Yapay zeka teknolojisi ile araç expertizi, boya analizi ve hasar değerlendirmesi yapın.',
    siteName: 'Mivvo Expertiz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mivvo Expertiz - Yapay Zeka Destekli Araç Analizi',
    description: 'Yapay zeka teknolojisi ile araç expertizi, boya analizi ve hasar değerlendirmesi yapın.',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3B82F6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-inter antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}
