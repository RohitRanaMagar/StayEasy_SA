import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera, CheckCircle,
  Shield, Lock, Eye, EyeOff,
  AlertTriangle, KeyRound, ArrowRight, ArrowLeft,
  Edit, LogIn, Activity,
} from 'lucide-react'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { useToast } from '../../components/superadmin/Toast'
import { PageTransition } from '../../components/superadmin/Animations'

const timezones = [
  'Asia/Kathmandu', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Tokyo',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Berlin', 'Australia/Sydney',
]

const currencies = ['NPR', 'USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'BRL', 'MXN', 'CNY']

const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Chinese']

const dateFormats = ['MMM DD YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
const timeFormats = ['12-hour AM/PM', '24-hour']

export default function SuperAdminProfile() {
  const navigate = useNavigate()
  const { profile, updateProfile, uploadProfilePicture, changePassword, setProfileComplete, isProfileComplete, platformConfig, setPlatformConfig, dashboardStats, fetchProfile } = useSuperAdminStore()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [configSubStep, setConfigSubStep] = useState<'a' | 'b' | 'c'>('a')
  const [isEditing, setIsEditing] = useState(false)

  const [newEmail, setNewEmail] = useState('')
  const [codeSent, setCodeSent] = useState(false)

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [emailVerified, setEmailVerified] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [passwords, setPasswords] = useState({ newPw: '', confirm: '' })
  const [showNewPw, setShowNewPw] = useState(false)
  const [passwordSet, setPasswordSet] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const [config, setConfig] = useState({ ...platformConfig })

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
    if (stepId < 2) {
      setCurrentStep(stepId + 1)
    }
  }

  const handleChangeEmail = () => {
    if (!newEmail || !newEmail.includes('@')) {
      showToast('error', 'Please enter a valid email address')
      return
    }
    updateProfile({ email: newEmail })
    showToast('success', 'Email updated')
  }

  const handleSendOtp = async () => {
    await new Promise(r => setTimeout(r, 500))
    showToast('success', 'OTP sent! Code: 123456')
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length !== 6) {
      setOtpError('Please enter a 6-digit code')
      return
    }
    await new Promise(r => setTimeout(r, 500))
    setEmailVerified(true)
    setOtpError('')
    showToast('success', 'Email verified successfully')
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      const next = document.querySelector(`input[name="otp-${index + 1}"]`) as HTMLInputElement
      next?.focus()
    } else if (!value && index > 0) {
      const prev = document.querySelector(`input[name="otp-${index - 1}"]`) as HTMLInputElement
      prev?.focus()
    }
  }

  const handleSetPassword = async () => {
    setPasswordError('')
    if (passwords.newPw.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    if (passwords.newPw !== passwords.confirm) {
      setPasswordError('Passwords do not match')
      return
    }
    await new Promise(r => setTimeout(r, 500))
    changePassword(passwords.newPw)
    setPasswordSet(true)
    showToast('success', 'Password changed successfully')
  }

  const handleVerificationNext = () => {
    if (!emailVerified) {
      showToast('error', 'Please verify your email first')
      return
    }
    if (!passwordSet) {
      showToast('error', 'Please set your password first')
      return
    }
    completeStep(1)
  }

  const handleSaveConfigA = () => {
    setPlatformConfig(config)
    setConfigSubStep('b')
    showToast('success', 'Platform info saved')
  }

  const handleSaveConfigB = () => {
    setPlatformConfig(config)
    setConfigSubStep('c')
    showToast('success', 'Defaults saved')
  }

  const handleFinish = async () => {
    await new Promise(r => setTimeout(r, 500))
    setPlatformConfig(config)
    completeStep(2)
    setProfileComplete(true)
    setIsEditing(false)
    showToast('success', 'Platform configured!')
    navigate('/superadmin')
  }

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Image must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      uploadProfilePicture(ev.target?.result as string)
      showToast('success', 'Profile picture updated')
    }
    reader.readAsDataURL(file)
  }

  if (isProfileComplete && !isEditing) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#2E86AB] to-[#1a5c7a] rounded-xl p-6 text-white">
            <div className="flex items-center gap-6">
              <div className="relative group shrink-0">
                <div className="w-[136px] h-[136px] rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-lg">
                  {profile.profilePicture ? (
                    <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white">{(profile.fullName || 'S').charAt(0)}</span>
                  )}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#2E86AB] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={14} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePictureUpload} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{profile.fullName}</h2>
                  <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-xs font-semibold">SuperAdmin</span>
                </div>
                <p className="text-sm text-white/70 mt-1">{profile.email}</p>

                <div className="flex items-center gap-3 mt-4">
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-white text-[#2E86AB] rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">
                    <Edit size={14} /> Edit Profile
                  </button>
                  <button onClick={() => navigate('/superadmin')} className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                    Go to Dashboard <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{dashboardStats.totalTenants}</p>
                  <p className="text-[11px] text-white/60 uppercase tracking-wider">Tenants</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{dashboardStats.activeSubscriptions}</p>
                  <p className="text-[11px] text-white/60 uppercase tracking-wider">Subscriptions</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">Rs.{(dashboardStats.mrr / 1000).toFixed(1)}K</p>
                  <p className="text-[11px] text-white/60 uppercase tracking-wider">MRR</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-[3] bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Identity Configuration</h3>
                <button onClick={() => setIsEditing(true)} className="text-[11px] font-medium text-[#2E86AB] hover:text-[#1a6b8a] transition-colors">Edit Profile</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Full Name</p>
                  <p className="text-sm text-gray-700 font-medium">{profile.fullName || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm text-gray-700 font-medium">{profile.email || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm text-gray-700 font-medium">{profile.phone || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Location</p>
                  <p className="text-sm text-gray-700 font-medium">{profile.address || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Nationality</p>
                  <p className="text-sm text-gray-700 font-medium">{profile.nationality || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Language</p>
                  <p className="text-sm text-gray-700 font-medium">{platformConfig.defaultLanguage || 'English'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Timezone</p>
                  <p className="text-sm text-gray-700 font-medium">{platformConfig.timezone || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Currency</p>
                  <p className="text-sm text-gray-700 font-medium">{platformConfig.defaultCurrency || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="flex-[2] bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Security Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <CheckCircle size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-gray-800">MFA Protection</p>
                      <p className="text-[10px] text-gray-500">Two-factor authentication enabled</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Lock size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-gray-800">Session Status</p>
                      <p className="text-[10px] text-gray-500">Current session active</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <KeyRound size={14} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-gray-800">Password</p>
                      <p className="text-[10px] text-gray-500">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditing(true)} className="text-[10px] font-medium text-[#2E86AB] hover:text-[#1a6b8a]">Change</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
              <span className="text-[11px] text-[#2E86AB] font-medium cursor-pointer hover:text-[#1a6b8a]">View all →</span>
            </div>
            <div className="space-y-0 divide-y divide-gray-50">
              {profile.recentActivity.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'login' ? 'bg-blue-50' : 'bg-gray-100'}`}>
                    {item.type === 'login' ? <LogIn size={14} className="text-blue-500" /> : <Activity size={14} className="text-gray-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-gray-800 truncate">{item.description}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="flex justify-center py-6">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center">
            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #0B1120, #1A3C5E, #2E86AB)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Get Started
            </h1>
            <p className="text-sm text-gray-400 mt-1">Verify your account and configure your platform</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-5 space-y-5">
                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Email</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        className="flex-1 px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors"
                        placeholder={profile.email}
                      />
                      <button onClick={() => { handleChangeEmail(); handleSendOtp(); setCodeSent(true) }} className="px-4 py-2 bg-[#2E86AB] text-white rounded-lg text-sm font-medium hover:bg-[#24708f] transition-colors">
                        Request Code
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100" />

                  {/* Verify Account */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Verify Account</h4>
                    <p className="text-xs text-gray-400">Enter the 6-digit code sent to {newEmail || profile.email}</p>
                  </div>

                  {codeSent && !emailVerified && (
                    <div className="space-y-3">
                      <div className="flex gap-2 items-center">
                        {otp.map((digit, index) => (
                          <input key={index} name={`otp-${index}`} type="text" maxLength={1} value={digit} onChange={e => handleOtpChange(index, e.target.value)} className="w-10 h-10 text-center text-lg font-bold border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                        ))}
                        <button
                          onClick={handleSendOtp}
                          className="ml-2 px-4 h-10 flex items-center justify-center rounded-lg text-xs font-semibold text-[#2E86AB] border border-[#2E86AB]/30 bg-[#2E86AB]/10 hover:bg-[#2E86AB]/20 transition-colors whitespace-nowrap"
                        >
                          Resend Code
                        </button>
                      </div>
                      {otpError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> {otpError}</p>}
                      <button onClick={handleVerifyOtp} className="flex items-center gap-2 px-4 py-2 bg-[#2E86AB] text-white rounded-lg text-sm font-medium hover:bg-[#24708f] transition-colors">Verify Email</button>
                    </div>
                  )}

                  {emailVerified && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700">Email Verified</span>
                    </div>
                  )}

                  <div className="h-px bg-gray-100" />

                  {/* Password Setup — only after verify */}
                  {emailVerified && !passwordSet && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900">New Password</h4>
                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-1">Password</label>
                        <div className="relative">
                          <input type={showNewPw ? 'text' : 'password'} value={passwords.newPw} onChange={e => setPasswords({ ...passwords, newPw: e.target.value })} className="w-full px-3 py-2 pr-10 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" placeholder="Enter new password" />
                          <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Must be at least 8 characters</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-1">Confirm Password</label>
                        <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" placeholder="Confirm new password" />
                      </div>
                      {passwordError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> {passwordError}</p>}
                      <button onClick={handleSetPassword} className="flex items-center gap-2 px-4 py-2 bg-[#2E86AB] text-white rounded-lg text-sm font-medium hover:bg-[#24708f] transition-colors"><Lock size={14} /> Set Password</button>
                    </div>
                  )}

                  {passwordSet && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700">Password Set</span>
                    </div>
                  )}

                  <div className="h-px bg-gray-100" />

                  {/* MFA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><Shield size={16} className="text-gray-400" /></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Multi-Factor Authentication</p>
                        <p className="text-[11px] text-gray-400">Coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={handleVerificationNext} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#2E86AB] text-white rounded-lg text-sm font-medium hover:bg-[#24708f] transition-colors">Continue <ArrowRight size={14} /></button>
              </div>
            )}

            {currentStep === 2 && configSubStep === 'a' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#2E86AB] font-semibold">1 Critical</span>
                  <div className="flex-1 h-0.5 bg-gray-200" />
                  <span className="text-gray-400">2 Defaults</span>
                  <div className="flex-1 h-0.5 bg-gray-200" />
                  <span className="text-gray-400">3 Optional</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Critical Settings</h3>
                <p className="text-xs text-gray-400">Platform basics and email configuration — required for the platform to work.</p>

                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform Information</h4>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Platform Name</label>
                    <input type="text" value={config.platformName} onChange={e => setConfig({ ...config, platformName: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" placeholder="e.g. ServeIQ" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Platform URL</label>
                    <input type="url" value={config.platformUrl} onChange={e => setConfig({ ...config, platformUrl: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" placeholder="https://ServeIQ.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Timezone</label>
                      <select value={config.timezone} onChange={e => setConfig({ ...config, timezone: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors bg-white">
                        {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Default Currency</label>
                      <select value={config.defaultCurrency} onChange={e => setConfig({ ...config, defaultCurrency: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors bg-white">
                        {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Support Email</label>
                    <input type="email" value={config.supportEmail} onChange={e => setConfig({ ...config, supportEmail: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" placeholder="support@ServeIQ.com" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email (SMTP)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">SMTP Host</label>
                      <input type="text" value={config.smtpHost} onChange={e => setConfig({ ...config, smtpHost: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" placeholder="smtp.gmail.com" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">SMTP Port</label>
                      <input type="number" value={config.smtpPort} onChange={e => setConfig({ ...config, smtpPort: parseInt(e.target.value) || 587 })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">SMTP Username</label>
                    <input type="text" value={config.smtpUsername} onChange={e => setConfig({ ...config, smtpUsername: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" placeholder="noreply@ServeIQ.com" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">SMTP Password</label>
                    <input type="password" value={config.smtpPassword} onChange={e => setConfig({ ...config, smtpPassword: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" placeholder="••••••••" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">From Email</label>
                      <input type="email" value={config.fromEmail} onChange={e => setConfig({ ...config, fromEmail: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" placeholder="noreply@ServeIQ.com" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">From Name</label>
                      <input type="text" value={config.fromName} onChange={e => setConfig({ ...config, fromName: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" placeholder="ServeIQ" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setCurrentStep(1)} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"><ArrowLeft size={14} /> Back</button>
                  <button onClick={handleSaveConfigA} className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 bg-[#2E86AB] text-white rounded-lg text-sm font-medium hover:bg-[#24708f] transition-colors">Save & Continue <ArrowRight size={14} /></button>
                </div>
              </div>
            )}

            {currentStep === 2 && configSubStep === 'b' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-500">1 Critical</span>
                  <div className="flex-1 h-0.5 bg-[#2E86AB]" />
                  <span className="text-[#2E86AB] font-semibold">2 Defaults</span>
                  <div className="flex-1 h-0.5 bg-gray-200" />
                  <span className="text-gray-400">3 Optional</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Important Defaults</h3>
                <p className="text-xs text-gray-400">Sensible defaults — can be changed later in Settings.</p>

                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Localization</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Default Language</label>
                      <select value={config.defaultLanguage} onChange={e => setConfig({ ...config, defaultLanguage: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors bg-white">
                        {languages.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Date Format</label>
                      <select value={config.dateFormat} onChange={e => setConfig({ ...config, dateFormat: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors bg-white">
                        {dateFormats.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Time Format</label>
                      <select value={config.timeFormat} onChange={e => setConfig({ ...config, timeFormat: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors bg-white">
                        {timeFormats.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Security Defaults</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Min Password Length</label>
                      <div className="relative">
                        <input type="number" value={config.passwordMinLength} onChange={e => setConfig({ ...config, passwordMinLength: parseInt(e.target.value) || 8 })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">chars</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-[13px] text-gray-700 font-medium">Require Special Chars</span>
                      <button onClick={() => setConfig({ ...config, passwordRequireSpecialChars: !config.passwordRequireSpecialChars })} className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${config.passwordRequireSpecialChars ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                        <div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${config.passwordRequireSpecialChars ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Session Timeout</label>
                      <div className="relative">
                        <input type="number" value={config.sessionTimeout} onChange={e => setConfig({ ...config, sessionTimeout: parseInt(e.target.value) || 30 })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">min</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Max Login Attempts</label>
                      <input type="number" value={config.maxLoginAttempts} onChange={e => setConfig({ ...config, maxLoginAttempts: parseInt(e.target.value) || 5 })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Lockout Duration</label>
                      <div className="relative">
                        <input type="number" value={config.loginLockoutDuration} onChange={e => setConfig({ ...config, loginLockoutDuration: parseInt(e.target.value) || 15 })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">min</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setConfigSubStep('a')} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"><ArrowLeft size={14} /> Back</button>
                  <button onClick={handleSaveConfigB} className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 bg-[#2E86AB] text-white rounded-lg text-sm font-medium hover:bg-[#24708f] transition-colors">Save & Continue <ArrowRight size={14} /></button>
                </div>
              </div>
            )}

            {currentStep === 2 && configSubStep === 'c' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-500">1 Critical</span>
                  <div className="flex-1 h-0.5 bg-[#2E86AB]" />
                  <span className="text-emerald-500">2 Defaults</span>
                  <div className="flex-1 h-0.5 bg-[#2E86AB]" />
                  <span className="text-[#2E86AB] font-semibold">3 Optional</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Optional Settings</h3>
                <p className="text-xs text-gray-400">Configure as your platform grows — all have sensible defaults.</p>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Feature Flags</h4>
                  {Object.entries(config.featureFlags).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-[13px] text-gray-700 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <button onClick={() => setConfig({ ...config, featureFlags: { ...config.featureFlags, [key]: !value } })} className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${value ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                        <div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Gateways</h4>
                  {Object.entries(config.paymentGateways).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-[13px] text-gray-700 font-medium capitalize">{key}</span>
                      <button onClick={() => setConfig({ ...config, paymentGateways: { ...config.paymentGateways, [key]: !value } })} className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${value ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                        <div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notifications</h4>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-[13px] text-gray-700 font-medium">Admin Email Notifications</span>
                    <button onClick={() => setConfig({ ...config, notifications: { ...config.notifications, adminEmailNotifications: !config.notifications.adminEmailNotifications } })} className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${config.notifications.adminEmailNotifications ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${config.notifications.adminEmailNotifications ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-[13px] text-gray-700 font-medium">Daily Digest</span>
                    <button onClick={() => setConfig({ ...config, notifications: { ...config.notifications, dailyDigestEnabled: !config.notifications.dailyDigestEnabled } })} className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${config.notifications.dailyDigestEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${config.notifications.dailyDigestEnabled ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Digest Time</label>
                    <input type="time" value={config.notifications.dailyDigestTime === '09:00 AM' ? '09:00' : config.notifications.dailyDigestTime} onChange={e => setConfig({ ...config, notifications: { ...config.notifications, dailyDigestTime: e.target.value } })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Backup & Maintenance</h4>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-[13px] text-gray-700 font-medium">Auto Backup</span>
                    <button onClick={() => setConfig({ ...config, backup: { ...config.backup, autoBackupEnabled: !config.backup.autoBackupEnabled } })} className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${config.backup.autoBackupEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${config.backup.autoBackupEnabled ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Backup Frequency</label>
                      <select value={config.backup.backupFrequency} onChange={e => setConfig({ ...config, backup: { ...config.backup, backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' } })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors bg-white">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Log Retention</label>
                      <div className="relative">
                        <input type="number" value={config.backup.logRetentionDays} onChange={e => setConfig({ ...config, backup: { ...config.backup, logRetentionDays: parseInt(e.target.value) || 90 } })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">days</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Backup Retention</label>
                      <div className="relative">
                        <input type="number" value={config.backup.backupRetentionDays} onChange={e => setConfig({ ...config, backup: { ...config.backup, backupRetentionDays: parseInt(e.target.value) || 30 } })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">days</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">API & Limits</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Rate Limit</label>
                      <div className="relative">
                        <input type="number" value={config.apiLimits.rateLimit} onChange={e => setConfig({ ...config, apiLimits: { ...config.apiLimits, rateLimit: parseInt(e.target.value) || 100 } })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">req/min</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Max Upload</label>
                      <div className="relative">
                        <input type="number" value={config.apiLimits.maxUploadSize} onChange={e => setConfig({ ...config, apiLimits: { ...config.apiLimits, maxUploadSize: parseInt(e.target.value) || 10 } })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">MB</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Trial Period</label>
                      <div className="relative">
                        <input type="number" value={config.apiLimits.trialPeriodDays} onChange={e => setConfig({ ...config, apiLimits: { ...config.apiLimits, trialPeriodDays: parseInt(e.target.value) || 14 } })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">days</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setConfigSubStep('b')} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"><ArrowLeft size={14} /> Back</button>
                  <button onClick={handleFinish} className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 bg-[#2E86AB] text-white rounded-lg text-sm font-medium hover:bg-[#24708f] transition-colors">Save & Finish</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
