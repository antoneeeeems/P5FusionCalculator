import type { Metadata } from 'next'
import './globals.css'
import '../style.css'
import { DataLoader } from '@/lib/data-loader'

export const metadata: Metadata = {
  title: 'Persona 5 Fusion Calculator',
  description: 'A tool to help calculate fusions in Persona 5',
  appleWebApp: {
    capable: true,
    title: 'Persona 5 Fusion Calculator',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/img/favicon/192x192.png', sizes: '192x192' }
    ],
    apple: '/img/favicon/192x192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <DataLoader>
          {children}
        </DataLoader>
      </body>
    </html>
  )
}
