import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  RefreshCw, Download, ChevronLeft, ChevronRight,
  AlertTriangle, XCircle, AlertOctagon, Info,
  Clock, User, ArrowUpRight, ArrowDownRight, Loader2,
} from 'lucide-react'
import { useToast } from '../../components/superadmin/Toast'
import AdvancedButton from '../../components/superadmin/AdvancedButton'
import { useAction } from '../../components/superadmin/useAction'
import { PageTransition } from '../../components/superadmin/Animations'
import { listAuditLogs, type AuditLogResponse } from '../../services/superadminApi'
import type { SuperAdminAuditLog } from '../../types/superadmin'

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

const categoryColors: Record<string, { dot: string; bg: string; text: string }> = {
  admin:   { dot: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-600' },
  tenant:  { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
  system:  { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  billing: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-600' },
  security:{ dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-600' },
  feature: { dot: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600' },
}

const severityColors: Record<string, { icon: typeof Info; color: string; bg: string }> = {
  info:     { icon: Info, color: '#3B82F6', bg: 'bg-blue-50' },
  warning:  { icon: AlertTriangle, color: '#F59E0B', bg: 'bg-amber-50' },
  error:    { icon: XCircle, color: '#EF4444', bg: 'bg-red-50' },
  critical: { icon: AlertOctagon, color: '#7F1D1D', bg: 'bg-red-100' },
}

// ─── API mapping (backend AuditLogResponse → UI SuperAdminAuditLog) ───
// The backend log has no category/severity fields: category is inferred from
// `target_type` (unknown types → system) and severity defaults to info — so
// the severity breakdown below reflects available data, not backend severity.

function toUiCategory(targetType: string): SuperAdminAuditLog['category'] {
  const t = targetType.toLowerCase()
  if (t.includes('tenant')) return 'tenant'
  if (t.includes('admin')) return 'admin'
  if (t.includes('plan') || t.includes('billing') || t.includes('subscription') || t.includes('invoice')) return 'billing'
  if (t.includes('flag') || t.includes('feature')) return 'feature'
  if (t.includes('auth') || t.includes('security') || t.includes('login')) return 'security'
  return 'system'
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function toUiLog(l: AuditLogResponse): SuperAdminAuditLog {
  return {
    id: l.id,
    timestamp: formatTimestamp(l.created_at),
    admin: l.actor_email,
    action: l.action,
    target: l.target_id ? `${l.target_type}/${l.target_id}` : l.target_type,
    details: l.details ? JSON.stringify(l.details) : '',
    category: toUiCategory(l.target_type),
    severity: 'info',
    ipAddress: l.ip_address ?? undefined,
  }
}

// ═══════════════════════════════════════════════════════════════
// Stat Card
// ═══════════════════════════════════════════════════════════════

function StatCard({ label, value, trend, trendUp, color = '#2E86AB' }: {
  label: string; value: string; trend: string; trendUp: boolean; color?: string
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>{value}</div>
      <div className={`flex items-center gap-1 mt-1 text-[10px] font-medium ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
        {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        {trend}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Logs Over Time Chart (SVG Line Chart)
// ═══════════════════════════════════════════════════════════════

function LogsOverTimeChart({ logs }: { logs: SuperAdminAuditLog[] }) {
  const last7Days = useMemo(() => {
    // Get unique dates from actual log data, sorted descending
    const uniqueDates = [...new Set(logs.map(l => {
      const d = new Date(l.timestamp)
      return d.toDateString()
    }))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).slice(0, 7)

    return uniqueDates.map(dateStr => {
      const d = new Date(dateStr)
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const dayLogs = logs.filter(l => {
        const logDate = new Date(l.timestamp)
        return logDate.toDateString() === dateStr
      })
      return {
        date: displayDate,
        info: dayLogs.filter(l => l.severity === 'info').length,
        warning: dayLogs.filter(l => l.severity === 'warning').length,
        error: dayLogs.filter(l => l.severity === 'error' || l.severity === 'critical').length,
      }
    }).reverse() // Reverse to show oldest first
  }, [logs])

  const maxVal = Math.max(...last7Days.map(d => Math.max(d.info, d.warning, d.error)), 1)
  const w = 400, h = 180, pad = { t: 16, r: 16, b: 30, l: 30 }
  const chartW = w - pad.l - pad.r
  const chartH = h - pad.t - pad.b

  const getPoints = (values: number[]) => values.map((v, i) => ({
    x: values.length <= 1 ? pad.l + chartW / 2 : pad.l + (i / (values.length - 1)) * chartW,
    y: pad.t + (1 - v / maxVal) * chartH,
  }))

  const infoPoints = getPoints(last7Days.map(d => d.info))
  const warningPoints = getPoints(last7Days.map(d => d.warning))
  const errorPoints = getPoints(last7Days.map(d => d.error))

  const toPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Audit Logs Over Time</h3>
        <select className="text-[10px] border border-gray-200 rounded-lg px-2 py-1 text-gray-500 outline-none">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[10px] text-gray-500">Info</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-[10px] text-gray-500">Warning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[10px] text-gray-500">Error</span>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 mb-2">Severity unavailable — backend provides no severity; all entries shown as Info.</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 180 }}>
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = pad.t + f * chartH
          const val = Math.round(maxVal - f * maxVal)
          return (
            <g key={f}>
              <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="#f0f0f0" strokeDasharray="4 4" />
              <text x={pad.l - 6} y={y + 3} textAnchor="end" className="fill-gray-400" fontSize={9}>{val}</text>
            </g>
          )
        })}
        <path d={toPath(infoPoints)} fill="none" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" />
        <path d={toPath(warningPoints)} fill="none" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" />
        <path d={toPath(errorPoints)} fill="none" stroke="#EF4444" strokeWidth={2} strokeLinecap="round" />
        {infoPoints.map((p, i) => (
          <circle key={`info-${i}`} cx={p.x} cy={p.y} r={3} fill="#3B82F6" stroke="white" strokeWidth={1.5} />
        ))}
        {warningPoints.map((p, i) => (
          <circle key={`warn-${i}`} cx={p.x} cy={p.y} r={3} fill="#F59E0B" stroke="white" strokeWidth={1.5} />
        ))}
        {errorPoints.map((p, i) => (
          <circle key={`err-${i}`} cx={p.x} cy={p.y} r={3} fill="#EF4444" stroke="white" strokeWidth={1.5} />
        ))}
        {last7Days.map((d, i) => (
          <text key={i} x={infoPoints[i]?.x || 0} y={h - 8} textAnchor="middle" className="fill-gray-400" fontSize={8}>
            {d.date}
          </text>
        ))}
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Logs by Category Chart (SVG Donut)
// ═══════════════════════════════════════════════════════════════

function LogsByCategoryChart({ logs }: { logs: SuperAdminAuditLog[] }) {
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    logs.forEach(l => { counts[l.category] = (counts[l.category] || 0) + 1 })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, percent: Math.round((count / logs.length) * 100) }))
      .sort((a, b) => b.count - a.count)
  }, [logs])

  const total = logs.length
  const cx = 90, cy = 90, r = 70, strokeWidth = 20
  const circumference = 2 * Math.PI * r
  let accumulated = 0

  const segments = categoryData.map(cat => {
    const percent = cat.count / total
    const dashArray = `${percent * circumference} ${circumference}`
    const dashOffset = -accumulated * circumference
    accumulated += percent
    return { ...cat, dashArray, dashOffset }
  })

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Logs by Category</h3>
      <div className="flex items-center gap-6">
        <div className="relative">
          <svg viewBox="0 0 180 180" style={{ width: 160, height: 160 }}>
            {segments.map((seg, i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={categoryColors[seg.name]?.dot.replace('bg-', '#').replace('500', '') || '#6B7280'}
                strokeWidth={strokeWidth}
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
                transform="rotate(-90 90 90)" />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>{total}</div>
              <div className="text-[10px] text-gray-400">total</div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {categoryData.map(cat => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${categoryColors[cat.name]?.dot || 'bg-gray-400'}`} />
                <span className="text-[11px] text-gray-600 capitalize">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-gray-800">{cat.count}</span>
                <span className="text-[10px] text-gray-400">({cat.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Audit Logs Table
// ═══════════════════════════════════════════════════════════════

function AuditLogsTable({ logs }: { logs: SuperAdminAuditLog[] }) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(12)

  const totalPages = Math.ceil(logs.length / perPage)
  const pageData = logs.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-gray-400">
          Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, logs.length)} of {logs.length} entries
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Timestamp</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Admin</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Action</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Target</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Category</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map(log => (
              <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-gray-300" />
                    <span className="text-[11px] text-gray-600">{log.timestamp}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={10} className="text-gray-500" />
                    </div>
                    <span className="text-[11px] font-medium text-gray-700">{log.admin}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[11px] text-gray-600">{log.target}</span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${categoryColors[log.category]?.dot || 'bg-gray-400'}`} />
                    <span className="text-[11px] text-gray-600 capitalize">{log.category}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1) }}
            className="text-[10px] border border-gray-200 rounded-lg px-2 py-1 text-gray-500 outline-none">
            <option value={12}>12 / page</option>
            <option value={24}>24 / page</option>
            <option value={48}>48 / page</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
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
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// By Category Card
// ═══════════════════════════════════════════════════════════════

function ByCategoryCard({ logs }: { logs: SuperAdminAuditLog[] }) {
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    logs.forEach(l => { counts[l.category] = (counts[l.category] || 0) + 1 })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [logs])

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">By Category</h3>
      <div className="space-y-2.5">
        {categoryData.map(cat => (
          <div key={cat.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${categoryColors[cat.name]?.dot || 'bg-gray-400'}`} />
              <span className="text-[11px] text-gray-600 capitalize">{cat.name}</span>
            </div>
            <span className="text-[11px] font-medium text-gray-800">{cat.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// By Severity Card
// ═══════════════════════════════════════════════════════════════

function BySeverityCard({ logs }: { logs: SuperAdminAuditLog[] }) {
  const severityData = useMemo(() => {
    const counts: Record<string, number> = {}
    logs.forEach(l => { counts[l.severity] = (counts[l.severity] || 0) + 1 })
    return ['info', 'warning', 'error', 'critical'].map(s => ({
      name: s,
      count: counts[s] || 0,
      ...severityColors[s],
    }))
  }, [logs])

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">By Severity</h3>
      <p className="text-[10px] text-gray-400 mb-3">Severity unavailable — backend provides no severity; all entries shown as Info.</p>
      <div className="space-y-2.5">
        {severityData.map(sev => {
          const Icon = sev.icon
          return (
            <div key={sev.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={12} style={{ color: sev.color }} />
                <span className="text-[11px] text-gray-600 capitalize">{sev.name}</span>
              </div>
              <span className="text-[11px] font-medium text-gray-800">{sev.count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Recent Activity Card
// ═══════════════════════════════════════════════════════════════

function RecentActivityCard({ logs }: { logs: SuperAdminAuditLog[] }) {
  const recentLogs = logs.slice(0, 5)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
      <div className="space-y-3">
        {recentLogs.map((log, i) => (
          <div key={log.id} className="flex items-start gap-3">
            <div className="relative">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${categoryColors[log.category]?.dot || 'bg-gray-400'}`} />
              {i < recentLogs.length - 1 && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-full bg-gray-100" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-gray-800">{log.action}</div>
              <div className="text-[10px] text-gray-500 truncate">{log.target}</div>
              <div className="text-[9px] text-gray-400 mt-0.5">{log.admin} • {log.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function AuditLogsPage() {
  const { showToast } = useToast()
  const logsQuery = useQuery({
    queryKey: ['sa-audit-logs'],
    // Client-side pagination + charts aggregate the fetched set, so fetch a
    // generous page and slice locally rather than paging per table view.
    queryFn: () => listAuditLogs({ limit: 100 }),
  })
  const logs: SuperAdminAuditLog[] = useMemo(
    () => (logsQuery.data?.logs ?? []).map(toUiLog),
    [logsQuery.data],
  )
  const isLoading = logsQuery.isLoading
  const isError = logsQuery.isError
  const refreshAction = useAction({ duration: 800 })
  const exportAction = useAction({ duration: 1200 })

  const handleRefresh = async () => {
    await refreshAction.execute(async () => {
      const result = await logsQuery.refetch()
      if (result.isError) {
        showToast('error', 'Failed to refresh audit logs')
      } else {
        showToast('success', 'Audit logs refreshed')
      }
    })
  }

  const handleExport = async () => {
    await exportAction.execute(async () => {
      const header = ['id', 'timestamp', 'admin', 'action', 'target', 'category', 'severity']
      const rows = logs.map(l => [l.id, l.timestamp, l.admin, l.action, l.target, l.category, l.severity])
      const csv = [header, ...rows]
        .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
        .join('\n')
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'audit-logs.csv'
      a.click()
      URL.revokeObjectURL(url)
      showToast('success', 'Audit logs exported')
    })
  }

  // Calculate stats from actual data
  const totalEntries = logs.length
  const infoCount = logs.filter(l => l.severity === 'info').length
  const warningCount = logs.filter(l => l.severity === 'warning').length
  const errorCount = logs.filter(l => l.severity === 'error').length
  const criticalCount = logs.filter(l => l.severity === 'critical').length

  // Calculate trends by comparing last 7 days vs previous 7 days
  const calculateTrend = (severity: string) => {
    const now = new Date()
    const last7Days = logs.filter(l => {
      const logDate = new Date(l.timestamp)
      const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays <= 7 && l.severity === severity
    }).length
    const prev7Days = logs.filter(l => {
      const logDate = new Date(l.timestamp)
      const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays > 7 && diffDays <= 14 && l.severity === severity
    }).length
    if (prev7Days === 0) return { value: last7Days > 0 ? '+100%' : '0%', up: last7Days > 0 }
    const change = ((last7Days - prev7Days) / prev7Days) * 100
    return { value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`, up: change >= 0 }
  }

  const totalTrend = calculateTrend('info')
  const warningTrend = calculateTrend('warning')
  const errorTrend = calculateTrend('error')
  const criticalTrend = calculateTrend('critical')

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>Audit Logs</h1>
          <p className="text-[11px] text-gray-400">Track all admin activities and system events</p>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-[10px] text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <AdvancedButton
            variant="outline" size="sm"
            icon={<RefreshCw size={13} />}
            loading={refreshAction.loading}
            success={refreshAction.success}
            onClick={async () => {
              await handleRefresh()
            }}
          >
            Refresh
          </AdvancedButton>
          <AdvancedButton
            variant="outline" size="sm"
            icon={<Download size={13} />}
            loading={exportAction.loading}
            success={exportAction.success}
            onClick={async () => {
              await handleExport()
            }}
          >
            Export CSV
          </AdvancedButton>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 size={20} className="animate-spin text-[#2E86AB] mx-auto mb-2" />
          <p className="text-[12px] text-gray-400">Loading audit logs...</p>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-red-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="text-[12px] text-red-600 font-medium">Failed to load audit logs. Check your connection and try again.</div>
          <button
            onClick={() => void logsQuery.refetch()}
            className="px-3 py-1.5 text-[12px] font-medium text-white rounded-lg transition-colors shrink-0"
            style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}
          >
            Retry
          </button>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <div className="text-sm font-semibold text-gray-900 mb-1">No audit logs found</div>
          <p className="text-[12px] text-gray-400">Admin activity will appear here once it is logged.</p>
        </div>
      ) : (
      <>

      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total Entries" value={totalEntries.toString()} trend={`${totalTrend.value} vs last 7 days`} trendUp={totalTrend.up} color="#3B82F6" />
        <StatCard label="Info" value={infoCount.toString()} trend={`${totalTrend.value} vs last 7 days`} trendUp={totalTrend.up} color="#3B82F6" />
        <StatCard label="Warnings" value={warningCount.toString()} trend={`${warningTrend.value} vs last 7 days`} trendUp={warningTrend.up} color="#F59E0B" />
        <StatCard label="Errors" value={errorCount.toString()} trend={`${errorTrend.value} vs last 7 days`} trendUp={!errorTrend.up} color="#EF4444" />
        <StatCard label="Critical" value={criticalCount.toString()} trend={`${criticalTrend.value} vs last 7 days`} trendUp={criticalTrend.up} color="#7F1D1D" />
      </div>
      <p className="text-[10px] text-gray-400">Severity unavailable — backend provides no severity; all entries shown as Info.</p>

      {/* ── Charts Row ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <LogsOverTimeChart logs={logs} />
        <LogsByCategoryChart logs={logs} />
      </div>

      {/* ── Audit Logs Table ──────────────────────────── */}
      <AuditLogsTable logs={logs} />

      {/* ── Bottom Section ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ByCategoryCard logs={logs} />
        <BySeverityCard logs={logs} />
        <RecentActivityCard logs={logs} />
      </div>

      </>
      )}

      {/* ── Footer ──────────────────────────────────── */}
      <div className="flex items-center justify-between py-3 border-t border-gray-100">
        <span className="text-[11px] text-gray-400">
          {totalEntries} total audit entries logged • Retained for 90 days
        </span>
        <div className="flex items-center gap-2">
          <AdvancedButton
            variant="outline" size="sm"
            icon={<Download size={13} />}
            loading={exportAction.loading}
            success={exportAction.success}
            onClick={async () => {
              await handleExport()
            }}
          >
            Export
          </AdvancedButton>
          <AdvancedButton
            variant="outline" size="sm"
            icon={<RefreshCw size={13} />}
            loading={refreshAction.loading}
            success={refreshAction.success}
            onClick={async () => {
              await handleRefresh()
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
