import { useState, useEffect, useMemo } from 'react'
import {
  Search, Plus, Download, Trash2, X,
  Building2, Eye, Pause, Play, Edit, RefreshCw,
  Rows3, Grid2X2, Star, ChevronLeft, ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { useSuperAdminStore } from '../../../components/superadmin/superAdminStore'
import type { TenantExtended } from '../../../types/superadmin'
import TenantDetailDrawer from './TenantDetailDrawer'
import CreateTenantWizard from '../../../components/CreateTenantWizard'
import EditTenantModal from './EditTenantModal'

import { mockTenantsExtended } from '../../../data/superAdminMockData'
const tenants: TenantExtended[] = mockTenantsExtended

const planBadge: Record<string, string> = {
  Enterprise: 'bg-gradient-to-r from-purple-500/10 to-purple-600/5 text-purple-700 ring-1 ring-purple-500/20',
  Professional: 'bg-gradient-to-r from-blue-500/10 to-blue-600/5 text-blue-700 ring-1 ring-blue-500/20',
  Basic: 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 text-emerald-700 ring-1 ring-emerald-500/20',
  'Free Trial': 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
}

const statusConfig: Record<string, { badge: string; dot: string }> = {
  Active: { badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20', dot: 'bg-emerald-500' },
  Suspended: { badge: 'bg-red-50 text-red-700 ring-1 ring-red-500/20', dot: 'bg-red-500' },
  Trialing: { badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20', dot: 'bg-amber-500' },
}

const planPrices: Record<string, { monthly: number; yearly: number }> = {
  'Free Trial': { monthly: 0, yearly: 0 },
  'Basic': { monthly: 7999, yearly: 79990 },
  'Professional': { monthly: 19999, yearly: 199990 },
  'Enterprise': { monthly: 49999, yearly: 499990 },
}

export default function TenantsPage() {
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const perPage = 10

  const [drawerTenant, setDrawerTenant] = useState<TenantExtended | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [editTenant, setEditTenant] = useState<TenantExtended | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [changePlanTenant, setChangePlanTenant] = useState<TenantExtended | null>(null)
  const [changePlanOpen, setChangePlanOpen] = useState(false)
  const [deleteTenant, setDeleteTenant] = useState<TenantExtended | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const store = useSuperAdminStore()

  const filtered = useMemo(() => {
    let list = [...tenants]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.city.toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') list = list.filter(t => t.status === statusFilter)
    if (planFilter !== 'all') list = list.filter(t => t.plan === planFilter)
    return list
  }, [search, statusFilter, planFilter])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  useEffect(() => { setPage(1) }, [search, statusFilter, planFilter])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const toggleAll = () => {
    if (selectedIds.length === paged.length) setSelectedIds([])
    else setSelectedIds(paged.map(t => t.id))
  }

  const handleImpersonate = (t: TenantExtended) => {
    store.startImpersonation(t.id, t.name)
    setDrawerOpen(false)
  }
  const handleSuspend = (t: TenantExtended) => {
    if (t.status === 'Suspended') store.restoreTenant(t.id)
    else store.suspendTenant(t.id)
    setDrawerOpen(false)
  }
  const handleEdit = (t: TenantExtended) => {
    setEditTenant(t)
    setEditOpen(true)
    setDrawerOpen(false)
  }
  const handleChangePlan = (t: TenantExtended) => {
    setChangePlanTenant(t)
    setChangePlanOpen(true)
    setDrawerOpen(false)
  }
  const handleDelete = (t: TenantExtended) => {
    setDeleteTenant(t)
    setDeleteOpen(true)
    setDrawerOpen(false)
  }
  const confirmDelete = () => {
    if (deleteTenant) {
      store.deleteTenant(deleteTenant.id)
      setDeleteOpen(false)
      setDeleteTenant(null)
    }
  }
  const handleSaveEdit = (data: Partial<TenantExtended>) => {
    if (editTenant) {
      store.editTenant(editTenant.id, data)
      setEditOpen(false)
      setEditTenant(null)
    }
  }
  const handleSavePlan = (plan: string) => {
    if (changePlanTenant) {
      const prices = planPrices[plan]
      store.changeTenantPlan(changePlanTenant.id, plan, prices ? prices.monthly : 0)
      setChangePlanOpen(false)
      setChangePlanTenant(null)
    }
  }
  const handleBulkDelete = () => {
    store.bulkDelete(selectedIds)
    setSelectedIds([])
  }

  const exportCSV = () => {
    const header = 'Name,Email,Plan,Status,City,Country,Properties,Rooms,Bookings,Revenue,Rating\n'
    const rows = filtered.map(t =>
      `"${t.name}","${t.email}","${t.plan}","${t.status}","${t.city}","${t.country}",${t.propertiesCount},${t.totalRooms},${t.totalBookings},${t.monthlyRevenue},${t.rating}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tenants_export_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
      <div className="space-y-4">
      {/* Header */}
        <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tenants..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 transition-all" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={12} className="text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-white border border-gray-200 text-gray-600 outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 cursor-pointer transition-all">
            {(['all', 'Active', 'Suspended', 'Trialing'] as const).map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>
            ))}
          </select>

          <select value={planFilter} onChange={e => setPlanFilter(e.target.value as typeof planFilter)}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-white border border-gray-200 text-gray-600 outline-none focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 cursor-pointer transition-all">
            {(['all', 'Enterprise', 'Professional', 'Basic', 'Free Trial'] as const).map(p => (
              <option key={p} value={p}>{p === 'all' ? 'All Plans' : p}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={14} /> Export
            </button>
            <button onClick={() => setWizardOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg"
              style={{ background: 'linear-gradient(135deg, #10014a, #030c57)' }}>
              <Plus size={14} /> Create Tenant
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 bg-[#2E86AB]/5 border border-[#2E86AB]/20 rounded-xl px-4 py-2.5">
          <span className="text-xs text-[#2E86AB] font-medium">{selectedIds.length} selected</span>
          <button onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
            <Trash2 size={12} /> Delete
          </button>
          <button onClick={() => setSelectedIds([])} className="ml-auto p-1.5 rounded-lg hover:bg-[#2E86AB]/10 transition-colors">
            <X size={12} className="text-[#2E86AB]" />
          </button>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{filtered.length} tenant{filtered.length !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
          <button onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              view === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Rows3 size={14} /> List
          </button>
          <button onClick={() => setView('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              view === 'grid' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Grid2X2 size={14} /> Grid
          </button>
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.length === paged.length && paged.length > 0} onChange={toggleAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#2E86AB] focus:ring-[#2E86AB]/20" />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rooms</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue/mo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => toggleSelect(t.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#2E86AB] focus:ring-[#2E86AB]/20" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setDrawerTenant(t); setDrawerOpen(true) }}>
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center ring-1 ring-gray-200 group-hover:ring-[#2E86AB]/30 transition-all">
                          {t.logo ? <img src={t.logo} alt="" className="w-full h-full object-cover" /> : <Building2 size={16} className="text-gray-400" />}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800 group-hover:text-[#2E86AB] transition-colors">{t.name}</div>
                          <div className="text-xs text-gray-400">{t.city}, {t.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${planBadge[t.plan]}`}>{t.plan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig[t.status].badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[t.status].dot}`} />
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-medium">{t.totalRooms}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-medium">{t.totalBookings.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-semibold">Rs.{(t.monthlyRevenue / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-amber-500">
                        <Star size={14} className="fill-amber-400" /> <span className="font-medium">{t.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(t)}
                          className="p-2 rounded-lg text-gray-400 hover:text-[#2E86AB] hover:bg-[#2E86AB]/5 transition-all" title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleChangePlan(t)}
                          className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all" title="Change Plan">
                          <RefreshCw size={14} />
                        </button>
                        <button onClick={() => handleImpersonate(t)}
                          className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Impersonate">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleSuspend(t)}
                          className={`p-2 rounded-lg transition-all ${
                            t.status === 'Suspended'
                              ? 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`} title={t.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}>
                          {t.status === 'Suspended' ? <Play size={14} /> : <Pause size={14} />}
                        </button>
                        <button onClick={() => handleDelete(t)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <Building2 size={32} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-sm font-semibold text-gray-600 mb-1">No tenants found</p>
                      <p className="text-xs text-gray-400">
                        {search || statusFilter !== 'all' || planFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Create your first tenant to get started'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/30">
              <span className="text-xs text-gray-500">
                Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      p === page ? 'bg-[#2E86AB] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                    }`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-3 gap-4">
          {paged.map(t => (
            <div key={t.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              onClick={() => { setDrawerTenant(t); setDrawerOpen(true) }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center ring-1 ring-gray-200 group-hover:ring-[#2E86AB]/30 transition-all">
                  {t.logo ? <img src={t.logo} alt="" className="w-full h-full object-cover" /> : <Building2 size={18} className="text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#2E86AB] transition-colors">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.city}, {t.country}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${planBadge[t.plan]}`}>{t.plan}</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig[t.status].badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[t.status].dot}`} />
                  {t.status}
                </span>
                <div className="flex items-center gap-1 text-sm text-amber-500 ml-auto">
                  <Star size={12} className="fill-amber-400" /> <span className="font-medium">{t.rating}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <div className="text-lg font-bold text-gray-800">{t.propertiesCount}</div>
                  <div className="text-xs text-gray-400">Properties</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-800">{t.totalRooms}</div>
                  <div className="text-xs text-gray-400">Rooms</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-800">{t.totalBookings.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Bookings</div>
                </div>
              </div>
            </div>
          ))}
          {paged.length === 0 && (
            <div className="col-span-3 py-16 text-center">
              <Building2 size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-600">No tenants found</p>
            </div>
          )}
        </div>
      )}

      {/* Modals & Drawer */}
      <TenantDetailDrawer tenant={drawerTenant} open={drawerOpen} onClose={() => setDrawerOpen(false)}
        onImpersonate={handleImpersonate} onSuspend={handleSuspend} onEdit={handleEdit}
        onChangePlan={handleChangePlan} onDelete={handleDelete} />
      <CreateTenantWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
      <EditTenantModal tenant={editTenant} open={editOpen} onClose={() => setEditOpen(false)} onSave={handleSaveEdit} />

      {/* Change Plan Modal */}
      {changePlanOpen && changePlanTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setChangePlanOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <RefreshCw size={18} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Change Plan</h3>
                  <p className="text-xs text-gray-500">{changePlanTenant.name}</p>
                </div>
              </div>
              <div className="space-y-2">
                {['Free Trial', 'Basic', 'Professional', 'Enterprise'].map(plan => (
                  <button key={plan} onClick={() => handleSavePlan(plan)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      changePlanTenant.plan === plan
                        ? 'border-[#2E86AB] bg-[#2E86AB]/5'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{plan}</div>
                      <div className="text-xs text-gray-500">Rs.{planPrices[plan].monthly.toLocaleString()}/mo</div>
                    </div>
                    {changePlanTenant.plan === plan && (
                      <div className="w-5 h-5 rounded-full bg-[#2E86AB] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button onClick={() => setChangePlanOpen(false)}
                className="w-full mt-4 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteOpen && deleteTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={22} className="text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 text-center mb-1">Delete Tenant</h3>
              <p className="text-sm text-gray-500 text-center mb-5">
                Are you sure you want to delete <strong className="text-gray-700">{deleteTenant.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
