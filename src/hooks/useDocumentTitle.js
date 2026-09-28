import { useEffect } from 'react'

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = `${title} | Warta`

    return () => {
      document.title = 'Warta'
    }
  }, [title])
}

