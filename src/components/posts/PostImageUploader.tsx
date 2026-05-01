'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  MAX_POST_IMAGES,
  STORAGE_BUCKETS,
} from '@/lib/utils/constants'
import { validateImage, generateStoragePath, ALLOWED_MIME_TYPES } from '@/lib/utils/storage'
import { v4 as uuidv4 } from 'uuid'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadedImage {
  /** Temp client-side id for keyed rendering */
  clientId: string
  /** Public URL from Supabase Storage */
  url: string
  /** Storage path (used for deletion + DB insert) */
  storage_path: string
  /** Display order */
  sort_order: number
}

interface Props {
  /** Pre-populated images when editing an existing post */
  initialImages?: UploadedImage[]
  /** Called whenever the image list changes (upload, remove, reorder) */
  onChange: (images: UploadedImage[]) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// clientId uses uuidv4 — same import already used for storage path generation

// ─── Component ────────────────────────────────────────────────────────────────

export default function PostImageUploader({ initialImages = [], onChange }: Props) {
  const [images, setImages]   = useState<UploadedImage[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  // ─── Update parent whenever local state changes ───────────────────────────
  function update(next: UploadedImage[]) {
    const reindexed = next.map((img, i) => ({ ...img, sort_order: i }))
    setImages(reindexed)
    onChange(reindexed)
  }

  // ─── Upload handler ────────────────────────────────────────────────────────
  async function handleFiles(files: FileList) {
    setError(null)

    const remaining = MAX_POST_IMAGES - images.length
    if (remaining <= 0) {
      setError(`الحد الأقصى للصور هو ${MAX_POST_IMAGES}`)
      return
    }

    const toUpload = Array.from(files).slice(0, remaining)

    // Validate each file
    for (const file of toUpload) {
      const { valid, error } = validateImage(file)
      if (!valid) {
        setError(error || 'ملف غير صالح')
        return
      }
    }

    setUploading(true)

    try {
      const uploaded: UploadedImage[] = []

      for (const file of toUpload) {
        // We don't have the postId yet during creation, so we use a temp folder or just root of bucket
        const path = generateStoragePath(file, { bucket: 'post-images' })

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKETS.POST_IMAGES)
          .upload(path, file, { upsert: false })

        if (uploadError) {
          setError('فشل رفع الصورة. تحقق من الاتصال وحاول مجدداً.')
          setUploading(false)
          return
        }

        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKETS.POST_IMAGES)
          .getPublicUrl(path)

        uploaded.push({
          clientId:     uuidv4(),
          url:          urlData.publicUrl,
          storage_path: path,
          sort_order:   images.length + uploaded.length,
        })
      }

      update([...images, ...uploaded])
    } finally {
      setUploading(false)
    }
  }

  // ─── Remove handler ────────────────────────────────────────────────────────
  async function handleRemove(clientId: string, storagePath: string) {
    // Remove from storage (best-effort — don't block UI if it fails)
    await supabase.storage
      .from(STORAGE_BUCKETS.POST_IMAGES)
      .remove([storagePath])
      .catch(() => {})

    update(images.filter(img => img.clientId !== clientId))
  }

  // ─── Drag-drop reorder ────────────────────────────────────────────────────
  const dragItem = useRef<number | null>(null)

  function handleDragStart(index: number) {
    dragItem.current = index
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragItem.current === null || dragItem.current === index) return
    const next = [...images]
    const [moved] = next.splice(dragItem.current, 1)
    next.splice(index, 0, moved)
    dragItem.current = index
    update(next)
  }

  function handleDragEnd() {
    dragItem.current = null
  }

  const canAddMore = images.length < MAX_POST_IMAGES

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          صور الإعلان
        </label>
        <span className="text-xs text-muted-foreground">
          {images.length} / {MAX_POST_IMAGES}
        </span>
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((img, index) => (
            <div
              key={img.clientId}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="relative aspect-square cursor-grab rounded-lg overflow-hidden border border-border bg-muted group"
            >
              <Image
                src={img.url}
                alt={`صورة ${index + 1}`}
                fill
                sizes="20vw"
                className="object-cover"
              />
              {/* Primary badge */}
              {index === 0 && (
                <span className="absolute top-1 start-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  رئيسية
                </span>
              )}
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(img.clientId, img.storage_path)}
                className="absolute top-1 end-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="حذف الصورة"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              {/* Drag indicator */}
              <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 pb-1">
                <span className="text-[10px] text-white/80 bg-black/40 px-1 rounded">اسحب لإعادة الترتيب</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {canAddMore && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 py-8 text-sm text-muted-foreground transition-colors hover:border-brand-500 hover:bg-brand-50/10 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-60"
        >
          {uploading ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              <span>جاري الرفع...</span>
            </>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>
                انقر لإضافة صور
                {images.length === 0 ? ` (حتى ${MAX_POST_IMAGES})` : ` (${MAX_POST_IMAGES - images.length} متبقية)`}
              </span>
              <span className="text-xs opacity-60">JPG · PNG · WebP · حتى 5 ميغابايت</span>
            </>
          )}
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            handleFiles(e.target.files)
            e.target.value = '' // reset so same file can be re-selected
          }
        }}
      />

      {/* Error */}
      {error && (
        <p className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
