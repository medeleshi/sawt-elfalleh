'use client'

import { useState, useTransition } from 'react'
import { toggleSavePostAction } from '@/actions/posts.actions'
import { toast } from 'sonner'

interface Props {
  postId: string
  initialIsSaved?: boolean
  className?: string
  showText?: boolean
}

export default function SavePostButton({
  postId,
  initialIsSaved = false,
  className = '',
  showText = false
}: Props) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isPending, startTransition] = useTransition()

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isPending) return

    const previousState = isSaved
    setIsSaved(!previousState) // Optimistic update

    startTransition(async () => {
      const result = await toggleSavePostAction(postId)
      if (result.success) {
        setIsSaved(result.data?.isSaved ?? false)
        toast.success(result.data?.isSaved ? 'تم حفظ الإعلان في مفضلتك' : 'تمت إزالة الإعلان من مفضلتك')
      } else {
        setIsSaved(previousState) // Rollback
        toast.error(result.error)
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`save-button ${isSaved ? 'save-button--saved' : ''} ${className}`}
      aria-label={isSaved ? 'إزالة من المحفوظات' : 'حفظ الإعلان'}
      title={isSaved ? 'إزالة من المحفوظات' : 'حفظ الإعلان'}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isSaved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {showText && (
        <span className="ms-2">{isSaved ? 'محفوظ' : 'حفظ'}</span>
      )}
    </button>
  )
}
