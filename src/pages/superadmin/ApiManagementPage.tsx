import { useState } from 'react'
import {
  Key, Globe, RefreshCw, Plus, Search,
  CheckCircle, Clock, AlertTriangle,
  Copy, ExternalLink, Activity, Ban,
} from 'lucide-react'
import { useToast } from '../../components/superadmin/Toast'
import AdvancedButton from '../../components/superadmin/AdvancedButton'
import { useAction } from '../../components/superadmin/useAction'
import { PageTransition } from '../../components/superadmin/Animations'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import type { ApiKeyEntry, WebhookEndpoint, RateLimitPolicy, ApiUsageMetric } from '../../types/superadmin'

import { mockApiKeys, mockRateLimitPolicies, mockWebhookEndpoints, mockApiUsageData } from '../../data/superAdminMockData'
const apiKeys: ApiKeyEntry[] = mockApiKeys
const rateLimitPolicies: RateLimitPolicy[] = mockRateLimitPolicies
const webhookEndpoints: WebhookEndpoint[] = mockWebhookEndpoints
const apiUsageData: ApiUsageMetric[] = mockApiUsageData

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

const keyStatusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  revoked: 'bg-red-100 text-red-600',
  expired: 'bg-gray-100 text-gray-500',
}

const webhookStatusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  disabled: 'bg-gray-100 text-gray-500',
  failing: 'bg-red-100 text-red-600',
}

// ═══════════════════════════════════════════════════════════════
// API Usage Chart (SVG)
// ═══════════════════════════════════════════════════════════════

function UsageChart() {
  if (apiUsageData.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: 140 }}>
        <span className="text-[11px] text-gray-400">No API usage data</span>
      </div>
    )
  }
  const max = Math.max(...apiUsageData.map(d => d.requests))
  const w = 600, h = 150, pad = { t: 16, r: 12, b: 28, l: 52 }
  const chartW = w - pad.l - pad.r
  const chartH = h - pad.t - pad.b

  const points = apiUsageData.map((d, i) => ({
    x: pad.l + (i / (apiUsageData.length - 1)) * chartW,
    y: pad.t + (1 - d.requests / max) * chartH,
    ...d,
  }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${h - pad.b} L ${points[0].x} ${h - pad.b} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 140 }}>
      <defs>
        <linearGradient id="apiGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = pad.t + f * chartH
        const val = max - f * max
        return (
          <g key={f}>
            <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="#E5E7EB" strokeDasharray="4 4" />
            <text x={pad.l - 6} y={y + 3} textAnchor="end" className="fill-gray-400" fontSize={9}>{formatNumber(val)}</text>
          </g>
        )
      })}
      <path d={areaPath} fill="url(#apiGrad)" />
      <path d={linePath} fill="none" stroke="#8B5CF6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5} fill="#8B5CF6" stroke="white" strokeWidth={2} />
          <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-gray-500" fontSize={8} fontWeight={600}>{formatNumber(p.requests)}</text>
          <text x={p.x} y={h - 6} textAnchor="middle" className="fill-gray-400" fontSize={8}>{p.date}</text>
        </g>
      ))}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function ApiManagementPage() {
  const { showToast } = useToast()
  const storeApiKeys = useSuperAdminStore(s => s.apiKeys)
  const addApiKey = useSuperAdminStore(s => s.addApiKey)
  const revokeApiKey = useSuperAdminStore(s => s.revokeApiKey)
  const rotateApiKey = useSuperAdminStore(s => s.rotateApiKey)
  const syncAction = useAction({ duration: 1000 })
  const [activeTab, setActiveTab] = useState<'keys' | 'rate' | 'webhooks'>('keys')
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const totalRequests = apiUsageData.reduce((s, d) => s + d.requests, 0)
  const totalErrors = apiUsageData.reduce((s, d) => s + d.errors, 0)
  const avgLatency = Math.round(apiUsageData.reduce((s, d) => s + d.avgLatency, 0) / apiUsageData.length)
  const errorRate = ((totalErrors / totalRequests) * 100).toFixed(2)

  const filteredKeys = apiKeys.filter(k =>
    k.name.toLowerCase().includes(search.toLowerCase()) || k.key.toLowerCase().includes(search.toLowerCase())
  )

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key.replace(/•/g, 'X'))
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const totalActiveKeys = apiKeys.filter(k => k.status === 'active').length
  const totalWebhooks = webhookEndpoints.length
  const failingWebhooks = webhookEndpoints.filter(w => w.status === 'failing').length

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div className="flex items-center gap-2 sm:ml-auto">
          <AdvancedButton
            variant="outline" size="md"
            icon={<RefreshCw size={13} />}
            loading={syncAction.loading}
            success={syncAction.success}
            error={syncAction.error}
            onClick={async () => {
              await syncAction.execute(async () => {
                await new Promise(r => setTimeout(r, 1000))
                showToast('success', 'API keys synced with usage service')
              })
            }}
            tooltip="Sync API keys with usage service"
          >
            Sync
          </AdvancedButton>
          <AdvancedButton
            variant="primary" size="md"
            icon={<Plus size={13} />}
            onClick={async () => {
              addApiKey({
                name: `Key ${storeApiKeys.length + 1}`,
                key: `sk_live_${Date.now().toString(36)}`,
                status: 'active',
                permissions: ['read', 'write'],
                rateLimit: 500,
                usageThisMonth: 0,
                lastUsed: 'Just now',
                createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                expiresAt: 'Dec 31, 2026',
              })
              showToast('success', 'New API key created')
            }}
            tooltip="Create a new API key"
          >
            New API Key
          </AdvancedButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={13} className="text-[#8B5CF6]" />
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Requests (7d)</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{formatNumber(totalRequests)}</div>
          <div className="text-[9px] text-gray-400 mt-0.5">{formatNumber(Math.round(totalRequests / 7))}/day avg</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={13} className="text-[#F59E0B]" />
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Error Rate</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{errorRate}%</div>
          <div className="text-[9px] text-gray-400 mt-0.5">{totalErrors} total errors</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={13} className="text-[#2E86AB]" />
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Avg Latency</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{avgLatency}ms</div>
          <div className="text-[9px] text-gray-400 mt-0.5">Across all endpoints</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Key size={13} className="text-emerald-500" />
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Active Keys</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{totalActiveKeys}</div>
          <div className="text-[9px] text-gray-400 mt-0.5">{failingWebhooks > 0 ? `${failingWebhooks} webhooks failing` : `${totalWebhooks} webhooks`}</div>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-white rounded-lg border border-gray-100 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-900">API Requests — Last 7 Days</h3>
          <select className="text-[10px] border border-gray-200 rounded-lg px-1.5 py-1 text-gray-500 outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        <UsageChart />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
        <button onClick={() => setActiveTab('keys')}
          className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${activeTab === 'keys' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
          <Key size={12} className="inline mr-1.5" />API Keys ({filteredKeys.length})
        </button>
        <button onClick={() => setActiveTab('rate')}
          className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${activeTab === 'rate' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
          <Activity size={12} className="inline mr-1.5" />Rate Limits
        </button>
        <button onClick={() => setActiveTab('webhooks')}
          className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${activeTab === 'webhooks' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
          <Globe size={12} className="inline mr-1.5" />Webhooks ({totalWebhooks})
        </button>
      </div>

      {/* API Keys Tab */}
      {activeTab === 'keys' && (
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-900">API Keys</h3>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search keys..."
                className="pl-7 pr-2 py-1 text-[10px] border border-gray-200 rounded-lg outline-none focus:border-purple-300 w-40" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Key</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Permissions</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Rate Limit</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Usage/Month</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Last Used</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeys.map(key => (
                  <tr key={key.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="text-[11px] font-medium text-gray-800">{key.name}</div>
                      {key.tenantName && <div className="text-[9px] text-gray-400">{key.tenantName}</div>}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        <code className="text-[10px] font-mono text-gray-500">{key.key.slice(0, 12)}••••••••</code>
                        <button onClick={() => copyKey(key.id, key.key)}
                          className="p-0.5 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors">
                          {copiedId === key.id ? <CheckCircle size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${keyStatusColors[key.status]}`}>{key.status}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-0.5">
                        {key.permissions.map(p => (
                          <span key={p} className="text-[8px] px-1 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[10px] text-gray-600">{key.rateLimit}/min</td>
                    <td className="py-2.5 px-3 text-[10px] text-gray-600">{formatNumber(key.usageThisMonth)}</td>
                    <td className="py-2.5 px-3 text-[10px] text-gray-400">{key.lastUsed}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button onClick={() => { rotateApiKey(key.id); showToast('success', `Key rotated: ${key.name}`) }}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Rotate key"><RefreshCw size={12} /></button>
                      <button onClick={() => { revokeApiKey(key.id); showToast('error', `Key revoked: ${key.name}`) }}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600" title="Revoke key"><Ban size={12} /></button>
                      <button onClick={() => showToast('info', `View details for ${key.name}`)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="View details"><ExternalLink size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rate Limits Tab */}
      {activeTab === 'rate' && (
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <h3 className="text-xs font-semibold text-gray-900 mb-3">Rate Limit Policies</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {rateLimitPolicies.map(policy => {
              const colors: Record<string, string> = { free: '#6B7280', basic: '#3B82F6', pro: '#8B5CF6', enterprise: '#F59E0B' }
              return (
                <div key={policy.id} className="border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: colors[policy.tier] }} />
                    <span className="text-[12px] font-semibold text-gray-800 capitalize">{policy.name}</span>
                  </div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex justify-between"><span className="text-gray-400">Per Minute</span><span className="font-medium text-gray-700">{policy.requestsPerMinute}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Per Hour</span><span className="font-medium text-gray-700">{policy.requestsPerHour.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Per Day</span><span className="font-medium text-gray-700">{policy.requestsPerDay.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Concurrent</span><span className="font-medium text-gray-700">{policy.concurrentLimit}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Burst</span><span className="font-medium text-gray-700">{policy.burstLimit}</span></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <h3 className="text-xs font-semibold text-gray-900 mb-3">Webhook Endpoints</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">URL</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Events</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Success Rate</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Calls</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Last Trigger</th>
                </tr>
              </thead>
              <tbody>
                {webhookEndpoints.map(wh => {
                  const totalCalls = wh.successCount + wh.failureCount
                  const successRate = totalCalls > 0 ? Math.round((wh.successCount / totalCalls) * 1000) / 10 : 100
                  return (
                  <tr key={wh.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-3 text-[11px] font-medium text-gray-800">{wh.name}</td>
                    <td className="py-2.5 px-3">
                      <code className="text-[9px] font-mono text-gray-500 truncate max-w-[160px] inline-block align-middle">{wh.url}</code>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-0.5 max-w-[140px]">
                        {wh.events.map(e => (
                          <span key={e} className="text-[8px] px-1 py-0.5 rounded bg-gray-100 text-gray-500">{e}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${webhookStatusColors[wh.status]}`}>{wh.status}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${successRate >= 99 ? 'bg-emerald-500' : successRate >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${successRate}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-600">{successRate}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[10px] text-gray-600">{formatNumber(totalCalls)}</td>
                    <td className="py-2.5 px-3 text-[10px] text-gray-400">{wh.lastTriggeredAt}</td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  )
}
