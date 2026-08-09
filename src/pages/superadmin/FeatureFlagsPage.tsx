import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flag, Plus, Search, ChevronLeft,
  CheckCircle, XCircle, Globe, Users, Palette,
  ExternalLink, Edit, Trash2, Settings, Shield, Zap,
  AlertTriangle, RefreshCw, Eye, EyeOff, Loader2,
} from 'lucide-react'
import { useToast } from '../../components/superadmin/Toast'
import type { SuperAdminFeatureFlag, TenantBrandingConfig, FeatureFlagCategory, TenantFeatureOverride, FeatureFlagActivity } from '../../types/superadmin'

import { mockFeatureFlagCategories, mockFeatureFlagActivities } from '../../data/superAdminMockData'
const featureFlagCategories: FeatureFlagCategory[] = mockFeatureFlagCategories
const tenantFeatureOverrides: TenantFeatureOverride[] = []
const tenantBrandingConfigs: TenantBrandingConfig[] = []
const featureFlagActivities: FeatureFlagActivity[] = mockFeatureFlagActivities
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { PageTransition } from '../../components/superadmin/Animations'

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

const categoryIconMap: Record<string, typeof Flag> = {
  core: Zap,
  branding: Palette,
  integrations: Globe,
  compliance: Shield,
  experimental: AlertTriangle,
}

const categoryColorMap: Record<string, string> = {
  core: '#2E86AB',
  branding: '#8B5CF6',
  integrations: '#10B981',
  compliance: '#F59E0B',
  experimental: '#EF4444',
}

// ═══════════════════════════════════════════════════════════════
// Feature Flag Toggle Switch
// ═══════════════════════════════════════════════════════════════

function ToggleSwitch({ enabled, onChange, size = 'md' }: {
  enabled: boolean; onChange: () => void; size?: 'sm' | 'md' | 'lg'
}) {
  const dims = size === 'sm' ? 'w-8 h-4' : size === 'lg' ? 'w-12 h-6' : 'w-10 h-5'
  const knob = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  const offset = size === 'sm' ? 'left-[2px]' : size === 'lg' ? 'left-[2px]' : 'left-[2px]'
  const onOffset = size === 'sm' ? 'left-[14px]' : size === 'lg' ? 'left-[22px]' : 'left-[18px]'

  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={enabled}
      className={`relative ${dims} rounded-full transition-colors duration-200 ${enabled ? 'bg-[#1A5C7A]' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-[2px] ${knob} bg-white rounded-full shadow transition-all duration-200 ${enabled ? onOffset : offset}`} />
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
// Category Tab
// ═══════════════════════════════════════════════════════════════

function CategoryTabs({ active, onChange, featureFlags }: {
  active: string; onChange: (id: string) => void; featureFlags: SuperAdminFeatureFlag[]
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scroll-thin">
      <button
        onClick={() => onChange('all')}
        className={`px-3 py-1.5 text-[11px] font-medium rounded-lg whitespace-nowrap transition-all ${
          active === 'all' ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
        }`}
      >
        All Flags
      </button>
      {featureFlagCategories.map(cat => {
        const Icon = categoryIconMap[cat.id] || Flag
        const count = featureFlags.filter(f => f.category === cat.id).length
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg whitespace-nowrap transition-all ${
              active === cat.id
                ? 'text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
            style={active === cat.id ? { background: categoryColorMap[cat.id] } : {}}
          >
            <Icon size={12} />
            {cat.label}
            <span className="ml-0.5 opacity-60">({count})</span>
          </button>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Global Feature Flag Table
// ═══════════════════════════════════════════════════════════════

function FeatureFlagsTable({ flags, onToggle }: {
  flags: SuperAdminFeatureFlag[]; onToggle: (id: string) => void
}) {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [scopeFilter, setScopeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = flags.filter(f => {
    const matchesSearch = f.feature.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase())
    const matchesScope = scopeFilter === 'all' || f.scope === scopeFilter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'enabled' && f.status) ||
      (statusFilter === 'disabled' && !f.status)
    return matchesSearch && matchesScope && matchesStatus
  })

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Global Feature Flags</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex items-center flex-1 sm:flex-initial">
            <Search size={14} className="absolute left-3 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search flags..."
              className="pl-9 pr-10 py-2.5 text-[13px] bg-white border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2E86AB]/20 focus:border-[#2E86AB] shadow-md w-full sm:w-44"
            />
            <button className="absolute right-2 p-1.5 bg-[#2E86AB] text-white rounded-lg hover:bg-[#1a6b8a] transition-colors">
              <Search size={14} />
            </button>
          </div>
          <select
            value={scopeFilter}
            onChange={e => setScopeFilter(e.target.value)}
            className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 outline-none"
          >
            <option value="all">All Scope</option>
            <option value="global">Global</option>
            <option value="per-tenant">Per-Tenant</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Scope</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Rollout</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400 text-[13px]">
                  No feature flags found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map(flag => {
                const Icon = categoryIconMap[flag.category] || Flag
                const catColor = categoryColorMap[flag.category] || '#6B7280'
                const catLabel = featureFlagCategories.find(c => c.id === flag.category)?.label || flag.category

                return (
                  <tr key={flag.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${catColor}15` }}
                        >
                          <Icon size={14} style={{ color: catColor }} />
                        </div>
                        <div>
                          <div className="text-[12px] font-semibold text-gray-800">{flag.feature}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5 max-w-[300px] truncate">{flag.description}</div>
                          {flag.dependencies && flag.dependencies.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              {flag.dependencies.map(dep => (
                                <span key={dep} className="text-[8px] px-1 py-0.5 rounded bg-orange-50 text-orange-500 font-medium">
                                  Dep: {dep}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] text-gray-500">{catLabel}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        {flag.scope === 'global' ? (
                          <Globe size={11} className="text-[#2E86AB]" />
                        ) : (
                          <Users size={11} className="text-[#8B5CF6]" />
                        )}
                        <span className="text-[10px] text-gray-500 capitalize">{flag.scope}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <ToggleSwitch
                        enabled={flag.status}
                        onChange={() => onToggle(flag.id)}
                      />
                    </td>
                    <td className="py-3 px-3">
                      {flag.rolloutPercent !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${flag.rolloutPercent}%`, background: catColor }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-gray-500">{flag.rolloutPercent}%</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[10px] text-gray-400">{flag.updatedAt}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        {flag.docsUrl && (
                          <button onClick={() => window.open(flag.docsUrl, '_blank')}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="View docs">
                            <ExternalLink size={12} />
                          </button>
                        )}
                        <button onClick={() => showToast('info', `Edit flag: ${flag.feature} (mock)`)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Edit flag">
                          <Edit size={12} />
                        </button>
                        <button onClick={() => showToast('info', `Configure rollout for ${flag.feature} (mock)`)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Configure rollout">
                          <Settings size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <span className="text-[11px] text-gray-400">{filtered.length} of {flags.length} flags</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400">
            {flags.filter(f => f.status).length} enabled · {flags.filter(f => !f.status).length} disabled
          </span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Tenant Override Table
// ═══════════════════════════════════════════════════════════════

function TenantOverridesSection() {
  const { showToast } = useToast()
  const tenantOverrides = useSuperAdminStore(s => s.tenantOverrides)
  const removeOverride = useSuperAdminStore(s => s.removeOverride)
  const addOverride = useSuperAdminStore(s => s.addOverride)
  const flags = useSuperAdminStore(s => s.featureFlags)
  const tenants = useSuperAdminStore(s => s.tenants)
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null)

  // Group overrides by tenant
  const tenantOverridesMap = new Map<string, typeof tenantOverrides>()
  tenantOverrides.forEach(ovr => {
    const existing = tenantOverridesMap.get(ovr.tenantId) || []
    existing.push(ovr)
    tenantOverridesMap.set(ovr.tenantId, existing)
  })

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Tenant Feature Overrides</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Per-tenant feature flag overrides across {tenantOverridesMap.size} tenants</p>
        </div>
        <button onClick={() => {
          if (tenants.length > 0 && flags.length > 0) {
            const t = tenants[0]
            const f = flags.find(f => !f.status) || flags[0]
            addOverride({ tenantId: t.id, tenantName: t.name, flagId: f.id, flagName: f.feature, overrideValue: true, reason: 'Manual override', setBy: 'SuperAdmin' })
            showToast('success', `Override added for ${t.name} on "${f.feature}"`)
          } else {
            showToast('info', 'No tenants or flags available')
          }
        }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white rounded-lg transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}
        >
          <Plus size={12} /> Add Override
        </button>
      </div>

      <div className="divide-y divide-gray-50">
        {Array.from(tenantOverridesMap.entries()).map(([tenantId, overrides]) => {
          const isExpanded = expandedTenant === tenantId
          const enabledCount = overrides.filter(o => o.overrideValue).length
          const tenantName = overrides[0]?.tenantName || tenantId
          const config = tenantBrandingConfigs.find(c => c.tenantId === tenantId)

          return (
            <div key={tenantId}>
              <button
                onClick={() => setExpandedTenant(isExpanded ? null : tenantId)}
                className="w-full flex items-center justify-between p-3 px-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: config?.primaryColor || '#6B7280' }}
                  >
                    {tenantName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[12px] font-medium text-gray-800">{tenantName}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400">{overrides.length} overrides</span>
                      <span className="text-[10px] font-medium text-emerald-600">{enabledCount} enabled</span>
                      {config?.isWhiteLabel && (
                        <span className="px-1 py-0.5 rounded text-[8px] font-semibold bg-purple-100 text-purple-700">White Label</span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronLeft size={14} className={`text-gray-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 pl-14 space-y-1.5">
                  {overrides.map(ovr => (
                    <div key={ovr.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50/50">
                      <div className="flex items-center gap-2">
                        {ovr.overrideValue
                          ? <CheckCircle size={12} className="text-emerald-500" />
                          : <XCircle size={12} className="text-red-400" />
                        }
                        <span className="text-[11px] text-gray-700 font-medium">{ovr.flagName}</span>
                        <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${ovr.overrideValue ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {ovr.overrideValue ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-400">{ovr.reason}</span>
                        <button onClick={() => { removeOverride(ovr.id); showToast('info', `Override removed for ${ovr.flagName}`) }}
                          className="p-0.5 rounded hover:bg-gray-200 text-gray-300 hover:text-gray-500 transition-colors">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => showToast('info', `Add override for ${tenantName} (mock)`)}
                    className="flex items-center gap-1 text-[10px] text-[#2E86AB] hover:text-[#1A6B8A] transition-colors pt-1">
                    <Plus size={10} /> Add override for {tenantName}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// White Label / Branding Config Cards
// ═══════════════════════════════════════════════════════════════

function BrandingConfigCard({ config }: { config: TenantBrandingConfig }) {
  const { showToast } = useToast()
  const updateBranding = useSuperAdminStore(s => s.updateBranding)
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="p-3.5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
              style={{ background: config.primaryColor }}
            >
              {config.tenantName.charAt(0)}
            </div>
            <div>
              <span className="text-[12px] font-semibold text-gray-800">{config.tenantName}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {config.isWhiteLabel && (
                  <span className="px-1 py-0.5 rounded text-[8px] font-semibold bg-purple-100 text-purple-700">White Label</span>
                )}
                <span className="text-[9px] text-gray-400">Updated {config.updatedAt}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expanded ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>

        {/* Domain */}
        <div className="flex items-center gap-2 text-[11px] text-gray-600 mb-2">
          <Globe size={11} className="text-gray-300" />
          <span>{config.customDomain}</span>
        </div>

        {/* Color swatches */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] text-gray-400 mr-1">Brand Colors:</span>
          {[config.primaryColor, config.secondaryColor, config.accentColor].map((color, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
              style={{ background: color }}
              title={color}
            />
          ))}
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-gray-400">Logo:</span>
                <img src={config.logoUrl} alt="Logo" className="h-6 mt-1 object-contain" />
              </div>
              <div>
                <span className="text-gray-400">Font:</span>
                <div className="font-medium text-gray-600 mt-0.5">{config.fontFamily}</div>
              </div>
              <div>
                <span className="text-gray-400">Email From:</span>
                <div className="text-gray-600 mt-0.5 truncate">{config.customEmailFrom}</div>
              </div>
              <div>
                <span className="text-gray-400">Favicon:</span>
                <img src={config.faviconUrl} alt="Favicon" className="w-5 h-5 mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => {
                updateBranding(config.tenantId, { isWhiteLabel: true })
                showToast('success', `Branding updated for ${config.tenantName}`)
              }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium text-[#2E86AB] border border-[#2E86AB]/30 rounded-lg hover:bg-[#2E86AB]/5 transition-colors">
                <Edit size={10} /> Edit Branding
              </button>
              <button onClick={() => window.open(`https://${config.customDomain}`, '_blank')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <ExternalLink size={10} /> Preview Site
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Activity Log
// ═══════════════════════════════════════════════════════════════

function ActivityLogSection() {
  const navigate = useNavigate()
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Recent Flag Activity</h3>
        <button onClick={() => navigate('/superadmin/audit-logs')} className="text-[11px] font-medium text-[#2E86AB] hover:text-[#1A6B8A] transition-colors">View All →</button>
      </div>
      <div className="space-y-0">
        {featureFlagActivities.map((act, idx) => {
          const actionColors: Record<string, string> = {
            enabled: 'text-emerald-600 bg-emerald-50',
            disabled: 'text-red-600 bg-red-50',
            override_set: 'text-purple-600 bg-purple-50',
            override_removed: 'text-orange-600 bg-orange-50',
            created: 'text-blue-600 bg-blue-50',
            rollout_changed: 'text-yellow-600 bg-yellow-50',
          }
          const actionLabel: Record<string, string> = {
            enabled: 'Enabled',
            disabled: 'Disabled',
            override_set: 'Override Set',
            override_removed: 'Override Removed',
            created: 'Created',
            rollout_changed: 'Rollout Changed',
          }
          const colorClass = actionColors[act.action] || 'text-gray-600 bg-gray-50'

          return (
            <div key={act.id} className="relative pl-7 pb-4 last:pb-0">
              {idx < featureFlagActivities.length - 1 && (
                <div className="absolute left-[9px] top-3 bottom-0 w-px bg-gray-100" />
              )}
              <div className="absolute left-[5px] top-1.5 w-[9px] h-[9px] rounded-full border-2 border-white shadow-sm"
                style={{ background: colorClass.includes('emerald') ? '#10B981' : colorClass.includes('red') ? '#EF4444' : colorClass.includes('purple') ? '#8B5CF6' : colorClass.includes('orange') ? '#F59E0B' : colorClass.includes('blue') ? '#3B82F6' : colorClass.includes('yellow') ? '#F59E0B' : '#6B7280' }}
              />
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${colorClass}`}>
                  {actionLabel[act.action] || act.action}
                </span>
                <span className="text-[12px] font-medium text-gray-800">{act.flagName}</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">{act.details}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-gray-400">{act.performedAt}</span>
                <span className="text-[9px] text-gray-300">by {act.performedBy}</span>
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

export default function FeatureFlagsPage() {
  const { showToast } = useToast()
  const featureFlags = useSuperAdminStore(s => s.featureFlags)
  const toggleFlag = useSuperAdminStore(s => s.toggleFlag)
  const addFlag = useSuperAdminStore(s => s.addFlag)
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'branding'>('overview')
  const [syncing, setSyncing] = useState(false)

  const displayedFlags = activeCategory === 'all'
    ? featureFlags
    : featureFlags.filter(f => f.category === activeCategory)

  const handleSync = async () => {
    setSyncing(true)
    await new Promise(r => setTimeout(r, 800))
    setSyncing(false)
    showToast('success', 'Feature flags synced successfully')
  }

  const handleNewFlag = () => {
    addFlag({
      feature: 'New Feature', status: false,
      description: 'Description pending', updatedAt: new Date().toLocaleString(),
      category: 'experimental', scope: 'global', rolloutPercent: 0,
    })
    showToast('success', 'New feature flag created')
  }

  const totalEnabled = featureFlags.filter(f => f.status).length
  const brandingFlags = featureFlags.filter(f => f.category === 'branding')
  const brandingEnabled = brandingFlags.filter(f => f.status).length
  const whiteLabelTenants = tenantBrandingConfigs.filter(c => c.isWhiteLabel).length

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div className="flex items-center gap-2 sm:ml-auto">
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            {syncing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} {syncing ? 'Syncing...' : 'Sync'}
          </button>
          <button onClick={handleNewFlag}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-white rounded-lg transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}
          >
            <Plus size={13} /> New Flag
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Flag size={13} className="text-[#2E86AB]" />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Total Flags</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{featureFlags.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">{totalEnabled} enabled · {featureFlags.length - totalEnabled} disabled</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Palette size={13} className="text-[#8B5CF6]" />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Branding Flags</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{brandingEnabled}/{brandingFlags.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Branding & White Label features</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Users size={13} className="text-emerald-500" />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">White Label</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{whiteLabelTenants}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Tenants with white-label active</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle size={13} className="text-[#F59E0B]" />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Overrides</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{tenantFeatureOverrides.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Tenant-level overrides active</div>
        </div>
      </div>

      {/* ── Main / Branding Tabs ─────────────────────── */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${
            activeTab === 'overview' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Flag size={13} className="inline mr-1.5" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${
            activeTab === 'branding' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Palette size={13} className="inline mr-1.5" />
          Branding & White Label
        </button>
      </div>

      {/* ── Overview Tab ──────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Category Tabs */}
          <CategoryTabs active={activeCategory} onChange={setActiveCategory} featureFlags={featureFlags} />

          {/* Feature Flags Table */}
          <FeatureFlagsTable flags={displayedFlags} onToggle={toggleFlag} />

          {/* Two column: Tenant Overrides + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="xl:col-span-2">
              <TenantOverridesSection />
            </div>
            <div className="xl:col-span-1">
              <ActivityLogSection />
            </div>
          </div>
        </div>
      )}

      {/* ── Branding Tab ──────────────────────────────── */}
      {activeTab === 'branding' && (
        <div className="space-y-3">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-xl border border-purple-100 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <Palette size={18} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Branding & White Label Configuration</h3>
                <p className="text-[11px] text-gray-500 mt-1">
                  Manage custom domains, brand colors, logo uploads, and white-label settings for your tenants.
                  White-label removes all ServeIQ branding, giving tenants a fully customized experience.
                </p>
              </div>
            </div>
          </div>

          {/* White Label Flags */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Branding Feature Flags</h3>
            <div className="space-y-1">
              {featureFlags.filter(f => f.category === 'branding').map(flag => {
                const catColor = categoryColorMap.branding || '#6B7280'
                const deps = flag.dependencies || []
                return (
                  <div key={flag.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: flag.status ? catColor : '#D1D5DB' }} />
                      <div>
                        <div className="text-[12px] font-medium text-gray-800">{flag.feature}</div>
                        <div className="text-[10px] text-gray-400">{flag.description}</div>
                        {deps.length > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[8px] text-orange-500 font-medium">Requires:</span>
                            {deps.map(d => (
                              <span key={d} className="text-[8px] px-1 py-0.5 rounded bg-orange-50 text-orange-500">
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <ToggleSwitch enabled={flag.status} onChange={() => toggleFlag(flag.id)} size="sm" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active White Label Tenants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Active Branding Configurations</h3>
              <span className="text-[11px] text-gray-400">{tenantBrandingConfigs.length} tenants</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tenantBrandingConfigs.map(config => (
                <BrandingConfigCard key={config.tenantId} config={config} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  )
}
