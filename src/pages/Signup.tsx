import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import loginHero from '../assets/Untitled-design-(2).mp4'
import api from '../api'
import toast from 'react-hot-toast'

const PASSWORD_RE = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function extractError(err: unknown, fallback = 'Could not create account. Please check your details and try again.'): string {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data as Record<string, unknown>
    if (typeof data.detail === 'string') return data.detail
    if (typeof data.message === 'string') return data.message
    if (Array.isArray(data.errors) && data.errors[0]?.msg) return data.errors[0].msg
  }
  return fallback
}

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isHost = location.pathname.startsWith('/host') || searchParams.get('host') === 'true'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [nationality, setNationality] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [showOtpStep, setShowOtpStep] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setInterval(() => {
      setResendTimer(t => t - 1)
    }, 1000)
    return () => clearInterval(id)
  }, [resendTimer])

  const handleSignup = async () => {
    setError('')

    if (!fullName.trim()) { setError('Full name is required.'); return }
    if (!phone.trim()) { setError('Phone number is required.'); return }
    if (!isHost && !nationality.trim()) { setError('Nationality is required.'); return }
    if (!EMAIL_RE.test(email)) { setError('Please enter a valid email address.'); return }
    if (!PASSWORD_RE.test(password)) { setError('Password must be 8+ characters with a number and a special character.'); return }
    setLoading(true)
    try {
      await api.post(isHost ? '/auth/users/register' : '/auth/guests/register', {
        full_name: fullName,
        email,
        phone,
        nationality,
        password,
      })
      toast.success('Verification code sent to your email')
      setShowOtpStep(true)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError('')
    setOtpLoading(true)
    try {
      await api.post(isHost ? '/auth/users/verify-otp' : '/auth/guests/verify-otp', { email, otp })
      setVerified(true)
      toast.success('Account verified successfully!')
    } catch (err) {
      setError(extractError(err, 'Invalid verification code. Please try again.'))
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError('')
    setResendLoading(true)
    try {
      await api.post(isHost ? '/auth/users/resend-otp' : '/auth/guests/resend-otp', { email })
      toast.success('Verification code resent to your email')
      setResendTimer(30)
    } catch {
      toast.error('Failed to resend code. Please try again.')
    } finally {
      setResendLoading(false)
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
        {/* Form panel — on the LEFT for sign up */}
        <div
          className="custom-scroll"
          style={{
            width: '50%',
            background: '#fff',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '22px 32px 28px',
            order: 1,
            flexShrink: 0,
            overflowY: 'auto',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: 4 }}>
            <div
              onClick={() => navigate(isHost ? '/host/login' : '/login')}
              style={{
                padding: '3px 0',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: '#ccc',
                borderBottom: '2px solid transparent',
                marginRight: 18,
                cursor: 'pointer',
              }}
            >
              Login
            </div>
            <div
              style={{
                padding: '3px 0',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: '#111',
                borderBottom: '2px solid #111',
              }}
            >
              Sign up
            </div>
          </div>

          {!showOtpStep ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 2 }}>
                {isHost ? 'Become a Host' : 'Create account'}
              </div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
                {isHost ? 'Start listing your property today' : 'Start finding your stay today'}
              </div>

              {/* Full name */}
              <div style={{ marginBottom: 7 }}>
                <label
                  style={{
                    fontSize: 11, color: '#666', marginBottom: 3, display: 'block',
                    textTransform: 'uppercase', letterSpacing: '0.4px',
                  }}
                >
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  autoComplete="off"
                  style={{
                    width: '100%', border: 'none', borderBottom: '1.5px solid #ddd',
                    padding: '7px 4px 7px 0', fontSize: 14, color: '#111', outline: 'none', background: 'transparent',
                  }}
                />
              </div>

              {/* Phone */}
              <div style={{ position: 'relative', marginBottom: 7 }}>
                <label
                  style={{
                    fontSize: 11, color: '#666', marginBottom: 3, display: 'block',
                    textTransform: 'uppercase', letterSpacing: '0.4px',
                  }}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+977-98XXXXXXXX"
                  autoComplete="off"
                  style={{
                    width: '100%', border: 'none', borderBottom: '1.5px solid #ddd',
                    padding: '7px 26px 7px 0', fontSize: 14, color: '#111', outline: 'none', background: 'transparent',
                  }}
                />
              </div>

              {/* Nationality (guests only) */}
              {!isHost && (
                <div style={{ position: 'relative', marginBottom: 7 }}>
                  <label
                    style={{
                      fontSize: 11, color: '#666', marginBottom: 3, display: 'block',
                      textTransform: 'uppercase', letterSpacing: '0.4px',
                    }}
                  >
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={e => setNationality(e.target.value)}
                    placeholder="e.g. Nepal"
                    autoComplete="off"
                    style={{
                      width: '100%', border: 'none', borderBottom: '1.5px solid #ddd',
                      padding: '7px 26px 7px 0', fontSize: 14, color: '#111', outline: 'none', background: 'transparent',
                    }}
                  />
                </div>
              )}

              {/* Email */}
              <div style={{ position: 'relative', marginBottom: 7 }}>
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

              {/* Password */}
              <div style={{ position: 'relative', marginBottom: 7 }}>
                <label
                  style={{
                    fontSize: 11, color: '#666', marginBottom: 3, display: 'block',
                    textTransform: 'uppercase', letterSpacing: '0.4px',
                  }}
                >
                  Password
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
              <div style={{ fontSize: 11, color: '#bbb', marginTop: 0, marginBottom: 6 }}>
                Must be 8+ characters with a number and a special character.
              </div>

              {error && (
                <p style={{ color: '#e94560', fontSize: 12, marginBottom: 6 }}>{error}</p>
              )}

              <button
                onClick={handleSignup}
                disabled={loading}
                style={{
                  width: '100%', padding: 11, background: '#111', border: 'none', borderRadius: 8,
                  color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                  marginTop: 0, opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#aaa' }}>
                Already have an account?{' '}
                <span
                  onClick={() => navigate(isHost ? '/host/login' : '/login')}
                  style={{ color: '#111', fontWeight: 600, cursor: 'pointer' }}
                >
                  Log in
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 3 }}>
                Verify your email
              </div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>
                A verification code was sent to <strong>{email}</strong>
              </div>

              {!verified ? (
                <>
                  {/* OTP input */}
                  <div style={{ position: 'relative', marginBottom: 20 }}>
                    <label
                      style={{
                        fontSize: 11, color: '#666', marginBottom: 3, display: 'block',
                        textTransform: 'uppercase', letterSpacing: '0.4px',
                      }}
                    >
                      Verification code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      autoComplete="off"
                      style={{
                        width: '100%', border: 'none', borderBottom: '1.5px solid #ddd',
                        padding: '7px 26px 7px 0', fontSize: 14, color: '#111', outline: 'none', background: 'transparent',
                        letterSpacing: 8,
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  {error && (
                    <p style={{ color: '#e94560', fontSize: 12, marginBottom: 10 }}>{error}</p>
                  )}

                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otp.length < 4}
                    style={{
                      width: '100%', padding: 11, background: '#111', border: 'none', borderRadius: 8,
                      color: '#fff', fontSize: 14, fontWeight: 600, cursor: otpLoading ? 'default' : 'pointer',
                      marginTop: 2, opacity: otpLoading || otp.length < 4 ? 0.7 : 1,
                    }}
                  >
                    {otpLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: 6, fontSize: 12, color: '#aaa' }}>
                    Didn't receive the code?{' '}
                    <span
                      onClick={handleResendOtp}
                      style={{
                        color: resendTimer > 0 || resendLoading ? '#ccc' : '#111',
                        fontWeight: 600,
                        cursor: resendTimer > 0 || resendLoading ? 'default' : 'pointer',
                      }}
                    >
                      {resendLoading ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>✓</div>
                    <p style={{ fontSize: 13, color: '#1E8449', fontWeight: 600 }}>
                      Email verified successfully!
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(isHost ? '/host/login' : '/login')}
                    style={{
                      width: '100%', padding: 11, background: '#111', border: 'none', borderRadius: 8,
                      color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      marginTop: 2,
                    }}
                  >
                    Next
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Animated scene panel — on the RIGHT for sign up */}
        <div style={{ width: '50%', background: '#dde0ee', order: 2, flexShrink: 0, position: 'relative' }}>
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
      </div>
    </div>
  )
}
