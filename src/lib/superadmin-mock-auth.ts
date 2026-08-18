const MOCK_CREDENTIALS = {
  email: 'mock@serveiq.com',
  password: 'Admin@123',
}

const CREDS_KEY = 'superAdminSavedCredentials'

export interface SavedCredentials {
  email: string
  password: string
}

export interface MockLoginResult {
  success: boolean
  token?: string
  refreshToken?: string
  forcePasswordChange?: boolean
  isProfileComplete?: boolean
  error?: string
}

function generateToken(): string {
  return `sa_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getSavedCredentials(): SavedCredentials | null {
  try {
    const raw = localStorage.getItem(CREDS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SavedCredentials
  } catch {
    return null
  }
}

export function saveCredentials(email: string, password: string): void {
  const creds: SavedCredentials = { email, password }
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds))
}

export function clearSavedCredentials(): void {
  localStorage.removeItem(CREDS_KEY)
}

export async function mockSuperAdminLogin(
  email: string,
  password: string
): Promise<MockLoginResult> {
  await delay(500 + Math.random() * 300)

  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPassword = password.trim()

  const saved = getSavedCredentials()
  if (saved) {
    if (normalizedEmail === saved.email.toLowerCase() && normalizedPassword === saved.password) {
      return {
        success: true,
        token: generateToken(),
        refreshToken: generateToken(),
        forcePasswordChange: false,
        isProfileComplete: true,
      }
    }
    return {
      success: false,
      error: 'Invalid email or password.',
    }
  }

  if (normalizedEmail === MOCK_CREDENTIALS.email && normalizedPassword === MOCK_CREDENTIALS.password) {
    return {
      success: true,
      token: generateToken(),
      refreshToken: generateToken(),
      forcePasswordChange: true,
      isProfileComplete: false,
    }
  }

  return {
    success: false,
    error: 'Invalid email or password.',
  }
}
