import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google' // Need to ensure Geist exists or use next/font/local
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// Mocking Geist since it might not be in next/font/google directly, or we can use another clean sans-serif like Roboto for now
// Actually next/font/local would be better, but for MVP we will use inter for both if Geist fails, or just assume it works
// Next 15 has experimental local fonts, we will just use Inter for body and assume Geist is a local font or similar.
// Let's use a standard sans font as placeholder for Geist to avoid breaking the build if it's missing.

export const metadata: Metadata = {
  title: 'VISTA',
  description: 'Visual Intelligence for Spatial Toxicity Assessment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-body bg-atmospheric-green text-white`}>
        {children}
      </body>
    </html>
  )
}
