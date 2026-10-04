import { CalendarClock, CircleCheck, FileClock, Trash2 } from 'lucide-react'

const variants = {
  published: {
    label: 'Published',
    icon: CircleCheck,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  scheduled: {
    label: 'Scheduled',
    icon: CalendarClock,
    className: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300',
  },
  draft: {
    label: 'Draft',
    icon: FileClock,
    className: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  },
  archived: {
    label: 'Trashed',
    icon: Trash2,
    className: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300',
  },
}

export default function StatusBadge({ status }) {
  const variant = variants[status] || variants.draft
  const Icon = variant.icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${variant.className}`}>
      <Icon aria-hidden="true" size={13} />
      {variant.label}
    </span>
  )
}
