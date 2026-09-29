import { useEffect, useState } from 'react'
import { ExternalLink, FilePlus2, Files, FolderTree, LayoutDashboard, LogIn, LogOut, Menu, ShieldAlert, Users, X } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Logo from '../components/ui/Logo.jsx'
import ServiceStatus from '../components/ui/ServiceStatus.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import useAuth from '../hooks/useAuth.js'
import useServiceHealth from '../hooks/useServiceHealth.js'
import { ROLE_LABELS } from '../utils/articleUtils.js'

const allNavigation = [
  { label: 'Dashboard', to: '/studio', icon: LayoutDashboard, end: true },
  { label: 'Artikel', to: '/studio/artikel', icon: Files },
  { label: 'Tulis', to: '/studio/tulis', icon: FilePlus2 },
  { label: 'Kategori', to: '/studio/kategori', icon: FolderTree, admins: true },
  { label: 'Pengguna', to: '/studio/pengguna', icon: Users, admins: true },
  { label: 'Moderasi', to: '/studio/moderasi', icon: ShieldAlert, admins: true },
]

function useNavigation() {
  const { isAdmin } = useAuth()
  return allNavigation.filter((item) => !item.admins || isAdmin)
}

function AccountPanel({ onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <Link
        to="/login"
        onClick={onNavigate}
        className="focus-ring flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-contrast transition-opacity duration-200 hover:opacity-90"
      >
        <LogIn aria-hidden="true" size={17} />
        Masuk
      </Link>
    )
  }

  async function signOut() {
    onNavigate?.()
    await logout()
    toast.success('Kamu sudah keluar.')
    navigate('/')
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-soft px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text-primary">{user.name}</p>
        <p className="text-xs text-text-tertiary">{ROLE_LABELS[user.role] || user.role}</p>
      </div>
      <button
        type="button"
        onClick={signOut}
        className="focus-ring grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg text-text-secondary transition-colors duration-200 hover:bg-bg-hover hover:text-text-primary"
        aria-label="Keluar"
        title="Keluar"
      >
        <LogOut aria-hidden="true" size={18} />
      </button>
    </div>
  )
}

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

function SiteLink() {
  return (
    <Link
      to="/"
      className="focus-ring flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:bg-bg-hover hover:text-text-primary"
    >
      <ExternalLink aria-hidden="true" size={19} strokeWidth={1.9} />
      Lihat situs
    </Link>
  )
}

function DesktopSidebar({ serviceStatus }) {
  const navigation = useNavigation()

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-border bg-bg-secondary lg:flex lg:flex-col">
      <div className="px-6 pb-7 pt-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1.5 px-4" aria-label="Navigasi utama">
        <p className="px-3.5 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary">
          Ruang redaksi
        </p>
        {navigation.map((item) => (
          <NavigationLink key={item.to} item={item} />
        ))}
        <SiteLink />
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <AccountPanel />
        <ServiceStatus status={serviceStatus} />
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-text-tertiary">Warta</p>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}

function MobileHeader({ serviceStatus }) {
  const [open, setOpen] = useState(false)
  const navigation = useNavigation()

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
          <SiteLink />
          <div className="pt-3">
            <AccountPanel onNavigate={() => setOpen(false)} />
          </div>
        </nav>
      )}
    </header>
  )
}

export default function StudioLayout() {
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
