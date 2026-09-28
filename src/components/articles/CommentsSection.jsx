import { useState } from 'react'
import { MessageSquare, Trash2 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { createComment, deleteComment, listComments } from '../../api/commentApi.js'
import useAsync from '../../hooks/useAsync.js'
import useAuth from '../../hooks/useAuth.js'
import { formatArticleDate } from '../../utils/articleUtils.js'
import Button from '../ui/Button.jsx'

const PER_PAGE = 20

export default function CommentsSection({ article }) {
  const { user, isAdmin } = useAuth()
  const location = useLocation()
  const [pages, setPages] = useState(1)
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Memuat halaman 1 sampai `pages` sekaligus, supaya "Muat lebih banyak" dan
  // refresh setelah menulis komentar memakai satu jalur.
  const comments = useAsync(async () => {
    const results = await Promise.all(
      Array.from({ length: pages }, (_, index) => listComments(article.id, { page: index + 1, perPage: PER_PAGE })),
    )
    return { items: results.flatMap((result) => result.data), meta: results.at(-1).meta }
  }, [article.id, pages])

  const items = comments.data?.items ?? []
  const total = comments.data?.meta.total ?? article.comment_count
  const hasMore = comments.data && pages < comments.data.meta.total_pages

  async function submit(event) {
    event.preventDefault()
    const text = body.trim()
    if (!text) {
      setError('Komentar tidak boleh kosong.')
      return
    }

    setSending(true)
    setError('')
    try {
      await createComment(article.id, text)
      setBody('')
      comments.refresh()
    } catch (submitError) {
      setError(submitError.fields?.body || submitError.message)
    } finally {
      setSending(false)
    }
  }

  async function remove(comment) {
    setDeletingId(comment.id)
    try {
      await deleteComment(comment.id)
      comments.refresh()
      toast.success('Komentar dihapus.')
    } catch (removeError) {
      toast.error(removeError.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="mx-auto max-w-3xl border-t border-border py-10" aria-labelledby="comments-title">
      <h2 id="comments-title" className="flex items-center gap-2 font-display text-2xl font-semibold text-text-primary">
        <MessageSquare aria-hidden="true" size={22} />
        Komentar <span className="tabular-nums text-text-tertiary">({total})</span>
      </h2>

      {article.status !== 'published' ? (
        <p className="mt-4 text-sm text-text-secondary">Komentar dibuka setelah artikel terbit.</p>
      ) : user ? (
        <form onSubmit={submit} className="mt-6" noValidate>
          <label htmlFor="comment-body" className="sr-only">Tulis komentar</label>
          <textarea
            id="comment-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={2000}
            className="focus-ring min-h-28 w-full resize-y rounded-xl border border-border bg-bg-primary px-4 py-3 text-base leading-7 text-text-primary placeholder:text-text-tertiary"
            placeholder={`Tulis komentar sebagai ${user.name}...`}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'comment-error' : undefined}
          />
          {error && <p id="comment-error" className="mt-2 text-sm font-medium text-danger" role="alert">{error}</p>}
          <div className="mt-3 flex justify-end">
            <Button type="submit" loading={sending}>Kirim komentar</Button>
          </div>
        </form>
      ) : (
        <p className="mt-4 text-sm text-text-secondary">
          <Link
            to={`/login?next=${encodeURIComponent(location.pathname)}`}
            className="focus-ring rounded font-semibold text-text-primary underline underline-offset-4"
          >
            Masuk
          </Link>{' '}
          untuk ikut berkomentar.
        </p>
      )}

      {comments.error && <p className="mt-6 text-sm text-danger" role="alert">{comments.error.message}</p>}

      <ol className="mt-8 space-y-5">
        {items.map((comment) => {
          const canDelete = user && (user.id === comment.author.id || isAdmin)
          return (
            <li key={comment.id} className="rounded-2xl border border-border bg-bg-secondary p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{comment.author.name}</p>
                  <time dateTime={comment.created_at} className="text-xs text-text-tertiary">
                    {formatArticleDate(comment.created_at, { month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    loading={deletingId === comment.id}
                    onClick={() => remove(comment)}
                    aria-label={`Hapus komentar ${comment.author.name}`}
                    title="Hapus komentar"
                  >
                    {deletingId !== comment.id && <Trash2 aria-hidden="true" size={17} />}
                  </Button>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-text-secondary">{comment.body}</p>
            </li>
          )
        })}
      </ol>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" loading={comments.loading} onClick={() => setPages((current) => current + 1)}>
            Muat lebih banyak
          </Button>
        </div>
      )}
    </section>
  )
}
