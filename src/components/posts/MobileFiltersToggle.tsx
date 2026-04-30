// src/components/posts/MobileFiltersToggle.tsx
'use client';

import { useState } from 'react';
import type { Category, Region, Unit } from '@/types/marketplace';
import MarketplaceFilters from './MarketplaceFilters';

interface Props {
  categories: Category[];
  regions: Region[];
  units: Unit[];
  activeCount: number;
}

export default function MobileFiltersToggle({ categories, regions, units, activeCount }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle button — visible on mobile only */}
      <button
        className="mobile-filters-toggle"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="فتح الفلاتر"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        الفلاتر
        {activeCount > 0 && (
          <span className="mobile-filters-toggle__badge">{activeCount}</span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div className="mobile-filters-overlay" onClick={() => setOpen(false)} />
      )}

      {/* Drawer */}
      <div className={`mobile-filters-drawer ${open ? 'mobile-filters-drawer--open' : ''}`}>
        <div className="mobile-filters-drawer__header">
          <h3>الفلاتر</h3>
          <button onClick={() => setOpen(false)} aria-label="إغلاق">✕</button>
        </div>
        <div className="mobile-filters-drawer__body">
          <MarketplaceFilters categories={categories} regions={regions} units={units} />
        </div>
        <div className="mobile-filters-drawer__footer">
          <button className="btn-primary" onClick={() => setOpen(false)}>
            تطبيق الفلاتر
          </button>
        </div>
      </div>
    </>
  );
}
