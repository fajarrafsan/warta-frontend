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
