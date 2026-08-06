import { useState, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, CreditCard, DollarSign, TrendingUp, Activity,
  Search, Ban, UserCog, ChevronLeft, ChevronRight,
  AlertTriangle, Clock, Server,
  Database, Zap, BarChart3, ArrowUpRight, ArrowDownRight,
  Shield, AlertOctagon, Download, FileText,
  X, Info, ExternalLink, Columns, Copy, Flag, Globe, Palette,
} from 'lucide-react'
import type { SuperAdminTenant, SuperAdminAuditLog } from '../../types/superadmin'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { PageTransition, FadeIn, StaggerList, StaggerItem } from '../../components/superadmin/Animations'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type SortField = 'name' | 'plan' | 'status' | 'propertiesCount' | 'subscriptionDate'
type SortDir = 'asc' | 'desc'
type PlanFilter = 'all' | 'Enterprise' | 'Professional' | 'Basic' | 'Free Trial'
type StatusFilter = 'all' | 'Active' | 'Suspended'
type Density = 'compact' | 'default'

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

const CHART_W = 500, CHART_H = 140, PAD = { t: 16, r: 12, b: 26, l: 42 }

const ChartBackground = memo(({ pathD, areaD, max, range }: {
  pathD: string; areaD: string; max: number; range: number
}) => {
  const chartH = CHART_H - PAD.t - PAD.b

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full absolute inset-0" style={{ height: 180 }}>
      <defs>
        <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E86AB" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#2E86AB" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = PAD.t + f * chartH
        const val = max - f * range
        return (
          <g key={f}>
            <line x1={PAD.l} y1={y} x2={CHART_W - PAD.r} y2={y} stroke="#E5E7EB" strokeDasharray="4 4" />
            <text x={PAD.l - 6} y={y + 3} textAnchor="end" className="fill-gray-400" fontSize={9}>
              ${(val / 1000).toFixed(1)}K
            </text>
          </g>
        )
      })}
      <path d={areaD} fill="url(#revAreaGrad)" />
      <path d={pathD} fill="none" stroke="#2E86AB" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
})

const MiniRevenueChart = memo(() => {
  const [period, setPeriod] = useState<'6M' | '12M' | 'YTD' | 'All'>('6M')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
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

  if (data.length === 0) {
    return <EmptyCard icon={BarChart3} message="No revenue data" />
  }

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-900">Platform Revenue (MRR)</h3>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {(['6M', '12M', 'YTD', 'All'] as const).map(p => (
            <button key={p} onClick={() => { setPeriod(p); setHoveredIndex(null) }}
              className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${period === p ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {hoveredIndex !== null && (
        <div className="mb-2 flex items-center gap-3 text-[11px] bg-gray-900 text-white rounded-lg px-3 py-1.5 w-fit">
          <span className="font-medium">{data[hoveredIndex].month}</span>
          <span className="text-emerald-300 font-bold">${data[hoveredIndex].revenue.toLocaleString()}</span>
        </div>
      )}

      <div className="relative" style={{ height: 180 }}>
        <ChartBackground pathD={pathD} areaD={areaD} max={max} range={range} />
        <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full absolute inset-0" style={{ height: 180 }}>
          {points.map((p, i) => (
            <g key={i} className="chart-group">
              <rect
                x={p.x - 12} y={PAD.t} width={24} height={chartH}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              <circle
                className="dot"
                cx={p.x} cy={p.y} r={3}
                fill="#2E86AB"
                stroke="white" strokeWidth={2}
              />
              <line className="hover-el" x1={p.x} y1={p.y} x2={p.x} y2={CHART_H - PAD.b} stroke="#2E86AB" strokeWidth={1} strokeDasharray="3 3" />
              <text className="hover-el fill-gray-600" x={p.x} y={p.y - 10} textAnchor="middle" fontSize={9} fontWeight={600}>
                ${(data[i].revenue / 1000).toFixed(1)}K
              </text>
              <text x={p.x} y={CHART_H - 6} textAnchor="middle" className="fill-gray-400" fontSize={9}>
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
// Confirmation Modal
// ═══════════════════════════════════════════════════════════════

function ConfirmModal({ open, title, message, confirmLabel, confirmColor, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel: string; confirmColor?: string;
  onConfirm: () => void; onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertOctagon size={18} className="text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{message}</p>
          <div className="flex items-center gap-2 mt-4 justify-end">
            <button onClick={onCancel} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors active:scale-95">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all active:scale-95"
              style={{ background: confirmColor || '#EF4444' }}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

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
// Tenant Table (with sorting, filters, bulk actions, sticky, density)
// ═══════════════════════════════════════════════════════════════

function TenantTable({ onImpersonate }: { onImpersonate?: (name: string) => void }) {
  const tenants = useSuperAdminStore(s => s.tenants)
  const suspendTenant = useSuperAdminStore(s => s.suspendTenant)
  const addAuditLog = useSuperAdminStore(s => s.addAuditLog)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [density, setDensity] = useState<Density>('default')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [suspendTarget, setSuspendTarget] = useState<SuperAdminTenant | null>(null)
  const [impersonateTarget, setImpersonateTarget] = useState<SuperAdminTenant | null>(null)
  const [drawerTenant, setDrawerTenant] = useState<SuperAdminTenant | null>(null)

  const perPage = density === 'compact' ? 12 : 8

  // Filtering
  const filtered = tenants.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.email.toLowerCase().includes(search.toLowerCase())) return false
    if (planFilter !== 'all' && t.plan !== planFilter) return false
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    return true
  })

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0
    if (sortField === 'name') cmp = a.name.localeCompare(b.name)
    else if (sortField === 'plan') cmp = a.plan.localeCompare(b.plan)
    else if (sortField === 'status') cmp = a.status.localeCompare(b.status)
    else if (sortField === 'propertiesCount') cmp = a.propertiesCount - b.propertiesCount
    else if (sortField === 'subscriptionDate') cmp = a.subscriptionDate.localeCompare(b.subscriptionDate)
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
    <th className={`text-left py-2 px-3 text-gray-400 font-medium cursor-pointer hover:text-gray-600 transition-colors select-none ${className}`}
      onClick={() => toggleSort(field)}>
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && (
          <span className="text-[10px]">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  )

  const rowPadding = density === 'compact' ? 'py-2' : 'py-3'

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-100">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-900">Tenant Management</h3>

          {/* Filters row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search..."
                className="pl-7 pr-2 py-1 text-[10px] border border-gray-200 rounded-lg outline-none focus:border-blue-300 w-28" />
            </div>

            {/* Plan filter pills */}
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
              {(['all', 'Enterprise', 'Professional', 'Basic'] as const).map(p => (
                <button key={p} onClick={() => { setPlanFilter(p); setPage(1) }}
                  className={`px-1.5 py-0.5 text-[9px] font-medium rounded-md transition-all whitespace-nowrap ${planFilter === p ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  {p === 'all' ? 'All' : p}
                </button>
              ))}
            </div>

            {/* Status filter pills */}
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
              {(['all', 'Active', 'Suspended'] as const).map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
                  className={`px-1.5 py-0.5 text-[9px] font-medium rounded-md transition-all whitespace-nowrap ${statusFilter === s ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>

            {/* Density toggle */}
            <button onClick={() => setDensity(d => d === 'compact' ? 'default' : 'compact')}
              className={`p-1 rounded border transition-colors ${density === 'compact' ? 'bg-blue-50 border-blue-200 text-blue-500' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
              title={`Switch to ${density === 'compact' ? 'default' : 'compact'} density`}>
              <Columns size={13} />
            </button>

            {/* Export */}
            <button className="p-1 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download size={13} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 border-b border-blue-100">
            <span className="text-[10px] font-medium text-blue-700">{selectedIds.size} selected</span>
            <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors">
              <Ban size={11} /> Bulk Suspend
            </button>
            <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <Download size={11} /> Export Selected
            </button>
            <button onClick={() => setSelectedIds(new Set())}
              className="text-[10px] font-medium text-gray-400 hover:text-gray-600 ml-auto">
              Clear selection
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
                <th className="w-8 px-3 py-2">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/30" />
                </th>
                <SortHeader field="name" label="Tenant Name" />
                <SortHeader field="plan" label="Plan" />
                <SortHeader field="status" label="Status" />
                <SortHeader field="propertiesCount" label="Properties" />
                <SortHeader field="subscriptionDate" label="Subscribed" />
                <th className="text-right py-2 px-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-[12px]">No tenants match your filters.</td></tr>
              ) : (
                pageData.map(t => (
                  <tr key={t.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${selectedIds.has(t.id) ? 'bg-blue-50/30' : ''}`}>
                    <td className={`${rowPadding} px-3`}>
                      <input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => toggleSelect(t.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/30" />
                    </td>
                    <td className={`${rowPadding} px-3`}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-blue-500">{t.name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium text-gray-800 truncate max-w-[140px]">{t.name}</div>
                          <div className="text-[8px] text-gray-400 truncate max-w-[140px]">{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`${rowPadding} px-3`}>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${t.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' : t.plan === 'Professional' ? 'bg-blue-100 text-blue-700' : t.plan === 'Basic' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>{t.plan}</span>
                    </td>
                    <td className={`${rowPadding} px-3`}>
                      <span className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold w-fit ${t.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {t.status}
                      </span>
                    </td>
                    <td className={`${rowPadding} px-3 text-gray-600`}>{t.propertiesCount}</td>
                    <td className={`${rowPadding} px-3 text-gray-400 text-[10px]`}>{t.subscriptionDate}</td>
                    <td className={`${rowPadding} px-3`}>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setDrawerTenant(t)}
                          className="px-2 py-1 text-[9px] font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors">
                          View
                        </button>
                        <button onClick={() => setSuspendTarget(t)}
                          className="px-2 py-1 text-[9px] font-medium text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors flex items-center gap-1">
                          <Ban size={10} /> Suspend
                        </button>
                        <button onClick={() => setImpersonateTarget(t)}
                          className="px-2 py-1 text-[9px] font-medium text-orange-600 border border-orange-200 rounded hover:bg-orange-50 transition-colors">
                          Impersonate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {sorted.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-100">
            <span className="text-[10px] text-gray-400">
              {selectedIds.size > 0 ? `${selectedIds.size} selected · ` : ''}
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, sorted.length)} of {sorted.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                const n = start + i
                if (n > totalPages) return null
                return (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded text-[10px] font-medium ${n === page ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {n}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suspend Confirmation Modal */}
      <ConfirmModal
        open={suspendTarget !== null}
        title="Suspend Tenant"
        message={`Are you sure you want to suspend "${suspendTarget?.name}"? This will immediately deactivate their account, booking engine, and all associated services. All guests with active bookings will be notified.`}
        confirmLabel="Suspend Tenant"
        confirmColor="#EF4444"
        onConfirm={() => { if (suspendTarget) { suspendTenant(suspendTarget.id); } setSuspendTarget(null) }}
        onCancel={() => setSuspendTarget(null)}
      />

      {/* Impersonation Confirmation Modal */}
      <ConfirmModal
        open={impersonateTarget !== null}
        title="Impersonate Tenant"
        message={`You are about to impersonate "${impersonateTarget?.name}". You will gain full access to their admin account. All actions will be logged with your SuperAdmin credentials.`}
        confirmLabel="Start Impersonation"
        confirmColor="#F59E0B"
        onConfirm={() => {
          if (impersonateTarget) {
            addAuditLog({
              admin: 'SuperAdmin', action: 'IMPERSONATE_TENANT', target: impersonateTarget.name,
              details: `Impersonated tenant "${impersonateTarget.name}"`,
              category: 'admin', severity: 'warning',
            })
            onImpersonate?.(impersonateTarget.name)
          }
          setImpersonateTarget(null)
        }}
        onCancel={() => setImpersonateTarget(null)}
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
  const [showAll, setShowAll] = useState(false)

  if (featureFlags.length === 0) {
    return <EmptyCard icon={Flag} message="No feature flags" />
  }

  const displayed = showAll ? featureFlags : featureFlags.slice(0, 16)

  const categoryIconMap: Record<string, typeof Flag> = {
    core: Zap, branding: Palette, integrations: Globe,
    compliance: Shield, experimental: AlertTriangle,
  }

  const categoryColorMap: Record<string, string> = {
    core: '#2E86AB', branding: '#8B5CF6', integrations: '#10B981',
    compliance: '#F59E0B', experimental: '#EF4444',
  }

  const enabledCount = featureFlags.filter(f => f.status).length

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Flag size={13} className="text-[#2E86AB]" />
          <h3 className="text-xs font-semibold text-gray-900">Feature Flags</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-400">{enabledCount}/{featureFlags.length} enabled</span>
          <button onClick={() => setShowAll(v => !v)}
            className="text-[9px] font-medium text-blue-600 hover:text-blue-700 transition-colors">
            {showAll ? 'Show less' : `Show all (${featureFlags.length})`}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
        {displayed.map(flag => {
          const CatIcon = categoryIconMap[flag.category] || Flag
          const catColor = categoryColorMap[flag.category] || '#6B7280'
          return (
            <div key={flag.id}
              className={`flex items-center gap-2.5 px-3 py-4 rounded-lg border transition-all ${
                flag.status
                  ? 'border-gray-100 bg-white hover:border-gray-200'
                  : 'border-gray-50 bg-gray-50/50 opacity-60'
              }`}
            >
              <div className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                style={{ background: `${catColor}15` }}
              >
                <CatIcon size={12} style={{ color: catColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-gray-700 truncate">{flag.feature}</div>
                <div className="text-[9px] text-gray-400 truncate">{flag.description.slice(0, 40)}</div>
              </div>
              <button
                onClick={() => toggleFlag(flag.id)}
                role="switch"
                aria-checked={flag.status}
                aria-label={flag.feature}
                className={`relative w-7 h-3.5 rounded-full transition-colors shrink-0 ${
                  flag.status ? 'bg-emerald-400' : 'bg-gray-200'
                }`}
              >
                <div className={`absolute top-[1px] w-[12px] h-[12px] bg-white rounded-full shadow transition-all ${
                  flag.status ? 'left-[14px]' : 'left-[1px]'
                }`} />
              </button>
            </div>
          )
        })}
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
      <div className="bg-white rounded-lg p-3 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-900">Recent Audit Log</h3>
          <button onClick={() => navigate('/superadmin/audit-logs')} className="text-[10px] font-medium text-blue-600 hover:text-blue-700 transition-colors">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-1.5 text-gray-400 font-medium">Timestamp</th>
                <th className="text-left py-1.5 text-gray-400 font-medium">Admin</th>
                <th className="text-left py-1.5 text-gray-400 font-medium">Action</th>
                <th className="text-left py-1.5 text-gray-400 font-medium">Target</th>
                <th className="text-left py-1.5 text-gray-400 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="border-b border-gray-50 cursor-pointer hover:bg-gray-50/70 transition-colors">
                  <td className="py-2.5 text-gray-500">{log.timestamp}</td>
                  <td className="py-2.5 text-gray-700 font-medium">{log.admin}</td>
                  <td className="py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${actionColor[log.action] || 'bg-gray-100 text-gray-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-700">{log.target}</td>
                  <td className="py-2.5 text-gray-400 max-w-[180px] truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[9px] text-gray-300">Click any row to view full event metadata</span>
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

          {/* Revenue Chart (bigger) + Key Feature Flags + Tenant Table */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 items-start">
            <div className="xl:col-span-3 space-y-3">
              <MiniRevenueChart />
              <KeyFeatureFlags />
            </div>
            <div className="xl:col-span-2">
              <TenantTable onImpersonate={setImpersonating} />
            </div>
          </div>

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
