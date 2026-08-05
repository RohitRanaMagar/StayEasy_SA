import { useState } from 'react'
import {
  Bell, CreditCard, Users, AlertTriangle, Shield, Settings,
  Check, Trash2, Circle, Server, DollarSign, UserX, Building2,
} from 'lucide-react'

interface Notification {
  id: string
  icon: typeof Bell
  color: string
  bgColor: string
  title: string
  message: string
  timestamp: string
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    icon: UserX,
    color: '#EF4444',
    bgColor: '#FEE2E2',
    title: 'Tenant Suspended',
    message: 'Hotel Everest (Professional plan) has been suspended due to non-payment. All services deactivated.',
    timestamp: '15 min ago',
    read: false,
  },
  {
    id: '2',
    icon: CreditCard,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    title: 'Payment Failed',
    message: 'Payment of $299 from "Mountain View Resort" failed. Subscription moved to past_due status.',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    icon: Users,
    color: '#10B981',
    bgColor: '#D1FAE5',
    title: 'New Tenant Signup',
    message: 'Lakeside Inn has signed up on the Basic plan. 3 properties added. Awaiting profile completion.',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '4',
    icon: Server,
    color: '#EF4444',
    bgColor: '#FEE2E2',
    title: 'System Incident',
    message: 'API Gateway experiencing elevated error rates (2.3%). Incident investigating. 12 tenants affected.',
    timestamp: '3 hours ago',
    read: false,
  },
  {
    id: '5',
    icon: DollarSign,
    color: '#10B981',
    bgColor: '#D1FAE5',
    title: 'Payout Processed',
    message: 'Monthly payout of $12,450 processed to 8 host accounts via Stripe. All transactions succeeded.',
    timestamp: '5 hours ago',
    read: true,
  },
  {
    id: '6',
    icon: CreditCard,
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    title: 'Subscription Upgraded',
    message: '"Grand Palace Hotel" upgraded from Professional to Enterprise. New MRR contribution: $599/mo.',
    timestamp: '8 hours ago',
    read: true,
  },
  {
    id: '7',
    icon: AlertTriangle,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    title: 'High Error Rate Alert',
    message: 'Error rate exceeded 1.5% threshold for 10 minutes. Current: 1.8%. Triggered by payment webhook failures.',
    timestamp: '12 hours ago',
    read: true,
  },
  {
    id: '8',
    icon: Shield,
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    title: 'New Admin Invited',
    message: 'Support agent "Rajesh Kumar" invited with Support role. Pending email verification.',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: '9',
    icon: Settings,
    color: '#6B7280',
    bgColor: '#F3F4F6',
    title: 'Settings Changed',
    message: 'Platform maintenance mode enabled by SuperAdmin. Maintenance window: Jan 20, 2:00 AM - 4:00 AM NPT.',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: '10',
    icon: Building2,
    color: '#10B981',
    bgColor: '#D1FAE5',
    title: 'Tenant Restored',
    message: '"Valley View Resort" restored from suspended status. Services reactivated. Subscription resumed.',
    timestamp: '2 days ago',
    read: true,
  },
]

export default function SuperAdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  if (notifications.length === 0) {
    return (
      <div className="max-w-3xl">
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Bell size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h2>
          <p className="text-sm text-gray-400">You're all caught up!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2E86AB] text-white">
                {unreadCount} new
              </span>
            )}
          </h2>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-[#2E86AB] hover:text-[#1a6b8a] bg-transparent cursor-pointer transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="divide-y divide-gray-100">
          {notifications.map(notification => {
            const Icon = notification.icon
            return (
              <div
                key={notification.id}
                className={`flex items-start gap-4 px-6 py-4 transition-colors ${
                  !notification.read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: notification.bgColor }}
                >
                  <Icon size={18} style={{ color: notification.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {!notification.read && (
                        <Circle size={8} className="text-[#2E86AB]" fill="#2E86AB" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-gray-400">{notification.timestamp}</span>
                    <div className="flex gap-1.5">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Check size={10} /> Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={10} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
