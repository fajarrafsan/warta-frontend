import { useState } from 'react'
import { ArrowLeft, History } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { createArticle, replaceArticle } from '../api/articleApi.js'
import ArticleForm from '../components/articles/ArticleForm.jsx'
import RevisionsDialog from '../components/studio/RevisionsDialog.jsx'
import Button from '../components/ui/Button.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import useArticle from '../hooks/useArticle.js'
import useCategories from '../hooks/useCategories.js'
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
  const categories = useCategories()
  const [historyOpen, setHistoryOpen] = useState(false)

  useDocumentTitle(isEditing ? 'Edit artikel' : 'Tulis artikel')

  async function saveArticle(payload) {
    const messages = isEditing ? {
      published: 'Artikel diperbarui dan dipublish.',
      scheduled: 'Artikel dijadwalkan terbit.',
      draft: 'Perubahan disimpan sebagai draft.',
    } : {
      published: 'Artikel berhasil dipublish.',
      scheduled: 'Artikel dijadwalkan terbit.',
      draft: 'Artikel disimpan sebagai draft.',
    }

    if (isEditing) {
      await replaceArticle(id, payload)
    } else {
      await createArticle(payload)
    }
    toast.success(messages[payload.status])

    navigate(`/studio/artikel?status=${payload.status}`)
  }

  const pageLoading = (isEditing && loading) || categories.loading
  const pageError = (isEditing && error) || categories.error

  return (
    <div className="animate-fade-up space-y-7">
      <Link
        to="/studio/artikel"
        className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-2 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:bg-bg-hover hover:text-text-primary"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Kembali ke daftar artikel
      </Link>

      <PageHeader
        eyebrow={isEditing ? `Artikel #${id}` : 'Artikel baru'}
        title={isEditing ? 'Edit artikel' : 'Tulis artikel'}
        description={isEditing
          ? 'Perbarui isi artikel lalu pilih Publish, Jadwalkan, atau simpan kembali sebagai Draft.'
          : 'Tulis artikel baru dan tentukan kapan artikel siap ditampilkan.'}
      >
        {isEditing && article && (
          <Button variant="secondary" onClick={() => setHistoryOpen(true)}>
            <History aria-hidden="true" size={18} />
            Riwayat
          </Button>
        )}
      </PageHeader>

      {isEditing && article && (
        <RevisionsDialog
          articleId={article.id}
          current={article}
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          onRestored={refresh}
        />
      )}

      {pageLoading ? (
        <EditorSkeleton />
      ) : pageError ? (
        <ErrorState
          error={pageError}
          onRetry={() => {
            refresh()
            categories.refresh()
          }}
        />
      ) : (
        <ArticleForm
          // Isian dimuat ulang setelah artikel dipulihkan dari riwayat.
          key={article ? `${article.id}-${article.updated_at}` : 'new'}
          categories={categories.categories}
          initialValues={article ? {
            title: article.title,
            content: article.content,
            category_id: String(article.category.id),
            tags: article.tags.map((tag) => tag.name).join(', '),
            cover_image: article.cover_image || '',
          } : undefined}
          currentStatus={article?.status}
          scheduledAt={article?.scheduled_at}
          onSubmit={saveArticle}
        />
      )}
    </div>
  )
}
