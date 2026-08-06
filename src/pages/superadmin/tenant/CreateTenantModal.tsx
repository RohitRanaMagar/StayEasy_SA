import { useState } from 'react'
import { Building2, X } from 'lucide-react'
import { useSuperAdminStore } from '../../../components/superadmin/superAdminStore'

interface CreateTenantModalProps {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

export default function CreateTenantModal({ open, onClose, onCreated }: CreateTenantModalProps) {
  const addTenant = useSuperAdminStore(s => s.addTenant)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [plan, setPlan] = useState('Free Trial')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    addTenant({
      name: name.trim(),
      email: email.trim(),
      plan: plan as 'Free Trial' | 'Basic' | 'Professional' | 'Enterprise',
      status: 'Active',
      propertiesCount: 0,
      subscriptionDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      monthlyRevenue: 0,
      logo: null,
    })
    setLoading(false)
    setName('')
    setEmail('')
    setPhone('')
    setPlan('Free Trial')
    onCreated?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Building2 size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Provision New Tenant</h3>
                <p className="text-xs text-gray-500">Create a new tenant account</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Property / Business Name *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Harbour View Hotel"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Admin Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+977-9800000000"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Subscription Plan</label>
              <div className="grid grid-cols-2 gap-2">
                {['Free Trial', 'Basic', 'Professional', 'Enterprise'].map(p => (
                  <button key={p} onClick={() => setPlan(p)}
                    className={`px-4 py-3 text-sm font-medium rounded-xl border-2 text-left transition-all ${
                      plan === p
                        ? 'border-[#2E86AB] bg-[#2E86AB]/5'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={loading || !name.trim() || !email.trim()}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #1A3C5E, #2E86AB)' }}>
              {loading ? 'Creating...' : 'Provision Tenant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
