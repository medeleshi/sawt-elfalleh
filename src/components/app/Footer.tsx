import Link from 'next/link'
import { Sprout } from 'lucide-react'

/**
 * App footer — used in (app) layout.
 */
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-white">
      <div className="container flex flex-col items-center gap-4 py-8 md:flex-row md:justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sprout className="h-4 w-4 text-brand-500" />
          <span className="font-medium text-foreground">صوت الفلاح</span>
          <span>— السوق الفلاحي التونسي</span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <Link href="/about" className="hover:text-foreground transition-colors">
            من نحن
          </Link>
          <Link href="/how-it-works" className="hover:text-foreground transition-colors">
            كيف يعمل؟
          </Link>
          <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
            سياسة الخصوصية
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            شروط الاستخدام
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            اتصل بنا
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground">
          © {year} جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  )
}
