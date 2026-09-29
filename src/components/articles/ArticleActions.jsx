import { useState } from 'react'
import { Bookmark, Heart, Link2, MessageSquare } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { setBookmark, setLike } from '../../api/articleApi.js'
import useAuth from '../../hooks/useAuth.js'
import { formatCount } from '../../utils/articleUtils.js'

const buttonClass = 'focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50'

export default function ArticleActions({ article }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [state, setState] = useState({
    liked: article.liked,
    bookmarked: article.bookmarked,
    likeCount: article.like_count,
  })
  const [busy, setBusy] = useState('')
  const interactive = article.status === 'published'

  function requireLogin() {
    toast('Masuk dulu untuk menyukai atau menyimpan artikel.', {
      action: { label: 'Masuk', onClick: () => navigate(`/login?next=${encodeURIComponent(location.pathname)}`) },
    })
  }

  async function toggle(kind) {
    if (!user) {
      requireLogin()
      return
    }

    const nextValue = kind === 'like' ? !state.liked : !state.bookmarked
    setBusy(kind)
    try {
      const result = await (kind === 'like' ? setLike : setBookmark)(article.id, nextValue)
      setState({ liked: result.liked, bookmarked: result.bookmarked, likeCount: result.like_count })
      if (kind === 'bookmark') {
        toast.success(result.bookmarked ? 'Disimpan ke Tersimpan.' : 'Dihapus dari Tersimpan.')
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy('')
    }
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Tautan artikel disalin.')
    } catch {
      toast.error('Tautan belum bisa disalin dari browser ini.')
    }
  }

  const activeClass = 'border-accent-strong bg-accent/10 text-accent-strong'
  const idleClass = 'border-border bg-bg-secondary text-text-secondary hover:bg-bg-hover hover:text-text-primary'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => toggle('like')}
        disabled={!interactive || busy === 'like'}
        aria-pressed={state.liked}
        className={`${buttonClass} ${state.liked ? activeClass : idleClass}`}
      >
        <Heart aria-hidden="true" size={17} fill={state.liked ? 'currentColor' : 'none'} />
        <span className="tabular-nums">{formatCount(state.likeCount)}</span>
        <span className="sr-only">suka</span>
      </button>
      <button
        type="button"
        onClick={() => toggle('bookmark')}
        disabled={!interactive || busy === 'bookmark'}
        aria-pressed={state.bookmarked}
        className={`${buttonClass} ${state.bookmarked ? activeClass : idleClass}`}
      >
        <Bookmark aria-hidden="true" size={17} fill={state.bookmarked ? 'currentColor' : 'none'} />
        {state.bookmarked ? 'Tersimpan' : 'Simpan'}
      </button>
      <a href="#komentar" className={`${buttonClass} ${idleClass}`}>
        <MessageSquare aria-hidden="true" size={17} />
        <span className="tabular-nums">{formatCount(article.comment_count)}</span>
        <span className="sr-only">komentar</span>
      </a>
      <button type="button" onClick={share} className={`${buttonClass} ${idleClass}`}>
        <Link2 aria-hidden="true" size={17} />
        Salin tautan
      </button>
    </div>
  )
}
