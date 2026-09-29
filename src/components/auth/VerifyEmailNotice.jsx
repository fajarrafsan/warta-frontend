import { useState } from 'react'
import { MailCheck } from 'lucide-react'
import { toast } from 'sonner'
import { resendVerification } from '../../api/authApi.js'
import useAuth from '../../hooks/useAuth.js'
import Button from '../ui/Button.jsx'

// VerifyEmailNotice tampil untuk akun yang emailnya belum terverifikasi, di
// tempat yang butuh verifikasi seperti kolom komentar.
export default function VerifyEmailNotice({ action = 'berkomentar' }) {
  const { user, refreshUser } = useAuth()
  const [sending, setSending] = useState(false)
  const [checking, setChecking] = useState(false)

  async function resend() {
    setSending(true)
    try {
      await resendVerification()
      toast.success(`Tautan verifikasi baru dikirim ke ${user.email}.`)
    } catch (error) {
      // 409: ternyata sudah terverifikasi, misalnya lewat perangkat lain.
      if (error.status === 409) {
        await refreshUser().catch(() => {})
      } else {
        toast.error(error.message)
      }
    } finally {
      setSending(false)
    }
  }

  async function recheck() {
    setChecking(true)
    try {
      const fresh = await refreshUser()
      if (!fresh.email_verified) toast.info('Email belum terverifikasi. Buka tautan di email terlebih dahulu.')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-border bg-bg-secondary p-5" role="status">
      <div className="flex gap-3">
        <MailCheck aria-hidden="true" className="mt-0.5 shrink-0 text-text-tertiary" size={20} />
        <div>
          <p className="font-semibold text-text-primary">Verifikasi email untuk {action}</p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Kami sudah mengirim tautan ke <strong className="font-semibold text-text-primary">{user.email}</strong>.
            Tidak menemukannya? Periksa folder spam atau kirim ulang.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" loading={sending} onClick={resend}>Kirim ulang tautan</Button>
            <Button size="sm" variant="secondary" loading={checking} onClick={recheck}>Sudah verifikasi</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
