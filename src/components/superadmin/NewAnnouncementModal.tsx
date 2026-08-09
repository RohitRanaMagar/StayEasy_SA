import { useState } from 'react'
import { X, Send, Save, Calendar, Mail, MessageCircle, SendHorizonal } from 'lucide-react'
import { ModalWrapper } from './Animations'
import type { AnnouncementTarget, AnnouncementChannel } from '../../types/superadmin'

interface NewAnnouncementModalProps {
  open: boolean
  onClose: () => void
  onSend: (data: {
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
  }) => void
}

const typeOptions = [
  { value: 'info', label: 'Info', color: 'bg-blue-100 text-blue-600' },
  { value: 'warning', label: 'Warning', color: 'bg-amber-100 text-amber-600' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-purple-100 text-purple-600' },
  { value: 'update', label: 'Update', color: 'bg-green-100 text-green-600' },
] as const

const audienceOptions: { value: AnnouncementTarget; label: string; description: string }[] = [
  { value: 'tenants', label: 'Tenants', description: 'Property owners with active subscriptions' },
  { value: 'property_owners', label: 'Property Owners', description: 'Owners managing multiple properties' },
  { value: 'hosts', label: 'Hosts', description: 'Hosts managing bookings and guests' },
  { value: 'admin', label: 'Admins', description: 'Platform administrators and staff' },
]

const channelOptions: { value: AnnouncementChannel; label: string; icon: typeof Mail; color: string; activeColor: string }[] = [
  { value: 'email', label: 'Email', icon: Mail, color: 'border-gray-200 bg-white', activeColor: 'border-blue-500 bg-blue-50' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'border-gray-200 bg-white', activeColor: 'border-green-500 bg-green-50' },
  { value: 'telegram', label: 'Telegram', icon: SendHorizonal, color: 'border-gray-200 bg-white', activeColor: 'border-sky-500 bg-sky-50' },
]

export default function NewAnnouncementModal({ open, onClose, onSend }: NewAnnouncementModalProps) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'info' | 'warning' | 'maintenance' | 'update'>('info')
  const [audience, setAudience] = useState<AnnouncementTarget[]>([])
  const [channels, setChannels] = useState<Record<AnnouncementChannel, boolean>>({
    email: true,
    whatsapp: false,
    telegram: false,
  })
  const [schedule, setSchedule] = useState<'now' | 'later'>('now')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  const toggleAudience = (value: AnnouncementTarget) => {
    setAudience(prev =>
      prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]
    )
  }

  const toggleChannel = (value: AnnouncementChannel) => {
    setChannels(prev => ({ ...prev, [value]: !prev[value] }))
  }

  const hasAnyChannel = Object.values(channels).some(Boolean)
  const isValid = title.trim() && message.trim() && audience.length > 0 && hasAnyChannel

  const handleSend = () => {
    if (!isValid) return
    onSend({
      title: title.trim(),
      message: message.trim(),
      type,
      target: audience.length === 1 ? audience[0] : 'all',
      targetAudience: audience,
      sendEmail: channels.email,
      sendWhatsApp: channels.whatsapp,
      sendTelegram: channels.telegram,
      status: schedule === 'now' ? 'sent' : 'scheduled',
      scheduledAt: schedule === 'later' && scheduledDate && scheduledTime
        ? `${scheduledDate} ${scheduledTime}`
        : undefined,
    })
    resetForm()
  }

  const handleSaveDraft = () => {
    if (!title.trim()) return
    onSend({
      title: title.trim(),
      message: message.trim(),
      type,
      target: audience.length === 1 ? audience[0] : 'all',
      targetAudience: audience,
      sendEmail: channels.email,
      sendWhatsApp: channels.whatsapp,
      sendTelegram: channels.telegram,
      status: 'draft',
    })
    resetForm()
  }

  const resetForm = () => {
    setTitle('')
    setMessage('')
    setType('info')
    setAudience([])
    setChannels({ email: true, whatsapp: false, telegram: false })
    setSchedule('now')
    setScheduledDate('')
    setScheduledTime('')
    onClose()
  }

  return (
    <ModalWrapper open={open} onClose={resetForm} maxWidth="max-w-4xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-gray-900">New Announcement</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Create and send announcements to your audience</p>
        </div>
        <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      {/* Body - Split Layout */}
      <div className="flex min-h-[420px]">
        {/* Left Side - Form */}
        <div className="flex-1 px-6 py-5 space-y-4 border-r border-gray-100">
          <div>
            <label className="text-[11px] text-gray-500 font-medium mb-1.5 block">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Announcement title..."
              className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20 focus:border-[#2E86AB] placeholder:text-gray-300"
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] text-gray-500 font-medium mb-1.5 block">Message *</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your announcement message..."
              rows={10}
              className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20 focus:border-[#2E86AB] resize-none placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Right Side - Settings */}
        <div className="w-[280px] px-5 py-5 space-y-5 bg-gray-50/50">
          {/* Type */}
          <div>
            <label className="text-[11px] text-gray-500 font-medium mb-2 block">Type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {typeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`px-2.5 py-1.5 text-[10px] font-medium rounded-lg border transition-all ${
                    type === opt.value
                      ? `${opt.color} border-current`
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="text-[11px] text-gray-500 font-medium mb-2 block">Target Audience *</label>
            <div className="space-y-1.5">
              {audienceOptions.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                    audience.includes(opt.value)
                      ? 'border-[#2E86AB] bg-[#2E86AB]/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={audience.includes(opt.value)}
                    onChange={() => toggleAudience(opt.value)}
                    className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-[#2E86AB] focus:ring-[#2E86AB]/20"
                  />
                  <div>
                    <p className="text-[11px] font-medium text-gray-700">{opt.label}</p>
                    <p className="text-[9px] text-gray-400">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div>
            <label className="text-[11px] text-gray-500 font-medium mb-2 block">Channels *</label>
            <div className="space-y-1.5">
              {channelOptions.map(ch => {
                const Icon = ch.icon
                return (
                  <button
                    key={ch.value}
                    onClick={() => toggleChannel(ch.value)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-[11px] font-medium transition-all ${
                      channels[ch.value] ? ch.activeColor : ch.color
                    } hover:border-gray-300`}
                  >
                    <Icon size={14} />
                    <span className={channels[ch.value] ? 'text-gray-700' : 'text-gray-500'}>{ch.label}</span>
                    {channels[ch.value] && (
                      <span className="ml-auto text-[9px] text-green-600 font-semibold">Active</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="text-[11px] text-gray-500 font-medium mb-2 block">Schedule</label>
            <div className="space-y-1.5">
              <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                schedule === 'now' ? 'border-[#2E86AB] bg-[#2E86AB]/5' : 'border-gray-200 bg-white'
              }`}>
                <input type="radio" name="schedule" checked={schedule === 'now'} onChange={() => setSchedule('now')}
                  className="w-3.5 h-3.5 text-[#2E86AB] focus:ring-[#2E86AB]/20" />
                <Send size={12} className={schedule === 'now' ? 'text-[#2E86AB]' : 'text-gray-400'} />
                <span className="text-[11px] font-medium text-gray-700">Send Now</span>
              </label>
              <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                schedule === 'later' ? 'border-[#2E86AB] bg-[#2E86AB]/5' : 'border-gray-200 bg-white'
              }`}>
                <input type="radio" name="schedule" checked={schedule === 'later'} onChange={() => setSchedule('later')}
                  className="w-3.5 h-3.5 text-[#2E86AB] focus:ring-[#2E86AB]/20" />
                <Calendar size={12} className={schedule === 'later' ? 'text-[#2E86AB]' : 'text-gray-400'} />
                <span className="text-[11px] font-medium text-gray-700">Schedule</span>
              </label>
              {schedule === 'later' && (
                <div className="flex gap-2 mt-2">
                  <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-[10px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20" />
                  <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-[10px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/20" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[10px] text-gray-400">
          {audience.length > 0 && `Targeting ${audience.length} audience group${audience.length > 1 ? 's' : ''}`}
          {!hasAnyChannel && title.trim() && <span className="text-amber-500 ml-2">Select at least one channel</span>}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={resetForm}
            className="px-4 py-2 text-[11px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSaveDraft}
            className="px-4 py-2 text-[11px] font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1.5">
            <Save size={12} /> Save Draft
          </button>
          <button onClick={handleSend} disabled={!isValid}
            className="px-4 py-2 text-[11px] font-medium text-white rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: isValid ? 'linear-gradient(135deg, #2E86AB, #1A6B8A)' : '#9CA3AF' }}>
            <Send size={12} /> {schedule === 'now' ? 'Send Now' : 'Schedule'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}
