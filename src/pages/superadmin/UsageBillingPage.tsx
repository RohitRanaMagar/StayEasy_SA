import { useState, useMemo } from 'react'
import {
  Download, ArrowUpRight, ArrowDownRight,
  Search, ChevronLeft, ChevronRight, AlertTriangle,
  Zap, Database, Globe, Users, Settings, FileText,
  ChevronDown, Activity,
} from 'lucide-react'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { PageTransition, FadeIn, StaggerList, StaggerItem } from '../../components/superadmin/Animations'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function getUsagePercent(used: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.min(Math.round((used / limit) * 100), 100)
}

function getUsageColor(pct: number): string {
  if (pct >= 90) return '#ef4444'
  if (pct >= 70) return '#f59e0b'
  return '#22c55e'
}

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
  change: string; changeType: 'up' | 'down' | 'neutral'; color: string; sparkData?: number[]
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
      <div className={`flex items-center gap-1 text-[11px] font-medium ${
        changeType === 'up' ? 'text-emerald-600' : changeType === 'down' ? 'text-red-500' : 'text-gray-400'
      }`}>
        {changeType === 'up' && <ArrowUpRight size={11} />}
        {changeType === 'down' && <ArrowDownRight size={11} />}
        <span className="truncate">{change}</span>
      </div>
    </div>
  )
}

type ChartTab = 'api' | 'storage' | 'bandwidth' | 'overage'

function UsageChart({ data, activeTab }: {
  data: { month: string; apiCalls: number; storageGB: number; bandwidthGB: number; totalOverageCharges: number }[]
  activeTab: ChartTab
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const chartData = useMemo(() => {
    return data.map(d => {
      switch (activeTab) {
        case 'api': return d.apiCalls
        case 'storage': return d.storageGB
        case 'bandwidth': return d.bandwidthGB
        case 'overage': return d.totalOverageCharges
      }
    })
  }, [data, activeTab])

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900">API Calls Trend</h3>
        <p className="text-sm text-gray-400 mt-4">No usage data available.</p>
      </div>
    )
  }

  const w = 700, h = 200, padL = 50, padR = 20, padT = 20, padB = 40
  const plotW = w - padL - padR
  const plotH = h - padT - padB
  const max = Math.max(...chartData) * 1.1
  const min = 0

  const points = chartData.map((v, i) => ({
    x: padL + (i / (chartData.length - 1)) * plotW,
    y: padT + plotH - ((v - min) / (max - min)) * plotH,
  }))

  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaD = lineD + ` L ${points[points.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`

  const yTicks = 5
  const yValues = Array.from({ length: yTicks + 1 }, (_, i) => min + ((max - min) / yTicks) * i)
  const gridLines = yValues.map((v) => {
    const y = padT + plotH - ((v - min) / (max - min)) * plotH
    return { y, label: activeTab === 'overage' ? `$${v.toFixed(0)}` : formatNumber(v) }
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">API Calls Trend</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(['api', 'storage', 'bandwidth', 'overage'] as ChartTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => {}}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'api' ? 'API' : tab === 'overage' ? 'Overage $' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ minWidth: 500 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E86AB" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#2E86AB" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          {gridLines.map((g, i) => (
            <g key={i}>
              <line x1={padL} y1={g.y} x2={w - padR} y2={g.y} stroke="#f0f0f0" strokeWidth={1} />
              <text x={padL - 8} y={g.y + 4} textAnchor="end" fill="#9ca3af" fontSize={10}>{g.label}</text>
            </g>
          ))}
          {data.map((d, i) => (
            <text key={i} x={points[i].x} y={h - 10} textAnchor="middle" fill="#9ca3af" fontSize={10}>
              {d.month.split(' ')[0]}
            </text>
          ))}
          <path d={areaD} fill="url(#areaGrad)" />
          <path d={lineD} fill="none" stroke="#2E86AB" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x} cy={p.y}
                r={hoveredIdx === i ? 5 : 3}
                fill={hoveredIdx === i ? '#2E86AB' : '#fff'}
                stroke="#2E86AB" strokeWidth={2}
                className="transition-all cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              {hoveredIdx === i && (
                <g>
                  <rect x={p.x - 35} y={p.y - 30} width={70} height={22} rx={4} fill="#1a2332" />
                  <text x={p.x} y={p.y - 15} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={600}>
                    {activeTab === 'overage' ? `$${chartData[i].toFixed(2)}` : formatNumber(chartData[i])}
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
export default function UsageBillingPage() {
  const { tenantUsageData, usageMonthlyBreakdown, overageCharges } = useSuperAdminStore()

  const [activeTab] = useState<ChartTab>('api')
  const [tableTab, setTableTab] = useState<'consumers' | 'overage'>('consumers')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'apiCalls' | 'storageGB' | 'bandwidthGB' | 'usagePct'>('apiCalls')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const perPage = 10

  const stats = useMemo(() => {
    const totalApi = tenantUsageData.reduce((s, t) => s + t.apiCalls, 0)
    const totalStorage = tenantUsageData.reduce((s, t) => s + t.storageGB, 0)
    const totalBandwidth = tenantUsageData.reduce((s, t) => s + t.bandwidthGB, 0)
    const nearLimit = tenantUsageData.filter(t => {
      const apiPct = t.apiCallsLimit > 0 ? t.apiCalls / t.apiCallsLimit : 0
      const storPct = t.storageLimit > 0 ? t.storageGB / t.storageLimit : 0
      const bwPct = t.bandwidthLimit > 0 ? t.bandwidthGB / t.bandwidthLimit : 0
      return apiPct >= 0.9 || storPct >= 0.9 || bwPct >= 0.9
    }).length
    return { totalApi, totalStorage, totalBandwidth, nearLimit }
  }, [tenantUsageData])

  const filteredData = useMemo(() => {
    let data = [...tenantUsageData]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(t =>
        t.tenantName.toLowerCase().includes(q) ||
        t.planName.toLowerCase().includes(q)
      )
    }
    data.sort((a, b) => {
      let aVal: number, bVal: number
      switch (sortField) {
        case 'apiCalls': aVal = a.apiCalls; bVal = b.apiCalls; break
        case 'storageGB': aVal = a.storageGB; bVal = b.storageGB; break
        case 'bandwidthGB': aVal = a.bandwidthGB; bVal = b.bandwidthGB; break
        case 'usagePct':
          aVal = Math.max(
            a.apiCallsLimit > 0 ? a.apiCalls / a.apiCallsLimit : 0,
            a.storageLimit > 0 ? a.storageGB / a.storageLimit : 0,
            a.bandwidthLimit > 0 ? a.bandwidthGB / a.bandwidthLimit : 0
          )
          bVal = Math.max(
            b.apiCallsLimit > 0 ? b.apiCalls / b.apiCallsLimit : 0,
            b.storageLimit > 0 ? b.storageGB / b.storageLimit : 0,
            b.bandwidthLimit > 0 ? b.bandwidthGB / b.bandwidthLimit : 0
          )
          break
        default: aVal = 0; bVal = 0
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })
    return data
  }, [tenantUsageData, search, sortField, sortDir])

  const totalPages = Math.ceil(filteredData.length / perPage)
  const pagedData = filteredData.slice((page - 1) * perPage, page * perPage)

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const billingSummary = useMemo(() => {
    const baseRevenue = 24500
    const totalOverage = overageCharges.reduce((s, o) => s + o.totalCharge, 0)
    const pending = overageCharges.filter(o => o.status === 'pending').reduce((s, o) => s + o.totalCharge, 0)
    return { baseRevenue, totalOverage, pending, total: baseRevenue + totalOverage }
  }, [overageCharges])

  const resourcePool = useMemo(() => {
    const totalApiLimit = tenantUsageData.reduce((s, t) => s + (t.apiCallsLimit > 0 ? t.apiCallsLimit : 0), 0)
    const totalStorageLimit = tenantUsageData.reduce((s, t) => s + (t.storageLimit > 0 ? t.storageLimit : 0), 0)
    const totalBwLimit = tenantUsageData.reduce((s, t) => s + (t.bandwidthLimit > 0 ? t.bandwidthLimit : 0), 0)
    return {
      api: { used: stats.totalApi, limit: totalApiLimit },
      storage: { used: stats.totalStorage, limit: totalStorageLimit },
      bandwidth: { used: stats.totalBandwidth, limit: totalBwLimit },
    }
  }, [tenantUsageData, stats])

  return (
    <PageTransition>
      <div className="space-y-5">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">August 8, 2026 12:18 PM</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <span className="text-xs font-medium text-gray-700">Current Month</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
              <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
                <Download size={14} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Export</span>
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Stat Cards */}
        <StaggerList>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StaggerItem>
              <StatCard icon={Zap} label="Total API Calls" value={formatNumber(stats.totalApi)} change="8.2% vs last month" changeType="up" color="#2E86AB" sparkData={usageMonthlyBreakdown.map(d => d.apiCalls)} />
            </StaggerItem>
            <StaggerItem>
              <StatCard icon={Database} label="Storage Used" value={`${stats.totalStorage} GB`} change="5.7% vs last month" changeType="up" color="#8b5cf6" sparkData={usageMonthlyBreakdown.map(d => d.storageGB)} />
            </StaggerItem>
            <StaggerItem>
              <StatCard icon={Globe} label="Bandwidth" value={`${stats.totalBandwidth} GB`} change="8.2% vs last month" changeType="up" color="#06b6d4" sparkData={usageMonthlyBreakdown.map(d => d.bandwidthGB)} />
            </StaggerItem>
            <StaggerItem>
              <StatCard icon={AlertTriangle} label="Near Limit" value={`${stats.nearLimit} Tenant`} change="At or above 90% usage" changeType="neutral" color="#f59e0b" />
            </StaggerItem>
          </div>
        </StaggerList>

        {/* Trend Chart */}
        <FadeIn>
          <UsageChart data={usageMonthlyBreakdown} activeTab={activeTab} />
        </FadeIn>

        {/* Two Column: Table + Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Left: Tables */}
          <div className="xl:col-span-2 space-y-5">
            <FadeIn>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 px-5 pt-4 pb-0 border-b border-gray-100">
                  <button onClick={() => setTableTab('consumers')} className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${tableTab === 'consumers' ? 'border-[#2E86AB] text-[#2E86AB]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                    Top Consumers ({tenantUsageData.length})
                  </button>
                  <button onClick={() => setTableTab('overage')} className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${tableTab === 'overage' ? 'border-[#2E86AB] text-[#2E86AB]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                    <span className="flex items-center gap-1.5"><AlertTriangle size={12} /> Overage Charges ({overageCharges.length})</span>
                  </button>
                </div>

                {tableTab === 'consumers' ? (
                  <>
                    <div className="p-4 border-b border-gray-100">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search tenants..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2E86AB] focus:border-[#2E86AB]" />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tenant / Plan</th>
                            <th className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => handleSort('apiCalls')}><span className="flex items-center gap-1">API Calls {sortField === 'apiCalls' && (sortDir === 'asc' ? '\u2191' : '\u2193')}</span></th>
                            <th className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => handleSort('storageGB')}><span className="flex items-center gap-1">Storage {sortField === 'storageGB' && (sortDir === 'asc' ? '\u2191' : '\u2193')}</span></th>
                            <th className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => handleSort('bandwidthGB')}><span className="flex items-center gap-1">Bandwidth {sortField === 'bandwidthGB' && (sortDir === 'asc' ? '\u2191' : '\u2193')}</span></th>
                            <th className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => handleSort('usagePct')}><span className="flex items-center gap-1">Usage % {sortField === 'usagePct' && (sortDir === 'asc' ? '\u2191' : '\u2193')}</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedData.map(t => {
                            const maxUsage = Math.max(
                              t.apiCallsLimit > 0 ? (t.apiCalls / t.apiCallsLimit) * 100 : 0,
                              t.storageLimit > 0 ? (t.storageGB / t.storageLimit) * 100 : 0,
                              t.bandwidthLimit > 0 ? (t.bandwidthGB / t.bandwidthLimit) * 100 : 0
                            )
                            return (
                              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="text-xs font-medium text-gray-900">{t.tenantName}</div>
                                  <div className="text-[10px] text-gray-400">{t.planName}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-xs font-medium text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>{formatNumber(t.apiCalls)}</div>
                                  <div className="text-[10px] text-gray-400">Limit: {formatNumber(t.apiCallsLimit)}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-xs font-medium text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>{t.storageGB} GB</div>
                                  <div className="text-[10px] text-gray-400">Limit: {t.storageLimit} GB</div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-xs font-medium text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>{t.bandwidthGB} GB</div>
                                  <div className="text-[10px] text-gray-400">Limit: {t.bandwidthLimit} GB</div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full rounded-full" style={{ width: `${maxUsage}%`, backgroundColor: getUsageColor(maxUsage) }} />
                                    </div>
                                    <span className="text-[10px] font-medium" style={{ color: getUsageColor(maxUsage) }}>{Math.round(maxUsage)}%</span>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                      <span className="text-[11px] text-gray-400">Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filteredData.length)} of {filteredData.length}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={14} /></button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                          <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 flex items-center justify-center rounded-md text-[11px] font-medium transition-colors ${page === p ? 'bg-[#2E86AB] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={14} /></button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tenant</th>
                          <th className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Metric Over Limit</th>
                          <th className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Overage Amount</th>
                          <th className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Charge ($)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overageCharges.map(o => (
                          <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-4 text-xs font-medium text-gray-900">{o.tenantName}</td>
                            <td className="py-3 px-4 text-xs text-gray-600">{o.resource.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                            <td className="py-3 px-4 text-xs text-gray-600">{o.overageAmount} {o.unit}</td>
                            <td className="py-3 px-4 text-xs font-semibold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>${o.totalCharge.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Bottom Overage Charges */}
            <FadeIn>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Overage Charges (Current Month)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tenant</th>
                        <th className="text-left py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Metric Over Limit</th>
                        <th className="text-left py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Overage Amount</th>
                        <th className="text-left py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Charge ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overageCharges.slice(0, 5).map(o => (
                        <tr key={o.id} className="border-b border-gray-50 last:border-0">
                          <td className="py-2.5 text-xs font-medium text-gray-900">{o.tenantName}</td>
                          <td className="py-2.5 text-xs text-gray-600">{o.resource.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                          <td className="py-2.5 text-xs text-gray-600">{o.overageAmount} {o.unit}</td>
                          <td className="py-2.5 text-xs font-semibold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>${o.totalCharge.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-5">
            {/* Resource Pool */}
            <FadeIn>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Resource Pool</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500">API Calls</span>
                      <span className="font-medium text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>{formatNumber(resourcePool.api.used)}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2E86AB] rounded-full" style={{ width: `${getUsagePercent(resourcePool.api.used, resourcePool.api.limit)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500">Storage</span>
                      <span className="font-medium text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>{resourcePool.storage.used} GB</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8b5cf6] rounded-full" style={{ width: `${getUsagePercent(resourcePool.storage.used, resourcePool.storage.limit)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500">Bandwidth</span>
                      <span className="font-medium text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>{resourcePool.bandwidth.used} GB</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#06b6d4] rounded-full" style={{ width: `${getUsagePercent(resourcePool.bandwidth.used, resourcePool.bandwidth.limit)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Tenants with Overage */}
            <FadeIn>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tenants with Overage</h3>
                <div className="space-y-2">
                  {tenantUsageData.filter(t => t.overageCharges > 0).map(t => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                          <AlertTriangle size={14} className="text-red-500" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900">{t.tenantName}</div>
                          <div className="text-[10px] text-gray-400">{t.planName}</div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-red-500" style={{ fontFamily: "'Sora', sans-serif" }}>${t.overageCharges.toFixed(2)}</span>
                    </div>
                  ))}
                  {tenantUsageData.filter(t => t.overageCharges > 0).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-3">No tenants with overage</p>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Quick Actions */}
            <FadeIn>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Settings size={14} className="text-blue-600" /></div>
                    <span className="text-xs font-medium text-gray-700">Adjust Rate Limits</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><Database size={14} className="text-purple-600" /></div>
                    <span className="text-xs font-medium text-gray-700">Review Storage Quotas</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><Activity size={14} className="text-green-600" /></div>
                    <span className="text-xs font-medium text-gray-700">Configure Overage Billing</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center"><FileText size={14} className="text-orange-600" /></div>
                    <span className="text-xs font-medium text-gray-700">Download Usage Report</span>
                  </button>
                </div>
              </div>
            </FadeIn>

            {/* Billing Summary */}
            <FadeIn>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Billing Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Base subscription revenue</span>
                    <span className="text-xs font-semibold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>${billingSummary.baseRevenue.toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Overage charges this month</span>
                    <span className="text-xs font-semibold text-green-600" style={{ fontFamily: "'Sora', sans-serif" }}>${billingSummary.totalOverage.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Pending collection</span>
                    <span className="text-xs font-semibold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>${billingSummary.pending.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-900">Total Billable</span>
                      <span className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>${billingSummary.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center">Billing cycle: Jun 1 - Jun 30, 2026</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
