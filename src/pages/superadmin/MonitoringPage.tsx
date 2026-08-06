import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, AlertTriangle, Activity,
  Server, Wifi, ArrowUpRight, ArrowDownRight, AlertOctagon,
  Download, RefreshCw,
} from 'lucide-react'
import { useToast } from '../../components/superadmin/Toast'
import type { ActiveAlert, AlertRule, UptimeCheck, PerformancePoint, AlertHistoryItem, IncidentItem } from '../../types/superadmin'

import { mockActiveAlerts, mockAlertRules, mockUptimeChecks, mockPerformanceData, mockAlertHistory, mockIncidents } from '../../data/superAdminMockData'
const activeAlerts: ActiveAlert[] = mockActiveAlerts
const alertRules: AlertRule[] = mockAlertRules
const uptimeChecks: UptimeCheck[] = mockUptimeChecks
const performanceData: PerformancePoint[] = mockPerformanceData
const alertHistory: AlertHistoryItem[] = mockAlertHistory
const incidentData: IncidentItem[] = mockIncidents

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

const severityConfig: Record<string, { text: string; bg: string; icon: typeof AlertTriangle; hex: string }> = {
  critical:    { text: 'text-red-700',  bg: 'bg-red-100',    icon: AlertOctagon, hex: '#EF4444' },
  warning:     { text: 'text-yellow-700', bg: 'bg-yellow-100', icon: AlertTriangle, hex: '#F59E0B' },
  info:        { text: 'text-blue-700', bg: 'bg-blue-100',   icon: Activity,      hex: '#3B82F6' },
}

const alertStatusColors: Record<string, string> = {
  firing:        'bg-red-100 text-red-700',
  acknowledged:  'bg-yellow-100 text-yellow-700',
  resolved:      'bg-emerald-100 text-emerald-700',
}

const uptimeStatusColors: Record<string, { text: string; bg: string; dot: string }> = {
  up:   { text: 'text-emerald-700', bg: 'bg-emerald-100', dot: '#10B981' },
  down: { text: 'text-red-700',     bg: 'bg-red-100',     dot: '#EF4444' },
  slow: { text: 'text-yellow-700',  bg: 'bg-yellow-100',  dot: '#F59E0B' },
}

// ═══════════════════════════════════════════════════════════════
// Stat Card
// ═══════════════════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, sub, color = '#2E86AB', trend }: {
  icon: typeof Bell; label: string; value: string; sub?: string; color?: string; trend?: { value: string; up: boolean }
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
// Performance Chart (SVG)
// ═══════════════════════════════════════════════════════════════

function PerformanceChart({ data }: { data: typeof performanceData }) {
  const [metric, setMetric] = useState<'responseTimeMs' | 'errorRatePct' | 'throughput'>('responseTimeMs')

  if (data.length === 0) {
    return <div className="text-[11px] text-gray-400 py-8 text-center">No performance data</div>
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

  const color = metric === 'responseTimeMs' ? '#2E86AB' : metric === 'errorRatePct' ? '#EF4444' : '#10B981'
  const formatVal = (v: number) => metric === 'responseTimeMs' ? `${v}ms` : metric === 'errorRatePct' ? `${v}%` : `${v.toLocaleString()} req/s`

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {metric === 'responseTimeMs' ? 'Response Time (24h)' : metric === 'errorRatePct' ? 'Error Rate (24h)' : 'Throughput (24h)'}
        </h3>
        <div className="flex items-center gap-1">
          {(['responseTimeMs', 'errorRatePct', 'throughput'] as const).map(m => (
            <button key={m} onClick={() => setMetric(m)}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                metric === m ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}>
              {m === 'responseTimeMs' ? 'Latency' : m === 'errorRatePct' ? 'Errors' : 'Throughput'}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 200 }}>
        <defs>
          <linearGradient id={`perfGrad`} x1="0" y1="0" x2="0" y2="1">
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
        <path d={areaPath} fill={`url(#perfGrad)`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {points.filter((_, i) => i % 4 === 0 || i === points.length - 1).map((_, idx) => {
          const i = idx * 4 > points.length - 1 ? points.length - 1 : idx * 4
          return (
            <g key={idx}>
              <circle cx={points[i]!.x} cy={points[i]!.y} r={3.5} fill={color} stroke="white" strokeWidth={2} />
            </g>
          )
        })}
        {data.filter((_, i) => i % 4 === 0).map((d, i) => (
          <text key={i} x={pad.l + (i * 4 / (data.length - 1)) * chartW} y={h - 6} textAnchor="middle" className="fill-gray-400" fontSize={9}>
            {d.timestamp}
          </text>
        ))}
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Active Alerts List
// ═══════════════════════════════════════════════════════════════

function ActiveAlertsPanel({ alerts }: { alerts: ActiveAlert[] }) {
  const { showToast } = useToast()
  const [filter, setFilter] = useState<'all' | 'firing' | 'acknowledged' | 'resolved'>('all')

  const filtered = alerts.filter(a => filter === 'all' || a.status === filter)
  const firingCount = alerts.filter(a => a.status === 'firing').length

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Active Alerts</h3>
          {firingCount > 0 && (
            <p className="text-[11px] text-red-500 mt-0.5">{firingCount} firing · {alerts.filter(a => a.status === 'acknowledged').length} acknowledged</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'firing', 'acknowledged', 'resolved'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-2.5 py-1 text-[9px] font-medium rounded-md transition-all ${
                filter === s ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-100'
              }`}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-[13px]">No alerts match the filter.</div>
        ) : (
          filtered.map(alert => {
            const sc = severityConfig[alert.severity]
            const SeverityIcon = sc.icon
            return (
              <div key={alert.id} className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${sc.hex}12` }}>
                      <SeverityIcon size={14} style={{ color: sc.hex }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] font-semibold text-gray-800">{alert.ruleName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${sc.bg} ${sc.text}`}>
                          {alert.severity}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${alertStatusColors[alert.status]}`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{alert.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[9px] text-gray-400">
                        <span>Current: <strong className="text-gray-600">{alert.currentValue}</strong></span>
                        <span>Threshold: <strong className="text-gray-600">{alert.threshold}</strong></span>
                        <span>Started: {alert.startedAt}</span>
                        {alert.acknowledgedAt && <span>Ack: {alert.acknowledgedAt}</span>}
                        {alert.resolvedAt && <span>Resolved: {alert.resolvedAt}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => showToast('info', `Acknowledge alert: ${alert.ruleName}`)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                      <Bell size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Uptime Checks Table
// ═══════════════════════════════════════════════════════════════

function UptimeTable({ checks }: { checks: UptimeCheck[] }) {
  const { showToast } = useToast()
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Endpoint Uptime</h3>
        <button onClick={() => showToast('success', 'Uptime checks refreshed (mock)')}
          className="flex items-center gap-1 text-[11px] font-medium text-[#2E86AB] hover:text-[#1A6B8A] transition-colors">
          <RefreshCw size={12} /> Refresh All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Endpoint</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Status</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Response</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">7d Uptime</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">30d Uptime</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Region</th>
              <th className="text-right py-2.5 px-3 text-gray-400 font-medium">Checked</th>
            </tr>
          </thead>
          <tbody>
            {checks.map(c => {
              const uc = uptimeStatusColors[c.status]
              const uptimeColor = c.uptime30d >= 99.9 ? 'text-emerald-600' : c.uptime30d >= 99.5 ? 'text-yellow-600' : 'text-red-500'
              return (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="text-[12px] font-medium text-gray-800">{c.name}</div>
                    <div className="text-[9px] font-mono text-gray-400 truncate max-w-[180px]">{c.endpoint}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: uc.dot }} />
                      <span className={`text-[11px] font-medium capitalize ${uc.text}`}>{c.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-mono text-[12px] font-medium ${c.responseTimeMs > 500 ? 'text-red-500' : c.responseTimeMs > 200 ? 'text-yellow-600' : 'text-gray-700'}`}>
                      {c.responseTimeMs === 0 ? '—' : `${c.responseTimeMs}ms`}
                    </span>
                  </td>
                  <td className={`py-3 px-3 text-[12px] font-semibold ${uptimeColor}`}>{c.uptime7d.toFixed(2)}%</td>
                  <td className={`py-3 px-3 text-[12px] font-semibold ${uptimeColor}`}>{c.uptime30d.toFixed(2)}%</td>
                  <td className="py-3 px-3 text-[11px] text-gray-500">{c.region}</td>
                  <td className="py-3 px-3 text-right text-[10px] text-gray-400">{c.lastChecked}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Alert Rules Sidebar
// ═══════════════════════════════════════════════════════════════

function AlertRulesPanel({ rules }: { rules: AlertRule[] }) {
  const enabledCount = rules.filter(r => r.status === 'enabled').length

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Alert Rules</h3>
      <p className="text-[11px] text-gray-400 mb-3">{enabledCount} of {rules.length} rules enabled</p>
      <div className="space-y-2">
        {rules.map(rule => {
          const sc = severityConfig[rule.severity]
          return (
            <div key={rule.id} className="p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ background: `${sc.hex}12` }}>
                    <sc.icon size={11} style={{ color: sc.hex }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-gray-800 truncate">{rule.name}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">
                      {rule.metric} {rule.condition} {rule.threshold}{rule.unit}
                    </div>
                  </div>
                </div>
                <div className={`px-1.5 py-0.5 rounded text-[8px] font-semibold shrink-0 ${
                  rule.status === 'enabled' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {rule.status}
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
// Recent Incidents
// ═══════════════════════════════════════════════════════════════

function RecentIncidents() {
  const navigate = useNavigate()
  const recentIncidents = incidentData.filter(i => i.status === 'monitoring' || i.status === 'investigating' || i.status === 'identified')

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Incidents ({recentIncidents.length})</h3>
      <div className="space-y-2">
        {recentIncidents.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-[12px]">No active incidents</div>
        ) : (
          recentIncidents.map(inc => {
            const sev = inc.severity === 'critical' ? '#EF4444' : inc.severity === 'major' ? '#F59E0B' : '#3B82F6'
            return (
              <div key={inc.id} className="p-3 rounded-lg border border-gray-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: sev }} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-gray-800">{inc.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${
                        inc.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        inc.severity === 'major' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>{inc.severity}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{inc.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-400">
                      <span>{inc.timestamp}</span>
                      <span>·</span>
                      <span>{inc.services.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div className="pt-2">
          <button onClick={() => navigate('/superadmin/audit-logs')}
            className="text-[11px] font-medium text-[#2E86AB] hover:text-[#1A6B8A] transition-colors">
            View all incidents →
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Alert History Timeline
// ═══════════════════════════════════════════════════════════════

function AlertHistoryPanel() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Alert History</h3>
      <div className="space-y-2">
        {alertHistory.slice(0, 6).map(h => {
          const sc = severityConfig[h.severity]
          return (
            <div key={h.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: sc.hex }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-gray-800">{h.ruleName}</span>
                  <span className={`px-1 py-0.5 rounded text-[7px] font-semibold ${sc.bg} ${sc.text}`}>
                    {h.severity}
                  </span>
                  <span className={`px-1 py-0.5 rounded text-[7px] font-semibold ${alertStatusColors[h.status]}`}>
                    {h.status}
                  </span>
                </div>
                <div className="text-[9px] text-gray-400 mt-0.5">
                  {h.startedAt} · Duration: {h.duration}
                  {h.resolvedAt && ` · Resolved at ${h.resolvedAt}`}
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
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function MonitoringPage() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'alerts' | 'uptime'>('alerts')

  const firingAlerts = activeAlerts.filter(a => a.status === 'firing').length
  const upCount = uptimeChecks.filter(c => c.status === 'up').length
  const avgResponseTime = Math.round(uptimeChecks.filter(c => c.responseTimeMs > 0)
    .reduce((s, c) => s + c.responseTimeMs, 0) / uptimeChecks.filter(c => c.responseTimeMs > 0).length)
  const avgErrorRate = (performanceData.reduce((s, d) => s + d.errorRatePct, 0) / performanceData.length).toFixed(2)

  return (
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
            Monitoring
          </h2>
          <p className="text-[12px] text-gray-400 mt-0.5">Real-time platform monitoring, alerts, and uptime tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 outline-none">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
          <button onClick={() => showToast('success', 'Monitoring data exported (mock)')}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* ── Key Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={AlertOctagon} label="Active Alerts" value={firingAlerts.toString()}
          sub={`${activeAlerts.filter(a => a.status !== 'resolved').length} unresolved`}
          color={firingAlerts > 0 ? '#EF4444' : '#10B981'}
          trend={{ value: firingAlerts > 0 ? `${firingAlerts} firing now` : 'All clear', up: firingAlerts === 0 }} />
        <StatCard icon={Server} label="Endpoints Up" value={`${upCount}/${uptimeChecks.length}`}
          sub={`${uptimeChecks.filter(c => c.status === 'slow').length} degraded`}
          color={upCount === uptimeChecks.length ? '#10B981' : upCount > uptimeChecks.length - 3 ? '#F59E0B' : '#EF4444'} />
        <StatCard icon={Activity} label="Avg Response" value={`${avgResponseTime}ms`}
          sub="Across all endpoints" color="#2E86AB"
          trend={{ value: avgResponseTime < 200 ? 'Healthy' : 'Elevated', up: avgResponseTime < 200 }} />
        <StatCard icon={AlertTriangle} label="Error Rate" value={`${avgErrorRate}%`}
          sub="Average over 24 hours" color="#8B5CF6"
          trend={{ value: parseFloat(avgErrorRate) < 0.2 ? 'Within threshold' : 'Above threshold', up: parseFloat(avgErrorRate) < 0.2 }} />
      </div>

      {/* ── Performance Chart ──────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <PerformanceChart data={performanceData} />
      </div>

      {/* ── Two-column layout ──────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
        {/* Main */}
        <div className="xl:col-span-3 space-y-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
            <button onClick={() => setActiveTab('alerts')}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                activeTab === 'alerts' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}>
              <Bell size={13} className="inline mr-1.5" />
              Alerts ({activeAlerts.length})
            </button>
            <button onClick={() => setActiveTab('uptime')}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                activeTab === 'uptime' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}>
              <Wifi size={13} className="inline mr-1.5" />
              Uptime ({uptimeChecks.length})
            </button>
          </div>

          {activeTab === 'alerts' ? (
            <ActiveAlertsPanel alerts={activeAlerts} />
          ) : (
            <UptimeTable checks={uptimeChecks} />
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          <AlertRulesPanel rules={alertRules} />
          <RecentIncidents />
          <AlertHistoryPanel />
        </div>
      </div>
    </div>
  )
}
