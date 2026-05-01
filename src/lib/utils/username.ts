/**
 * Username / slug utilities for Sawt ElFalleh.
 *
 * Rules:
 * - Lowercase Latin letters, digits, and hyphens only.
 * - Arabic characters are transliterated to Latin equivalents.
 * - Length: 3–30 characters.
 * - Cannot match any reserved route segment.
 */

import { createClient } from '@/lib/supabase/server'

// ─── Reserved usernames (must match PROTECTED_PREFIXES in middleware) ─────────

export const FORBIDDEN_USERNAMES = new Set([
  'admin', 'settings', 'marketplace', 'profile', 'notifications',
  'messages', 'onboarding', 'login', 'register', 'post', 'api',
  'auth', 'about', 'contact', 'privacy-policy', 'terms',
  'how-it-works', 'landing', 'offline', 'me', 'new', 'edit',
  'null', 'undefined', 'anonymous', 'support', 'help',
])

// ─── Arabic → Latin transliteration map ──────────────────────────────────────

const ARABIC_LATIN: Record<string, string> = {
  'ا': 'a',  'أ': 'a',  'إ': 'i',  'آ': 'a',  'ب': 'b',
  'ت': 't',  'ث': 'th', 'ج': 'j',  'ح': 'h',  'خ': 'kh',
  'د': 'd',  'ذ': 'dh', 'ر': 'r',  'ز': 'z',  'س': 's',
  'ش': 'sh', 'ص': 's',  'ض': 'd',  'ط': 't',  'ظ': 'z',
  'ع': 'a',  'غ': 'gh', 'ف': 'f',  'ق': 'q',  'ك': 'k',
  'ل': 'l',  'م': 'm',  'ن': 'n',  'ه': 'h',  'و': 'w',
  'ي': 'y',  'ى': 'a',  'ة': 'a',  'ء': '',   'ئ': 'y',
  'ؤ': 'w',  'لا': 'la',
}

/**
 * Convert a display name to a URL-safe slug.
 *  - Transliterates Arabic characters
 *  - Lowercases Latin characters
 *  - Replaces spaces/separators with hyphens
 *  - Removes any character that isn't a-z, 0-9, or -
 *  - Collapses consecutive hyphens
 *  - Strips leading/trailing hyphens
 *  - Clamps to 24 characters (leaves room for suffix)
 */
export function slugifyName(name: string): string {
  let result = name.trim()

  // Transliterate Arabic
  for (const [ar, lat] of Object.entries(ARABIC_LATIN)) {
    result = result.split(ar).join(lat)
  }

  result = result
    .toLowerCase()
    .replace(/[\s_]+/g, '-')     // spaces & underscores → hyphen
    .replace(/[^a-z0-9-]/g, '')  // strip non-slug chars
    .replace(/-{2,}/g, '-')      // collapse multiple hyphens
    .replace(/^-+|-+$/g, '')     // strip leading/trailing hyphens
    .slice(0, 24)

  // Fallback if name is entirely non-representable
  if (result.length < 2) {
    result = 'user'
  }

  return result
}

/**
 * Return true if the username is forbidden or structurally invalid.
 */
export function isForbiddenUsername(username: string): boolean {
  if (FORBIDDEN_USERNAMES.has(username)) return true
  if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(username)) return true
  return false
}

/**
 * Generate a unique username from a display name.
 * Tries the base slug first, then appends a random 4-digit suffix on collision.
 * Maximum 10 attempts before falling back to a UUID-based name.
 */
export async function generateUniqueUsername(
  fullName: string,
  excludeUserId?: string
): Promise<string> {
  const supabase = await createClient()
  const base = slugifyName(fullName)

  // Attempt base slug first, then add random suffixes
  const candidates: string[] = [base]
  for (let i = 0; i < 9; i++) {
    const suffix = Math.floor(1000 + Math.random() * 9000)
    candidates.push(`${base}-${suffix}`)
  }

  for (const candidate of candidates) {
    if (isForbiddenUsername(candidate)) continue

    let query = supabase
      .from('profiles')
      .select('id')
      .eq('username', candidate)

    if (excludeUserId) {
      query = query.neq('id', excludeUserId)
    }

    const { data } = await query.maybeSingle()

    if (!data) {
      // No collision — username is free
      return candidate
    }
  }

  // Absolute fallback: 8-char hex suffix
  const hex = Math.random().toString(16).slice(2, 10)
  return `user-${hex}`
}
