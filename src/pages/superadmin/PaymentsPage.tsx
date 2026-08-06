import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign, CreditCard, TrendingUp, Search,
  ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight,
  CheckCircle, XCircle, Clock, RefreshCw, Download,
  Ban, FileText, Mail, MoreHorizontal, Percent,
} from 'lucide-react'
import { useToast } from '../../components/superadmin/Toast'
import AdvancedButton, { ConfirmDialog } from '../../components/superadmin/AdvancedButton'
import { useAction } from '../../components/superadmin/useAction'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { PageTransition } from '../../components/superadmin/Animations'
import type { PaymentTransaction, PaymentRefund, MonthlyRevenueBreakdown } from '../../types/superadmin'

import { mockMonthlyRevenueBreakdown } from '../../data/superAdminMockData'
const monthlyRevenueBreakdown: MonthlyRevenueBreakdown[] = mockMonthlyRevenueBreakdown
const gatewayBreakdown: Record<string, { label: string; total: number; count: number; fee: number }> = {
  stripe: { label: 'Stripe', total: 28490, count: 9, fee: 842.12 },
  razorpay: { label: 'Razorpay', total: 9860, count: 4, fee: 268.4 },
  wire: { label: 'Wire Transfer', total: 9900, count: 3, fee: 287.6 },
}

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

const txnStatusColors: Record<string, { text: string; bg: string; icon: typeof CheckCircle }> = {
  succeeded: { text: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
  failed:    { text: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
  pending:   { text: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
  refunded:  { text: 'text-blue-700', bg: 'bg-blue-100', icon: RefreshCw },
}

const refStatusColors: Record<string, string> = {
  completed: 'text-emerald-600 bg-emerald-100',
  pending:   'text-yellow-600 bg-yellow-100',
  failed:    'text-red-600 bg-red-100',
}

const gatewayColors: Record<string, string> = {
  stripe:   '#8B5CF6',
  razorpay: '#2E86AB',
  wire:     '#10B981',
  other:    '#6B7280',
}

// ═══════════════════════════════════════════════════════════════
// Stat Card
// ═══════════════════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, sub, color = '#2E86AB', trend }: {
  icon: typeof DollarSign; label: string; value: string; sub?: string; color?: string; trend?: { value: string; up: boolean }
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
// Revenue Chart (SVG)
// ═══════════════════════════════════════════════════════════════

function RevenueChart({ data }: { data: MonthlyRevenueBreakdown[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: 140 }}>
        <span className="text-[11px] text-gray-400">No revenue data</span>
      </div>
    )
  }
  const maxNet = Math.max(...data.map(d => d.net))
  const minNet = Math.min(...data.map(d => d.net))
  const range = maxNet - minNet || 1
  const w = 700, h = 200, pad = { t: 20, r: 16, b: 34, l: 50 }
  const chartW = w - pad.l - pad.r
  const chartH = h - pad.t - pad.b

  const points = data.map((d, i) => ({
    x: pad.l + (i / (data.length - 1)) * chartW,
    y: pad.t + (1 - (d.net - minNet) / range) * chartH,
  }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${h - pad.b} L ${points[0].x} ${h - pad.b} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 140 }}>
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E86AB" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#2E86AB" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = pad.t + f * chartH
        const val = maxNet - f * range
        return (
          <g key={f}>
            <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="#f0f0f0" strokeDasharray="4 4" />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" className="fill-gray-400" fontSize={10}>
              ${(val / 1000).toFixed(1)}K
            </text>
          </g>
        )
      })}
      {/* Area + Line */}
      <path d={areaPath} fill="url(#revGrad)" />
      <path d={linePath} fill="none" stroke="#2E86AB" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#2E86AB" stroke="white" strokeWidth={2} />
          <text x={p.x} y={p.y - 12} textAnchor="middle" className="fill-gray-500" fontSize={9} fontWeight={600}>
            ${(data[i].net / 1000).toFixed(1)}K
          </text>
        </g>
      ))}
      {/* X labels */}
      {data.map((d, i) => (
        <text key={i} x={points[i]?.x || 0} y={h - 6} textAnchor="middle" className="fill-gray-400" fontSize={9}>
          {d.month.split(' ')[0]}
        </text>
      ))}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// Transactions Table
// ═══════════════════════════════════════════════════════════════

function TransactionsTable({ transactions }: { transactions: PaymentTransaction[] }) {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 8

  const filtered = transactions.filter(tx => {
    const matchesSearch = tx.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.description.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const pageTxns = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-900">All Transactions</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search transactions..."
              className="pl-8 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-blue-300 w-full sm:w-48"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
          <button onClick={() => showToast('success', 'Transactions exported')}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download size={13} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Transaction</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Tenant</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Gateway</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Amount</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Fee</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Net</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Status</th>
              <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Date</th>
              <th className="text-right py-2.5 px-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageTxns.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400 text-[13px]">No transactions found</td>
              </tr>
            ) : (
              pageTxns.map(tx => {
                const sc = txnStatusColors[tx.status]
                const StatusIcon = sc.icon
                return (
                  <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-mono text-gray-500">{tx.id}</span>
                      <div className="text-[10px] text-gray-400 mt-0.5 max-w-[140px] truncate" title={tx.description}>
                        {tx.description}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[12px] font-medium text-gray-800">{tx.tenantName}</div>
                      <div className="text-[9px] text-gray-400">{tx.planName}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: gatewayColors[tx.gateway] || '#6B7280' }} />
                        <span className="text-[10px] text-gray-500 capitalize">{tx.gateway}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-gray-800">
                      {tx.amount === 0 ? 'Free' : formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="py-3 px-3 text-gray-500">{tx.fee === 0 ? '—' : formatCurrency(tx.fee, tx.currency)}</td>
                    <td className="py-3 px-3 font-medium text-gray-700">{tx.net === 0 ? '—' : formatCurrency(tx.net, tx.currency)}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <StatusIcon size={11} className={sc.text} />
                        <span className={`text-[11px] font-medium capitalize ${sc.text}`}>{tx.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[10px] text-gray-400 whitespace-nowrap">{tx.createdAt}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => showToast('info', `View details for ${tx.id}`)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="View details">
                          <FileText size={12} />
                        </button>
                        <button onClick={() => showToast('info', `More actions for ${tx.id}`)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="More">
                          <MoreHorizontal size={12} />
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

      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-[11px] text-gray-400">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
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
  )
}

// ═══════════════════════════════════════════════════════════════
// Refunds Section
// ═══════════════════════════════════════════════════════════════

function RefundsSection({ refunds }: { refunds: PaymentRefund[] }) {
  const navigate = useNavigate()
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Recent Refunds</h3>
        <button onClick={() => navigate('/superadmin/payments')} className="text-[11px] font-medium text-[#2E86AB] hover:text-[#1A6B8A] transition-colors">View All →</button>
      </div>
      <div className="divide-y divide-gray-50">
        {refunds.map(ref => (
          <div key={ref.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold text-white bg-red-400 shrink-0">
                  R
                </div>
                <div>
                  <div className="text-[12px] font-medium text-gray-800">{ref.tenantName}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{ref.reason}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${refStatusColors[ref.status]}`}>
                      {ref.status}
                    </span>
                    <span className="text-[9px] text-gray-400">{ref.createdAt}</span>
                    {ref.processedAt && <span className="text-[9px] text-gray-300">Processed: {ref.processedAt}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold text-red-500 text-[13px]">-{formatCurrency(ref.amount, ref.currency)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Gateway Breakdown
// ═══════════════════════════════════════════════════════════════

function GatewayBreakdownSection() {
  const payoutInfo = useSuperAdminStore(s => s.payoutSummary)
  const gateways = Object.entries(gatewayBreakdown)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Gateways</h3>
      <div className="space-y-3">
        {gateways.map(([key, gw]) => {
          const color = gatewayColors[key] || '#6B7280'
          const pct = payoutInfo.totalRevenue > 0 ? (gw.total / payoutInfo.totalRevenue) * 100 : 0
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-[12px] font-medium text-gray-700">{gw.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-semibold text-gray-800">{formatCurrency(gw.total)}</span>
                  <span className="text-[10px] text-gray-400 ml-2">({gw.count} txns)</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
              <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
                <span>Fees: {formatCurrency(gw.fee)}</span>
                <span>{pct.toFixed(1)}% of revenue</span>
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

export default function PaymentsPage() {
  const store = useSuperAdminStore()
  const transactions = useSuperAdminStore(s => s.transactions)
  const refunds = useSuperAdminStore(s => s.refunds)
  const payoutInfo = useSuperAdminStore(s => s.payoutSummary)
  const processRefund = useSuperAdminStore(s => s.processRefund)
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'transactions' | 'refunds'>('transactions')
  const syncAction = useAction({ duration: 1200 })
  const exportAction = useAction({ duration: 800 })

  const succeededCount = transactions.filter(t => t.status === 'succeeded').length
  const failedCount = transactions.filter(t => t.status === 'failed').length
  const totalFees = transactions.reduce((s, t) => s + t.fee, 0)
  const totalRefunded = refunds
    .filter(r => r.status === 'completed')
    .reduce((s, r) => s + r.amount, 0)

  const [confirmRefund, setConfirmRefund] = useState<PaymentTransaction | null>(null)

  const handleGenerateInvoice = () => {
    const sub = store.subscriptions?.[0]
    if (!sub) {
      showToast('error', 'No subscriptions available')
      return
    }
    store.generateInvoice(sub.id)
    showToast('success', `Invoice generated for ${sub.tenantName}`)
  }

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 sm:ml-auto">
          <AdvancedButton
            variant="outline" size="md"
            icon={<Download size={13} />}
            loading={exportAction.loading}
            success={exportAction.success}
            error={exportAction.error}
            onClick={async () => {
              await exportAction.execute(async () => {
                await new Promise(r => setTimeout(r, 800))
                showToast('success', 'Report exported')
              })
            }}
            tooltip="Export payment report as CSV"
            shortcut="⌘E"
          >
            Export Report
          </AdvancedButton>
          <AdvancedButton
            variant="primary" size="md"
            icon={<RefreshCw size={13} />}
            loading={syncAction.loading}
            success={syncAction.success}
            error={syncAction.error}
            onClick={async () => {
              await syncAction.execute(async () => {
                await new Promise(r => setTimeout(r, 1200))
                showToast('success', 'Payments synced with gateway')
              })
            }}
            tooltip="Sync transactions with payment gateway"
            shortcut="⌘S"
          >
            Sync
          </AdvancedButton>
        </div>
      </div>

      {/* ── Key Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(payoutInfo.totalRevenue)}
          sub="Gross revenue before fees" color="#10B981" />
        <StatCard icon={TrendingUp} label="Net Revenue" value={formatCurrency(payoutInfo.netRevenue)}
          sub={`${formatCurrency(totalFees)} in fees deducted`} color="#2E86AB" />
        <StatCard icon={Ban} label="Refunds" value={formatCurrency(payoutInfo.totalRefunds)}
          sub={`${refunds.filter(r => r.status === 'completed').length} completed`} color="#EF4444" trend={{ value: '↑ 2 new this month', up: false }} />
        <StatCard icon={Clock} label="Pending Payout" value={formatCurrency(payoutInfo.pendingPayout)}
          sub={`${payoutInfo.pendingTransactions} pending txns`} color="#F59E0B" />
        <StatCard icon={Percent} label="Avg. Fee Rate" value={`${((totalFees / payoutInfo.totalRevenue) * 100).toFixed(2)}%`}
          sub="Gateway + processing fees" color="#8B5CF6" />
        <StatCard icon={CheckCircle} label="Success Rate" value={`${((succeededCount / (succeededCount + failedCount)) * 100).toFixed(1)}%`}
          sub={`${succeededCount} succeeded · ${failedCount} failed`} color="#3B82F6" />
      </div>

      {/* ── Revenue Chart ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Revenue Trend — Net MRR</h3>
          <select className="text-[11px] border border-gray-200 rounded-lg px-2 py-1 text-gray-500 outline-none">
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
            <option>Year to Date</option>
          </select>
        </div>
        <RevenueChart data={monthlyRevenueBreakdown} />
      </div>

      {/* ── Two-column layout ──────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
        {/* Main */}
        <div className="xl:col-span-3 space-y-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                activeTab === 'transactions' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <CreditCard size={13} className="inline mr-1.5" />
              Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('refunds')}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                activeTab === 'refunds' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Ban size={13} className="inline mr-1.5" />
              Refunds ({refunds.length})
            </button>
          </div>

          {activeTab === 'transactions' ? (
            <TransactionsTable transactions={transactions} />
          ) : (
            <RefundsSection refunds={refunds} />
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          <GatewayBreakdownSection />

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={handleGenerateInvoice}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
                <FileText size={14} className="text-[#2E86AB]" />
                Generate Invoice
              </button>
              <button onClick={() => {
                const txn = transactions.find(t => t.status === 'succeeded')
                if (txn) setConfirmRefund(txn)
                else showToast('error', 'No successful transaction available for refund')
              }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
                <Ban size={14} className="text-red-400" />
                Issue Refund
              </button>
              <button onClick={async () => {
                await new Promise(r => setTimeout(r, 500))
                showToast('success', 'Report downloaded')
              }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
                <Download size={14} className="text-[#8B5CF6]" />
                Download Report
              </button>
              <button onClick={() => showToast('success', 'Receipt sent to tenant')}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
                <Mail size={14} className="text-[#F59E0B]" />
                Send Receipt
              </button>
            </div>
          </div>

          {/* Revenue Share */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Revenue Snapshot</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-500">Subscriptions</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(monthlyRevenueBreakdown.reduce((s, m) => s + m.subscriptions, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-500">One-time Fees</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(monthlyRevenueBreakdown.reduce((s, m) => s + m.oneTime, 0))}
                </span>
              </div>
              <div className="border-t border-gray-100 my-1" />
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-600 font-medium">Gross Revenue</span>
                <span className="font-semibold text-gray-900">{formatCurrency(payoutInfo.totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-500">Fees</span>
                <span className="text-red-500">-{formatCurrency(totalFees)}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-500">Refunds</span>
                <span className="text-red-500">-{formatCurrency(totalRefunded)}</span>
              </div>
              <div className="border-t border-gray-100 my-1" />
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-gray-900">Net Revenue</span>
                <span className="font-bold text-emerald-600">{formatCurrency(payoutInfo.netRevenue)}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50 text-[10px] text-gray-400">
              Last payout: {formatCurrency(payoutInfo.lastPayoutAmount)} on {payoutInfo.lastPayoutDate}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Refund Confirmation */}
      <ConfirmDialog
        open={confirmRefund !== null}
        onClose={() => setConfirmRefund(null)}
        onConfirm={async () => {
          if (confirmRefund) {
            processRefund({
              transactionId: confirmRefund.id,
              tenantName: confirmRefund.tenantName,
              amount: confirmRefund.amount,
              currency: confirmRefund.currency,
              reason: 'Customer request',
              status: 'completed',
              createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            })
            showToast('success', `Refund of $${confirmRefund.amount} issued to ${confirmRefund.tenantName}`)
            store.recalcDashboard()
          }
          setConfirmRefund(null)
        }}
        title="Issue Refund"
        message={`Issue a refund to ${confirmRefund?.tenantName} for ${confirmRefund ? formatCurrency(confirmRefund.amount, confirmRefund.currency) : ''}?`}
        confirmLabel="Issue Refund"
        variant="danger"
        icon={<Ban size={18} className="text-red-500" />}
        details="This action will process the refund immediately. The amount will be returned to the customer's original payment method."
      />
    </PageTransition>
  )
}
