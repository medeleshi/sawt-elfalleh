// src/components/posts/MarketplaceSearchBar.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useTransition, useRef, useEffect, useState } from 'react';

interface Props {
  sortOptions?: boolean;
}

export default function MarketplaceSearchBar({ sortOptions = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState(searchParams.get('query') ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local query if searchParams change externally
  useEffect(() => {
    setLocalQuery(searchParams.get('query') ?? '');
  }, [searchParams]);

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.delete('page');
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (value: string) => {
    setLocalQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        router.push(`${pathname}?${createQueryString({ query: value })}`);
      });
    }, 400);
  };

  const handleSort = (sort: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ sort })}`);
    });
  };

  const currentSort = searchParams.get('sort') ?? 'newest';

  return (
    <div className="search-bar-wrap" dir="rtl">
      {/* Search Input */}
      <div className="search-input-wrap">
        <svg
          className="search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="ابحث عن منتج..."
          className={`search-input ${isPending ? 'search-input--loading' : ''}`}
          value={localQuery}
          onChange={(e) => handleSearch(e.target.value)}
          dir="rtl"
        />
        {localQuery && (
          <button
            className="search-clear"
            onClick={() => handleSearch('')}
            aria-label="مسح البحث"
          >
            ✕
          </button>
        )}
      </div>

      {/* Sort */}
      {sortOptions && (
        <div className="sort-wrap">
          <span className="sort-label">ترتيب:</span>
          <div className="sort-buttons">
            {[
              { value: 'newest', label: 'الأحدث' },
              { value: 'price_low', label: 'السعر ↑' },
              { value: 'price_high', label: 'السعر ↓' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSort(opt.value)}
                className={`sort-btn ${currentSort === opt.value ? 'sort-btn--active' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
