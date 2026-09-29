import { useEffect, useState } from 'react'
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api/authApi.js'
import AuthShell, { TextLink } from '../components/auth/AuthShell.jsx'
import useAuth from '../hooks/useAuth.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { sentence } from '../utils/text.js'

export default function VerifyEmailPage() {
  useDocumentTitle('Verifikasi email')

  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const { user } = useAuth()
  const [state, setState] = useState(() => (token ? { status: 'loading' } : { status: 'error', message: 'Tautan verifikasi tidak berisi token.' }))

  useEffect(() => {
    if (!token) return
    let active = true
    verifyEmail(token)
      .then((verified) => active && setState({ status: 'done', email: verified.email }))
      .catch((error) => active && setState({ status: 'error', message: error.fields?.token || error.message }))
    return () => {
      active = false
    }
  }, [token])

  const icon = {
    loading: <LoaderCircle aria-hidden="true" className="animate-spin text-text-tertiary" size={40} />,
    done: <CheckCircle2 aria-hidden="true" className="text-success" size={40} />,
    error: <XCircle aria-hidden="true" className="text-danger" size={40} />,
  }[state.status]

  return (
    <AuthShell
      title={{ loading: 'Memverifikasi email...', done: 'Email terverifikasi', error: 'Verifikasi gagal' }[state.status]}
      back={{ to: '/', label: 'Ke beranda' }}
    >
      <div className="mt-6 flex items-start gap-4" role={state.status === 'error' ? 'alert' : 'status'} aria-live="polite">
        <span className="shrink-0">{icon}</span>
        <p className="text-sm leading-6 text-text-secondary">
          {state.status === 'loading' && 'Sebentar, tautanmu sedang diperiksa.'}
          {state.status === 'done' && (
            <>
              <strong className="font-semibold text-text-primary">{state.email}</strong> sudah terverifikasi. Sekarang
              kamu bisa berkomentar. {!user && <TextLink to="/login">Masuk</TextLink>}
            </>
          )}
          {state.status === 'error' && (
            <>
              {sentence(state.message)}{' '}
              {user
                ? 'Minta tautan baru lewat tombol "Kirim ulang" di kolom komentar artikel mana pun.'
                : <>Masuk, lalu minta tautan baru dari kolom komentar. <TextLink to="/login">Masuk</TextLink></>}
            </>
          )}
        </p>
      </div>
    </AuthShell>
  )
}
