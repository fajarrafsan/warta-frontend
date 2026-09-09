export const ARTICLE_STATUS = {
  PUBLISH: 'publish',
  DRAFT: 'draft',
  THRASH: 'thrash',
}

export const STATUS_TABS = [
  { key: ARTICLE_STATUS.PUBLISH, label: 'Published', shortLabel: 'Publish' },
  { key: ARTICLE_STATUS.DRAFT, label: 'Drafts', shortLabel: 'Draft' },
  { key: ARTICLE_STATUS.THRASH, label: 'Trashed', shortLabel: 'Trash' },
]

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

export function getArticleExcerpt(content, maxLength = 180) {
  const normalized = content?.replace(/\s+/g, ' ').trim() || ''

  if (normalized.length <= maxLength) return normalized

  return `${normalized.slice(0, maxLength).trimEnd()}...`
}

export function sortByUpdatedDate(articles) {
  return [...articles].sort((first, second) => {
    const firstDate = new Date(first.updated_date || first.created_date).getTime()
    const secondDate = new Date(second.updated_date || second.created_date).getTime()
    return secondDate - firstDate
  })
}
