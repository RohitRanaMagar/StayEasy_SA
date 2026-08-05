import { useState, useEffect } from 'react'
import { Edit, X } from 'lucide-react'
import type { TenantExtended } from '../../../types/superadmin'

interface EditTenantModalProps {
  tenant: TenantExtended | null
  open: boolean
  onClose: () => void
  onSave: (updated: Partial<TenantExtended>) => void
}

export default function EditTenantModal({ tenant, open, onClose, onSave }: EditTenantModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [timezone, setTimezone] = useState('Asia/Kathmandu')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tenant) {
      setName(tenant.name)
      setEmail(tenant.email)
      setPhone(tenant.phone)
      setAddress(tenant.address)
      setWebsite(tenant.website)
      setCity(tenant.city)
      setCountry(tenant.country)
      setOwnerName(tenant.ownerName)
      setOwnerEmail(tenant.ownerEmail)
      setOwnerPhone(tenant.ownerPhone)
      setTimezone(tenant.timezone)
    }
  }, [tenant])

  if (!open || !tenant) return null

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      website: website.trim(),
      city: city.trim(),
      country: country.trim(),
      ownerName: ownerName.trim(),
      ownerEmail: ownerEmail.trim(),
      ownerPhone: ownerPhone.trim(),
      timezone,
    })
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E86AB] to-[#57B8D9] flex items-center justify-center">
                <Edit size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Edit Tenant</h3>
                <p className="text-xs text-gray-500">{tenant.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Property Name *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Admin Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">City</label>
                <input value={city} onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Country</label>
                <input value={country} onChange={e => setCountry(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Address</label>
              <input value={address} onChange={e => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Website</label>
              <input value={website} onChange={e => setWebsite(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Owner Name</label>
                <input value={ownerName} onChange={e => setOwnerName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Owner Email</label>
                <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Owner Phone</label>
                <input value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Timezone</label>
                <select value={timezone} onChange={e => setTimezone(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all">
                  <option>Asia/Kathmandu</option>
                  <option>Asia/Kolkata</option>
                  <option>Asia/Dubai</option>
                  <option>Europe/London</option>
                  <option>America/New_York</option>
                  <option>Asia/Singapore</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading || !name.trim() || !email.trim()}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #1A3C5E, #2E86AB)' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
