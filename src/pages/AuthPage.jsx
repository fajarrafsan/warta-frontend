import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import AuthShell, { Field, FormAlert, TextLink } from '../components/auth/AuthShell.jsx'
import Button from '../components/ui/Button.jsx'
import useAuth from '../hooks/useAuth.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

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
        toast.success(`Akun dibuat. Cek ${signedIn.email} untuk tautan verifikasi.`)
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
    <AuthShell
      title={isRegister ? 'Buat akun' : 'Masuk'}
      description={isRegister
        ? 'Akun baru bisa membaca dan berkomentar setelah email diverifikasi. Admin dapat menjadikannya penulis.'
        : 'Masuk untuk menulis artikel atau berkomentar.'}
      footer={(
        <>
          {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <TextLink to={switchLink}>{isRegister ? 'Masuk' : 'Daftar'}</TextLink>
        </>
      )}
    >
      {formError && <FormAlert>{formError}</FormAlert>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        {isRegister && (
          <Field id="name" label="Nama" autoComplete="name" value={values.name} onChange={handleChange} error={errors.name} />
        )}
        <Field id="email" label="Email" type="email" autoComplete="email" value={values.email} onChange={handleChange} error={errors.email} />
        <div>
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            hint={isRegister ? 'Minimal 8 karakter.' : undefined}
          />
          {!isRegister && (
            <Link
              to={`/forgot-password${values.email ? `?email=${encodeURIComponent(values.email.trim())}` : ''}`}
              className="focus-ring mt-2 inline-block rounded text-sm font-semibold text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
            >
              Lupa password?
            </Link>
          )}
        </div>
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {isRegister ? 'Daftar' : 'Masuk'}
        </Button>
      </form>
    </AuthShell>
  )
}
