import axios, { type InternalAxiosRequestConfig } from 'axios'

const TOKEN_KEY = 'token'
const REFRESH_KEY = 'refreshToken'
const ROLE_KEY = 'authRole'
const EXPIRY_KEY = 'tokenExpiry'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://stay-easy-sizw.onrender.com/api/v1',
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
  }
})

function storageGet(key: string): string | null {
  return localStorage.getItem(key) || sessionStorage.getItem(key)
}

function updateAccessToken(token: string) {
  if (localStorage.getItem(TOKEN_KEY)) localStorage.setItem(TOKEN_KEY, token)
  else if (sessionStorage.getItem(TOKEN_KEY)) sessionStorage.setItem(TOKEN_KEY, token)
}

function clearAuthStorage() {
  const keys = [TOKEN_KEY, REFRESH_KEY, ROLE_KEY, EXPIRY_KEY]
  keys.forEach((k) => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  })
}

api.interceptors.request.use((config) => {
  const token = storageGet(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = storageGet(REFRESH_KEY)
  if (!refreshToken) throw new Error('No refresh token available')
  const role = storageGet(ROLE_KEY) === 'guest' ? 'guests' : 'users'
  const { data } = await axios.post(`${api.defaults.baseURL}/auth/${role}/refresh`, {
    refresh_token: refreshToken,
  })
  updateAccessToken(data.access_token)
  return data.access_token
}

function redirectToLogin() {
  const role = storageGet(ROLE_KEY)
  clearAuthStorage()
  window.location.href = role === 'guest' ? '/login' : '/host/login'
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }
        const newToken = await refreshPromise
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        if (storageGet('userType') !== 'superadmin') {
          redirectToLogin()
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
