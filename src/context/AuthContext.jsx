import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/authApi.js'
import { getSession, subscribeSession } from '../api/session.js'
import AuthContext from './authContext.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession()?.user ?? null)

  useEffect(() => subscribeSession((session) => setUser(session?.user ?? null)), [])

  // Data akun di sesi bisa usang, misalnya email diverifikasi di perangkat
  // lain. Dimuat ulang sekali saat aplikasi dibuka.
  useEffect(() => {
    if (getSession()) authApi.refreshUser().catch(() => {})
  }, [])

  const logout = useCallback(() => authApi.logout(), [])

  const value = useMemo(() => {
    const role = user?.role
    return {
      user,
      isAuthenticated: Boolean(user),
      isAdmin: role === 'admin',
      // false hanya bila backend menyatakan belum terverifikasi; sesi lama
      // tanpa field ini tidak dianggap belum terverifikasi.
      needsVerification: user?.email_verified === false,
      canWrite: role === 'admin' || role === 'author',
      login: authApi.login,
      register: authApi.register,
      refreshUser: authApi.refreshUser,
      logout,
    }
  }, [user, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
