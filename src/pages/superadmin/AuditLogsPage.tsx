import { useState, useMemo } from 'react'
import {
  Shield, Search, ChevronLeft, ChevronRight, Download, Calendar,
  Filter, X, Clock, AlertTriangle, Info, AlertOctagon,
  User, Globe, MoreHorizontal, RefreshCw,
} from 'lucide-react'
import type { SuperAdminAuditLog } from '../../types/superadmin'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { PageTransition } from '../../components/superadmin/Animations'
import { useToast } from '../../components/superadmin/Toast'
import AdvancedButton from '../../components/superadmin/AdvancedButton'
import { useAction } from '../../components/superadmin/useAction'

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

const severityConfig: Record<string, { label: string; icon: typeof Info; text: string; bg: string; dot: string; hex: string }> = {
  info:     { label: 'Info',     icon: Info,         text: 'text-blue-700',  bg: 'bg-blue-100',   dot: 'bg-blue-500', hex: '#3B82F6' },
  warning:  { label: 'Warning',  icon: AlertTriangle,text: 'text-orange-700',bg: 'bg-orange-100', dot: 'bg-orange-500', hex: '#F59E0B' },
  error:    { label: 'Error',    icon: X,            text: 'text-red-700',   bg: 'bg-red-100',    dot: 'bg-red-500', hex: '#EF4444' },
  critical: { label: 'Critical', icon: AlertOctagon,  text: 'text-red-800',  bg: 'bg-red-200',    dot: 'bg-red-600', hex: '#DC2626' },
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  admin:    { label: 'Admin',    color: '#8B5CF6' },
  tenant:   { label: 'Tenant',   color: '#2E86AB' },
  system:   { label: 'System',   color: '#10B981' },
  billing:  { label: 'Billing',  color: '#F59E0B' },
  security: { label: 'Security', color: '#EF4444' },
  feature:  { label: 'Feature',  color: '#3B82F6' },
}

// ═══════════════════════════════════════════════════════════════
// Filters
// ═══════════════════════════════════════════════════════════════

interface AuditFilters {
  search: string
  category: string
  severity: string
  admin: string
  dateFrom: string
  dateTo: string
}

// ═══════════════════════════════════════════════════════════════
// CSV Export
// ═══════════════════════════════════════════════════════════════

function exportToCSV(entries: SuperAdminAuditLog[]) {
  const headers = ['ID', 'Timestamp', 'Admin', 'Action', 'Target', 'Category', 'Severity', 'IP Address', 'Details']
  const rows = entries.map(e => [
    e.id, e.timestamp, e.admin, e.action, e.target, e.category, e.severity, e.ipAddress || '', e.details,
  ])
  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ═══════════════════════════════════════════════════════════════
// Stat Card
// ═══════════════════════════════════════════════════════════════

function StatBadge({ icon: Icon, label, value, color }: {
  icon: typeof Shield; label: string; value: string | number; color: string
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
          <Icon size={13} style={{ color }} />
        </div>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</span>
      </div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Date range picker (simplified text inputs for mock)
// ═══════════════════════════════════════════════════════════════

function DateRangeFilter({ from, to, onChange }: {
  from: string; to: string; onChange: (field: 'dateFrom' | 'dateTo', val: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Calendar size={13} className="text-gray-300 shrink-0" />
      <input
        type="date"
        value={from}
        onChange={e => onChange('dateFrom', e.target.value)}
        className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 outline-none w-36"
      />
      <span className="text-[10px] text-gray-300">to</span>
      <input
        type="date"
        value={to}
        onChange={e => onChange('dateTo', e.target.value)}
        className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 outline-none w-36"
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function AuditLogsPage() {
  const auditLogs = useSuperAdminStore(s => s.auditLogs)
  const { showToast } = useToast()
  const exportAction = useAction({ duration: 600 })
  const refreshAction = useAction({ duration: 800 })
  const [filters, setFilters] = useState<AuditFilters>({
    search: '', category: 'all', severity: 'all', admin: 'all',
    dateFrom: '', dateTo: '',
  })
  const [page, setPage] = useState(1)
  const perPage = 12
  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = (field: keyof AuditFilters, val: string) => {
    setFilters(f => ({ ...f, [field]: val }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ search: '', category: 'all', severity: 'all', admin: 'all', dateFrom: '', dateTo: '' })
    setPage(1)
  }

  const filtered = useMemo(() => {
    return auditLogs.filter(log => {
      if (filters.search) {
        const s = filters.search.toLowerCase()
        if (!log.id.toLowerCase().includes(s) &&
            !log.target.toLowerCase().includes(s) &&
            !log.details.toLowerCase().includes(s) &&
            !log.action.toLowerCase().includes(s) &&
            !log.admin.toLowerCase().includes(s)) return false
      }
      if (filters.category !== 'all' && log.category !== filters.category) return false
      if (filters.severity !== 'all' && log.severity !== filters.severity) return false
      if (filters.admin !== 'all' && log.admin !== filters.admin) return false
      if (filters.dateFrom) {
        const logDate = new Date(log.timestamp).toISOString().slice(0, 10)
        if (logDate < filters.dateFrom) return false
      }
      if (filters.dateTo) {
        const logDate = new Date(log.timestamp).toISOString().slice(0, 10)
        if (logDate > filters.dateTo) return false
      }
      return true
    })
  }, [filters])

  const totalPages = Math.ceil(filtered.length / perPage)
  const pageEntries = filtered.slice((page - 1) * perPage, page * perPage)

  const uniqueAdmins = [...new Set(auditLogs.map(l => l.admin))]
  const isFiltered = Object.values(filters).some(v => v !== '' && v !== 'all')

  const severityCounts = {
    critical: auditLogs.filter(l => l.severity === 'critical').length,
    error: auditLogs.filter(l => l.severity === 'error').length,
    warning: auditLogs.filter(l => l.severity === 'warning').length,
    info: auditLogs.filter(l => l.severity === 'info').length,
  }
  const categoryCount = auditLogs.length

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div className="flex items-center gap-2 sm:ml-auto">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium rounded-lg transition-colors ${
              showFilters || isFiltered ? 'bg-[#2E86AB]/10 text-[#2E86AB] border border-[#2E86AB]/30' : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter size={13} />
            Filters
            {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-[#2E86AB] ml-0.5" />}
          </button>
          <AdvancedButton
            variant="outline" size="md"
            icon={<Download size={13} />}
            loading={exportAction.loading}
            success={exportAction.success}
            onClick={async () => {
              await exportAction.execute(async () => {
                exportToCSV(filtered)
                showToast('success', `Exported ${filtered.length} audit entries`)
              })
            }}
            tooltip="Export filtered logs as CSV"
          >
            Export CSV
          </AdvancedButton>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatBadge icon={Shield} label="Total Entries" value={categoryCount} color="#2E86AB" />
        <StatBadge icon={Info} label="Info" value={severityCounts.info} color="#3B82F6" />
        <StatBadge icon={AlertTriangle} label="Warnings" value={severityCounts.warning} color="#F59E0B" />
        <StatBadge icon={X} label="Errors" value={severityCounts.error} color="#EF4444" />
        <StatBadge icon={AlertOctagon} label="Critical" value={severityCounts.critical} color="#DC2626" />
      </div>

      {/* ── Filters Panel ──────────────────────────────── */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            <button onClick={clearFilters} className="text-[11px] text-[#2E86AB] hover:text-[#1A6B8A] transition-colors flex items-center gap-1">
              <X size={11} /> Clear all
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                placeholder="Search ID, target, action..."
                className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-blue-300"
              />
            </div>

            {/* Category */}
            <select value={filters.category} onChange={e => updateFilter('category', e.target.value)}
              className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 outline-none">
              <option value="all">All Categories</option>
              {Object.entries(categoryConfig).map(([key, c]) => (
                <option key={key} value={key}>{c.label}</option>
              ))}
            </select>

            {/* Severity */}
            <select value={filters.severity} onChange={e => updateFilter('severity', e.target.value)}
              className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 outline-none">
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>

            {/* Admin */}
            <select value={filters.admin} onChange={e => updateFilter('admin', e.target.value)}
              className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 outline-none">
              <option value="all">All Admins</option>
              {uniqueAdmins.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            {/* Date Range */}
            <DateRangeFilter from={filters.dateFrom} to={filters.dateTo}
              onChange={(field, val) => updateFilter(field, val)} />
          </div>
        </div>
      )}

      {/* ── Results Count ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          Showing {filtered.length > 0 ? (page - 1) * perPage + 1 : 0}–{Math.min(page * perPage, filtered.length)} of {filtered.length} entries
          {isFiltered && filtered.length !== auditLogs.length && (
            <span className="text-gray-300"> (filtered from {auditLogs.length})</span>
          )}
        </span>
        <button
          onClick={() => { clearFilters(); setShowFilters(false) }}
          className={`text-[11px] text-gray-400 hover:text-gray-600 transition-colors ${isFiltered ? '' : 'opacity-0 pointer-events-none'}`}
        >
          <X size={12} className="inline mr-0.5" /> Reset filters
        </button>
      </div>

      {/* ── Audit Log Table ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-2.5 px-4 text-gray-400 font-medium">Timestamp</th>
                <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Admin</th>
                <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Action</th>
                <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Target</th>
                <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Category</th>
                <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Severity</th>
                <th className="text-left py-2.5 px-3 text-gray-400 font-medium">IP Address</th>
                <th className="text-right py-2.5 px-4 text-gray-400 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {pageEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 text-[13px]">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={24} className="text-gray-200" />
                      <span>No audit log entries match your filters.</span>
                      <button onClick={clearFilters} className="text-[11px] text-[#2E86AB] hover:text-[#1A6B8A]">
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                pageEntries.map(log => {
                  const sev = severityConfig[log.severity] || severityConfig.info
                  const SevIcon = sev.icon
                  const catColor = categoryConfig[log.category]?.color || '#6B7280'

                  return (
                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Clock size={11} className="text-gray-300 shrink-0" />
                          <span className="text-[11px] text-gray-600 whitespace-nowrap">{log.timestamp}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <User size={11} className="text-gray-300" />
                          <span className="text-[12px] text-gray-700">{log.admin}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-mono text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[12px] text-gray-800 font-medium">{log.target}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: catColor }} />
                          <span className="text-[10px] text-gray-500 capitalize">{log.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <SevIcon size={11} className={sev.text} />
                          <span className={`text-[11px] font-medium capitalize ${sev.text}`}>{log.severity}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <Globe size={11} className="text-gray-300" />
                          <span className="text-[10px] font-mono text-gray-500">{log.ipAddress || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="group relative">
                          <button onClick={() => {}}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreHorizontal size={12} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-100 p-3 hidden group-hover:block z-10">
                            <p className="text-[11px] text-gray-600 leading-relaxed">{log.details}</p>
                            {log.userAgent && (
                              <p className="text-[9px] text-gray-400 mt-1.5 pt-1.5 border-t border-gray-50">{log.userAgent}</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <select
                value={perPage}
                className="text-[11px] border border-gray-200 rounded-lg px-2 py-1 text-gray-500 outline-none"
              >
                <option value={12}>12 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400">
                <ChevronLeft size={12} className="opacity-50" />
                <ChevronLeft size={12} className="-ml-2" />
              </button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                const n = start + i
                if (n > totalPages) return null
                return (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-7 h-7 rounded text-[11px] font-medium ${n === page ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {n}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight size={14} />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400">
                <ChevronRight size={12} />
                <ChevronRight size={12} className="-ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Activity Summary ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">By Category</h3>
          <div className="space-y-2.5">
            {Object.entries(categoryConfig).map(([key, c]) => {
              const count = auditLogs.filter(l => l.category === key).length
              const pct = (count / auditLogs.length) * 100
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                      <span className="text-gray-600 font-medium">{c.label}</span>
                    </div>
                    <span className="text-gray-800 font-semibold">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">By Severity</h3>
          <div className="space-y-2.5">
            {Object.entries(severityConfig).map(([key, s]) => {
              const count = auditLogs.filter(l => l.severity === key).length
              const pct = (count / auditLogs.length) * 100
              const Icon = s.icon
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <div className="flex items-center gap-1.5">
                      <Icon size={11} className={s.text} />
                      <span className="text-gray-600 font-medium capitalize">{s.label}</span>
                    </div>
                    <span className="text-gray-800 font-semibold">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.hex }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {auditLogs.slice(0, 5).map(log => {
              const sev = severityConfig[log.severity] || severityConfig.info
              return (
                <div key={log.id} className="flex items-start gap-2 pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${sev.dot}`} />
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-gray-700 truncate">{log.action}</div>
                    <div className="text-[9px] text-gray-400">{log.target} · {log.timestamp}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Footer — Quick Actions ─────────────────────── */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4">
        <div className="text-[11px] text-gray-400">
          <span className="font-medium text-gray-600">{auditLogs.length}</span> total audit entries logged
          <span className="mx-2">·</span>
          Retained for <span className="font-medium text-gray-600">90 days</span>
        </div>
        <div className="flex items-center gap-2">
          <AdvancedButton
            variant="outline" size="sm"
            icon={<Download size={12} />}
            onClick={async () => {
              exportToCSV(filtered)
              showToast('success', 'Audit logs exported')
            }}
          >
            Export
          </AdvancedButton>
          <AdvancedButton
            variant="primary" size="sm"
            icon={<RefreshCw size={12} />}
            loading={refreshAction.loading}
            success={refreshAction.success}
            onClick={async () => {
              await refreshAction.execute(async () => {
                await new Promise(r => setTimeout(r, 600))
                showToast('success', 'Audit logs refreshed')
              })
            }}
          >
            Refresh
          </AdvancedButton>
        </div>
      </div>
    </div>
    </PageTransition>
  )
}
