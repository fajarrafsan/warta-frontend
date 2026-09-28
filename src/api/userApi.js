import { api } from './client.js'
import { call } from './errors.js'

export async function listUsers({ page = 1, perPage = 20, q = '', role = '' } = {}) {
  return call(async () => {
    const params = { page, per_page: perPage }
    if (q) params.q = q
    if (role) params.role = role

    const response = await api.get('/api/v1/users', { params })
    return { data: response.data.data, meta: response.data.meta }
  })
}

export async function updateUserRole(id, role) {
  return call(async () => {
    const response = await api.patch(`/api/v1/users/${id}/role`, { role })
    return response.data.data
  })
}
