import { useContext } from 'react'
import ThemeContext from '../context/themeContext.js'

export default function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme harus digunakan di dalam ThemeProvider')
  }

  return context
}
