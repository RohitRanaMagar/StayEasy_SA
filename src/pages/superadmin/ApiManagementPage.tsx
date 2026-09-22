import { useState } from 'react'
import {
  Search, Plus, RefreshCw, Key, Webhook,
  Activity, AlertTriangle, Clock, Copy,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useToast } from '../../components/superadmin/Toast'
import AdvancedButton from '../../components/superadmin/AdvancedButton'
import { useAction } from '../../components/superadmin/useAction'
import { PageTransition } from '../../components/superadmin/Animations'
import { formatNumber } from '../../lib/format'
import type { ApiKeyEntry, RateLimitPolicy, ApiUsageMetric, WebhookEndpoint } from '../../types/superadmin'

const apiKeys: ApiKeyEntry[] = []
const rateLimitPolicies: RateLimitPolicy[] = []
const apiUsageData: ApiUsageMetric[] = []
const webhookEndpoints: WebhookEndpoint[] = []

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  revoked: 'bg-red-100 text-red-600',
  expired: 'bg-gray-100 text-gray-500',
  failing: 'bg-red-100 text-red-600',
  disabled: 'bg-gray-100 text-gray-500',
}

const permColors: Record<string, string> = {
  read: 'bg-blue-50 text-blue-600',
  write: 'bg-purple-50 text-purple-600',
  webhooks: 'bg-amber-50 text-amber-600',
  delete: 'bg-red-50 text-red-500',
  admin: 'bg-amber-50 text-amber-600',
}

function maskKey(key: string): string {
  if (key.length <= 12) return key
  return key.slice(0, 12) + '••••••••'
}

// ═══════════════════════════════════════════════════════════════
// Stat Card
// ═══════════════════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, sub, color = '#2E86AB' }: {
  icon: typeof Activity; label: string; value: string; sub?: string; color?: string
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>{value}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Usage Trend Chart (SVG)
// ═══════════════════════════════════════════════════════════════

function UsageChart({ data }: { data: ApiUsageMetric[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: 250 }}>
        <span className="text-[11px] text-gray-400">No usage data</span>
      </div>
    )
  }
  const values = data.map(d => d.requests)
  const maxVal = Math.max(...values)
  const minVal = Math.min(...values)
  const range = maxVal - minVal || 1
  const w = 700, h = 230, pad = { t: 20, r: 16, b: 34, l: 50 }
  const chartW = w - pad.l - pad.r
  const chartH = h - pad.t - pad.b

  const points = values.map((v, i) => ({
    x: pad.l + (i / (values.length - 1)) * chartW,
    y: pad.t + (1 - (v - minVal) / range) * chartH,
  }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${h - pad.b} L ${points[0].x} ${h - pad.b} Z`

  const formatVal = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 250 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad-api" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
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
      <path d={areaPath} fill="url(#grad-api)" />
      <path d={linePath} fill="none" stroke="#8B5CF6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#8B5CF6" stroke="white" strokeWidth={2} />
        </g>
      ))}
      {data.map((d, i) => (
        <text key={i} x={points[i]?.x || 0} y={h - 6} textAnchor="middle" className="fill-gray-400" fontSize={9}>
          {d.date}
        </text>
      ))}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// API Keys Tab
// ═══════════════════════════════════════════════════════════════

function ApiKeysTab({ keys }: { keys: ApiKeyEntry[] }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 6

  const filtered = keys.filter(k =>
    k.name.toLowerCase().includes(search.toLowerCase()) ||
    k.tenantName?.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / perPage)
  const pageData = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">API Keys</h3>
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search keys..."
            className="pl-9 pr-10 py-2.5 text-[13px] bg-white border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2E86AB]/20 focus:border-[#2E86AB] shadow-md w-48" />
          <button className="absolute right-2 p-1.5 bg-[#2E86AB] text-white rounded-lg hover:bg-[#1a6b8a] transition-colors">
            <Search size={14} />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Name</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Key</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Status</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Permissions</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Rate Limit</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Usage/Month</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Last Used</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400 text-[13px]">No keys match your search.</td>
              </tr>
            ) : (
              pageData.map(k => (
                <tr key={k.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="text-[12px] font-medium text-gray-800">{k.name}</div>
                    <div className="text-[9px] text-gray-400">{k.tenantName}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-gray-600">{maskKey(k.key)}</span>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <Copy size={12} className="text-gray-400" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[k.status]}`}>
                      {k.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {k.permissions.map(p => (
                        <span key={p} className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${permColors[p] || 'bg-gray-50 text-gray-600'}`}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[12px] text-gray-700">{k.rateLimit}/min</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[12px] text-gray-700">{formatNumber(k.usageThisMonth)}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] text-gray-500">{k.lastUsed}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-[11px] text-gray-400">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
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
// Rate Limits Tab
// ═══════════════════════════════════════════════════════════════

function RateLimitsTab({ policies }: { policies: RateLimitPolicy[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Rate Limit Policies</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Tier</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Requests/Min</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Requests/Hour</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Requests/Day</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Concurrent</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Burst</th>
            </tr>
          </thead>
          <tbody>
            {policies.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-3">
                  <span className="text-[12px] font-medium text-gray-800">{p.name}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[12px] text-gray-700">{formatNumber(p.requestsPerMinute)}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[12px] text-gray-700">{formatNumber(p.requestsPerHour)}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[12px] text-gray-700">{formatNumber(p.requestsPerDay)}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[12px] text-gray-700">{p.concurrentLimit}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[12px] text-gray-700">{formatNumber(p.burstLimit)}</span>
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
// Webhooks Tab
// ═══════════════════════════════════════════════════════════════

function WebhooksTab({ endpoints }: { endpoints: WebhookEndpoint[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Webhook Endpoints</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Name</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">URL</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Status</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Events</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Success</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Failures</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Last Triggered</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map(wh => (
              <tr key={wh.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-3">
                  <div className="text-[12px] font-medium text-gray-800">{wh.name}</div>
                  <div className="text-[9px] text-gray-400">{wh.tenantName}</div>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[11px] font-mono text-gray-600 truncate max-w-[200px] block">{wh.url}</span>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[wh.status]}`}>
                    {wh.status}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1">
                    {wh.events.slice(0, 2).map(e => (
                      <span key={e} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-50 text-gray-600">
                        {e}
                      </span>
                    ))}
                    {wh.events.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-50 text-gray-600">
                        +{wh.events.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[12px] text-emerald-600">{formatNumber(wh.successCount)}</span>
                </td>
                <td className="py-3 px-3">
                  <span className={`text-[12px] ${wh.failureCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formatNumber(wh.failureCount)}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[11px] text-gray-500">{wh.lastTriggeredAt}</span>
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
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function ApiManagementPage() {
  const { showToast } = useToast()
  const syncAction = useAction({ duration: 800 })
  const [activeTab, setActiveTab] = useState<'keys' | 'limits' | 'webhooks'>('keys')

  const totalRequests = apiUsageData.reduce((s, d) => s + d.requests, 0)
  const totalErrors = apiUsageData.reduce((s, d) => s + d.errors, 0)
  const avgLatency = Math.round(apiUsageData.reduce((s, d) => s + d.avgLatency, 0) / apiUsageData.length)
  const activeKeys = apiKeys.filter(k => k.status === 'active').length
  const failingWebhooks = webhookEndpoints.filter(w => w.status === 'failing').length
  const errorRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : '0'
  const dailyAvg = Math.round(totalRequests / apiUsageData.length)

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>API Management</h1>
          <p className="text-[11px] text-gray-400">Manage API keys, rate limits, webhooks, and usage monitoring</p>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-[10px] text-gray-400">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          <AdvancedButton
            variant="outline" size="sm"
            icon={<RefreshCw size={13} />}
            loading={syncAction.loading}
            success={syncAction.success}
            onClick={async () => {
              await syncAction.execute(async () => {
                await new Promise(r => setTimeout(r, 800))
                showToast('success', 'API usage data synced')
              })
            }}
          >
            Sync
          </AdvancedButton>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-[#2E86AB] rounded-lg hover:bg-[#1a6b8a] transition-colors">
            <Plus size={13} />
            New API Key
          </button>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="Requests (7D)" value={formatNumber(totalRequests)}
          sub={`${formatNumber(dailyAvg)}/day avg`} color="#8B5CF6" />
        <StatCard icon={AlertTriangle} label="Error Rate" value={`${errorRate}%`}
          sub={`${formatNumber(totalErrors)} total errors`} color="#EF4444" />
        <StatCard icon={Clock} label="Avg Latency" value={`${avgLatency}ms`}
          sub="Across all endpoints" color="#10B981" />
        <StatCard icon={Key} label="Active Keys" value={`${activeKeys}`}
          sub={failingWebhooks > 0 ? `${failingWebhooks} webhooks failing` : 'All systems operational'} color="#3B82F6" />
      </div>

      {/* ── Usage Chart ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">API Requests — Last 7 Days</h3>
          <select className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>
        <UsageChart data={apiUsageData} />
      </div>

      {/* ── Tabs ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-fit mb-4">
          <button onClick={() => setActiveTab('keys')}
            className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${
              activeTab === 'keys' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}>
            <Key size={13} className="inline mr-1.5" />
            API Keys ({apiKeys.length})
          </button>
          <button onClick={() => setActiveTab('limits')}
            className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${
              activeTab === 'limits' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}>
            <Activity size={13} className="inline mr-1.5" />
            Rate Limits
          </button>
          <button onClick={() => setActiveTab('webhooks')}
            className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${
              activeTab === 'webhooks' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}>
            <Webhook size={13} className="inline mr-1.5" />
            Webhooks ({webhookEndpoints.length})
          </button>
        </div>

        {activeTab === 'keys' && <ApiKeysTab keys={apiKeys} />}
        {activeTab === 'limits' && <RateLimitsTab policies={rateLimitPolicies} />}
        {activeTab === 'webhooks' && <WebhooksTab endpoints={webhookEndpoints} />}
      </div>
    </div>
    </PageTransition>
  )
}
