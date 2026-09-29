import { LoaderCircle, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatArticleDate } from '../../utils/articleUtils.js'
import EmptyState from '../ui/EmptyState.jsx'
import StatusBadge from './StatusBadge.jsx'

function ActionButton({ label, children, onClick, disabled, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`focus-ring inline-flex size-11 cursor-pointer items-center justify-center rounded-xl border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${
        danger
          ? 'border-red-200 bg-red-50 text-danger hover:bg-red-100 dark:border-red-950 dark:bg-red-950/30 dark:hover:bg-red-950/60'
          : 'border-border bg-bg-secondary text-text-secondary hover:bg-bg-hover hover:text-text-primary'
      }`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  )
}

function RowActions({ article, busyId, onTrash, onRestore, onDelete }) {
  const isBusy = busyId === article.id

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        to={`/studio/artikel/${article.id}/edit`}
        className="focus-ring inline-flex size-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-bg-secondary text-text-secondary transition-colors duration-200 hover:bg-bg-hover hover:text-text-primary"
        aria-label={`Edit ${article.title}`}
        title="Edit artikel"
      >
        <Pencil aria-hidden="true" size={17} />
      </Link>

      {article.status === 'archived' && (
        <ActionButton
          label={`Pulihkan ${article.title} sebagai draft`}
          onClick={() => onRestore(article)}
          disabled={isBusy}
        >
          {isBusy ? <LoaderCircle aria-hidden="true" size={17} className="animate-spin" /> : <RotateCcw aria-hidden="true" size={17} />}
        </ActionButton>
      )}

      <ActionButton
        label={article.status === 'archived' ? `Hapus permanen ${article.title}` : `Pindahkan ${article.title} ke trash`}
        onClick={() => (article.status === 'archived' ? onDelete(article) : onTrash(article))}
        disabled={isBusy}
        danger
      >
        {isBusy ? <LoaderCircle aria-hidden="true" size={17} className="animate-spin" /> : <Trash2 aria-hidden="true" size={17} />}
      </ActionButton>
    </div>
  )
}

function DesktopTable({ articles, busyId, showAuthor, onTrash, onRestore, onDelete }) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-bg-soft/70 text-xs font-bold uppercase tracking-[0.12em] text-text-tertiary">
            <th scope="col" className="px-5 py-4">Title</th>
            <th scope="col" className="px-5 py-4">Category</th>
            <th scope="col" className="px-5 py-4">Status</th>
            <th scope="col" className="px-5 py-4">Updated</th>
            <th scope="col" className="px-5 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {articles.map((article) => (
            <tr key={article.id} className="group transition-colors duration-200 hover:bg-bg-hover/65">
              <td className="max-w-xl px-5 py-4">
                <Link
                  to={`/studio/artikel/${article.id}/edit`}
                  className="focus-ring line-clamp-2 cursor-pointer rounded font-semibold leading-6 text-text-primary transition-colors duration-200 hover:text-accent-strong"
                >
                  {article.title}
                </Link>
                <p className="mt-1 text-xs tabular-nums text-text-tertiary">
                  ID #{article.id}
                  {showAuthor && <span> · oleh {article.author.name}</span>}
                </p>
              </td>
              <td className="px-5 py-4 text-sm text-text-secondary">{article.category.name}</td>
              <td className="px-5 py-4"><StatusBadge status={article.status} /></td>
              <td className="whitespace-nowrap px-5 py-4 text-sm text-text-secondary">
                {formatArticleDate(article.updated_at)}
              </td>
              <td className="px-5 py-4">
                <RowActions
                  article={article}
                  busyId={busyId}
                  onTrash={onTrash}
                  onRestore={onRestore}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MobileCards({ articles, busyId, onTrash, onRestore, onDelete }) {
  return (
    <div className="divide-y divide-border md:hidden">
      {articles.map((article) => (
        <article key={article.id} className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <StatusBadge status={article.status} />
            <span className="text-xs tabular-nums text-text-tertiary">#{article.id}</span>
          </div>
          <Link
            to={`/studio/artikel/${article.id}/edit`}
            className="focus-ring mt-4 block cursor-pointer rounded font-display text-xl font-semibold leading-tight text-text-primary"
          >
            {article.title}
          </Link>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-text-tertiary">Category</dt>
              <dd className="mt-1 font-medium text-text-secondary">{article.category.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Updated</dt>
              <dd className="mt-1 font-medium text-text-secondary">{formatArticleDate(article.updated_at)}</dd>
            </div>
          </dl>
          <div className="mt-5 border-t border-border pt-4">
            <RowActions
              article={article}
              busyId={busyId}
              onTrash={onTrash}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          </div>
        </article>
      ))}
    </div>
  )
}

export function ArticleListSkeleton() {
  return (
    <div className="divide-y divide-border" role="status" aria-label="Memuat artikel">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="grid gap-3 p-5 md:grid-cols-[minmax(0,2fr)_1fr_120px_120px] md:items-center">
          <div className="h-5 w-4/5 animate-pulse rounded bg-bg-soft" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-bg-soft" />
          <div className="h-7 w-24 animate-pulse rounded-full bg-bg-soft" />
          <div className="h-4 w-20 animate-pulse rounded bg-bg-soft" />
        </div>
      ))}
    </div>
  )
}

export default function ArticleList({ articles, busyId, showAuthor = false, onTrash, onRestore, onDelete }) {
  if (articles.length === 0) {
    return (
      <EmptyState
        title="Belum ada artikel di sini"
        description="Artikel dengan status ini akan muncul pada daftar ini."
        compact
      />
    )
  }

  return (
    <>
      <DesktopTable
        articles={articles}
        busyId={busyId}
        showAuthor={showAuthor}
        onTrash={onTrash}
        onRestore={onRestore}
        onDelete={onDelete}
      />
      <MobileCards
        articles={articles}
        busyId={busyId}
        onTrash={onTrash}
        onRestore={onRestore}
        onDelete={onDelete}
      />
    </>
  )
}
