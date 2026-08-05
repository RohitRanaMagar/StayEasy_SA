import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Building2, FileText, Settings, Activity,
  CreditCard, DollarSign, Package, Flag,
} from 'lucide-react'
import { useSuperAdminStore } from './superAdminStore'

interface SearchResult {
  type: 'tenant' | 'page' | 'audit'
  label: string
  sublabel?: string
  path?: string
  icon: typeof Search
  action?: () => void
}

const pageItems: SearchResult[] = [
  { type: 'page', label: 'Dashboard', path: '/superadmin', icon: Activity },
  { type: 'page', label: 'System Health', path: '/superadmin/system-health', icon: Activity },
  { type: 'page', label: 'Plans', path: '/superadmin/plans', icon: Package },
  { type: 'page', label: 'Subscriptions', path: '/superadmin/subscriptions', icon: CreditCard },
  { type: 'page', label: 'Feature Flags', path: '/superadmin/feature-flags', icon: Flag },
  { type: 'page', label: 'Settings', path: '/superadmin/settings', icon: Settings },
  { type: 'page', label: 'Payments', path: '/superadmin/payments', icon: DollarSign },
  { type: 'page', label: 'Audit Logs', path: '/superadmin/audit-logs', icon: FileText },
  { type: 'page', label: 'Integrations', path: '/superadmin/integrations', icon: Building2 },
  { type: 'page', label: 'Usage & Billing', path: '/superadmin/usage-billing', icon: CreditCard },
  { type: 'page', label: 'Monitoring', path: '/superadmin/monitoring', icon: Activity },
  { type: 'page', label: 'Logs', path: '/superadmin/logs', icon: FileText },
  { type: 'page', label: 'Background Jobs', path: '/superadmin/background-jobs', icon: Activity },
  { type: 'page', label: 'Tenants Overview', path: '/superadmin', icon: Building2 },

]

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const tenants = useSuperAdminStore(s => s.tenants)
  const auditLogs = useSuperAdminStore(s => s.auditLogs)

  // Toggle with Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(v => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  const q = query.toLowerCase()

  const results: SearchResult[] = [
    // Tenants
    ...tenants
      .filter(t => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q))
      .slice(0, 5)
      .map(t => ({
        type: 'tenant' as const,
        label: t.name,
        sublabel: `${t.email} · ${t.plan} · ${t.status}`,
        icon: Building2,
        action: () => navigate('/superadmin'),
      })),
    // Audit logs
    ...auditLogs
      .filter(l => l.action.toLowerCase().includes(q) || l.target.toLowerCase().includes(q) || l.details.toLowerCase().includes(q))
      .slice(0, 3)
      .map(l => ({
        type: 'audit' as const,
        label: l.action,
        sublabel: `${l.target} · ${l.timestamp}`,
        icon: FileText,
        action: () => navigate('/superadmin/audit-logs'),
      })),
    // Pages
    ...pageItems
      .filter(p => p.label.toLowerCase().includes(q))
      .map(p => ({ ...p, action: () => { if (p.path) navigate(p.path) } })),
  ]

  const handleSelect = useCallback((result: SearchResult) => {
    result.action?.()
    setOpen(false)
  }, [navigate])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[selectedIndex]) { handleSelect(results[selectedIndex]) }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search tenants, pages, audit logs..."
            className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-300 bg-transparent"
          />
          <kbd className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        {/* Results */}
        {query ? (
          <div className="max-h-[360px] overflow-y-auto">
            {results.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">No results found for "{query}"</div>
            ) : (
              results.map((result, i) => {
                const Icon = result.icon
                const isSelected = i === selectedIndex
                return (
                  <button
                    key={`${result.type}-${result.label}-${i}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      result.type === 'tenant' ? 'bg-blue-50 text-blue-500' :
                      result.type === 'audit' ? 'bg-purple-50 text-purple-500' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      <Icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-800 truncate">{result.label}</div>
                      {result.sublabel && (
                        <div className="text-[9px] text-gray-400 truncate mt-0.5">{result.sublabel}</div>
                      )}
                    </div>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                      result.type === 'tenant' ? 'bg-blue-50 text-blue-600' :
                      result.type === 'audit' ? 'bg-purple-50 text-purple-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {result.type}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-2">Quick Pages</div>
            <div className="grid grid-cols-2 gap-1">
              {pageItems.slice(0, 8).map(p => (
                <button key={p.path}
                  onClick={() => { navigate(p.path!); setOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
                    <p.icon size={11} className="text-gray-500" />
                  </div>
                  <span className="text-[11px] font-medium text-gray-700">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
            <kbd className="bg-white border border-gray-200 px-1 py-0.5 rounded text-[8px] font-mono">↑↓</kbd> Navigate
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
            <kbd className="bg-white border border-gray-200 px-1 py-0.5 rounded text-[8px] font-mono">↵</kbd> Select
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
            <kbd className="bg-white border border-gray-200 px-1 py-0.5 rounded text-[8px] font-mono">⌘K</kbd> Toggle
          </div>
        </div>
      </div>
    </div>
  )
}
