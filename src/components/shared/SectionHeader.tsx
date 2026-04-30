import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SectionHeaderProps {
  title: string
  viewMoreHref?: string
  viewMoreLabel?: string
  className?: string
}

export default function SectionHeader({
  title,
  viewMoreHref,
  viewMoreLabel = 'عرض المزيد',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <h2 className="text-base font-bold text-foreground sm:text-lg">
        {title}
      </h2>
      {viewMoreHref && (
        <Link
          href={viewMoreHref}
          className="flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          {viewMoreLabel}
          {/* ChevronLeft because RTL — points "forward" (left = next) */}
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
