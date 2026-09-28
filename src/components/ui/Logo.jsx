export default function Logo({ compact = false }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand text-brand-contrast shadow-soft">
        <svg
          aria-hidden="true"
          viewBox="0 0 40 40"
          className="size-7"
          fill="none"
        >
          <path
            d="M8 12l5 16 7-12 7 12 5-16"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="9" r="3" fill="var(--accent-color)" />
        </svg>
      </span>

      {!compact && (
        <span className="min-w-0">
          <span className="block truncate font-display text-xl font-semibold leading-none text-text-primary">
            Warta
          </span>
          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
            Ruang redaksi
          </span>
        </span>
      )}
    </div>
  )
}
