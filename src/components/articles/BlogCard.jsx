import { ArrowUpRight, CalendarDays, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatArticleDate } from '../../utils/articleUtils.js'

export default function BlogCard({ article, featured = false }) {
  return (
    <article className={`group relative overflow-hidden rounded-2xl border border-border bg-bg-secondary shadow-card transition duration-200 hover:border-text-tertiary hover:shadow-float ${featured ? 'md:col-span-2' : ''}`}>
      <div className={`relative overflow-hidden border-b border-border bg-bg-soft editorial-grid ${featured ? 'min-h-52 sm:min-h-64' : 'min-h-40'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,color-mix(in_srgb,var(--accent-color)_22%,transparent),transparent_42%)]" />
        <div className="absolute left-5 top-5 rounded-full border border-border bg-bg-secondary/90 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-accent-strong backdrop-blur">
          {article.category.name}
        </div>
        <span className="absolute bottom-[-0.18em] right-4 select-none font-display text-[9rem] font-semibold leading-none text-text-primary/5 sm:text-[12rem]" aria-hidden="true">
          {String(article.id).padStart(2, '0')}
        </span>
      </div>

      <div className={featured ? 'p-6 sm:p-8' : 'p-5 sm:p-6'}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-tertiary">
          <span className="inline-flex items-center gap-2">
            <CalendarDays aria-hidden="true" size={14} />
            <time dateTime={article.published_at}>{formatArticleDate(article.published_at, { month: 'long' })}</time>
          </span>
          <span>{article.author.name}</span>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare aria-hidden="true" size={13} />
            <span className="tabular-nums">{article.comment_count}</span>
            <span className="sr-only">komentar</span>
          </span>
        </div>
        <h2 className={`mt-4 balanced-text font-display font-semibold leading-[1.12] text-text-primary transition-colors duration-200 group-hover:text-accent-strong ${featured ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>
          {article.title}
        </h2>
        <p className="mt-4 leading-7 text-text-secondary">{article.excerpt}</p>
        {article.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tag">
            {article.tags.map((tag) => (
              <li key={tag.id} className="rounded-full bg-bg-soft px-2.5 py-1 text-xs font-medium text-text-secondary">
                #{tag.name}
              </li>
            ))}
          </ul>
        )}
        <Link
          to={`/preview/${article.slug}`}
          className="focus-ring mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg font-semibold text-text-primary transition-colors duration-200 hover:text-accent-strong"
          aria-label={`Baca artikel ${article.title}`}
        >
          Baca artikel
          <ArrowUpRight aria-hidden="true" size={17} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  )
}
