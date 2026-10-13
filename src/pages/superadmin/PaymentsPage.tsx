import { useState } from 'react'
import {
  DollarSign, TrendingUp, Clock, RotateCcw,
  Search, Download, ChevronDown,
  CreditCard, Banknote, ArrowUpRight, ArrowDownRight,
  CheckCircle, XCircle, ExternalLink,
} from 'lucide-react'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { useToast } from '../../components/superadmin/Toast'
import { PageTransition } from '../../components/superadmin/Animations'

import type { PaymentTransaction, PaymentRefund, MonthlyRevenueBreakdown } from '../../types/superadmin'

const mockMonthlyRevenueBreakdown: MonthlyRevenueBreakdown[] = []

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const statusStyles: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
  succeeded: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle },
  pending:   { bg: 'bg-amber-50',  text: 'text-amber-700',  icon: Clock },
  failed:    { bg: 'bg-red-50',    text: 'text-red-700',     icon: XCircle },
  refunded:  { bg: 'bg-purple-50', text: 'text-purple-700',  icon: RotateCcw },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle },
}

const gatewayIcons: Record<string, string> = {
  stripe: 'Stripe',
  razorpay: 'Razorpay',
  wire: 'Wire',
  other: 'Other',
}

// ═══════════════════════════════════════════════════════════════
// Summary Card
// ═══════════════════════════════════════════════════════════════

function SummaryCard({ label, value, change, changeLabel, icon: Icon, color }: {
  label: string; value: string; change?: number; changeLabel?: string
  icon: typeof DollarSign; color: string
}) {
  const isPositive = (change ?? 0) >= 0
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      {changeLabel && <p className="text-[11px] text-gray-400 mt-1">{changeLabel}</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Transactions Tab
// ═══════════════════════════════════════════════════════════════

function TransactionsTab({ transactions }: { transactions: PaymentTransaction[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [gatewayFilter, setGatewayFilter] = useState<string>('all')

  const filtered = transactions.filter(t => {
    const matchSearch = !search || t.tenantName.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const matchGateway = gatewayFilter === 'all' || t.gateway === gatewayFilter
    return matchSearch && matchStatus && matchGateway
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tenant or transaction ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] bg-white cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="succeeded">Succeeded</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={gatewayFilter}
            onChange={e => setGatewayFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] bg-white cursor-pointer"
          >
            <option value="all">All Gateways</option>
            <option value="stripe">Stripe</option>
            <option value="razorpay">Razorpay</option>
            <option value="wire">Wire</option>
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Download size={13} /> Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Transaction</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tenant</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Fee</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Net</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Gateway</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const st = statusStyles[t.status] || statusStyles.pending
                const StIcon = st.icon
                return (
                  <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-mono text-gray-500">{t.id}</span>
                        {t.invoiceId && (
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                            <ExternalLink size={9} /> {t.invoiceId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[13px] font-medium text-gray-800">{t.tenantName}</p>
                        <p className="text-[11px] text-gray-400">{t.tenantEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-gray-600">{t.planName}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] font-semibold text-gray-900">{fmt(t.amount)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] text-gray-500">{fmt(t.fee)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] font-medium text-gray-800">{fmt(t.net)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                        {t.gateway === 'stripe' && <CreditCard size={10} />}
                        {t.gateway === 'razorpay' && <Banknote size={10} />}
                        {gatewayIcons[t.gateway]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.bg} ${st.text}`}>
                        <StIcon size={10} /> {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] text-gray-500">{t.createdAt}</span>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[13px] text-gray-400">No transactions match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-[12px] text-gray-400">Showing {filtered.length} of {transactions.length} transactions</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Refunds Tab
// ═══════════════════════════════════════════════════════════════

function RefundsTab({ refunds }: { refunds: PaymentRefund[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Refund ID</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tenant</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Transaction</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Reason</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map(r => {
              const st = statusStyles[r.status] || statusStyles.pending
              const StIcon = st.icon
              return (
                <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-mono text-gray-500">{r.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-medium text-gray-800">{r.tenantName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-mono text-gray-400">{r.transactionId}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[13px] font-semibold text-red-600">-{fmt(r.amount)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-gray-600 max-w-xs truncate block">{r.reason}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.bg} ${st.text}`}>
                      <StIcon size={10} /> {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[12px] text-gray-500">{r.createdAt}</span>
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
// Revenue Breakdown Tab
// ═══════════════════════════════════════════════════════════════

function RevenueTab() {
  const breakdown = mockMonthlyRevenueBreakdown
  const maxNet = Math.max(...breakdown.map(b => b.net))

  return (
    <div className="space-y-4">
      {/* Bar chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <p className="text-[12px] font-semibold text-gray-700 mb-4">Monthly Net Revenue</p>
        <div className="flex items-end gap-3 h-40">
          {breakdown.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-gray-500">{fmt(b.net)}</span>
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${(b.net / maxNet) * 100}%`,
                  background: 'linear-gradient(180deg, #2E86AB, #1A3C5E)',
                  minHeight: 4,
                }}
              />
              <span className="text-[10px] text-gray-400 mt-1">{b.month.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Month</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Subscriptions</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">One-time</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Refunds</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Fees</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Net</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((b, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-[13px] font-medium text-gray-800">{b.month}</td>
                  <td className="px-4 py-3 text-right text-[13px] text-gray-700">{fmt(b.subscriptions)}</td>
                  <td className="px-4 py-3 text-right text-[13px] text-gray-700">{fmt(b.oneTime)}</td>
                  <td className="px-4 py-3 text-right text-[13px] text-red-500">{b.refunds > 0 ? `-${fmt(b.refunds)}` : '—'}</td>
                  <td className="px-4 py-3 text-right text-[13px] text-gray-500">{fmt(b.fees)}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-semibold text-gray-900">{fmt(b.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

type Tab = 'transactions' | 'refunds' | 'revenue'

export default function PaymentsPage() {
  const { transactions, refunds, payoutSummary } = useSuperAdminStore()
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('transactions')

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'transactions', label: 'Transactions', count: transactions.length },
    { key: 'refunds', label: 'Refunds', count: refunds.length },
    { key: 'revenue', label: 'Revenue Breakdown' },
  ]

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>Payments</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">Transactions, refunds and revenue overview</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Revenue"
            value={fmt(payoutSummary.totalRevenue)}
            change={8.2}
            changeLabel="vs last month"
            icon={DollarSign}
            color="bg-emerald-50 text-emerald-600"
          />
          <SummaryCard
            label="Net Revenue"
            value={fmt(payoutSummary.netRevenue)}
            change={6.5}
            changeLabel="after fees & refunds"
            icon={TrendingUp}
            color="bg-blue-50 text-blue-600"
          />
          <SummaryCard
            label="Pending Payout"
            value={fmt(payoutSummary.pendingPayout)}
            changeLabel={`${payoutSummary.pendingTransactions} pending transactions`}
            icon={Clock}
            color="bg-amber-50 text-amber-600"
          />
          <SummaryCard
            label="Total Refunds"
            value={fmt(payoutSummary.totalRefunds)}
            change={-12}
            changeLabel="vs last month"
            icon={RotateCcw}
            color="bg-red-50 text-red-500"
          />
        </div>

        {/* Payout Info Bar */}
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Last Payout</p>
              <p className="text-[13px] font-semibold text-gray-800">{fmt(payoutSummary.lastPayoutAmount)} <span className="text-gray-400 font-normal">· {payoutSummary.lastPayoutDate}</span></p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Fees</p>
              <p className="text-[13px] font-semibold text-gray-800">{fmt(payoutSummary.totalFees)}</p>
            </div>
          </div>
          <button
            onClick={() => showToast('info', 'Payout export coming soon')}
            className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-white bg-[#2E86AB] rounded-lg hover:bg-[#1a6b8a] transition-colors"
          >
            <Download size={13} /> Export Report
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 border-b border-gray-200">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-[#2E86AB] text-[#2E86AB]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  tab === t.key ? 'bg-[#2E86AB]/10 text-[#2E86AB]' : 'bg-gray-100 text-gray-500'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'transactions' && <TransactionsTab transactions={transactions} />}
        {tab === 'refunds' && <RefundsTab refunds={refunds} />}
        {tab === 'revenue' && <RevenueTab />}
      </div>
    </PageTransition>
  )
}
