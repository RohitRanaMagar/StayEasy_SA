import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import loginHero from '../assets/Untitled-design-(2).mp4'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useSuperAdminStore } from '../components/superadmin/superAdminStore'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function extractError(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data as Record<string, unknown>
    if (typeof data.detail === 'string') return data.detail
    if (typeof data.message === 'string') return data.message
  }
  return 'Invalid email or password.'
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    document.body.style.background = 'transparent'
    document.documentElement.style.background = '#000'
    return () => {
      document.body.style.background = ''
      document.documentElement.style.background = ''
    }
  }, [])

  const { login: authLogin } = useAuth()
  const superAdminLogin = useSuperAdminStore(s => s.login)

  const isSuperAdmin = location.pathname.startsWith('/superadmin')
  const isHost = location.pathname.startsWith('/host') || searchParams.get('host') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(true)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')

    if (!email.trim()) { setError('Email is required.'); return }
    if (!EMAIL_RE.test(email)) { setError('Please enter a valid email address.'); return }
    if (!password.trim()) { setError('Password is required.'); return }

    setLoading(true)
    try {
      if (isSuperAdmin) {
        const result = await superAdminLogin(email, password, remember)
        if (result.forcePasswordChange || !result.isProfileComplete) {
          navigate('/superadmin/profile')
        } else {
          navigate('/superadmin')
        }
      } else {
        const params = new URLSearchParams()
        params.append('grant_type', 'password')
        params.append('username', email)
        params.append('password', password)
        const res = await api.post('/auth/login', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        await authLogin(res.data.access_token, remember, isHost ? 'host' : 'guest', res.data.refresh_token)
        if (!isHost) {
          setTimeout(() => navigate('/'), 800)
          return
        }
        try {
          const pmsApi = await import('../services/pmsApi')
          const properties = await pmsApi.getAllProperties()
          if (Array.isArray(properties) && properties.length > 0) {
            setTimeout(() => navigate('/host/my-properties'), 1500)
          } else {
            setTimeout(() => navigate('/host/portal'), 1500)
          }
        } catch {
          setTimeout(() => navigate('/host/portal'), 1500)
        }
      }
    } catch (err) {
      setError(extractError(err))
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e8e8e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          width: 820,
          height: 470,
          background: '#fff',
          borderRadius: 16,
          display: 'flex',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
        }}
      >
        <div style={{ width: '50%', background: '#dde0ee', order: 1, flexShrink: 0, position: 'relative' }}>
              <video
                src={loginHero}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
            </div>

            <div
              style={{
                width: '50%',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '36px 32px 42px',
                order: 2,
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', marginBottom: 8 }}>
                <div
                  style={{
                    padding: '3px 0',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    color: '#111',
                    borderBottom: '2px solid #111',
                    marginRight: 18,
                  }}
                >
                  Login
                </div>
                {!isSuperAdmin && (
                  <div
                    onClick={() => navigate(isHost ? '/host/signup' : '/signup')}
                    style={{
                      padding: '3px 0',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                      color: '#ccc',
                      borderBottom: '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    Sign up
                  </div>
                )}
              </div>

              <div style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 3 }}>
                {isSuperAdmin ? 'Welcome back, Super Admin' : isHost ? 'Welcome Back, Host' : 'Welcome back!'}
              </div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>
                {isSuperAdmin ? 'Access your admin panel' : isHost ? 'Manage your properties' : 'Please enter your details'}
              </div>

              <div style={{ position: 'relative', marginBottom: 13 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: '#666',
                    marginBottom: 3,
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="off"
                  style={{
                    width: '100%',
                    border: 'none',
                    borderBottom: '1.5px solid #ddd',
                    padding: '7px 26px 7px 0',
                    fontSize: 14,
                    color: '#111',
                    outline: 'none',
                    background: 'transparent',
                  }}
                />
              </div>

              <div style={{ position: 'relative', marginBottom: 13 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: '#666',
                    marginBottom: 3,
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  Password
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Set your password"
                  autoComplete="off"
                  style={{
                    width: '100%',
                    border: 'none',
                    borderBottom: '1.5px solid #ddd',
                    padding: '7px 26px 7px 0',
                    fontSize: 14,
                    color: '#111',
                    outline: 'none',
                    background: 'transparent',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  aria-label="Toggle password visibility"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#bbb',
                    fontSize: 15,
                    padding: 0,
                  }}
                >
                  {showPw ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 13 }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  style={{ width: 12, height: 12, accentColor: '#111' }}
                />
                <label htmlFor="remember" style={{ fontSize: 11, color: '#999' }}>
                  Remember me
                </label>
                <span
                  onClick={() => navigate(isSuperAdmin ? '/superadmin/forgot-password' : isHost ? '/host/forgot-password' : '/forgot-password')}
                  style={{ fontSize: 11, color: '#bbb', cursor: 'pointer', marginLeft: 'auto' }}
                >
                  Forgot password?
                </span>
              </div>

              {error && (
                <p style={{ color: '#e94560', fontSize: 12, marginBottom: 10 }}>{error}</p>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: 11,
                  background: '#111',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'default' : 'pointer',
                  marginTop: 2,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Signing in...' : 'Log In'}
              </button>

              {!isSuperAdmin && (
                <div style={{ textAlign: 'center', marginTop: 11, fontSize: 12, color: '#aaa' }}>
                  Don't have an account?{' '}
                  <span
                    onClick={() => navigate(isHost ? '/host/signup' : '/signup')}
                    style={{ color: '#111', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Sign up
                  </span>
                </div>
              )}
            </div>
          </div>
    </div>
  )
}
