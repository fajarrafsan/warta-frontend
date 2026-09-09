import { useCallback, useEffect, useState } from 'react'
import { getAllArticles } from '../api/articleApi.js'

export default function useArticles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const fetchArticles = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError(null)

    try {
      const result = await getAllArticles()
      setArticles(result)
      return result
    } catch (fetchError) {
      setError(fetchError)
      return []
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    getAllArticles()
      .then((result) => {
        if (active) setArticles(result)
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
  }, [])

  return {
    articles,
    loading,
    refreshing,
    error,
    refresh: fetchArticles,
  }
}
