/**
 * Global constants for Sawt ElFalleh.
 * All magic numbers and strings live here — never hardcoded in components.
 */

export const APP_NAME = 'صوت الفلاح'
export const APP_NAME_LATIN = 'Sawt ElFalleh'
export const APP_DESCRIPTION = 'السوق الفلاحي التونسي'
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export const APP_URL = getBaseUrl()

// ─── Limits (must match DB triggers exactly) ──────────────────────────────────
export const MAX_ACTIVITIES = 5
export const MAX_FOLLOWED_REGIONS = 5
export const MAX_POST_IMAGES = 5
export const MAX_IMAGE_SIZE_MB = 5
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ─── Post defaults ────────────────────────────────────────────────────────────
export const POST_EXPIRY_DAYS = 60
export const HOME_SECTION_LIMIT = 10
export const MARKETPLACE_PAGE_SIZE = 20

// ─── Storage buckets (must match Supabase dashboard) ─────────────────────────
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  POST_IMAGES: 'post-images',
} as const

// ─── Routes ───────────────────────────────────────────────────────────────────
export const ROUTES = {
  // Public
  LANDING: '/landing',
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  RESET_SUCCESS: '/reset-success',
  // Onboarding
  ONBOARDING_PROFILE: '/onboarding/profile',
  ONBOARDING_INTERESTS: '/onboarding/interests',
  ONBOARDING_DONE: '/onboarding/done',
  // App
  HOME: '/',
  MARKETPLACE: '/marketplace',
  POST_NEW: '/post/new',
  PROFILE_ME: '/profile/me',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  // Admin
  ADMIN: '/admin',
} as const

// ─── Role labels (Arabic) ─────────────────────────────────────────────────────
export const ROLE_LABELS: Record<string, string> = {
  farmer:  'فلاح',
  trader:  'تاجر',
  citizen: 'مواطن',
  admin:   'مدير',
}

// ─── Post type labels (Arabic) ────────────────────────────────────────────────
export const POST_TYPE_LABELS: Record<string, string> = {
  sell: 'بيع',
  buy:  'شراء',
}

// ─── Post status labels (Arabic) ─────────────────────────────────────────────
export const POST_STATUS_LABELS: Record<string, string> = {
  active:    'نشط',
  expired:   'منتهي',
  deleted:   'محذوف',
  suspended: 'موقوف',
}
