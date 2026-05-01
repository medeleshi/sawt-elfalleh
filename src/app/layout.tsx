// src/app/layout.tsx
import type { Metadata } from 'next'
import '@/styles/globals.css'
import { APP_NAME, APP_DESCRIPTION, APP_URL } from '@/lib/utils/constants'
import { Toaster } from '@/components/shared/Toast'

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    locale: 'ar_TN',
    siteName: APP_NAME,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        {/* Global toast notifications — renders fixed overlay, zero layout impact */}
        <Toaster />
      </body>
    </html>
  )
}
