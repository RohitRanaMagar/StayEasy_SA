import { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { User, Settings, Bell, Activity, LogOut, ChevronDown, UserX, CreditCard, Users, Server } from 'lucide-react'
import { ToastProvider } from './Toast'
import { useSuperAdminStore } from './superAdminStore'
import { superAdminLogout } from '../../lib/auth-utils'
import logo1 from '/logo1.png'

const sidebarItems = [
  { label: 'Profile', icon: User, path: '/superadmin/profile' },
  { label: 'Settings', icon: Settings, path: '/superadmin/profile/settings' },
  { label: 'Notifications', icon: Bell, path: '/superadmin/profile/notifications' },
  { label: 'Activity', icon: Activity, path: '/superadmin/profile/activity' },
]

export default function SuperAdminProfileLayout() {
  const navigate = useNavigate()
  const profile = useSuperAdminStore(s => s.profile)
  const isProfileComplete = useSuperAdminStore(s => s.isProfileComplete)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    superAdminLogout()
    navigate('/superadmin/login')
  }

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F1F5F9] flex">
        {/* Mobile Overlay */}
        {isProfileComplete && mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Sidebar — only when profile is complete */}
        {isProfileComplete && (
          <>
            {/* Mobile Sidebar */}
            <aside
              className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col transition-all duration-300 lg:hidden ${
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
              style={{ width: 240, background: 'linear-gradient(180deg, #0B1120 0%, #0F1B2D 100%)' }}
            >
              <SidebarNav onNavigate={() => setMobileOpen(false)} onLogout={handleLogout} />
            </aside>

            {/* Desktop Sidebar */}
            <aside
              className="fixed left-0 top-0 bottom-0 z-30 hidden lg:flex flex-col transition-all duration-300"
              style={{ width: 240, background: 'linear-gradient(180deg, #0B1120 0%, #0F1B2D 100%)' }}
            >
              <SidebarNav onLogout={handleLogout} />
            </aside>
          </>
        )}

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isProfileComplete ? 'lg:ml-[240px]' : ''}`}>
          {/* Navbar — only when profile is complete */}
          {isProfileComplete && (
            <header className="flex items-center justify-between h-[64px] px-4 sm:px-6 bg-white border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-gray-900 truncate" style={{ fontFamily: "'Sora', sans-serif" }}>Profile</h1>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">Manage your account and platform configuration</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-400 hidden sm:block">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}{' '}
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
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
                <div ref={menuRef} className="relative">
                  <button
                    onClick={() => setMenuOpen(v => !v)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #1A3C5E, #2E86AB)' }}>
                      {profile.fullName?.charAt(0) || 'S'}
                    </div>
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
                          onClick={() => { navigate('/superadmin/profile/settings'); setMenuOpen(false) }}
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
          )}

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}

function SidebarNav({ onNavigate, onLogout }: { onNavigate?: () => void; onLogout?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col">
      <div className="flex items-center gap-3 px-3 mb-4 pb-4 border-b border-white/8">
        <img src={logo1} alt="ServeIQ" className="w-8 h-8 object-contain shrink-0" />
        <span className="text-[14px] font-bold text-white tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
          Serve<span style={{ color: '#57B8D9' }}>IQ</span>
        </span>
      </div>
      {sidebarItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/superadmin/profile'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 mb-0.5 ${
                isActive
                  ? 'bg-[#2E86AB]/20 text-[#57B8D9]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={16} className="shrink-0" />
            <span className="text-[12.5px] font-medium truncate">{item.label}</span>
          </NavLink>
        )
      })}
      <div className="mt-auto border-t border-white/8 pt-3">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-white/5 transition-all duration-150"
        >
          <LogOut size={16} className="shrink-0" />
          <span className="text-[12.5px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  )
}
