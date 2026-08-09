import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { AxiosError } from 'axios'
import api from '../api'
import type { User } from '../types'

type AuthRole = 'guest' | 'host'

interface AuthContextValue {
  user: User | null
  token: string | null
  role: AuthRole
  loading: boolean
  login: (token: string, remember?: boolean, role?: AuthRole, refreshToken?: string) => Promise<void>
  credentialLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const TOKEN_KEY = 'token'
const REFRESH_KEY = 'refreshToken'
const ROLE_KEY = 'authRole'
const EXPIRY_KEY = 'tokenExpiry'
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000

function storageGet(key: string): string | null {
  return localStorage.getItem(key) || sessionStorage.getItem(key)
}

function readToken(): string | null {
  const persisted = localStorage.getItem(TOKEN_KEY)
  if (persisted) {
    const expiresAt = Number(localStorage.getItem(EXPIRY_KEY) || 0)
    if (expiresAt && Date.now() > expiresAt) {
      clearAuth()
      return null
    }
    return persisted
  }
  return sessionStorage.getItem(TOKEN_KEY)
}

function readRole(): AuthRole {
  return storageGet(ROLE_KEY) === 'guest' ? 'guest' : 'host'
}

function saveAuth(token: string, remember: boolean, role: AuthRole, refreshToken?: string) {
  const keys = [TOKEN_KEY, REFRESH_KEY, ROLE_KEY, EXPIRY_KEY]
  keys.forEach((k) => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  })
  const store = remember ? localStorage : sessionStorage
  store.setItem(TOKEN_KEY, token)
  store.setItem(ROLE_KEY, role)
  if (refreshToken) store.setItem(REFRESH_KEY, refreshToken)
  if (remember) store.setItem(EXPIRY_KEY, (Date.now() + EXPIRY_MS).toString())
}

function clearAuth() {
  const keys = [TOKEN_KEY, REFRESH_KEY, ROLE_KEY, EXPIRY_KEY]
  keys.forEach((k) => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  })
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapUser(u: User): User {
  const name = u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email
  const parts = name.split(' ')
  return {
    ...u,
    firstName: u.firstName || u.first_name || parts[0] || '',
    lastName: u.lastName || u.last_name || parts.slice(1).join(' ') || '',
    name,
    avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=2E86AB&textColor=ffffff`,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => readToken())
  const [role, setRole] = useState<AuthRole>(() => readRole())
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const guest = readRole() === 'guest'
      const { data } = await api.get<User>(guest ? '/auth/guests/me' : '/auth/users/me')
      setUser(mapUser({ ...data, role: guest ? 'Guest' : data.role }))
    } catch {
      clearAuth()
      setToken(null)
      setUser(null)
    }
  }

  useEffect(() => {
    if (token) {
      fetchUser().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (newToken: string, remember = true, newRole: AuthRole = 'host', refreshToken?: string) => {
    saveAuth(newToken, remember, newRole, refreshToken)
    setRole(newRole)
    setToken(newToken)
    await fetchUser()
  }

  const credentialLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const params = new URLSearchParams()
      params.append('username', email)
      params.append('password', password)
      const res = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      await login(res.data.access_token, true, 'host', res.data.refresh_token)
      return { success: true }
    } catch (err) {
      let msg = 'Incorrect email or password.'
      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as Record<string, unknown>
        if (typeof data.detail === 'string') msg = data.detail
        else if (typeof data.message === 'string') msg = data.message
      }
      return { success: false, error: msg }
    }
  }

  const signup = async (fullName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.post('/auth/users/register', {
        full_name: fullName,
        email,
        password,
      })
      return { success: true }
    } catch (err) {
      let msg = 'Could not create account. Please try again.'
      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as Record<string, unknown>
        if (typeof data.detail === 'string') msg = data.detail
        else if (typeof data.message === 'string') msg = data.message
      }
      return { success: false, error: msg }
    }
  }

  const logout = () => {
    clearAuth()
    try {
      const keys = Object.keys(localStorage)
      for (const key of keys) {
        if (key === 'ServeIQDraft' || key.startsWith('ServeIQDraft_')) {
          localStorage.removeItem(key)
        }
      }
    } catch {}
    setToken(null)
    setUser(null)
    setRole('host')
  }

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, credentialLogin, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
