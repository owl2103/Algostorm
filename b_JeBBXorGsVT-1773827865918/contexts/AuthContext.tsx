'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

type User = { email: string; name: string }

type AuthContextType = {
  user: User | null
  isLoaded: boolean
  login: (email: string, password: string) => boolean
  signup: (email: string, password: string, name: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'medpredict_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as User
        setUser(parsed)
      }
    } catch {
      setUser(null)
    }
    setIsLoaded(true)
  }, [])

  const login = useCallback((email: string, password: string) => {
    // Fire-and-forget style API call; UI handles errors separately
    void (async () => {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = (await r.json()) as { user?: User; error?: string }
      if (!r.ok || !data.user) throw new Error(data.error || 'Login failed')
      setUser(data.user)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
    })()
    return true
  }, [])

  const signup = useCallback((email: string, password: string, name: string) => {
    void (async () => {
      const r = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = (await r.json()) as { user?: User; error?: string }
      if (!r.ok || !data.user) throw new Error(data.error || 'Signup failed')
      setUser(data.user)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
    })()
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoaded, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
