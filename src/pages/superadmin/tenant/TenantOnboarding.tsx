import { useState, useMemo } from 'react'
import {
  Search, Building2, CheckCircle, Circle, Clock, Users, AlertTriangle,
  Grid2X2, Rows3, ChevronDown, ExternalLink,
} from 'lucide-react'
import { useSuperAdminStore } from '../../../components/superadmin/superAdminStore'
import { mockOnboardingActivities } from '../../../data/superAdminMockData'

const steps = [
  { key: 'created', label: 'Account Created', description: 'Tenant account created' },
  { key: 'profile', label: 'Profile Setup', description: 'Basic information added' },
  { key: 'property', label: 'Property Added', description: 'Property details configured' },
  { key: 'rooms', label: 'Rooms Configured', description: 'Rooms and rates set' },
  { key: 'payment', label: 'Payment Gateway', description: 'Payment system connected' },
  { key: 'live', label: 'Go Live', description: 'Tenant is live' },
]

const statusConfig: Record<string, { badge: string; dot: string }> = {
  Active: { badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20', dot: 'bg-emerald-500' },
  Suspended: { badge: 'bg-red-50 text-red-700 ring-1 ring-red-500/20', dot: 'bg-red-500' },
  Trialing: { badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20', dot: 'bg-amber-500' },
}

export default function TenantOnboarding() {
  const tenants = useSuperAdminStore(s => s.tenants)
  const [view, setView] = useState<'card' | 'list'>('card')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'progress' | 'name' | 'status'>('progress')
  const [showCount, setShowCount] = useState(6)

  const tenantStatuses = useMemo(() => {
    return tenants.map(t => ({
      ...t,
      onboardingProgress: t.onboardingProgress ?? (t.status === 'Active' ? 5 : t.status === 'Trialing' ? 3 : 1),
    }))
  }, [tenants])

  const stats = useMemo(() => ({
    total: tenantStatuses.length,
    inProgress: tenantStatuses.filter(t => t.onboardingProgress > 0 && t.onboardingProgress < 6).length,
    completed: tenantStatuses.filter(t => t.onboardingProgress === 6).length,
    suspended: tenantStatuses.filter(t => t.status === 'Suspended').length,
  }), [tenantStatuses])

  const filtered = useMemo(() => {
    let list = [...tenantStatuses]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(t => t.name.toLowerCase().includes(q) || (t.city && t.city.toLowerCase().includes(q)))
    }
    if (sortBy === 'progress') list.sort((a, b) => b.onboardingProgress - a.onboardingProgress)
    else if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    else if (sortBy === 'status') list.sort((a, b) => a.status.localeCompare(b.status))
    return list
  }, [tenantStatuses, searchQuery, sortBy])

  const visibleTenants = filtered.slice(0, showCount)

  const getProgressColor = (progress: number) => {
    if (progress === 6) return 'bg-emerald-500'
    if (progress >= 4) return 'bg-[#2E86AB]'
    if (progress >= 2) return 'bg-amber-500'
    return 'bg-gray-300'
  }

  const getProgressTextColor = (progress: number) => {
    if (progress === 6) return 'text-emerald-600'
    if (progress >= 4) return 'text-[#2E86AB]'
    if (progress >= 2) return 'text-amber-600'
    return 'text-gray-500'
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Side - Main Content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Onboarding Overview */}
        <div>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">Onboarding Overview</h2>
            <p className="text-xs text-gray-500 mt-0.5">Monitor the progress of all tenant onboarding activities</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users size={18} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock size={18} className="text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
                  <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">In Progress</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle size={18} className="text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                  <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Completed</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.suspended}</div>
                  <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Suspended</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Pipeline */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Onboarding Pipeline</h2>
              <p className="text-xs text-gray-500 mt-0.5">Detailed progress of tenants in onboarding</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2E86AB] border border-[#2E86AB]/30 rounded-lg hover:bg-[#2E86AB]/5 transition-colors">
              <ExternalLink size={12} />
              View Onboarding Guide
            </button>
          </div>

          <div className="flex items-center justify-between relative">
            {steps.map((step, i) => {
              const done = i < 4
              const current = i === 4
              return (
                <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                  <div className="relative">
                    {done ? (
                      <div className="w-12 h-12 rounded-full bg-[#2E86AB] flex items-center justify-center shadow-md">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                    ) : current ? (
                      <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center animate-pulse shadow-md">
                        <Circle size={14} className="text-amber-500" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                        <Circle size={14} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <span className={`text-[11px] mt-2 text-center font-medium ${done ? 'text-[#2E86AB]' : current ? 'text-amber-600' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                  <span className="text-[9px] text-gray-400 text-center mt-0.5 max-w-[80px]">
                    {step.description}
                  </span>
                </div>
              )
            })}
            {/* Connection lines */}
            <div className="absolute top-6 left-[8%] right-[8%] h-0.5 bg-gray-200 -z-0" />
            <div className="absolute top-6 left-[8%] w-[55%] h-0.5 bg-[#2E86AB] -z-0" />
          </div>
        </div>

        {/* All Tenants */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">All Tenants ({filtered.length})</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-600 outline-none focus:border-[#2E86AB] cursor-pointer"
                >
                  <option value="progress">Sort by: Progress</option>
                  <option value="name">Sort by: Name</option>
                  <option value="status">Sort by: Status</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setView('card')}
                  className={`p-1.5 rounded-md transition-all ${view === 'card' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid2X2 size={14} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Rows3 size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Card View */}
          {view === 'card' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visibleTenants.map(t => (
                <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center ring-1 ring-gray-200">
                      {t.logo ? (
                        <img src={t.logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={18} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{t.name}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Building2 size={10} />
                        {t.city}, {t.country}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${statusConfig[t.status].badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[t.status].dot}`} />
                      {t.status === 'Active' ? 'ACTIVE' : t.status === 'Suspended' ? 'SUSPENDED' : 'IN PROGRESS'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-gray-400">Steps completed</span>
                      <span className={`text-xs font-semibold ${getProgressTextColor(t.onboardingProgress)}`}>
                        {Math.round((t.onboardingProgress / 6) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getProgressColor(t.onboardingProgress)}`}
                        style={{ width: `${(t.onboardingProgress / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {view === 'list' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Tenant Name</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTenants.map(t => (
                      <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center ring-1 ring-gray-200">
                              {t.logo ? (
                                <img src={t.logo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Building2 size={16} className="text-gray-400" />
                              )}
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{t.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Building2 size={10} />
                            {t.city}, {t.country}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${statusConfig[t.status].badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[t.status].dot}`} />
                            {t.status === 'Active' ? 'ACTIVE' : t.status === 'Suspended' ? 'SUSPENDED' : 'IN PROGRESS'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                              <div
                                className={`h-full rounded-full transition-all ${getProgressColor(t.onboardingProgress)}`}
                                style={{ width: `${(t.onboardingProgress / 6) * 100}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold ${getProgressTextColor(t.onboardingProgress)}`}>
                              {Math.round((t.onboardingProgress / 6) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Load More */}
          {showCount < filtered.length && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowCount(prev => prev + 6)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Load More
                <ChevronDown size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-80 shrink-0 space-y-4">
        {/* Search */}
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search activities or stats..."
            className="w-full pl-9 pr-10 py-2.5 text-[13px] bg-white border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2E86AB]/20 focus:border-[#2E86AB] shadow-md"
          />
          <button className="absolute right-2 p-1.5 bg-[#2E86AB] text-white rounded-lg hover:bg-[#1a6b8a] transition-colors">
            <Search size={14} />
          </button>
        </div>

        {/* Onboarding Summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Onboarding Summary</h3>
          <div className="flex items-center gap-4">
            {/* Donut Chart */}
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E5E7EB" strokeWidth="5" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#2E86AB" strokeWidth="5"
                  strokeDasharray={`${(stats.completed / stats.total) * 87.96} 87.96`} />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="5"
                  strokeDasharray={`${(stats.inProgress / stats.total) * 87.96} 87.96`}
                  strokeDashoffset={`-${(stats.completed / stats.total) * 87.96}`} />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#EF4444" strokeWidth="5"
                  strokeDasharray={`${(stats.suspended / stats.total) * 87.96} 87.96`}
                  strokeDashoffset={`-${((stats.completed + stats.inProgress) / stats.total) * 87.96}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{stats.total}</span>
                <span className="text-[9px] text-gray-400 uppercase">Total</span>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E86AB]" />
                  <span className="text-xs text-gray-600">Completed</span>
                </div>
                <span className="text-xs font-semibold text-gray-800">{stats.completed} ({Math.round((stats.completed / stats.total) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-gray-600">In Progress</span>
                </div>
                <span className="text-xs font-semibold text-gray-800">{stats.inProgress} ({Math.round((stats.inProgress / stats.total) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-xs text-gray-600">Suspended</span>
                </div>
                <span className="text-xs font-semibold text-gray-800">{stats.suspended} ({Math.round((stats.suspended / stats.total) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <span className="text-xs text-gray-600">Yet to Start</span>
                </div>
                <span className="text-xs font-semibold text-gray-800">0 (0%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Activities</h3>
            <button className="text-xs font-medium text-[#2E86AB] hover:text-[#1a6b8a] transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {mockOnboardingActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Building2 size={14} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800 truncate">{activity.tenantName}</div>
                  <div className="text-[11px] text-gray-400">{activity.action}</div>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
