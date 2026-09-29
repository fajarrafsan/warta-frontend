import axios from 'axios'
import { clearSession, getSession, setSession, toSession } from './session.js'

// Kosong berarti origin yang sama; saat development Vite meneruskan /api dan
// /health ke backend.
const baseURL = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '') || ''

// assetUrl mengubah path berkas dari backend (misalnya /uploads/ab12.png)
// menjadi URL lengkap bila backend berada di origin lain.
export function assetUrl(path) {
  if (!path || /^https?:\/\//.test(path)) return path || ''
  return `${baseURL}${path}`
}

const defaults = {
  baseURL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
}

export const api = axios.create(defaults)

// authClient tidak memakai interceptor di bawah, supaya permintaan refresh
// yang gagal tidak memicu refresh lagi.
export const authClient = axios.create(defaults)

api.interceptors.request.use((config) => {
  const token = getSession()?.accessToken
  if (token && !config.anonymous) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let pendingRefresh = null

// refreshSession menukar refresh token dengan pasangan token baru. Permintaan
// yang bersamaan berbagi satu proses refresh, karena refresh token hanya
// berlaku sekali.
export function refreshSession() {
  if (!pendingRefresh) {
    const refreshToken = getSession()?.refreshToken

    pendingRefresh = (refreshToken
      ? authClient.post('/api/v1/auth/refresh', { refresh_token: refreshToken })
      : Promise.reject(new Error('tidak ada refresh token'))
    )
      .then((response) => {
        setSession(toSession(response.data.data))
        return true
      })
      .catch(() => {
        clearSession()
        return false
      })
      .finally(() => {
        pendingRefresh = null
      })
  }

  return pendingRefresh
}

api.interceptors.response.use(undefined, async (error) => {
  const { config, response } = error
  const sentToken = config?.headers?.Authorization

  if (!config || response?.status !== 401 || !sentToken || config.retried) {
    throw error
  }
  config.retried = true

  // Token sudah diperbarui oleh permintaan lain selagi yang ini berjalan.
  const currentToken = getSession()?.accessToken
  if (currentToken && sentToken !== `Bearer ${currentToken}`) {
    return api(config)
  }

  if (await refreshSession()) {
    return api(config)
  }

  // Sesi berakhir. Bacaan publik tetap bisa dilanjutkan sebagai pengunjung.
  if (config.method === 'get') {
    config.anonymous = true
    config.headers.delete?.('Authorization')
    delete config.headers.Authorization
    return api(config)
  }

  throw error
})
