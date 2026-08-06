import { useState } from 'react'
import {
  Key, Search, Plus, Copy, CheckCircle,
  RefreshCw, Ban, ExternalLink,
  AlertTriangle, X, Shield, Activity,
} from 'lucide-react'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { PageTransition } from '../../components/superadmin/Animations'
import type { ApiKeyEntry } from '../../types/superadmin'

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  revoked: 'bg-red-100 text-red-600',
  expired: 'bg-gray-100 text-gray-500',
}

const permColors: Record<string, string> = {
  read: 'bg-blue-50 text-blue-600',
  write: 'bg-purple-50 text-purple-600',
  delete: 'bg-red-50 text-red-500',
  admin: 'bg-amber-50 text-amber-600',
}

function maskKey(key: string): string {
  if (key.length <= 12) return key
  return key.slice(0, 12) + '••••••••'
}

// ═══════════════════════════════════════════════════════════════
// Create / Rotate / Revoke Modal
// ═══════════════════════════════════════════════════════════════

function ConfirmModal({
  open, onClose, onConfirm,
  title, message, icon: Icon, confirmLabel, confirmColor,
}: {
  open: boolean; onClose: () => void; onConfirm: () => void
  title: string; message: string; icon: React.ElementType
  confirmLabel: string; confirmColor: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Icon size={16} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end mt-4">
            <button onClick={onClose} className="px-3 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={onConfirm} className="px-3 py-1.5 text-[11px] font-semibold text-white rounded-lg transition-colors"
              style={{ background: confirmColor }}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateKeyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [rateLimit, setRateLimit] = useState('500')
  const [selectedPerms, setSelectedPerms] = useState<string[]>(['read'])

  const allPerms = ['read', 'write', 'delete', 'admin']
  const togglePerm = (p: string) => {
    setSelectedPerms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Key size={16} className="text-purple-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Create API Key</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-400 font-medium">Key Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Production API Key"
                className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-300" />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-medium">Rate Limit (requests/min)</label>
              <input value={rateLimit} onChange={e => setRateLimit(e.target.value)}
                type="number"
                className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-300" />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-medium">Permissions</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {allPerms.map(p => (
                  <button key={p} onClick={() => togglePerm(p)}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-lg border transition-colors ${
                      selectedPerms.includes(p)
                        ? 'border-purple-300 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 justify-end">
            <button onClick={onClose} className="px-3 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button className="px-3 py-1.5 text-[11px] font-semibold text-white rounded-lg transition-colors"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
              <Plus size={12} className="inline mr-1" /> Create Key
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Key Detail Drawer
// ═══════════════════════════════════════════════════════════════

function KeyDetailDrawer({ keyItem, open, onClose }: { keyItem: ApiKeyEntry | null; open: boolean; onClose: () => void }) {
  if (!open || !keyItem) return null

  const usagePercent = Math.min((keyItem.usageThisMonth / (keyItem.rateLimit * 43200)) * 100, 100)

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-sm bg-white shadow-2xl border-l border-gray-100 h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Key Details</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Key size={15} className="text-purple-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">{keyItem.name}</div>
              <div className="text-[10px] text-gray-400">Created {keyItem.createdAt}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="text-[10px] text-gray-400">Status</div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold inline-block mt-0.5 ${statusColors[keyItem.status]}`}>{keyItem.status}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="text-[10px] text-gray-400">Rate Limit</div>
              <div className="text-xs font-semibold text-gray-700 mt-0.5">{keyItem.rateLimit}/min</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="text-[10px] text-gray-400">Last Used</div>
              <div className="text-xs font-medium text-gray-700 mt-0.5">{keyItem.lastUsed}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="text-[10px] text-gray-400">Expires</div>
              <div className="text-xs font-medium text-gray-700 mt-0.5">{keyItem.expiresAt}</div>
            </div>
          </div>

          {keyItem.tenantName && (
            <div className="mb-3 p-2.5 bg-blue-50 rounded-lg">
              <div className="text-[10px] text-blue-500 font-medium">Tenant</div>
              <div className="text-xs font-semibold text-blue-700 mt-0.5">{keyItem.tenantName}</div>
            </div>
          )}

          <div className="mb-3">
            <div className="text-[10px] text-gray-400 font-medium mb-1.5">Permissions</div>
            <div className="flex flex-wrap gap-1">
              {keyItem.permissions.map(p => (
                <span key={p} className={`px-2 py-0.5 rounded text-[10px] font-medium ${permColors[p] || 'bg-gray-100 text-gray-600'}`}>{p}</span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-400 font-medium">Monthly Usage</span>
              <span className="text-[10px] font-semibold text-gray-600">{formatNumber(keyItem.usageThisMonth)} / {formatNumber(keyItem.rateLimit * 43200)}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                style={{ width: `${usagePercent}%` }} />
            </div>
            <div className="text-[9px] text-gray-400 mt-0.5">{usagePercent.toFixed(1)}% of monthly limit used</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function ApiKeysPage() {
  const storeApiKeys = useSuperAdminStore(s => s.apiKeys)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked' | 'expired'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedKey, setSelectedKey] = useState<ApiKeyEntry | null>(null)
  const [rotateTarget, setRotateTarget] = useState<string | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null)

  const filtered = storeApiKeys.filter(k => {
    const matchesSearch = k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.key.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || k.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key.replace(/•/g, 'X'))
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const totalKeys = storeApiKeys.length
  const activeKeys = storeApiKeys.filter(k => k.status === 'active').length
  const revokedKeys = storeApiKeys.filter(k => k.status === 'revoked').length
  const expiredKeys = storeApiKeys.filter(k => k.status === 'expired').length
  const totalUsage = storeApiKeys.reduce((s, k) => s + k.usageThisMonth, 0)

  const filterTabs: { label: string; value: typeof statusFilter; count: number }[] = [
    { label: 'All', value: 'all', count: totalKeys },
    { label: 'Active', value: 'active', count: activeKeys },
    { label: 'Revoked', value: 'revoked', count: revokedKeys },
    { label: 'Expired', value: 'expired', count: expiredKeys },
  ]

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>API Keys</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">Manage and monitor API keys, permissions, and usage</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-white rounded-lg transition-colors"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
          <Plus size={13} /> Create API Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Key size={13} className="text-[#8B5CF6]" />
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Total Keys</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{totalKeys}</div>
          <div className="text-[9px] text-gray-400 mt-0.5">{activeKeys} active</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={13} className="text-emerald-500" />
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Active</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{activeKeys}</div>
          <div className="text-[9px] text-gray-400 mt-0.5">Currently in use</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={13} className="text-[#2E86AB]" />
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Usage/Month</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{formatNumber(totalUsage)}</div>
          <div className="text-[9px] text-gray-400 mt-0.5">Across all keys</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={13} className="text-[#F59E0B]" />
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Expired/Revoked</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{expiredKeys + revokedKeys}</div>
          <div className="text-[9px] text-gray-400 mt-0.5">Needs attention</div>
        </div>
      </div>

      {/* Filters + Table */}
      <div className="bg-white rounded-lg border border-gray-100 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {filterTabs.map(tab => (
              <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                  statusFilter === tab.value
                    ? 'bg-white text-gray-700 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or key..."
              className="pl-7 pr-2 py-1 text-[10px] border border-gray-200 rounded-lg outline-none focus:border-purple-300 w-48" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Name</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">API Key</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Status</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Permissions</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Rate Limit</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Usage/Month</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Last Used</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Expires</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(key => (
                <tr key={key.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedKey(key)}>
                  <td className="py-2.5 px-3">
                    <div className="text-[11px] font-medium text-gray-800">{key.name}</div>
                    {key.tenantName && <div className="text-[9px] text-gray-400">{key.tenantName}</div>}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1">
                      <code className="text-[10px] font-mono text-gray-500 bg-gray-50 px-1 py-0.5 rounded">{maskKey(key.key)}</code>
                      <button onClick={e => { e.stopPropagation(); copyKey(key.id, key.key); }}
                        className="p-0.5 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors">
                        {copiedId === key.id ? <CheckCircle size={11} className="text-emerald-500" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${statusColors[key.status]}`}>{key.status}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-0.5">
                      {key.permissions.map(p => (
                        <span key={p} className={`text-[8px] px-1 py-0.5 rounded font-medium ${permColors[p] || 'bg-gray-100 text-gray-500'}`}>{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[10px] text-gray-600">{key.rateLimit}/min</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${
                          (key.usageThisMonth / (key.rateLimit * 43200)) > 0.8 ? 'bg-red-500'
                          : (key.usageThisMonth / (key.rateLimit * 43200)) > 0.5 ? 'bg-yellow-500'
                          : 'bg-emerald-500'
                        }`}
                          style={{ width: `${Math.min((key.usageThisMonth / (key.rateLimit * 43200)) * 100, 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-500">{formatNumber(key.usageThisMonth)}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[10px] text-gray-400">{key.lastUsed}</td>
                  <td className="py-2.5 px-3 text-[10px] text-gray-400">{key.expiresAt}</td>
                  <td className="py-2.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                    {key.status === 'active' && (
                      <>
                        <button onClick={() => setRotateTarget(key.id)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Rotate key">
                          <RefreshCw size={12} />
                        </button>
                        <button onClick={() => setRevokeTarget(key.id)}
                          className="p-1 rounded hover:bg-gray-100 text-red-300 hover:text-red-500 transition-colors"
                          title="Revoke key">
                          <Ban size={12} />
                        </button>
                      </>
                    )}
                    <button onClick={() => setSelectedKey(key)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View details">
                      <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[11px] text-gray-400">
                    No API keys found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateKeyModal open={showCreate} onClose={() => setShowCreate(false)} />
      <KeyDetailDrawer keyItem={selectedKey} open={selectedKey !== null} onClose={() => setSelectedKey(null)} />

      <ConfirmModal
        open={rotateTarget !== null}
        onClose={() => setRotateTarget(null)}
        onConfirm={() => { setRotateTarget(null) }}
        title="Rotate API Key"
        message="This will generate a new key. The old key will stop working immediately. All services using this key will need to be updated."
        icon={RefreshCw}
        confirmLabel="Rotate Key"
        confirmColor="linear-gradient(135deg, #F59E0B, #D97706)"
      />

      <ConfirmModal
        open={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => { setRevokeTarget(null) }}
        title="Revoke API Key"
        message="This will permanently revoke this API key. Any services using this key will lose access immediately. This action cannot be undone."
        icon={Ban}
        confirmLabel="Revoke Key"
        confirmColor="linear-gradient(135deg, #EF4444, #DC2626)"
      />
    </div>
    </PageTransition>
  )
}
