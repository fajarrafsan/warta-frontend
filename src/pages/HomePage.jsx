import { useMemo } from 'react'
import { Newspaper } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import StoryCard from '../components/articles/StoryCard.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import useArticles from '../hooks/useArticles.js'
import useAuth from '../hooks/useAuth.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { formatCount } from '../utils/articleUtils.js'

const PAGE_SIZE = 12
const POPULAR = { sort: 'popular', perPage: 5 }

function SectionTitle({ children, action }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b-2 border-text-primary pb-3">
      <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-text-primary">{children}</h2>
      {action}
    </div>
  )
}

function PopularList({ articles }) {
  return (
    <ol className="divide-y divide-border">
      {articles.map((article, index) => (
        <li key={article.id} className="group relative flex gap-4 py-4">
          <span className="font-display text-4xl font-semibold leading-none text-text-primary/20 tabular-nums">{index + 1}</span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold leading-snug text-text-primary group-hover:text-accent-strong">
              <Link to={`/artikel/${article.slug}`} className="focus-ring rounded after:absolute after:inset-0">{article.title}</Link>
            </h3>
            <p className="mt-1 text-xs text-text-tertiary">
              {formatCount(article.view_count)} dibaca · {formatCount(article.like_count)} suka
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function HomeSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" role="status" aria-label="Memuat artikel">
      <div className="space-y-5">
        <div className="aspect-[16/9] animate-pulse rounded-2xl bg-bg-soft" />
        <div className="h-10 w-4/5 animate-pulse rounded bg-bg-soft" />
        <div className="h-20 animate-pulse rounded bg-bg-soft" />
      </div>
      <div className="space-y-5">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-bg-soft" />)}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { canWrite } = useAuth()
  const popularMode = searchParams.get('sort') === 'popular'
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)
  useDocumentTitle(popularMode ? 'Terpopuler' : 'Kabar terkini')

  const params = useMemo(
    () => ({ page, perPage: PAGE_SIZE, sort: popularMode ? 'popular' : 'newest' }),
    [page, popularMode],
  )
  const latest = useArticles(params)
  const popular = useArticles(POPULAR)

  function changePage(nextPage) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (latest.loading) return <HomeSkeleton />
  if (latest.error) return <ErrorState error={latest.error} onRetry={latest.refresh} />

  if (latest.articles.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-bg-secondary">
        <EmptyState
          icon={Newspaper}
          title="Belum ada kabar"
          description="Artikel yang sudah terbit akan tampil di sini."
        >
          {canWrite && (
            <Link to="/studio/tulis" className="focus-ring inline-flex min-h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-contrast">
              Tulis artikel pertama
            </Link>
          )}
        </EmptyState>
      </div>
    )
  }

  const showHero = page === 1 && !popularMode
  const [lead, ...rest] = latest.articles
  const secondary = showHero ? rest.slice(0, 3) : []
  const grid = showHero ? rest.slice(3) : latest.articles

  return (
    <div className="animate-fade-up space-y-16">
      {showHero && (
        <section className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" aria-label="Sorotan">
          <StoryCard article={lead} variant="lead" />
          <div className="space-y-10">
            {secondary.length > 0 && (
              <div>
                <SectionTitle>Terkini</SectionTitle>
                <div className="mt-2 divide-y divide-border">
                  {secondary.map((article) => (
                    <div key={article.id} className="py-4"><StoryCard article={article} variant="row" /></div>
                  ))}
                </div>
              </div>
            )}
            {popular.articles.length > 0 && (
              <div>
                <SectionTitle action={<Link to="/?sort=popular" className="focus-ring rounded text-sm font-semibold text-text-secondary hover:text-text-primary">Lihat semua</Link>}>
                  Terpopuler
                </SectionTitle>
                <PopularList articles={popular.articles} />
              </div>
            )}
          </div>
        </section>
      )}

      {grid.length > 0 && (
        <section aria-label={popularMode ? 'Artikel terpopuler' : 'Artikel lainnya'}>
          <SectionTitle>{popularMode ? 'Terpopuler' : page === 1 ? 'Lainnya' : `Halaman ${page}`}</SectionTitle>
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {grid.map((article) => <StoryCard key={article.id} article={article} />)}
          </div>
        </section>
      )}

      {latest.meta.total_pages > 1 && (
        <Pagination currentPage={Math.min(page, latest.meta.total_pages)} totalPages={latest.meta.total_pages} onPageChange={changePage} />
      )}
    </div>
  )
}
