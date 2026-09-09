import { useEffect, useState } from 'react'
import { FilePlus2, Files, Menu, Newspaper, X } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import Logo from '../components/ui/Logo.jsx'
import ServiceStatus from '../components/ui/ServiceStatus.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import useServiceHealth from '../hooks/useServiceHealth.js'

const navigation = [
  { label: 'All Posts', to: '/posts', icon: Files, end: true },
  { label: 'Add New', to: '/posts/new', icon: FilePlus2 },
  { label: 'Preview', to: '/preview', icon: Newspaper },
]

function NavigationLink({ item, onNavigate }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `focus-ring group flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors duration-200 ${
          isActive
            ? 'bg-brand text-brand-contrast shadow-soft'
            : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
        }`
      }
    >
      <Icon aria-hidden="true" size={19} strokeWidth={1.9} />
      <span>{item.label}</span>
    </NavLink>
  )
}

function DesktopSidebar({ serviceStatus }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-border bg-bg-secondary lg:flex lg:flex-col">
      <div className="px-6 pb-7 pt-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1.5 px-4" aria-label="Navigasi utama">
        <p className="px-3.5 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary">
          Workspace
        </p>
        {navigation.map((item) => (
          <NavigationLink key={item.to} item={item} />
        ))}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <ServiceStatus status={serviceStatus} />
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-text-tertiary">Sharing Vision CMS</p>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}

function MobileHeader({ serviceStatus }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg-secondary/95 backdrop-blur-xl lg:hidden">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <ServiceStatus status={serviceStatus} compact />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="focus-ring grid size-11 cursor-pointer place-items-center rounded-xl border border-border bg-bg-secondary text-text-primary transition-colors duration-200 hover:bg-bg-hover"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
          >
            {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-navigation"
          className="animate-fade-up space-y-1 border-t border-border px-4 py-4 sm:px-6"
          aria-label="Navigasi utama mobile"
        >
          {navigation.map((item) => (
            <NavigationLink key={item.to} item={item} onNavigate={() => setOpen(false)} />
          ))}
        </nav>
      )}
    </header>
  )
}

export default function AppShell() {
  const serviceStatus = useServiceHealth()

  return (
    <div className="min-h-dvh bg-bg-primary text-text-primary">
      <a
        href="#main-content"
        className="focus-ring fixed left-4 top-4 z-50 -translate-y-24 rounded-xl bg-brand px-4 py-3 font-semibold text-brand-contrast transition-transform focus:translate-y-0"
      >
        Lewati ke konten utama
      </a>

      <DesktopSidebar serviceStatus={serviceStatus} />
      <MobileHeader serviceStatus={serviceStatus} />

      <main id="main-content" tabIndex="-1" className="min-h-dvh lg:pl-72">
        <div className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 sm:py-9 lg:px-9 lg:py-10 xl:px-12">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
