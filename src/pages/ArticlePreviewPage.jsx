import { ArrowLeft, CalendarDays, Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import CommentsSection from '../components/articles/CommentsSection.jsx'
import StatusBadge from '../components/articles/StatusBadge.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import RouteLoading from '../components/ui/RouteLoading.jsx'
import useArticle from '../hooks/useArticle.js'
import useAuth from '../hooks/useAuth.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { formatArticleDate } from '../utils/articleUtils.js'

function Unavailable() {
  return (
    <div className="animate-fade-up mx-auto max-w-2xl rounded-2xl border border-border bg-bg-secondary p-8 text-center shadow-card sm:p-12">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-strong">Tidak ditemukan</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-text-primary">Artikel tidak tersedia</h1>
      <p className="mt-4 leading-7 text-text-secondary">Artikel ini belum terbit, sudah diarsipkan, atau alamatnya salah.</p>
      <Link to="/preview" className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-contrast">
        <ArrowLeft aria-hidden="true" size={17} />
        Kembali ke Preview
      </Link>
    </div>
  )
}

export default function ArticlePreviewPage() {
  // ref bisa berupa slug atau id (tautan lama).
  const { ref } = useParams()
  const { user, isAdmin } = useAuth()
  const { article, loading, error, refresh } = useArticle(ref)
  useDocumentTitle(article?.title || 'Article Preview')

  if (loading) return <RouteLoading />
  if (error?.status === 404) return <Unavailable />
  if (error) return <ErrorState error={error} onRetry={refresh} />
  if (!article) return <Unavailable />

  const canEdit = isAdmin || (user?.id === article.author.id && user?.role === 'author')

  return (
    <article className="animate-fade-up mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/preview"
          className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-2 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:bg-bg-hover hover:text-text-primary"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Semua artikel
        </Link>
        {canEdit && (
          <Link
            to={`/posts/${article.id}/edit`}
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-bg-secondary px-4 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:bg-bg-hover hover:text-text-primary"
          >
            <Pencil aria-hidden="true" size={16} />
            Edit
          </Link>
        )}
      </div>

      {article.status !== 'published' && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200" role="note">
          <StatusBadge status={article.status} />
          Pratinjau ini hanya terlihat oleh penulis dan admin.
        </div>
      )}

      <header className="mt-8 border-b border-border pb-9 text-center">
        <Link
          to={`/preview?category=${article.category.slug}`}
          className="focus-ring rounded text-xs font-bold uppercase tracking-[0.2em] text-accent-strong"
        >
          {article.category.name}
        </Link>
        <h1 className="balanced-text mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-text-primary sm:text-6xl">
          {article.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-text-tertiary">
          <span className="font-medium text-text-secondary">{article.author.name}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays aria-hidden="true" size={16} />
            <time dateTime={article.published_at || article.created_at}>
              {formatArticleDate(article.published_at || article.created_at, { month: 'long' })}
            </time>
          </span>
        </div>
        {article.tags.length > 0 && (
          <ul className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Tag">
            {article.tags.map((tag) => (
              <li key={tag.id}>
                <Link
                  to={`/preview?tag=${tag.slug}`}
                  className="focus-ring inline-flex rounded-full bg-bg-soft px-3 py-1 text-xs font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
                >
                  #{tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="mx-auto max-w-3xl py-10">
        <div className="whitespace-pre-wrap font-display text-xl leading-9 text-text-secondary sm:text-[1.35rem]">
          {article.content}
        </div>
      </div>

      <CommentsSection article={article} />
    </article>
  )
}
