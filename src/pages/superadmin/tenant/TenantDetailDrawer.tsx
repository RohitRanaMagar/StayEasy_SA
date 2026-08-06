import { useState } from 'react'
import {
  Building2, X, Star, Mail, Phone, MapPin, Globe,
  MessageSquare, CreditCard,
  Settings, Activity, Edit, Pause, Play, Eye, RefreshCw,
  Trash2,
} from 'lucide-react'
import type { TenantExtended } from '../../../types/superadmin'
import { useSuperAdminStore } from '../../../components/superadmin/superAdminStore'

const planColors: Record<string, string> = {
  Enterprise: 'bg-gradient-to-r from-purple-500/10 to-purple-600/5 text-purple-700 ring-1 ring-purple-500/20',
  Professional: 'bg-gradient-to-r from-blue-500/10 to-blue-600/5 text-blue-700 ring-1 ring-blue-500/20',
  Basic: 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 text-emerald-700 ring-1 ring-emerald-500/20',
  'Free Trial': 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
}

const statusColors: Record<string, { badge: string; dot: string }> = {
  Active: { badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20', dot: 'bg-emerald-500' },
  Suspended: { badge: 'bg-red-50 text-red-700 ring-1 ring-red-500/20', dot: 'bg-red-500' },
  Trialing: { badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20', dot: 'bg-amber-500' },
}

const badgeColors: Record<string, string> = {
  Stripe: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20',
  Razorpay: 'bg-blue-50 text-blue-700 ring-1 ring-blue-500/20',
  GoogleAnalytics: 'bg-green-50 text-green-700 ring-1 ring-green-500/20',
  Slack: 'bg-purple-50 text-purple-700 ring-1 ring-purple-500/20',
  'Booking.com': 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/20',
}

type Tab = 'overview' | 'billing' | 'features' | 'tickets' | 'activity'

const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
  { id: 'overview', label: 'Overview', icon: Building2 },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'features', label: 'Features', icon: Settings },
  { id: 'tickets', label: 'Tickets', icon: MessageSquare },
  { id: 'activity', label: 'Activity', icon: Activity },
]

interface TenantDetailDrawerProps {
  tenant: TenantExtended | null
  open: boolean
  onClose: () => void
  onImpersonate: (t: TenantExtended) => void
  onSuspend: (t: TenantExtended) => void
  onEdit: (t: TenantExtended) => void
  onChangePlan: (t: TenantExtended) => void
  onDelete: (t: TenantExtended) => void
}

export default function TenantDetailDrawer({
  tenant, open, onClose, onImpersonate, onSuspend, onEdit, onChangePlan, onDelete
}: TenantDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const tickets = useSuperAdminStore(s => s.tickets)

  if (!open || !tenant) return null

  const tenantTickets = tickets.filter(t => t.tenantId === tenant.id)

  const ffEntries = [
    { label: 'Custom Domain', enabled: tenant.featureFlags.customDomain },
    { label: 'White Label', enabled: tenant.featureFlags.whiteLabel },
    { label: 'Channel Manager', enabled: tenant.featureFlags.channelManager },
    { label: 'Advanced Analytics', enabled: tenant.featureFlags.advancedAnalytics },
    { label: 'Restaurant Module', enabled: tenant.featureFlags.restaurantModule },
    { label: 'Multi-language', enabled: tenant.featureFlags.multiLanguage },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-xl bg-white shadow-2xl h-full overflow-hidden flex flex-col animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="shrink-0 border-b border-gray-100">
          <div className="h-1 w-full bg-gradient-to-r from-[#1A3C5E] to-[#2E86AB]" />
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center ring-1 ring-gray-200">
                  {tenant.logo ? (
                    <img src={tenant.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={20} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{tenant.name}</h3>
                  <p className="text-xs text-gray-500">{tenant.city}, {tenant.country}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${planColors[tenant.plan]}`}>{tenant.plan}</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[tenant.status].badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusColors[tenant.status].dot}`} />
                {tenant.status}
              </span>
              <div className="flex items-center gap-1 text-sm text-amber-500 ml-1">
                <Star size={14} className="fill-amber-400" /> <span className="font-medium">{tenant.rating}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-5 -mb-px">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-[#2E86AB] text-[#2E86AB]'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                    }`}>
                    <Icon size={14} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Metrics - Asymmetric layout */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Total Bookings</div>
                  <div className="text-2xl font-bold text-gray-800">{tenant.totalBookings.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-0.5">across all properties</div>
                </div>
                <div className="bg-gradient-to-br from-[#2E86AB]/5 to-[#2E86AB]/10 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Monthly Revenue</div>
                  <div className="text-2xl font-bold text-[#2E86AB]">Rs.{(tenant.monthlyRevenue / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-gray-400 mt-0.5">recurring revenue</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <div className="text-lg font-bold text-gray-800">{tenant.propertiesCount}</div>
                  <div className="text-xs text-gray-500">Properties</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <div className="text-lg font-bold text-gray-800">{tenant.totalRooms}</div>
                  <div className="text-xs text-gray-500">Rooms</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <div className="text-lg font-bold text-gray-800">{tenant.staffCount}</div>
                  <div className="text-xs text-gray-500">Staff</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <Mail size={14} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400">Email</div>
                      <div className="text-xs font-medium text-gray-700">{tenant.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <Phone size={14} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400">Phone</div>
                      <div className="text-xs font-medium text-gray-700">{tenant.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <MapPin size={14} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400">Address</div>
                      <div className="text-xs font-medium text-gray-700">{tenant.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <Globe size={14} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400">Website</div>
                      <a href={`https://${tenant.website}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-medium text-[#2E86AB] hover:underline">{tenant.website}</a>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-gray-400">Owner</div>
                    <div className="text-xs font-semibold text-gray-700">{tenant.ownerName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Owner Email</div>
                    <div className="text-xs text-gray-600">{tenant.ownerEmail}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Owner Phone</div>
                    <div className="text-xs text-gray-600">{tenant.ownerPhone}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Timezone</div>
                    <div className="text-xs text-gray-600">{tenant.timezone}</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <>
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Subscription Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3">
                    <div className="text-[10px] text-gray-400">Plan</div>
                    <div className="text-sm font-semibold text-gray-700">{tenant.plan}</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#2E86AB]/5 to-[#2E86AB]/10 rounded-xl p-3">
                    <div className="text-[10px] text-gray-400">Price</div>
                    <div className="text-sm font-semibold text-[#2E86AB]">Rs.{tenant.planPrice.toLocaleString()}/{tenant.billingCycle === 'yearly' ? 'yr' : 'mo'}</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-3">
                    <div className="text-[10px] text-gray-400">Payment Method</div>
                    <div className="text-sm font-medium text-gray-700">{tenant.paymentMethod}</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-3">
                    <div className="text-[10px] text-gray-400">Since</div>
                    <div className="text-sm font-medium text-gray-700">{tenant.subscriptionDate}</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <>
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Feature Access</h4>
                <div className="space-y-2">
                  {ffEntries.map(ff => (
                    <div key={ff.label} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm text-gray-700">{ff.label}</span>
                      <div className={`w-10 h-5 rounded-full transition-colors ${ff.enabled ? 'bg-[#2E86AB]' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm mt-0.5 transition-transform ${ff.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Connected Integrations</h4>
                <div className="flex flex-wrap gap-2">
                  {tenant.integrations.length > 0 ? tenant.integrations.map(i => (
                    <span key={i} className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${badgeColors[i] || 'bg-gray-100 text-gray-600'}`}>{i}</span>
                  )) : (
                    <span className="text-xs text-gray-400">No integrations connected</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Support Tickets</h4>
              {tenantTickets.length > 0 ? (
                <div className="space-y-2">
                  {tenantTickets.slice(0, 5).map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between py-3 px-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-gray-700">{ticket.subject}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{ticket.createdAt}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        ticket.status === 'open' ? 'bg-blue-50 text-blue-700'
                        : ticket.status === 'in_progress' ? 'bg-amber-50 text-amber-700'
                        : ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                      }`}>{ticket.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <MessageSquare size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">No tickets for this tenant</p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Activity</h4>
              <div className="py-8 text-center">
                <Activity size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">Activity logs will appear here</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 border-t border-gray-100 p-5">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onEdit(tenant)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#2E86AB] bg-[#2E86AB]/5 border border-[#2E86AB]/20 rounded-xl hover:bg-[#2E86AB]/10 transition-colors">
              <Edit size={14} /> Edit
            </button>
            <button onClick={() => onChangePlan(tenant)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors">
              <RefreshCw size={14} /> Change Plan
            </button>
            <button onClick={() => onImpersonate(tenant)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
              <Eye size={14} /> Impersonate
            </button>
            <button onClick={() => onSuspend(tenant)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl border transition-colors ${
                tenant.status === 'Suspended'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                  : 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'
              }`}>
              {tenant.status === 'Suspended' ? <Play size={14} /> : <Pause size={14} />}
              {tenant.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}
            </button>
            <button onClick={() => onDelete(tenant)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors ml-auto">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
