import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { FileText, Folder, Hash, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { suggest } from '../../api/searchApi.js'
import { searchTerms } from '../../utils/search.js'
import Highlight from '../articles/Highlight.jsx'
import Avatar from '../ui/Avatar.jsx'

const DEBOUNCE_MS = 200

// toOptions meratakan saran menjadi satu daftar pilihan untuk navigasi
// keyboard. Pilihan terakhir selalu "cari semua".
function toOptions(results, query) {
  const options = []
  for (const article of results?.articles ?? []) {
    options.push({ key: `a${article.id}`, group: 'Artikel', label: article.title, detail: article.category, href: `/artikel/${article.slug}`, kind: 'article' })
  }
  for (const author of results?.authors ?? []) {
    options.push({ key: `u${author.id}`, group: 'Penulis', label: author.name, href: `/penulis/${author.id}`, kind: 'author', author })
  }
  for (const category of results?.categories ?? []) {
    options.push({ key: `c${category.id}`, group: 'Kategori', label: category.name, href: `/kategori/${category.slug}`, kind: 'category' })
  }
  for (const tag of results?.tags ?? []) {
    options.push({ key: `t${tag.id}`, group: 'Tag', label: tag.name, href: `/tag/${tag.slug}`, kind: 'tag' })
  }
  if (query.trim()) {
    options.push({ key: 'all', group: '', label: query.trim(), href: `/cari?q=${encodeURIComponent(query.trim())}`, kind: 'all' })
  }
  return options
}

function OptionIcon({ option }) {
  if (option.kind === 'author') return <Avatar name={option.author.name} src={option.author.avatar_url} size="sm" />
  const Icon = { article: FileText, category: Folder, tag: Hash, all: Search }[option.kind]
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-bg-soft text-text-tertiary">
      <Icon aria-hidden="true" size={16} />
    </span>
  )
}

// SearchCombobox adalah kotak cari dengan saran saat mengetik: artikel,
// penulis, kategori, dan tag. Panah atas/bawah memilih, Enter membuka, Escape
// menutup daftar.
export default function SearchCombobox({ onDone, autoFocus = false }) {
  const navigate = useNavigate()
  const listId = useId()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [active, setActive] = useState(-1)
  const [open, setOpen] = useState(false)
  const latest = useRef(0)

  useEffect(() => {
    const q = query.trim()
    const request = ++latest.current
    if (q.length < 2) return undefined

    const controller = new AbortController()
    const timer = setTimeout(() => {
      suggest(q, { signal: controller.signal })
        .then((data) => {
          // Hanya jawaban untuk ketikan terakhir yang dipakai.
          if (request === latest.current) setResults(data)
        })
        .catch(() => {
          // Saran hanya pelengkap; pencarian biasa tetap bisa dipakai.
        })
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  // Saran lama tetap tampil selama saran untuk ketikan baru dimuat, tetapi
  // tidak untuk kata kunci di bawah dua huruf.
  const shown = query.trim().length >= 2 ? results : null
  const options = useMemo(() => toOptions(shown, query), [shown, query])
  const terms = useMemo(() => searchTerms(query), [query])
  const expanded = open && query.trim().length > 0 && options.length > 0

  function go(href) {
    setOpen(false)
    navigate(href)
    onDone?.()
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((current) => (options.length ? (current + step + options.length) % options.length : -1))
    } else if (event.key === 'Escape') {
      if (expanded) {
        event.preventDefault()
        setOpen(false)
        setActive(-1)
      } else {
        onDone?.()
      }
    }
  }

  function submit(event) {
    event.preventDefault()
    const option = expanded && options[active]
    if (option) {
      go(option.href)
    } else if (query.trim()) {
      go(`/cari?q=${encodeURIComponent(query.trim())}`)
    }
  }

  // Pilihan dikelompokkan untuk tampilan; index tetap urutan navigasi keyboard.
  const groups = []
  options.forEach((option, index) => {
    const last = groups.at(-1)
    if (last && last.name === option.group) last.items.push({ option, index })
    else groups.push({ name: option.group, items: [{ option, index }] })
  })

  function renderOption({ option, index }) {
    return (
      <div
        key={option.key}
        id={`${listId}-${option.key}`}
        role="option"
        aria-selected={index === active}
        // mousedown supaya pilihan terjadi sebelum input kehilangan fokus.
        onMouseDown={(event) => {
          event.preventDefault()
          go(option.href)
        }}
        onMouseEnter={() => setActive(index)}
        className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 ${index === active ? 'bg-bg-hover' : ''}`}
      >
        <OptionIcon option={option} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-text-primary">
            {option.kind === 'all'
              ? <>Cari “{option.label}” di semua artikel</>
              : <Highlight text={option.label} terms={terms} />}
          </span>
          {option.detail && <span className="block truncate text-xs text-text-tertiary">{option.detail}</span>}
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={submit} role="search" className="relative w-full">
      <label htmlFor={`${listId}-input`} className="sr-only">Cari artikel, penulis, kategori, atau tag</label>
      <Search aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
      <input
        id={`${listId}-input`}
        type="search"
        role="combobox"
        autoComplete="off"
        autoFocus={autoFocus}
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={expanded && active >= 0 ? `${listId}-${options[active]?.key}` : undefined}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(-1)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        placeholder="Cari artikel, penulis, kategori, atau tag"
        className="focus-ring min-h-12 w-full rounded-full border border-border bg-bg-secondary pl-11 pr-4 text-base text-text-primary placeholder:text-text-tertiary"
      />

      {expanded && (
        <div
          id={listId}
          role="listbox"
          aria-label="Saran pencarian"
          className="absolute left-0 right-0 z-40 mt-2 max-h-[min(70dvh,480px)] overflow-y-auto rounded-2xl border border-border bg-bg-secondary p-2 shadow-float"
        >
          {groups.map((group) => (
            group.name ? (
              <div key={group.name} role="group" aria-labelledby={`${listId}-${group.name}`}>
                <div id={`${listId}-${group.name}`} className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-text-tertiary">
                  {group.name}
                </div>
                {group.items.map(renderOption)}
              </div>
            ) : (
              <div key="all" className="mt-1 border-t border-border pt-1">{group.items.map(renderOption)}</div>
            )
          ))}
        </div>
      )}
    </form>
  )
}
