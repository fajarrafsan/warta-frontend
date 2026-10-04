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

// refreshUser memuat ulang data akun (misalnya status verifikasi email) ke
// sesi yang tersimpan.
export async function refreshUser() {
  const user = await getMe()
  const session = getSession()
  if (session) setSession({ ...session, user })
  return user
}

// Token verifikasi hanya berlaku sekali, sedangkan React StrictMode menjalankan
// efek dua kali saat development. Permintaan untuk token yang sama dibagi.
const verifying = new Map()

export function verifyEmail(token) {
  if (!verifying.has(token)) {
    verifying.set(token, call(async () => {
      const response = await authClient.post('/api/v1/auth/verify-email', { token })
      const user = response.data.data
      const session = getSession()
      if (session?.user?.id === user.id) setSession({ ...session, user })
      return user
    }).catch((error) => {
      // Hanya hasil yang berhasil disimpan; kegagalan jaringan boleh dicoba lagi.
      if (!error.status) verifying.delete(token)
      throw error
    }))
  }
  return verifying.get(token)
}

export async function resendVerification() {
  return call(() => api.post('/api/v1/auth/resend-verification'))
}

export async function forgotPassword(email) {
  return call(() => authClient.post('/api/v1/auth/forgot-password', { email }))
}

export async function resetPassword(token, newPassword) {
  return call(() => authClient.post('/api/v1/auth/reset-password', { token, new_password: newPassword }))
}

// updateProfile mengubah nama, bio, atau foto (hanya field yang dikirim) lalu
// memperbarui data akun di sesi.
export async function updateProfile(changes) {
  return call(async () => {
    const response = await api.patch('/api/v1/me', changes)
    const user = response.data.data
    const session = getSession()
    if (session) setSession({ ...session, user })
    return user
  })
}

// changePassword mencabut semua sesi di backend, termasuk sesi ini.
export async function changePassword(currentPassword, newPassword) {
  return call(() => api.put('/api/v1/me/password', {
    current_password: currentPassword,
    new_password: newPassword,
  }))
}
