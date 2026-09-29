import { ShieldAlert } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import EmptyState from './ui/EmptyState.jsx'

// RequireAuth meminta login, dan bila roles diisi, role tertentu.
export default function RequireAuth({ roles, children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="mx-auto my-12 max-w-2xl rounded-2xl border border-border bg-bg-secondary px-4 shadow-card">
        <EmptyState
          icon={ShieldAlert}
          title="Halaman ini bukan untuk role kamu"
          description={user.role === 'reader'
            ? 'Akun pembaca belum bisa menulis. Minta admin menjadikan akunmu penulis, lalu login ulang.'
            : 'Hanya admin yang bisa membuka halaman ini.'}
        >
          <Link
            to="/"
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-contrast"
          >
            Baca artikel
          </Link>
        </EmptyState>
      </div>
    )
  }

  return children
}
