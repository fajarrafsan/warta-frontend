import { listArticles } from '../api/articleApi.js'
import useAsync from './useAsync.js'

const EMPTY_META = { page: 1, per_page: 0, total: 0, total_pages: 0 }

// useArticles memuat satu halaman artikel. mine berarti artikel milik
// pengguna yang sedang login.
export default function useArticles(params, { mine = false } = {}) {
  const { data, loading, error, refresh } = useAsync(
    () => listArticles(params, { mine }),
    [params, mine],
  )

  return {
    articles: data?.data ?? [],
    meta: data?.meta ?? EMPTY_META,
    loading: loading && !data,
    refreshing: loading && Boolean(data),
    error,
    refresh,
  }
}
