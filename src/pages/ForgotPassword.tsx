import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AxiosError } from 'axios'
import BuildingScene from '../components/superadmin/BuildingScene'
import api from '../api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function extractError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data as Record<string, unknown>
    if (typeof data.detail === 'string') return data.detail
    if (typeof data.message === 'string') return data.message
  }
  return fallback
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHost = location.pathname.startsWith('/host')

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loginPath = isHost ? '/host/login' : '/login'

  const handleSend = async () => {
    setError('')
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(extractError(err, 'Could not send reset link. Please check your email and try again.'))
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
          {!sent ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 3 }}>
                Forgot password?
              </div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>
                Enter your email and we'll send you a reset link.
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
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="off"
                  style={{
                    width: '100%', border: 'none', borderBottom: '1.5px solid #ddd',
                    padding: '7px 26px 7px 0', fontSize: 14, color: '#111', outline: 'none', background: 'transparent',
                  }}
                />
              </div>

              {error && (
                <p style={{ color: '#e94560', fontSize: 12, marginBottom: 10 }}>{error}</p>
              )}

              <button
                onClick={handleSend}
                disabled={loading}
                style={{
                  width: '100%', padding: 11, background: '#111', border: 'none', borderRadius: 8,
                  color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                  marginTop: 2, opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#aaa' }}>
                Remembered it?{' '}
                <span
                  onClick={() => navigate(loginPath)}
                  style={{ color: '#111', fontWeight: 600, cursor: 'pointer' }}
                >
                  Back to login
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✓</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 4 }}>
                  Check your email
                </div>
                <p style={{ fontSize: 13, color: '#1E8449', fontWeight: 600 }}>
                  We emailed a reset link to <strong>{email}</strong>
                </p>
                <p style={{ fontSize: 12, color: '#999', marginTop: 10 }}>
                  Open the link in the email to set a new password. If you don't see it, check your spam folder.
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
            fieldsReady={email.trim().length > 0}
            loginClicked={sent}
            passwordFocused={false}
            passwordVisible={false}
          />
        </div>
      </div>
    </div>
  )
}
