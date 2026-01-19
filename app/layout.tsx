import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
