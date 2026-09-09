import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { createArticle, updateArticle } from '../api/articleApi.js'
import ArticleForm from '../components/articles/ArticleForm.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import useArticle from '../hooks/useArticle.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

function EditorSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]" role="status" aria-label="Memuat artikel">
      <div className="space-y-7 rounded-2xl border border-border bg-bg-secondary p-7">
        <div className="h-12 animate-pulse rounded-xl bg-bg-soft" />
        <div className="h-72 animate-pulse rounded-xl bg-bg-soft" />
        <div className="h-12 animate-pulse rounded-xl bg-bg-soft" />
      </div>
      <div className="h-80 animate-pulse rounded-2xl border border-border bg-bg-secondary" />
    </div>
  )
}

export default function ArticleEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const { article, loading, error, refresh } = useArticle(id)

  useDocumentTitle(isEditing ? 'Edit Article' : 'Add New')

  async function saveArticle(payload) {
    if (isEditing) {
      await updateArticle(id, payload)
      toast.success(payload.status === 'publish' ? 'Artikel diperbarui dan dipublish.' : 'Perubahan disimpan sebagai draft.')
    } else {
      await createArticle(payload)
      toast.success(payload.status === 'publish' ? 'Artikel berhasil dipublish.' : 'Artikel disimpan sebagai draft.')
    }

    navigate(`/posts?status=${payload.status}`)
  }

  return (
    <div className="animate-fade-up space-y-7">
      <Link
        to="/posts"
        className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-2 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:bg-bg-hover hover:text-text-primary"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Kembali ke All Posts
      </Link>

      <PageHeader
        eyebrow={isEditing ? `Article #${id}` : 'New article'}
        title={isEditing ? 'Edit Article' : 'Add New'}
        description={isEditing
          ? 'Perbarui isi artikel lalu pilih Publish atau simpan kembali sebagai Draft.'
          : 'Tulis artikel baru dan tentukan kapan artikel siap ditampilkan.'}
      />

      {isEditing && loading ? (
        <EditorSkeleton />
      ) : isEditing && error ? (
        <ErrorState error={error} onRetry={refresh} />
      ) : (
        <ArticleForm
          key={article?.id || 'new'}
          initialValues={article ? {
            title: article.title,
            content: article.content,
            category: article.category,
          } : undefined}
          currentStatus={article?.status}
          onSubmit={saveArticle}
        />
      )}
    </div>
  )
}

