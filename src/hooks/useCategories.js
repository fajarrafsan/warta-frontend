import { listCategories } from '../api/taxonomyApi.js'
import useAsync from './useAsync.js'

export default function useCategories() {
  const { data, loading, error, refresh } = useAsync(() => listCategories(), [])
  return { categories: data ?? [], loading, error, refresh }
}
