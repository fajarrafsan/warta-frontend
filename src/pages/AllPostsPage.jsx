import { useDeferredValue, useMemo, useState } from 'react'
import { FileClock, FilePlus2, Search, Trash2, CheckCircle2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { changeArticleStatus, deleteArticle, listArticles } from '../api/articleApi.js'
import ArticleList, { ArticleListSkeleton } from '../components/articles/ArticleList.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import useArticles from '../hooks/useArticles.js'
import useAsync from '../hooks/useAsync.js'
import useAuth from '../hooks/useAuth.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { ARTICLE_STATUS, STATUS_TABS } from '../utils/articleUtils.js'

const PAGE_SIZE = 10

const statusIcons = {
  published: CheckCircle2,
  draft: FileClock,
  archived: Trash2,
}

// Admin melihat artikel semua penulis; author hanya artikelnya sendiri.
function fetchCounts(mine) {
  return Promise.all(
    STATUS_TABS.map((tab) => listArticles({ status: tab.key, perPage: 1 }, { mine })),
  ).then((results) => Object.fromEntries(
    STATUS_TABS.map((tab, index) => [tab.key, results[index].meta.total]),
  ))
}

export default function AllPostsPage() {
  useDocumentTitle('Artikel')

  const { isAdmin } = useAuth()
  const mine = !isAdmin
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const deferredSearch = useDeferredValue(search.trim())

  const requestedStatus = searchParams.get('status')
  const activeStatus = STATUS_TABS.some((tab) => tab.key === requestedStatus)
    ? requestedStatus
    : ARTICLE_STATUS.PUBLISHED
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)

  const params = useMemo(() => ({
    status: activeStatus,
    q: deferredSearch,
    sort: 'updated',
    page,
    perPage: PAGE_SIZE,
  }), [activeStatus, deferredSearch, page])

  const { articles, meta, loading, refreshing, error, refresh } = useArticles(params, { mine })
  const counts = useAsync(() => fetchCounts(mine), [mine])

  function refreshAll() {
    refresh()
    counts.refresh()
  }

  function updateParams(changes) {
    const nextParams = new URLSearchParams(searchParams)
    Object.entries(changes).forEach(([key, value]) => nextParams.set(key, String(value)))
    setSearchParams(nextParams)
  }

  function changeSearch(value) {
    setSearch(value)
    if (page !== 1) updateParams({ page: 1 })
  }

  async function setStatus(article, nextStatus, successMessage = '') {
    setBusyId(article.id)

    try {
      await changeArticleStatus(article.id, nextStatus)
      refreshAll()
      if (successMessage) toast.success(successMessage)
    } catch (mutationError) {
      toast.error(mutationError.message || 'Status artikel belum dapat diubah.')
      throw mutationError
    } finally {
      setBusyId(null)
    }
  }

  async function moveToTrash(article) {
    try {
      await setStatus(article, ARTICLE_STATUS.ARCHIVED)
      toast.success('Artikel dipindahkan ke Trashed.', {
        action: {
          label: 'Batalkan',
          onClick: async () => {
            try {
              await setStatus(article, article.status, 'Artikel berhasil dipulihkan.')
            } catch {
              // Error sudah ditampilkan oleh setStatus.
            }
          },
        },
      })
    } catch {
      // Error sudah ditampilkan oleh setStatus.
    }
  }

  async function restoreArticle(article) {
    try {
      await setStatus(article, ARTICLE_STATUS.DRAFT, 'Artikel dipulihkan sebagai Draft.')
    } catch {
      // Error sudah ditampilkan oleh setStatus.
    }
  }

  async function permanentlyDelete(event) {
    event.preventDefault()
    if (!pendingDelete) return

    setBusyId(pendingDelete.id)

    try {
      await deleteArticle(pendingDelete.id)
      refreshAll()
      toast.success('Artikel dihapus permanen.')
      setPendingDelete(null)
    } catch (mutationError) {
      toast.error(mutationError.message || 'Artikel belum dapat dihapus.')
    } finally {
      setBusyId(null)
    }
  }

  const countOf = (status) => counts.data?.[status] ?? 0

  return (
    <div className="animate-fade-up space-y-7">
      <PageHeader
        eyebrow="Ruang redaksi"
        title="Artikel"
        description={isAdmin
          ? 'Kelola artikel semua penulis: published, draft, dan trashed.'
          : 'Kelola artikel milikmu: published, draft, dan trashed.'}
      >
        <Link
          to="/studio/tulis"
          className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand bg-brand px-5 text-sm font-semibold text-brand-contrast transition-opacity duration-200 hover:opacity-90"
        >
          <FilePlus2 aria-hidden="true" size={18} />
          Tulis artikel
        </Link>
      </PageHeader>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Ringkasan status artikel">
        {STATUS_TABS.map((tab) => {
          const Icon = statusIcons[tab.key]

          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => updateParams({ status: tab.key, page: 1 })}
              className={`focus-ring flex min-h-24 cursor-pointer items-center justify-between rounded-2xl border p-4 text-left transition duration-200 ${
                activeStatus === tab.key
                  ? 'border-text-primary bg-bg-secondary shadow-card'
                  : 'border-border bg-bg-secondary hover:border-text-tertiary hover:bg-bg-hover'
              }`}
              aria-pressed={activeStatus === tab.key}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-tertiary">{tab.label}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">{countOf(tab.key)}</p>
              </div>
              <span className={`grid size-11 place-items-center rounded-xl ${activeStatus === tab.key ? 'bg-brand text-brand-contrast' : 'bg-bg-soft text-text-secondary'}`}>
                <Icon aria-hidden="true" size={20} />
              </span>
            </button>
          )
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-bg-secondary shadow-card">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex overflow-x-auto" role="tablist" aria-label="Status artikel">
            {STATUS_TABS.map((tab) => (
              <button
                type="button"
                role="tab"
                key={tab.key}
                aria-selected={activeStatus === tab.key}
                onClick={() => updateParams({ status: tab.key, page: 1 })}
                className={`focus-ring relative min-h-11 shrink-0 cursor-pointer rounded-lg px-4 text-sm font-semibold transition-colors duration-200 ${
                  activeStatus === tab.key
                    ? 'bg-brand text-brand-contrast'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
              >
                {tab.label}
                <span className="ml-2 tabular-nums opacity-70">{countOf(tab.key)}</span>
              </button>
            ))}
          </div>

          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Cari di judul atau isi artikel</span>
            <Search aria-hidden="true" size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="search"
              value={search}
              onChange={(event) => changeSearch(event.target.value)}
              className="focus-ring min-h-11 w-full rounded-xl border border-border bg-bg-primary py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary"
              placeholder="Cari artikel..."
            />
          </label>
        </div>

        {refreshing && (
          <div className="h-0.5 overflow-hidden bg-bg-soft" role="status" aria-label="Memperbarui data">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-accent" />
          </div>
        )}

        {loading ? (
          <ArticleListSkeleton />
        ) : error ? (
          <div className="p-5"><ErrorState error={error} onRetry={refreshAll} /></div>
        ) : (
          <ArticleList
            articles={articles}
            busyId={busyId}
            showAuthor={isAdmin}
            onTrash={moveToTrash}
            onRestore={restoreArticle}
            onDelete={setPendingDelete}
          />
        )}

        {meta.total_pages > 1 && (
          <div className="border-t border-border p-4">
            <Pagination
              currentPage={Math.min(page, meta.total_pages)}
              totalPages={meta.total_pages}
              onPageChange={(nextPage) => updateParams({ page: nextPage })}
            />
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Hapus artikel permanen?"
        description={`“${pendingDelete?.title || 'Artikel ini'}” beserta komentarnya akan dihapus dari database dan tidak dapat dipulihkan.`}
        loading={busyId === pendingDelete?.id}
        onConfirm={permanentlyDelete}
      />
    </div>
  )
}
