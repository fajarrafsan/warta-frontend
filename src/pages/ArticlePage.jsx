import { useEffect, useMemo } from 'react'
import { Eye, Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { recordView } from '../api/articleApi.js'
import ArticleActions from '../components/articles/ArticleActions.jsx'
import CommentsSection from '../components/articles/CommentsSection.jsx'
import Cover from '../components/articles/Cover.jsx'
import Markdown from '../components/articles/Markdown.jsx'
import StatusBadge from '../components/articles/StatusBadge.jsx'
import StoryCard from '../components/articles/StoryCard.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import useArticle from '../hooks/useArticle.js'
import useArticles from '../hooks/useArticles.js'
import useAuth from '../hooks/useAuth.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { formatArticleDate, formatCount, readingLabel } from '../utils/articleUtils.js'

function Unavailable() {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-strong">Tidak ditemukan</p>
      <h1 className="mt-3 font-display text-5xl font-semibold text-text-primary">Artikel tidak tersedia</h1>
      <p className="mt-4 text-lg leading-8 text-text-secondary">Artikel ini belum terbit, sudah diarsipkan, atau alamatnya salah.</p>
      <Link to="/" className="focus-ring mt-8 inline-flex min-h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-contrast">
        Kembali ke beranda
      </Link>
    </div>
  )
}

function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 text-center" role="status" aria-label="Memuat artikel">
      <div className="mx-auto h-3 w-24 animate-pulse rounded bg-bg-soft" />
      <div className="mx-auto h-14 w-4/5 animate-pulse rounded bg-bg-soft" />
      <div className="aspect-[16/9] animate-pulse rounded-3xl bg-bg-soft" />
    </div>
  )
}

function Related({ article }) {
  const params = useMemo(() => ({ category: article.category.slug, perPage: 4 }), [article.category.slug])
  const { articles } = useArticles(params)
  const related = articles.filter((item) => item.id !== article.id).slice(0, 3)
  if (related.length === 0) return null

  return (
    <section className="mt-20" aria-labelledby="related-title">
      <h2 id="related-title" className="border-b-2 border-text-primary pb-3 font-display text-2xl font-semibold text-text-primary">
        Lainnya di {article.category.name}
      </h2>
      <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((item) => <StoryCard key={item.id} article={item} />)}
      </div>
    </section>
  )
}

export default function ArticlePage() {
  const { ref } = useParams()
  const { user, isAdmin } = useAuth()
  const { article, loading, error, refresh } = useArticle(ref)
  useDocumentTitle(article?.title || 'Artikel')

  const articleId = article?.id
  const published = article?.status === 'published'
  useEffect(() => {
    if (articleId && published) recordView(articleId)
  }, [articleId, published])

  if (loading && !article) return <ArticleSkeleton />
  if (error?.status === 404) return <Unavailable />
  if (error) return <ErrorState error={error} onRetry={refresh} />
  if (!article) return <Unavailable />

  const canEdit = isAdmin || (user?.id === article.author.id && user?.role === 'author')

  return (
    <article className="animate-fade-up">
      {article.status !== 'published' && (
        <div className="mx-auto mb-8 flex max-w-3xl flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200" role="note">
          <StatusBadge status={article.status} />
          Pratinjau ini hanya terlihat oleh penulis dan admin.
        </div>
      )}

      <header className="mx-auto max-w-3xl text-center">
        <Link to={`/kategori/${article.category.slug}`} className="focus-ring rounded text-[11px] font-bold uppercase tracking-[0.2em] text-accent-strong hover:underline">
          {article.category.name}
        </Link>
        <h1 className="balanced-text mt-4 font-display text-4xl font-semibold leading-[1.04] tracking-[-0.03em] text-text-primary sm:text-6xl">
          {article.title}
        </h1>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-text-tertiary">
          <span className="flex items-center gap-2 font-medium text-text-secondary">
            <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-brand text-xs font-bold uppercase text-brand-contrast">
              {article.author.name.charAt(0)}
            </span>
            {article.author.name}
          </span>
          <time dateTime={article.published_at || article.created_at}>
            {formatArticleDate(article.published_at || article.created_at, { month: 'long' })}
          </time>
          <span>{readingLabel(article.reading_minutes)}</span>
          <span className="inline-flex items-center gap-1.5">
            <Eye aria-hidden="true" size={15} />
            {formatCount(article.view_count)} dibaca
          </span>
          {canEdit && (
            <Link to={`/studio/artikel/${article.id}/edit`} className="focus-ring inline-flex items-center gap-1.5 rounded font-semibold text-text-primary hover:underline">
              <Pencil aria-hidden="true" size={14} /> Edit
            </Link>
          )}
        </div>
      </header>

      {article.cover_image && (
        <div className="mx-auto mt-10 aspect-[16/9] max-w-5xl overflow-hidden rounded-3xl">
          <Cover article={article} eager />
        </div>
      )}

      <div className="mx-auto mt-12 max-w-2xl">
        <Markdown className="dropcap">{article.content}</Markdown>

        {article.tags.length > 0 && (
          <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tag">
            {article.tags.map((tag) => (
              <li key={tag.id}>
                <Link to={`/tag/${tag.slug}`} className="focus-ring inline-flex rounded-full border border-border bg-bg-secondary px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary">
                  #{tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 border-y border-border py-5">
          <ArticleActions key={article.id} article={article} />
        </div>

        <div id="komentar">
          <CommentsSection article={article} />
        </div>
      </div>

      <Related article={article} />
    </article>
  )
}
