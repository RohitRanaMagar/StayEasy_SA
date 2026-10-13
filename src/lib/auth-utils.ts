const SUPER_ADMIN_KEYS = [
  'token',
  'superAdminToken',
  'accessToken',
  'refreshToken',
  'tempToken',
  'userType',
  'authRole',
  'tokenExpiry',
] as const

export function superAdminLogout(): void {
  SUPER_ADMIN_KEYS.forEach(key => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
}

export function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function clearAuthStorage(): void {
  SUPER_ADMIN_KEYS.forEach(key => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
}
