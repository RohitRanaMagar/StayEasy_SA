import {
  Server, Globe, Database, CreditCard, Mail, Search, Layers,
  Wifi, HardDrive, Zap, AlertTriangle, CheckCircle,
  Cpu, MemoryStick, HardDriveIcon, Network,
  RefreshCw,
} from 'lucide-react'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { useToast } from '../../components/superadmin/Toast'
import { PageTransition } from '../../components/superadmin/Animations'

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

const serviceIconMap: Record<string, typeof Zap> = {
  Zap, Server, Globe, CreditCard, Database, Mail, Search, Layers, Wifi, HardDrive,
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  operational:   { color: 'bg-emerald-500', bg: 'bg-emerald-50', label: 'Operational' },
  degraded:      { color: 'bg-amber-500',   bg: 'bg-amber-50',   label: 'Degraded' },
  down:          { color: 'bg-red-500',     bg: 'bg-red-50',     label: 'Down' },
  maintenance:   { color: 'bg-blue-500',    bg: 'bg-blue-50',    label: 'Maintenance' },
  healthy:       { color: 'bg-emerald-500', bg: 'bg-emerald-50', label: 'Healthy' },
  slow:          { color: 'bg-amber-500',   bg: 'bg-amber-50',   label: 'Slow' },
  online:        { color: 'bg-emerald-500', bg: 'bg-emerald-50', label: 'Online' },
  warning:       { color: 'bg-amber-500',   bg: 'bg-amber-50',   label: 'Warning' },
  offline:       { color: 'bg-red-500',     bg: 'bg-red-50',     label: 'Offline' },
}

const incidentSeverity: Record<string, { color: string; bg: string }> = {
  critical: { color: 'text-red-700',   bg: 'bg-red-100' },
  major:    { color: 'text-amber-700', bg: 'bg-amber-100' },
  minor:    { color: 'text-blue-700',  bg: 'bg-blue-100' },
}

const incidentStatus: Record<string, { color: string; bg: string }> = {
  resolved:      { color: 'text-emerald-700', bg: 'bg-emerald-100' },
  monitoring:    { color: 'text-amber-700',   bg: 'bg-amber-100' },
  investigating: { color: 'text-red-700',     bg: 'bg-red-100' },
  identified:    { color: 'text-blue-700',    bg: 'bg-blue-100' },
}

// ═══════════════════════════════════════════════════════════════
// Mini Bar Chart (CSS-only)
// ═══════════════════════════════════════════════════════════════

function MiniBarChart({ data, labels, color, max }: { data: number[]; labels: string[]; color: string; max: number }) {
  return (
    <div className="flex items-end gap-[3px] h-20">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group relative">
          <div
            className="w-full rounded-t-sm transition-all hover:opacity-80"
            style={{
              height: `${Math.max((v / max) * 100, 2)}%`,
              background: color,
            }}
          />
          {/* Tooltip */}
          <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
            <div className="bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
              {v} {labels[i]}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Usage Bar
// ═══════════════════════════════════════════════════════════════

function UsageBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function MonitoringPage() {
  const {
    systemHealth, servicesStatus, incidents,
    cpuMetrics, memoryMetrics, diskIOMetrics, networkMetrics,
    dependencyChecks, serverNodes, hourlyLabels,
  } = useSuperAdminStore()
  const { showToast } = useToast()

  const activeIncidents = incidents.filter(i => i.status !== 'resolved')
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved')

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>Monitoring</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">System health, services and infrastructure</p>
          </div>
          <button
            onClick={() => showToast('info', 'Refreshed monitoring data')}
            className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Health Banner */}
        {systemHealth && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${systemHealth.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              <span className="text-sm font-semibold text-gray-900">System Status: <span className="text-emerald-600 capitalize">{systemHealth.status}</span></span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { label: 'Uptime', value: `${systemHealth.serverUptime}%`, sub: `+${systemHealth.serverUptimeChange}%` },
                { label: 'Error Rate', value: `${systemHealth.errorRate}%`, sub: `+${systemHealth.errorRateChange}%` },
                { label: 'Avg Response', value: `${systemHealth.avgResponseTime}ms`, sub: null },
                { label: 'Active Conn.', value: String(systemHealth.activeConnections), sub: null },
                { label: 'Requests/s', value: String(systemHealth.requestsPerSecond), sub: null },
                { label: 'Queue Depth', value: String(systemHealth.queueDepth), sub: `${systemHealth.queueDepthChange > 0 ? '+' : ''}${systemHealth.queueDepthChange}` },
                { label: 'Cache Hit', value: `${systemHealth.cacheHitRatio}%`, sub: `+${systemHealth.cacheHitRatioChange}%` },
                { label: 'Throughput', value: `${systemHealth.throughput}/s`, sub: null },
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{m.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{m.value}</p>
                  {m.sub && <p className="text-[10px] text-gray-400">{m.sub}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Status Grid */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Services</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {servicesStatus.map(s => {
              const st = statusConfig[s.status] || statusConfig.operational
              const Icon = serviceIconMap[s.icon] || Server
              return (
                <div key={s.name} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <Icon size={16} className="text-gray-500" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${st.color}`} />
                      <span className={`text-[10px] font-semibold ${st.color === 'bg-emerald-500' ? 'text-emerald-600' : st.color === 'bg-amber-500' ? 'text-amber-600' : st.color === 'bg-red-500' ? 'text-red-600' : 'text-blue-600'}`}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-[13px] font-semibold text-gray-800">{s.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{s.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-[11px] text-gray-400">Uptime <span className="font-medium text-gray-600">{s.uptime}</span></span>
                    <span className="text-[11px] text-gray-400">Latency <span className="font-medium text-gray-600">{s.latency}</span></span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Incidents */}
        {activeIncidents.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Active Incidents</p>
            <div className="space-y-3">
              {activeIncidents.map(inc => {
                const sev = incidentSeverity[inc.severity] || incidentSeverity.minor
                const st = incidentStatus[inc.status] || incidentStatus.investigating
                return (
                  <div key={inc.id} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className={sev.color} />
                        <h3 className="text-[13px] font-semibold text-gray-900">{inc.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sev.bg} ${sev.color}`}>{inc.severity}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.bg} ${st.color}`}>{inc.status}</span>
                      </div>
                    </div>
                    <p className="text-[12px] text-gray-500 mb-3">{inc.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400">Affected:</span>
                        {inc.services.map(svc => (
                          <span key={svc} className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600">{svc}</span>
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-400">{inc.timestamp}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Resource Metrics */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Resource Usage (24h)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { metrics: cpuMetrics, color: '#2E86AB', icon: Cpu },
              { metrics: memoryMetrics, color: '#7C3AED', icon: MemoryStick },
              { metrics: diskIOMetrics, color: '#F59E0B', icon: HardDriveIcon },
              { metrics: networkMetrics, color: '#10B981', icon: Network },
            ].map(({ metrics, color, icon: Icon }) => (
              <div key={metrics.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon size={14} style={{ color }} />
                    <span className="text-[12px] font-semibold text-gray-700">{metrics.label}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{metrics.unit}</span>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-xl font-bold text-gray-900">{metrics.current}</span>
                  <span className="text-[11px] text-gray-400">Avg {metrics.average} · Max {metrics.max}</span>
                </div>
                <MiniBarChart data={metrics.data} labels={hourlyLabels} color={color} max={metrics.max} />
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-gray-300">00:00</span>
                  <span className="text-[9px] text-gray-300">12:00</span>
                  <span className="text-[9px] text-gray-300">23:00</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column: Server Nodes + Dependencies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Server Nodes */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Server Nodes</p>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Node</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Region</th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">CPU</th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Memory</th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Disk</th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Uptime</th>
                  </tr>
                </thead>
                <tbody>
                  {serverNodes.map(n => {
                    const st = statusConfig[n.status] || statusConfig.online
                    return (
                      <tr key={n.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Server size={13} className="text-gray-400" />
                            <span className="text-[12px] font-semibold text-gray-800">{n.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-gray-500 font-mono">{n.region}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-16 mx-auto">
                            <UsageBar value={n.cpu} max={100} color={n.cpu > 80 ? '#EF4444' : n.cpu > 60 ? '#F59E0B' : '#2E86AB'} />
                            <p className="text-[10px] text-center text-gray-500 mt-1">{n.cpu}%</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-16 mx-auto">
                            <UsageBar value={n.memory} max={100} color={n.memory > 80 ? '#EF4444' : n.memory > 60 ? '#F59E0B' : '#7C3AED'} />
                            <p className="text-[10px] text-center text-gray-500 mt-1">{n.memory}%</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-16 mx-auto">
                            <UsageBar value={n.disk} max={100} color={n.disk > 80 ? '#EF4444' : n.disk > 60 ? '#F59E0B' : '#F59E0B'} />
                            <p className="text-[10px] text-center text-gray-500 mt-1">{n.disk}%</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.bg} ${st.color === 'bg-emerald-500' ? 'text-emerald-700' : st.color === 'bg-amber-500' ? 'text-amber-700' : 'text-red-700'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.color}`} /> {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[11px] text-gray-500">{n.uptime}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dependency Checks */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">External Dependencies</p>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Service</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Endpoint</th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Latency</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Checked</th>
                  </tr>
                </thead>
                <tbody>
                  {dependencyChecks.map(d => {
                    const st = statusConfig[d.status] || statusConfig.healthy
                    return (
                      <tr key={d.name} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-semibold text-gray-800">{d.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-gray-400 font-mono">{d.endpoint}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.bg} ${st.color === 'bg-emerald-500' ? 'text-emerald-700' : st.color === 'bg-amber-500' ? 'text-amber-700' : 'text-red-700'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.color}`} /> {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[12px] text-gray-600 font-mono">{d.latency}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[11px] text-gray-400">{d.lastChecked}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Resolved Incidents */}
        {resolvedIncidents.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Recent Incidents (Resolved)</p>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {resolvedIncidents.map(inc => {
                const sev = incidentSeverity[inc.severity] || incidentSeverity.minor
                return (
                  <div key={inc.id} className="flex items-start gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
                    <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-medium text-gray-800">{inc.title}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${sev.bg} ${sev.color}`}>{inc.severity}</span>
                      </div>
                      <p className="text-[11px] text-gray-500">{inc.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-gray-400">{inc.timestamp} → {inc.resolvedAt}</span>
                        {inc.services.map(s => (
                          <span key={s} className="px-1 py-0.5 bg-gray-50 rounded text-[9px] text-gray-500">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
