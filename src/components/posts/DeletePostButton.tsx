'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deletePostAction } from '@/actions/posts.actions'
import { Button } from '@/components/ui/button'

interface Props {
  postId:      string
  redirectTo?: string
}

export default function DeletePostButton({ postId, redirectTo = '/profile/me' }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deletePostAction(postId)
      if (!result.success) {
        setError(result.error)
      } else {
        setOpen(false)
        router.push(redirectTo)
        router.refresh()
      }
    })
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
      >
        حذف الإعلان
      </Button>

      {/* Confirm dialog */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-foreground">حذف الإعلان</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذه العملية.
            </p>

            {error && (
              <p className="mt-3 text-sm text-destructive">{error}</p>
            )}

            <div className="mt-5 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    جاري الحذف...
                  </span>
                ) : 'تأكيد الحذف'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
