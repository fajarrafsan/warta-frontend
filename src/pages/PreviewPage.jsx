import { useMemo } from 'react'
import { FilePlus2, Newspaper } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import BlogCard from '../components/articles/BlogCard.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import useArticles from '../hooks/useArticles.js'
import useAuth from '../hooks/useAuth.js'
import useCategories from '../hooks/useCategories.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

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

function CategoryChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`focus-ring min-h-10 shrink-0 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors duration-200 ${
        active
          ? 'border-brand bg-brand text-brand-contrast'
          : 'border-border bg-bg-secondary text-text-secondary hover:bg-bg-hover hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  )
}

export default function PreviewPage() {
  useDocumentTitle('Preview')

  const { canWrite } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const { categories } = useCategories()
  const category = searchParams.get('category') || ''
  const tag = searchParams.get('tag') || ''
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)

  const params = useMemo(
    () => ({ category, tag, page, perPage: PAGE_SIZE }),
    [category, tag, page],
  )
  const { articles, meta, loading, error, refresh } = useArticles(params)

  function updateParams(changes) {
    const nextParams = new URLSearchParams(searchParams)
    Object.entries(changes).forEach(([key, value]) => {
      if (value) nextParams.set(key, String(value))
      else nextParams.delete(key)
    })
    setSearchParams(nextParams)
  }

  function changePage(nextPage) {
    updateParams({ page: nextPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const usedCategories = categories.filter((item) => item.article_count > 0)

  return (
    <div className="animate-fade-up space-y-8">
      <PageHeader
        eyebrow="Public view"
        title="Preview"
        description="Tampilan blog yang dibaca audiens. Hanya artikel berstatus Published yang ditampilkan."
      >
        {canWrite && (
          <Link
            to="/posts/new"
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand bg-brand px-5 text-sm font-semibold text-brand-contrast transition-opacity duration-200 hover:opacity-90"
          >
            <FilePlus2 aria-hidden="true" size={18} />
            Tulis artikel
          </Link>
        )}
      </PageHeader>

      {usedCategories.length > 0 && (
        <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter category">
          <CategoryChip active={!category} onClick={() => updateParams({ category: '', page: '' })}>
            Semua
          </CategoryChip>
          {usedCategories.map((item) => (
            <CategoryChip
              key={item.id}
              active={category === item.slug}
              onClick={() => updateParams({ category: item.slug, page: '' })}
            >
              {item.name}
              <span className="ml-1.5 tabular-nums opacity-70">{item.article_count}</span>
            </CategoryChip>
          ))}
        </nav>
      )}

      {tag && (
        <p className="text-sm text-text-secondary">
          Menampilkan tag <span className="font-semibold text-text-primary">#{tag}</span>.{' '}
          <button
            type="button"
            onClick={() => updateParams({ tag: '', page: '' })}
            className="focus-ring cursor-pointer rounded font-semibold text-text-primary underline underline-offset-4"
          >
            Hapus filter
          </button>
        </p>
      )}

      {loading ? (
        <PreviewSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={refresh} />
      ) : articles.length === 0 ? (
        <div className="rounded-2xl border border-border bg-bg-secondary shadow-card">
          <EmptyState
            icon={Newspaper}
            title="Belum ada artikel published"
            description={category || tag
              ? 'Belum ada artikel terbit untuk filter ini.'
              : 'Artikel yang sudah dipublish akan tampil di sini.'}
          >
            {canWrite && (
              <Link
                to="/posts/new"
                className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-contrast"
              >
                Add New
              </Link>
            )}
          </EmptyState>
        </div>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Daftar artikel published">
            {articles.map((article, index) => (
              <BlogCard key={article.id} article={article} featured={index === 0 && page === 1} />
            ))}
          </section>

          <div className="border-t border-border pt-7">
            <Pagination
              currentPage={Math.min(page, meta.total_pages)}
              totalPages={meta.total_pages}
              onPageChange={changePage}
            />
          </div>
        </>
      )}
    </div>
  )
}
