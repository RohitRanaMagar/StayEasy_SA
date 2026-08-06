import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Filter, ChevronLeft, ChevronRight, Plus,
  CheckCircle, XCircle, AlertCircle, Clock, RefreshCw, Download,
  DollarSign, Users, BarChart3, TrendingUp, Ban, Play,
  FileText, Mail, X, CreditCard,
} from 'lucide-react'
import { useToast } from '../../components/superadmin/Toast'
import AdvancedButton, { ConfirmDialog, ActionMenu, ExportButton } from '../../components/superadmin/AdvancedButton'
import { useAction } from '../../components/superadmin/useAction'
import type { Subscription, BillingInvoice } from '../../types/superadmin'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { PageTransition } from '../../components/superadmin/Animations'

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

const subStatusColors: Record<string, { text: string; bg: string }> = {
  active:    { text: 'text-emerald-700', bg: 'bg-emerald-100' },
  trialing:  { text: 'text-blue-700', bg: 'bg-blue-100' },
  past_due:  { text: 'text-orange-700', bg: 'bg-orange-100' },
  canceled:  { text: 'text-red-700', bg: 'bg-red-100' },
  paused:    { text: 'text-gray-600', bg: 'bg-gray-100' },
}

const invoiceStatusColors: Record<string, { text: string; bg: string }> = {
  paid:     { text: 'text-emerald-700', bg: 'bg-emerald-100' },
  pending:  { text: 'text-yellow-700', bg: 'bg-yellow-100' },
  failed:   { text: 'text-red-700', bg: 'bg-red-100' },
  refunded: { text: 'text-blue-700', bg: 'bg-blue-100' },
}

const planColorMap: Record<string, string> = {
  'Free Trial': '#6B7280',
  Basic: '#3B82F6',
  Professional: '#8B5CF6',
  Enterprise: '#F59E0B',
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function getDaysRemaining(endDate: string): { days: number; status: 'ok' | 'warning' | 'expired' } {
  const now = new Date()
  const end = new Date(endDate)
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { days: 0, status: 'expired' }
  if (diff <= 7) return { days: diff, status: 'warning' }
  return { days: diff, status: 'ok' }
}

// ═══════════════════════════════════════════════════════════════
// Subscriptions Table
// ═══════════════════════════════════════════════════════════════

function SubscriptionsTable({ subscriptions, onViewDetails, onSendEmail }:
  { subscriptions: Subscription[]; onViewDetails: (s: Subscription) => void; onSendEmail: (s: Subscription) => void }
) {
  const { showToast } = useToast()
  const pauseSubscription = useSuperAdminStore(s => s.pauseSubscription)
  const resumeSubscription = useSuperAdminStore(s => s.resumeSubscription)
  const upgradeSubscription = useSuperAdminStore(s => s.upgradeSubscription)
  const cancelSubscription = useSuperAdminStore(s => s.cancelSubscription)
  const storePlans = useSuperAdminStore(s => s.plans)
  const recalcDashboard = useSuperAdminStore(s => s.recalcDashboard)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const perPage = 6

  const filtered = subscriptions.filter(sub => {
    const matchesSearch = sub.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      sub.tenantEmail.toLowerCase().includes(search.toLowerCase()) ||
      sub.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const pageSubs = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Active Subscriptions</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search tenant..."
              className="pl-8 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-blue-300 w-full sm:w-48" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 outline-none">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
            <option value="paused">Paused</option>
          </select>
          <AdvancedButton variant="ghost" size="sm" icon={<Filter size={13} />}
            onClick={() => {}} tooltip="Apply filters" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Tenant</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Plan</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Status</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Billing</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Amount</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Next Payment</th>
              <th className="text-right py-2.5 px-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageSubs.length === 0 ? (
              <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-[13px]">No subscriptions found</td></tr>
            ) : (
              pageSubs.map(sub => {
                const sc = subStatusColors[sub.status]
                const daysRemaining = getDaysRemaining(sub.currentPeriodEnd)
                const planColor = planColorMap[sub.planName] || '#6B7280'
                return (
                  <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold text-white" style={{ background: planColor }}>
                          {sub.tenantName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-[12px] font-medium text-gray-800">{sub.tenantName}</div>
                          <div className="text-[10px] text-gray-400">{sub.tenantEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-semibold text-gray-700">{sub.planName}</span>
                        {sub.billingCycle === 'yearly' && (
                          <span className="px-1 py-0.5 rounded text-[8px] font-semibold bg-purple-100 text-purple-700 uppercase">Annual</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text}`}>
                        {sub.status === 'active' && <CheckCircle size={10} />}
                        {sub.status === 'trialing' && <Clock size={10} />}
                        {sub.status === 'past_due' && <AlertCircle size={10} />}
                        {sub.status === 'canceled' && <XCircle size={10} />}
                        {sub.status === 'paused' && <Play size={10} />}
                        {sub.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3"><span className="text-[11px] text-gray-600">{sub.paymentMethod}</span></td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-gray-800">{sub.price === 0 ? 'Free' : formatCurrency(sub.price, sub.currency)}</span>
                      <span className="text-[10px] text-gray-400 ml-0.5">/{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[11px] text-gray-600">{sub.currentPeriodEnd}</div>
                      <div className={`text-[10px] ${daysRemaining.status === 'expired' ? 'text-red-500' : daysRemaining.status === 'warning' ? 'text-orange-500' : 'text-gray-400'}`}>
                        {daysRemaining.status === 'expired' ? 'Expired' : `${daysRemaining.days} days remaining`}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <AdvancedButton variant="ghost" size="sm" icon={<FileText size={12} />}
                          onClick={() => onViewDetails(sub)} tooltip="View details" shortcut="⌘V" />
                        <AdvancedButton variant="ghost" size="sm" icon={<Mail size={12} />}
                          onClick={() => onSendEmail(sub)} tooltip="Send email" shortcut="⌘E" />
                        <ActionMenu
                          items={[
                            { label: 'Edit Plan', icon: <CreditCard size={12} />, onClick: () => onViewDetails(sub), shortcut: '⌘E' },
                            { label: sub.status === 'paused' ? 'Resume' : 'Pause', icon: sub.status === 'paused' ? <Play size={12} /> : <Ban size={12} />, variant: sub.status === 'paused' ? 'default' : 'danger', onClick: () => {
                              if (sub.status === 'paused') {
                                resumeSubscription(sub.id)
                                showToast('success', `Resumed ${sub.tenantName}`)
                              } else {
                                pauseSubscription(sub.id)
                                showToast('info', `Paused ${sub.tenantName}`)
                              }
                              recalcDashboard()
                            }, shortcut: '⌘P' },
                            { label: 'Upgrade Plan', icon: <TrendingUp size={12} />, onClick: () => {
                              const nextPlan = storePlans.find(p => p.name === 'Enterprise') || storePlans.find(p => p.name !== sub.planName)
                              if (nextPlan) {
                                upgradeSubscription(sub.id, nextPlan.id)
                                showToast('success', `${sub.tenantName} upgraded to ${nextPlan.name}`)
                                recalcDashboard()
                              }
                            }, shortcut: '⌘U' },
                            { label: 'Cancel Subscription', icon: <XCircle size={12} />, variant: 'danger', onClick: () => {
                              cancelSubscription(sub.id)
                              showToast('info', `${sub.tenantName}'s subscription canceled`)
                              recalcDashboard()
                            }, shortcut: '⌘X' },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-[11px] text-gray-400">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <AdvancedButton variant="ghost" size="sm" icon={<ChevronLeft size={13} />}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1} tooltip="Previous page" />
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4))
              const n = start + i
              if (n > totalPages) return null
              return (
                <AdvancedButton
                  key={n}
                  variant={n === page ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setPage(n)}
                  className={n === page ? '!w-7 !h-7 !p-0' : '!w-7 !h-7 !p-0'}
                >
                  {n}
                </AdvancedButton>
              )
            })}
            <AdvancedButton variant="ghost" size="sm" icon={<ChevronRight size={13} />}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages} tooltip="Next page" />
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Billing Invoices Table
// ═══════════════════════════════════════════════════════════════

function BillingInvoicesSection({ invoices }: { invoices: BillingInvoice[] }) {
  const [invoiceFilter, setInvoiceFilter] = useState<string>('all')
  const filtered = invoiceFilter === 'all' ? invoices : invoices.filter(inv => inv.status === invoiceFilter)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Billing History</h3>
        <div className="flex items-center gap-2">
          <select value={invoiceFilter} onChange={e => setInvoiceFilter(e.target.value)}
            className="text-[11px] border border-gray-200 rounded-lg px-2 py-1 text-gray-500 outline-none">
            <option value="all">All Invoices</option>
            <option value="paid">Paid</option><option value="pending">Pending</option>
            <option value="failed">Failed</option><option value="refunded">Refunded</option>
          </select>
          <ExportButton onExport={async () => {}} label="Export" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Invoice</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Tenant</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Plan</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Amount</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Status</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Date</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => {
              const sc = invoiceStatusColors[inv.status]
              return (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="py-2.5 px-3"><span className="text-[11px] font-mono text-gray-500">{inv.id}</span></td>
                  <td className="py-2.5 px-3 text-[12px] text-gray-700">{inv.tenantName}</td>
                  <td className="py-2.5 px-3 text-[12px] text-gray-600">{inv.planName}</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-800">{inv.amount === 0 ? 'Free' : formatCurrency(inv.amount, inv.currency)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${sc.bg} ${sc.text}`}>
                      {inv.status === 'paid' && <CheckCircle size={10} />}
                      {inv.status === 'pending' && <Clock size={10} />}
                      {inv.status === 'failed' && <XCircle size={10} />}
                      {inv.status === 'refunded' && <RefreshCw size={10} />}
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-[11px] text-gray-600">{inv.issuedAt}</div>
                    {inv.paidAt && <div className="text-[9px] text-gray-400">Paid: {inv.paidAt}</div>}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <AdvancedButton variant="ghost" size="sm" icon={<Download size={12} />}
                      onClick={async () => {}} tooltip="Download receipt" shortcut="⌘R" />
                  </td>
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
// Stats
// ═══════════════════════════════════════════════════════════════

function SubscriptionStats({ subscriptions, invoices }: { subscriptions: Subscription[]; invoices: BillingInvoice[] }) {
  const activeSubs = subscriptions.filter(s => s.status === 'active').length
  const mrr = subscriptions.filter(s => s.status === 'active' || s.status === 'trialing')
    .reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.price : s.price / 12), 0)
  const churnCount = subscriptions.filter(s => s.status === 'canceled').length
  const churnRate = subscriptions.length > 0 ? ((churnCount / subscriptions.length) * 100).toFixed(1) : '0'
  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-white rounded-lg border border-gray-100 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Users size={13} className="text-[#2E86AB]" />
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Active</span>
        </div>
        <div className="text-lg font-bold text-gray-900">{activeSubs}</div>
        <div className="text-[10px] text-gray-400 mt-0.5">of {subscriptions.length} total subs</div>
      </div>
      <div className="bg-white rounded-lg border border-gray-100 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <DollarSign size={13} className="text-emerald-500" />
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">MRR</span>
        </div>
        <div className="text-lg font-bold text-gray-900">{formatCurrency(mrr, 'USD')}</div>
        <div className="text-[10px] text-gray-400 mt-0.5">Monthly recurring revenue</div>
      </div>
      <div className="bg-white rounded-lg border border-gray-100 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <TrendingUp size={13} className="text-[#8B5CF6]" />
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Churn Rate</span>
        </div>
        <div className="text-lg font-bold text-gray-900">{churnRate}%</div>
        <div className="text-[10px] text-gray-400 mt-0.5">{churnCount} canceled</div>
      </div>
      <div className="bg-white rounded-lg border border-gray-100 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <BarChart3 size={13} className="text-[#F59E0B]" />
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Total Revenue</span>
        </div>
        <div className="text-lg font-bold text-gray-900">{formatCurrency(totalRevenue, 'USD')}</div>
        <div className="text-[10px] text-gray-400 mt-0.5">From paid invoices</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Plan Distribution
// ═══════════════════════════════════════════════════════════════

function PlanDistribution() {
  const navigate = useNavigate()
  const storePlans = useSuperAdminStore(s => s.plans)
  const planCounts = storePlans.filter(p => p.status === 'active').map(p => ({ name: p.name, count: p.activeSubscribers, color: planColorMap[p.name] || '#6B7280' }))
  const maxCount = Math.max(...planCounts.map(p => p.count))

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Plan Distribution</h3>
      <div className="space-y-3">
        {planCounts.map(plan => (
          <div key={plan.name}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-gray-600 font-medium">{plan.name}</span>
              <span className="text-gray-800 font-semibold">{plan.count}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(plan.count / maxCount) * 100}%`, background: plan.color }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
        <span>Total: {storePlans.reduce((s, p) => s + p.activeSubscribers, 0)} subscribers</span>
        <AdvancedButton variant="ghost" size="sm" onClick={() => navigate('/superadmin/plans')}>
          View details →
        </AdvancedButton>
      </div>
    </div>
  )
}
// ═══════════════════════════════════════════════════════════════
// Subscription Detail Modal
// ═══════════════════════════════════════════════════════════════

function SubscriptionDetailModal({ sub, open, onClose }: { sub: Subscription | null; open: boolean; onClose: () => void }) {
  if (!open || !sub) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Subscription Details</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={14} className="text-gray-400" /></button>
          </div>
          <div className="space-y-3 text-[12px]">
            <div className="flex justify-between"><span className="text-gray-400">Tenant</span><span className="font-medium text-gray-800">{sub.tenantName}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-gray-600">{sub.tenantEmail}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Plan</span><span className="font-semibold text-gray-800">{sub.planName}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Status</span><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${subStatusColors[sub.status].bg} ${subStatusColors[sub.status].text}`}>{sub.status}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Billing Cycle</span><span className="text-gray-600 capitalize">{sub.billingCycle}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Price</span><span className="font-semibold text-gray-800">{sub.price === 0 ? 'Free' : formatCurrency(sub.price, sub.currency)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Payment Method</span><span className="text-gray-600">{sub.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Started</span><span className="text-gray-600">{sub.startDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Period Ends</span><span className="text-gray-600">{sub.currentPeriodEnd}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Auto-Renew</span><span className={sub.autoRenew ? 'text-emerald-600 font-medium' : 'text-red-500'}>{sub.autoRenew ? 'Yes' : 'No'}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Page
// ═══════════════════════════════════════════════════════════════

export default function SubscriptionsPage() {
  const store = useSuperAdminStore()
  const subscriptions = useSuperAdminStore(s => s.subscriptions)
  const billingInvoicesData = useSuperAdminStore(s => s.billingInvoices)
  const plans = useSuperAdminStore(s => s.plans)
  const cancelSubscription = useSuperAdminStore(s => s.cancelSubscription)
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices'>('subscriptions')
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [showNewSub, setShowNewSub] = useState(false)
  const [suspendTarget, setSuspendTarget] = useState<Subscription | null>(null)
  const { showToast } = useToast()
  const navigate = useNavigate()
  const syncAction = useAction({ duration: 800 })

  const handleViewDetails = (sub: Subscription) => setSelectedSub(sub)
  const handleSendEmail = (sub: Subscription) => showToast('success', `Email sent to ${sub.tenantEmail}`)
  const handleSuspendConfirm = async () => {
    if (suspendTarget) {
      cancelSubscription(suspendTarget.id)
      showToast('info', `${suspendTarget.tenantName}'s subscription canceled`)
      store.recalcDashboard()
    }
    setSuspendTarget(null)
  }

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>Subscriptions</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">Manage tenant subscriptions, billing cycles, and invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <AdvancedButton
            variant="outline" size="md"
            icon={<RefreshCw size={13} />}
            loading={syncAction.loading}
            success={syncAction.success}
            error={syncAction.error}
            onClick={async () => {
              await syncAction.execute(async () => {
                await new Promise(r => setTimeout(r, 1200))
                showToast('success', 'Data synced successfully')
              })
            }}
            tooltip="Sync subscription data with payment gateway"
            shortcut="⌘S"
          >
            Sync
          </AdvancedButton>
          <AdvancedButton
            variant="primary" size="md"
            icon={<Plus size={13} />}
            onClick={() => setShowNewSub(true)}
            tooltip="Create a new subscription"
            shortcut="⌘N"
          >
            New Subscription
          </AdvancedButton>
        </div>
      </div>

      {/* Stats */}
      <SubscriptionStats subscriptions={subscriptions} invoices={billingInvoicesData} />

      {/* Two column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
        <div className="xl:col-span-3 space-y-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
            <AdvancedButton
              variant={activeTab === 'subscriptions' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('subscriptions')}
              className={activeTab === 'subscriptions' ? '!text-white' : ''}
            >
              Subscriptions
            </AdvancedButton>
            <AdvancedButton
              variant={activeTab === 'invoices' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('invoices')}
              className={activeTab === 'invoices' ? '!text-white' : ''}
            >
              Invoices
            </AdvancedButton>
          </div>

          {activeTab === 'subscriptions' ? (
            <SubscriptionsTable
              subscriptions={subscriptions}
              onViewDetails={handleViewDetails}
              onSendEmail={handleSendEmail}
            />
          ) : (
            <BillingInvoicesSection invoices={billingInvoicesData} />
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          <PlanDistribution />

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <AdvancedButton
                variant="ghost" size="lg"
                icon={<Ban size={14} className="text-red-400" />}
                onClick={() => showToast('info', 'Select a subscription to suspend')}
                className="!w-full !justify-start !px-3 !py-2.5 !rounded-lg"
              >
                Suspend Subscription
              </AdvancedButton>
              <AdvancedButton
                variant="ghost" size="lg"
                icon={<TrendingUp size={14} className="text-[#8B5CF6]" />}
                onClick={() => navigate('/superadmin/plans')}
                className="!w-full !justify-start !px-3 !py-2.5 !rounded-lg"
              >
                Upgrade Plan
              </AdvancedButton>
              <div className="w-full">
                <ExportButton
                  onExport={async () => { await new Promise(r => setTimeout(r, 800)) }}
                  label="Export Invoices"
                />
              </div>
              <AdvancedButton
                variant="ghost" size="lg"
                icon={<Mail size={14} className="text-[#F59E0B]" />}
                onClick={() => showToast('info', 'Reminder emails sent to all past-due tenants')}
                className="!w-full !justify-start !px-3 !py-2.5 !rounded-lg"
              >
                Send Reminders
              </AdvancedButton>
            </div>
          </div>

          {/* Payment Methods Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Methods</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-600">Visa</span><span className="font-medium text-gray-800">{subscriptions.filter(s => s.paymentMethod.includes('Visa')).length}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-600">Mastercard</span><span className="font-medium text-gray-800">{subscriptions.filter(s => s.paymentMethod.includes('Mastercard')).length}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-600">Amex</span><span className="font-medium text-gray-800">{subscriptions.filter(s => s.paymentMethod.includes('Amex')).length}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-600">Wire Transfer</span><span className="font-medium text-gray-800">{subscriptions.filter(s => s.paymentMethod.includes('Wire')).length}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
              <span>{subscriptions.filter(s => s.autoRenew).length} auto-renew</span>
              <AdvancedButton variant="ghost" size="sm" onClick={() => navigate('/superadmin/settings')}>
                Manage →
              </AdvancedButton>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SubscriptionDetailModal sub={selectedSub} open={selectedSub !== null} onClose={() => setSelectedSub(null)} />

      <ConfirmDialog
        open={suspendTarget !== null}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspendConfirm}
        title="Suspend Subscription"
        message={`Suspend ${suspendTarget?.tenantName}'s subscription?`}
        confirmLabel="Suspend"
        variant="danger"
        icon={<Ban size={18} className="text-red-500" />}
        details="They will lose access to all platform features until reactivated. This action cannot be undone automatically."
      />

      {showNewSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowNewSub(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Plus size={16} className="text-blue-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">New Subscription</h3>
              </div>
              <div className="space-y-3">
                <div><label className="text-[10px] text-gray-400 font-medium">Tenant</label>
                  <select className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-300 text-gray-700">
                    <option>Select tenant...</option>
                    {subscriptions.map(s => <option key={s.tenantId}>{s.tenantName}</option>)}
                  </select>
                </div>
                <div><label className="text-[10px] text-gray-400 font-medium">Plan</label>
                  <select className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-300 text-gray-700">
                    {plans.map(p => <option key={p.id}>{p.name} (${p.monthlyPrice}/mo)</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 justify-end">
                <AdvancedButton variant="outline" size="md" onClick={() => setShowNewSub(false)}>
                  Cancel
                </AdvancedButton>
                <AdvancedButton
                  variant="primary" size="md"
                  icon={<Plus size={12} />}
                  onClick={async () => {
                    await new Promise(r => setTimeout(r, 500))
                    showToast('success', 'New subscription created')
                    setShowNewSub(false)
                  }}
                >
                  Create Subscription
                </AdvancedButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  )
}
