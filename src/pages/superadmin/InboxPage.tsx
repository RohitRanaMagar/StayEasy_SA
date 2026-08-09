import { useState } from 'react'
import {
  Mail, MailOpen, Trash2, Circle, MessageSquare, Send, Inbox,
} from 'lucide-react'
import { PageTransition } from '../../components/superadmin/Animations'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'

interface InboxMessage {
  id: string
  sender: string
  subject: string
  preview: string
  timestamp: string
  read: boolean
  channel: 'email' | 'whatsapp' | 'telegram'
}

const initialMessages: InboxMessage[] = [
  {
    id: '1',
    sender: 'Hotel Everest',
    subject: 'Payment confirmation for January',
    preview: 'Hi, I wanted to confirm that the payment for January has been processed. Could you please verify...',
    timestamp: '5 min ago',
    read: false,
    channel: 'email',
  },
  {
    id: '2',
    sender: 'Lakeside Inn',
    subject: 'Property listing update request',
    preview: 'We would like to update our property listing with new photos and pricing. Please let us know...',
    timestamp: '30 min ago',
    read: false,
    channel: 'whatsapp',
  },
  {
    id: '3',
    sender: 'Mountain View Resort',
    subject: 'Subscription upgrade inquiry',
    preview: 'We are interested in upgrading our subscription plan. Can you share the details for the Enterprise...',
    timestamp: '1 hour ago',
    read: false,
    channel: 'email',
  },
  {
    id: '4',
    sender: 'Grand Palace Hotel',
    subject: 'Support ticket #4521 follow-up',
    preview: 'Following up on our previous support request regarding the API integration issue. Has there been...',
    timestamp: '2 hours ago',
    read: true,
    channel: 'telegram',
  },
  {
    id: '5',
    sender: 'Valley View Resort',
    subject: 'Billing discrepancy report',
    preview: 'We noticed a discrepancy in our last billing statement. The amount charged does not match...',
    timestamp: '4 hours ago',
    read: true,
    channel: 'email',
  },
  {
    id: '6',
    sender: 'Sunrise Homestay',
    subject: 'New feature feedback',
    preview: 'We love the new analytics dashboard! However, it would be great if we could export the data...',
    timestamp: '6 hours ago',
    read: true,
    channel: 'whatsapp',
  },
  {
    id: '7',
    sender: 'Blue Heaven Hotel',
    subject: 'Account verification documents',
    preview: 'Please find attached the required documents for account verification. Let us know if anything...',
    timestamp: '1 day ago',
    read: true,
    channel: 'email',
  },
  {
    id: '8',
    sender: 'Royal Residence',
    subject: 'Cancellation policy question',
    preview: 'Could you clarify the cancellation policy for our upcoming booking? A guest wants to cancel...',
    timestamp: '1 day ago',
    read: true,
    channel: 'telegram',
  },
]

const channelConfig: Record<string, { label: string; bg: string }> = {
  email: { label: 'Email', bg: 'bg-blue-100 text-blue-600' },
  whatsapp: { label: 'WhatsApp', bg: 'bg-green-100 text-green-600' },
  telegram: { label: 'Telegram', bg: 'bg-sky-100 text-sky-600' },
}

type TabType = 'received' | 'sent'

export default function InboxPage() {
  const [messages, setMessages] = useState<InboxMessage[]>(initialMessages)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('received')
  const announcements = useSuperAdminStore(s => s.announcements)

  const sentAnnouncements = announcements.filter(a => a.status === 'sent')

  const unreadCount = messages.filter(m => !m.read).length

  const markAsRead = (id: string) => {
    setMessages(prev =>
      prev.map(m => (m.id === id ? { ...m, read: true } : m))
    )
  }

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const markAllAsRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })))
  }

  const selectedReceivedMessage = activeTab === 'received' ? messages.find(m => m.id === selectedId) : null
  const selectedSentMessage = activeTab === 'sent' ? sentAnnouncements.find(a => a.id === selectedId) : null

  if (messages.length === 0 && sentAnnouncements.length === 0) {
    return (
      <PageTransition>
        <div className="max-w-3xl">
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Mail size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No messages</h2>
            <p className="text-sm text-gray-400">Your inbox is empty.</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="flex gap-4" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Message List */}
        <div className="w-full max-w-md bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 shrink-0">
            <button
              onClick={() => { setActiveTab('received'); setSelectedId(null) }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-[11px] font-semibold transition-colors ${
                activeTab === 'received'
                  ? 'text-[#2E86AB] border-b-2 border-[#2E86AB] bg-[#2E86AB]/5'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Inbox size={13} />
              Received
              {unreadCount > 0 && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#2E86AB] text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('sent'); setSelectedId(null) }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-[11px] font-semibold transition-colors ${
                activeTab === 'sent'
                  ? 'text-[#2E86AB] border-b-2 border-[#2E86AB] bg-[#2E86AB]/5'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Send size={13} />
              Sent
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {sentAnnouncements.length}
              </span>
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
            <h2 className="text-sm font-semibold text-gray-900">
              {activeTab === 'received' ? 'Inbox' : 'Sent Announcements'}
            </h2>
            {activeTab === 'received' && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-[#2E86AB] hover:text-[#1a6b8a] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto custom-scroll">
            {activeTab === 'received' ? (
              messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mail size={32} className="text-gray-200 mb-3" />
                  <p className="text-[12px] text-gray-400">No received messages</p>
                </div>
              ) : (
                messages.map(msg => {
                  const ch = channelConfig[msg.channel]
                  return (
                    <div
                      key={msg.id}
                      onClick={() => { setSelectedId(msg.id); markAsRead(msg.id) }}
                      className={`flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 cursor-pointer transition-colors ${
                        selectedId === msg.id
                          ? 'bg-[#2E86AB]/5 border-l-2 border-l-[#2E86AB]'
                          : !msg.read
                            ? 'bg-blue-50/30 hover:bg-blue-50/50'
                            : 'hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gray-100">
                        {!msg.read ? (
                          <Mail size={16} className="text-[#2E86AB]" />
                        ) : (
                          <MailOpen size={16} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[12px] truncate ${!msg.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {msg.sender}
                          </span>
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${ch.bg}`}>
                            {ch.label}
                          </span>
                          {!msg.read && (
                            <Circle size={6} className="text-[#2E86AB] shrink-0" fill="#2E86AB" />
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-gray-600 truncate mt-0.5">{msg.subject}</p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{msg.preview}</p>
                        <span className="text-[9px] text-gray-300 mt-1 block">{msg.timestamp}</span>
                      </div>
                    </div>
                  )
                })
              )
            ) : (
              sentAnnouncements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Send size={32} className="text-gray-200 mb-3" />
                  <p className="text-[12px] text-gray-400">No sent announcements</p>
                </div>
              ) : (
                sentAnnouncements.map(ann => {
                  const channels = [
                    ann.sendEmail ? 'Email' : null,
                    ann.sendWhatsApp ? 'WhatsApp' : null,
                    ann.sendTelegram ? 'Telegram' : null,
                  ].filter(Boolean)
                  return (
                    <div
                      key={ann.id}
                      onClick={() => setSelectedId(ann.id)}
                      className={`flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 cursor-pointer transition-colors ${
                        selectedId === ann.id
                          ? 'bg-[#2E86AB]/5 border-l-2 border-l-[#2E86AB]'
                          : 'hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-green-100">
                        <Send size={16} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium text-gray-700 truncate">{ann.title}</span>
                          {channels.map(ch => (
                            <span key={ch} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              {ch}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          To: {ann.targetAudience?.join(', ') || ann.target}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{ann.message}</p>
                        <span className="text-[9px] text-gray-300 mt-1 block">{ann.sentAt || ann.createdAt}</span>
                      </div>
                    </div>
                  )
                })
              )
            )}
          </div>
        </div>

        {/* Message Detail */}
        {selectedReceivedMessage ? (
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-[14px] font-bold text-gray-900">{selectedReceivedMessage.subject}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  From: <span className="text-gray-600">{selectedReceivedMessage.sender}</span> · {selectedReceivedMessage.timestamp}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteMessage(selectedReceivedMessage.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedReceivedMessage.preview}
              </p>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-gray-300">Reply</span>
              <button className="px-4 py-2 text-[12px] font-medium text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}>
                Reply
              </button>
            </div>
          </div>
        ) : selectedSentMessage ? (
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-[14px] font-bold text-gray-900">{selectedSentMessage.title}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Sent to: <span className="text-gray-600">{selectedSentMessage.targetAudience?.join(', ')}</span> · {selectedSentMessage.sentAt}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedSentMessage.message}
              </p>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 mb-2">Channels</p>
                <div className="flex gap-2">
                  {selectedSentMessage.sendEmail && (
                    <span className="px-2.5 py-1 text-[10px] font-medium bg-blue-100 text-blue-600 rounded-full">Email</span>
                  )}
                  {selectedSentMessage.sendWhatsApp && (
                    <span className="px-2.5 py-1 text-[10px] font-medium bg-green-100 text-green-600 rounded-full">WhatsApp</span>
                  )}
                  {selectedSentMessage.sendTelegram && (
                    <span className="px-2.5 py-1 text-[10px] font-medium bg-sky-100 text-sky-600 rounded-full">Telegram</span>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-[11px] text-gray-400 mb-1">Delivered to</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSentMessage.deliveredTo?.map((aud: string) => (
                      <span key={aud} className="px-2 py-0.5 text-[10px] font-medium bg-[#2E86AB]/10 text-[#2E86AB] rounded-full capitalize">
                        {aud.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-gray-300">Announcement</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-xl border border-gray-100 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-[13px] text-gray-400">
                {activeTab === 'received' ? 'Select a message to read' : 'Select an announcement to view'}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
