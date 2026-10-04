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

// changeArticleStatus mengubah status saja. Status scheduled butuh
// scheduledAt, misalnya saat membatalkan pemindahan artikel terjadwal ke trash.
export async function changeArticleStatus(id, status, scheduledAt) {
  return call(async () => {
    const body = status === 'scheduled' ? { status, scheduled_at: scheduledAt } : { status }
    const response = await api.patch(`/api/v1/articles/${id}`, body)
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

export async function listBookmarks(params = {}) {
  return call(async () => {
    const response = await api.get('/api/v1/me/bookmarks', { params: query(params) })
    return { data: response.data.data, meta: response.data.meta }
  })
}

// setLike dan setBookmark mengembalikan keadaan terbaru:
// { liked, bookmarked, like_count }.
export async function setLike(id, liked) {
  return call(async () => {
    const response = await (liked ? api.put : api.delete)(`/api/v1/articles/${id}/like`)
    return response.data.data
  })
}

export async function setBookmark(id, bookmarked) {
  return call(async () => {
    const response = await (bookmarked ? api.put : api.delete)(`/api/v1/articles/${id}/bookmark`)
    return response.data.data
  })
}

// recordView dipanggil sekali saat halaman baca dibuka. Kegagalannya tidak
// perlu mengganggu pembaca.
export async function recordView(id) {
  try {
    await api.post(`/api/v1/articles/${id}/view`)
  } catch {
    // Hitungan dibaca bersifat pelengkap.
  }
}

export async function uploadImage(file) {
  return call(async () => {
    const form = new FormData()
    form.append('image', file)
    const response = await api.post('/api/v1/uploads', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    })
    return response.data.data.url
  })
}

export async function getStats(days = 30) {
  return call(async () => {
    const response = await api.get('/api/v1/stats', { params: { days } })
    return response.data.data
  })
}

export async function listRevisions(id) {
  return call(async () => {
    const response = await api.get(`/api/v1/articles/${id}/revisions`)
    return response.data.data
  })
}

export async function getRevision(id, revisionId) {
  return call(async () => {
    const response = await api.get(`/api/v1/articles/${id}/revisions/${revisionId}`)
    return response.data.data
  })
}

// restoreRevision mengembalikan artikel ke isi revisi itu; statusnya tetap.
export async function restoreRevision(id, revisionId) {
  return call(async () => {
    const response = await api.post(`/api/v1/articles/${id}/revisions/${revisionId}/restore`)
    return response.data.data
  })
}

// toArticlePayload membentuk body PUT dari artikel hasil response.
export function toArticlePayload(article, status = article.status) {
  return {
    title: article.title,
    content: article.content,
    category_id: article.category.id,
    tags: article.tags.map((tag) => tag.name),
    cover_image: article.cover_image || '',
    status,
    // Jadwal yang tersimpan tetap dipakai selama status masih scheduled.
    ...(status === 'scheduled' && { scheduled_at: article.scheduled_at }),
  }
}
