import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, CreditCard, Package, DollarSign, BarChart3, Code,
  Activity, Layers, Eye, FileText, Flag, Settings, Puzzle, Shield, Users, Key,
  ChevronsLeft, ChevronsRight, X, LogOut, MessageSquare, Megaphone,
  ChevronDown, List, UserPlus, Bell, Mail,
} from 'lucide-react'
import { sidebarSections } from '../../data/superAdminNav'
import { superAdminLogout } from '../../lib/auth-utils'
import logo1 from '/logo1.png'

const iconMap: Record<string, typeof LayoutDashboard> = {
  Building2, CreditCard, Package, DollarSign, BarChart3, Code,
  Activity, Layers, Eye, FileText, Flag, Settings, Puzzle, Shield, Users, Key,
  MessageSquare, Megaphone, List, UserPlus, Bell, Mail,
}

interface SuperAdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

// ── Shared sidebar nav content (rendered in both mobile & desktop) ──

function SidebarNav({ collapsed, onMobileClose }: { collapsed: boolean; onMobileClose?: () => void }) {
  const location = useLocation()
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const handleClick = () => onMobileClose?.()

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const toggleSection = (label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isDropdownOpen = (label: string) => openDropdowns[label] || false
  const isSectionOpen = (label: string) => openSections[label] || false

  const isChildActive = (children: { path?: string }[]) =>
    children.some(child => child.path && location.pathname === child.path)

  const isSectionChildActive = (items: { path?: string; children?: { path?: string }[] }[]) =>
    items.some(item => {
      if (item.path && location.pathname === item.path) return true
      if (item.children) return item.children.some(child => child.path && location.pathname === child.path)
      return false
    })

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-3 custom-scroll">
      {/* Dashboard */}
      <NavLink
        to="/superadmin"
        end
        onClick={handleClick}
        className={({ isActive }) =>
          `flex items-center gap-3 mb-1 rounded-lg transition-all duration-150 ${
            collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
          } ${
            isActive
              ? 'bg-[#2E86AB]/20 text-[#57B8D9]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`
        }
      >
        <LayoutDashboard size={18} className="shrink-0" />
        {!collapsed && <span className="text-[14px] font-medium text-white">Dashboard</span>}
      </NavLink>

      {/* Sections */}
      {sidebarSections.map((section) => {
        const sectionOpen = collapsed ? true : isSectionOpen(section.label)
        const sectionActive = isSectionChildActive(section.items)

        return (
          <div key={section.label} className="mt-4">
            {/* Section header — clickable dropdown */}
            {!collapsed ? (
              <button
                onClick={() => toggleSection(section.label)}
                className={`w-full flex items-center gap-2 px-3 mb-1.5 rounded-lg transition-all duration-150 ${
                  sectionActive
                    ? 'text-[#57B8D9]'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                <ChevronDown
                  size={12}
                  className={`shrink-0 transition-transform duration-200 ${sectionOpen ? 'rotate-0' : '-rotate-90'}`}
                />
                <span className="text-[12px] font-semibold tracking-[1.5px] uppercase text-white">
                  {section.label}
                </span>
              </button>
            ) : (
              <div className="mx-auto mb-1.5 w-5 h-px bg-white/10" />
            )}

            {/* Section items */}
            {sectionOpen && section.items.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard
            const hasChildren = item.children && item.children.length > 0
            const isOpen = isDropdownOpen(item.label)
            const active = hasChildren ? isChildActive(item.children!) : location.pathname === item.path

            // Dropdown item (has children)
            if (hasChildren) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`w-full flex items-center gap-3 rounded-lg transition-all duration-150 mb-0.5 ${
                      collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'
                    } ${
                      active
                        ? 'bg-[#2E86AB]/20 text-[#57B8D9]'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="text-[12.5px] font-medium truncate flex-1 text-left">{item.label}</span>
                        <ChevronDown size={14} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>
                  {/* Dropdown children */}
                  {isOpen && !collapsed && item.children && (
                    <div className="ml-4 mt-0.5 mb-1">
                      {item.children.map((child) => {
                        const ChildIcon = iconMap[child.icon] || LayoutDashboard
                        const isChildActiveNow = child.path && location.pathname === child.path
                        return (
                          <NavLink
                            key={child.path}
                            to={child.path!}
                            onClick={handleClick}
                            className={`flex items-center gap-3 rounded-lg transition-all duration-150 mb-0.5 px-3 py-1.5 ${
                              isChildActiveNow
                                ? 'bg-[#2E86AB]/20 text-[#57B8D9]'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <ChildIcon size={14} className="shrink-0" />
                            <span className="text-[11.5px] font-medium truncate">{child.label}</span>
                          </NavLink>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Regular item (no children)
            return (
              <NavLink
                key={item.path}
                to={item.path!}
                onClick={handleClick}
                className={`flex items-center gap-3 rounded-lg transition-all duration-150 mb-0.5 ${
                  collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'
                } ${
                  active
                    ? 'bg-[#2E86AB]/20 text-[#57B8D9]'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={16} className="shrink-0" />
                {!collapsed && (
                  <span className="text-[12.5px] font-medium truncate">{item.label}</span>
                )}
              </NavLink>
            )
          })}
        </div>
        )
      })}
    </nav>
  )
}

// ── Sidebar main component ──

export default function SuperAdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SuperAdminSidebarProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    superAdminLogout()
    navigate('/superadmin/login')
  }

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar (overlay) — always shows full labels */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col transition-all duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: 256,
          background: 'linear-gradient(180deg, #0B1120 0%, #0F1B2D 100%)',
        }}
      >
        {/* Close button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-[64px] border-b border-white/8 shrink-0">
          <img src={logo1} alt="ServeIQ" className="w-9 h-9 object-contain shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[15px] font-bold text-white tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
              Serve<span style={{ color: '#57B8D9' }}>IQ</span>
            </span>
            <span className="text-[10px] text-white/40 font-medium tracking-wider uppercase">Admin Portal</span>
          </div>
        </div>

        {/* Nav — always expanded on mobile */}
        <SidebarNav collapsed={false} onMobileClose={onMobileClose} />
      </aside>

      {/* Desktop Sidebar (fixed) */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-30 flex-col transition-all duration-300 hidden lg:flex"
        style={{
          width: collapsed ? 72 : 256,
          background: 'linear-gradient(180deg, #0B1120 0%, #0F1B2D 100%)',
        }}
      >
        {/* Logo + Collapse */}
        <div className="flex items-center justify-between px-5 h-[64px] border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo1} alt="ServeIQ" className="w-9 h-9 object-contain shrink-0" />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-bold text-white tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Serve<span style={{ color: '#57B8D9' }}>IQ</span>
                </span>
                <span className="text-[10px] text-white/40 font-medium tracking-wider uppercase">Admin Portal</span>
              </div>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <SidebarNav collapsed={collapsed} />

        {/* Logout */}
        <div className="border-t border-white/8 px-3 py-3 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-red-400 hover:text-red-300 hover:bg-white/5 transition-all duration-150"
          >
            <LogOut size={16} />
            {!collapsed && <span className="text-[12.5px] font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
