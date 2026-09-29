import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { createCategory, deleteCategory, updateCategory } from '../api/taxonomyApi.js'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import useCategories from '../hooks/useCategories.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

const inputClass = 'focus-ring min-h-11 w-full rounded-xl border border-border bg-bg-primary px-4 text-sm text-text-primary placeholder:text-text-tertiary hover:border-text-tertiary'

function CategoryFields({ values, errors, onChange, idPrefix }) {
  return (
    <>
      <div className="min-w-0 flex-1">
        <label htmlFor={`${idPrefix}-name`} className="sr-only">Nama category</label>
        <input
          id={`${idPrefix}-name`}
          value={values.name}
          onChange={(event) => onChange({ ...values, name: event.target.value })}
          className={inputClass}
          placeholder="Nama, misalnya Teknologi"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && <p className="mt-1.5 text-sm text-danger" role="alert">{errors.name}</p>}
      </div>
      <div className="min-w-0 flex-[2]">
        <label htmlFor={`${idPrefix}-description`} className="sr-only">Deskripsi</label>
        <input
          id={`${idPrefix}-description`}
          value={values.description}
          onChange={(event) => onChange({ ...values, description: event.target.value })}
          className={inputClass}
          placeholder="Deskripsi singkat (opsional)"
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description && <p className="mt-1.5 text-sm text-danger" role="alert">{errors.description}</p>}
      </div>
    </>
  )
}

export default function CategoriesPage() {
  useDocumentTitle('Kategori')

  const { categories, loading, error, refresh } = useCategories()
  const [draft, setDraft] = useState({ name: '', description: '' })
  const [draftErrors, setDraftErrors] = useState({})
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editErrors, setEditErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function create(event) {
    event.preventDefault()
    setCreating(true)
    setDraftErrors({})

    try {
      const category = await createCategory(draft)
      setDraft({ name: '', description: '' })
      refresh()
      toast.success(`Category ${category.name} dibuat.`)
    } catch (createError) {
      setDraftErrors(createError.fields)
      if (Object.keys(createError.fields).length === 0) toast.error(createError.message)
    } finally {
      setCreating(false)
    }
  }

  async function saveEdit(event) {
    event.preventDefault()
    setSaving(true)
    setEditErrors({})

    try {
      await updateCategory(editing.id, { name: editing.name, description: editing.description })
      setEditing(null)
      refresh()
      toast.success('Category diperbarui.')
    } catch (saveError) {
      setEditErrors(saveError.fields)
      if (Object.keys(saveError.fields).length === 0) toast.error(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete(event) {
    event.preventDefault()
    setDeleting(true)

    try {
      await deleteCategory(pendingDelete.id)
      refresh()
      toast.success('Category dihapus.')
    } catch (deleteError) {
      toast.error(deleteError.message)
    } finally {
      setDeleting(false)
      setPendingDelete(null)
    }
  }

  return (
    <div className="animate-fade-up space-y-7">
      <PageHeader
        eyebrow="Admin"
        title="Kategori"
        description="Setiap artikel masuk ke satu category. Category yang masih dipakai artikel tidak bisa dihapus."
      />

      <form onSubmit={create} className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-secondary p-4 shadow-card sm:flex-row sm:items-start sm:p-5" noValidate>
        <CategoryFields values={draft} errors={draftErrors} onChange={setDraft} idPrefix="new" />
        <Button type="submit" loading={creating} className="shrink-0">
          {!creating && <Plus aria-hidden="true" size={18} />}
          Tambah
        </Button>
      </form>

      <section className="overflow-hidden rounded-2xl border border-border bg-bg-secondary shadow-card">
        {loading && categories.length === 0 ? (
          <div className="space-y-3 p-5" role="status" aria-label="Memuat category">
            {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-10 animate-pulse rounded-xl bg-bg-soft" />)}
          </div>
        ) : error ? (
          <div className="p-5"><ErrorState error={error} onRetry={refresh} /></div>
        ) : categories.length === 0 ? (
          <EmptyState title="Belum ada category" description="Tambahkan category pertama supaya penulis bisa mulai menulis." compact />
        ) : (
          <ul className="divide-y divide-border">
            {categories.map((category) => (
              <li key={category.id} className="p-4 sm:px-5">
                {editing?.id === category.id ? (
                  <form onSubmit={saveEdit} className="flex flex-col gap-3 sm:flex-row sm:items-start" noValidate>
                    <CategoryFields values={editing} errors={editErrors} onChange={setEditing} idPrefix={`edit-${category.id}`} />
                    <div className="flex shrink-0 gap-2">
                      <Button type="submit" size="icon" loading={saving} aria-label="Simpan">
                        {!saving && <Check aria-hidden="true" size={18} />}
                      </Button>
                      <Button type="button" variant="secondary" size="icon" onClick={() => setEditing(null)} aria-label="Batal">
                        <X aria-hidden="true" size={18} />
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary">{category.name}</p>
                      <p className="mt-0.5 truncate text-sm text-text-tertiary">
                        /{category.slug} · {category.article_count} artikel terbit
                        {category.description && ` · ${category.description}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => {
                          setEditErrors({})
                          setEditing({ id: category.id, name: category.name, description: category.description })
                        }}
                        aria-label={`Ubah ${category.name}`}
                      >
                        <Pencil aria-hidden="true" size={17} />
                      </Button>
                      <Button variant="secondary" size="icon" onClick={() => setPendingDelete(category)} aria-label={`Hapus ${category.name}`}>
                        <Trash2 aria-hidden="true" size={17} className="text-danger" />
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Hapus category?"
        description={`Category “${pendingDelete?.name}” akan dihapus. Bila masih dipakai artikel, pindahkan artikelnya lebih dulu.`}
        confirmLabel="Hapus"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
