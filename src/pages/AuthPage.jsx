import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '../components/ui/Button.jsx'
import Logo from '../components/ui/Logo.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import useAuth from '../hooks/useAuth.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

function Field({ id, label, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-text-primary">{label}</label>
      <input
        id={id}
        name={id}
        className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-border bg-bg-primary px-4 text-base text-text-primary placeholder:text-text-tertiary hover:border-text-tertiary"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && <p id={`${id}-error`} className="mt-2 text-sm font-medium text-danger" role="alert">{error}</p>}
    </div>
  )
}

// Hanya tujuan di dalam aplikasi ini yang diterima, bukan URL ke situs lain.
function safeNext(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : ''
}

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  useDocumentTitle(isRegister ? 'Daftar' : 'Masuk')

  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = safeNext(searchParams.get('next'))
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user && !submitting) {
    return <Navigate to={next || (user.role === 'reader' ? '/' : '/studio')} replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setFormError('')

    try {
      const signedIn = isRegister
        ? await register(values)
        : await login(values.email, values.password)

      if (isRegister) {
        toast.success('Akun dibuat. Minta admin menjadikanmu penulis bila ingin menulis artikel.')
      }
      navigate(next || (signedIn.role === 'reader' ? '/' : '/studio'), { replace: true })
    } catch (error) {
      setErrors(error.fields || {})
      setFormError(Object.keys(error.fields || {}).length > 0 ? '' : error.message)
      setSubmitting(false)
    }
  }

  const switchLink = `${isRegister ? '/login' : '/register'}${next ? `?next=${encodeURIComponent(next)}` : ''}`

  return (
    <div className="grid min-h-dvh place-items-center bg-bg-primary px-4 py-10 text-text-primary">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-bg-secondary p-6 shadow-card sm:p-8">
          <h1 className="font-display text-3xl font-semibold text-text-primary">
            {isRegister ? 'Buat akun' : 'Masuk'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {isRegister
              ? 'Akun baru bisa membaca dan berkomentar. Admin dapat menjadikannya penulis.'
              : 'Masuk untuk menulis artikel atau berkomentar.'}
          </p>

          {formError && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-950 dark:bg-red-950/30 dark:text-red-100" role="alert">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            {isRegister && (
              <Field id="name" label="Nama" autoComplete="name" value={values.name} onChange={handleChange} error={errors.name} />
            )}
            <Field id="email" label="Email" type="email" autoComplete="email" value={values.email} onChange={handleChange} error={errors.email} />
            <Field
              id="password"
              label="Password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={values.password}
              onChange={handleChange}
              error={errors.password}
            />
            <Button type="submit" size="lg" loading={submitting} className="w-full">
              {isRegister ? 'Daftar' : 'Masuk'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <Link to={switchLink} className="focus-ring rounded font-semibold text-text-primary underline underline-offset-4">
              {isRegister ? 'Masuk' : 'Daftar'}
            </Link>
          </p>
        </div>

        <Link
          to="/"
          className="focus-ring mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-2 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:text-text-primary"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Baca tanpa masuk
        </Link>
      </div>
    </div>
  )
}
