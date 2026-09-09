const statusContent = {
  checking: { label: 'Memeriksa backend', dot: 'bg-amber-500 animate-soft-pulse' },
  online: { label: 'Backend terhubung', dot: 'bg-emerald-500' },
  offline: { label: 'Backend terputus', dot: 'bg-red-500' },
}

export default function ServiceStatus({ status, compact = false }) {
  const content = statusContent[status]

  return (
    <div
      className={`flex items-center ${compact ? 'gap-2' : 'gap-3 rounded-xl border border-border bg-bg-soft px-3 py-3'}`}
      role="status"
    >
      <span className={`size-2 shrink-0 rounded-full ${content.dot}`} aria-hidden="true" />
      <span className={`${compact ? 'sr-only' : 'text-xs font-medium text-text-secondary'}`}>
        {content.label}
      </span>
    </div>
  )
}
