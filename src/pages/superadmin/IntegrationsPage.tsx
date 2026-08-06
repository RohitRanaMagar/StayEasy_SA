import { useState } from 'react'
import {
  Puzzle, Plus, Search, ChevronRight, ExternalLink,
  CheckCircle, XCircle, AlertTriangle, Clock, Eye, EyeOff,
  Copy, Edit, Trash2, Key, Globe, Download,
} from 'lucide-react'
import { useToast } from '../../components/superadmin/Toast'
import type { IntegrationService, ApiKey, WebhookEndpoint } from '../../types/superadmin'

import { mockIntegrationServices, mockIntegrationApiKeys, mockWebhookEndpoints } from '../../data/superAdminMockData'
const integrationServices: IntegrationService[] = mockIntegrationServices
const apiKeys: ApiKey[] = mockIntegrationApiKeys
const webhookEndpoints: WebhookEndpoint[] = mockWebhookEndpoints

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

const statusConfig: Record<string, { text: string; bg: string; icon: typeof CheckCircle }> = {
  connected:    { text: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
  disconnected: { text: 'text-gray-600',   bg: 'bg-gray-100',    icon: XCircle },
  error:        { text: 'text-red-700',    bg: 'bg-red-100',     icon: AlertTriangle },
  pending:      { text: 'text-blue-700',   bg: 'bg-blue-100',    icon: Clock },
}

const apiKeyStatusColors: Record<string, string> = {
  active:  'bg-emerald-100 text-emerald-700',
  revoked: 'bg-red-100 text-red-600',
  expired: 'bg-gray-100 text-gray-500',
}

const webhookStatusColors: Record<string, string> = {
  active:   'bg-emerald-100 text-emerald-700',
  disabled: 'bg-gray-100 text-gray-500',
  failing:  'bg-red-100 text-red-600',
}

const categoryColors: Record<string, string> = {
  payment:       '#8B5CF6',
  communication: '#10B981',
  analytics:     '#3B82F6',
  storage:       '#F97316',
  ai:            '#6B7280',
  other:         '#EC4899',
}

// ═══════════════════════════════════════════════════════════════
// Integration Service Card
// ═══════════════════════════════════════════════════════════════

function ServiceCard({ service, onConfigure }: {
  service: IntegrationService; onConfigure: (s: IntegrationService) => void
}) {
  const sc = statusConfig[service.status]
  const StatusIcon = sc.icon
  const catColor = categoryColors[service.category] || '#6B7280'

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: catColor }}>
            {service.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-gray-800">{service.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider ${sc.bg} ${sc.text}`}>
                {service.status}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">{service.description}</p>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <StatusIcon size={10} className={sc.text} />
            <span>v{service.version}</span>
          </div>
          <span>·</span>
          <span>Last sync: {service.lastSyncAt}</span>
        </div>

        {/* Connected since */}
        {service.status === 'connected' && (
          <div className="text-[9px] text-gray-300 mb-3">Connected {service.connectedAt}</div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
          <button
            onClick={() => onConfigure(service)}
            className="flex-1 px-3 py-1.5 text-[11px] font-medium text-[#2E86AB] border border-[#2E86AB]/30 rounded-lg hover:bg-[#2E86AB]/5 transition-colors"
          >
            Configure
          </button>
          <a href={service.docsUrl} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 text-[11px] font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
            Docs <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Service Config Modal
// ═══════════════════════════════════════════════════════════════

function ConfigModal({ service, onClose }: {
  service: IntegrationService | null; onClose: () => void
}) {
  const { showToast } = useToast()
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  if (!service) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scroll-thin"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
              style={{ background: categoryColors[service.category] || '#6B7280' }}>
              {service.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{service.name}</h3>
              <p className="text-[11px] text-gray-400">{service.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XCircle size={18} />
          </button>
        </div>

        {/* Config Fields */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1">
            <CheckCircle size={12} className="text-emerald-500" />
            <span>Connected as version {service.version}</span>
            <span className="mx-1">·</span>
            <Clock size={12} className="text-gray-300" />
            <span>Last sync: {service.lastSyncAt}</span>
          </div>

          {service.configFields.map(field => (
            <div key={field.key}>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                {field.label}
                {field.required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              {field.type === 'toggle' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={field.value === 'true'}
                    className="rounded border-gray-300 text-brand-accent focus:ring-brand-accent/30" />
                  <span className="text-[12px] text-gray-600">Enabled</span>
                </label>
              ) : field.type === 'select' ? (
                <select defaultValue={field.value}
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors">
                  {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : field.type === 'password' ? (
                <div className="relative">
                  <input type={showPasswords[field.key] ? 'text' : 'password'}
                    defaultValue={field.value || '············'}
                    placeholder="Enter value..."
                    className="w-full px-3 py-2 pr-10 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                  <button type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, [field.key]: !p[field.key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    {showPasswords[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              ) : (
                <input type="text" defaultValue={field.value}
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-100">
          <button onClick={() => showToast('info', `Disconnect ${service.name}? This will stop all data flow.`)}
            className="text-[11px] text-red-500 hover:text-red-600 transition-colors flex items-center gap-1">
            <Trash2 size={12} /> Disconnect
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-[12px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => { showToast('success', `${service.name} configuration saved (mock)`); onClose() }}
              className="px-4 py-2 text-[12px] font-semibold text-white rounded-lg transition-colors"
              style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}>
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// API Key Row
// ═══════════════════════════════════════════════════════════════

function ApiKeyRow({ apiKey }: { apiKey: ApiKey }) {
  const { showToast } = useToast()
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
      <td className="py-3 px-3">
        <div className="text-[12px] font-medium text-gray-800">{apiKey.name}</div>
        <div className="text-[10px] text-gray-400">{apiKey.tenantName}</div>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-1.5">
          <div className="font-mono text-[11px] text-gray-500 bg-gray-50 px-2 py-1 rounded">
            {showKey ? apiKey.key : apiKey.maskedKey}
          </div>
          <button onClick={() => setShowKey(v => !v)}
            className="p-1 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors">
            {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button onClick={handleCopy}
            className="p-1 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors">
            {copied ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
          </button>
        </div>
      </td>
      <td className="py-3 px-3">
        <div className="flex flex-wrap gap-1">
          {apiKey.permissions.slice(0, 2).map(p => (
            <span key={p} className="px-1 py-0.5 rounded text-[8px] font-medium bg-gray-100 text-gray-500">
              {p}
            </span>
          ))}
          {apiKey.permissions.length > 2 && (
            <span className="px-1 py-0.5 rounded text-[8px] font-medium bg-gray-100 text-gray-400">
              +{apiKey.permissions.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-3">
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${apiKeyStatusColors[apiKey.status]}`}>
          {apiKey.status}
        </span>
      </td>
      <td className="py-3 px-3 text-[10px] text-gray-400">{apiKey.lastUsedAt}</td>
      <td className="py-3 px-3 text-[10px] text-gray-400">{apiKey.expiresAt}</td>
      <td className="py-3 px-3 text-right">
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => showToast('info', `Revoke key: ${apiKey.name}?`)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Revoke">
            <XCircle size={12} />
          </button>
          <button onClick={() => showToast('info', `Edit key: ${apiKey.name} (mock)`)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Edit">
            <Edit size={12} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ═══════════════════════════════════════════════════════════════
// Webhook Row
// ═══════════════════════════════════════════════════════════════

function WebhookRow({ webhook }: { webhook: WebhookEndpoint }) {
  const { showToast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const successRate = webhook.successCount + webhook.failureCount > 0
    ? Math.round((webhook.successCount / (webhook.successCount + webhook.failureCount)) * 100)
    : 100

  return (
    <div className="border border-gray-100 rounded-lg hover:border-gray-200 transition-all bg-white">
      <button onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-3.5 text-left">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: webhook.status === 'active' ? '#10B98115' : webhook.status === 'failing' ? '#EF444415' : '#6B728015' }}>
          <Globe size={14} className={webhook.status === 'active' ? 'text-emerald-500' : webhook.status === 'failing' ? 'text-red-500' : 'text-gray-400'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-gray-800">{webhook.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider ${webhookStatusColors[webhook.status]}`}>
              {webhook.status}
            </span>
          </div>
          <div className="text-[10px] font-mono text-gray-400 mt-0.5 truncate">{webhook.url}</div>
        </div>
        <div className="text-right text-[10px] text-gray-400 shrink-0">
          <div className="font-semibold text-gray-600">{successRate}%</div>
          <div>Success rate</div>
        </div>
        {expanded ? <ChevronRight size={14} className="text-gray-300 rotate-90" /> : <ChevronRight size={14} className="text-gray-300" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
            <div>
              <span className="text-gray-400 block mb-1">Events</span>
              <div className="flex flex-wrap gap-1">
                {webhook.events.map(evt => (
                  <span key={evt} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-50 text-blue-600">
                    {evt}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Stats</span>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Successful</span>
                  <span className="font-medium text-emerald-600">{webhook.successCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Failed</span>
                  <span className="font-medium text-red-500">{webhook.failureCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Created</span>
              <span className="text-gray-600">{webhook.createdAt}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Last Triggered</span>
              <span className="text-gray-600">{webhook.lastTriggeredAt}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
            <button onClick={() => showToast('info', `Testing webhook: ${webhook.name} (mock)`)}
              className="px-3 py-1.5 text-[10px] font-medium text-[#2E86AB] border border-[#2E86AB]/30 rounded-lg hover:bg-[#2E86AB]/5 transition-colors">
              Test Webhook
            </button>
            <button onClick={() => showToast('info', `Edit webhook: ${webhook.name} (mock)`)}
              className="px-3 py-1.5 text-[10px] font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Edit
            </button>
            <button onClick={() => showToast('info', `Delete webhook: ${webhook.name}?`)}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors ml-auto">
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function IntegrationsPage() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'services' | 'apikeys' | 'webhooks'>('services')
  const [search, setSearch] = useState('')
  const [configureService, setConfigureService] = useState<IntegrationService | null>(null)

  const filteredServices = integrationServices.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  )

  const connectedCount = integrationServices.filter(s => s.status === 'connected').length
  const activeKeys = apiKeys.filter(k => k.status === 'active').length
  const activeWebhooks = webhookEndpoints.filter(w => w.status === 'active').length

  return (
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-blue-300" />
          </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <button onClick={() => showToast('success', 'Integrations exported (mock)')}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={13} /> Export
          </button>
          <button onClick={() => showToast('info', 'Add new integration wizard (mock)')}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-white rounded-lg transition-colors"
            style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}>
            <Plus size={13} /> Add Integration
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="text-lg font-bold text-gray-900">{connectedCount}/{integrationServices.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Connected Services</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="text-lg font-bold text-gray-900">{activeKeys}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Active API Keys</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="text-lg font-bold text-gray-900">{activeWebhooks}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Active Webhooks</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="text-lg font-bold text-gray-900">{integrationServices.filter(s => s.status === 'disconnected' || s.status === 'pending').length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Available to Connect</div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
        <button onClick={() => setActiveTab('services')}
          className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${activeTab === 'services' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
          <Puzzle size={13} className="inline mr-1.5" />
          Services ({integrationServices.length})
        </button>
        <button onClick={() => setActiveTab('apikeys')}
          className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${activeTab === 'apikeys' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
          <Key size={13} className="inline mr-1.5" />
          API Keys ({apiKeys.length})
        </button>
        <button onClick={() => setActiveTab('webhooks')}
          className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${activeTab === 'webhooks' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
          <Globe size={13} className="inline mr-1.5" />
          Webhooks ({webhookEndpoints.length})
        </button>
      </div>

      {/* ── Services Tab ──────────────────────────────── */}
      {activeTab === 'services' && (
        <div className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredServices.map(service => (
              <ServiceCard key={service.id} service={service} onConfigure={setConfigureService} />
            ))}
          </div>
          {filteredServices.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-[13px]">No services match your search.</div>
          )}
        </div>
      )}

      {/* ── API Keys Tab ──────────────────────────────── */}
      {activeTab === 'apikeys' && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">API Keys</h3>
            <button onClick={() => showToast('info', 'Generate new API key (mock)')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white rounded-lg transition-colors"
              style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}>
              <Key size={12} /> Generate Key
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Name / Tenant</th>
                  <th className="text-left py-2.5 px-3 text-gray-400 font-medium">API Key</th>
                  <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Permissions</th>
                  <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Last Used</th>
                  <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Expires</th>
                  <th className="text-right py-2.5 px-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map(ak => (
                  <ApiKeyRow key={ak.id} apiKey={ak} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Webhooks Tab ──────────────────────────────── */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">{webhookEndpoints.length} webhook endpoints configured</span>
            <button onClick={() => showToast('info', 'Create new webhook endpoint (mock)')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white rounded-lg transition-colors"
              style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}>
              <Plus size={12} /> New Webhook
            </button>
          </div>
          <div className="space-y-2">
            {webhookEndpoints.map(wh => (
              <WebhookRow key={wh.id} webhook={wh} />
            ))}
          </div>
        </div>
      )}

      {/* ── Config Modal ──────────────────────────────── */}
      {configureService && (
        <ConfigModal service={configureService} onClose={() => setConfigureService(null)} />
      )}
    </div>
  )
}
