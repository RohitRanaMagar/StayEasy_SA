import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Plus, ChevronLeft, ChevronRight,
  CheckCircle, Clock, Send, Trash2, Eye, X,
} from 'lucide-react'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { useToast } from '../../components/superadmin/Toast'
import { PageTransition } from '../../components/superadmin/Animations'

const statusConfig: Record<string, { text: string; bg: string; icon: typeof CheckCircle }> = {
  draft: { text: 'Draft', bg: 'bg-gray-100 text-gray-600', icon: Clock },
  scheduled: { text: 'Scheduled', bg: 'bg-blue-100 text-blue-600', icon: Clock },
  sent: { text: 'Sent', bg: 'bg-green-100 text-green-600', icon: CheckCircle },
}

const typeConfig: Record<string, { text: string; bg: string }> = {
  info: { text: 'Info', bg: 'bg-blue-100 text-blue-600' },
  warning: { text: 'Warning', bg: 'bg-amber-100 text-amber-600' },
  maintenance: { text: 'Maintenance', bg: 'bg-purple-100 text-purple-600' },
  update: { text: 'Update', bg: 'bg-green-100 text-green-600' },
}

type AnnouncementStatus = 'draft' | 'scheduled' | 'sent'

export default function AnnouncementsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const announcements = useSuperAdminStore(s => s.announcements)
  const sendAnnouncement = useSuperAdminStore(s => s.sendAnnouncement)
  const deleteAnnouncement = useSuperAdminStore(s => s.deleteAnnouncement)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatus | 'all'>('all')
  const [page, setPage] = useState(0)
  const perPage = 8

  const [previewAnn, setPreviewAnn] = useState<typeof announcements[0] | null>(null)

  const filtered = useMemo(() => {
    let result = [...announcements]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter)
    return result
  }, [announcements, search, statusFilter])

  const paged = filtered.slice(page * perPage, (page + 1) * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  const stats = {
    total: announcements.length,
    sent: announcements.filter(a => a.status === 'sent').length,
    draft: announcements.filter(a => a.status === 'draft').length,
    scheduled: announcements.filter(a => a.status === 'scheduled').length,
  }

  const handleSend = (id: string) => {
    sendAnnouncement(id)
    showToast('success', 'Announcement sent')
  }

  const handleDelete = (id: string) => {
    deleteAnnouncement(id)
    showToast('success', 'Announcement deleted')
  }

  return (
    <PageTransition>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <button onClick={() => navigate('/superadmin/inbox')}
            className="flex items-center gap-2 px-4 py-2 text-white text-[12px] font-medium rounded-lg sm:ml-auto"
            style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}>
            <Plus size={14} /> New Announcement
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Sent</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.sent}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Draft</p>
            <p className="text-2xl font-bold text-gray-500 mt-1">{stats.draft}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.scheduled}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search announcements..."
              className="w-full pl-9 pr-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20 focus:border-[#2E86AB]" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as AnnouncementStatus | 'all'); setPage(0) }}
            className="px-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20">
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Sent</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Title</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Type</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Target</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Channel</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Created</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-[12px] text-gray-400">No announcements found</td></tr>
                ) : paged.map(ann => {
                  const s = statusConfig[ann.status]
                  const t = typeConfig[ann.type]
                  const channels = [ann.sendInApp ? 'In-App' : null, ann.sendEmail ? 'Email' : null].filter(Boolean).join(', ')
                  return (
                    <tr key={ann.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-[12px] font-medium text-gray-800">{ann.title}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{ann.message}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${t.bg}`}>{t.text}</span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-600 capitalize">{ann.target}</td>
                      <td className="px-4 py-3 text-[11px] text-gray-600">{channels}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.bg}`}>{s.text}</span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-500">{ann.createdAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setPreviewAnn(ann)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                            <Eye size={14} />
                          </button>
                          {ann.status === 'draft' && (
                            <button onClick={() => handleSend(ann.id)}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600">
                              <Send size={14} />
                            </button>
                          )}
                          {ann.status === 'draft' && (
                            <button onClick={() => handleDelete(ann.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
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

        {/* Preview Modal */}
        {previewAnn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-gray-900">Announcement Preview</h3>
                <button onClick={() => setPreviewAnn(null)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeConfig[previewAnn.type].bg}`}>
                    {typeConfig[previewAnn.type].text}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig[previewAnn.status].bg}`}>
                    {statusConfig[previewAnn.status].text}
                  </span>
                </div>
                <h4 className="text-[16px] font-bold text-gray-900">{previewAnn.title}</h4>
                <p className="text-[13px] text-gray-600 whitespace-pre-wrap">{previewAnn.message}</p>
                <div className="text-[11px] text-gray-400 space-y-1 pt-2 border-t border-gray-100">
                  <p>Target: <span className="text-gray-600 capitalize">{previewAnn.target}</span></p>
                  <p>Channels: <span className="text-gray-600">
                    {[previewAnn.sendInApp ? 'In-App' : null, previewAnn.sendEmail ? 'Email' : null].filter(Boolean).join(', ')}
                  </span></p>
                  <p>Created: <span className="text-gray-600">{previewAnn.createdAt}</span></p>
                  {previewAnn.sentAt && <p>Sent: <span className="text-gray-600">{previewAnn.sentAt}</span></p>}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end">
                <button onClick={() => setPreviewAnn(null)}
                  className="px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
