// src/components/posts/DeletePostButton.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deletePostAction } from '@/actions/posts.actions'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { toast } from '@/components/shared/Toast'
import { Button } from '@/components/ui/button'

interface Props {
  postId: string
  redirectTo?: string
}

/**
 * Delete post button — opens ConfirmDialog before calling deletePostAction.
 * Shows toast on success/error.
 */
export default function DeletePostButton({
  postId,
  redirectTo = '/profile/me',
}: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await deletePostAction(postId)
      if (!result.success) {
        setError(result.error)
        toast.error(result.error)
      } else {
        setOpen(false)
        toast.success('تم حذف الإعلان بنجاح')
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
        onClick={() => { setError(null); setOpen(true) }}
        className="gap-1.5"
      >
        <Trash2 className="h-4 w-4" />
        حذف الإعلان
      </Button>

      <ConfirmDialog
        open={open}
        onClose={() => !isPending && setOpen(false)}
        onConfirm={handleConfirm}
        title="حذف الإعلان"
        description="هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذه العملية."
        confirmLabel="تأكيد الحذف"
        variant="danger"
        icon="🗑️"
        isPending={isPending}
        error={error}
      />
    </>
  )
}
