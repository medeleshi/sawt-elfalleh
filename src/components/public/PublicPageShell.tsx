// src/components/public/PublicPageShell.tsx
/**
 * Shared layout wrapper for public info pages (about, terms, privacy, etc.)
 * Provides consistent hero header + content container.
 */

interface Props {
  eyebrow?: string
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function PublicPageShell({ eyebrow, title, subtitle, children }: Props) {
  return (
    <div className="public-page" dir="rtl">
      {/* Page hero */}
      <div className="public-page__hero">
        <div className="public-page__hero-inner">
          {eyebrow && <span className="public-page__eyebrow">{eyebrow}</span>}
          <h1 className="public-page__title">{title}</h1>
          {subtitle && <p className="public-page__subtitle">{subtitle}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="public-page__body">
        <div className="public-page__content">{children}</div>
      </div>
    </div>
  )
}
