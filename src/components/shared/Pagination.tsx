// src/components/shared/Pagination.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useCallback } from 'react';
import type { PaginationInfo } from '@/types/marketplace';

interface Props {
  pagination: PaginationInfo;
}

export default function Pagination({ pagination }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const { page, totalPages, total, limit } = pagination;

  const goToPage = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (p === 1) params.delete('page');
      else params.set('page', String(p));
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Build page numbers window
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    const lo = Math.max(2, page - 1);
    const hi = Math.min(totalPages - 1, page + 1);
    for (let i = lo; i <= hi; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className={`pagination ${isPending ? 'pagination--loading' : ''}`} dir="rtl">
      <span className="pagination__info">
        {start}–{end} من {total} نتيجة
      </span>

      <div className="pagination__controls">
        {/* Prev */}
        <button
          className="pagination__btn pagination__btn--nav"
          disabled={page === 1 || isPending}
          onClick={() => goToPage(page - 1)}
          aria-label="الصفحة السابقة"
        >
          ›
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="pagination__ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`pagination__btn ${p === page ? 'pagination__btn--active' : ''}`}
              onClick={() => goToPage(p as number)}
              disabled={isPending}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          className="pagination__btn pagination__btn--nav"
          disabled={page === totalPages || isPending}
          onClick={() => goToPage(page + 1)}
          aria-label="الصفحة التالية"
        >
          ‹
        </button>
      </div>
    </div>
  );
}
