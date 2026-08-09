import { useState } from 'react'
import {
  Users, Shield, Search, ChevronRight,
  CheckCircle, XCircle, Clock, Mail, UserPlus,
  MoreHorizontal, Edit,
} from 'lucide-react'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { PageTransition } from '../../components/superadmin/Animations'
import type { AdminUser, AdminRole } from '../../types/superadmin'

import { mockAdminRoles } from '../../data/superAdminMockData'
const adminRoles: AdminRole[] = mockAdminRoles

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-500',
  invited: 'bg-blue-100 text-blue-700',
}

const roleColors: Record<string, string> = {
  SuperAdmin: 'bg-purple-100 text-purple-700',
  Admin: 'bg-blue-100 text-blue-700',
  Support: 'bg-emerald-100 text-emerald-700',
  ReadOnly: 'bg-gray-100 text-gray-600',
}

const categoryColors: Record<string, string> = {
  tenants: '#2E86AB',
  billing: '#10B981',
  system: '#8B5CF6',
  security: '#F59E0B',
  content: '#EC4899',
}

// ═══════════════════════════════════════════════════════════════
// Admin Detail Modal
// ═══════════════════════════════════════════════════════════════

function AdminDetailModal({ admin, open, onClose }: { admin: AdminUser | null; open: boolean; onClose: () => void }) {
  if (!open || !admin) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-500">{admin.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{admin.name}</h3>
              <p className="text-xs text-gray-400">{admin.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="text-[10px] text-gray-400">Role</div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${roleColors[admin.role]}`}>{admin.role}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="text-[10px] text-gray-400">Status</div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusColors[admin.status]}`}>{admin.status}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="text-[10px] text-gray-400">Last Active</div>
              <div className="text-xs font-medium text-gray-700">{admin.lastActive}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="text-[10px] text-gray-400">Joined</div>
              <div className="text-xs font-medium text-gray-700">{admin.joinedAt}</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-400 font-medium">Permissions</span>
            {admin.mfaEnabled && <span className="text-[9px] text-emerald-600 font-medium">✓ MFA Enabled</span>}
          </div>
          <div className="flex flex-wrap gap-1">
            {admin.permissions.map(p => (
              <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Invite Admin Modal
// ═══════════════════════════════════════════════════════════════

function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <UserPlus size={18} className="text-purple-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Invite Admin</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-400 font-medium">Email Address</label>
              <input type="email" placeholder="admin@example.com"
                className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-300" />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-medium">Role</label>
              <select className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-300 text-gray-700">
                <option>Admin</option>
                <option>Support</option>
                <option>Read-Only</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-medium">Message (optional)</label>
              <textarea rows={3} placeholder="Add a personal message..."
                className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-300 resize-none" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 justify-end">
            <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button className="px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors"
              style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}>
              <Mail size={12} className="inline mr-1" /> Send Invite
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Role Card
// ═══════════════════════════════════════════════════════════════

function RoleCard({ role }: { role: AdminRole }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="text-[12px] font-semibold text-gray-800">{role.name}</span>
            <span className="ml-2 text-[10px] text-gray-400">{role.adminCount} admins</span>
          </div>
          <button onClick={() => setExpanded(v => !v)}
            className="p-0.5 rounded hover:bg-gray-100 text-gray-300 transition-colors">
            <ChevronRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mb-2">{role.description}</p>

        {expanded && (
          <div className="mt-2 pt-2 border-t border-gray-50">
            <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Permissions</span>
            <div className="mt-1.5 space-y-1">
              {role.permissions.map(perm => (
                <div key={perm.id} className="flex items-center gap-2 py-1">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: categoryColors[perm.category] || '#6B7280' }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-medium text-gray-700">{perm.name}</span>
                    <span className="text-[9px] text-gray-400 ml-1">({perm.category})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function AdminsRolesPage() {
  const storeAdmins = useSuperAdminStore(s => s.adminUsers)
  const [activeTab, setActiveTab] = useState<'admins' | 'roles'>('admins')
  const [search, setSearch] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null)
  const [showInvite, setShowInvite] = useState(false)

  const filtered = storeAdmins.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-white rounded-lg transition-colors sm:ml-auto"
          style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}>
          <UserPlus size={13} /> Invite Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users size={13} className="text-[#2E86AB]" />
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Total Admins</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{storeAdmins.length}</div>
          <div className="text-[9px] text-gray-400 mt-0.5">{storeAdmins.filter(u => u.status === 'active').length} active</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={13} className="text-[#8B5CF6]" />
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Roles</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{adminRoles.length}</div>
          <div className="text-[9px] text-gray-400 mt-0.5">Permission sets</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={13} className="text-emerald-500" />
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">MFA Enabled</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{storeAdmins.filter(u => u.mfaEnabled).length}</div>
          <div className="text-[9px] text-gray-400 mt-0.5">Of {storeAdmins.length} admins</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={13} className="text-[#F59E0B]" />
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Pending Invites</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{storeAdmins.filter(u => u.status === 'invited').length}</div>
          <div className="text-[9px] text-gray-400 mt-0.5">Awaiting response</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
        <button onClick={() => setActiveTab('admins')}
          className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${activeTab === 'admins' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
          <Users size={12} className="inline mr-1.5" />Admins ({storeAdmins.length})
        </button>
        <button onClick={() => setActiveTab('roles')}
          className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${activeTab === 'roles' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
          <Shield size={12} className="inline mr-1.5" />Roles & Permissions ({adminRoles.length})
        </button>
      </div>

      {/* Admins Tab */}
      {activeTab === 'admins' && (
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-900">Admin Users</h3>
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search admins..."
                className="pl-9 pr-10 py-2.5 text-[13px] bg-white border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2E86AB]/20 focus:border-[#2E86AB] shadow-md w-40" />
              <button className="absolute right-2 p-1.5 bg-[#2E86AB] text-white rounded-lg hover:bg-[#1a6b8a] transition-colors">
                <Search size={14} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Admin</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Role</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">MFA</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Last Active</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Joined</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(admin => (
                  <tr key={admin.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelectedAdmin(admin)}>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-blue-500">{admin.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-[11px] font-medium text-gray-800">{admin.name}</div>
                          <div className="text-[9px] text-gray-400">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${roleColors[admin.role]}`}>{admin.role}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${statusColors[admin.status]}`}>{admin.status}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      {admin.mfaEnabled
                        ? <CheckCircle size={13} className="text-emerald-500" />
                        : <XCircle size={13} className="text-gray-300" />
                      }
                    </td>
                    <td className="py-2.5 px-3 text-[10px] text-gray-500">{admin.lastActive}</td>
                    <td className="py-2.5 px-3 text-[10px] text-gray-400">{admin.joinedAt}</td>
                    <td className="py-2.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                      <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                        <Edit size={12} />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {adminRoles.map(role => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      )}

      {/* Modals */}
      <AdminDetailModal admin={selectedAdmin} open={selectedAdmin !== null} onClose={() => setSelectedAdmin(null)} />
      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} />
    </div>
    </PageTransition>
  )
}
