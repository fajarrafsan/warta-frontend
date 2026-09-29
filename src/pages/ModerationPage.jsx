import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { deleteComment, listReportedComments, moderateComment } from '../api/commentApi.js'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import useAsync from '../hooks/useAsync.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { formatArticleDate, REPORT_REASONS } from '../utils/articleUtils.js'

const reasonLabel = Object.fromEntries(REPORT_REASONS.map((reason) => [reason.value, reason.label]))

export default function ModerationPage() {
  useDocumentTitle('Moderasi')
  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const queue = useAsync(() => listReportedComments({ page }), [page])
  const items = queue.data?.data ?? []
  const meta = queue.data?.meta

  async function act(comment, action) {
    setBusy(`${action}-${comment.id}`)
    try {
      await moderateComment(comment.id, action)
      queue.refresh()
      toast.success(action === 'approve' ? 'Komentar ditampilkan kembali.' : 'Komentar disembunyikan.')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(null)
    }
  }

  async function confirmDelete(event) {
    event.preventDefault()
    setBusy(`delete-${pendingDelete.id}`)
    try {
      await deleteComment(pendingDelete.id)
      queue.refresh()
      toast.success('Komentar dihapus permanen.')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(null)
      setPendingDelete(null)
    }
  }

  return (
    <div className="animate-fade-up space-y-7">
      <PageHeader
        eyebrow="Admin"
        title="Moderasi"
        description="Komentar yang dilaporkan pembaca atau disembunyikan. Komentar tersembunyi tidak tampil ke publik sampai kamu tampilkan kembali."
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-bg-secondary shadow-card">
        {queue.loading && !queue.data ? (
          <div className="space-y-3 p-5" role="status" aria-label="Memuat antrean moderasi">
            {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-bg-soft" />)}
          </div>
        ) : queue.error ? (
          <div className="p-5"><ErrorState error={queue.error} onRetry={queue.refresh} /></div>
        ) : items.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="Tidak ada yang perlu ditinjau" description="Komentar yang dilaporkan pembaca akan muncul di sini." compact />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((comment) => (
              <li key={comment.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {comment.hidden ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                        <EyeOff aria-hidden="true" size={13} /> Tersembunyi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                        <Eye aria-hidden="true" size={13} /> Masih tampil
                      </span>
                    )}
                    <span className="font-semibold text-text-primary">{comment.reports} laporan</span>
                    {Object.entries(comment.reasons).filter(([, count]) => count > 0).map(([reason, count]) => (
                      <span key={reason} className="rounded-full bg-bg-soft px-2.5 py-1 text-text-secondary">
                        {reasonLabel[reason]} · {count}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap leading-7 text-text-primary">{comment.body}</p>
                  <p className="mt-2 text-xs text-text-tertiary">
                    <span className="font-medium text-text-secondary">{comment.author.name}</span>
                    {' di '}
                    <Link to={`/artikel/${comment.article.slug}#komentar`} className="focus-ring rounded font-medium text-text-secondary underline underline-offset-2 hover:text-text-primary">
                      {comment.article.title}
                    </Link>
                    {' · '}
                    {formatArticleDate(comment.created_at, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button size="sm" variant="secondary" loading={busy === `approve-${comment.id}`} disabled={Boolean(busy)} onClick={() => act(comment, 'approve')}>
                    Tampilkan
                  </Button>
                  {!comment.hidden && (
                    <Button size="sm" variant="secondary" loading={busy === `hide-${comment.id}`} disabled={Boolean(busy)} onClick={() => act(comment, 'hide')}>
                      Sembunyikan
                    </Button>
                  )}
                  <Button size="sm" variant="danger" disabled={Boolean(busy)} onClick={() => setPendingDelete(comment)}>
                    <Trash2 aria-hidden="true" size={15} /> Hapus
                  </Button>
                </div>
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

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Hapus komentar permanen?"
        description={`Komentar dari ${pendingDelete?.author.name} akan dihapus beserta laporannya.`}
        confirmLabel="Hapus"
        loading={busy === `delete-${pendingDelete?.id}`}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
