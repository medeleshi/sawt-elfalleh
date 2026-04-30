'use client'

import { useTransition, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PostImageUploader, { type UploadedImage } from './PostImageUploader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createPostAction, updatePostAction } from '@/actions/posts.actions'
import type { Region, Category, Unit } from '@/types/domain'
import type { UserRole } from '@/types/db'
import type { ActionResult } from '@/types/domain'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostFormInitialData {
  type:          'sell' | 'buy'
  category_id:   string
  title:         string
  description:   string
  quantity:      number
  unit_id:       string
  price:         number
  is_negotiable: boolean
  region_id:     string
  city:          string
  images: UploadedImage[]
}

interface Props {
  mode:         'create' | 'edit'
  postId?:      string
  userRole:     UserRole
  regions:      Region[]
  categories:   Category[]
  units:        Unit[]
  initialData?: Partial<PostFormInitialData>
}

// ─── Field wrapper component ──────────────────────────────────────────────────

function Field({
  label,
  required,
  hint,
  children,
  error,
}: {
  label:     string
  required?: boolean
  hint?:     string
  children:  React.ReactNode
  error?:    string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="me-1 text-destructive">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ─── Select component ─────────────────────────────────────────────────────────

function Select({
  name,
  value,
  onChange,
  placeholder,
  options,
  disabled,
  className = '',
}: {
  name:        string
  value:       string
  onChange:    (val: string) => void
  placeholder: string
  options:     { value: string; label: string }[]
  disabled?:   boolean
  className?:  string
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={[
        'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'text-right',
        className,
      ].join(' ')}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function PostForm({
  mode,
  postId,
  userRole,
  regions,
  categories,
  units,
  initialData,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  // ─── Form state
  const [type,        setType]        = useState<'sell' | 'buy'>(initialData?.type ?? 'sell')
  const [categoryId,  setCategoryId]  = useState(initialData?.category_id ?? '')
  const [title,       setTitle]       = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [quantity,    setQuantity]    = useState(String(initialData?.quantity ?? ''))
  const [unitId,      setUnitId]      = useState(initialData?.unit_id ?? '')
  const [price,       setPrice]       = useState(String(initialData?.price ?? ''))
  const [negotiable,  setNegotiable]  = useState(initialData?.is_negotiable ?? false)
  const [regionId,    setRegionId]    = useState(initialData?.region_id ?? '')
  const [city,        setCity]        = useState(initialData?.city ?? '')
  const [images,      setImages]      = useState<UploadedImage[]>(initialData?.images ?? [])

  // Citizen cannot post sell
  const isCitizen = userRole === 'citizen'
  const effectiveType = isCitizen ? 'buy' : type

  // ─── Group categories (parents only for now, show all flat)
  const parentCategories = categories.filter(c => !c.parent_id)
  const subCategories    = categories.filter(c => c.parent_id)

  // ─── Build submit FormData and call server action
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    const formData = new FormData()
    formData.append('type',          effectiveType)
    formData.append('category_id',   categoryId)
    formData.append('title',         title)
    formData.append('description',   description)
    formData.append('quantity',      quantity)
    formData.append('unit_id',       unitId)
    formData.append('price',         price)
    formData.append('is_negotiable', String(negotiable))
    formData.append('region_id',     regionId)
    formData.append('city',          city)
    formData.append('images',        JSON.stringify(
      images.map(({ url, storage_path, sort_order }) => ({ url, storage_path, sort_order }))
    ))

    startTransition(async () => {
      let result: ActionResult

      if (mode === 'edit' && postId) {
        result = await updatePostAction(postId, { success: false, error: '' }, formData)
      } else {
        result = await createPostAction({ success: false, error: '' }, formData)
      }

      if (result && !result.success) {
        setServerError(result.error)
      }
      // On success the server action redirects — no need to handle here
    })
  }

  const isSubmitting = isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl" noValidate>

      {/* ─── Server error banner ─────────────────────────────────────── */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {serverError}
        </div>
      )}

      {/* ─── Post Type ───────────────────────────────────────────────── */}
      {isCitizen ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-800">
          كمواطن، يمكنك نشر طلبات شراء فقط.
        </div>
      ) : (
        <Field label="نوع الإعلان" required>
          <div className="flex gap-3">
            {(['sell', 'buy'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={[
                  'flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-colors',
                  type === t
                    ? t === 'sell'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-border bg-muted/30 text-muted-foreground hover:border-foreground/30',
                ].join(' ')}
              >
                {t === 'sell' ? '🏷️ بيع' : '🛒 شراء'}
              </button>
            ))}
          </div>
        </Field>
      )}

      {/* ─── Category ────────────────────────────────────────────────── */}
      <Field label="الصنف" required>
        <div className="space-y-2">
          {/* Parent categories as chips */}
          <div className="flex flex-wrap gap-2">
            {parentCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={[
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                  categoryId === cat.id
                    ? 'border-brand-500 bg-brand-50/50 text-brand-700 font-medium'
                    : 'border-border text-muted-foreground hover:border-brand-300 hover:text-foreground',
                ].join(' ')}
              >
                <span>{cat.icon}</span>
                <span>{cat.name_ar}</span>
              </button>
            ))}
          </div>
          {/* Subcategory select if parent is selected and has children */}
          {categoryId && subCategories.some(c => c.parent_id === categoryId) && (
            <Select
              name="subcategory_id"
              value={categoryId}
              onChange={setCategoryId}
              placeholder="اختر صنفاً فرعياً (اختياري)"
              options={subCategories
                .filter(c => c.parent_id === categoryId)
                .map(c => ({ value: c.id, label: `${c.icon ?? ''} ${c.name_ar}` }))}
            />
          )}
        </div>
      </Field>

      {/* ─── Title ────────────────────────────────────────────────────── */}
      <Field
        label="عنوان الإعلان"
        required
        hint="مثال: قمح صلب من إنتاج هذا الموسم — باجة"
      >
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="اكتب عنواناً واضحاً ومختصراً..."
          maxLength={100}
          className="text-right"
        />
        <p className="text-end text-xs text-muted-foreground">{title.length}/100</p>
      </Field>

      {/* ─── Description ─────────────────────────────────────────────── */}
      <Field
        label="الوصف"
        hint="اذكر تفاصيل المنتج، الجودة، طريقة التسليم..."
      >
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="وصف تفصيلي اختياري..."
          maxLength={1000}
          rows={4}
          className={[
            'w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-right',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          ].join(' ')}
        />
        <p className="text-end text-xs text-muted-foreground">{description.length}/1000</p>
      </Field>

      {/* ─── Quantity + Unit ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="الكمية" required>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            min="0.01"
            step="any"
            className="text-right"
          />
        </Field>

        <Field label="وحدة القياس" required>
          <Select
            name="unit_id"
            value={unitId}
            onChange={setUnitId}
            placeholder="اختر الوحدة"
            options={units.map(u => ({ value: u.id, label: `${u.name_ar} (${u.symbol})` }))}
          />
        </Field>
      </div>

      {/* ─── Price ────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Field
          label="السعر (د.ت)"
          required
          hint={negotiable ? 'السعر تفاوضي — يمكن كتابة صفر إذا كنت تفضل التفاوض' : undefined}
        >
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.000"
            min="0"
            step="0.001"
            className="text-right"
          />
        </Field>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={negotiable}
            onChange={(e) => setNegotiable(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-brand-600"
          />
          السعر قابل للتفاوض
        </label>
      </div>

      {/* ─── Region + City ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="الولاية" required>
          <Select
            name="region_id"
            value={regionId}
            onChange={setRegionId}
            placeholder="اختر الولاية"
            options={regions.map(r => ({ value: r.id, label: r.name_ar }))}
          />
        </Field>

        <Field label="المدينة / المعتمدية" hint="اختياري">
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="مثال: تستور"
            maxLength={100}
            className="text-right"
          />
        </Field>
      </div>

      {/* ─── Images ───────────────────────────────────────────────────── */}
      <PostImageUploader
        initialImages={images}
        onChange={setImages}
      />

      {/* ─── Actions ──────────────────────────────────────────────────── */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-brand-600 hover:bg-brand-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {mode === 'edit' ? 'جاري التحديث...' : 'جاري النشر...'}
            </span>
          ) : (
            mode === 'edit' ? 'تحديث الإعلان' : 'نشر الإعلان'
          )}
        </Button>
      </div>
    </form>
  )
}
