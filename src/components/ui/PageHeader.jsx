export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent-strong">
            {eyebrow}
          </p>
        )}
        <h1 className="balanced-text font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-text-primary sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-xl text-base leading-7 text-text-secondary">
            {description}
          </p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </header>
  )
}

