import { LoaderCircle } from 'lucide-react'

const variants = {
  primary:
    'border-brand bg-brand text-brand-contrast hover:opacity-90 active:opacity-80',
  secondary:
    'border-border bg-bg-secondary text-text-primary hover:border-text-tertiary hover:bg-bg-hover',
  ghost:
    'border-transparent bg-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary',
  danger:
    'border-danger bg-danger text-white hover:opacity-90 active:opacity-80 dark:text-zinc-950',
}

const sizes = {
  sm: 'min-h-10 px-3.5 text-sm',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-6 text-base',
  icon: 'size-11 p-0',
}

export default function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle aria-hidden="true" size={17} className="animate-spin" />}
      {children}
    </button>
  )
}

