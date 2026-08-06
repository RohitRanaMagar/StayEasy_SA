import { useState, useMemo } from 'react'
import {
  Search, Plus, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Clock, AlertTriangle,
  Send, User,
} from 'lucide-react'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { useToast } from '../../components/superadmin/Toast'
import { PageTransition, DrawerWrapper } from '../../components/superadmin/Animations'

const statusConfig: Record<string, { text: string; bg: string; icon: typeof CheckCircle }> = {
  open: { text: 'Open', bg: 'bg-blue-100 text-blue-700', icon: Clock },
  in_progress: { text: 'In Progress', bg: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  resolved: { text: 'Resolved', bg: 'bg-green-100 text-green-700', icon: CheckCircle },
  closed: { text: 'Closed', bg: 'bg-gray-100 text-gray-500', icon: XCircle },
}

const priorityConfig: Record<string, { text: string; bg: string }> = {
  low: { text: 'Low', bg: 'bg-gray-100 text-gray-600' },
  medium: { text: 'Medium', bg: 'bg-blue-100 text-blue-600' },
  high: { text: 'High', bg: 'bg-orange-100 text-orange-600' },
  urgent: { text: 'Urgent', bg: 'bg-red-100 text-red-600' },
}

const categoryConfig: Record<string, { text: string; bg: string }> = {
  billing: { text: 'Billing', bg: 'bg-purple-100 text-purple-600' },
  technical: { text: 'Technical', bg: 'bg-blue-100 text-blue-600' },
  account: { text: 'Account', bg: 'bg-green-100 text-green-600' },
  feature_request: { text: 'Feature Request', bg: 'bg-cyan-100 text-cyan-600' },
  bug: { text: 'Bug', bg: 'bg-red-100 text-red-600' },
}

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
type TicketCategory = 'billing' | 'technical' | 'account' | 'feature_request' | 'bug'

export default function TicketsPage() {
  const { showToast } = useToast()
  const tickets = useSuperAdminStore(s => s.tickets)
  const addTicket = useSuperAdminStore(s => s.addTicket)
  const updateTicket = useSuperAdminStore(s => s.updateTicket)
  const addTicketMessage = useSuperAdminStore(s => s.addTicketMessage)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all')
  const [page, setPage] = useState(0)
  const perPage = 8

  const [selectedTicket, setSelectedTicket] = useState<typeof tickets[0] | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [replyText, setReplyText] = useState('')

  // Create form state
  const [formSubject, setFormSubject] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formTenantName, setFormTenantName] = useState('')
  const [formCategory, setFormCategory] = useState<TicketCategory>('technical')
  const [formPriority, setFormPriority] = useState<TicketPriority>('medium')

  const filtered = useMemo(() => {
    let result = [...tickets]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        t.subject.toLowerCase().includes(q) ||
        t.tenantName.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter)
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter)
    return result
  }, [tickets, search, statusFilter, priorityFilter])

  const paged = filtered.slice(page * perPage, (page + 1) * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    urgent: tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length,
  }

  const handleCreate = () => {
    if (!formSubject.trim() || !formDescription.trim() || !formTenantName.trim()) {
      showToast('error', 'Please fill all required fields')
      return
    }
    addTicket({
      tenantId: 'tnt_' + Date.now(),
      tenantName: formTenantName,
      subject: formSubject,
      description: formDescription,
      category: formCategory,
      priority: formPriority,
      status: 'open',
    })
    showToast('success', 'Ticket created')
    setShowCreate(false)
    setFormSubject('')
    setFormDescription('')
    setFormTenantName('')
  }

  const handleReply = () => {
    if (!selectedTicket || !replyText.trim()) return
    addTicketMessage(selectedTicket.id, {
      sender: 'superadmin',
      senderName: 'SuperAdmin',
      message: replyText,
    })
    setReplyText('')
    showToast('success', 'Reply sent')
    // Refresh selected ticket
    const updated = useSuperAdminStore.getState().tickets.find(t => t.id === selectedTicket.id)
    if (updated) setSelectedTicket(updated)
  }

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    updateTicket(ticketId, { status: newStatus })
    showToast('success', `Ticket status updated to ${statusConfig[newStatus].text}`)
  }

  return (
    <PageTransition>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>Support Tickets</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Manage escalated issues from tenant admins</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-white text-[12px] font-medium rounded-lg"
            style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}>
            <Plus size={14} /> New Ticket
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Open</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.open}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Urgent</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.urgent}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search tickets..."
              className="w-full pl-9 pr-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20 focus:border-[#2E86AB]" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as TicketStatus | 'all'); setPage(0) }}
            className="px-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20">
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value as TicketPriority | 'all'); setPage(0) }}
            className="px-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20">
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Subject</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Tenant</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Category</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Priority</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Created</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-[12px] text-gray-400">No tickets found</td></tr>
                ) : paged.map(ticket => {
                  const s = statusConfig[ticket.status]
                  const p = priorityConfig[ticket.priority]
                  const c = categoryConfig[ticket.category]
                  return (
                    <tr key={ticket.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}>
                      <td className="px-4 py-3">
                        <p className="text-[12px] font-medium text-gray-800">{ticket.subject}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{ticket.description}</p>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{ticket.tenantName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.bg}`}>{c.text}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.bg}`}>{p.text}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.bg}`}>{s.text}</span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-500">{ticket.createdAt}</td>
                      <td className="px-4 py-3">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket) }}
                          className="text-[11px] font-medium text-[#2E86AB] hover:text-[#1a6b8a]">
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">
                Showing {page * perPage + 1}-{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14} /></button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-7 h-7 rounded-lg text-[11px] font-medium ${page === i ? 'bg-[#2E86AB] text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-lg">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-[14px] font-bold text-gray-900">New Support Ticket</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="text-[11px] text-gray-500 font-medium mb-1 block">Tenant Name *</label>
                  <input value={formTenantName} onChange={e => setFormTenantName(e.target.value)}
                    className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-medium mb-1 block">Subject *</label>
                  <input value={formSubject} onChange={e => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-medium mb-1 block">Description *</label>
                  <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={3}
                    className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium mb-1 block">Category</label>
                    <select value={formCategory} onChange={e => setFormCategory(e.target.value as TicketCategory)}
                      className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20">
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                      <option value="account">Account</option>
                      <option value="feature_request">Feature Request</option>
                      <option value="bug">Bug</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium mb-1 block">Priority</label>
                    <select value={formPriority} onChange={e => setFormPriority(e.target.value as TicketPriority)}
                      className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button onClick={handleCreate}
                  className="px-4 py-2 text-[12px] font-medium text-white rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}>
                  Create Ticket
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Detail Drawer */}
        <DrawerWrapper open={selectedTicket !== null} onClose={() => setSelectedTicket(null)}>
          {selectedTicket && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Ticket Info */}
                <div className="space-y-3">
                  <h3 className="text-[14px] font-bold text-gray-900">{selectedTicket.subject}</h3>
                  <p className="text-[12px] text-gray-600">{selectedTicket.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig[selectedTicket.status].bg}`}>
                      {statusConfig[selectedTicket.status].text}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityConfig[selectedTicket.priority].bg}`}>
                      {priorityConfig[selectedTicket.priority].text}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryConfig[selectedTicket.category].bg}`}>
                      {categoryConfig[selectedTicket.category].text}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 space-y-1">
                    <p>Tenant: <span className="text-gray-600">{selectedTicket.tenantName}</span></p>
                    <p>Created: <span className="text-gray-600">{selectedTicket.createdAt}</span></p>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex gap-2">
                  {selectedTicket.status !== 'in_progress' && (
                    <button onClick={() => handleStatusChange(selectedTicket.id, 'in_progress')}
                      className="px-3 py-1.5 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100">
                      Mark In Progress
                    </button>
                  )}
                  {selectedTicket.status !== 'resolved' && (
                    <button onClick={() => handleStatusChange(selectedTicket.id, 'resolved')}
                      className="px-3 py-1.5 text-[10px] font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
                      Resolve
                    </button>
                  )}
                  {selectedTicket.status !== 'closed' && (
                    <button onClick={() => handleStatusChange(selectedTicket.id, 'closed')}
                      className="px-3 py-1.5 text-[10px] font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200">
                      Close
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-[12px] font-semibold text-gray-900 mb-3">Messages</h4>
                  {selectedTicket.messages.length === 0 ? (
                    <p className="text-[11px] text-gray-400 text-center py-4">No messages yet</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedTicket.messages.map(msg => (
                        <div key={msg.id} className={`p-3 rounded-lg ${msg.sender === 'superadmin' ? 'bg-blue-50 ml-4' : 'bg-gray-50 mr-4'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <User size={12} className="text-gray-400" />
                            <span className="text-[11px] font-medium text-gray-700">{msg.senderName}</span>
                            <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                          </div>
                          <p className="text-[12px] text-gray-600">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reply Input */}
              <div className="border-t border-gray-100 p-4">
                <div className="flex gap-2">
                  <input value={replyText} onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleReply()}
                    placeholder="Type a reply..."
                    className="flex-1 px-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20" />
                  <button onClick={handleReply}
                    className="px-3 py-2 text-white rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}>
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </DrawerWrapper>
      </div>
    </PageTransition>
  )
}
