import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, authClient } from './client.js'
import { clearSession, getSession, setSession } from './session.js'

// Adapter palsu: menjawab setiap request dengan fungsi handler, tanpa jaringan.
function respond(handler) {
  return vi.fn(async (config) => {
    const { status, data } = await handler(config)
    const response = { status, data, headers: {}, config, statusText: String(status) }
    if (status >= 400) {
      const error = new Error(`status ${status}`)
      Object.assign(error, { isAxiosError: true, config, response })
      throw error
    }
    return response
  })
}

const tokens = (suffix) => ({
  data: {
    access_token: `access-${suffix}`,
    refresh_token: `refresh-${suffix}`,
    user: { id: 1, name: 'Budi', role: 'author' },
  },
})

describe('client', () => {
  beforeEach(() => {
    setSession({ accessToken: 'access-lama', refreshToken: 'refresh-lama', user: { id: 1, role: 'reader' } })
  })

  afterEach(() => {
    clearSession()
    delete api.defaults.adapter
    delete authClient.defaults.adapter
  })

  it('me-refresh sekali untuk beberapa request 401 lalu mengulanginya', async () => {
    api.defaults.adapter = respond((config) => (
      config.headers.Authorization === 'Bearer access-baru'
        ? { status: 200, data: { data: config.url } }
        : { status: 401, data: { error: { code: 'unauthorized' } } }
    ))
    authClient.defaults.adapter = respond(() => ({ status: 200, data: tokens('baru') }))

    const results = await Promise.all([api.get('/api/v1/me'), api.get('/api/v1/me/articles')])

    expect(results.map((result) => result.data.data)).toEqual(['/api/v1/me', '/api/v1/me/articles'])
    expect(authClient.defaults.adapter).toHaveBeenCalledTimes(1)
    expect(getSession().refreshToken).toBe('refresh-baru')
    expect(getSession().user.role).toBe('author')
  })

  it('menghapus sesi bila refresh gagal dan mengulang GET sebagai pengunjung', async () => {
    api.defaults.adapter = respond((config) => (
      config.headers.Authorization
        ? { status: 401, data: {} }
        : { status: 200, data: { data: 'publik' } }
    ))
    authClient.defaults.adapter = respond(() => ({ status: 401, data: {} }))

    const result = await api.get('/api/v1/articles')

    expect(result.data.data).toBe('publik')
    expect(getSession()).toBeNull()
  })

  it('tidak mengulang permintaan selain GET setelah sesi berakhir', async () => {
    api.defaults.adapter = respond(() => ({ status: 401, data: {} }))
    authClient.defaults.adapter = respond(() => ({ status: 401, data: {} }))

    await expect(api.post('/api/v1/articles', {})).rejects.toMatchObject({ response: { status: 401 } })
    expect(api.defaults.adapter).toHaveBeenCalledTimes(1)
  })
})
