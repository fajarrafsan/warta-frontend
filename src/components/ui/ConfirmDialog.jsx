import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { LoaderCircle, TriangleAlert } from 'lucide-react'

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Hapus permanen',
  loading = false,
  onConfirm,
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-bg-secondary p-6 shadow-float focus:outline-none">
          <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-red-100 text-danger dark:bg-red-950/60">
            <TriangleAlert aria-hidden="true" size={22} />
          </div>
          <AlertDialog.Title className="font-display text-2xl font-semibold text-text-primary">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 leading-6 text-text-secondary">
            {description}
          </AlertDialog.Description>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                disabled={loading}
                className="focus-ring min-h-11 cursor-pointer rounded-xl border border-border bg-bg-secondary px-5 text-sm font-semibold text-text-primary transition-colors duration-200 hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-45"
              >
                Batal
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-danger bg-danger px-5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 dark:text-zinc-950"
              >
                {loading && <LoaderCircle aria-hidden="true" size={17} className="animate-spin" />}
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
