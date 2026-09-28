import { getArticle } from '../api/articleApi.js'
import useAsync from './useAsync.js'

export default function useArticle(ref) {
  const { data, loading, error, refresh } = useAsync(
    () => (ref ? getArticle(ref) : Promise.resolve(null)),
    [ref],
  )

  return { article: data ?? null, loading: Boolean(ref) && loading, error, refresh }
}
