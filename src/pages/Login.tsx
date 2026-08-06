import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import BuildingScene from '../components/superadmin/BuildingScene'
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
  const [pwFocused, setPwFocused] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginClicked, setLoginClicked] = useState(false)

  const [view, setView] = useState<'login' | 'forgot'>('login')
  const [fpEmail, setFpEmail] = useState('')
  const [fpStep, setFpStep] = useState(1)
  const [fpOtp, setFpOtp] = useState('')
  const [fpNewPassword, setFpNewPassword] = useState('')
  const [fpConfirmPassword, setFpConfirmPassword] = useState('')
  const [fpLoading, setFpLoading] = useState(false)
  const [fpError, setFpError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const fieldsReady = email.trim().length > 0 && password.trim().length > 0

  const handleLogin = async () => {
    setError('')
    setLoginClicked(true)

    if (!email.trim()) { setError('Email is required.'); setLoginClicked(false); return }
    if (!EMAIL_RE.test(email)) { setError('Please enter a valid email address.'); setLoginClicked(false); return }
    if (!password.trim()) { setError('Password is required.'); setLoginClicked(false); return }

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
          const { default: pmsApi } = await import('../services/pmsApi')
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
      setLoginClicked(false)
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
          width: 640,
          height: 440,
          background: '#fff',
          borderRadius: 16,
          display: 'flex',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
        }}
      >
        {view === 'login' && (
          <>
            <div style={{ width: '50%', background: '#dde0ee', order: 1, flexShrink: 0 }}>
              <BuildingScene
                mode="login"
                fieldsReady={fieldsReady}
                loginClicked={loginClicked}
                passwordFocused={pwFocused}
                passwordVisible={showPw}
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
                  onFocus={() => setPwFocused(false)}
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
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setPwFocused(false)}
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
                {isSuperAdmin ? (
                  <span
                    onClick={() => {
                      setFpEmail(email)
                      setFpError('')
                      setFpStep(1)
                      setView('forgot')
                    }}
                    style={{ fontSize: 11, color: '#bbb', cursor: 'pointer', marginLeft: 'auto' }}
                  >
                    Forgot password?
                  </span>
                ) : (
                  <span
                    onClick={() => navigate(isHost ? '/host/forgot-password' : '/forgot-password')}
                    style={{ fontSize: 11, color: '#bbb', cursor: 'pointer', marginLeft: 'auto' }}
                  >
                    Forgot password?
                  </span>
                )}
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
          </>
        )}

        {view === 'forgot' && isSuperAdmin && (
          <>
            <div
              className="custom-scroll"
              style={{
                width: '50%',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '28px 32px 32px',
                order: 1,
                flexShrink: 0,
                overflowY: 'auto',
              }}
            >
              {fpStep === 1 && (
                <>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 3 }}>
                    Forgot password?
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>
                    Enter your email and we'll send you a reset code.
                  </div>

                  <div style={{ position: 'relative', marginBottom: 13 }}>
                    <label
                      style={{
                        fontSize: 11, color: '#666', marginBottom: 3, display: 'block',
                        textTransform: 'uppercase', letterSpacing: '0.4px',
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={fpEmail}
                      onChange={e => setFpEmail(e.target.value)}
                      placeholder="Enter your email"
                      autoComplete="off"
                      style={{
                        width: '100%', border: 'none', borderBottom: '1.5px solid #ddd',
                        padding: '7px 26px 7px 0', fontSize: 14, color: '#111', outline: 'none', background: 'transparent',
                      }}
                    />
                  </div>

                  {fpError && (
                    <p style={{ color: '#e94560', fontSize: 12, marginBottom: 10 }}>{fpError}</p>
                  )}

                  <button
                    onClick={async () => {
                      setFpError('')
                      if (!fpEmail.trim()) { setFpError('Email is required.'); return }
                      if (!EMAIL_RE.test(fpEmail.trim())) { setFpError('Please enter a valid email address.'); return }
                      setFpLoading(true)
                      await new Promise(r => setTimeout(r, 800))
                      setFpStep(2)
                      setFpLoading(false)
                    }}
                    disabled={fpLoading}
                    style={{
                      width: '100%', padding: 11, background: '#111', border: 'none', borderRadius: 8,
                      color: '#fff', fontSize: 14, fontWeight: 600, cursor: fpLoading ? 'default' : 'pointer',
                      marginTop: 2, opacity: fpLoading ? 0.7 : 1,
                    }}
                  >
                    {fpLoading ? 'Sending...' : 'Send Reset Code'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#aaa' }}>
                    Remembered it?{' '}
                    <span
                      onClick={() => { setView('login'); setFpStep(1); setFpError('') }}
                      style={{ color: '#111', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Back to login
                    </span>
                  </div>
                </>
              )}

              {fpStep === 2 && (
                <>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 3 }}>
                    Reset password
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 14 }}>
                    A reset code was sent to <strong>{fpEmail}</strong>
                  </div>

                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <label
                      style={{
                        fontSize: 11, color: '#666', marginBottom: 3, display: 'block',
                        textTransform: 'uppercase', letterSpacing: '0.4px',
                      }}
                    >
                      Reset code
                    </label>
                    <input
                      type="text"
                      value={fpOtp}
                      onChange={e => setFpOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      autoComplete="off"
                      style={{
                        width: '100%', border: 'none', borderBottom: '1.5px solid #ddd',
                        padding: '7px 26px 7px 0', fontSize: 14, color: '#111', outline: 'none', background: 'transparent',
                        letterSpacing: 6, fontWeight: 600,
                      }}
                    />
                  </div>

                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <label
                      style={{
                        fontSize: 11, color: '#666', marginBottom: 3, display: 'block',
                        textTransform: 'uppercase', letterSpacing: '0.4px',
                      }}
                    >
                      New password
                    </label>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={fpNewPassword}
                      onChange={e => setFpNewPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="off"
                      style={{
                        width: '100%', border: 'none', borderBottom: '1.5px solid #ddd',
                        padding: '7px 26px 7px 0', fontSize: 14, color: '#111', outline: 'none', background: 'transparent',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => !p)}
                      aria-label="Toggle password visibility"
                      style={{
                        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: 15, padding: 0,
                      }}
                    >
                      {showPw ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>

                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <label
                      style={{
                        fontSize: 11, color: '#666', marginBottom: 3, display: 'block',
                        textTransform: 'uppercase', letterSpacing: '0.4px',
                      }}
                    >
                      Confirm password
                    </label>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={fpConfirmPassword}
                      onChange={e => setFpConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      autoComplete="off"
                      style={{
                        width: '100%', border: 'none', borderBottom: '1.5px solid #ddd',
                        padding: '7px 26px 7px 0', fontSize: 14, color: '#111', outline: 'none', background: 'transparent',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(p => !p)}
                      aria-label="Toggle confirm password visibility"
                      style={{
                        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: 15, padding: 0,
                      }}
                    >
                      {showConfirm ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: '#bbb', marginBottom: 6 }}>
                    Must be 8+ characters with a number and a special character.
                  </div>

                  {fpError && (
                    <p style={{ color: '#e94560', fontSize: 12, marginBottom: 8 }}>{fpError}</p>
                  )}

                  <button
                    onClick={async () => {
                      setFpError('')
                      if (!fpOtp || fpOtp.length < 6) { setFpError('Enter the 6-digit code.'); return }
                      if (fpNewPassword !== fpConfirmPassword) { setFpError('Passwords do not match.'); return }
                      setFpLoading(true)
                      await new Promise(r => setTimeout(r, 800))
                      setFpStep(3)
                      setFpLoading(false)
                    }}
                    disabled={fpLoading}
                    style={{
                      width: '100%', padding: 11, background: '#111', border: 'none', borderRadius: 8,
                      color: '#fff', fontSize: 14, fontWeight: 600, cursor: fpLoading ? 'default' : 'pointer',
                      marginTop: 0, opacity: fpLoading ? 0.7 : 1,
                    }}
                  >
                    {fpLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </>
              )}

              {fpStep === 3 && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>✓</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 4 }}>
                      Password reset
                    </div>
                    <p style={{ fontSize: 13, color: '#1E8449', fontWeight: 600 }}>
                      Your password has been reset successfully!
                    </p>
                  </div>

                  <button
                    onClick={() => { setView('login'); setFpStep(1); setFpOtp(''); setFpNewPassword(''); setFpConfirmPassword('') }}
                    style={{
                      width: '100%', padding: 11, background: '#111', border: 'none', borderRadius: 8,
                      color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 2,
                    }}
                  >
                    Back to login
                  </button>
                </>
              )}
            </div>

            <div style={{ width: '50%', background: '#dde0ee', order: 2, flexShrink: 0 }}>
              <BuildingScene
                mode="login"
                fieldsReady={fpEmail.trim().length > 0 || fpStep > 1}
                loginClicked={fpStep >= 2}
                passwordFocused={fpStep === 2 && (showPw || showConfirm)}
                passwordVisible={showPw}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
