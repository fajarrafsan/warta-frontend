import { api } from './client.js'
import { call } from './errors.js'

export async function listComments(articleId, { page = 1, perPage = 20 } = {}) {
  return call(async () => {
    const response = await api.get(`/api/v1/articles/${articleId}/comments`, {
      params: { page, per_page: perPage },
    })
    return { data: response.data.data, meta: response.data.meta }
  })
}

export async function createComment(articleId, body) {
  return call(async () => {
    const response = await api.post(`/api/v1/articles/${articleId}/comments`, { body })
    return response.data.data
  })
}

export async function deleteComment(id) {
  return call(async () => {
    await api.delete(`/api/v1/comments/${id}`)
  })
}

// reportComment mengembalikan { reported, hidden }. hidden berarti komentar
// kini disembunyikan karena laporannya mencapai batas.
export async function reportComment(id, reason) {
  return call(async () => {
    const response = await api.post(`/api/v1/comments/${id}/report`, { reason })
    return response.data.data
  })
}

export async function listReportedComments({ page = 1, perPage = 20 } = {}) {
  return call(async () => {
    const response = await api.get('/api/v1/moderation/comments', { params: { page, per_page: perPage } })
    return { data: response.data.data, meta: response.data.meta }
  })
}

export async function moderateComment(id, action) {
  return call(async () => {
    await api.post(`/api/v1/moderation/comments/${id}`, { action })
  })
}
