import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { logout, resetPassword } from '../api/authApi.js'
import AuthShell, { Field, FormAlert, TextLink } from '../components/auth/AuthShell.jsx'
import Button from '../components/ui/Button.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { sentence } from '../utils/text.js'

export default function ResetPasswordPage() {
  useDocumentTitle('Password baru')

  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const [values, setValues] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (values.password !== values.confirm) {
      setErrors({ confirm: 'Password tidak sama.' })
      return
    }

    setSubmitting(true)
    setErrors({})
    setFormError('')
    try {
      await resetPassword(token, values.password)
      // Backend mencabut semua sesi, termasuk yang ada di browser ini.
      await logout()
      toast.success('Password diganti. Silakan masuk dengan password baru.')
      navigate('/login', { replace: true })
    } catch (error) {
      const fields = error.fields || {}
      setErrors({ password: fields.new_password })
      setFormError(fields.token || (Object.keys(fields).length > 0 ? '' : error.message))
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <AuthShell title="Tautan tidak lengkap" back={{ to: '/login', label: 'Kembali ke halaman masuk' }}>
        <FormAlert>
          Tautan reset password ini tidak berisi token. Buka tautan langsung dari email, atau{' '}
          <TextLink to="/forgot-password">minta tautan baru</TextLink>.
        </FormAlert>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Buat password baru"
      description="Setelah diganti, semua sesi di perangkat lain akan keluar."
      back={{ to: '/login', label: 'Kembali ke halaman masuk' }}
    >
      {formError && (
        <FormAlert>
          {sentence(formError)} <TextLink to="/forgot-password">Minta tautan baru</TextLink>.
        </FormAlert>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <Field
          id="password"
          label="Password baru"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          hint="Minimal 8 karakter."
        />
        <Field
          id="confirm"
          label="Ulangi password baru"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={handleChange}
          error={errors.confirm}
        />
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Simpan password
        </Button>
      </form>
    </AuthShell>
  )
}
