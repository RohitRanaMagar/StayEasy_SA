import { useState, useEffect } from 'react'
import {
  Server, Database, Zap, Activity, AlertTriangle, Clock,
  RefreshCw, Cpu, HardDrive, Wifi, Globe, Mail, Search, Layers, CreditCard,
  ArrowUpRight, ArrowDownRight, ChevronDown, ChevronRight, ExternalLink,
} from 'lucide-react'
import type { ServiceStatus, IncidentItem, ResourceMetric, DependencyCheck, ServerNode } from '../../types/superadmin'

import {
  mockSystemHealthSnapshot as systemHealth,
  mockServicesStatus as servicesStatus,
  mockIncidents as incidentData,
  mockCpuMetrics as cpuMetrics,
  mockMemoryMetrics as memoryMetrics,
  mockDiskIOMetrics as diskIOMetrics,
  mockNetworkMetrics as networkMetrics,
  mockDependencyChecks as dependencyChecks,
  mockServerNodes as serverNodes,
  mockHourlyLabels as hourlyLabels,
} from '../../data/superAdminMockData'
import { PageTransition } from '../../components/superadmin/Animations'

// ═══════════════════════════════════════════════════════════════
// Colors & Helpers
// ═══════════════════════════════════════════════════════════════

const severityColors: Record<string, { text: string; bg: string; dot: string }> = {
  critical: { text: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
  major:    { text: 'text-orange-700', bg: 'bg-orange-100', dot: 'bg-orange-500' },
  minor:    { text: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
}

const statusColors: Record<string, { text: string; bg: string; hex: string }> = {
  operational:  { text: 'text-emerald-700', bg: 'bg-emerald-100', hex: '#10B981' },
  degraded:     { text: 'text-orange-700', bg: 'bg-orange-100', hex: '#F59E0B' },
  down:         { text: 'text-red-700', bg: 'bg-red-100', hex: '#EF4444' },
  maintenance:  { text: 'text-blue-700', bg: 'bg-blue-100', hex: '#3B82F6' },
}

const incidentStatusColors: Record<string, string> = {
  resolved:       'text-emerald-600',
  monitoring:     'text-blue-600',
  investigating:  'text-orange-600',
  identified:     'text-yellow-600',
}

const nodeStatusColors: Record<string, string> = {
  online:  'text-emerald-500',
  offline: 'text-red-500',
  warning: 'text-orange-500',
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

// ═══════════════════════════════════════════════════════════════
// Resource Utilization Chart
// ═══════════════════════════════════════════════════════════════

function ResourceChart({ metric, labels, color = '#2E86AB' }: {
  metric: ResourceMetric; labels: string[]; color?: string
}) {
  if (metric.data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: 130 }}>
        <span className="text-[11px] text-gray-400">No data</span>
      </div>
    )
  }
  const max = Math.max(...metric.data)
  const min = Math.min(...metric.data)
  const range = max - min || 1
  const w = 600, h = 180, pad = { t: 20, r: 16, b: 30, l: 44 }
  const chartW = w - pad.l - pad.r
  const chartH = h - pad.t - pad.b

  const points = metric.data.map((v, i) => ({
    x: pad.l + (i / (metric.data.length - 1)) * chartW,
    y: pad.t + (1 - (v - min) / range) * chartH,
  }))
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = pathD + ` L ${points[points.length - 1].x} ${h - pad.b} L ${points[0].x} ${h - pad.b} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 130 }}>
      <defs>
        <linearGradient id={`resGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = pad.t + f * chartH
        return (
          <line key={f} x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="#f0f0f0" strokeDasharray="4 4" />
        )
      })}
      {/* Y axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const val = max - f * range
        const y = pad.t + f * chartH
        return (
          <text key={f} x={pad.l - 6} y={y + 4} textAnchor="end" className="fill-gray-400" fontSize={10}>
            {metric.unit === '%' ? `${val.toFixed(0)}%` : val.toFixed(1)}
          </text>
        )
      })}
      {/* Area */}
      <path d={areaD} fill={`url(#resGrad-${color.replace('#', '')})`} />
      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5} fill={color} stroke="white" strokeWidth={2} />
          <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-gray-500" fontSize={9} fontWeight={600}>
            {metric.data[i]}
            {metric.unit === 'GB' ? 'GB' : metric.unit === '%' ? '%' : ''}
          </text>
        </g>
      ))}
      {/* X axis labels */}
      {labels.map((l, i) => (
        <text key={i} x={points[i]?.x || 0} y={h - 6} textAnchor="middle" className="fill-gray-400" fontSize={9}>
          {l}
        </text>
      ))}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// Stat Card (Compact)
// ═══════════════════════════════════════════════════════════════

function MetricCard({ icon: Icon, label, value, sub, color = '#2E86AB', trend }: {
  icon: typeof Server; label: string; value: string | number;
  sub?: string; color?: string; trend?: { value: string; up: boolean }
}) {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
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
// Services Status Grid Item
// ═══════════════════════════════════════════════════════════════

const serviceIconMap: Record<string, typeof Server> = {
  Server, Database, Zap, Mail, CreditCard, HardDrive, Search, Layers, Wifi, Globe,
}

function ServiceCard({ service }: { service: ServiceStatus }) {
  const Icon = serviceIconMap[service.icon] || Server
  const sc = statusColors[service.status]

  return (
    <div className="flex items-start gap-3 p-3.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 bg-white">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${sc ? sc.hex : '#6B7280'}12` }}>
        <Icon size={16} className={sc.text} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-gray-800">{service.name}</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${sc.bg} ${sc.text}`}>
            {service.status}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5">{service.description}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] text-gray-300">Uptime: <span className="text-gray-500 font-medium">{service.uptime}</span></span>
          <span className="text-[10px] text-gray-300">Latency: <span className="text-gray-500 font-medium">{service.latency}</span></span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Incident Timeline Item
// ═══════════════════════════════════════════════════════════════

function IncidentCard({ incident }: { incident: IncidentItem }) {
  const sevColor = severityColors[incident.severity] || severityColors.minor
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-gray-100 rounded-lg hover:border-gray-200 transition-all duration-200 bg-white">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        {/* Severity dot + timeline bar */}
        <div className="flex flex-col items-center shrink-0">
          <div className={`w-3 h-3 rounded-full ${sevColor.dot} ring-2 ring-white`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-gray-800">{incident.title}</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${sevColor.bg} ${sevColor.text}`}>
              {incident.severity}
            </span>
            <span className={`text-[10px] font-medium ${incidentStatusColors[incident.status] || 'text-gray-500'}`}>
              {incident.status}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Clock size={11} className="text-gray-300" />
            <span className="text-[11px] text-gray-400">{incident.timestamp}</span>
            {incident.resolvedAt && (
              <>
                <span className="text-gray-200">→</span>
                <span className="text-[11px] text-emerald-500">{incident.resolvedAt}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {incident.services.map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500">{s}</span>
          ))}
          {expanded ? <ChevronDown size={14} className="text-gray-300" /> : <ChevronRight size={14} className="text-gray-300" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pl-10 border-t border-gray-50">
          <p className="text-[12px] text-gray-600 leading-relaxed">{incident.description}</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Dependency Check Row
// ═══════════════════════════════════════════════════════════════

function DependencyRow({ dep }: { dep: DependencyCheck }) {
  const statusColor = dep.status === 'healthy' ? 'text-emerald-500' : dep.status === 'slow' ? 'text-orange-500' : 'text-red-500'
  const statusBg = dep.status === 'healthy' ? 'bg-emerald-100' : dep.status === 'slow' ? 'bg-orange-100' : 'bg-red-100'

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${statusColor} ${statusBg} ring-2 ring-white`} />
        <div>
          <span className="text-[13px] font-medium text-gray-700">{dep.name}</span>
          <span className="text-[10px] text-gray-400 ml-2">{dep.endpoint}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-500">
          <span className="font-medium">{dep.latency}</span>
        </span>
        <span className="text-[10px] text-gray-300">{dep.lastChecked}</span>
        <ExternalLink size={12} className="text-gray-200 hover:text-gray-400 transition-colors" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Server Node Card
// ═══════════════════════════════════════════════════════════════

function ServerNodeCard({ node }: { node: ServerNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Server size={14} className={nodeStatusColors[node.status]} />
          <span className="text-[13px] font-semibold text-gray-800">{node.name}</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
          node.status === 'online' ? 'bg-emerald-100 text-emerald-700' :
          node.status === 'offline' ? 'bg-red-100 text-red-700' :
          'bg-orange-100 text-orange-700'
        }`}>
          {node.status}
        </span>
      </div>

      {/* Resource Bars */}
      <div className="space-y-2.5">
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-gray-400">CPU</span>
            <span className="font-medium text-gray-600">{node.cpu}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${node.cpu}%`, background: node.cpu > 80 ? '#EF4444' : node.cpu > 60 ? '#F59E0B' : '#10B981' }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-gray-400">Memory</span>
            <span className="font-medium text-gray-600">{node.memory}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${node.memory}%`, background: node.memory > 80 ? '#EF4444' : node.memory > 60 ? '#F59E0B' : '#3B82F6' }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-gray-400">Disk</span>
            <span className="font-medium text-gray-600">{node.disk}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${node.disk}%`, background: node.disk > 80 ? '#EF4444' : node.disk > 60 ? '#F59E0B' : '#8B5CF6' }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
        <span>Uptime: <span className="text-gray-600 font-medium">{node.uptime}</span></span>
        <span>{node.region}</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function SystemHealthPage() {
  const [lastRefreshed, setLastRefreshed] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setLastRefreshed(new Date())
      setRefreshing(false)
    }, 600)
  }

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(handleRefresh, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  const overallStatus = servicesStatus.every(s => s.status === 'operational')
    ? 'All Systems Operational'
    : servicesStatus.some(s => s.status === 'down')
      ? 'Some Systems Down'
      : 'Degraded Performance'

  const overallColor = overallStatus === 'All Systems Operational'
    ? 'text-emerald-600'
    : overallStatus === 'Some Systems Down'
      ? 'text-red-500'
      : 'text-orange-500'

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2.5 h-2.5 rounded-full ${overallColor} animate-pulse`} />
            <span className={`text-[13px] font-medium ${overallColor}`}>{overallStatus}</span>
            <span className="text-[11px] text-gray-400">
              — {servicesStatus.filter(s => s.status === 'operational').length}/{servicesStatus.length} services
            </span>
          
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-brand-accent focus:ring-brand-accent/30"
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Last refreshed */}
      <div className="text-[10px] text-gray-300 -mt-3">
        Last updated: {lastRefreshed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>

      {/* ── Key Metrics ────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          icon={Activity}
          label="Uptime"
          value={`${systemHealth.serverUptime}%`}
          sub="Last 30 days"
          color="#10B981"
          trend={{ value: `+${systemHealth.serverUptimeChange} pp`, up: true }}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Error Rate"
          value={`${systemHealth.errorRate}%`}
          sub="Of total requests"
          color="#F59E0B"
          trend={{ value: `${Math.abs(systemHealth.errorRateChange)} pp`, up: false }}
        />
        <MetricCard
          icon={Zap}
          label="Avg Response"
          value={`${systemHealth.averageResponseTime}ms`}
          sub={`P99: ${systemHealth.p99ResponseTime}ms`}
          color="#8B5CF6"
        />
        <MetricCard
          icon={Wifi}
          label="Active Connections"
          value={formatNumber(systemHealth.activeConnections)}
          sub="Current open"
          color="#2E86AB"
        />
        <MetricCard
          icon={Layers}
          label="Request Rate"
          value={`${systemHealth.requestRate}/s`}
          sub="Requests per second"
          color="#EF4444"
        />
        <MetricCard
          icon={Database}
          label="Queue Depth"
          value={systemHealth.queueDepth}
          sub="Pending jobs"
          color="#3B82F6"
          trend={{ value: `${Math.abs(systemHealth.queueDepthChange)} decreasing`, up: true }}
        />
      </div>

      {/* ── Server Nodes ───────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Server Nodes</h3>
          <span className="text-[11px] text-gray-400">
            {serverNodes.filter(n => n.status === 'online').length}/{serverNodes.length} online
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {serverNodes.map(node => (
            <ServerNodeCard key={node.id} node={node} />
          ))}
        </div>
      </div>

      {/* ── Two column: Services + Dependencies ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Services Status */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Services Status</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-gray-400">{servicesStatus.filter(s => s.status === 'operational').length} Operational</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {servicesStatus.map(service => (
                <ServiceCard key={service.name} service={service} />
              ))}
            </div>
          </div>
        </div>

        {/* External Dependencies */}
        <div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">External Dependencies</h3>
              <span className="text-[10px] text-gray-400">{dependencyChecks.filter(d => d.status === 'healthy').length}/{dependencyChecks.length} healthy</span>
            </div>
            <div className="divide-y divide-gray-50">
              {dependencyChecks.map(dep => (
                <DependencyRow key={dep.name} dep={dep} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Resource Utilization Charts ────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Resource Utilization — Last 24 Hours</h3>
          <select className="text-[11px] border border-gray-200 rounded-lg px-2 py-1 text-gray-500 outline-none">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-gray-600 flex items-center gap-1.5">
                <Cpu size={13} className="text-[#2E86AB]" /> CPU Usage
              </span>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span>Current: <span className="font-semibold text-gray-600">{cpuMetrics.current}{cpuMetrics.unit}</span></span>
                <span>Avg: <span className="font-semibold text-gray-600">{cpuMetrics.average}{cpuMetrics.unit}</span></span>
                <span>Max: <span className="font-semibold text-gray-600">{cpuMetrics.max}{cpuMetrics.unit}</span></span>
              </div>
            </div>
            <ResourceChart metric={cpuMetrics} labels={hourlyLabels} color="#2E86AB" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-gray-600 flex items-center gap-1.5">
                <Database size={13} className="text-[#8B5CF6]" /> Memory Usage
              </span>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span>Current: <span className="font-semibold text-gray-600">{memoryMetrics.current}{memoryMetrics.unit}</span></span>
                <span>Avg: <span className="font-semibold text-gray-600">{memoryMetrics.average}{memoryMetrics.unit}</span></span>
                <span>Max: <span className="font-semibold text-gray-600">{memoryMetrics.max}{memoryMetrics.unit}</span></span>
              </div>
            </div>
            <ResourceChart metric={memoryMetrics} labels={hourlyLabels} color="#8B5CF6" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-gray-600 flex items-center gap-1.5">
                <HardDrive size={13} className="text-[#F59E0B]" /> Disk I/O
              </span>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span>Current: <span className="font-semibold text-gray-600">{diskIOMetrics.current}{diskIOMetrics.unit}</span></span>
                <span>Avg: <span className="font-semibold text-gray-600">{diskIOMetrics.average}{diskIOMetrics.unit}</span></span>
                <span>Max: <span className="font-semibold text-gray-600">{diskIOMetrics.max}{diskIOMetrics.unit}</span></span>
              </div>
            </div>
            <ResourceChart metric={diskIOMetrics} labels={hourlyLabels} color="#F59E0B" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-gray-600 flex items-center gap-1.5">
                <Globe size={13} className="text-[#EF4444]" /> Network Traffic
              </span>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span>↓ In: <span className="font-semibold text-gray-600">{systemHealth.networkInbound}{systemHealth.networkUnit}</span></span>
                <span>↑ Out: <span className="font-semibold text-gray-600">{systemHealth.networkOutbound}{systemHealth.networkUnit}</span></span>
                <span>Current: <span className="font-semibold text-gray-600">{networkMetrics.current}{networkMetrics.unit}</span></span>
              </div>
            </div>
            <ResourceChart metric={networkMetrics} labels={hourlyLabels} color="#EF4444" />
          </div>
        </div>
      </div>

      {/* ── Incidents ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Recent Incidents</h3>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Critical
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> Major
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-yellow-500" /> Minor
            </span>
          </div>
        </div>

        {/* Timeline line */}
        <div className="relative">
          {incidentData.map((incident, idx) => (
            <div key={incident.id} className="relative">
              {/* Connecting line */}
              {idx < incidentData.length - 1 && (
                <div className="absolute left-[5px] top-4 bottom-0 w-px bg-gray-100" />
              )}
              <IncidentCard incident={incident} />
              {idx < incidentData.length - 1 && <div className="h-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Summary Footer Stats ───────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <div className="text-lg font-bold text-gray-900">{systemHealth.serverUptime}%</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Overall Uptime (30d)</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <div className="text-lg font-bold text-emerald-600">{systemHealth.cacheHitRatio}%</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Cache Hit Ratio</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <div className="text-lg font-bold text-gray-900">{formatNumber(systemHealth.activeConnections)}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Active Connections</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
          <div className="text-lg font-bold text-gray-900">{systemHealth.averageResponseTime}ms</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Avg Response Time</div>
        </div>
      </div>
    </div>
    </PageTransition>
  )
}
