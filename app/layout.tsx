import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GolfGives — Play. Win. Give.',
  description: 'A subscription golf platform where every score entered supports a charity you love. Monthly draws, real prizes, meaningful impact.',
  openGraph: {
    title: 'GolfGives — Play. Win. Give.',
    description: 'Monthly golf draw platform with real prizes and charitable giving.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
