import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { forgotPassword } from '../api/authApi.js'
import AuthShell, { Field, FormAlert, TextLink } from '../components/auth/AuthShell.jsx'
import Button from '../components/ui/Button.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

export default function ForgotPasswordPage() {
  useDocumentTitle('Lupa password')

  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setFormError('')

    try {
      await forgotPassword(email.trim())
      setSentTo(email.trim())
    } catch (submitError) {
      setError(submitError.fields?.email || '')
      setFormError(submitError.fields?.email ? '' : submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Lupa password"
      description="Masukkan email akunmu. Kami kirim tautan untuk membuat password baru."
      footer={<>Sudah ingat? <TextLink to="/login">Masuk</TextLink></>}
      back={{ to: '/login', label: 'Kembali ke halaman masuk' }}
    >
      {sentTo ? (
        // Pesannya sama untuk email terdaftar dan tidak, mengikuti backend.
        <FormAlert tone="success">
          Bila <strong className="font-semibold">{sentTo}</strong> terdaftar, tautan reset password sudah dikirim ke
          sana dan berlaku 1 jam. Periksa juga folder spam.
        </FormAlert>
      ) : (
        <>
          {formError && <FormAlert>{formError}</FormAlert>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError('')
              }}
              error={error}
            />
            <Button type="submit" size="lg" loading={submitting} className="w-full">
              Kirim tautan reset
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  )
}
