import { FilePlus2, Newspaper } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import BlogCard from '../components/articles/BlogCard.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import useArticles from '../hooks/useArticles.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { sortByUpdatedDate } from '../utils/articleUtils.js'

const PAGE_SIZE = 6

function PreviewSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Memuat preview artikel">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className={`overflow-hidden rounded-2xl border border-border bg-bg-secondary ${index === 0 ? 'md:col-span-2' : ''}`}>
          <div className="h-52 animate-pulse bg-bg-soft" />
          <div className="space-y-4 p-6">
            <div className="h-3 w-28 animate-pulse rounded bg-bg-soft" />
            <div className="h-8 w-4/5 animate-pulse rounded bg-bg-soft" />
            <div className="h-16 animate-pulse rounded bg-bg-soft" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PreviewPage() {
  useDocumentTitle('Preview')

  const [searchParams, setSearchParams] = useSearchParams()
  const { articles, loading, error, refresh } = useArticles()
  const publishedArticles = sortByUpdatedDate(
    articles.filter((article) => article.status === 'publish'),
  )
  const totalPages = Math.max(1, Math.ceil(publishedArticles.length / PAGE_SIZE))
  const requestedPage = Number.parseInt(searchParams.get('page') || '1', 10)
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const pageArticles = publishedArticles.slice(startIndex, startIndex + PAGE_SIZE)

  function changePage(page) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('page', String(page))
    setSearchParams(nextParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="animate-fade-up space-y-8">
      <PageHeader
        eyebrow="Public view"
        title="Preview"
        description="Lihat tampilan blog yang dibaca audiens. Hanya artikel berstatus Published yang ditampilkan."
      >
        <Link
          to="/posts/new"
          className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand bg-brand px-5 text-sm font-semibold text-brand-contrast transition-opacity duration-200 hover:opacity-90"
        >
          <FilePlus2 aria-hidden="true" size={18} />
          Tulis artikel
        </Link>
      </PageHeader>

      {loading ? (
        <PreviewSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={refresh} />
      ) : pageArticles.length === 0 ? (
        <div className="rounded-2xl border border-border bg-bg-secondary shadow-card">
          <EmptyState
            icon={Newspaper}
            title="Belum ada artikel published"
            description="Publish artikel pertama Anda agar tampil pada halaman Preview."
          >
            <Link
              to="/posts/new"
              className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-contrast"
            >
              Add New
            </Link>
          </EmptyState>
        </div>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Daftar artikel published">
            {pageArticles.map((article, index) => (
              <BlogCard key={article.id} article={article} featured={index === 0} />
            ))}
          </section>

          <div className="border-t border-border pt-7">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={changePage}
            />
          </div>
        </>
      )}
    </div>
  )
}

