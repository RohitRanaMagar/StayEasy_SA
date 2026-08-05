import { useState } from 'react'
import {
  Layers, Search, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Clock, AlertTriangle, Zap, RefreshCw,
  Play, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { useToast } from '../../components/superadmin/Toast'
import AdvancedButton from '../../components/superadmin/AdvancedButton'
import { useAction } from '../../components/superadmin/useAction'
import { PageTransition } from '../../components/superadmin/Animations'
import type { JobQueue, JobEntry, ScheduledTask, WorkerPool } from '../../types/superadmin'

const jobQueues: JobQueue[] = []
const jobEntries: JobEntry[] = []
const scheduledTasks: ScheduledTask[] = []
const workerPools: WorkerPool[] = []

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

const queueStatusColors: Record<string, { text: string; bg: string; dot: string }> = {
  running:  { text: 'text-emerald-700', bg: 'bg-emerald-100', dot: '#10B981' },
  paused:   { text: 'text-yellow-700',  bg: 'bg-yellow-100',  dot: '#F59E0B' },
  degraded: { text: 'text-red-700',     bg: 'bg-red-100',     dot: '#EF4444' },
  stopped:  { text: 'text-gray-600',    bg: 'bg-gray-100',    dot: '#6B7280' },
}

const jobStatusColors: Record<string, { text: string; bg: string; icon: typeof CheckCircle }> = {
  completed: { text: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
  failed:    { text: 'text-red-700',     bg: 'bg-red-100',     icon: XCircle },
  running:   { text: 'text-blue-700',    bg: 'bg-blue-100',    icon: Clock },
  pending:   { text: 'text-gray-600',    bg: 'bg-gray-100',    icon: Clock },
  retrying:  { text: 'text-yellow-700',  bg: 'bg-yellow-100',  icon: AlertTriangle },
}

const priorityColors: Record<string, string> = {
  high:   'text-red-500 bg-red-50',
  normal: 'text-blue-600 bg-blue-50',
  low:    'text-gray-500 bg-gray-100',
}

const taskStatusColors: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  failed:  'bg-red-100 text-red-600',
  skipped: 'bg-gray-100 text-gray-500',
}

const workerStatusColors: Record<string, { text: string; bg: string; dot: string }> = {
  active:  { text: 'text-emerald-700', bg: 'bg-emerald-100', dot: '#10B981' },
  idle:    { text: 'text-gray-600',    bg: 'bg-gray-100',    dot: '#6B7280' },
  scaling: { text: 'text-blue-700',    bg: 'bg-blue-100',    dot: '#3B82F6' },
  stopped: { text: 'text-red-700',     bg: 'bg-red-100',     dot: '#EF4444' },
}

// ═══════════════════════════════════════════════════════════════
// Stat Card
// ═══════════════════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, sub, color = '#2E86AB', trend }: {
  icon: typeof Layers; label: string; value: string; sub?: string; color?: string; trend?: { value: string; up: boolean }
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
// Queue Card
// ═══════════════════════════════════════════════════════════════

function QueueCard({ queue }: { queue: JobQueue }) {
  const qc = queueStatusColors[queue.status]
  const depthPct = Math.min((queue.currentDepth / 500) * 100, 100)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: qc.dot }} />
            <span className="text-[13px] font-semibold text-gray-800 capitalize">{queue.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider ${qc.bg} ${qc.text}`}>
              {queue.status}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">{queue.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <span className="text-lg font-bold text-gray-900">{queue.currentDepth}</span>
          <div className="text-[9px] text-gray-400">In queue</div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-gray-900">{formatNumber(queue.processedToday)}</span>
          <div className="text-[9px] text-gray-400">Processed today</div>
        </div>
      </div>
      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div className={`h-full rounded-full ${depthPct >= 80 ? 'bg-red-500' : depthPct >= 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
          style={{ width: `${depthPct}%` }} />
      </div>
      <div className="flex items-center justify-between text-[10px] text-gray-400">
        <span>{queue.workers} workers</span>
        <span>{queue.avgProcessingTime} avg</span>
        <span>{queue.ratePerMinute}/min</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Job Row
// ═══════════════════════════════════════════════════════════════

function JobRow({ job }: { job: JobEntry }) {
  const [expanded, setExpanded] = useState(false)
  const jc = jobStatusColors[job.status]
  const StatusIcon = jc.icon

  return (
    <div className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${expanded ? 'bg-gray-50/30' : ''}`}>
      <div className="flex items-center gap-3 px-4 py-2.5 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <StatusIcon size={12} className={jc.text} />
        <div className="w-[90px] shrink-0">
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${jc.bg} ${jc.text}`}>
            {job.status}
          </span>
        </div>
        <div className="w-[100px] shrink-0">
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${priorityColors[job.priority]}`}>
            {job.priority}
          </span>
        </div>
        <div className="w-[80px] shrink-0">
          <span className="text-[11px] font-mono text-gray-500">{job.id}</span>
        </div>
        <div className="w-[100px] shrink-0">
          <span className="text-[11px] font-medium text-gray-700 capitalize">{job.queue}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] text-gray-800 truncate block">{job.payload}</span>
        </div>
        <div className="w-[70px] shrink-0 text-right">
          <span className="text-[10px] text-gray-400">{job.duration || '—'}</span>
        </div>
        <div className="w-[50px] shrink-0 text-right">
          <span className={`text-[10px] font-medium ${job.retryCount > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
            {job.retryCount}/{job.maxRetries}
          </span>
        </div>
      </div>
      {expanded && job.error && (
        <div className="px-4 pb-3 ml-[120px] border-t border-gray-50 pt-2">
          <span className="text-[10px] text-red-500 font-medium">Error: </span>
          <span className="text-[10px] text-gray-500">{job.error}</span>
          {job.tenantName && (
            <div className="text-[10px] text-gray-400 mt-1">Tenant: {job.tenantName}</div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Worker Pool Card
// ═══════════════════════════════════════════════════════════════

function WorkerPoolCard({ pool }: { pool: WorkerPool }) {
  const wc = workerStatusColors[pool.status]
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: wc.dot }} />
          <span className="text-[12px] font-semibold text-gray-800">{pool.name}</span>
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase ${wc.bg} ${wc.text}`}>
            {pool.status}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-gray-500">
        <span>{pool.activeWorkers}/{pool.maxWorkers} workers</span>
        <span className="text-gray-300">·</span>
        <span>{pool.utilization}% util</span>
        <span className="text-gray-300">·</span>
        <span>{pool.throughput}/min</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
        <div className={`h-full rounded-full ${pool.utilization >= 80 ? 'bg-red-500' : pool.utilization >= 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
          style={{ width: `${pool.utilization}%` }} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function BackgroundJobsPage() {
  const { showToast } = useToast()
  const refreshAction = useAction({ duration: 1200 })
  const retryAction = useAction({ duration: 1500 })
  const [activeTab, setActiveTab] = useState<'queues' | 'jobs' | 'scheduled' | 'workers'>('queues')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  const totalProcessed = jobQueues.reduce((s, q) => s + q.processedToday, 0)
  const totalFailed = jobQueues.reduce((s, q) => s + q.failedToday, 0)
  const totalPending = jobEntries.filter(j => j.status === 'pending').length
  const totalDepth = jobQueues.reduce((s, q) => s + q.currentDepth, 0)
  const failureRate = totalProcessed > 0 ? ((totalFailed / totalProcessed) * 100).toFixed(2) : '0'

  const filteredJobs = jobEntries.filter(j => {
    if (!search) return true
    const q = search.toLowerCase()
    return j.id.includes(q) || j.queue.includes(q) || j.type.includes(q) || j.payload.toLowerCase().includes(q) ||
      j.tenantName?.toLowerCase().includes(q)
  })

  const totalPages = Math.ceil(filteredJobs.length / perPage)
  const pageJobs = filteredJobs.slice((page - 1) * perPage, page * perPage)

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
            Background Jobs
          </h2>
          <p className="text-[12px] text-gray-400 mt-0.5">Monitor job queues, retries, worker pools, and scheduled tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <AdvancedButton
            variant="outline" size="md"
            icon={<RefreshCw size={13} />}
            loading={refreshAction.loading}
            success={refreshAction.success}
            onClick={async () => {
              await refreshAction.execute(async () => {
                await new Promise(r => setTimeout(r, 1200))
                showToast('success', 'Job queues refreshed')
              })
            }}
            tooltip="Refresh job queue data"
          >
            Refresh
          </AdvancedButton>
          <AdvancedButton
            variant="primary" size="md"
            icon={<Play size={13} />}
            loading={retryAction.loading}
            success={retryAction.success}
            onClick={async () => {
              await retryAction.execute(async () => {
                await new Promise(r => setTimeout(r, 1500))
                showToast('success', 'All failed jobs retried')
              })
            }}
            tooltip="Retry all failed jobs"
          >
            Retry Failed
          </AdvancedButton>
        </div>
      </div>

      {/* ── Key Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Layers} label="Queue Depth" value={totalDepth.toString()}
          sub="Total jobs waiting across all queues" color="#8B5CF6"
          trend={{ value: totalDepth > 300 ? 'High queue depth' : 'Normal', up: totalDepth < 300 }} />
        <StatCard icon={Zap} label="Processed Today" value={formatNumber(totalProcessed)}
          sub="Across 6 queues" color="#10B981"
          trend={{ value: `↑ ${formatNumber(totalProcessed)} jobs done`, up: true }} />
        <StatCard icon={AlertTriangle} label="Failed Today" value={totalFailed.toString()}
          sub={`${failureRate}% failure rate`} color="#EF4444"
          trend={{ value: totalFailed > 50 ? 'Above threshold' : 'Within threshold', up: totalFailed < 50 }} />
        <StatCard icon={Clock} label="Pending" value={totalPending.toString()}
          sub="Awaiting processing" color="#3B82F6"
          trend={{ value: '↓ 12% from yesterday', up: true }} />
      </div>

      {/* ── Tabs ───────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-full overflow-x-auto">
        {([
          { key: 'queues', label: 'Queues', icon: Layers, count: jobQueues.length },
          { key: 'jobs', label: 'Jobs', icon: Zap, count: jobEntries.length },
          { key: 'scheduled', label: 'Scheduled', icon: Clock, count: scheduledTasks.length },
          { key: 'workers', label: 'Workers', icon: RefreshCw, count: workerPools.length },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key as typeof activeTab); setPage(1) }}
            className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === tab.key ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}>
            <tab.icon size={13} className="inline mr-1.5" />
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* ── Queues Tab ────────────────────────────────── */}
      {activeTab === 'queues' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {jobQueues.map(q => <QueueCard key={q.id} queue={q} />)}
        </div>
      )}

      {/* ── Jobs Tab ──────────────────────────────────── */}
      {activeTab === 'jobs' && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Job Queue</h3>
            <div className="relative w-64">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search jobs..."
                className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-blue-300" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50/50 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                <div className="w-[12px]" />
                <div className="w-[90px]">Status</div>
                <div className="w-[100px]">Priority</div>
                <div className="w-[80px]">ID</div>
                <div className="w-[100px]">Queue</div>
                <div className="flex-1">Payload</div>
                <div className="w-[70px] text-right">Duration</div>
                <div className="w-[50px] text-right">Retry</div>
              </div>
              {pageJobs.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-[13px]">No jobs match your search.</div>
              ) : (
                pageJobs.map(job => <JobRow key={job.id} job={job} />)
              )}
            </div>
          </div>

          {filteredJobs.length > 0 && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filteredJobs.length)} of {filteredJobs.length}
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
      )}

      {/* ── Scheduled Tasks Tab ────────────────────────── */}
      {activeTab === 'scheduled' && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Scheduled Tasks</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Task</th>
                  <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Cron</th>
                  <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Queue</th>
                  <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Last Run</th>
                  <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Next Run</th>
                  <th className="text-right py-2.5 px-3 text-gray-400 font-medium">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {scheduledTasks.map(task => (
                  <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="text-[12px] font-medium text-gray-800">{task.name}</div>
                      <div className="text-[10px] text-gray-400">{task.description}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] text-gray-500">{task.cron}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] text-gray-600 capitalize">{task.queue}</span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-gray-500">{task.lastRun}</td>
                    <td className="py-3 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${taskStatusColors[task.lastStatus]}`}>
                        {task.lastStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-gray-500">{task.nextRun}</td>
                    <td className="py-3 px-3 text-right">
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={task.enabled}
                          className="sr-only peer" />
                        <div className="relative w-8 h-4 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 transition-colors">
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${task.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                        </div>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Workers Tab ────────────────────────────────── */}
      {activeTab === 'workers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {workerPools.map(pool => <WorkerPoolCard key={pool.id} pool={pool} />)}
        </div>
      )}
    </div>
    </PageTransition>
  )
}
