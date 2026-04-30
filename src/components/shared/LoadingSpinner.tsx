import { cn } from '@/lib/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizes = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
}

export default function LoadingSpinner({
  size = 'md',
  className,
  label = 'جاري التحميل...',
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('flex items-center justify-center', className)}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-brand-200 border-t-brand-600',
          sizes[size]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
