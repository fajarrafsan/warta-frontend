import { useState } from 'react'
import { UserCheck, UserPlus } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { setFollow } from '../../api/authorApi.js'
import useAuth from '../../hooks/useAuth.js'
import Button from '../ui/Button.jsx'

// FollowButton mengikuti atau berhenti mengikuti penulis. onChange menerima
// { following, follower_count } dari backend.
export default function FollowButton({ author, following, onChange, size = 'md' }) {
  const { user } = useAuth()
  const location = useLocation()
  const [busy, setBusy] = useState(false)

  if (user?.id === author.id) return null

  if (!user) {
    return (
      <Link
        to={`/login?next=${encodeURIComponent(location.pathname)}`}
        className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-brand-contrast hover:opacity-90"
      >
        <UserPlus aria-hidden="true" size={16} />
        Ikuti
      </Link>
    )
  }

  async function toggle() {
    setBusy(true)
    try {
      const state = await setFollow(author.id, !following)
      onChange?.(state)
      toast.success(state.following ? `Kamu mengikuti ${author.name}.` : `Berhenti mengikuti ${author.name}.`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      size={size}
      variant={following ? 'secondary' : 'primary'}
      loading={busy}
      onClick={toggle}
      aria-pressed={following}
      className="rounded-full"
    >
      {!busy && (following ? <UserCheck aria-hidden="true" size={16} /> : <UserPlus aria-hidden="true" size={16} />)}
      {following ? 'Mengikuti' : 'Ikuti'}
    </Button>
  )
}
