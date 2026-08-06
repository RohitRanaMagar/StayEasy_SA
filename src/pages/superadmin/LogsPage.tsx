import { useState } from 'react'
import {
  FileText, Search, ChevronLeft, ChevronRight, Download,
  AlertTriangle, AlertOctagon, Info, Bug, Clock, RefreshCw,
} from 'lucide-react'
import { useToast } from '../../components/superadmin/Toast'
import AdvancedButton from '../../components/superadmin/AdvancedButton'
import { useAction } from '../../components/superadmin/useAction'
import { PageTransition } from '../../components/superadmin/Animations'
import type { SystemLogEntry } from '../../types/superadmin'

import { mockSystemLogs } from '../../data/superAdminMockData'
const systemLogs: SystemLogEntry[] = mockSystemLogs

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

const levelConfig: Record<string, { text: string; bg: string; icon: typeof AlertTriangle; hex: string; label: string }> = {
  error: { text: 'text-red-700', bg: 'bg-red-100', icon: AlertOctagon, hex: '#EF4444', label: 'Error' },
  warn:  { text: 'text-yellow-700', bg: 'bg-yellow-100', icon: AlertTriangle, hex: '#F59E0B', label: 'Warn' },
  info:  { text: 'text-blue-700', bg: 'bg-blue-100', icon: Info, hex: '#3B82F6', label: 'Info' },
  debug: { text: 'text-gray-600', bg: 'bg-gray-100', icon: Bug, hex: '#6B7280', label: 'Debug' },
}

const sourceColors: Record<string, string> = {
  'api-server':      '#8B5CF6',
  'auth-service':    '#10B981',
  'booking-engine':  '#2E86AB',
  'payment-gateway': '#EF4444',
  'database':        '#F59E0B',
  'email-service':   '#EC4899',
  'webhook':         '#6B7280',
  'background-jobs': '#3B82F6',
  'search-index':    '#14B8A6',
  'cache':           '#F97316',
  'cdn':             '#A855F7',
  'system':          '#6B7280',
}

const sources = [...new Set(systemLogs.map(l => l.source))].sort()

// ═══════════════════════════════════════════════════════════════
// Log Row
// ═══════════════════════════════════════════════════════════════

function LogRow({ log }: { log: SystemLogEntry }) {
  const [expanded, setExpanded] = useState(false)
  const lc = levelConfig[log.level]
  const LevelIcon = lc.icon
  const sourceColor = sourceColors[log.source] || '#6B7280'

  return (
    <div
      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${expanded ? 'bg-gray-50/30' : ''}`}
      onClick={() => setExpanded(v => !v)}
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Level badge */}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${lc.hex}12` }}>
          <LevelIcon size={12} style={{ color: lc.hex }} />
        </div>

        {/* Timestamp */}
        <div className="w-[140px] shrink-0">
          <span className="text-[11px] font-mono text-gray-500">{log.timestamp.split(' ')[1]}</span>
          <div className="text-[9px] text-gray-400 font-mono">{log.timestamp.split(' ')[0]}</div>
        </div>

        {/* Level */}
        <div className="w-[52px] shrink-0">
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${lc.bg} ${lc.text}`}>
            {lc.label}
          </span>
        </div>

        {/* Source */}
        <div className="w-[120px] shrink-0 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sourceColor }} />
          <span className="text-[11px] font-medium text-gray-600 truncate">{log.source}</span>
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <span className="text-[12px] text-gray-800 truncate block">{log.message}</span>
        </div>

        {/* Request ID */}
        {log.requestId && (
          <div className="w-[100px] shrink-0 hidden lg:block">
            <span className="text-[9px] font-mono text-gray-400 truncate block">{log.requestId}</span>
          </div>
        )}

        {/* Expand indicator */}
        <div className="w-4 shrink-0">
          <Clock size={10} className={`text-gray-300 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 pt-1 ml-[52px] border-t border-gray-50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            {log.details && (
              <div className="col-span-2 sm:col-span-4">
                <span className="text-[10px] text-gray-400 block mb-0.5">Details</span>
                <div className="text-[11px] text-gray-600 bg-gray-50 rounded p-2 font-mono break-all">{log.details}</div>
              </div>
            )}
            {log.ip && (
              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">IP Address</span>
                <span className="text-[11px] text-gray-700 font-mono">{log.ip}</span>
              </div>
            )}
            {log.userId && (
              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">User ID</span>
                <span className="text-[11px] text-gray-700 font-mono">{log.userId}</span>
              </div>
            )}
            {log.requestId && (
              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">Request ID</span>
                <span className="text-[11px] text-gray-700 font-mono">{log.requestId}</span>
              </div>
            )}
            <div>
              <span className="text-[10px] text-gray-400 block mb-0.5">Log ID</span>
              <span className="text-[11px] text-gray-700 font-mono">{log.id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Level Stats
// ═══════════════════════════════════════════════════════════════

function LevelStats({ logs }: { logs: SystemLogEntry[] }) {
  const counts = {
    error: logs.filter(l => l.level === 'error').length,
    warn:  logs.filter(l => l.level === 'warn').length,
    info:  logs.filter(l => l.level === 'info').length,
    debug: logs.filter(l => l.level === 'debug').length,
  }

  return (
    <div className="flex items-center gap-3">
      {(['error', 'warn', 'info', 'debug'] as const).map(level => {
        const lc = levelConfig[level]
        const Icon = lc.icon
        return (
          <div key={level} className="flex items-center gap-1.5 text-[11px]">
            <Icon size={12} style={{ color: lc.hex }} />
            <span className={`font-medium ${lc.text}`}>{counts[level]}</span>
            <span className="text-gray-400">{lc.label.toLowerCase()}</span>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function LogsPage() {
  const { showToast } = useToast()
  const refreshAction = useAction({ duration: 1000 })
  const exportAction = useAction({ duration: 800 })
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const perPage = 15

  const filtered = systemLogs.filter(log => {
    const matchesSearch = search === '' ||
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.source.toLowerCase().includes(search.toLowerCase()) ||
      log.details?.toLowerCase().includes(search.toLowerCase()) ||
      log.requestId?.toLowerCase().includes(search.toLowerCase())
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter
    const matchesSource = sourceFilter === 'all' || log.source === sourceFilter
    return matchesSearch && matchesLevel && matchesSource
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const pageLogs = filtered.slice((page - 1) * perPage, page * perPage)

  const handleLevelFilter = (level: string) => {
    setLevelFilter(level)
    setPage(1)
  }

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
            Logs
          </h2>
          <p className="text-[12px] text-gray-400 mt-0.5">View and search system logs across all services</p>
        </div>
        <div className="flex items-center gap-2">
          <AdvancedButton
            variant="outline" size="md"
            icon={<RefreshCw size={13} />}
            loading={refreshAction.loading}
            success={refreshAction.success}
            onClick={async () => {
              await refreshAction.execute(async () => {
                await new Promise(r => setTimeout(r, 1000))
                showToast('success', 'Logs refreshed')
              })
            }}
            tooltip="Refresh system logs"
          >
            Refresh
          </AdvancedButton>
          <AdvancedButton
            variant="outline" size="md"
            icon={<Download size={13} />}
            loading={exportAction.loading}
            success={exportAction.success}
            onClick={async () => {
              await exportAction.execute(async () => {
                await new Promise(r => setTimeout(r, 800))
                showToast('success', 'Logs exported')
              })
            }}
            tooltip="Export logs as CSV"
          >
            Export
          </AdvancedButton>
        </div>
      </div>

      {/* ── Stats + Filters ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <LevelStats logs={systemLogs} />
          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search logs..."
              className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-blue-300"
            />
          </div>
        </div>

        {/* Level pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-[10px] text-gray-400 mr-1">Level:</span>
          <button onClick={() => handleLevelFilter('all')}
            className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${levelFilter === 'all' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
            All
          </button>
          {(['error', 'warn', 'info', 'debug'] as const).map(level => {
            const lc = levelConfig[level]
            return (
              <button key={level} onClick={() => handleLevelFilter(level)}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${levelFilter === level ? `${lc.bg} ${lc.text}` : 'text-gray-500 hover:bg-gray-100'}`}>
                {lc.label}
              </button>
            )
          })}
        </div>

        {/* Source filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-gray-400 mr-1">Source:</span>
          <button onClick={() => { setSourceFilter('all'); setPage(1) }}
            className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${sourceFilter === 'all' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
            All
          </button>
          {sources.map(src => (
            <button key={src} onClick={() => { setSourceFilter(src); setPage(1) }}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${sourceFilter === src ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* ── Log Table ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Column headers */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50/50 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
          <div className="w-7 shrink-0" />
          <div className="w-[140px] shrink-0">Timestamp</div>
          <div className="w-[52px] shrink-0">Level</div>
          <div className="w-[120px] shrink-0">Source</div>
          <div className="flex-1">Message</div>
          <div className="w-[100px] shrink-0 hidden lg:block">Request ID</div>
          <div className="w-4 shrink-0" />
        </div>

        {pageLogs.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-[13px]">
            <FileText size={24} className="mx-auto mb-2 text-gray-300" />
            No logs match your filters.
          </div>
        ) : (
          pageLogs.map(log => <LogRow key={log.id} log={log} />)
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} logs
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
    </PageTransition>
  )
}
