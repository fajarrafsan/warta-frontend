import { useRef, useState } from 'react'
import { ExternalLink, ImagePlus, KeyRound, Trash2, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { uploadImage } from '../api/articleApi.js'
import { changePassword, logout, updateProfile } from '../api/authApi.js'
import { Field, FormAlert } from '../components/auth/AuthShell.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Button from '../components/ui/Button.jsx'
import useAuth from '../hooks/useAuth.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { ROLE_LABELS } from '../utils/articleUtils.js'
import { sentence } from '../utils/text.js'

const MAX_BIO = 300

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-border bg-bg-secondary p-5 shadow-card sm:p-7">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-bg-soft text-text-secondary">
          <Icon aria-hidden="true" size={19} />
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold text-text-primary">{title}</h2>
          {description && <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function ProfileForm() {
  const { user, canWrite } = useAuth()
  const fileRef = useRef(null)
  const [values, setValues] = useState({ name: user.name, bio: user.bio || '', avatar_url: user.avatar_url || '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function pickAvatar(file) {
    if (!file) return
    setUploading(true)
    setErrors((current) => ({ ...current, avatar_url: '' }))
    try {
      const url = await uploadImage(file)
      setValues((current) => ({ ...current, avatar_url: url }))
    } catch (error) {
      setErrors((current) => ({ ...current, avatar_url: error.fields?.image || error.message }))
    } finally {
      setUploading(false)
    }
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      await updateProfile({ name: values.name, bio: values.bio, avatar_url: values.avatar_url })
      toast.success('Profil disimpan.')
    } catch (error) {
      setErrors(error.fields || {})
      if (!Object.keys(error.fields || {}).length) toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-6" noValidate>
      <div className="flex flex-wrap items-center gap-5">
        <Avatar name={values.name} src={values.avatar_url} size="xl" />
        {canWrite ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
                {!uploading && <ImagePlus aria-hidden="true" size={16} />}
                {values.avatar_url ? 'Ganti foto' : 'Unggah foto'}
              </Button>
              {values.avatar_url && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setValues((current) => ({ ...current, avatar_url: '' }))}>
                  <Trash2 aria-hidden="true" size={16} />
                  Hapus foto
                </Button>
              )}
            </div>
            <p className="text-xs text-text-tertiary">JPEG, PNG, WebP, atau GIF. Foto persegi terlihat paling baik.</p>
            {errors.avatar_url && <p className="text-sm font-medium text-danger" role="alert">{sentence(errors.avatar_url)}</p>}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              tabIndex={-1}
              aria-label="Pilih foto profil"
              onChange={(event) => {
                pickAvatar(event.target.files?.[0])
                event.target.value = ''
              }}
            />
          </div>
        ) : (
          <p className="max-w-sm text-sm leading-6 text-text-secondary">
            Foto profil dan bio tampil di profil publik penulis. Admin bisa menjadikan akunmu penulis.
          </p>
        )}
      </div>

      <Field
        id="name"
        label="Nama"
        autoComplete="name"
        value={values.name}
        onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
        error={errors.name && sentence(errors.name)}
      />

      {canWrite && (
        <div>
          <div className="flex items-end justify-between gap-4">
            <label htmlFor="bio" className="text-sm font-semibold text-text-primary">Bio</label>
            <span className={`text-xs tabular-nums ${values.bio.length > MAX_BIO ? 'text-danger' : 'text-text-tertiary'}`}>
              {values.bio.length}/{MAX_BIO}
            </span>
          </div>
          <textarea
            id="bio"
            rows={3}
            value={values.bio}
            onChange={(event) => setValues((current) => ({ ...current, bio: event.target.value }))}
            placeholder="Satu atau dua kalimat tentang apa yang kamu tulis"
            aria-invalid={Boolean(errors.bio)}
            aria-describedby={errors.bio ? 'bio-error' : undefined}
            className="focus-ring mt-2 w-full resize-y rounded-xl border border-border bg-bg-primary px-4 py-3 text-base leading-7 text-text-primary placeholder:text-text-tertiary"
          />
          {errors.bio && <p id="bio-error" className="mt-2 text-sm font-medium text-danger" role="alert">{sentence(errors.bio)}</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={saving} disabled={uploading}>Simpan profil</Button>
        {canWrite && (
          <Link to={`/penulis/${user.id}`} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-text-secondary hover:text-text-primary">
            <ExternalLink aria-hidden="true" size={16} />
            Lihat profil publik
          </Link>
        )}
      </div>
    </form>
  )
}

function PasswordForm() {
  const navigate = useNavigate()
  const [values, setValues] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function change(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function save(event) {
    event.preventDefault()
    if (values.next !== values.confirm) {
      setErrors({ confirm: 'Password baru tidak sama.' })
      return
    }

    setSaving(true)
    setErrors({})
    try {
      await changePassword(values.current, values.next)
      // Backend mencabut semua sesi, termasuk yang ini.
      await logout()
      toast.success('Password diganti. Silakan masuk lagi dengan password baru.')
      navigate('/login', { replace: true })
    } catch (error) {
      const fields = error.fields || {}
      setErrors({ current: fields.current_password && sentence(fields.current_password), next: fields.new_password && sentence(fields.new_password) })
      if (!Object.keys(fields).length) toast.error(error.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-5" noValidate>
      <Field id="current" label="Password sekarang" type="password" autoComplete="current-password" value={values.current} onChange={change} error={errors.current} />
      <Field id="next" label="Password baru" type="password" autoComplete="new-password" value={values.next} onChange={change} error={errors.next} hint="Minimal 8 karakter." />
      <Field id="confirm" label="Ulangi password baru" type="password" autoComplete="new-password" value={values.confirm} onChange={change} error={errors.confirm} />
      <Button type="submit" loading={saving}>Ganti password</Button>
    </form>
  )
}

export default function AccountPage() {
  useDocumentTitle('Akun')
  const { user } = useAuth()

  return (
    <div className="animate-fade-up mx-auto max-w-3xl space-y-8">
      <header className="border-b-2 border-text-primary pb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-strong">{ROLE_LABELS[user.role]}</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.03em] text-text-primary">Akun</h1>
        <p className="mt-3 text-lg leading-8 text-text-secondary">
          {user.email}
          {user.email_verified === false && <span className="text-text-tertiary"> · belum diverifikasi</span>}
        </p>
      </header>

      <Section icon={UserRound} title="Profil" description="Nama tampil di artikel dan komentarmu.">
        <ProfileForm />
      </Section>

      <Section icon={KeyRound} title="Password" description="Setelah diganti, semua perangkat akan keluar dan perlu masuk lagi.">
        <PasswordForm />
      </Section>

      {user.email_verified === false && (
        <FormAlert>
          Email belum diverifikasi. Buka tautan di email pendaftaran, atau minta tautan baru dari kolom komentar artikel mana pun.
        </FormAlert>
      )}
    </div>
  )
}
