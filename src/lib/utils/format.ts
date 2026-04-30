/**
 * Formatting utilities for Arabic UI display.
 * All functions are pure — no side effects.
 */

// ─── Price ────────────────────────────────────────────────────────────────────

/**
 * Format a price number as Tunisian Dinar.
 * Uses Arabic-Indic numerals via Intl.NumberFormat with ar-TN locale.
 * Example: 1500.5 → "1٬500٫500 د.ت"
 */
export function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return '—'

  return new Intl.NumberFormat('ar-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(num)
}

/**
 * Format price with unit — e.g. "500 د.ت / كغ"
 */
export function formatPriceWithUnit(
  price: number | string,
  unitSymbol: string
): string {
  return `${formatPrice(price)} / ${unitSymbol}`
}

// ─── Date ─────────────────────────────────────────────────────────────────────

/**
 * Relative time label in Arabic — "منذ 3 أيام", "منذ ساعة", etc.
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHrs = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHrs / 24)

  if (diffSec < 60)  return 'الآن'
  if (diffMin < 60)  return `منذ ${diffMin} ${diffMin === 1 ? 'دقيقة' : 'دقائق'}`
  if (diffHrs < 24)  return `منذ ${diffHrs} ${diffHrs === 1 ? 'ساعة' : 'ساعات'}`
  if (diffDays < 7)  return `منذ ${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'}`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}`
  }
  const years = Math.floor(diffDays / 365)
  return `منذ ${years} ${years === 1 ? 'سنة' : 'سنوات'}`
}

/**
 * Short absolute date in Arabic — "15 جانفي 2025"
 */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ar-TN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

// ─── Quantity ─────────────────────────────────────────────────────────────────

/**
 * Format quantity with unit symbol — e.g. "500 كغ"
 */
export function formatQuantity(
  quantity: number | string,
  unitSymbol: string
): string {
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity
  if (isNaN(num)) return '—'

  const formatted = new Intl.NumberFormat('ar-TN', {
    maximumFractionDigits: 2,
  }).format(num)

  return `${formatted} ${unitSymbol}`
}

// ─── Text ─────────────────────────────────────────────────────────────────────

/**
 * Truncate text to maxLength characters, appending "..." if truncated.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}
