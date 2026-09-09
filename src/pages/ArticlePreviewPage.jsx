import { ArrowLeft, CalendarDays, Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import ErrorState from '../components/ui/ErrorState.jsx'
import RouteLoading from '../components/ui/RouteLoading.jsx'
import useArticle from '../hooks/useArticle.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { formatArticleDate } from '../utils/articleUtils.js'

export default function ArticlePreviewPage() {
  const { id } = useParams()
  const { article, loading, error, refresh } = useArticle(id)
  useDocumentTitle(article?.title || 'Article Preview')

  if (loading) return <RouteLoading />
  if (error) return <ErrorState error={error} onRetry={refresh} />

  if (!article || article.status !== 'publish') {
    return (
      <div className="animate-fade-up mx-auto max-w-2xl rounded-2xl border border-border bg-bg-secondary p-8 text-center shadow-card sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-strong">Preview unavailable</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-text-primary">Artikel belum dipublish</h1>
        <p className="mt-4 leading-7 text-text-secondary">Artikel draft atau trashed tidak ditampilkan pada halaman publik.</p>
        <Link to="/preview" className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-contrast">
          <ArrowLeft aria-hidden="true" size={17} />
          Kembali ke Preview
        </Link>
      </div>
    )
  }

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
        <Link
          to={`/posts/${article.id}/edit`}
          className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-bg-secondary px-4 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:bg-bg-hover hover:text-text-primary"
        >
          <Pencil aria-hidden="true" size={16} />
          Edit
        </Link>
      </div>

      <header className="mt-8 border-b border-border pb-9 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-strong">{article.category}</p>
        <h1 className="balanced-text mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-text-primary sm:text-6xl">
          {article.title}
        </h1>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-text-tertiary">
          <CalendarDays aria-hidden="true" size={16} />
          <time dateTime={article.created_date}>{formatArticleDate(article.created_date, { month: 'long' })}</time>
        </div>
      </header>

      <div className="mx-auto max-w-3xl py-10">
        <div className="whitespace-pre-wrap font-display text-xl leading-9 text-text-secondary sm:text-[1.35rem]">
          {article.content}
        </div>
      </div>
    </article>
  )
}

