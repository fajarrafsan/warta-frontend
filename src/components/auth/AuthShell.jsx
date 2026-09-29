import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../ui/Logo.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'

// AuthShell adalah bingkai halaman akun: masuk, daftar, lupa password,
// reset password, dan verifikasi email.
export default function AuthShell({ title, description, children, footer, back = { to: '/', label: 'Baca tanpa masuk' } }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg-primary px-4 py-10 text-text-primary">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-bg-secondary p-6 shadow-card sm:p-8">
          <h1 className="font-display text-3xl font-semibold text-text-primary">{title}</h1>
          {description && <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>}
          {children}
          {footer && <p className="mt-6 text-center text-sm text-text-secondary">{footer}</p>}
        </div>

        <Link
          to={back.to}
          className="focus-ring mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-2 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:text-text-primary"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          {back.label}
        </Link>
      </div>
    </div>
  )
}

export function Field({ id, label, error, hint, ...props }) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-text-primary">{label}</label>
      <input
        id={id}
        name={id}
        className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-border bg-bg-primary px-4 text-base text-text-primary placeholder:text-text-tertiary hover:border-text-tertiary"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...props}
      />
      {hint && !error && <p id={`${id}-hint`} className="mt-2 text-xs text-text-tertiary">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-2 text-sm font-medium text-danger" role="alert">{error}</p>}
    </div>
  )
}

export function FormAlert({ tone = 'error', children }) {
  const tones = {
    error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-950 dark:bg-red-950/30 dark:text-red-100',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100',
  }
  return (
    <div className={`mt-6 rounded-xl border px-4 py-3 text-sm leading-6 ${tones[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

export function TextLink({ to, children }) {
  return (
    <Link to={to} className="focus-ring rounded font-semibold text-text-primary underline underline-offset-4">
      {children}
    </Link>
  )
}
