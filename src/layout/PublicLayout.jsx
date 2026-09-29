import { Outlet } from 'react-router-dom'
import SiteFooter from '../components/public/SiteFooter.jsx'
import SiteHeader from '../components/public/SiteHeader.jsx'

export default function PublicLayout() {
  return (
    <div className="min-h-dvh bg-bg-primary text-text-primary">
      <a
        href="#konten"
        className="focus-ring fixed left-4 top-4 z-50 -translate-y-24 rounded-xl bg-brand px-4 py-3 font-semibold text-brand-contrast transition-transform focus:translate-y-0"
      >
        Lewati ke konten utama
      </a>
      <SiteHeader />
      <main id="konten" tabIndex="-1" className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
