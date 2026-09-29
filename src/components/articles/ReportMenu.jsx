import { useEffect, useRef, useState } from 'react'
import { Flag } from 'lucide-react'
import { toast } from 'sonner'
import { reportComment } from '../../api/commentApi.js'
import { REPORT_REASONS } from '../../utils/articleUtils.js'


// ReportMenu menampilkan pilihan alasan lalu mengirim laporan komentar.
export default function ReportMenu({ comment, onHidden }) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [reported, setReported] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    function close(event) {
      if (event.type === 'keydown' ? event.key === 'Escape' : !menuRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  async function send(reason) {
    setSending(true)
    try {
      const result = await reportComment(comment.id, reason)
      setReported(true)
      setOpen(false)
      if (result.hidden) {
        toast.success('Terima kasih. Komentar ini disembunyikan sampai ditinjau admin.')
        onHidden?.()
      } else {
        toast.success('Terima kasih, laporanmu akan ditinjau admin.')
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={reported || sending}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={reported ? 'Komentar sudah dilaporkan' : `Laporkan komentar ${comment.author.name}`}
        title={reported ? 'Sudah dilaporkan' : 'Laporkan'}
        className="focus-ring grid size-11 cursor-pointer place-items-center rounded-xl text-text-tertiary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:cursor-default disabled:text-accent-strong"
      >
        <Flag aria-hidden="true" size={16} fill={reported ? 'currentColor' : 'none'} />
      </button>
      {open && (
        <div role="menu" className="animate-fade-up absolute right-0 z-20 mt-1 w-56 rounded-xl border border-border bg-bg-secondary p-1.5 shadow-float">
          <p className="px-3 py-2 text-xs font-semibold text-text-tertiary">Laporkan karena</p>
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason.value}
              type="button"
              role="menuitem"
              disabled={sending}
              onClick={() => send(reason.value)}
              className="focus-ring flex min-h-10 w-full cursor-pointer items-center rounded-lg px-3 text-left text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary disabled:opacity-50"
            >
              {reason.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
