import { useMemo, useState } from 'react'
import { Bookmark, Search } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { listBookmarks } from '../api/articleApi.js'
import ArticleGrid from '../components/articles/ArticleGrid.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import useArticles from '../hooks/useArticles.js'
import useAsync from '../hooks/useAsync.js'
import useCategories from '../hooks/useCategories.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import usePageMeta from '../hooks/usePageMeta.js'
import { searchTerms } from '../utils/search.js'

const PAGE_SIZE = 12

const SEARCH_SORTS = [
  { value: '', label: 'Paling relevan' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'popular', label: 'Terpopuler' },
]

function SearchForm({ initial, onSubmit }) {
  const [value, setValue] = useState(initial)
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(value.trim())
      }}
      role="search"
      className="relative mt-6 max-w-xl"
    >
      <label htmlFor="search-page" className="sr-only">Kata kunci</label>
      <Search aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
      <input
        id="search-page"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Kata kunci di judul atau isi"
        className="focus-ring min-h-12 w-full rounded-full border border-border bg-bg-secondary pl-11 pr-4 text-base text-text-primary placeholder:text-text-tertiary"
      />
    </form>
  )
}

function Header({ eyebrow, title, description, children }) {
  return (
    <header className="border-b-2 border-text-primary pb-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-strong">{eyebrow}</p>
      <h1 className="balanced-text mt-3 font-display text-5xl font-semibold tracking-[-0.03em] text-text-primary sm:text-6xl">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-lg leading-8 text-text-secondary">{description}</p>}
      {children}
    </header>
  )
}

// ListingPage menampilkan artikel terbit per kategori, per tag, atau hasil
// pencarian, dengan paging dari backend.
export default function ListingPage({ mode }) {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { categories } = useCategories()
  const q = (searchParams.get('q') || '').trim()
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)
  const sort = SEARCH_SORTS.some((option) => option.value === searchParams.get('sort')) ? searchParams.get('sort') : ''

  const params = useMemo(() => ({
    category: mode === 'category' ? slug : '',
    tag: mode === 'tag' ? slug : '',
    q: mode === 'search' ? q : '',
    // Tanpa sort, pencarian diurutkan menurut relevansi oleh backend.
    sort: mode === 'search' ? sort : '',
    page,
    perPage: PAGE_SIZE,
  }), [mode, slug, q, sort, page])
  const terms = useMemo(() => (mode === 'search' ? searchTerms(q) : undefined), [mode, q])

  const skip = mode === 'search' && !q
  const { articles, meta, loading, error, refresh } = useArticles(skip ? { ...params, perPage: 1 } : params)
  const category = categories.find((item) => item.slug === slug)

  const title = mode === 'category' ? (category?.name || slug)
    : mode === 'tag' ? `#${slug}`
      : q ? `“${q}”` : 'Cari artikel'
  usePageMeta(mode === 'category' ? {
    title,
    description: category?.description || `Artikel dalam kategori ${title} di Warta.`,
    path: `/kategori/${encodeURIComponent(slug)}`,
  } : mode === 'tag' ? {
    title,
    description: `Artikel bertag ${slug} di Warta.`,
    path: `/tag/${encodeURIComponent(slug)}`,
  } : { title: 'Cari', noindex: true })

  function changePage(nextPage) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function submitSearch(value) {
    setSearchParams(value ? { q: value, ...(sort && { sort }) } : {})
  }

  function changeSort(value) {
    setSearchParams({ q, ...(value && { sort: value }) })
  }

  return (
    <div className="animate-fade-up space-y-10">
      <Header
        eyebrow={mode === 'category' ? 'Kategori' : mode === 'tag' ? 'Tag' : 'Pencarian'}
        title={title}
        description={mode === 'category' ? category?.description
          : mode === 'search' && q && !loading ? `${meta.total} artikel ditemukan.` : undefined}
      >
        {mode === 'search' && (
          <>
            {/* key: isian ikut berganti saat pencarian dimulai dari header. */}
            <SearchForm key={q} initial={q} onSubmit={submitSearch} />
            {q && (
              <div className="mt-5 flex flex-wrap rounded-xl border border-border bg-bg-secondary p-1 sm:inline-flex" role="group" aria-label="Urutkan hasil">
                {SEARCH_SORTS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => changeSort(option.value)}
                    aria-pressed={sort === option.value}
                    className={`focus-ring min-h-9 cursor-pointer rounded-lg px-4 text-sm font-semibold ${sort === option.value ? 'bg-brand text-brand-contrast' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </Header>

      {!skip && (
        <ArticleGrid
          articles={articles}
          loading={loading}
          error={error}
          onRetry={refresh}
          highlight={terms}
          empty={<EmptyState title="Belum ada artikel" description={mode === 'search'
            ? 'Coba kata lain atau lebih sedikit kata; semua kata harus ada di artikel.'
            : 'Belum ada artikel terbit yang cocok.'} compact />}
        />
      )}

      {!skip && meta.total_pages > 1 && (
        <Pagination currentPage={Math.min(page, meta.total_pages)} totalPages={meta.total_pages} onPageChange={changePage} />
      )}
    </div>
  )
}

export function BookmarksPage() {
  useDocumentTitle('Tersimpan')
  const [page, setPage] = useState(1)
  const result = useAsync(() => listBookmarks({ page, perPage: PAGE_SIZE }), [page])
  const articles = result.data?.data ?? []
  const meta = result.data?.meta

  return (
    <div className="animate-fade-up space-y-10">
      <Header eyebrow="Koleksi pribadi" title="Tersimpan" description="Artikel yang kamu simpan untuk dibaca nanti." />
      <ArticleGrid
        articles={articles}
        loading={result.loading && !result.data}
        error={result.error}
        onRetry={result.refresh}
        empty={(
          <EmptyState icon={Bookmark} title="Belum ada yang disimpan" description="Tekan Simpan di halaman artikel untuk mengumpulkannya di sini." compact>
            <Link to="/" className="focus-ring inline-flex min-h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-contrast">
              Jelajahi artikel
            </Link>
          </EmptyState>
        )}
      />
      {meta && meta.total_pages > 1 && <Pagination currentPage={page} totalPages={meta.total_pages} onPageChange={setPage} />}
    </div>
  )
}
