import { useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { History, RotateCcw, X } from 'lucide-react'
import { toast } from 'sonner'
import { getRevision, listRevisions, restoreRevision } from '../../api/articleApi.js'
import useAsync from '../../hooks/useAsync.js'
import { formatArticleDate } from '../../utils/articleUtils.js'
import { collapseSame, diffLines } from '../../utils/diff.js'
import Button from '../ui/Button.jsx'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'

const when = (value) => formatArticleDate(value, { month: 'short', hour: '2-digit', minute: '2-digit' })

const lineStyles = {
  same: 'text-text-secondary',
  del: 'bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200',
  add: 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
}
const linePrefix = { same: ' ', del: '−', add: '+' }

// Diff menampilkan perbedaan isi revisi dengan versi yang tersimpan sekarang.
function Diff({ before, after }) {
  const lines = useMemo(() => {
    const diff = diffLines(before, after)
    return diff && collapseSame(diff)
  }, [before, after])

  if (!lines) {
    return <p className="text-sm text-text-secondary">Isi terlalu panjang untuk dibandingkan per baris.</p>
  }
  if (lines.every((line) => line.type === 'same' || line.type === 'skip')) {
    return <p className="text-sm text-text-secondary">Isinya sama dengan versi sekarang.</p>
  }

  return (
    <ol className="overflow-x-auto rounded-xl border border-border font-mono text-[13px] leading-6" aria-label="Perbedaan isi">
      {lines.map((line, index) => (
        line.type === 'skip' ? (
          <li key={index} className="bg-bg-soft px-3 py-1 text-xs text-text-tertiary">… {line.count} baris sama …</li>
        ) : (
          <li key={index} className={`whitespace-pre-wrap break-words px-3 ${lineStyles[line.type]}`}>
            <span aria-hidden="true" className="mr-2 select-none opacity-60">{linePrefix[line.type]}</span>
            <span className="sr-only">{line.type === 'del' ? 'Hanya di versi ini: ' : line.type === 'add' ? 'Hanya di versi sekarang: ' : ''}</span>
            {line.text || ' '}
          </li>
        )
      ))}
    </ol>
  )
}

// RevisionsDialog menampilkan riwayat revisi artikel dan memulihkannya.
// current adalah isi yang tersimpan sekarang (bukan isian editor).
export default function RevisionsDialog({ articleId, current, open, onOpenChange, onRestored }) {
  const revisions = useAsync(() => (open ? listRevisions(articleId) : Promise.resolve(null)), [articleId, open])
  const items = revisions.data ?? []
  const [chosen, setChosen] = useState(null)
  // Bawaannya revisi sebelum versi sekarang, karena itu yang paling sering dicari.
  const selectedId = chosen ?? items[1]?.id ?? items[0]?.id
  const selected = useAsync(
    () => (open && selectedId ? getRevision(articleId, selectedId) : Promise.resolve(null)),
    [articleId, selectedId, open],
  )
  const [confirming, setConfirming] = useState(false)
  const [restoring, setRestoring] = useState(false)

  const revision = selected.data
  const isCurrent = selectedId === items[0]?.id

  async function restore() {
    setRestoring(true)
    try {
      const article = await restoreRevision(articleId, selectedId)
      toast.success('Artikel dipulihkan. Pemulihan ini tercatat sebagai revisi baru.')
      setConfirming(false)
      setChosen(null)
      onOpenChange(false)
      onRestored(article)
    } catch (error) {
      toast.error(error.fields?.category_id || error.message)
    } finally {
      setRestoring(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) setChosen(null); onOpenChange(next) }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(88dvh,820px)] w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-bg-secondary shadow-float focus:outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div>
              <Dialog.Title className="flex items-center gap-2 font-display text-2xl font-semibold text-text-primary">
                <History aria-hidden="true" size={22} /> Riwayat revisi
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-text-secondary">
                Setiap simpanan yang mengubah judul, isi, kategori, tag, atau sampul tercatat di sini (50 terakhir).
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" aria-label="Tutup riwayat" className="focus-ring grid size-10 cursor-pointer place-items-center rounded-xl text-text-secondary hover:bg-bg-hover hover:text-text-primary">
                <X aria-hidden="true" size={19} />
              </button>
            </Dialog.Close>
          </div>

          <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[280px_minmax(0,1fr)] md:grid-rows-1">
            <ul className="max-h-48 overflow-y-auto border-b border-border p-2 md:max-h-none md:border-b-0 md:border-r" aria-label="Daftar revisi">
              {revisions.loading && !revisions.data && <li className="p-3 text-sm text-text-tertiary">Memuat…</li>}
              {revisions.error && <li className="p-3 text-sm text-danger">{revisions.error.message}</li>}
              {items.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setChosen(item.id)}
                    aria-current={item.id === selectedId}
                    className={`focus-ring w-full cursor-pointer rounded-xl px-3 py-2.5 text-left ${item.id === selectedId ? 'bg-bg-hover' : 'hover:bg-bg-hover/60'}`}
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold text-text-primary">
                      <time dateTime={item.created_at}>{when(item.created_at)}</time>
                      {index === 0 && <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-contrast">Sekarang</span>}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-text-tertiary">
                      {item.editor?.name ?? 'Akun terhapus'} · {item.characters.toLocaleString('id-ID')} karakter
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="min-h-0 overflow-y-auto p-5">
              {!revision ? (
                <p className="text-sm text-text-tertiary">{selected.error ? selected.error.message : 'Memuat revisi…'}</p>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                        {isCurrent ? 'Versi sekarang' : `Versi ${when(revision.created_at)}`}
                      </p>
                      <h3 className="mt-1 font-display text-xl font-semibold text-text-primary">{revision.title}</h3>
                      {!isCurrent && revision.title !== current.title && (
                        <p className="mt-1 text-sm text-text-secondary">Judul sekarang: {current.title}</p>
                      )}
                      {revision.tags.length > 0 && <p className="mt-1 text-sm text-text-tertiary">Tag: {revision.tags.join(', ')}</p>}
                    </div>
                    {!isCurrent && (
                      <Button size="sm" variant="secondary" onClick={() => setConfirming(true)}>
                        <RotateCcw aria-hidden="true" size={16} /> Pulihkan versi ini
                      </Button>
                    )}
                  </div>
                  {isCurrent ? (
                    <p className="text-sm text-text-secondary">Ini isi yang tersimpan sekarang. Pilih revisi lain untuk melihat perbedaannya.</p>
                  ) : (
                    <>
                      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-tertiary">
                        <span><span className="rounded bg-red-50 px-1 text-red-900 dark:bg-red-950/40 dark:text-red-200">−</span> hanya di versi ini</span>
                        <span><span className="rounded bg-emerald-50 px-1 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">+</span> hanya di versi sekarang</span>
                      </p>
                      <Diff before={revision.content} after={current.content} />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Pulihkan versi ini?"
        description="Judul, isi, kategori, tag, dan sampul kembali seperti versi ini; statusnya tidak berubah. Perubahan di editor yang belum disimpan akan hilang. Versi sekarang tetap ada di riwayat."
        confirmLabel="Pulihkan"
        loading={restoring}
        onConfirm={restore}
      />
    </Dialog.Root>
  )
}
