'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfileAction } from '@/actions/profile.actions'
import { Check } from 'lucide-react'

interface Profile {
  full_name: string
  bio: string
  phone: string
  city: string
  region_id: string
  avatar_url: string
}

interface Region {
  id: string
  name_ar: string
}

interface Category {
  id: string
  name_ar: string
  icon: string | null
}

interface Props {
  profile: Profile
  activityIds: string[]
  followedRegionIds: string[]
  regions: Region[]
  categories: Category[]
}

export default function EditProfileForm({
  profile,
  activityIds,
  followedRegionIds,
  regions,
  categories,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [fullName, setFullName] = useState(profile.full_name)
  const [bio, setBio] = useState(profile.bio)
  const [phone, setPhone] = useState(profile.phone)
  const [city, setCity] = useState(profile.city)
  const [regionId, setRegionId] = useState(profile.region_id)
  const [selectedActivities, setSelectedActivities] =
    useState<string[]>(activityIds)
  const [selectedRegions, setSelectedRegions] =
    useState<string[]>(followedRegionIds)

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) => {
      if (prev.includes(id)) return prev.filter((a) => a !== id)
      if (prev.length >= 5) return prev // max 5
      return [...prev, id]
    })
  }

  const toggleRegion = (id: string) => {
    setSelectedRegions((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id)
      if (prev.length >= 5) return prev // max 5
      return [...prev, id]
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await updateProfileAction({
        full_name: fullName,
        bio: bio || null,
        phone: phone || null,
        city: city || null,
        region_id: regionId || null,
        activity_ids: selectedActivities,
        followed_region_ids: selectedRegions,
      })

      if (result.success) {
        setSuccess(true)
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <section className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">
            المعلومات الأساسية
          </h2>
        </div>
        <div className="p-5 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="أدخل اسمك الكامل"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              نبذة عنك
              <span className="text-stone-400 font-normal mr-1">
                (اختياري)
              </span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={300}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="اكتب نبذة قصيرة عن نفسك..."
            />
            <p className="text-xs text-stone-400 mt-1 text-left">
              {bio.length}/300
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+216 XX XXX XXX"
              dir="ltr"
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">
            الموقع
          </h2>
        </div>
        <div className="p-5 space-y-4">
          {/* Region */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              الولاية
            </label>
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="">اختر الولاية</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name_ar}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              المدينة / المعتمدية
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              maxLength={100}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="مثال: بنزرت الشمالية"
            />
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">
              الأنشطة الفلاحية
            </h2>
            <span className="text-xs text-stone-400">
              {selectedActivities.length}/5
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            اختر ما يصف نشاطك الفلاحي (أقصى 5 أنشطة)
          </p>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedActivities.includes(cat.id)
              const isDisabled =
                !isSelected && selectedActivities.length >= 5

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleActivity(cat.id)}
                  disabled={isDisabled}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    isSelected
                      ? 'bg-green-600 text-white border-green-600'
                      : isDisabled
                        ? 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-green-400 hover:text-green-700'
                  }`}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name_ar}
                  {isSelected && <Check className="w-3 h-3" />}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Followed Regions */}
      <section className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">
              الولايات المتابَعة
            </h2>
            <span className="text-xs text-stone-400">
              {selectedRegions.length}/5
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            تابع إعلانات من ولايات معينة (أقصى 5 ولايات)
          </p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {regions.map((region) => {
              const isSelected = selectedRegions.includes(region.id)
              const isDisabled = !isSelected && selectedRegions.length >= 5

              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => toggleRegion(region.id)}
                  disabled={isDisabled}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-green-600 text-white border-green-600'
                      : isDisabled
                        ? 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-green-400'
                  }`}
                >
                  <span>{region.name_ar}</span>
                  {isSelected && <Check className="w-3 h-3 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Error / Success */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          ✓ تم حفظ التغييرات بنجاح
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || !fullName.trim()}
        className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
      </button>
    </form>
  )
}
