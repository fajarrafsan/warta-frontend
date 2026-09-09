import { useEffect } from 'react'

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = `${title} | Sharing Vision`

    return () => {
      document.title = 'Sharing Vision Article Studio'
    }
  }, [title])
}

