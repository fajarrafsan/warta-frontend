import { useDeferredValue, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { listUsers, updateUserRole } from '../api/userApi.js'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import useAsync from '../hooks/useAsync.js'
import useAuth from '../hooks/useAuth.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { formatArticleDate, ROLE_LABELS } from '../utils/articleUtils.js'

const ROLES = ['admin', 'author', 'reader']

export default function UsersPage() {
  useDocumentTitle('Users')

  const { user: me } = useAuth()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [savingId, setSavingId] = useState(null)
  const q = useDeferredValue(search.trim())

  const params = useMemo(() => ({ q, role, page }), [q, role, page])
  const users = useAsync(() => listUsers(params), [params])
  const items = users.data?.data ?? []
  const meta = users.data?.meta

  async function changeRole(user, nextRole) {
    setSavingId(user.id)
    try {
      await updateUserRole(user.id, nextRole)
      users.refresh()
      toast.success(`${user.name} sekarang ${ROLE_LABELS[nextRole].toLowerCase()}. Perubahan berlaku setelah ia login ulang atau tokennya diperbarui.`)
    } catch (roleError) {
      toast.error(roleError.message)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="animate-fade-up space-y-7">
      <PageHeader
        eyebrow="Admin"
        title="Users"
        description="Akun baru selalu berperan pembaca. Jadikan penulis supaya bisa menulis artikel."
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-bg-secondary shadow-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Cari nama atau email</span>
            <Search aria-hidden="true" size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              className="focus-ring min-h-11 w-full rounded-xl border border-border bg-bg-primary py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary"
              placeholder="Cari nama atau email..."
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            Role
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value)
                setPage(1)
              }}
              className="focus-ring min-h-11 cursor-pointer rounded-xl border border-border bg-bg-primary px-3 text-sm text-text-primary"
            >
              <option value="">Semua</option>
              {ROLES.map((item) => <option key={item} value={item}>{ROLE_LABELS[item]}</option>)}
            </select>
          </label>
        </div>

        {users.loading && !users.data ? (
          <div className="space-y-3 p-5" role="status" aria-label="Memuat user">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-bg-soft" />)}
          </div>
        ) : users.error ? (
          <div className="p-5"><ErrorState error={users.error} onRetry={users.refresh} /></div>
        ) : items.length === 0 ? (
          <EmptyState title="Tidak ada user" description="Tidak ada akun yang cocok dengan pencarian ini." compact />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((user) => (
              <li key={user.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary">
                    {user.name}
                    {user.id === me.id && <span className="ml-2 text-xs font-medium text-text-tertiary">(kamu)</span>}
                  </p>
                  <p className="truncate text-sm text-text-tertiary">
                    {user.email} · bergabung {formatArticleDate(user.created_at)}
                  </p>
                </div>
                <label className="flex shrink-0 items-center gap-2 text-sm text-text-secondary">
                  <span className="sr-only">Role {user.name}</span>
                  <select
                    value={user.role}
                    disabled={user.id === me.id || savingId === user.id}
                    onChange={(event) => changeRole(user, event.target.value)}
                    className="focus-ring min-h-11 cursor-pointer rounded-xl border border-border bg-bg-primary px-3 text-sm text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    title={user.id === me.id ? 'Admin tidak bisa mengubah role akunnya sendiri' : undefined}
                  >
                    {ROLES.map((item) => <option key={item} value={item}>{ROLE_LABELS[item]}</option>)}
                  </select>
                </label>
              </li>
            ))}
          </ul>
        )}

        {meta && meta.total_pages > 1 && (
          <div className="border-t border-border p-4">
            <Pagination currentPage={page} totalPages={meta.total_pages} onPageChange={setPage} />
          </div>
        )}
      </section>
    </div>
  )
}
