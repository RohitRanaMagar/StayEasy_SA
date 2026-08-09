import { UserX, CreditCard, Users, Server } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const mockNotifications = [
  { id: '1', icon: UserX, iconBg: 'bg-red-50', iconColor: 'text-red-500', title: 'Tenant Suspended', subtitle: 'Hotel Everest suspended', time: '15m' },
  { id: '2', icon: CreditCard, iconBg: 'bg-amber-50', iconColor: 'text-amber-500', title: 'Payment Failed', subtitle: '$299 from Mountain View Resort', time: '1h' },
  { id: '3', icon: Users, iconBg: 'bg-green-50', iconColor: 'text-green-500', title: 'New Tenant Signup', subtitle: 'Lakeside Inn joined', time: '2h' },
  { id: '4', icon: Server, iconBg: 'bg-red-50', iconColor: 'text-red-500', title: 'System Incident', subtitle: 'API Gateway errors', time: '3h' },
]

export default function NotificationDropdown() {
  const navigate = useNavigate()

  return (
    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Notifications</p>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full">{mockNotifications.length}</span>
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {mockNotifications.map((n, i) => (
          <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer ${i < mockNotifications.length - 1 ? 'border-b border-gray-50' : ''}`}>
            <div className={`w-8 h-8 rounded-lg ${n.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
              <n.icon size={14} className={n.iconColor} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-gray-800">{n.title}</p>
              <p className="text-[10px] text-gray-400 truncate">{n.subtitle}</p>
            </div>
            <span className="text-[9px] text-gray-400 shrink-0 mt-0.5">{n.time}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={() => navigate('/superadmin/profile/notifications')}
          className="w-full text-center text-[11px] font-medium text-[#2E86AB] hover:text-[#1a6b8a] transition-colors"
        >
          View all notifications →
        </button>
      </div>
    </div>
  )
}
