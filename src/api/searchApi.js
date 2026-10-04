import { api } from './client.js'
import { call } from './errors.js'

const EMPTY = { articles: [], categories: [], tags: [], authors: [] }

// suggest memberi saran saat mengetik. signal membatalkan permintaan lama
// ketika pengguna terus mengetik.
export async function suggest(q, { signal } = {}) {
  if (q.trim().length < 2) return EMPTY
  return call(async () => {
    const response = await api.get('/api/v1/search/suggest', { params: { q }, signal })
    return response.data.data
  })
}
