import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'devpulse_gh_token'
const USER_KEY  = 'devpulse_gh_user'

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // On mount: token exists but user not cached → re-fetch
  useEffect(() => {
    if (token && !user) fetchUser(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchUser = useCallback(async (tok) => {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tok}`, Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) { logout(); throw new Error('Token invalid or expired') }
    const data = await res.json()
    setUser(data)
    localStorage.setItem(USER_KEY, JSON.stringify(data))
    return data
  }, []) // logout defined below — safe because it only uses setters

  const loginWithToken = useCallback(async (tok) => {
    setLoading(true)
    setError(null)
    try {
      localStorage.setItem(TOKEN_KEY, tok)
      setToken(tok)
      return await fetchUser(tok)
    } catch (e) {
      setError(e.message)
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [fetchUser])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    token, user, loading, error,
    isAuthenticated: !!(token && user),
    loginWithToken, logout,
  }), [token, user, loading, error, loginWithToken, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
