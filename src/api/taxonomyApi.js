import { api } from './client.js'
import { call } from './errors.js'

export async function listCategories() {
  return call(async () => {
    const response = await api.get('/api/v1/categories')
    return response.data.data
  })
}

export async function createCategory(payload) {
  return call(async () => {
    const response = await api.post('/api/v1/categories', payload)
    return response.data.data
  })
}

export async function updateCategory(id, payload) {
  return call(async () => {
    const response = await api.put(`/api/v1/categories/${id}`, payload)
    return response.data.data
  })
}

export async function deleteCategory(id) {
  return call(async () => {
    await api.delete(`/api/v1/categories/${id}`)
  })
}

export async function listTags(params = {}) {
  return call(async () => {
    const response = await api.get('/api/v1/tags', { params })
    return response.data.data
  })
}
