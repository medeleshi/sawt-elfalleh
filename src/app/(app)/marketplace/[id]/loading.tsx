// src/app/(app)/marketplace/[id]/loading.tsx

export default function PostDetailsLoading() {
  return (
    <div className="post-details-page">
      {/* Breadcrumb skeleton */}
      <div className="post-details__breadcrumb">
        <div className="skeleton skeleton--text" style={{ width: '220px', height: '13px' }} />
      </div>

      <div className="post-details__layout">
        {/* Left: image slider skeleton */}
        <div className="post-details__left">
          <div className="post-slider">
            <div className="post-slider__main skeleton" style={{ borderRadius: 'var(--radius-lg)' }} />
          </div>
        </div>

        {/* Right: info skeleton */}
        <div className="post-details__right">
          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div className="skeleton skeleton--text" style={{ width: '56px', height: '24px', borderRadius: '100px' }} />
            <div className="skeleton skeleton--text" style={{ width: '80px', height: '24px', borderRadius: '100px' }} />
          </div>

          {/* Title */}
          <div className="skeleton skeleton--text" style={{ width: '85%', height: '30px', marginBottom: '8px' }} />
          <div className="skeleton skeleton--text" style={{ width: '55%', height: '30px', marginBottom: '20px' }} />

          {/* Price */}
          <div className="skeleton skeleton--text skeleton--price" style={{ height: '36px', width: '160px', marginBottom: '24px' }} />

          {/* Meta items */}
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'center' }}>
              <div className="skeleton skeleton--text" style={{ width: '70px', height: '14px' }} />
              <div className="skeleton skeleton--text" style={{ width: '130px', height: '14px' }} />
            </div>
          ))}

          {/* Description */}
          <div style={{ marginTop: '20px', padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--c-surface-2)' }}>
            <div className="skeleton skeleton--text" style={{ width: '120px', height: '16px', marginBottom: '10px' }} />
            <div className="skeleton skeleton--text" style={{ width: '100%', height: '13px', marginBottom: '8px' }} />
            <div className="skeleton skeleton--text" style={{ width: '90%', height: '13px', marginBottom: '8px' }} />
            <div className="skeleton skeleton--text" style={{ width: '70%', height: '13px' }} />
          </div>

          {/* Contact button */}
          <div className="skeleton" style={{ height: '52px', borderRadius: 'var(--radius-md)', marginTop: '20px' }} />

          {/* Seller card */}
          <div style={{ marginTop: '20px', padding: '18px', border: '1.5px solid var(--c-border)', borderRadius: 'var(--radius-lg)' }}>
            <div className="skeleton skeleton--text" style={{ width: '60px', height: '14px', marginBottom: '14px' }} />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton--text" style={{ width: '120px', height: '15px', marginBottom: '8px' }} />
                <div className="skeleton skeleton--text" style={{ width: '80px', height: '13px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
