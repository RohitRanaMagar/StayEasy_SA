import { CreditCard, ArrowUpRight, Building2 } from 'lucide-react'
import { useSuperAdminStore } from '../../../components/superadmin/superAdminStore'

export default function TenantBilling() {
  const tenants = useSuperAdminStore(s => s.tenants)
  const subscriptions = useSuperAdminStore(s => s.subscriptions)
  const invoices = useSuperAdminStore(s => s.billingInvoices)
  const planChangeLogs = useSuperAdminStore(s => s.planChangeLogs)

  const totalRevenue = tenants.reduce((sum, t) => sum + t.monthlyRevenue, 0)
  const avgRevenue = tenants.length > 0 ? totalRevenue / tenants.length : 0

  return (
    <div className="space-y-4">

      {/* Asymmetric Stats - Top Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Total Revenue/mo</span>
            <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
              <ArrowUpRight size={12} /> +12%
            </span>
          </div>
          <div className="text-3xl font-bold text-[#2E86AB]">Rs.{(totalRevenue / 1000).toFixed(0)}K</div>
          <p className="text-xs text-gray-400 mt-1">combined monthly revenue</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Avg per Tenant</span>
            <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
              <ArrowUpRight size={12} /> +8%
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-800">Rs.{(avgRevenue / 1000).toFixed(1)}K</div>
          <p className="text-xs text-gray-400 mt-1">average revenue per tenant</p>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E86AB]/10 flex items-center justify-center">
              <CreditCard size={18} className="text-[#2E86AB]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{subscriptions.length}</div>
              <div className="text-xs text-gray-500">Subscriptions</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <CreditCard size={18} className="text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{invoices.filter(i => i.status === 'pending').length}</div>
              <div className="text-xs text-gray-500">Pending Invoices</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Revenue by Tenant</h3>
          <div className="space-y-3">
            {tenants.filter(t => t.status === 'Active').sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).slice(0, 6).map(t => (
              <div key={t.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Building2 size={14} className="text-gray-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{t.name}</span>
                </div>
                <span className="text-xs font-semibold text-gray-800">Rs.{(t.monthlyRevenue / 1000).toFixed(0)}K</span>
              </div>
            ))}
            {tenants.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No data</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Plan Change History</h3>
          <div className="space-y-3">
            {planChangeLogs.slice(0, 6).map(log => (
              <div key={log.id} className="py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">{log.tenantName}</span>
                  <span className="text-[10px] text-gray-400">{log.changedAt}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {log.fromPlan} → {log.toPlan}
                </div>
              </div>
            ))}
            {planChangeLogs.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No plan changes yet</p>}
          </div>
        </div>
      </div>

      {/* All Invoices */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">All Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tenant</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Issued</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-700">{inv.tenantName}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{inv.planName}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-800">${inv.amount}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                      inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700'
                      : inv.status === 'pending' ? 'bg-amber-50 text-amber-700'
                      : inv.status === 'refunded' ? 'bg-blue-50 text-blue-700'
                      : 'bg-red-50 text-red-700'
                    }`}>{inv.status}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">{inv.issuedAt}</td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center">
                  <CreditCard size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">No invoices</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
