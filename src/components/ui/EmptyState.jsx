import { FileText } from 'lucide-react'

export default function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  children,
  compact = false,
}) {
  return (
    <div className={`flex flex-col items-center justify-center px-5 text-center ${compact ? 'py-12' : 'py-20'}`}>
      <div className="mb-5 grid size-14 place-items-center rounded-2xl border border-border bg-bg-soft text-text-secondary">
        <Icon aria-hidden="true" size={24} />
      </div>
      <h2 className="font-display text-2xl font-semibold text-text-primary">{title}</h2>
      <p className="mt-2 max-w-md leading-6 text-text-secondary">{description}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}

