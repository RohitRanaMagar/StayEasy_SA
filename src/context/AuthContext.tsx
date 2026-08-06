import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import api from '../api'

interface AuthContextType {
  user: unknown
  login: (token: string, remember: boolean, userType: string, refreshToken?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<unknown>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (token) {
      setUser({ token })
    }
  }, [])

  const login = async (token: string, remember: boolean, _userType: string, refreshToken?: string) => {
    const storage = remember ? localStorage : sessionStorage
    storage.setItem('accessToken', token)
    if (refreshToken) storage.setItem('refreshToken', refreshToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser({ token })
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
