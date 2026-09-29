import { useEffect, useRef, useState } from 'react'
import { Bookmark, LayoutDashboard, LogOut, Search, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import useAuth from '../../hooks/useAuth.js'
import useCategories from '../../hooks/useCategories.js'
import { ROLE_LABELS } from '../../utils/articleUtils.js'
import ThemeToggle from '../ui/ThemeToggle.jsx'

function Wordmark() {
  return (
    <Link to="/" className="focus-ring rounded font-display text-3xl font-semibold tracking-[-0.03em] text-text-primary sm:text-4xl">
      Warta<span className="text-accent">.</span>
    </Link>
  )
}

function AccountMenu() {
  const { user, canWrite, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
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

  if (!user) {
    return (
      <Link
        to="/login"
        className="focus-ring inline-flex min-h-10 items-center rounded-full bg-brand px-4 text-sm font-semibold text-brand-contrast transition-opacity hover:opacity-90"
      >
        Masuk
      </Link>
    )
  }

  async function signOut() {
    setOpen(false)
    await logout()
    toast.success('Kamu sudah keluar.')
    navigate('/')
  }

  const itemClass = 'focus-ring flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary'

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menu akun ${user.name}`}
        className="focus-ring grid size-10 cursor-pointer place-items-center rounded-full bg-brand text-sm font-bold uppercase text-brand-contrast"
      >
        {user.name.charAt(0)}
      </button>
      {open && (
        <div role="menu" className="animate-fade-up absolute right-0 z-40 mt-2 w-60 rounded-2xl border border-border bg-bg-secondary p-2 shadow-float">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-text-primary">{user.name}</p>
            <p className="text-xs text-text-tertiary">{ROLE_LABELS[user.role]}</p>
          </div>
          <div className="my-1 border-t border-border" />
          {canWrite && (
            <Link role="menuitem" to="/studio" onClick={() => setOpen(false)} className={itemClass}>
              <LayoutDashboard aria-hidden="true" size={17} /> Ruang redaksi
            </Link>
          )}
          <Link role="menuitem" to="/tersimpan" onClick={() => setOpen(false)} className={itemClass}>
            <Bookmark aria-hidden="true" size={17} /> Tersimpan
          </Link>
          <button role="menuitem" type="button" onClick={signOut} className={itemClass}>
            <LogOut aria-hidden="true" size={17} /> Keluar
          </button>
        </div>
      )}
    </div>
  )
}

function SearchBox({ onDone }) {
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  function submit(event) {
    event.preventDefault()
    const q = value.trim()
    if (!q) return
    navigate(`/cari?q=${encodeURIComponent(q)}`)
    onDone?.()
  }

  return (
    <form onSubmit={submit} role="search" className="relative w-full">
      <label htmlFor="site-search" className="sr-only">Cari artikel</label>
      <Search aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
      <input
        id="site-search"
        type="search"
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Cari judul atau isi artikel, lalu Enter"
        className="focus-ring min-h-12 w-full rounded-full border border-border bg-bg-secondary pl-11 pr-4 text-base text-text-primary placeholder:text-text-tertiary"
      />
    </form>
  )
}

export default function SiteHeader() {
  const { categories } = useCategories()
  const [searching, setSearching] = useState(false)
  const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  const navCategories = categories.filter((category) => category.article_count > 0).slice(0, 7)

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg-primary/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
        <div className="flex items-baseline gap-5">
          <Wordmark />
          <p className="hidden text-xs capitalize text-text-tertiary md:block">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearching((current) => !current)}
            aria-expanded={searching}
            aria-label={searching ? 'Tutup pencarian' : 'Cari artikel'}
            className="focus-ring grid size-10 cursor-pointer place-items-center rounded-full text-text-secondary hover:bg-bg-hover hover:text-text-primary"
          >
            {searching ? <X aria-hidden="true" size={19} /> : <Search aria-hidden="true" size={19} />}
          </button>
          <ThemeToggle />
          <AccountMenu />
        </div>
      </div>

      {searching && (
        <div className="mx-auto max-w-3xl px-4 pb-4 sm:px-6">
          <SearchBox onDone={() => setSearching(false)} />
        </div>
      )}

      {navCategories.length > 0 && (
        <nav aria-label="Kategori" className="border-t border-border">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 sm:px-4 lg:px-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `focus-ring shrink-0 rounded px-3 py-3 text-sm font-semibold ${isActive ? 'text-text-primary underline decoration-accent decoration-2 underline-offset-8' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Terkini
            </NavLink>
            {navCategories.map((category) => (
              <NavLink
                key={category.id}
                to={`/kategori/${category.slug}`}
                className={({ isActive }) => `focus-ring shrink-0 rounded px-3 py-3 text-sm font-semibold ${isActive ? 'text-text-primary underline decoration-accent decoration-2 underline-offset-8' : 'text-text-secondary hover:text-text-primary'}`}
              >
                {category.name}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
