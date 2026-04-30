import { Sprout } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AuthCardProps {
  title: string
  subtitle: string
  children: React.ReactNode
  className?: string
}

/**
 * Shared auth card shell.
 * Renders: logo → motivational subtitle → title → children (form content).
 * Used on: login, register, forgot-password, reset-password, reset-success.
 */
export default function AuthCard({
  title,
  subtitle,
  children,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        'w-full rounded-2xl border border-border bg-white px-6 py-8 shadow-sm sm:px-8',
        className
      )}
    >
      {/* Logo + brand */}
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-md">
          <Sprout className="h-7 w-7 text-white" strokeWidth={1.75} />
        </div>
        <span className="text-lg font-bold tracking-tight text-brand-800">
          صوت الفلاح
        </span>
        {/* Motivational subtitle */}
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          {subtitle}
        </p>
      </div>

      {/* Page title */}
      <h1 className="mb-6 text-center text-xl font-bold text-foreground">
        {title}
      </h1>

      {/* Form content */}
      {children}
    </div>
  )
}
