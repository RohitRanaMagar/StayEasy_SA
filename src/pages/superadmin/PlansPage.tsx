import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Package, Check, X, Plus, Edit, Archive, DollarSign,
  Users, Home, Layers, Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useToast } from '../../components/superadmin/Toast'
import type { Plan, PlanChangeLog, PlanFeature } from '../../types/superadmin'
import {
  listPlans,
  createPlan,
  updatePlan,
  deletePlan,
  type PlanResponse,
  type CreatePlanRequest,
} from '../../services/superadminApi'

const planChangeLogs: PlanChangeLog[] = []
import { PageTransition } from '../../components/superadmin/Animations'

// ═══════════════════════════════════════════════════════════════
// API mapping (backend PlanResponse → UI Plan)
// The backend plan has no description / popular / color /
// subscriber-count fields, so those map to honest defaults.
// ═══════════════════════════════════════════════════════════════

const PLAN_COLORS = ['#2E86AB', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6']

function planColorFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return PLAN_COLORS[hash % PLAN_COLORS.length]
}

function toPlanFeatures(features: PlanResponse['features']): PlanFeature[] {
  if (!features || typeof features !== 'object') return []
  return Object.entries(features).map(([name, value]) => {
    if (typeof value === 'boolean') return { name, included: value }
    if (typeof value === 'string' || typeof value === 'number') {
      return { name, included: true, limit: String(value) }
    }
    if (value && typeof value === 'object') {
      const v = value as Record<string, unknown>
      return {
        name,
        included: typeof v.included === 'boolean' ? v.included : true,
        limit: typeof v.limit === 'string' ? v.limit : undefined,
      }
    }
    return { name, included: Boolean(value) }
  })
}

function toUiPlan(p: PlanResponse): Plan {
  const monthlyPrice = Number(p.price_monthly) || 0
  const yearlyPrice = p.price_yearly != null ? Number(p.price_yearly) || 0 : 0
  let createdAt = p.created_at
  const parsed = new Date(p.created_at)
  if (!Number.isNaN(parsed.getTime())) {
    createdAt = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: '',
    monthlyPrice,
    yearlyPrice,
    popular: false,
    color: planColorFor(p.id),
    features: toPlanFeatures(p.features),
    maxProperties: p.max_properties,
    maxRooms: p.max_rooms_per_property,
    maxUsers: p.max_staff,
    activeSubscribers: 0,
    status: p.is_active ? 'active' : 'archived',
    createdAt,
  }
}

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  return fallback
}

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

const planStatusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-gray-100 text-gray-500',
  'coming-soon': 'bg-blue-100 text-blue-700',
}

// ═══════════════════════════════════════════════════════════════
// Feature Row
// ═══════════════════════════════════════════════════════════════

function FeatureRow({ name, plans }: { name: string; plans: Plan[] }) {
  return (
    <div className="grid grid-cols-4 gap-2 py-2.5 border-b border-gray-50 items-center">
      <div className="text-[12px] text-gray-600 font-medium col-span-1">{name}</div>
      {plans.map(p => {
        const feat = p.features.find(f => f.name === name)
        return (
          <div key={p.id} className="flex items-center justify-center col-span-1">
            {feat?.included ? (
              <div className="flex items-center gap-1.5">
                <Check size={13} className="text-emerald-500" />
                {feat.limit && <span className="text-[10px] text-gray-400">{feat.limit}</span>}
              </div>
            ) : (
              <X size={13} className="text-gray-300" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Plan Comparison Table
// ═══════════════════════════════════════════════════════════════

function PlanComparisonTable({ plans }: { plans: Plan[] }) {
  const featureNames = plans[0]?.features.map(f => f.name) || []

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 overflow-x-auto">
      <div className="text-sm font-semibold text-gray-900 mb-3">Plan Comparison</div>
      {/* Header */}
      <div className="grid grid-cols-4 gap-2 pb-3 border-b border-gray-200">
        <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider col-span-1">Feature</div>
        {plans.map(p => (
          <div key={p.id} className="text-center col-span-1">
            <span className="text-[12px] font-semibold text-gray-700">{p.name}</span>
          </div>
        ))}
      </div>
      {/* Feature rows */}
      {featureNames.map(name => (
        <FeatureRow key={name} name={name} plans={plans} />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Plan Card
// ═══════════════════════════════════════════════════════════════

function PlanCard({ plan, onEdit, onArchive, isActive }: { plan: Plan; onEdit: (p: Plan) => void; onArchive: (p: Plan) => void; isActive?: boolean }) {
  const savings = plan.monthlyPrice > 0
    ? Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)
    : 0

  return (
    <div
      className={`relative bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
        isActive ? 'border-[#8B5CF6] shadow-md' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      {/* Popular badge */}
      {plan.popular && isActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}
        >
          Most Popular
        </div>
      )}

      {/* Status badge */}
      {plan.status !== 'active' && (
        <div className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${planStatusColors[plan.status]}`}>
          {plan.status}
        </div>
      )}

      <div className="p-5 pt-6">
        {/* Icon & Name */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${plan.color}15` }}>
            <Package size={15} style={{ color: plan.color }} />
          </div>
          <div>
            <div className="text-[14px] font-bold text-gray-900">{plan.name}</div>
            <div className="text-[10px] text-gray-400">{plan.activeSubscribers} subscribers</div>
          </div>
        </div>

        <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">{plan.description}</p>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
              {plan.monthlyPrice === 0 ? 'Free' : `$${plan.monthlyPrice}`}
            </span>
            {plan.monthlyPrice > 0 && <span className="text-[13px] text-gray-400">/month</span>}
          </div>
          {plan.yearlyPrice > 0 && (
            <div className="text-[11px] text-gray-400 mt-1">
              <span className="font-medium text-gray-600">${plan.yearlyPrice}</span>/year
              {savings > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-semibold">
                  Save {savings}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Limits */}
        <div className="space-y-1.5 mb-4 p-3 rounded-lg bg-gray-50/50">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400 flex items-center gap-1"><Home size={11} /> Properties</span>
            <span className="font-medium text-gray-700">{plan.maxProperties === -1 ? 'Unlimited' : plan.maxProperties}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400 flex items-center gap-1"><Layers size={11} /> Rooms</span>
            <span className="font-medium text-gray-700">{plan.maxRooms === -1 ? 'Unlimited' : plan.maxRooms}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400 flex items-center gap-1"><Users size={11} /> Staff Users</span>
            <span className="font-medium text-gray-700">{plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers}</span>
          </div>
        </div>

        {/* Feature checklist */}
        <div className="space-y-1.5 mb-4">
          {plan.features.slice(0, 6).map(f => (
            <div key={f.name} className="flex items-center gap-2 text-[11px]">
              {f.included
                ? <Check size={11} className="text-emerald-500 shrink-0" />
                : <X size={11} className="text-gray-300 shrink-0" />}
              <span className={f.included ? 'text-gray-600' : 'text-gray-400'}>{f.name}</span>
              {f.limit && <span className="text-[9px] text-gray-300 ml-auto">{f.limit}</span>}
            </div>
          ))}
          {plan.features.length > 6 && (
            <div className="text-[10px] text-gray-400 pt-1">+{plan.features.length - 6} more features</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(plan)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Edit size={12} /> Edit
          </button>
          {plan.status === 'active' && (
            <button
              onClick={() => onArchive(plan)}
              className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
              title="Archive plan"
            >
              <Archive size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Plan Editor Modal
// ═══════════════════════════════════════════════════════════════

function PlanEditorModal({ plan, onClose, onSave }: { plan: Plan | null; onClose: () => void; onSave?: (p: Plan, data: Partial<Plan>) => void | Promise<void> }) {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(plan?.name || '')
  const [desc] = useState(plan?.description || '')
  const [monthlyPrice, setMonthlyPrice] = useState(plan?.monthlyPrice || 0)
  const [yearlyPrice, setYearlyPrice] = useState(plan?.yearlyPrice || 0)
  const [maxProps, setMaxProps] = useState(plan?.maxProperties === -1 ? -1 : plan?.maxProperties || 0)

  if (!plan) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave?.(plan, { name, monthlyPrice, yearlyPrice, maxProperties: maxProps })
      onClose()
    } catch {
      // Parent mutation already toasted the error; keep the modal open.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${plan.color}15` }}>
              <Package size={18} style={{ color: plan.color }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Edit Plan: {plan.name}</h3>
              <p className="text-[11px] text-gray-400">Configure plan details, pricing, and features</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-gray-400 font-medium mb-1 uppercase tracking-wider">Plan Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 font-medium mb-1 uppercase tracking-wider">Slug</label>
              <input defaultValue={plan.slug} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors bg-gray-50 text-gray-400" disabled />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-[11px] text-gray-400 font-medium mb-2 uppercase tracking-wider">Pricing</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input value={monthlyPrice} onChange={e => setMonthlyPrice(Number(e.target.value))} type="number" className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">/month</span>
              </div>
              <div className="relative">
                <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input value={yearlyPrice} onChange={e => setYearlyPrice(Number(e.target.value))} type="number" className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">/year</span>
              </div>
            </div>
          </div>

          {/* Limits */}
          <div>
            <label className="block text-[11px] text-gray-400 font-medium mb-2 uppercase tracking-wider">Limits</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-gray-400 block mb-1">Max Properties</span>
                <input value={maxProps === -1 ? 'Unlimited' : maxProps} onChange={e => setMaxProps(e.target.value === 'Unlimited' ? -1 : Number(e.target.value))} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block mb-1">Max Rooms</span>
                <input defaultValue={plan.maxRooms === -1 ? 'Unlimited' : plan.maxRooms} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block mb-1">Max Users</span>
                <input defaultValue={plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors" />
              </div>
            </div>
          </div>

          {/* Features Toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Features</label>
              <span className="text-[10px] text-gray-300">{plan.features.filter(f => f.included).length}/{plan.features.length} enabled</span>
            </div>
            <div className="space-y-1">
              {plan.features.map((feat) => (
                <label key={feat.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={feat.included}
                      className="rounded border-gray-300 text-brand-accent focus:ring-brand-accent/30"
                    />
                    <span className="text-[12px] text-gray-600">{feat.name}</span>
                  </div>
                  {feat.limit && (
                    <span className="text-[10px] text-gray-400">{feat.limit}</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Description (not supported by the API — displayed disabled so edits are never silently dropped) */}
          <div>
            <label className="block text-[11px] text-gray-400 font-medium mb-1 uppercase tracking-wider">Description</label>              <textarea
              value={desc}
              rows={2}
              disabled
              title="Description is not supported by the API"
              className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none resize-none bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-400 mt-1">Not supported by the API — changes here are not saved.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-100">
          <div className="text-[11px] text-gray-400">Created: {plan.createdAt}</div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} disabled={saving} className="px-4 py-2 text-[12px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-[12px] font-semibold text-white rounded-lg transition-all active:scale-95 disabled:opacity-60 flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}
            >
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Plan Change Log Timeline
// ═══════════════════════════════════════════════════════════════

function PlanChangeLogSection() {
  const navigate = useNavigate()
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Recent Plan Changes</h3>
        <button onClick={() => navigate('/superadmin/audit-logs')} className="text-[11px] font-medium text-blue-600 hover:text-blue-700">View All →</button>
      </div>
      <div className="space-y-0">
        {planChangeLogs.map((log, idx) => (
          <div key={log.id} className="relative pl-6 pb-4 last:pb-0">
            {idx < planChangeLogs.length - 1 && (
              <div className="absolute left-[7px] top-3 bottom-0 w-px bg-gray-100" />
            )}
            <div className="absolute left-[3px] top-1.5 w-[9px] h-[9px] rounded-full bg-[#2E86AB] ring-2 ring-white" />
            <div className="text-[12px] font-medium text-gray-700">
              <span className="font-semibold">{log.tenantName}</span>
              {log.toPlan === '—' ? ' canceled' : ` upgraded from ${log.fromPlan} → ${log.toPlan}`}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{log.changedAt} · by {log.changedBy}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{log.reason}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function PlansPage() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const plansQuery = useQuery({
    queryKey: ['sa-plans'],
    queryFn: () => listPlans({ include_inactive: true }),
  })
  const plans: Plan[] = useMemo(
    () => (plansQuery.data?.plans ?? []).map(toUiPlan),
    [plansQuery.data],
  )

  const invalidatePlans = () => queryClient.invalidateQueries({ queryKey: ['sa-plans'] })

  const createMut = useMutation({
    mutationFn: (payload: CreatePlanRequest) => createPlan(payload),
    onSuccess: () => {
      void invalidatePlans()
      showToast('success', 'New plan created')
    },
    onError: (err) => showToast('error', apiErrorMessage(err, 'Failed to create plan')),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updatePlan>[1] }) =>
      updatePlan(id, payload),
    onSuccess: () => {
      void invalidatePlans()
      showToast('success', 'Plan updated successfully')
    },
    onError: (err) => showToast('error', apiErrorMessage(err, 'Failed to update plan')),
  })
  const deactivateMut = useMutation({
    mutationFn: (id: string) => deletePlan(id),
    onSuccess: (_data, id) => {
      void invalidatePlans()
      const name = plans.find(p => p.id === id)?.name ?? 'Plan'
      showToast('info', `"${name}" deactivated`)
    },
    onError: (err) => showToast('error', apiErrorMessage(err, 'Failed to deactivate plan')),
  })

  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [activeIndex, setActiveIndex] = useState(0)

  const activePlans = plans.filter(p => p.status === 'active')
  const visiblePlans = plans.filter(p => p.status !== 'archived')

  const popularIdx = visiblePlans.findIndex(p => p.popular)
  const popularKey = visiblePlans.map(p => `${p.id}:${p.popular}`).join('|')
  const carouselInit = useRef(false)
  useEffect(() => {
    if (!carouselInit.current && popularIdx >= 0) {
      setActiveIndex(popularIdx)
      carouselInit.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popularKey])
  const safeIndex = visiblePlans.length === 0 ? 0 : Math.min(activeIndex, visiblePlans.length - 1)

  // NOTE: backend exposes no subscriber data, so subscriber/MRR metrics render as unavailable below.

  const goTo = (idx: number) => {
    if (idx < 0) setActiveIndex(visiblePlans.length - 1)
    else if (idx >= visiblePlans.length) setActiveIndex(0)
    else setActiveIndex(idx)
  }

  const handleSave = (plan: Plan, data: Partial<Plan>) => {
    // The backend plan has no description field — only persistable fields are sent.
    return updateMut.mutateAsync({
      id: plan.id,
      payload: {
        name: data.name ?? plan.name,
        price_monthly: data.monthlyPrice ?? plan.monthlyPrice,
        price_yearly: data.yearlyPrice ?? plan.yearlyPrice,
        max_properties: data.maxProperties ?? plan.maxProperties,
      },
    }).then(() => undefined)
  }

  const handleArchive = (plan: Plan) => {
    deactivateMut.mutate(plan.id)
  }

  const handleCreate = () => {
    createMut.mutate({
      name: 'New Plan',
      slug: `new-plan-${Date.now()}`,
      price_monthly: 0,
      price_yearly: 0,
      max_properties: 10,
      max_rooms_per_property: 50,
      max_staff: 3,
      features: {},
    })
  }

  const isLoading = plansQuery.isLoading
  const isError = plansQuery.isError

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div className="flex items-center gap-2 sm:ml-auto">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                viewMode === 'cards' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                viewMode === 'table' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Compare
            </button>
          </div>
          <button
            onClick={handleCreate}
            disabled={createMut.isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-white rounded-lg transition-all active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}
          >
            {createMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} New Plan
          </button>
        </div>
      </div>

      {/* ── Quick Stats ────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="text-lg font-bold text-gray-900">{plans.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Total Plans</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="text-lg font-bold text-gray-900">—</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Active Subscribers</div>
          <div className="text-[9px] text-gray-300 mt-0.5">Unavailable — no backend data</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="text-lg font-bold text-gray-900">—</div>
          <div className="text-[10px] text-gray-400 mt-0.5">MRR from Plans</div>
          <div className="text-[9px] text-gray-300 mt-0.5">Unavailable — no backend data</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="text-lg font-bold text-emerald-600">
            {activePlans.filter(p => p.popular).map(p => p.name).join(', ') || 'None'}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Popular Plan</div>
        </div>
      </div>

      {/* ── Plan Cards / Table ─────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 w-24 bg-gray-100 rounded mb-3" />
              <div className="h-8 w-32 bg-gray-100 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-5/6 bg-gray-100 rounded" />
                <div className="h-3 w-4/6 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-red-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="text-[12px] text-red-600 font-medium">Failed to load plans. Check your connection and try again.</div>
          <button
            onClick={() => void plansQuery.refetch()}
            className="px-3 py-1.5 text-[12px] font-medium text-white rounded-lg transition-colors shrink-0"
            style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}
          >
            Retry
          </button>
        </div>
      ) : visiblePlans.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <div className="text-sm font-semibold text-gray-900 mb-1">No plans found</div>
          <p className="text-[12px] text-gray-400 mb-4">Create your first plan to get started.</p>
          <button
            onClick={handleCreate}
            disabled={createMut.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-white rounded-lg transition-all active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}
          >
            {createMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} New Plan
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="relative">
          {/* Carousel Container */}
          <div className="overflow-hidden py-4">
            <div
              className="flex items-center justify-center gap-4 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(calc(50% - ${(safeIndex * 316) + 150}px))` }}
            >
              {visiblePlans.map((plan, i) => {
                const isActive = i === safeIndex
                const distance = Math.abs(i - safeIndex)
                const scale = isActive ? 1 : Math.max(0.85, 1 - distance * 0.05)
                const opacity = isActive ? 1 : Math.max(0.4, 1 - distance * 0.3)
                const zIndex = isActive ? 10 : 5 - distance

                return (
                  <div
                    key={plan.id}
                    className="shrink-0 transition-all duration-500 ease-out cursor-pointer"
                    style={{
                      width: 300,
                      transform: `scale(${scale})`,
                      opacity,
                      zIndex,
                    }}
                    onClick={() => setActiveIndex(i)}
                  >
                    <PlanCard plan={plan} onEdit={setEditingPlan} onArchive={handleArchive} isActive={isActive} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => goTo(safeIndex - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 hover:shadow-lg transition-all z-20"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => goTo(safeIndex + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 hover:shadow-lg transition-all z-20"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {visiblePlans.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === safeIndex
                    ? 'w-6 h-2 bg-[#2E86AB]'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <PlanComparisonTable plans={plans.filter(p => p.status === 'active')} />
        </div>
      )}

      {/* ── Plan Change Log ────────────────────────────── */}
      <PlanChangeLogSection />

      {/* ── Plan Editor Modal ──────────────────────────── */}
      {editingPlan && (
        <PlanEditorModal plan={editingPlan} onClose={() => setEditingPlan(null)} onSave={handleSave} />
      )}
    </div>
    </PageTransition>
  )
}
