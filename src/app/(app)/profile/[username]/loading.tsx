// src/app/(app)/profile/[username]/loading.tsx

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#f9f6f0]" dir="rtl">
      {/* Profile Header Skeleton */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 animate-pulse">
            {/* Avatar skeleton */}
            <div className="w-24 h-24 rounded-full bg-stone-100 ring-4 ring-stone-50 shrink-0" />

            {/* Info skeleton */}
            <div className="flex-1 text-center sm:text-right space-y-3">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
                <div className="h-8 w-48 bg-stone-100 rounded" />
                <div className="h-6 w-16 bg-stone-100 rounded-full" />
              </div>
              <div className="h-4 w-full max-w-lg bg-stone-100 rounded" />
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <div className="h-4 w-24 bg-stone-100 rounded" />
                <div className="h-4 w-24 bg-stone-100 rounded" />
                <div className="h-4 w-32 bg-stone-100 rounded" />
              </div>
              <div className="pt-2">
                <div className="h-4 w-32 bg-stone-50 rounded mx-auto sm:mx-0" />
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="flex sm:flex-col gap-4 sm:gap-2 text-center shrink-0">
              <div className="bg-stone-50 rounded-xl px-4 py-3 w-32">
                <div className="h-8 w-8 bg-stone-100 rounded mx-auto mb-1" />
                <div className="h-3 w-20 bg-stone-100 rounded mx-auto" />
              </div>
              <div className="bg-stone-50 rounded-xl px-4 py-3 w-32">
                <div className="h-8 w-8 bg-stone-100 rounded mx-auto mb-1" />
                <div className="h-3 w-20 bg-stone-100 rounded mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border-b border-stone-200 mb-6">
          <div className="flex gap-8">
            <div className="h-10 w-24 border-b-2 border-green-600 bg-white" />
            <div className="h-10 w-24 bg-transparent" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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
  )
}
