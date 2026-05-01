// src/app/(public)/layout.tsx
import Link from 'next/link'
import { Sprout } from 'lucide-react'

/**
 * Public layout — used for landing, about, contact, etc.
 * Separate from the app layout (no app Navbar).
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      {/* ── Public Navbar ── */}
      <header className="public-header">
        <div className="public-header__inner">
          <Link href="/landing" className="public-header__brand">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="public-header__name">صوت الفلاح</span>
          </Link>

          <nav className="public-header__nav">
            <Link href="/how-it-works" className="public-header__link">كيف يعمل؟</Link>
            <Link href="/about" className="public-header__link">من نحن</Link>
            <Link href="/contact" className="public-header__link">اتصل بنا</Link>
          </nav>

          <div className="public-header__actions">
            <Link href="/login" className="public-header__login">تسجيل الدخول</Link>
            <Link href="/register" className="public-header__register">انضم الآن</Link>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">{children}</main>

      {/* ── Public Footer ── */}
      <footer className="public-footer">
        <div className="public-footer__inner">
          <div className="public-footer__brand">
            <Sprout className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">صوت الفلاح</span>
            <span className="text-muted-foreground">— السوق الفلاحي التونسي</span>
          </div>

          <nav className="public-footer__links">
            <Link href="/about">من نحن</Link>
            <Link href="/how-it-works">كيف يعمل؟</Link>
            <Link href="/privacy-policy">سياسة الخصوصية</Link>
            <Link href="/terms">شروط الاستخدام</Link>
            <Link href="/contact">اتصل بنا</Link>
          </nav>

          <p className="public-footer__copy">
            © {new Date().getFullYear()} جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  )
}
