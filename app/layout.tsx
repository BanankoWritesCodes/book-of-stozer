import type { Metadata } from 'next'
import { Cinzel } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({ 
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel'
})

export const metadata: Metadata = {
  title: 'Book of Stožer - Parodija',
  description: 'Satirična parodija slot igre - samo za zabavu, bez pravog novca!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hr">
      <body className={cinzel.variable}>{children}</body>
    </html>
  )
}
