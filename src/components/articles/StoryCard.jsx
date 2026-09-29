import { Link } from 'react-router-dom'
import { formatArticleDate, readingLabel } from '../../utils/articleUtils.js'
import Cover from './Cover.jsx'

function Meta({ article }) {
  return (
    <p className="text-xs text-text-tertiary">
      <span className="font-medium text-text-secondary">{article.author.name}</span>
      <span aria-hidden="true"> · </span>
      <time dateTime={article.published_at}>{formatArticleDate(article.published_at)}</time>
      <span aria-hidden="true"> · </span>
      {readingLabel(article.reading_minutes)}
    </p>
  )
}

function Kicker({ article }) {
  return (
    <Link
      to={`/kategori/${article.category.slug}`}
      className="focus-ring relative z-10 rounded text-[11px] font-bold uppercase tracking-[0.18em] text-accent-strong hover:underline"
    >
      {article.category.name}
    </Link>
  )
}

// StoryCard punya tiga bentuk: lead (utama di beranda), row (daftar ringkas
// dengan gambar kecil), dan grid (kartu biasa).
export default function StoryCard({ article, variant = 'grid' }) {
  const href = `/artikel/${article.slug}`

  if (variant === 'lead') {
    return (
      <article className="group relative">
        <div className="aspect-[16/9] overflow-hidden rounded-2xl">
          <Cover article={article} eager className="transition-transform duration-500 group-hover:scale-[1.02]" />
        </div>
        <div className="mt-6 max-w-3xl">
          <Kicker article={article} />
          <h2 className="balanced-text mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-text-primary sm:text-5xl">
            <Link to={href} className="focus-ring rounded after:absolute after:inset-0">{article.title}</Link>
          </h2>
          <p className="mt-4 text-lg leading-8 text-text-secondary">{article.excerpt}</p>
          <div className="mt-4"><Meta article={article} /></div>
        </div>
      </article>
    )
  }

  if (variant === 'row') {
    return (
      <article className="group relative flex gap-4">
        <div className="min-w-0 flex-1">
          <Kicker article={article} />
          <h3 className="mt-1.5 font-display text-xl font-semibold leading-snug text-text-primary group-hover:text-accent-strong">
            <Link to={href} className="focus-ring rounded after:absolute after:inset-0">{article.title}</Link>
          </h3>
          <div className="mt-2"><Meta article={article} /></div>
        </div>
        <div className="size-24 shrink-0 overflow-hidden rounded-xl sm:size-28">
          <Cover article={article} />
        </div>
      </article>
    )
  }

  return (
    <article className="group relative flex flex-col">
      <div className="aspect-[4/3] overflow-hidden rounded-2xl">
        <Cover article={article} className="transition-transform duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="mt-4">
        <Kicker article={article} />
        <h3 className="balanced-text mt-2 font-display text-2xl font-semibold leading-tight text-text-primary group-hover:text-accent-strong">
          <Link to={href} className="focus-ring rounded after:absolute after:inset-0">{article.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 leading-7 text-text-secondary">{article.excerpt}</p>
        <div className="mt-3"><Meta article={article} /></div>
      </div>
    </article>
  )
}
