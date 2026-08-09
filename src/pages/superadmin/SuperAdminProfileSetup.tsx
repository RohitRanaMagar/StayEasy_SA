import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ArrowRight, ArrowLeft } from 'lucide-react'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { useToast } from '../../components/superadmin/Toast'
import { PageTransition } from '../../components/superadmin/Animations'
import { countries } from '../../data/countries'

export default function SuperAdminProfileSetup() {
  const navigate = useNavigate()
  const { profile, updateProfile, uploadProfilePicture, setProfileComplete } = useSuperAdminStore()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    firstName: profile.fullName?.split(' ')[0] || '',
    lastName: profile.fullName?.split(' ').slice(1).join(' ') || '',
    phone: profile.phone || '',
    address: profile.address || '',
    country: '',
    state: '',
    postalCode: '',
    nationality: profile.nationality || '',
  })
  const [picturePreview, setPicturePreview] = useState(profile.profilePicture || '')
  const [states, setStates] = useState<string[]>([])

  const handleCountryChange = (code: string) => {
    const country = countries.find(c => c.code === code)
    setForm({ ...form, country: code, state: '' })
    setStates(country?.states || [])
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
      const result = ev.target?.result as string
      setPicturePreview(result)
      uploadProfilePicture(result)
      showToast('success', 'Profile picture uploaded')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!form.firstName.trim()) {
      showToast('error', 'First name is required')
      return
    }

    updateProfile({
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      phone: form.phone,
      address: form.address,
      nationality: form.nationality,
    })

    setProfileComplete(true)
    showToast('success', 'Profile saved!')
    navigate('/superadmin')
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
            <p className="text-sm text-gray-400 mt-1">Complete your profile information</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
            {/* Profile picture */}
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-[100px] h-[100px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {picturePreview ? (
                    <img src={picturePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-gray-300">{form.firstName?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-[#2E86AB] rounded-full flex items-center justify-center text-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera size={12} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePictureUpload} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Profile Photo</p>
                <p className="text-xs text-gray-400">Click to upload. Max 2MB.</p>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">First Name *</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors"
                placeholder="+977-XXXXXXXXX"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors"
                placeholder="Street address"
              />
            </div>

            {/* Country + State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Country</label>
                <select
                  value={form.country}
                  onChange={e => handleCountryChange(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors bg-white"
                >
                  <option value="">Select country</option>
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">State / Province</label>
                <select
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                  disabled={!form.country || states.length === 0}
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{states.length === 0 && form.country ? 'No states available' : 'Select state'}</option>
                  {states.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Postal + Nationality */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={e => setForm({ ...form, postalCode: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors"
                  placeholder="Postal / ZIP code"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Nationality</label>
                <input
                  type="text"
                  value={form.nationality}
                  onChange={e => setForm({ ...form, nationality: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors"
                  placeholder="Nationality"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate('/superadmin')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={14} /> Skip
              </button>
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 bg-[#2E86AB] text-white rounded-lg text-sm font-medium hover:bg-[#24708f] transition-colors"
              >
                Save & Go to Dashboard <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
