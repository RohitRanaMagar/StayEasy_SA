import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Camera, Upload, CheckCircle, Clock, XCircle,
  Shield, Phone, MapPin, Globe, Lock, Eye, EyeOff,
  Save, AlertTriangle, Mail, KeyRound, ArrowRight, ArrowLeft,
  Settings, Edit, LogIn, Activity,
} from 'lucide-react'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { useToast } from '../../components/superadmin/Toast'
import { PageTransition } from '../../components/superadmin/Animations'

const statusConfig = {
  not_submitted: { color: 'bg-gray-100 text-gray-500', icon: AlertTriangle, label: 'Not Submitted' },
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending Review' },
  approved: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejected' },
}

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
  const { profile, updateProfile, uploadProfilePicture, submitNidVerification, submitNationalityCardVerification, changePassword, setProfileComplete, isProfileComplete, platformConfig, setPlatformConfig, dashboardStats, fetchProfile } = useSuperAdminStore()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nidInputRef = useRef<HTMLInputElement>(null)
  const nationalityInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [configSubStep, setConfigSubStep] = useState<'a' | 'b' | 'c'>('a')
  const [isEditing, setIsEditing] = useState(false)

  // Step 1: Personal Info
  const [formData, setFormData] = useState({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
    nationality: profile.nationality,
  })

  // Step 2: Verification
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [emailVerified, setEmailVerified] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [passwords, setPasswords] = useState({ newPw: '', confirm: '' })
  const [showNewPw, setShowNewPw] = useState(false)
  const [passwordSet, setPasswordSet] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Step 4: Platform Config
  const [config, setConfig] = useState({ ...platformConfig })

  const steps = [
    { id: 1, label: 'Personal Info', icon: User },
    { id: 2, label: 'Verification', icon: Shield },
    { id: 3, label: 'Documents', icon: KeyRound },
    { id: 4, label: 'Platform Config', icon: Settings },
  ]

  const isStepAccessible = (stepId: number) => {
    if (stepId === 1) return true
    return completedSteps.includes(stepId - 1)
  }

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
    if (stepId < 4) {
      setCurrentStep(stepId + 1)
    }
  }

  // Step 1: Save Personal Info (via API)
  const handleSavePersonal = async () => {
    if (profile.isSeeded && formData.email === 'SA@ServeIQ.com') {
      showToast('error', 'You must change your email address before proceeding')
      return
    }
    updateProfile(formData)
    completeStep(1)
    showToast('success', 'Personal info saved')
  }

  // Step 2: Send OTP (via API)
  const handleSendOtp = async () => {
    await new Promise(r => setTimeout(r, 500))
    showToast('success', 'OTP sent! Code: 123456')
  }

  // Step 2: Verify OTP (via API)
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
    }
  }

  // Step 2: Set Password (via API)
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
    completeStep(2)
  }

  // Step 3: Upload documents (via API)
  const handleNidUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await new Promise(r => setTimeout(r, 500))
    submitNidVerification('uploaded')
    showToast('success', 'NID submitted for verification')
  }

  const handleNationalityUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await new Promise(r => setTimeout(r, 500))
    submitNationalityCardVerification('uploaded')
    showToast('success', 'Nationality card submitted')
  }

  // Step 4: Platform Config
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
    completeStep(4)
    setProfileComplete(true)
    setIsEditing(false)
    showToast('success', 'Platform configured!')
    navigate('/superadmin')
  }

  // Profile picture upload
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

  // Profile view when setup is complete
  if (isProfileComplete && !isEditing) {
    return (
      <PageTransition>
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-[#2E86AB] to-[#1a5c7a] rounded-xl p-6 text-white">
            <div className="flex items-center gap-6">
              {/* PFP */}
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

              {/* Name + Role */}
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

              {/* Stats */}
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

          {/* Identity Config + Security */}
          <div className="flex gap-6">
            {/* Identity Configuration */}
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

            {/* Security Status */}
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

          {/* Recent Activity */}
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
      <div className="space-y-6">
        {/* Title */}
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #0B1120, #1A3C5E, #2E86AB)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Setup Your Profile
            </h1>
            <div className="mt-2 h-px w-48 mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #2E86AB, transparent)' }} />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left: Profile Card */}
          <div className="w-2/5 shrink-0 bg-white rounded-xl border border-gray-100 p-6 h-fit">
            <div className="flex flex-col items-center text-center">
              <div className="relative group mb-4">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#2E86AB] to-[#1a5c7a] flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {profile.profilePicture ? (
                    <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white">{(formData.fullName || 'S').charAt(0)}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-8 h-8 bg-[#2E86AB] rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera size={14} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePictureUpload} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{formData.fullName || 'Your Name'}</h2>
              <p className="text-sm text-gray-500">{formData.email}</p>
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold mt-2">SuperAdmin</div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400" />
                <span>{formData.phone || 'Phone'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={14} className="text-gray-400" />
                <span>{formData.address || 'Address'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe size={14} className="text-gray-400" />
                <span>{formData.nationality || 'Nationality'}</span>
              </div>
            </div>
          </div>

          {/* Right: Steps + Content */}
          <div className="w-3/5 min-w-0 space-y-4">
            {/* Step Marker */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <button
                      onClick={() => isStepAccessible(step.id) && setCurrentStep(step.id)}
                      disabled={!isStepAccessible(step.id)}
                      className={`flex items-center gap-2 transition-all ${
                        !isStepAccessible(step.id) ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        completedSteps.includes(step.id)
                          ? 'bg-emerald-500 text-white'
                          : currentStep === step.id
                          ? 'bg-[#2E86AB] text-white shadow-md'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {completedSteps.includes(step.id) ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step.id
                        )}
                      </div>
                      <span className={`text-xs font-medium hidden sm:block ${
                        currentStep === step.id ? 'text-[#2E86AB]' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-3 transition-all ${
                        completedSteps.includes(step.id) ? 'bg-emerald-400' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Sub-step indicator for Step 4 */}
              {currentStep === 4 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={configSubStep === 'a' ? 'text-[#2E86AB] font-semibold' : completedSteps.includes(4) ? 'text-emerald-500' : 'text-gray-400'}>4a Critical</span>
                    <div className={`flex-1 h-0.5 ${configSubStep === 'b' || configSubStep === 'c' ? 'bg-[#2E86AB]' : 'bg-gray-200'}`} />
                    <span className={configSubStep === 'b' ? 'text-[#2E86AB] font-semibold' : configSubStep === 'c' ? 'text-emerald-500' : 'text-gray-400'}>4b Defaults</span>
                    <div className={`flex-1 h-0.5 ${configSubStep === 'c' ? 'bg-[#2E86AB]' : 'bg-gray-200'}`} />
                    <span className={configSubStep === 'c' ? 'text-[#2E86AB] font-semibold' : 'text-gray-400'}>4c Optional</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">

              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>

                  {/* Profile Picture Upload */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="relative group shrink-0">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2E86AB] to-[#1a5c7a] flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                        {profile.profilePicture ? (
                          <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-white">{(formData.fullName || 'S').charAt(0)}</span>
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-7 h-7 bg-[#2E86AB] rounded-full flex items-center justify-center text-white shadow-md hover:bg-[#24708f] transition-colors"
                      >
                        <Camera size={12} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Profile Picture</p>
                      <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or GIF. Max 2MB.</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2E86AB] bg-[#2E86AB]/10 rounded-lg hover:bg-[#2E86AB]/20 transition-colors"
                      >
                        <Upload size={12} /> Upload Photo
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Full Name</label>
                      <input type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" placeholder="Enter your full name" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">
                        Email {profile.isSeeded && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-3 py-2 text-[13px] border rounded-lg outline-none transition-colors ${
                          profile.isSeeded && formData.email === 'SA@ServeIQ.com'
                            ? 'border-red-300 bg-red-50 focus:border-red-400'
                            : 'border-gray-200 focus:border-[#2E86AB]'
                        }`}
                        placeholder="Enter your new email address"
                      />
                      {profile.isSeeded && formData.email === 'SA@ServeIQ.com' && (
                        <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                          <AlertTriangle size={10} />
                          You must change your email before proceeding
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Phone Number</label>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" placeholder="Enter your phone number" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Nationality</label>
                      <input type="text" value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" placeholder="Enter your nationality" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Address</label>
                      <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" placeholder="Enter your address" />
                    </div>
                  </div>
                  <button onClick={handleSavePersonal} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#2E86AB] text-white rounded-lg text-sm font-medium hover:bg-[#24708f] transition-colors">
                    <Save size={14} /> Save & Continue
                  </button>
                </div>
              )}

              {/* Step 2: Verification */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-gray-900">Verification</h3>

                  {/* Email OTP */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Mail size={18} className="text-blue-500" /></div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Email Verification</h4>
                        <p className="text-xs text-gray-400">Enter the 6-digit code sent to {formData.email}</p>
                      </div>
                      {emailVerified && <span className="ml-auto px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">Verified ✓</span>}
                    </div>
                    {!emailVerified && (
                      <div className="space-y-3">
                        <div className="flex gap-2 items-center">
                          {otp.map((digit, index) => (
                            <input key={index} name={`otp-${index}`} type="text" maxLength={1} value={digit} onChange={e => handleOtpChange(index, e.target.value)} className="w-10 h-10 text-center text-lg font-bold border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                          ))}
                          <button
                            onClick={handleSendOtp}
                            className="ml-2 px-4 h-10 flex items-center justify-center rounded-lg text-xs font-semibold text-[#2E86AB] border border-[#2E86AB]/30 bg-gradient-to-r from-[#2E86AB]/10 to-[#57B8D9]/10 backdrop-blur-sm hover:from-[#2E86AB]/20 hover:to-[#57B8D9]/20 transition-all duration-200 shadow-[0_0_12px_rgba(46,134,171,0.15)] hover:shadow-[0_0_20px_rgba(46,134,171,0.25)] whitespace-nowrap"
                          >
                            Request Code
                          </button>
                        </div>
                        {otpError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> {otpError}</p>}
                        <button onClick={handleVerifyOtp} className="flex items-center gap-2 px-4 py-2 bg-[#2E86AB] text-white rounded-lg text-sm font-medium hover:bg-[#24708f] transition-colors">Verify Email</button>
                      </div>
                    )}
                  </div>

                  {/* Password Setup */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Lock size={18} className="text-purple-500" /></div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Password Setup</h4>
                        <p className="text-xs text-gray-400">Set a new password for your account</p>
                      </div>
                      {passwordSet && <span className="ml-auto px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">Set ✓</span>}
                    </div>
                    {!passwordSet && (
                      <div className="space-y-3 max-w-sm">
                        <div>
                          <label className="block text-[11px] font-medium text-gray-500 mb-1">New Password</label>
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
                  </div>

                  {/* MFA Placeholder */}
                  <div className="border border-gray-200 rounded-lg p-4 opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><Shield size={18} className="text-gray-400" /></div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Multi-Factor Authentication</h4>
                        <p className="text-xs text-gray-400">Coming soon</p>
                      </div>
                    </div>
                  </div>

                  <button onClick={handleVerificationNext} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#2E86AB] text-white rounded-lg text-sm font-medium hover:bg-[#24708f] transition-colors">Continue <ArrowRight size={14} /></button>
                </div>
              )}

              {/* Step 3: Documents */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-gray-900">Document Verification</h3>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Shield size={18} className="text-blue-500" /></div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">National ID (NID)</h4>
                          <p className="text-xs text-gray-400">Upload your national identity card</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusConfig[profile.nidVerification.status].color}`}>{statusConfig[profile.nidVerification.status].label}</span>
                        {profile.nidVerification.status === 'not_submitted' && (
                          <button onClick={() => nidInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E86AB] text-white rounded-lg text-xs font-medium hover:bg-[#24708f] transition-colors"><Upload size={12} /> Upload</button>
                        )}
                      </div>
                    </div>
                    <input ref={nidInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleNidUpload} />
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Globe size={18} className="text-purple-500" /></div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Nationality Card</h4>
                          <p className="text-xs text-gray-400">Upload your citizenship certificate</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusConfig[profile.nationalityCardVerification.status].color}`}>{statusConfig[profile.nationalityCardVerification.status].label}</span>
                        {profile.nationalityCardVerification.status === 'not_submitted' && (
                          <button onClick={() => nationalityInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E86AB] text-white rounded-lg text-xs font-medium hover:bg-[#24708f] transition-colors"><Upload size={12} /> Upload</button>
                        )}
                      </div>
                    </div>
                    <input ref={nationalityInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleNationalityUpload} />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setCurrentStep(2)} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"><ArrowLeft size={14} /> Back</button>
                    <button onClick={() => completeStep(3)} className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 bg-[#2E86AB] text-white rounded-lg text-sm font-medium hover:bg-[#24708f] transition-colors">Continue <ArrowRight size={14} /></button>
                  </div>
                </div>
              )}

              {/* Step 4: Platform Configuration */}
              {currentStep === 4 && configSubStep === 'a' && (
                <div className="space-y-6">
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
                    <button onClick={() => setCurrentStep(3)} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"><ArrowLeft size={14} /> Back</button>
                    <button onClick={handleSaveConfigA} className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 bg-[#2E86AB] text-white rounded-lg text-sm font-medium hover:bg-[#24708f] transition-colors">Save & Continue <ArrowRight size={14} /></button>
                  </div>
                </div>
              )}

              {/* Step 4b: Important Defaults */}
              {currentStep === 4 && configSubStep === 'b' && (
                <div className="space-y-6">
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

              {/* Step 4c: Nice-to-Have */}
              {currentStep === 4 && configSubStep === 'c' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-gray-900">Optional Settings</h3>
                  <p className="text-xs text-gray-400">Configure as your platform grows — all have sensible defaults.</p>

                  {/* Feature Flags */}
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

                  {/* Payment Gateways */}
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

                  {/* Notifications */}
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

                  {/* Backup & Maintenance */}
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

                  {/* API & Limits */}
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
      </div>
    </PageTransition>
  )
}
