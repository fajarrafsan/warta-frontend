import { useCallback, useEffect, useState } from 'react'
import { getArticleById } from '../api/articleApi.js'

export default function useArticle(id) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState(null)

  const fetchArticle = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getArticleById(id)
      setArticle(result)
      return result
    } catch (fetchError) {
      setError(fetchError)
      return null
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!id) return undefined

    let active = true

    getArticleById(id)
      .then((result) => {
        if (active) setArticle(result)
      })
      .catch((fetchError) => {
        if (active) setError(fetchError)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  return { article, loading, error, refresh: fetchArticle }
}
