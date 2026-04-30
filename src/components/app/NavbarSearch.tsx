'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { ROUTES } from '@/lib/utils/constants'

/**
 * Navbar search input — Client Component.
 * On submit (Enter key or form submit), navigates to /marketplace?query=...
 * Kept as a separate client component so Navbar remains a Server Component.
 */
export default function NavbarSearch() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const query = inputRef.current?.value.trim()
    if (!query) {
      router.push(ROUTES.MARKETPLACE)
      return
    }
    router.push(`${ROUTES.MARKETPLACE}?query=${encodeURIComponent(query)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex flex-1 items-center justify-center px-2"
    >
      <div className="relative w-full max-w-md">
        <Search
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          name="query"
          placeholder="ابحث عن منتج، فلاح، ولاية..."
          className="h-10 w-full rounded-full border border-input bg-muted/50 pr-10 pl-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
          aria-label="بحث في السوق"
          autoComplete="off"
        />
      </div>
    </form>
  )
}
