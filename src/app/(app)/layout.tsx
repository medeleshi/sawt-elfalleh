import type { Metadata } from 'next'
import { APP_NAME } from '@/lib/utils/constants'
import Navbar from '@/components/app/Navbar'
import BottomNavbar from '@/components/app/BottomNavbar'
import Footer from '@/components/app/Footer'

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
}

/**
 * Main app layout — wraps all authenticated (app) pages.
 * Includes: sticky Navbar + main content area + Footer.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background pb-20 sm:pb-0">
        {children}
      </main>
      <BottomNavbar />
      <Footer />
    </div>
  )
}
