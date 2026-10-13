import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Plus, ChevronLeft, ChevronRight,
  CheckCircle, Clock, Trash2, Eye, X, Loader2,
} from 'lucide-react'
import { useToast } from '../../components/superadmin/Toast'
import { PageTransition } from '../../components/superadmin/Animations'
import NewAnnouncementModal from '../../components/superadmin/NewAnnouncementModal'
import {
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  type AnnouncementResponse,
  type CreateAnnouncementRequest,
} from '../../services/superadminApi'
import type { Announcement, AnnouncementTarget } from '../../types/superadmin'

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

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  return fallback
}

// ─── API mapping (backend AnnouncementResponse → UI Announcement) ───
// Backend has no status/type-channel/audience/scheduling fields:
// - `priority` maps onto the UI `type` badge (unknown values fall back to info).
// - `target` maps onto the single-element `targetAudience`.
// - Only email delivery exists server-side; WhatsApp/Telegram are unsupported.
// - Every stored announcement is effectively sent: status is always 'sent',
//   and draft/scheduled states have no backend counterpart.

const KNOWN_TYPES = ['info', 'warning', 'maintenance', 'update'] as const

function toUiTarget(target: string): AnnouncementTarget {
  if (target === 'tenants' || target === 'property_owners' || target === 'hosts' || target === 'admin' || target === 'all') {
    return target
  }
  return 'all'
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function toUiAnnouncement(a: AnnouncementResponse): Announcement {
  const type = (KNOWN_TYPES as readonly string[]).includes(a.priority) ? a.priority as Announcement['type'] : 'info'
  const target = toUiTarget(a.target)
  return {
    id: a.id,
    title: a.title,
    message: a.message,
    type,
    target,
    targetAudience: [target],
    sendEmail: a.send_email,
    sendWhatsApp: false,
    sendTelegram: false,
    status: 'sent',
    sentAt: formatDate(a.created_at),
    createdAt: formatDate(a.created_at),
    sentCount: 0,
  }
}

export default function AnnouncementsPage() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const announcementsQuery = useQuery({
    queryKey: ['sa-announcements'],
    queryFn: () => listAnnouncements(),
  })
  const announcements: Announcement[] = useMemo(
    () => (announcementsQuery.data?.announcements ?? []).map(toUiAnnouncement),
    [announcementsQuery.data],
  )

  const invalidateAnnouncements = () => queryClient.invalidateQueries({ queryKey: ['sa-announcements'] })

  const createMut = useMutation({
    mutationFn: (payload: CreateAnnouncementRequest) => createAnnouncement(payload),
    onSuccess: () => {
      void invalidateAnnouncements()
      showToast('success', 'Announcement sent successfully')
    },
    onError: (err) => showToast('error', apiErrorMessage(err, 'Failed to create announcement')),
  })
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => {
      void invalidateAnnouncements()
      showToast('success', 'Announcement deleted')
    },
    onError: (err) => showToast('error', apiErrorMessage(err, 'Failed to delete announcement')),
  })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatus | 'all'>('all')
  const [page, setPage] = useState(0)
  const perPage = 8

  const [previewAnn, setPreviewAnn] = useState<Announcement | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)

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
  }

  const handleDelete = (id: string) => {
    deleteMut.mutate(id)
  }

  const handleNewAnnouncement = (data: {
    title: string
    message: string
    type: 'info' | 'warning' | 'maintenance' | 'update'
    target: AnnouncementTarget
    targetAudience: AnnouncementTarget[]
    sendEmail: boolean
    sendWhatsApp: boolean
    sendTelegram: boolean
    status: 'sent' | 'draft' | 'scheduled'
    scheduledAt?: string
  }) => {
    // The backend creates announcements as immediately-sent records: it has
    // no draft/scheduled states, so those requests cannot be persisted.
    if (data.status !== 'sent') {
      showToast('error', 'Drafts and scheduling are not supported by the backend — announcement not saved')
      return
    }
    setShowNewModal(false)
    createMut.mutate(
      {
        title: data.title,
        message: data.message,
        priority: data.type,
        target: data.targetAudience.length === 1 ? data.targetAudience[0] : 'all',
        send_email: data.sendEmail,
      },
      {
        onSuccess: () => {
          // WhatsApp/Telegram delivery has no backend counterpart — only the
          // email flag is persisted, so say so instead of silently dropping it.
          if (data.sendWhatsApp || data.sendTelegram) {
            showToast('info', 'Note: only email delivery is supported by the backend')
          }
        },
      },
    )
  }

  const isLoading = announcementsQuery.isLoading
  const isError = announcementsQuery.isError

  return (
    <PageTransition>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <button onClick={() => setShowNewModal(true)} disabled={createMut.isPending}
            className="flex items-center gap-2 px-4 py-2 text-white text-[12px] font-medium rounded-lg sm:ml-auto disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}>
            {createMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} New Announcement
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? '—' : stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Sent</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{isLoading ? '—' : stats.sent}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Draft</p>
            <p className="text-2xl font-bold text-gray-500 mt-1">—</p>
            <p className="text-[9px] text-gray-300 mt-0.5">Unavailable — no backend status</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">—</p>
            <p className="text-[9px] text-gray-300 mt-0.5">Unavailable — no backend status</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex items-center flex-1">
            <Search size={14} className="absolute left-3 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search announcements..."
              className="w-full pl-9 pr-10 py-2.5 text-[13px] bg-white border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2E86AB]/20 focus:border-[#2E86AB] shadow-md" />
            <button className="absolute right-2 p-1.5 bg-[#2E86AB] text-white rounded-lg hover:bg-[#1a6b8a] transition-colors">
              <Search size={14} />
            </button>
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
                {isLoading ? (
                  <tr><td colSpan={7} className="py-12 text-center">
                    <Loader2 size={20} className="animate-spin text-[#2E86AB] mx-auto mb-2" />
                    <p className="text-[12px] text-gray-400">Loading announcements...</p>
                  </td></tr>
                ) : isError ? (
                  <tr><td colSpan={7} className="py-12 text-center">
                    <p className="text-[12px] text-red-600 font-medium mb-3">Failed to load announcements. Check your connection and try again.</p>
                    <button onClick={() => void announcementsQuery.refetch()}
                      className="px-4 py-2 text-[12px] font-medium text-white rounded-lg"
                      style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}>
                      Retry
                    </button>
                  </td></tr>
                ) : paged.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-[12px] text-gray-400">No announcements found</td></tr>
                ) : paged.map(ann => {
                  const s = statusConfig[ann.status]
                  const t = typeConfig[ann.type]
                  const channels = [ann.sendEmail ? 'Email' : null].filter(Boolean).join(', ') || '—'
                  return (
                    <tr key={ann.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-[12px] font-medium text-gray-800">{ann.title}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{ann.message}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${t.bg}`}>{t.text}</span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-600 capitalize">{ann.targetAudience?.join(', ') || ann.target}</td>
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
                          <button onClick={() => handleDelete(ann.id)} disabled={deleteMut.isPending}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-40">
                            <Trash2 size={14} />
                          </button>
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
                  <p>Target: <span className="text-gray-600 capitalize">{previewAnn.targetAudience?.join(', ') || previewAnn.target}</span></p>
                  <p>Channels: <span className="text-gray-600">{previewAnn.sendEmail ? 'Email' : '—'}</span>
                    <span className="text-gray-300"> (WhatsApp/Telegram unsupported by backend)</span>
                  </p>
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

        {/* New Announcement Modal */}
        <NewAnnouncementModal
          open={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSend={handleNewAnnouncement}
        />
      </div>
    </PageTransition>
  )
}
