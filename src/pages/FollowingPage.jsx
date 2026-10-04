import { useMemo, useState } from 'react'
import { Users } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { listFeed, listFollowing } from '../api/authorApi.js'
import FollowButton from '../components/authors/FollowButton.jsx'
import ArticleGrid from '../components/articles/ArticleGrid.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import useArticles from '../hooks/useArticles.js'
import useAsync from '../hooks/useAsync.js'
import useAuth from '../hooks/useAuth.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

const PAGE_SIZE = 12
const POPULAR = { sort: 'popular', perPage: 24 }

// Suggestions menawarkan penulis artikel terpopuler bagi yang belum mengikuti
// siapa pun.
function Suggestions({ exclude, onFollowed }) {
  const { user } = useAuth()
  const { articles } = useArticles(POPULAR)
  const authors = []
  for (const article of articles) {
    const author = article.author
    if (author.id !== user.id && !exclude.has(author.id) && !authors.some((a) => a.id === author.id)) authors.push(author)
  }
  if (authors.length === 0) return null

  return (
    <section aria-labelledby="suggested-authors" className="rounded-2xl border border-border bg-bg-secondary p-5 sm:p-6">
      <h2 id="suggested-authors" className="font-display text-xl font-semibold text-text-primary">Penulis yang mungkin kamu suka</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {authors.slice(0, 6).map((author) => (
          <li key={author.id} className="flex items-center gap-3">
            <Avatar name={author.name} src={author.avatar_url} />
            <Link to={`/penulis/${author.id}`} className="focus-ring min-w-0 flex-1 truncate rounded font-semibold text-text-primary hover:underline">
              {author.name}
            </Link>
            <FollowButton author={author} following={false} size="sm" onChange={onFollowed} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function FollowingPage() {
  useDocumentTitle('Mengikuti')
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)
  const [version, setVersion] = useState(0)

  const following = useAsync(() => listFollowing(), [version])
  const feedParams = useMemo(() => ({ page, perPage: PAGE_SIZE }), [page])
  const feed = useAsync(() => listFeed(feedParams), [feedParams, version])
  const authors = following.data?.data ?? []
  const followed = new Set(authors.map((author) => author.id))
  const refresh = () => setVersion((current) => current + 1)

  function changePage(nextPage) {
    setSearchParams({ page: String(nextPage) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="animate-fade-up space-y-10">
      <header className="border-b-2 border-text-primary pb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-strong">Untukmu</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.03em] text-text-primary sm:text-6xl">Mengikuti</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-text-secondary">Tulisan terbaru dari penulis yang kamu ikuti.</p>

        {authors.length > 0 && (
          <ul className="mt-6 flex gap-2 overflow-x-auto pb-1" aria-label="Penulis yang diikuti">
            {authors.map((author) => (
              <li key={author.id} className="shrink-0">
                <Link
                  to={`/penulis/${author.id}`}
                  className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-bg-secondary py-1 pl-1 pr-4 text-sm font-semibold text-text-secondary hover:text-text-primary"
                >
                  <Avatar name={author.name} src={author.avatar_url} size="sm" />
                  {author.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      {following.data && authors.length === 0 ? (
        <>
          <EmptyState
            icon={Users}
            title="Belum mengikuti siapa pun"
            description="Ikuti penulis dari halaman profil atau artikelnya, dan tulisan terbaru mereka akan berkumpul di sini."
            compact
          />
          <Suggestions exclude={followed} onFollowed={refresh} />
        </>
      ) : (
        <>
          <ArticleGrid
            articles={feed.data?.data ?? []}
            loading={!feed.data && feed.loading}
            error={feed.error}
            onRetry={feed.refresh}
            empty={<EmptyState title="Belum ada tulisan" description="Penulis yang kamu ikuti belum menerbitkan artikel." compact />}
          />
          <Pagination currentPage={page} totalPages={feed.data?.meta.total_pages ?? 0} onPageChange={changePage} />
        </>
      )}
    </div>
  )
}
