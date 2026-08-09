import { Bell, ChevronDown, LogOut, Settings, User, Menu, UserX, CreditCard, Users, Server, RotateCw, Calendar } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSuperAdminStore } from './superAdminStore'

interface SuperAdminNavbarProps {
  title: string
  subtitle?: string
  onToggleMobile: () => void
}

export default function SuperAdminNavbar({ title, subtitle, onToggleMobile }: SuperAdminNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const profile = useSuperAdminStore(s => s.profile)

  const isProfilePage = location.pathname.startsWith('/superadmin/profile')

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('tempToken')
    localStorage.removeItem('userType')
    localStorage.removeItem('isProfileComplete')
    navigate('/superadmin/login')
  }

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const now = new Date()
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  return (
    <header className="flex items-center justify-between h-[64px] px-4 sm:px-6 bg-white border-b border-gray-100 shrink-0">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger - visible only on mobile (< lg) */}
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>

      {/* Center: Date */}
      <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
        <Calendar size={16} className="text-gray-400" />
        <span>{dayStr}, {dateStr} • {timeStr}</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Refresh Button - hidden on profile pages */}
        {!isProfilePage && (
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            title="Refresh page"
          >
            <RotateCw size={16} />
          </button>
        )}

        {/* Notifications */}
        <div className="relative group">
          <button
            onClick={() => navigate('/superadmin/profile/notifications')}
            className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Hover Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full">4</span>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <UserX size={14} className="text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-gray-800">Tenant Suspended</p>
                  <p className="text-[10px] text-gray-400 truncate">Hotel Everest suspended</p>
                </div>
                <span className="text-[9px] text-gray-400 shrink-0 mt-0.5">15m</span>
              </div>
              <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard size={14} className="text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-gray-800">Payment Failed</p>
                  <p className="text-[10px] text-gray-400 truncate">$299 from Mountain View Resort</p>
                </div>
                <span className="text-[9px] text-gray-400 shrink-0 mt-0.5">1h</span>
              </div>
              <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Users size={14} className="text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-gray-800">New Tenant Signup</p>
                  <p className="text-[10px] text-gray-400 truncate">Lakeside Inn joined</p>
                </div>
                <span className="text-[9px] text-gray-400 shrink-0 mt-0.5">2h</span>
              </div>
              <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Server size={14} className="text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-gray-800">System Incident</p>
                  <p className="text-[10px] text-gray-400 truncate">API Gateway errors</p>
                </div>
                <span className="text-[9px] text-gray-400 shrink-0 mt-0.5">3h</span>
              </div>
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
        </div>

        {/* SA Badge */}
        <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #1A3C5E, #2E86AB)' }}>
          SA
        </div>

        {/* Profile */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">{profile.fullName || 'SuperAdmin'}</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <p className="text-sm font-semibold text-gray-900">{profile.fullName}</p>
                <p className="text-xs text-gray-400">{profile.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { navigate('/superadmin/profile'); setMenuOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <User size={15} /> Profile
                </button>
                <button
                  onClick={() => { navigate('/superadmin/settings'); setMenuOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={15} /> Settings
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
