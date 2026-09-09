import { Moon, Sun } from 'lucide-react'
import useTheme from '../../hooks/useTheme.js'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="focus-ring grid size-11 cursor-pointer place-items-center rounded-xl border border-border bg-bg-secondary text-text-secondary transition-colors duration-200 hover:bg-bg-hover hover:text-text-primary"
      aria-label={isDark ? 'Gunakan tema terang' : 'Gunakan tema gelap'}
      title={isDark ? 'Tema terang' : 'Tema gelap'}
    >
      {isDark ? <Sun aria-hidden="true" size={19} /> : <Moon aria-hidden="true" size={19} />}
    </button>
  )
}
