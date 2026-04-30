import type { Metadata } from 'next'
import { APP_NAME } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: {
    default: 'إكمال الملف الشخصي',
    template: `%s | ${APP_NAME}`,
  },
}

/**
 * Onboarding layout — wraps all /onboarding/* pages.
 * Clean, distraction-free environment to guide the user through setup.
 * No navbar — user must complete onboarding before accessing the app.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-brand-50 to-white">
      {/* Top brand bar */}
      <header className="flex h-16 items-center justify-center border-b border-brand-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="صوت الفلاح">
            🌾
          </span>
          <span className="text-lg font-semibold text-brand-700">
            صوت الفلاح
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-start px-4 py-10">
        <div className="w-full max-w-xl">
          {children}
        </div>
      </main>
    </div>
  )
}
