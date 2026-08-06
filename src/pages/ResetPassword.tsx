import { useState } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import BuildingScene from '../components/superadmin/BuildingScene'
import api from '../api'

const PASSWORD_RE = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/

function extractError(err: unknown, fallback = 'Could not reset your password. The token may be invalid or expired.'): string {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data as Record<string, unknown>
    if (typeof data.detail === 'string') return data.detail
    if (typeof data.message === 'string') return data.message
  }
  return fallback
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isHost = location.pathname.startsWith('/host')

  const [token, setToken] = useState(searchParams.get('token') || '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loginPath = isHost ? '/host/login' : '/login'

  const handleReset = async () => {
    setError('')
    if (!token.trim()) { setError('Enter the reset token from your email.'); return }
    if (!PASSWORD_RE.test(password)) { setError('Password must be 8+ characters with a number and a special character.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: password })
      setDone(true)
    } catch (err) {
      setError(extractError(err))
    } finally {
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
          {!done ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 3 }}>
                Reset password
              </div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 14 }}>
                Enter the reset token from your email and choose a new password.
              </div>

              <div style={{ position: 'relative', marginBottom: 10 }}>
                <label
                  style={{
                    fontSize: 11, color: '#666', marginBottom: 3, display: 'block',
                    textTransform: 'uppercase', letterSpacing: '0.4px',
                  }}
                >
                  Reset token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="Paste the token from the email"
                  autoComplete="off"
                  style={{
                    width: '100%', border: 'none', borderBottom: '1.5px solid #ddd',
                    padding: '7px 26px 7px 0', fontSize: 14, color: '#111', outline: 'none', background: 'transparent',
                    fontWeight: 600,
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
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
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

              {error && (
                <p style={{ color: '#e94560', fontSize: 12, marginBottom: 8 }}>{error}</p>
              )}

              <button
                onClick={handleReset}
                disabled={loading}
                style={{
                  width: '100%', padding: 11, background: '#111', border: 'none', borderRadius: 8,
                  color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                  marginTop: 0, opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 6, fontSize: 12, color: '#aaa' }}>
                Didn't get a token?{' '}
                <span
                  onClick={() => navigate(isHost ? '/host/forgot-password' : '/forgot-password')}
                  style={{ color: '#111', fontWeight: 600, cursor: 'pointer' }}
                >
                  Request a new link
                </span>
              </div>
            </>
          ) : (
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
                onClick={() => navigate(loginPath)}
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
            fieldsReady={token.trim().length > 0 && password.trim().length > 0}
            loginClicked={done}
            passwordFocused={!done && (showPw || showConfirm)}
            passwordVisible={showPw}
          />
        </div>
      </div>
    </div>
  )
}
