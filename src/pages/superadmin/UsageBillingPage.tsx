import { useState } from 'react'
import {
  BarChart3, Activity, HardDrive, Wifi, Search,
  ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight,
  CheckCircle, XCircle, Clock, Download, DollarSign,
  AlertTriangle, Percent, Users, FileText,
} from 'lucide-react'
import { useToast } from '../../components/superadmin/Toast'
import AdvancedButton from '../../components/superadmin/AdvancedButton'
import { useAction } from '../../components/superadmin/useAction'
import { PageTransition } from '../../components/superadmin/Animations'
import type { TenantUsage, UsageMonthlyBreakdown, OverageCharge } from '../../types/superadmin'

import { mockTenantUsageData, mockUsageMonthlyBreakdown, mockOverageCharges } from '../../data/superAdminMockData'
const tenantUsageData: TenantUsage[] = mockTenantUsageData
const usageMonthlyBreakdown: UsageMonthlyBreakdown[] = mockUsageMonthlyBreakdown
const overageCharges: OverageCharge[] = mockOverageCharges

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

const usageStatusColors: Record<string, { text: string; bg: string; icon: typeof CheckCircle }> = {
  active:    { text: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
  suspended: { text: 'text-red-700',    bg: 'bg-red-100',     icon: XCircle },
  trialing:  { text: 'text-blue-700',   bg: 'bg-blue-100',    icon: Clock },
}

const overageStatusColors: Record<string, string> = {
  pending:  'text-yellow-600 bg-yellow-100',
  invoiced: 'text-blue-600 bg-blue-100',
  paid:     'text-emerald-600 bg-emerald-100',
  waived:   'text-gray-500 bg-gray-100',
}

const resourceLabels: Record<string, string> = {
  api_calls:  'API Calls',
  storage:    'Storage',
  bandwidth:  'Bandwidth',
  properties: 'Properties',
  rooms:      'Rooms',
  users:      'Users',
}

const resourceIcons: Record<string, typeof Activity> = {
  api_calls:  Activity,
  storage:    HardDrive,
  bandwidth:  Wifi,
  properties: FileText,
  rooms:      FileText,
  users:      Users,
}

// ═══════════════════════════════════════════════════════════════
// Stat Card
// ═══════════════════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, sub, color = '#2E86AB', trend }: {
  icon: typeof BarChart3; label: string; value: string; sub?: string; color?: string; trend?: { value: string; up: boolean }
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>{value}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-[11px] font-medium ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {trend.value}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Usage Trend Chart (SVG)
// ═══════════════════════════════════════════════════════════════

function UsageChart({ data, metric, color = '#2E86AB', label }: {
  data: UsageMonthlyBreakdown[]; metric: 'apiCalls' | 'storageGB' | 'bandwidthGB' | 'totalOverageCharges'; color?: string; label: string
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: 220 }}>
        <span className="text-[11px] text-gray-400">No usage data</span>
      </div>
    )
  }
  const values = data.map(d => d[metric])
  const maxVal = Math.max(...values)
  const minVal = Math.min(...values)
  const range = maxVal - minVal || 1
  const w = 700, h = 200, pad = { t: 20, r: 16, b: 34, l: 50 }
  const chartW = w - pad.l - pad.r
  const chartH = h - pad.t - pad.b

  const points = values.map((v, i) => ({
    x: pad.l + (i / (values.length - 1)) * chartW,
    y: pad.t + (1 - (v - minVal) / range) * chartH,
  }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${h - pad.b} L ${points[0].x} ${h - pad.b} Z`

  const formatVal = (v: number) => metric === 'totalOverageCharges' ? `$${(v / 1000).toFixed(1)}K` : formatNumber(v)

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 220 }}>
      <defs>
        <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = pad.t + f * chartH
        const val = maxVal - f * range
        return (
          <g key={f}>
            <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="#f0f0f0" strokeDasharray="4 4" />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" className="fill-gray-400" fontSize={10}>
              {formatVal(val)}
            </text>
          </g>
        )
      })}
      <path d={areaPath} fill={`url(#grad-${metric})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="white" strokeWidth={2} />
          <text x={p.x} y={p.y - 12} textAnchor="middle" className="fill-gray-500" fontSize={9} fontWeight={600}>
            {formatVal(values[i])}
          </text>
        </g>
      ))}
      {data.map((d, i) => (
        <text key={i} x={points[i]?.x || 0} y={h - 6} textAnchor="middle" className="fill-gray-400" fontSize={9}>
          {d.month.split(' ')[0]}
        </text>
      ))}
      <text x={w / 2} y={14} textAnchor="middle" className="fill-gray-500" fontSize={10} fontWeight={600}>
        {label}
      </text>
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// Top Consumers Table
// ═══════════════════════════════════════════════════════════════

function TopConsumersTable({ tenants }: { tenants: TenantUsage[] }) {
  const [sortField, setSortField] = useState<'apiCalls' | 'storageGB' | 'bandwidthGB'>('apiCalls')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 6

  const sorted = [...tenants]
    .filter(t => t.tenantName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortDir === 'desc' ? b[sortField] - a[sortField] : a[sortField] - b[sortField])

  const totalPages = Math.ceil(sorted.length / perPage)
  const pageData = sorted.slice((page - 1) * perPage, page * perPage)

  const getUsagePercent = (used: number, limit: number) => limit <= 0 ? 0 : (used / limit) * 100

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortField(field); setSortDir('desc') }
    setPage(1)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Top Consumers</h3>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search tenants..."
            className="pl-8 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-blue-300 w-48" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Tenant / Plan</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium cursor-pointer hover:text-gray-600"
                onClick={() => toggleSort('apiCalls')}>
                API Calls {sortField === 'apiCalls' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium cursor-pointer hover:text-gray-600"
                onClick={() => toggleSort('storageGB')}>
                Storage {sortField === 'storageGB' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium cursor-pointer hover:text-gray-600"
                onClick={() => toggleSort('bandwidthGB')}>
                Bandwidth {sortField === 'bandwidthGB' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Usage %</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Status</th>
              <th className="text-right py-2.5 px-3 text-gray-400 font-medium">Overage</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400 text-[13px]">No tenants match your search.</td>
              </tr>
            ) : (
              pageData.map(t => {
                const sc = usageStatusColors[t.status] || usageStatusColors.active
                const StatusIcon = sc.icon
                const usagePct = sortField === 'apiCalls' ? getUsagePercent(t.apiCalls, t.apiCallsLimit)
                  : sortField === 'storageGB' ? getUsagePercent(t.storageGB, t.storageLimit)
                  : getUsagePercent(t.bandwidthGB, t.bandwidthLimit)
                return (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="text-[12px] font-medium text-gray-800">{t.tenantName}</div>
                      <div className="text-[9px] text-gray-400">{t.planName}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-gray-700">{formatNumber(t.apiCalls)}</div>
                      <div className="text-[9px] text-gray-400">Limit: {formatNumber(t.apiCallsLimit)}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-gray-700">{t.storageGB} GB</div>
                      <div className="text-[9px] text-gray-400">Limit: {t.storageLimit} GB</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-gray-700">{t.bandwidthGB} GB</div>
                      <div className="text-[9px] text-gray-400">Limit: {t.bandwidthLimit} GB</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
                          <div className={`h-full rounded-full transition-all ${usagePct >= 90 ? 'bg-red-500' : usagePct >= 75 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(usagePct, 100)}%` }} />
                        </div>
                        <span className={`text-[10px] font-medium ${usagePct >= 90 ? 'text-red-500' : usagePct >= 75 ? 'text-yellow-600' : 'text-gray-500'}`}>
                          {usagePct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <StatusIcon size={10} className={sc.text} />
                        <span className={`text-[10px] font-medium capitalize ${sc.text}`}>
                          {t.status === 'trialing' ? 'Trial' : t.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {t.overageCharges > 0 ? (
                        <span className="text-[11px] font-semibold text-red-500">{formatCurrency(t.overageCharges)}</span>
                      ) : (
                        <span className="text-[10px] text-gray-400">$0</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-[11px] text-gray-400">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, sorted.length)} of {sorted.length}
          </span>
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
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Overage Charges Section
// ═══════════════════════════════════════════════════════════════

function OverageSection({ charges }: { charges: OverageCharge[] }) {
  const { showToast } = useToast()
  const billAction = useAction({ duration: 1200 })
  const totalPending = charges.filter(c => c.status === 'pending').reduce((s, c) => s + c.totalCharge, 0)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Overage Charges</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {formatCurrency(totalPending)} pending collection
          </p>
        </div>
        <AdvancedButton
          variant="primary" size="sm"
          icon={<DollarSign size={12} />}
          loading={billAction.loading}
          success={billAction.success}
          onClick={async () => {
            await billAction.execute(async () => {
              await new Promise(r => setTimeout(r, 1200))
              showToast('success', 'All pending overages billed')
            })
          }}
        >
          Bill All Pending
        </AdvancedButton>
      </div>
      <div className="divide-y divide-gray-50">
        {charges.map(c => {
          const Icon = resourceIcons[c.resource] || Activity
          const color = c.status === 'pending' ? '#F59E0B' : c.status === 'invoiced' ? '#3B82F6' : c.status === 'paid' ? '#10B981' : '#6B7280'
          return (
            <div key={c.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}12` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] font-medium text-gray-800">{c.tenantName}</span>
                      <span className="text-[10px] text-gray-400">{resourceLabels[c.resource]}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[400px]">{c.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${overageStatusColors[c.status]}`}>
                        {c.status}
                      </span>
                      <span className="text-[9px] text-gray-400">{c.issuedAt}</span>
                      <span className="text-[9px] text-gray-300">{c.billingPeriod}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-gray-900 text-[13px]">{formatCurrency(c.totalCharge)}</div>
                  <div className="text-[9px] text-gray-400">{c.overageAmount} {c.unit}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Resource Breakdown Card
// ═══════════════════════════════════════════════════════════════

function ResourceBreakdown() {
  const totalTenants = tenantUsageData.length
  const tenantsWithOverages = tenantUsageData.filter(t => t.overageCharges > 0).length
  const totalApiCalls = tenantUsageData.reduce((s, t) => s + t.apiCalls, 0)
  const totalStorage = tenantUsageData.reduce((s, t) => s + t.storageGB, 0)
  const totalBandwidth = tenantUsageData.reduce((s, t) => s + t.bandwidthGB, 0)
  const avgOverage = tenantUsageData.reduce((s, t) => s + t.overageCharges, 0) / totalTenants

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Resource Pool</h3>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] text-gray-600">API Calls</span>
            <span className="text-[11px] font-medium text-gray-800">{formatNumber(totalApiCalls)}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-violet-500" style={{ width: '72%' }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] text-gray-600">Storage</span>
            <span className="text-[11px] font-medium text-gray-800">{totalStorage.toFixed(0)} GB</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-blue-500" style={{ width: '58%' }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] text-gray-600">Bandwidth</span>
            <span className="text-[11px] font-medium text-gray-800">{totalBandwidth.toFixed(0)} GB</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: '65%' }} />
          </div>
        </div>
        <div className="pt-2 border-t border-gray-50">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-gray-500">Tenants with overages</span>
            <span className="font-medium text-gray-800">{tenantsWithOverages} / {totalTenants}</span>
          </div>
          <div className="flex items-center justify-between text-[12px] mt-1">
            <span className="text-gray-500">Avg. overage per tenant</span>
            <span className="font-medium text-gray-800">{formatCurrency(avgOverage)}</span>
          </div>
          <div className="flex items-center justify-between text-[12px] mt-1">
            <span className="text-gray-500">Total pending overages</span>
            <span className="font-medium text-red-500">
              {formatCurrency(overageCharges.filter(c => c.status === 'pending').reduce((s, c) => s + c.totalCharge, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function UsageBillingPage() {
  const { showToast } = useToast()
  const exportAction = useAction({ duration: 800 })
  const [activeTab, setActiveTab] = useState<'consumers' | 'overages'>('consumers')
  const [chartMetric, setChartMetric] = useState<'apiCalls' | 'storageGB' | 'bandwidthGB' | 'totalOverageCharges'>('apiCalls')

  const totalApiCalls = tenantUsageData.reduce((s, t) => s + t.apiCalls, 0)
  const totalStorage = tenantUsageData.reduce((s, t) => s + t.storageGB, 0)
  const totalBandwidth = tenantUsageData.reduce((s, t) => s + t.bandwidthGB, 0)
  const totalOverageCharges = overageCharges.filter(c => c.status === 'pending' || c.status === 'invoiced')
    .reduce((s, c) => s + c.totalCharge, 0)
  const tenantsOverLimit = tenantUsageData.filter(t => {
    const apiPct = t.apiCallsLimit > 0 ? (t.apiCalls / t.apiCallsLimit) * 100 : 0
    const stoPct = t.storageLimit > 0 ? (t.storageGB / t.storageLimit) * 100 : 0
    const banPct = t.bandwidthLimit > 0 ? (t.bandwidthGB / t.bandwidthLimit) * 100 : 0
    return apiPct >= 90 || stoPct >= 90 || banPct >= 90
  }).length

  const chartLabel = chartMetric === 'apiCalls' ? 'API Calls Trend'
    : chartMetric === 'storageGB' ? 'Storage Usage Trend'
    : chartMetric === 'bandwidthGB' ? 'Bandwidth Trend'
    : 'Overage Charges Trend'

  const chartColor = chartMetric === 'apiCalls' ? '#8B5CF6'
    : chartMetric === 'storageGB' ? '#3B82F6'
    : chartMetric === 'bandwidthGB' ? '#10B981'
    : '#EF4444'

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
            Usage & Billing
          </h2>
          <p className="text-[12px] text-gray-400 mt-0.5">Monitor resource consumption, track overage charges, and manage tenant quotas</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 outline-none">
            <option>Current Month</option>
            <option>Last Month</option>
            <option>Last Quarter</option>
            <option>Year to Date</option>
          </select>
          <AdvancedButton
            variant="outline" size="md"
            icon={<Download size={13} />}
            loading={exportAction.loading}
            success={exportAction.success}
            onClick={async () => {
              await exportAction.execute(async () => {
                await new Promise(r => setTimeout(r, 800))
                showToast('success', 'Usage report exported')
              })
            }}
            tooltip="Export usage report"
          >
            Export
          </AdvancedButton>
        </div>
      </div>

      {/* ── Key Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="Total API Calls" value={formatNumber(totalApiCalls)}
          sub="Across all tenants" color="#8B5CF6" trend={{ value: '↑ 8.2% from last month', up: true }} />
        <StatCard icon={HardDrive} label="Storage Used" value={`${totalStorage.toFixed(0)} GB`}
          sub="Platform-wide consumption" color="#3B82F6" trend={{ value: '↑ 5.1% from last month', up: true }} />
        <StatCard icon={Wifi} label="Bandwidth" value={`${totalBandwidth.toFixed(0)} GB`}
          sub="Total data transfer" color="#10B981" trend={{ value: '↑ 6.3% from last month', up: true }} />
        <StatCard icon={AlertTriangle} label="Near Limit" value={`${tenantsOverLimit} tenants`}
          sub="At or above 90% usage" color="#EF4444" trend={{ value: tenantsOverLimit > 3 ? '↑ 2 new this month' : 'Same as last month', up: tenantsOverLimit > 3 }} />
      </div>

      {/* ── Usage Chart ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">{chartLabel}</h3>
          <div className="flex items-center gap-1">
            {(['apiCalls', 'storageGB', 'bandwidthGB', 'totalOverageCharges'] as const).map(m => (
              <button key={m} onClick={() => setChartMetric(m)}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                  chartMetric === m ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}>
                {m === 'apiCalls' ? 'API' : m === 'storageGB' ? 'Storage' : m === 'bandwidthGB' ? 'Bandwidth' : 'Overage $'}
              </button>
            ))}
          </div>
        </div>
        <UsageChart data={usageMonthlyBreakdown} metric={chartMetric} color={chartColor} label={chartLabel} />
      </div>

      {/* ── Two-column layout ──────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
        {/* Main */}
        <div className="xl:col-span-3 space-y-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
            <button onClick={() => setActiveTab('consumers')}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                activeTab === 'consumers' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}>
              <Users size={13} className="inline mr-1.5" />
              Top Consumers ({tenantUsageData.length})
            </button>
            <button onClick={() => setActiveTab('overages')}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                activeTab === 'overages' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}>
              <DollarSign size={13} className="inline mr-1.5" />
              Overage Charges ({overageCharges.length})
            </button>
          </div>

          {activeTab === 'consumers' ? (
            <TopConsumersTable tenants={tenantUsageData} />
          ) : (
            <OverageSection charges={overageCharges} />
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          <ResourceBreakdown />

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => showToast('info', 'Rate limit adjustment form (mock)')}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
                <Percent size={14} className="text-[#8B5CF6]" />
                Adjust Rate Limits
              </button>
              <button onClick={() => showToast('info', 'Review storage quotas (mock)')}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
                <HardDrive size={14} className="text-[#3B82F6]" />
                Review Storage Quotas
              </button>
              <button onClick={() => showToast('info', 'Configure overage rates (mock)')}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
                <DollarSign size={14} className="text-[#F59E0B]" />
                Configure Overage Rates
              </button>
              <button onClick={() => showToast('success', 'Usage report downloaded (mock)')}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
                <Download size={14} className="text-[#10B981]" />
                Download Usage Report
              </button>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Billing Summary</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-500">Base subscription revenue</span>
                <span className="font-semibold text-gray-800">$24,580.00</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-500">Overage charges this month</span>
                <span className="font-semibold text-orange-500">
                  {formatCurrency(usageMonthlyBreakdown[usageMonthlyBreakdown.length - 1]?.totalOverageCharges || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-500">Pending collection</span>
                <span className="font-semibold text-red-500">{formatCurrency(totalOverageCharges)}</span>
              </div>
              <div className="border-t border-gray-100 my-1" />
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-gray-900">Total Billable</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(24580 + (usageMonthlyBreakdown[usageMonthlyBreakdown.length - 1]?.totalOverageCharges || 0))}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <CheckCircle size={10} className="text-emerald-500" />
                <span>Billing cycle: Jun 1 – Jun 30, 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  )
}
