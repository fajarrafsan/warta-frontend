import { api, authClient } from './client.js'
import { call } from './errors.js'
import { clearSession, getSession, setSession, toSession } from './session.js'

export async function login(email, password) {
  return call(async () => {
    const response = await authClient.post('/api/v1/auth/login', { email, password })
    const session = toSession(response.data.data)
    setSession(session)
    return session.user
  })
}

export async function register({ name, email, password }) {
  return call(async () => {
    const response = await authClient.post('/api/v1/auth/register', { name, email, password })
    const session = toSession(response.data.data)
    setSession(session)
    return session.user
  })
}

// logout selalu menghapus sesi lokal, walau backend tidak terjangkau.
export async function logout() {
  const refreshToken = getSession()?.refreshToken
  clearSession()

  if (!refreshToken) return
  try {
    await authClient.post('/api/v1/auth/logout', { refresh_token: refreshToken })
  } catch {
    // Token tetap kedaluwarsa dengan sendirinya.
  }
}

export async function getMe() {
  return call(async () => {
    const response = await api.get('/api/v1/me')
    return response.data.data
  })
}
