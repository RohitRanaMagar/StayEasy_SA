import { useState, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, CreditCard, DollarSign, TrendingUp, Activity,
  Search, Ban, UserCog, ChevronLeft, ChevronRight,
  AlertTriangle, Clock, Server,
  Database, Zap, BarChart3, ArrowUpRight, ArrowDownRight,
  Shield, FileText,
  X, Info, ExternalLink, Copy, Flag, Plus,
} from 'lucide-react'
import type { SuperAdminTenant, SuperAdminAuditLog } from '../../types/superadmin'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { PageTransition, FadeIn, StaggerList, StaggerItem } from '../../components/superadmin/Animations'
import { ConfirmDialog } from '../../components/superadmin/AdvancedButton'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type SortField = 'name' | 'plan' | 'status'
type SortDir = 'asc' | 'desc'

// ═══════════════════════════════════════════════════════════════
// Stat Card with Sparkline
// ═══════════════════════════════════════════════════════════════

function Sparkline({ data, color = '#2E86AB' }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null
  const w = 80, h = 24
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * h,
  }))
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} className="shrink-0">
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StatCard({ icon: Icon, label, value, change, changeType, color, sparkData }: {
  icon: typeof Users; label: string; value: string | number;
  change: string; changeType: 'up' | 'down'; color: string; sparkData?: number[]
}) {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100 hover:shadow-sm hover:border-gray-200 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider truncate">{label}</div>
          <div className="text-lg font-bold text-gray-900 mt-0.5" style={{ fontFamily: "'Sora', sans-serif" }}>{value}</div>
        </div>
        <div className="flex items-center gap-2">
          {sparkData && <Sparkline data={sparkData} color={color} />}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
            <Icon size={15} style={{ color }} />
          </div>
        </div>
      </div>
      <div className={`flex items-center gap-1 text-[11px] font-medium ${changeType === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
        {changeType === 'up' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
        <span className="truncate">{change}</span>
      </div>
    </div>
  )
}

function EmptyCard({ icon: Icon, message }: { icon: typeof Flag; message: string }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100">
      <div className="h-[80px] flex flex-col items-center justify-center gap-2 text-gray-300">
        <Icon size={16} />
        <span className="text-[11px]">{message}</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Revenue Chart with Period Pills & Hover Tooltips
// ═══════════════════════════════════════════════════════════════

const CHART_W = 500, CHART_H = 160, PAD = { t: 16, r: 12, b: 26, l: 42 }

const MiniRevenueChart = memo(() => {
  const [period, setPeriod] = useState<'6M' | '12M' | 'YTD' | 'All'>('6M')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const revenueData = useSuperAdminStore(s => s.revenueData)

  const data = revenueData
  const chartW = CHART_W - PAD.l - PAD.r
  const chartH = CHART_H - PAD.t - PAD.b

  const { points, pathD, areaD, max, range } = useMemo(() => {
    if (data.length === 0) return { points: [], pathD: '', areaD: '', max: 0, range: 1 }
    const max = Math.max(...data.map(d => d.revenue))
    const min = Math.min(...data.map(d => d.revenue))
    const range = max - min || 1
    const points = data.map((d, i) => ({
      x: PAD.l + (i / (data.length - 1)) * chartW,
      y: PAD.t + (1 - (d.revenue - min) / range) * chartH,
      revenue: d.revenue,
      month: d.month,
    }))
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    const areaD = pathD + ` L ${points[points.length - 1].x.toFixed(1)} ${(CHART_H - PAD.b).toFixed(1)} L ${points[0].x.toFixed(1)} ${(CHART_H - PAD.b).toFixed(1)} Z`
    return { points, pathD, areaD, max, range }
  }, [data, chartW, chartH])

  const totalRevenue = data.length > 0 ? data[data.length - 1].revenue : 0
  const prevRevenue = data.length > 1 ? data[data.length - 2].revenue : totalRevenue
  const changePercent = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0

  const periodLabels = { '6M': 'Last 6 Months', '12M': 'Last 12 Months', 'YTD': 'Year to Date', 'All': 'All Time' }

  if (data.length === 0) {
    return <EmptyCard icon={BarChart3} message="No revenue data" />
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Monthly Recurring Revenue</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</span>
            {changePercent !== 0 && (
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${changePercent > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {changePercent > 0 ? '↑' : '↓'} {Math.abs(changePercent).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">vs last month</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            {periodLabels[period]}
            <svg className={`w-3 h-3 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
              {(['6M', '12M', 'YTD', 'All'] as const).map(p => (
                <button key={p} onClick={() => { setPeriod(p); setShowDropdown(false); setHoveredIndex(null) }}
                  className={`w-full text-left px-3 py-2 text-[11px] font-medium transition-colors ${period === p ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {periodLabels[p]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {hoveredIndex !== null && (
        <div className="mb-2 flex items-center gap-3 text-[11px] bg-gray-900 text-white rounded-lg px-3 py-1.5 w-fit">
          <span className="font-medium">{data[hoveredIndex].month}</span>
          <span className="text-emerald-300 font-bold">${data[hoveredIndex].revenue.toLocaleString()}</span>
        </div>
      )}

      <div className="relative" style={{ height: 320 }}>
        <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full absolute inset-0" style={{ height: 320 }}>
          <defs>
            <linearGradient id="revAreaGradNew" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E86AB" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#2E86AB" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(f => {
            const y = PAD.t + f * chartH
            const val = Math.round(max - f * range)
            const label = val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `$${Math.round(val / 1000)}K` : `$${val}`
            return (
              <g key={f}>
                <line x1={PAD.l} y1={y} x2={CHART_W - PAD.r} y2={y} stroke="#F3F4F6" strokeWidth={1} />
                <text x={PAD.l - 8} y={y + 3} textAnchor="end" className="fill-gray-400" fontSize={10}>
                  {label}
                </text>
              </g>
            )
          })}
          {/* Area fill */}
          <path d={areaD} fill="url(#revAreaGradNew)" />
          {/* Line */}
          <path d={pathD} fill="none" stroke="#2E86AB" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <rect
                x={p.x - 15} y={PAD.t} width={30} height={chartH}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              <circle
                cx={p.x} cy={p.y} r={hoveredIndex === i ? 5 : 3.5}
                fill={hoveredIndex === i ? '#2E86AB' : 'white'}
                stroke="#2E86AB" strokeWidth={2}
                style={{ transition: 'all 0.15s ease' }}
              />
              {/* X-axis labels */}
              <text x={p.x} y={CHART_H - 6} textAnchor="middle" className="fill-gray-400" fontSize={10}>
                {data[i].month.split(' ')[0]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════
// Impersonation Banner
// ═══════════════════════════════════════════════════════════════

function ImpersonationBanner({ tenantName, onExit }: { tenantName: string; onExit: () => void }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-amber-900 px-4 py-2 flex items-center justify-center gap-3 text-xs font-medium shadow-lg">
      <Shield size={14} className="shrink-0" />
      <span>You are currently impersonating <strong>{tenantName}</strong> — all actions are logged.</span>
      <button onClick={onExit}
        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors text-[11px] font-semibold">
        <X size={12} /> Exit Impersonation
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Slide-Out Tenant Drawer
// ═══════════════════════════════════════════════════════════════

function TenantDrawer({ tenant, open, onClose }: { tenant: SuperAdminTenant | null; open: boolean; onClose: () => void }) {
  const auditLogs = useSuperAdminStore(s => s.auditLogs)
  if (!open || !tenant) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md bg-white shadow-2xl border-l border-gray-100 h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-500">{tenant.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{tenant.name}</h3>
              <p className="text-[10px] text-gray-400">Tenant ID: {tenant.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status badges */}
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${tenant.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{tenant.status}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${tenant.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' : tenant.plan === 'Professional' ? 'bg-blue-100 text-blue-700' : tenant.plan === 'Basic' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>{tenant.plan}</span>
          </div>

          {/* Key info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400">Properties</div>
              <div className="text-base font-bold text-gray-900">{tenant.propertiesCount}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400">Email</div>
              <div className="text-xs font-medium text-gray-700 truncate">{tenant.email}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400">Subscribed</div>
              <div className="text-xs font-medium text-gray-700">{tenant.subscriptionDate}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400">Avg Rating</div>
              <div className="text-base font-bold text-gray-900">4.2 ⭐</div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-900">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                <ExternalLink size={11} /> View Properties
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                <BarChart3 size={11} /> Analytics
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText size={11} /> Invoices
              </button>
            </div>
          </div>

          {/* Activity */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 mb-2">Recent Activity</h4>
            <div className="space-y-2">
              {auditLogs.filter(l => l.target === tenant.name).slice(0, 4).map(log => (
                <div key={log.id} className="flex items-start gap-2 text-[10px] text-gray-500">
                  <Clock size={10} className="mt-0.5 shrink-0 text-gray-300" />
                  <div>
                    <span className="font-medium text-gray-700">{log.action}</span>
                    <span className="text-gray-400"> — {log.details.slice(0, 60)}...</span>
                  </div>
                </div>
              ))}
              {auditLogs.filter(l => l.target === tenant.name).length === 0 && (
                <div className="text-[10px] text-gray-300 italic">No recent activity logged.</div>
              )}
            </div>
          </div>

          {/* Danger zone */}
          <div className="pt-3 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-red-600 mb-2">Danger Zone</h4>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                <Ban size={11} /> Suspend Tenant
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                <UserCog size={11} /> Impersonate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Audit Log Modal
// ═══════════════════════════════════════════════════════════════

function AuditLogModal({ log, open, onClose }: { log: SuperAdminAuditLog | null; open: boolean; onClose: () => void }) {
  if (!open || !log) return null
  const severityColors: Record<string, string> = { info: 'bg-blue-100 text-blue-700', warning: 'bg-yellow-100 text-yellow-700', error: 'bg-red-100 text-red-700', critical: 'bg-red-100 text-red-700' }
  const actionColors: Record<string, string> = { SUSPEND_TENANT: 'bg-red-100 text-red-700', UPDATE_FEATURE_FLAG: 'bg-blue-100 text-blue-700', UPDATE_PLAN: 'bg-purple-100 text-purple-700', IMPERSONATE_TENANT: 'bg-orange-100 text-orange-700', LOGIN_FAILED: 'bg-red-100 text-red-700', LOGIN_SUCCESS: 'bg-green-100 text-green-700', PASSWORD_CHANGE: 'bg-yellow-100 text-yellow-700', ACCOUNT_LOCKED: 'bg-orange-100 text-orange-700', '2FA_ENABLED': 'bg-blue-100 text-blue-700', TENANT_CREATED: 'bg-green-100 text-green-700', TENANT_UPDATED: 'bg-blue-100 text-blue-700', TENANT_DELETED: 'bg-red-100 text-red-700', TENANT_RESTORED: 'bg-emerald-100 text-emerald-700', PAYMENT_RECEIVED: 'bg-green-100 text-green-700', PAYMENT_FAILED: 'bg-red-100 text-red-700', REFUND_ISSUED: 'bg-orange-100 text-orange-700', INVOICE_SENT: 'bg-blue-100 text-blue-700', SUBSCRIPTION_CANCELED: 'bg-yellow-100 text-yellow-700', BACKUP_COMPLETED: 'bg-blue-100 text-blue-700', MAINTENANCE_WINDOW: 'bg-purple-100 text-purple-700', ERROR_THRESHOLD: 'bg-red-100 text-red-700', CERTIFICATE_RENEWED: 'bg-green-100 text-green-700', DEPLOYMENT: 'bg-purple-100 text-purple-700', CACHE_CLEARED: 'bg-blue-100 text-blue-700', API_KEY_REGENERATED: 'bg-orange-100 text-orange-700', SETTINGS_CHANGED: 'bg-gray-100 text-gray-700', ROLE_MODIFIED: 'bg-purple-100 text-purple-700', ADMIN_INVITED: 'bg-green-100 text-green-700' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-900">Audit Log Details</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400 mb-0.5">Event ID</div>
              <div className="text-xs font-mono font-medium text-gray-700">{log.id}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400 mb-0.5">Timestamp</div>
              <div className="text-xs font-medium text-gray-700">{log.timestamp}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400 mb-0.5">Admin</div>
              <div className="text-xs font-medium text-gray-700">{log.admin}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400 mb-0.5">Target</div>
              <div className="text-xs font-medium text-gray-700">{log.target}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400 mb-0.5">Category</div>
              <div className="text-xs font-medium text-gray-700 capitalize">{log.category}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400 mb-0.5">Severity</div>
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${severityColors[log.severity] || 'bg-gray-100 text-gray-600'}`}>{log.severity}</span>
              </div>
            </div>
          </div>

          {/* Action badge + Details */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${actionColors[log.action] || 'bg-gray-100 text-gray-600'}`}>{log.action}</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{log.details}</p>
          </div>

          {/* Metadata */}
          {log.metadata && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-900">Request Metadata</h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                {log.metadata.requestMethod && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Method</span>
                    <span className="font-mono font-medium text-gray-700">{log.metadata.requestMethod}</span>
                  </div>
                )}
                {log.metadata.requestPath && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Path</span>
                    <span className="font-mono font-medium text-gray-700 text-right max-w-[200px] truncate">{log.metadata.requestPath}</span>
                  </div>
                )}
                {log.metadata.duration && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Duration</span>
                    <span className="font-medium text-gray-700">{log.metadata.duration}</span>
                  </div>
                )}
                {log.ipAddress && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">IP Address</span>
                    <span className="font-mono font-medium text-gray-700">{log.ipAddress}</span>
                  </div>
                )}
                {log.metadata.tenantEmail && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Email</span>
                    <span className="font-medium text-gray-700">{log.metadata.tenantEmail}</span>
                  </div>
                )}
                {log.metadata.sessionId && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Session</span>
                    <span className="font-mono font-medium text-gray-700">{log.metadata.sessionId}</span>
                  </div>
                )}
                {log.metadata.changes && log.metadata.changes.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-[10px] text-gray-400 font-medium">Changes</span>
                    {log.metadata.changes.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 mt-1 text-[11px]">
                        <span className="text-gray-500">{c.field}:</span>
                        <span className="line-through text-red-500">{c.from}</span>
                        <span className="text-gray-300">→</span>
                        <span className="text-emerald-600 font-medium">{c.to}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw JSON with Copy */}
          <details className="group">
            <summary className="text-[10px] font-medium text-gray-400 cursor-pointer hover:text-gray-600 transition-colors flex items-center gap-1">
              View Raw JSON
            </summary>
            <div className="relative mt-2">
              <button
                onClick={() => { navigator.clipboard.writeText(JSON.stringify(log, null, 2)) }}
                className="absolute top-2 right-2 p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
                title="Copy to clipboard"
              >
                <Copy size={12} />
              </button>
              <pre className="text-[9px] font-mono bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto max-h-[200px]">
                {JSON.stringify(log, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Tenant Table (with sorting, search, pagination)
// ═══════════════════════════════════════════════════════════════

function TenantTable({ onImpersonate }: { onImpersonate?: (name: string) => void }) {
  const tenants = useSuperAdminStore(s => s.tenants)
  const suspendTenant = useSuperAdminStore(s => s.suspendTenant)
  const addAuditLog = useSuperAdminStore(s => s.addAuditLog)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [suspendTarget, setSuspendTarget] = useState<SuperAdminTenant | null>(null)
  const [impersonateTarget, setImpersonateTarget] = useState<SuperAdminTenant | null>(null)
  const [drawerTenant, setDrawerTenant] = useState<SuperAdminTenant | null>(null)

  const perPage = 5

  // Filtering
  const filtered = tenants.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0
    if (sortField === 'name') cmp = a.name.localeCompare(b.name)
    else if (sortField === 'plan') cmp = a.plan.localeCompare(b.plan)
    else if (sortField === 'status') cmp = a.status.localeCompare(b.status)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(sorted.length / perPage)
  const pageData = sorted.slice((page - 1) * perPage, page * perPage)
  const allSelected = pageData.length > 0 && pageData.every(t => selectedIds.has(t.id))

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(pageData.map(t => t.id)))
  }

  const SortHeader = ({ field, label, className = '' }: { field: SortField; label: string; className?: string }) => (
    <th className={`text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors select-none ${className}`}
      onClick={() => toggleSort(field)}>
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && (
          <span className="text-[9px]">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  )

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-700'
      case 'Professional': return 'bg-blue-100 text-blue-700'
      case 'Basic': return 'bg-gray-100 text-gray-600'
      default: return 'bg-green-100 text-green-700'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' }
      case 'Suspended': return { bg: 'bg-red-50 text-red-600', dot: 'bg-red-500' }
      default: return { bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' }
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Tenant Management</h3>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search..."
                className="pl-9 pr-4 py-2 text-[12px] bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#2E86AB]/20 focus:border-[#2E86AB] w-48" />
            </div>
            {/* Add Button */}
            <button className="flex items-center gap-1.5 px-3 py-2 bg-[#1a2332] text-white text-[12px] font-medium rounded-lg hover:bg-[#243044] transition-colors">
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/30" />
                </th>
                <SortHeader field="name" label="Tenant Name" />
                <SortHeader field="plan" label="Plan" />
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">MRR</th>
                <SortHeader field="status" label="Status" />
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400 text-[12px]">No tenants found.</td></tr>
              ) : (
                pageData.map(t => {
                  const statusStyle = getStatusBadge(t.status)
                  return (
                    <tr key={t.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${selectedIds.has(t.id) ? 'bg-blue-50/30' : ''}`}
                      onClick={() => setDrawerTenant(t)}>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => toggleSelect(t.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/30" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {t.logo ? (
                            <img src={t.logo} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-bold text-white">{t.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-[12px] font-medium text-gray-900 truncate">{t.name}</div>
                            <div className="text-[10px] text-gray-400 truncate">{t.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-semibold ${getPlanBadge(t.plan)}`}>
                          {t.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-semibold text-gray-900">
                            {t.monthlyRevenue > 0 ? `$${t.monthlyRevenue.toLocaleString()}` : '$0'}
                          </span>
                          {t.mrrChange !== undefined && t.mrrChange !== 0 && (
                            <span className={`text-[10px] font-medium ${t.mrrChange > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {t.mrrChange > 0 ? '+' : ''}{t.mrrChange}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold ${statusStyle.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {sorted.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-[11px] text-gray-400">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, sorted.length)} of {sorted.length} results
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                const n = start + i
                if (n > totalPages) return null
                return (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-7 h-7 rounded-md text-[11px] font-medium ${n === page ? 'bg-[#1a2332] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {n}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suspend Confirmation Modal */}
      <ConfirmDialog
        open={suspendTarget !== null}
        onClose={() => setSuspendTarget(null)}
        title="Suspend Tenant"
        message={`Are you sure you want to suspend "${suspendTarget?.name}"? This will immediately deactivate their account, booking engine, and all associated services. All guests with active bookings will be notified.`}
        confirmLabel="Suspend Tenant"
        variant="danger"
        onConfirm={() => { if (suspendTarget) { suspendTenant(suspendTarget.id); } }}
      />

      {/* Impersonation Confirmation Modal */}
      <ConfirmDialog
        open={impersonateTarget !== null}
        onClose={() => setImpersonateTarget(null)}
        title="Impersonate Tenant"
        message={`You are about to impersonate "${impersonateTarget?.name}". You will gain full access to their admin account. All actions will be logged with your SuperAdmin credentials.`}
        confirmLabel="Start Impersonation"
        variant="primary"
        onConfirm={() => {
          if (impersonateTarget) {
            addAuditLog({
              admin: 'SuperAdmin', action: 'IMPERSONATE_TENANT', target: impersonateTarget.name,
              details: `Impersonated tenant "${impersonateTarget.name}"`,
              category: 'admin', severity: 'warning',
            })
            onImpersonate?.(impersonateTarget.name)
          }
        }}
      />

      {/* Tenant Drawer */}
      <TenantDrawer tenant={drawerTenant} open={drawerTenant !== null} onClose={() => setDrawerTenant(null)} />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// Key Feature Flags (compact)
// ═══════════════════════════════════════════════════════════════

function KeyFeatureFlags() {
  const featureFlags = useSuperAdminStore(s => s.featureFlags)
  const toggleFlag = useSuperAdminStore(s => s.toggleFlag)

  if (featureFlags.length === 0) {
    return <EmptyCard icon={Flag} message="No feature flags" />
  }

  const scopeColors: Record<string, string> = {
    Professional: 'bg-blue-100 text-blue-700',
    Enterprise: 'bg-purple-100 text-purple-700',
    'All plans': 'bg-gray-100 text-gray-600',
    'Enterprise (beta)': 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Feature Flags</h3>
        <span className="text-[11px] text-gray-400">{featureFlags.filter(f => f.status).length}/{featureFlags.length} enabled</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Feature</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Description</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Scope</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {featureFlags.map(flag => (
              <tr key={flag.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-800">{flag.feature}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-500">{flag.description}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${scopeColors[flag.scope] || 'bg-gray-100 text-gray-600'}`}>
                    {flag.scope}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleFlag(flag.id)}
                    role="switch"
                    aria-checked={flag.status}
                    aria-label={flag.feature}
                    className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                      flag.status ? 'bg-emerald-400' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`absolute top-[2px] w-[16px] h-[16px] bg-white rounded-full shadow transition-all ${
                      flag.status ? 'left-[18px]' : 'left-[2px]'
                    }`} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// System Health with Badges
// ═══════════════════════════════════════════════════════════════

function SystemHealthSection() {
  const navigate = useNavigate()
  const systemHealth = useSuperAdminStore(s => s.systemHealth)
  const healthItems = systemHealth ? [
    { label: 'Server Uptime', value: `${systemHealth.serverUptime}%`, change: `↑ ${systemHealth.serverUptimeChange} pp vs last 7 days`, icon: Server, color: '#10B981', bgColor: '#ECFDF5', threshold: systemHealth.serverUptime, critical: 99.0, warning: 99.5 },
    { label: 'Error Rate', value: `${systemHealth.errorRate}%`, change: `↓ ${Math.abs(systemHealth.errorRateChange)} pp vs last 7 days`, icon: AlertTriangle, color: '#F59E0B', bgColor: '#FFFBEB', threshold: systemHealth.errorRate, critical: 1.0, warning: 0.5 },
    { label: 'Queue Depth', value: systemHealth.queueDepth.toString(), change: `↓ ${Math.abs(systemHealth.queueDepthChange)} vs last 7 days`, icon: Database, color: '#3B82F6', bgColor: '#EFF6FF', threshold: systemHealth.queueDepth, critical: 50, warning: 20 },
    { label: 'Cache Hit Ratio', value: `${systemHealth.cacheHitRatio}%`, change: `↑ ${systemHealth.cacheHitRatioChange} pp vs last 7 days`, icon: Zap, color: '#10B981', bgColor: '#ECFDF5', threshold: systemHealth.cacheHitRatio, critical: 80, warning: 90 },
  ] : []

  if (!systemHealth) {
    return <EmptyCard icon={Server} message="No health data" />
  }

  const getStatus = (item: typeof healthItems[0]): { badge: string; bg: string; text: string } => {
    // For items where lower is better (error rate, queue depth) or higher is better (uptime, cache)
    const lowerIsBetter = item.label === 'Error Rate' || item.label === 'Queue Depth'
    if (lowerIsBetter) {
      if (item.threshold > (item.critical ?? Infinity)) return { badge: 'Critical', bg: 'bg-red-100', text: 'text-red-700' }
      if (item.threshold > (item.warning ?? Infinity)) return { badge: 'Warning', bg: 'bg-yellow-100', text: 'text-yellow-700' }
      return { badge: 'Normal', bg: 'bg-emerald-100', text: 'text-emerald-700' }
    } else {
      if (item.threshold < (item.critical ?? 0)) return { badge: 'Critical', bg: 'bg-red-100', text: 'text-red-700' }
      if (item.threshold < (item.warning ?? 0)) return { badge: 'Warning', bg: 'bg-yellow-100', text: 'text-yellow-700' }
      return { badge: 'Normal', bg: 'bg-emerald-100', text: 'text-emerald-700' }
    }
  }

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-900">System Health</h3>
        <button onClick={() => navigate('/superadmin/logs')} className="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-700 transition-colors">
          <FileText size={11} /> View System Logs
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {healthItems.map((item) => {
          const Icon = item.icon
          const status = getStatus(item)
          return (
            <div key={item.label} className="p-2.5 rounded-lg border border-gray-100 hover:shadow-sm hover:border-gray-200 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${status.badge === 'Normal' ? 'bg-emerald-500' : status.badge === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <span className="text-[10px] text-gray-400">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-1 py-0.5 rounded text-[8px] font-semibold ${status.bg} ${status.text}`}>{status.badge}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: item.bgColor }}>
                    <Icon size={12} style={{ color: item.color }} />
                  </div>
                </div>
              </div>
              <div className="text-base font-bold text-gray-900">{item.value}</div>
              <div className="text-[9px] text-gray-400 mt-0.5">{item.change}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Audit Log Section (clickable rows)
// ═══════════════════════════════════════════════════════════════

function AuditLogSection() {
  const navigate = useNavigate()
  const auditLogs = useSuperAdminStore(s => s.auditLogs)
  const [selectedLog, setSelectedLog] = useState<SuperAdminAuditLog | null>(null)

  if (auditLogs.length === 0) {
    return (
      <>
        <EmptyCard icon={Clock} message="No audit events" />
        <AuditLogModal log={selectedLog} open={selectedLog !== null} onClose={() => setSelectedLog(null)} />
      </>
    )
  }

  const actionColor: Record<string, string> = {
    SUSPEND_TENANT: 'bg-red-100 text-red-700',
    UPDATE_FEATURE_FLAG: 'bg-blue-100 text-blue-700',
    UPDATE_PLAN: 'bg-purple-100 text-purple-700',
    IMPERSONATE_TENANT: 'bg-orange-100 text-orange-700',
    LOGIN_FAILED: 'bg-red-100 text-red-700',
    LOGIN_SUCCESS: 'bg-green-100 text-green-700',
    ACCOUNT_LOCKED: 'bg-orange-100 text-orange-700',
    PAYMENT_RECEIVED: 'bg-green-100 text-green-700',
    PAYMENT_FAILED: 'bg-red-100 text-red-700',
    TENANT_CREATED: 'bg-green-100 text-green-700',
    BACKUP_COMPLETED: 'bg-blue-100 text-blue-700',
    DEPLOYMENT: 'bg-purple-100 text-purple-700',
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Recent Audit Log</h3>
          <button onClick={() => navigate('/superadmin/audit-logs')} className="text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Admin</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Target</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Details</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="border-b border-gray-50 cursor-pointer hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{log.timestamp}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{log.admin}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${actionColor[log.action] || 'bg-gray-100 text-gray-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{log.target}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate">{log.details}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-[11px]">{log.ipAddress || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-gray-100">
          <span className="text-[10px] text-gray-300">Click any row to view full event metadata</span>
        </div>
      </div>

      {/* Audit Log Detail Modal */}
      <AuditLogModal log={selectedLog} open={selectedLog !== null} onClose={() => setSelectedLog(null)} />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Dashboard
// ═══════════════════════════════════════════════════════════════

export default function SuperAdminDashboard() {
  const [impersonating, setImpersonating] = useState<string | null>(null)
  const stats = useSuperAdminStore(s => s.dashboardStats)

  return (
    <PageTransition>
      <>
      {/* Impersonation Banner */}
      {impersonating && (
        <ImpersonationBanner tenantName={impersonating} onExit={() => setImpersonating(null)} />
      )}

      <div className={impersonating ? 'pt-10' : ''}>
        <div className="space-y-3">
          {/* Stat Cards with Sparklines */}
          <StaggerList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <StaggerItem><StatCard icon={Users} label="Total Tenants" value={stats.totalTenants}
              change={`↑ ${stats.totalTenantsChange} active`} changeType="up" color="#2E86AB"
              sparkData={[28, 32, 30, 35, 38, 42, 45, 48, 52, 55, 58, 62]} /></StaggerItem>
            <StaggerItem><StatCard icon={CreditCard} label="Active Subscriptions" value={stats.activeSubscriptions}
              change={`↑ ${stats.activeSubscriptionsChange} this month`} changeType="up" color="#10B981"
              sparkData={[15, 18, 20, 22, 25, 28, 30, 32, 35, 36, 38, 40]} /></StaggerItem>
            <StaggerItem><StatCard icon={DollarSign} label="MRR" value={`$${stats.mrr.toLocaleString()}`}
              change={`↑ ${stats.mrrChangePercent}% vs last month`} changeType="up" color="#8B5CF6"
              sparkData={[15.2, 16.4, 18.7, 20.9, 22.4, 24.5]} /></StaggerItem>
            <StaggerItem><StatCard icon={TrendingUp} label="Churn Rate" value={`${stats.churnRate}%`}
              change={`↓ ${stats.churnRateChange} pp vs last month`} changeType="down" color="#F59E0B"
              sparkData={[5.2, 4.8, 4.5, 4.0, 3.6, 3.2]} /></StaggerItem>
            <StaggerItem><StatCard icon={Activity} label="API Calls Today" value={stats.apiCallsToday}
              change={`↑ ${stats.apiCallsChangePercent}% vs yesterday`} changeType="up" color="#EF4444"
              sparkData={[0.8, 0.9, 1.0, 1.1, 0.95, 1.1, 1.15, 1.2]} /></StaggerItem>
          </StaggerList>

          {/* Revenue Chart + Tenant Table */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 items-start">
            <div>
              <MiniRevenueChart />
            </div>
            <div>
              <TenantTable onImpersonate={setImpersonating} />
            </div>
          </div>

          {/* Feature Flags */}
          <FadeIn><KeyFeatureFlags /></FadeIn>

          {/* System Health */}
          <FadeIn><SystemHealthSection /></FadeIn>

          {/* Audit Log */}
          <FadeIn delay={0.1}><AuditLogSection /></FadeIn>
        </div>
      </div>
    </>
    </PageTransition>
  )
}
