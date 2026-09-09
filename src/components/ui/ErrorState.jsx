import { CircleAlert, RefreshCw } from 'lucide-react'
import Button from './Button.jsx'

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-950 dark:border-red-950 dark:bg-red-950/30 dark:text-red-100" role="alert">
      <div className="flex items-start gap-3">
        <CircleAlert aria-hidden="true" className="mt-0.5 shrink-0" size={20} />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Data belum dapat dimuat</h2>
          <p className="mt-1 text-sm leading-6 opacity-80">
            {error?.message || 'Terjadi kesalahan saat mengambil data.'}
          </p>
          {onRetry && (
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => onRetry()}>
              <RefreshCw aria-hidden="true" size={16} />
              Coba lagi
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

