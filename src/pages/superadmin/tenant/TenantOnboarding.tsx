import { Building2, CheckCircle, Circle, Clock } from 'lucide-react'
import { useSuperAdminStore } from '../../../components/superadmin/superAdminStore'

const steps = [
  { label: 'Account Created', key: 'created' },
  { label: 'Profile Setup', key: 'profile' },
  { label: 'Property Added', key: 'property' },
  { label: 'Rooms Configured', key: 'rooms' },
  { label: 'Payment Gateway', key: 'payment' },
  { label: 'Go Live', key: 'live' },
]

export default function TenantOnboarding() {
  const tenants = useSuperAdminStore(s => s.tenants)

  const tenantStatuses = tenants.map(t => {
    const progress = t.status === 'Active' ? 5
      : t.status === 'Trialing' ? 3
      : 1
    return { ...t, progress }
  })

  const inProgress = tenantStatuses.filter(t => t.progress > 1 && t.progress < 5)

  return (
    <div className="space-y-4">

      {/* In Progress Section */}
      {inProgress.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-3">In Progress ({inProgress.length})</h2>
          <div className="space-y-3">
            {inProgress.map(t => (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                      {t.logo ? (
                        <img src={t.logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.city}, {t.country}</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
                    <Clock size={12} />
                    {t.progress}/6 steps
                  </span>
                </div>

                {/* Timeline Steps */}
                <div className="flex items-center justify-between px-2">
                  {steps.map((step, i) => {
                    const done = i < t.progress
                    const current = i === t.progress
                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1">
                        <div className="relative">
                          {done ? (
                            <div className="w-8 h-8 rounded-full bg-[#2E86AB] flex items-center justify-center">
                              <CheckCircle size={16} className="text-white" />
                            </div>
                          ) : current ? (
                            <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center animate-pulse">
                              <Circle size={12} className="text-amber-500" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                              <Circle size={12} className="text-gray-300" />
                            </div>
                          )}
                          {i < steps.length - 1 && (
                            <div className={`absolute top-1/2 left-full w-full h-0.5 -translate-y-1/2 ${
                              done ? 'bg-[#2E86AB]' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                        <span className={`text-[10px] mt-2 text-center ${done ? 'text-[#2E86AB] font-medium' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Tenants Overview */}
      <div>
        <h2 className="text-sm font-semibold text-gray-800 mb-3">All Tenants ({tenants.length})</h2>
        {tenants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Building2 size={28} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">No tenants yet</p>
            <p className="text-xs text-gray-400">Create your first tenant to start tracking onboarding progress</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {tenantStatuses.map(t => (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      {t.logo ? (
                        <img src={t.logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={14} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-800">{t.name}</div>
                      <div className="text-[10px] text-gray-400">{t.city}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                    t.status === 'Active' ? 'bg-emerald-50 text-emerald-700'
                    : t.status === 'Suspended' ? 'bg-red-50 text-red-700'
                    : 'bg-amber-50 text-amber-700'
                  }`}>{t.status}</span>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-1 mb-2">
                  {steps.map((step, i) => {
                    const done = i < t.progress
                    return (
                      <div key={step.key} className={`h-1.5 flex-1 rounded-full ${done ? 'bg-[#2E86AB]' : 'bg-gray-100'}`} />
                    )
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">{t.progress}/6 steps complete</span>
                  <span className="text-[10px] font-medium text-[#2E86AB]">{Math.round((t.progress / 6) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
