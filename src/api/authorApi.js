import { api } from './client.js'
import { call } from './errors.js'

export async function getAuthor(id) {
  return call(async () => {
    const response = await api.get(`/api/v1/authors/${encodeURIComponent(id)}`)
    return response.data.data
  })
}

// setFollow mengembalikan { following, follower_count }.
export async function setFollow(id, following) {
  return call(async () => {
    const response = await (following ? api.put : api.delete)(`/api/v1/authors/${id}/follow`)
    return response.data.data
  })
}

export async function listFollowing({ page = 1, perPage = 50 } = {}) {
  return call(async () => {
    const response = await api.get('/api/v1/me/following', { params: { page, per_page: perPage } })
    return { data: response.data.data, meta: response.data.meta }
  })
}

// listFeed adalah artikel terbit dari penulis yang diikuti.
export async function listFeed({ page = 1, perPage = 12 } = {}) {
  return call(async () => {
    const response = await api.get('/api/v1/me/feed', { params: { page, per_page: perPage } })
    return { data: response.data.data, meta: response.data.meta }
  })
}
