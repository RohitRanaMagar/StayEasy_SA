import { CheckCircle, X, Mail, MessageCircle, SendHorizonal, Users } from 'lucide-react'
import { ModalWrapper } from './Animations'
import type { AnnouncementTarget, AnnouncementChannel } from '../../types/superadmin'

interface DeliveryConfirmationPopupProps {
  open: boolean
  onClose: () => void
  title: string
  targetAudience: AnnouncementTarget[]
  channels: { email: boolean; whatsapp: boolean; telegram: boolean }
  recipientCount: number
  sentAt: string
}

const audienceLabels: Record<AnnouncementTarget, string> = {
  tenants: 'Tenants',
  property_owners: 'Property Owners',
  hosts: 'Hosts',
  admin: 'Admins',
  all: 'All Users',
}

const channelConfig: { key: AnnouncementChannel; label: string; icon: typeof Mail; color: string }[] = [
  { key: 'email', label: 'Email', icon: Mail, color: 'text-blue-600 bg-blue-100' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600 bg-green-100' },
  { key: 'telegram', label: 'Telegram', icon: SendHorizonal, color: 'text-sky-600 bg-sky-100' },
]

export default function DeliveryConfirmationPopup({
  open,
  onClose,
  title,
  targetAudience,
  channels,
  recipientCount,
  sentAt,
}: DeliveryConfirmationPopupProps) {
  const activeChannels = channelConfig.filter(ch => channels[ch.key])

  return (
    <ModalWrapper open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="px-6 py-6 text-center">
        {/* Close button */}
        <div className="flex justify-end -mt-2 -mr-2">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>

        {/* Title */}
        <h3 className="text-[16px] font-bold text-gray-900 mb-1">Announcement Sent Successfully</h3>
        <p className="text-[12px] text-gray-500 mb-5">Your message has been delivered</p>

        {/* Announcement Title */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Announcement</p>
          <p className="text-[13px] font-semibold text-gray-800">{title}</p>
        </div>

        {/* Delivered To */}
        <div className="mb-5">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Users size={14} className="text-gray-400" />
            <p className="text-[11px] text-gray-500 font-medium">Delivered to</p>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {targetAudience.map(aud => (
              <span key={aud} className="px-2.5 py-1 text-[10px] font-medium bg-[#2E86AB]/10 text-[#2E86AB] rounded-full">
                {audienceLabels[aud]}
              </span>
            ))}
          </div>
        </div>

        {/* Channels */}
        <div className="mb-5">
          <p className="text-[11px] text-gray-500 font-medium mb-2">Sent via</p>
          <div className="flex justify-center gap-2">
            {activeChannels.map(ch => {
              const Icon = ch.icon
              return (
                <div key={ch.key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${ch.color}`}>
                  <Icon size={12} />
                  <span className="text-[10px] font-semibold">{ch.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recipient Count */}
        <div className="bg-green-50 rounded-lg px-4 py-3 mb-5">
          <p className="text-[20px] font-bold text-green-700">{recipientCount}</p>
          <p className="text-[10px] text-green-600 font-medium">recipients reached</p>
        </div>

        {/* Timestamp */}
        <p className="text-[10px] text-gray-400 mb-5">Sent at {sentAt}</p>

        {/* Close Button */}
        <button onClick={onClose}
          className="w-full px-4 py-2.5 text-[12px] font-medium text-white rounded-lg transition-all"
          style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}>
          Done
        </button>
      </div>
    </ModalWrapper>
  )
}
