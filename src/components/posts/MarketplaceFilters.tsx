// src/components/posts/MarketplaceFilters.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import type { Category, Region, Unit } from '@/types/marketplace';

interface Props {
  categories: Category[];
  regions: Region[];
  units: Unit[];
}

export default function MarketplaceFilters({ categories, regions, units }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Only top-level categories (no parent)
  const topCategories = categories.filter((c) => !c.parent_id);

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // Reset to page 1 on any filter change
      params.delete('page');
      return params.toString();
    },
    [searchParams]
  );

  const handleChange = (key: string, value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ [key]: value })}`);
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const get = (key: string) => searchParams.get(key) ?? '';

  const hasActiveFilters =
    get('type') || get('category_id') || get('region_id') || get('unit_id') ||
    get('price_min') || get('price_max') || get('is_negotiable') || get('query');

  return (
    <aside className={`filters-panel ${isPending ? 'filters-panel--loading' : ''}`} dir="rtl">
      <div className="filters-panel__header">
        <h2 className="filters-panel__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          الفلترة
        </h2>
        {hasActiveFilters && (
          <button onClick={handleReset} className="filters-panel__reset">
            مسح الكل
          </button>
        )}
      </div>

      {/* Post Type */}
      <div className="filter-group">
        <label className="filter-group__label">نوع الإعلان</label>
        <div className="filter-type-buttons">
          {[
            { value: '', label: 'الكل' },
            { value: 'sell', label: 'بيع' },
            { value: 'buy', label: 'شراء' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleChange('type', opt.value)}
              className={`filter-type-btn ${get('type') === opt.value ? 'filter-type-btn--active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="filter-group">
        <label className="filter-group__label" htmlFor="filter-category">
          الصنف
        </label>
        <select
          id="filter-category"
          className="filter-select"
          value={get('category_id')}
          onChange={(e) => handleChange('category_id', e.target.value)}
        >
          <option value="">جميع الأصناف</option>
          {topCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name_ar}
            </option>
          ))}
        </select>
      </div>

      {/* Region */}
      <div className="filter-group">
        <label className="filter-group__label" htmlFor="filter-region">
          الولاية
        </label>
        <select
          id="filter-region"
          className="filter-select"
          value={get('region_id')}
          onChange={(e) => handleChange('region_id', e.target.value)}
        >
          <option value="">جميع الولايات</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name_ar}
            </option>
          ))}
        </select>
      </div>

      {/* Unit */}
      <div className="filter-group">
        <label className="filter-group__label" htmlFor="filter-unit">
          المقياس
        </label>
        <select
          id="filter-unit"
          className="filter-select"
          value={get('unit_id')}
          onChange={(e) => handleChange('unit_id', e.target.value)}
        >
          <option value="">جميع المقاييس</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name_ar} ({u.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <label className="filter-group__label">نطاق السعر (د.ت)</label>
        <div className="filter-price-range">
          <input
            type="number"
            placeholder="الأدنى"
            className="filter-input"
            min="0"
            value={get('price_min')}
            onChange={(e) => handleChange('price_min', e.target.value)}
          />
          <span className="filter-price-sep">—</span>
          <input
            type="number"
            placeholder="الأقصى"
            className="filter-input"
            min="0"
            value={get('price_max')}
            onChange={(e) => handleChange('price_max', e.target.value)}
          />
        </div>
      </div>

      {/* Negotiable */}
      <div className="filter-group">
        <label className="filter-toggle">
          <input
            type="checkbox"
            className="filter-toggle__input"
            checked={get('is_negotiable') === 'true'}
            onChange={(e) =>
              handleChange('is_negotiable', e.target.checked ? 'true' : '')
            }
          />
          <span className="filter-toggle__track" />
          <span className="filter-toggle__label">قابل للتفاوض فقط</span>
        </label>
      </div>
    </aside>
  );
}
