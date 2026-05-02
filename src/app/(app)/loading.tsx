// src/app/(app)/loading.tsx

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Banner Skeleton */}
      <section className="relative overflow-hidden bg-stone-100 px-4 py-10 sm:py-14 animate-pulse">
        <div className="container relative">
          <div className="mx-auto max-w-xl text-center space-y-4">
            <div className="mx-auto h-6 w-32 bg-stone-200 rounded-full" />
            <div className="mx-auto h-10 w-3/4 bg-stone-200 rounded-lg" />
            <div className="mx-auto h-10 w-1/2 bg-stone-200 rounded-lg" />
            <div className="mx-auto h-4 w-5/6 bg-stone-200 rounded" />
            <div className="flex justify-center gap-3 pt-2">
              <div className="h-10 w-32 bg-stone-200 rounded-xl" />
              <div className="h-10 w-32 bg-stone-200 rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Feed Sections Skeletons */}
      <div className="container space-y-12 py-8 sm:py-12">
        {[...Array(3)].map((_, i) => (
          <section key={i} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-48 bg-stone-100 rounded skeleton" />
              <div className="h-4 w-20 bg-stone-100 rounded skeleton" />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="post-card post-card--skeleton">
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
          </section>
        ))}
      </div>
    </div>
  )
}
