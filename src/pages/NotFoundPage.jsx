import { ArrowLeft, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

export default function NotFoundPage() {
  useDocumentTitle('Halaman Tidak Ditemukan')

  return (
    <div className="grid min-h-[70dvh] place-items-center py-12">
      <div className="max-w-xl text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-border bg-bg-secondary text-text-secondary shadow-card">
          <SearchX aria-hidden="true" size={27} />
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-accent-strong">404</p>
        <h1 className="mt-3 font-display text-5xl font-semibold text-text-primary">Halaman tidak ditemukan</h1>
        <p className="mt-4 leading-7 text-text-secondary">Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.</p>
        <Link to="/posts" className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-contrast">
          <ArrowLeft aria-hidden="true" size={17} />
          Kembali ke All Posts
        </Link>
      </div>
    </div>
  )
}
