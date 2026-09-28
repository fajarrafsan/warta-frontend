import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/authApi.js'
import { getSession, subscribeSession } from '../api/session.js'
import AuthContext from './authContext.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession()?.user ?? null)

  useEffect(() => subscribeSession((session) => setUser(session?.user ?? null)), [])

  const logout = useCallback(() => authApi.logout(), [])

  const value = useMemo(() => {
    const role = user?.role
    return {
      user,
      isAuthenticated: Boolean(user),
      isAdmin: role === 'admin',
      canWrite: role === 'admin' || role === 'author',
      login: authApi.login,
      register: authApi.register,
      logout,
    }
  }, [user, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
