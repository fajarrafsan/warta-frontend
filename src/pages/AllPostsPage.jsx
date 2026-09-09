import { useDeferredValue, useMemo, useState } from 'react'
import { FileClock, FilePlus2, Search, Trash2, CheckCircle2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { deleteArticle, toArticlePayload, updateArticle } from '../api/articleApi.js'
import ArticleList, { ArticleListSkeleton } from '../components/articles/ArticleList.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import useArticles from '../hooks/useArticles.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { ARTICLE_STATUS, sortByUpdatedDate, STATUS_TABS } from '../utils/articleUtils.js'

const statusIcons = {
  publish: CheckCircle2,
  draft: FileClock,
  thrash: Trash2,
}

export default function AllPostsPage() {
  useDocumentTitle('All Posts')

  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const { articles, loading, refreshing, error, refresh } = useArticles()
  const deferredSearch = useDeferredValue(search)

  const requestedStatus = searchParams.get('status')
  const activeStatus = STATUS_TABS.some((tab) => tab.key === requestedStatus)
    ? requestedStatus
    : ARTICLE_STATUS.PUBLISH

  const counts = useMemo(() => {
    return STATUS_TABS.reduce((result, tab) => {
      result[tab.key] = articles.filter((article) => article.status === tab.key).length
      return result
    }, {})
  }, [articles])

  const visibleArticles = useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase()

    return sortByUpdatedDate(
      articles.filter((article) => {
        const matchesStatus = article.status === activeStatus
        const matchesSearch = !keyword
          || article.title.toLowerCase().includes(keyword)
          || article.category.toLowerCase().includes(keyword)

        return matchesStatus && matchesSearch
      }),
    )
  }, [activeStatus, articles, deferredSearch])

  function changeStatus(status) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('status', status)
    setSearchParams(nextParams)
  }

  async function changeArticleStatus(article, nextStatus, successMessage = '') {
    setBusyId(article.id)

    try {
      await updateArticle(article.id, toArticlePayload(article, nextStatus))
      await refresh({ silent: true })
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
      await changeArticleStatus(article, ARTICLE_STATUS.THRASH)
      toast.success('Artikel dipindahkan ke Trashed.', {
        action: {
          label: 'Batalkan',
          onClick: async () => {
            try {
              await changeArticleStatus(article, article.status, 'Artikel berhasil dipulihkan.')
            } catch {
              // Error sudah ditampilkan oleh changeArticleStatus.
            }
          },
        },
      })
    } catch {
      // Error sudah ditampilkan oleh changeArticleStatus.
    }
  }

  async function restoreArticle(article) {
    try {
      await changeArticleStatus(article, ARTICLE_STATUS.DRAFT, 'Artikel dipulihkan sebagai Draft.')
    } catch {
      // Error sudah ditampilkan oleh changeArticleStatus.
    }
  }

  async function permanentlyDelete(event) {
    event.preventDefault()
    if (!pendingDelete) return

    setBusyId(pendingDelete.id)

    try {
      await deleteArticle(pendingDelete.id)
      await refresh({ silent: true })
      toast.success('Artikel dihapus permanen.')
      setPendingDelete(null)
    } catch (mutationError) {
      toast.error(mutationError.message || 'Artikel belum dapat dihapus.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="animate-fade-up space-y-7">
      <PageHeader
        eyebrow="Dashboard"
        title="All Posts"
        description="Kelola artikel published, draft, dan trashed dari satu tempat."
      >
        <Link
          to="/posts/new"
          className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand bg-brand px-5 text-sm font-semibold text-brand-contrast transition-opacity duration-200 hover:opacity-90"
        >
          <FilePlus2 aria-hidden="true" size={18} />
          Add New
        </Link>
      </PageHeader>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Ringkasan status artikel">
        {STATUS_TABS.map((tab) => {
          const Icon = statusIcons[tab.key]

          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => changeStatus(tab.key)}
              className={`focus-ring flex min-h-24 cursor-pointer items-center justify-between rounded-2xl border p-4 text-left transition duration-200 ${
                activeStatus === tab.key
                  ? 'border-text-primary bg-bg-secondary shadow-card'
                  : 'border-border bg-bg-secondary hover:border-text-tertiary hover:bg-bg-hover'
              }`}
              aria-pressed={activeStatus === tab.key}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-tertiary">{tab.label}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">{counts[tab.key] || 0}</p>
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
                onClick={() => changeStatus(tab.key)}
                className={`focus-ring relative min-h-11 shrink-0 cursor-pointer rounded-lg px-4 text-sm font-semibold transition-colors duration-200 ${
                  activeStatus === tab.key
                    ? 'bg-brand text-brand-contrast'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
              >
                {tab.label}
                <span className="ml-2 tabular-nums opacity-70">{counts[tab.key] || 0}</span>
              </button>
            ))}
          </div>

          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Cari berdasarkan title atau category</span>
            <Search aria-hidden="true" size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
          <div className="p-5"><ErrorState error={error} onRetry={refresh} /></div>
        ) : (
          <ArticleList
            articles={visibleArticles}
            busyId={busyId}
            onTrash={moveToTrash}
            onRestore={restoreArticle}
            onDelete={setPendingDelete}
          />
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Hapus artikel permanen?"
        description={`“${pendingDelete?.title || 'Artikel ini'}” akan dihapus dari database dan tidak dapat dipulihkan.`}
        loading={busyId === pendingDelete?.id}
        onConfirm={permanentlyDelete}
      />
    </div>
  )
}
