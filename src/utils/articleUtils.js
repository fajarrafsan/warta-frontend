export const ARTICLE_STATUS = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
}

// Tab "Trashed" memakai status archived di backend: artikel disembunyikan dari
// publik tanpa dihapus, dan bisa dipulihkan.
export const STATUS_TABS = [
  { key: ARTICLE_STATUS.PUBLISHED, label: 'Published', shortLabel: 'Publish' },
  { key: ARTICLE_STATUS.DRAFT, label: 'Drafts', shortLabel: 'Draft' },
  { key: ARTICLE_STATUS.ARCHIVED, label: 'Trashed', shortLabel: 'Trash' },
]

export const ROLE_LABELS = {
  admin: 'Admin',
  author: 'Penulis',
  reader: 'Pembaca',
}

export function formatArticleDate(value, options = {}) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date)
}

// parseTags mengubah isian "golang, Backend,  api" menjadi daftar tag.
export function parseTags(value) {
  const seen = new Set()
  return value
    .split(',')
    .map((tag) => tag.replace(/\s+/g, ' ').trim().toLowerCase())
    .filter((tag) => {
      if (!tag || seen.has(tag)) return false
      seen.add(tag)
      return true
    })
}

const compact = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 })
const whole = new Intl.NumberFormat('id-ID')

// formatCount menyingkat angka besar: 1.284 -> 1,3 rb.
export function formatCount(value) {
  return (value ?? 0) >= 10000 ? compact.format(value) : whole.format(value ?? 0)
}

export function readingLabel(minutes) {
  return `${minutes || 1} menit baca`
}

// estimateReadingMinutes sama dengan perhitungan backend: 1.200 karakter per menit.
export function estimateReadingMinutes(text) {
  return Math.max(1, Math.ceil((text?.length || 0) / 1200))
}

export const REPORT_REASONS = [
  { value: 'spam', label: 'Spam atau iklan' },
  { value: 'abusive', label: 'Kasar atau menyerang' },
  { value: 'other', label: 'Alasan lain' },
]
