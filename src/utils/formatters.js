/**
 * Formatting helpers. All of these are pure and locale-aware.
 */

const EN_DATE = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const BN_DATE = new Intl.DateTimeFormat('bn-BD', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const EN_DATE_TIME = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * Formats an ISO-ish date string for display.
 * @returns {{ text: string, valid: boolean }}
 */
export const formatDate = (value, language = 'en') => {
  if (!value) return { text: '', valid: false }

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/
  const source = String(value).trim()
  const parsed = new Date(dateOnly.test(source) ? `${source}T00:00:00` : source)

  if (Number.isNaN(parsed.getTime())) {
    return { text: String(value), valid: false }
  }

  const formatter = language === 'bn' ? BN_DATE : EN_DATE
  return { text: formatter.format(parsed), valid: true }
}

/** Formats a full timestamp (used for file metadata). */
export const formatDateTime = (value) => {
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return EN_DATE_TIME.format(parsed)
}

/** Whole-day difference between a deadline and now (positive = future). */
export const daysUntil = (value, now = new Date()) => {
  if (!value) return null
  const source = String(value).trim()
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/
  const parsed = new Date(dateOnly.test(source) ? `${source}T23:59:59` : source)
  if (Number.isNaN(parsed.getTime())) return null

  const MS_PER_DAY = 24 * 60 * 60 * 1000
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfTarget = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime()
  return Math.round((startOfTarget - startOfToday) / MS_PER_DAY)
}

/**
 * Formats a tender deadline for display.
 * Falls back to the raw value if it cannot be parsed, so a malformed date in
 * the source file is still visible to the user instead of silently blank.
 */
export const formatDeadline = (value, language = 'en') => {
  if (!value) return ''
  const { text, valid } = formatDate(value, language)
  return valid ? text : String(value)
}

/**
 * Human readable distance to the deadline, e.g. "12 days remaining".
 * Returns the number of days so callers can style/warn as they wish.
 *
 * @returns {{ days: number|null, relative: 'past'|'today'|'future'|'unknown' }}
 */
export const getDeadlineDistance = (value, now = new Date()) => {
  const days = daysUntil(value, now)
  if (days === null) return { days: null, relative: 'unknown' }
  if (days < 0) return { days: Math.abs(days), relative: 'past' }
  if (days === 0) return { days: 0, relative: 'today' }
  return { days, relative: 'future' }
}

/**
 * Pre-formatted relative deadline string. Kept as a plain string (rather than
 * a translator call) because the caller already owns the `t` function and this
 * module must stay free of UI concerns.
 */
export const formatDeadlineRelative = (value, language = 'en') => {
  const { days, relative } = getDeadlineDistance(value)

  if (relative === 'unknown') return ''

  const isBn = language === 'bn'
  if (relative === 'today') return isBn ? 'আজই শেষ তারিখ' : 'Deadline is today'
  if (relative === 'past') {
    return isBn ? `শেষ তারিখের ${days} দিন পরে` : `${days} day(s) past the deadline`
  }
  return isBn ? `${days} দিন বাকি` : `${days} day(s) remaining`
}

/** 1536 -> "1.5 KB". Keeps byte sizes readable in the upload list. */
export const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent
  const decimals = exponent === 0 || value >= 100 ? 0 : 1
  return `${value.toFixed(decimals)} ${units[exponent]}`
}

/** Truncates a long file name in the middle, preserving the extension. */
export const truncateMiddle = (text, max = 42) => {
  const value = String(text ?? '')
  if (value.length <= max) return value
  const head = Math.ceil((max - 3) / 2)
  const tail = Math.floor((max - 3) / 2)
  return `${value.slice(0, head)}...${value.slice(-tail)}`
}

/**
 * Normalises a raw file name for comparison and matching hints:
 * lower-cased, extension removed, separators collapsed.
 */
export const normaliseFileName = (fileName) =>
  String(fileName ?? '')
    .replace(/\.[^./\\]+$/, '')
    .toLowerCase()
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
