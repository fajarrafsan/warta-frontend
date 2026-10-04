import { useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getAuthor } from '../api/authorApi.js'
import { assetUrl } from '../api/client.js'
import FollowButton from '../components/authors/FollowButton.jsx'
import ArticleGrid from '../components/articles/ArticleGrid.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import useArticles from '../hooks/useArticles.js'
import useAsync from '../hooks/useAsync.js'
import useAuth from '../hooks/useAuth.js'
import usePageMeta from '../hooks/usePageMeta.js'
import { absoluteUrl } from '../seo/meta.js'
import { formatArticleDate, formatCount } from '../utils/articleUtils.js'

const PAGE_SIZE = 9

function Stat({ value, label }) {
  return (
    <div>
      <dd className="font-display text-3xl font-semibold tabular-nums text-text-primary">{formatCount(value)}</dd>
      <dt className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">{label}</dt>
    </div>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-strong">Tidak ditemukan</p>
      <h1 className="mt-3 font-display text-5xl font-semibold text-text-primary">Penulis tidak ditemukan</h1>
      <p className="mt-4 text-lg leading-8 text-text-secondary">Profil ini tidak ada atau belum punya tulisan.</p>
      <Link to="/" className="focus-ring mt-8 inline-flex min-h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-contrast">
        Kembali ke beranda
      </Link>
    </div>
  )
}

// AuthorPage adalah profil publik penulis beserta artikel terbitnya.
export default function AuthorPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)

  // Status "mengikuti" bergantung pada akun yang sedang login.
  const profile = useAsync(() => getAuthor(id), [id, user?.id])
  const [followState, setFollowState] = useState(null)
  const author = profile.data
  // Hasil tombol ikuti hanya berlaku untuk profil yang sedang dibuka.
  const latest = followState && author && followState.id === author.id ? followState : author
  const following = latest?.following
  const followers = latest?.follower_count

  const params = useMemo(() => ({ author: id, page, perPage: PAGE_SIZE }), [id, page])
  const { articles, meta, loading, error, refresh } = useArticles(params)

  usePageMeta(author ? {
    title: author.name,
    description: author.bio || `Tulisan ${author.name} di Warta.`,
    path: `/penulis/${author.id}`,
    image: author.avatar_url ? absoluteUrl(assetUrl(author.avatar_url), window.location.origin) : '',
  } : { title: 'Penulis', noindex: !profile.loading })

  if (profile.error?.status === 404) return <NotFound />
  if (profile.error) return <ErrorState error={profile.error} onRetry={profile.refresh} />
  if (!author) {
    return (
      <div className="flex items-center gap-6" role="status" aria-label="Memuat profil">
        <div className="size-28 animate-pulse rounded-full bg-bg-soft" />
        <div className="h-12 w-64 animate-pulse rounded bg-bg-soft" />
      </div>
    )
  }

  function changePage(nextPage) {
    setSearchParams({ page: String(nextPage) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="animate-fade-up space-y-12">
      <header className="border-b-2 border-text-primary pb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar name={author.name} src={author.avatar_url} size="xl" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-strong">Penulis</p>
            <h1 className="balanced-text mt-2 font-display text-5xl font-semibold tracking-[-0.03em] text-text-primary sm:text-6xl">
              {author.name}
            </h1>
            {author.bio && <p className="mt-3 max-w-2xl text-lg leading-8 text-text-secondary">{author.bio}</p>}
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-text-tertiary">
              <CalendarDays aria-hidden="true" size={15} />
              Bergabung {formatArticleDate(author.joined_at, { day: undefined, month: 'long' })}
            </p>
          </div>
          <FollowButton
            author={author}
            following={following}
            onChange={(state) => setFollowState({ id: author.id, ...state })}
          />
        </div>
        <dl className="mt-8 grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat value={author.article_count} label="Artikel" />
          <Stat value={followers} label="Pengikut" />
          <Stat value={author.view_count} label="Dibaca" />
          <Stat value={author.like_count} label="Suka" />
        </dl>
      </header>

      <section aria-labelledby="author-articles" className="space-y-8">
        <h2 id="author-articles" className="font-display text-2xl font-semibold text-text-primary">
          Tulisan {author.name.split(' ')[0]}
        </h2>
        <ArticleGrid articles={articles} loading={loading} error={error} onRetry={refresh} />
        <Pagination currentPage={page} totalPages={meta.total_pages} onPageChange={changePage} />
      </section>
    </div>
  )
}
