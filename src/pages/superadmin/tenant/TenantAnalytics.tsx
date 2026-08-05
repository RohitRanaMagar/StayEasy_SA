import { Building2, ArrowUpRight } from 'lucide-react'
import { useSuperAdminStore } from '../../../components/superadmin/superAdminStore'

export default function TenantAnalytics() {
  const tenants = useSuperAdminStore(s => s.tenants)
  const active = tenants.filter(t => t.status === 'Active').length
  const suspended = tenants.filter(t => t.status === 'Suspended').length
  const trialing = tenants.filter(t => t.status === 'Trialing').length
  const plans = tenants.reduce((acc, t) => { acc[t.plan] = (acc[t.plan] || 0) + 1; return acc }, {} as Record<string, number>)
  const totalRevenue = tenants.reduce((sum, t) => sum + t.monthlyRevenue, 0)

  return (
    <div className="space-y-4">

      {/* Asymmetric Stats - Top Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Total Tenants</span>
            <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
              <ArrowUpRight size={12} /> +2
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{tenants.length}</div>
          <p className="text-xs text-gray-400 mt-1">properties managed on platform</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Monthly Revenue</span>
            <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
              <ArrowUpRight size={12} /> +12%
            </span>
          </div>
          <div className="text-3xl font-bold text-[#2E86AB]">Rs.{(totalRevenue / 1000).toFixed(0)}K</div>
          <p className="text-xs text-gray-400 mt-1">recurring revenue from subscriptions</p>
        </div>
      </div>

      {/* Bottom Row - Smaller Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{active}</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{suspended}</div>
              <div className="text-xs text-gray-500">Suspended</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{trialing}</div>
              <div className="text-xs text-gray-500">Trialing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Tenants by Plan</h3>
          <div className="space-y-3">
            {Object.entries(plans).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 w-24">{plan}</span>
                <div className="flex-1 mx-3">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#2E86AB] to-[#57B8D9] rounded-full transition-all duration-500"
                      style={{ width: `${tenants.length > 0 ? (count / tenants.length) * 100 : 0}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-800 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'Active', value: active, color: 'from-emerald-400 to-emerald-500' },
              { label: 'Suspended', value: suspended, color: 'from-red-400 to-red-500' },
              { label: 'Trialing', value: trialing, color: 'from-amber-400 to-amber-500' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 w-24">{s.label}</span>
                <div className="flex-1 mx-3">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${s.color} rounded-full transition-all duration-500`}
                      style={{ width: `${tenants.length > 0 ? (s.value / tenants.length) * 100 : 0}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-800 w-8 text-right">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Tenants Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">All Tenants</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tenant</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Properties</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue/mo</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Building2 size={14} className="text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">{t.plan}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      t.status === 'Active' ? 'bg-emerald-50 text-emerald-700'
                      : t.status === 'Suspended' ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        t.status === 'Active' ? 'bg-emerald-500'
                        : t.status === 'Suspended' ? 'bg-red-500'
                        : 'bg-amber-500'
                      }`} />
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{t.propertiesCount}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-800">Rs.{(t.monthlyRevenue / 1000).toFixed(0)}K</td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center">
                  <Building2 size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">No tenants</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
