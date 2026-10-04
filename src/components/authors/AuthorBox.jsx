import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuthor } from '../../api/authorApi.js'
import useAsync from '../../hooks/useAsync.js'
import useAuth from '../../hooks/useAuth.js'
import { formatCount } from '../../utils/articleUtils.js'
import Avatar from '../ui/Avatar.jsx'
import FollowButton from './FollowButton.jsx'

// AuthorBox memperkenalkan penulis di akhir artikel, dengan tombol ikuti.
export default function AuthorBox({ authorId }) {
  const { user } = useAuth()
  const profile = useAsync(() => getAuthor(authorId), [authorId, user?.id])
  const [state, setState] = useState(null)
  const author = profile.data
  if (!author) return null

  const following = state ? state.following : author.following
  const followers = state ? state.follower_count : author.follower_count

  return (
    <aside aria-label="Tentang penulis" className="mt-10 flex flex-col gap-5 rounded-2xl border border-border bg-bg-secondary p-5 sm:flex-row sm:items-center sm:p-6">
      <Avatar name={author.name} src={author.avatar_url} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-tertiary">Ditulis oleh</p>
        <Link to={`/penulis/${author.id}`} className="focus-ring mt-1 inline-block rounded font-display text-2xl font-semibold text-text-primary hover:underline">
          {author.name}
        </Link>
        {author.bio && <p className="mt-1 leading-7 text-text-secondary">{author.bio}</p>}
        <p className="mt-1 text-sm text-text-tertiary">
          {formatCount(author.article_count)} artikel · {formatCount(followers)} pengikut
        </p>
      </div>
      <FollowButton author={author} following={following} onChange={setState} />
    </aside>
  )
}
