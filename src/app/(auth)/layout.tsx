import type { Metadata } from 'next'
import { APP_NAME } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: {
    default: 'تسجيل الدخول',
    template: `%s | ${APP_NAME}`,
  },
}

/**
 * Auth layout — wraps all (auth) pages.
 * Provides a full-screen centered container with a subtle agricultural background.
 * Individual auth pages render their own cards inside this shell.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-earth-50 px-4 py-12">
      {/* Decorative background pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-earth-100/40 blur-3xl" />
      </div>

      {/* Auth card container */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>

      {/* Footer links */}
      <footer className="relative z-10 mt-8 text-center text-xs text-muted-foreground">
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <a href="/privacy-policy" className="hover:text-foreground transition-colors">
            سياسة الخصوصية
          </a>
          <a href="/terms" className="hover:text-foreground transition-colors">
            شروط الاستخدام
          </a>
          <a href="/about" className="hover:text-foreground transition-colors">
            من نحن
          </a>
          <a href="/contact" className="hover:text-foreground transition-colors">
            اتصل بنا
          </a>
        </nav>
        <p className="mt-3 text-[11px] opacity-60">
          © {new Date().getFullYear()} صوت الفلاح — جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  )
}
