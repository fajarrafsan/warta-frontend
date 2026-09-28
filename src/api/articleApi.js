import { api } from './client.js'
import { call } from './errors.js'

// query membuang parameter kosong dan memakai nama parameter backend.
function query(params = {}) {
  const names = { perPage: 'per_page' }
  return Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [names[key] || key, value]),
  )
}

// listArticles mengembalikan { data, meta }. mine berarti artikel milik
// pengguna yang sedang login, dengan status apa pun.
export async function listArticles(params = {}, { mine = false } = {}) {
  return call(async () => {
    const path = mine ? '/api/v1/me/articles' : '/api/v1/articles'
    const response = await api.get(path, { params: query(params) })
    return { data: response.data.data, meta: response.data.meta }
  })
}

// getArticle menerima id maupun slug.
export async function getArticle(ref) {
  return call(async () => {
    const response = await api.get(`/api/v1/articles/${encodeURIComponent(ref)}`)
    return response.data.data
  })
}

export async function createArticle(payload) {
  return call(async () => {
    const response = await api.post('/api/v1/articles', payload)
    return response.data.data
  })
}

export async function replaceArticle(id, payload) {
  return call(async () => {
    const response = await api.put(`/api/v1/articles/${id}`, payload)
    return response.data.data
  })
}

export async function changeArticleStatus(id, status) {
  return call(async () => {
    const response = await api.patch(`/api/v1/articles/${id}`, { status })
    return response.data.data
  })
}

export async function deleteArticle(id) {
  return call(async () => {
    await api.delete(`/api/v1/articles/${id}`)
  })
}

export async function getServiceHealth() {
  return call(async () => {
    const response = await api.get('/health/ready', { timeout: 5000, anonymous: true })
    return response.data
  })
}

// toArticlePayload membentuk body PUT dari artikel hasil response.
export function toArticlePayload(article, status = article.status) {
  return {
    title: article.title,
    content: article.content,
    category_id: article.category.id,
    tags: article.tags.map((tag) => tag.name),
    status,
  }
}
