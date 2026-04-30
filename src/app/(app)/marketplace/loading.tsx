// src/app/(app)/marketplace/loading.tsx

export default function MarketplaceLoading() {
  return (
    <div className="marketplace-page" dir="rtl">
      {/* Header skeleton */}
      <div className="marketplace-header">
        <div className="marketplace-header__content">
          <div className="skeleton skeleton--h2" />
          <div className="skeleton skeleton--text" style={{ width: '140px' }} />
        </div>
        <div className="skeleton skeleton--btn" />
      </div>

      {/* Search skeleton */}
      <div className="marketplace-search-row">
        <div className="skeleton skeleton--search" />
      </div>

      <div className="marketplace-layout">
        {/* Sidebar skeleton */}
        <div className="marketplace-sidebar">
          <div className="filters-panel">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="filter-group">
                <div className="skeleton skeleton--label" />
                <div className="skeleton skeleton--input" />
              </div>
            ))}
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="marketplace-main">
          <div className="posts-grid">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="post-card post-card--skeleton">
                <div className="post-card__image-wrap skeleton" />
                <div className="post-card__body">
                  <div className="skeleton skeleton--text" style={{ width: '60%' }} />
                  <div className="skeleton skeleton--text skeleton--title" />
                  <div className="skeleton skeleton--text" style={{ width: '40%' }} />
                  <div className="skeleton skeleton--text skeleton--price" />
                  <div className="skeleton skeleton--text" style={{ width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
