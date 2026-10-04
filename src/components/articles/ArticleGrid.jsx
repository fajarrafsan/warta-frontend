import EmptyState from '../ui/EmptyState.jsx'
import ErrorState from '../ui/ErrorState.jsx'
import StoryCard from './StoryCard.jsx'

// ArticleGrid adalah grid kartu artikel dengan keadaan memuat, gagal, dan
// kosong. highlight diteruskan ke kartu untuk menyorot kata yang dicari.
export default function ArticleGrid({ articles, loading, error, onRetry, empty, highlight }) {
  if (loading) {
    return (
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Memuat artikel">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-[4/3] animate-pulse rounded-2xl bg-bg-soft" />)}
      </div>
    )
  }
  if (error) return <ErrorState error={error} onRetry={onRetry} />
  if (articles.length === 0) {
    return empty ?? <EmptyState title="Belum ada artikel" description="Belum ada artikel terbit di sini." compact />
  }
  return (
    <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => <StoryCard key={article.id} article={article} highlight={highlight} />)}
    </div>
  )
}
