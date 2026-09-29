import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import useCategories from '../../hooks/useCategories.js'
import useServiceHealth from '../../hooks/useServiceHealth.js'
import ServiceStatus from '../ui/ServiceStatus.jsx'

export default function SiteFooter() {
  const { categories } = useCategories()
  const { canWrite } = useAuth()
  const health = useServiceHealth()

  return (
    <footer className="mt-24 border-t border-border bg-bg-secondary">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-display text-3xl font-semibold tracking-[-0.03em] text-text-primary">
            Warta<span className="text-accent">.</span>
          </p>
          <p className="mt-3 max-w-sm leading-7 text-text-secondary">
            Kabar dan tulisan pilihan, ditulis oleh para penulis Warta.
          </p>
          <div className="mt-5 max-w-xs"><ServiceStatus status={health} /></div>
        </div>
        <nav aria-label="Kategori di footer">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-tertiary">Kategori</p>
          <ul className="mt-4 space-y-2">
            {categories.slice(0, 8).map((category) => (
              <li key={category.id}>
                <Link to={`/kategori/${category.slug}`} className="focus-ring rounded text-sm text-text-secondary hover:text-text-primary">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Tautan lain">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-tertiary">Warta</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/?sort=popular" className="focus-ring rounded text-text-secondary hover:text-text-primary">Terpopuler</Link></li>
            <li><Link to="/tersimpan" className="focus-ring rounded text-text-secondary hover:text-text-primary">Tersimpan</Link></li>
            <li>
              <Link to={canWrite ? '/studio' : '/register'} className="focus-ring rounded text-text-secondary hover:text-text-primary">
                {canWrite ? 'Ruang redaksi' : 'Daftar akun'}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-text-tertiary sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Warta
        </p>
      </div>
    </footer>
  )
}
