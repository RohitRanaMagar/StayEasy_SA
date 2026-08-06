import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { UserCog } from 'lucide-react'
import SuperAdminSidebar from './SuperAdminSidebar'
import SuperAdminNavbar from './SuperAdminNavbar'
import GlobalSearch from './GlobalSearch'
import { ToastProvider } from './Toast'
import { useSuperAdminStore } from './superAdminStore'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/superadmin':                { title: 'Dashboard', subtitle: 'Welcome back, SuperAdmin' },
  '/superadmin/profile':        { title: 'Profile', subtitle: '' },
  '/superadmin/system-health':  { title: 'System Health', subtitle: 'Monitor platform services, incidents, and server performance' },
  '/superadmin/plans':          { title: 'Plans', subtitle: 'Manage subscription plans, pricing tiers, and feature sets' },
  '/superadmin/subscriptions':  { title: 'Subscriptions', subtitle: 'View and manage tenant subscriptions' },
  '/superadmin/feature-flags':  { title: 'Feature Flags', subtitle: 'Control feature availability across the platform' },
  '/superadmin/settings':       { title: 'Settings', subtitle: 'Configure global platform settings and preferences' },
  '/superadmin/payments':       { title: 'Payments', subtitle: 'Track transactions, manage refunds, and reconcile revenue' },
  '/superadmin/audit-logs':     { title: 'Audit Logs', subtitle: 'Track all admin activities and system events' },
  '/superadmin/integrations':   { title: 'Integrations', subtitle: 'Connect third-party services, manage API keys, and configure webhooks' },
  '/superadmin/usage-billing':  { title: 'Usage & Billing', subtitle: 'Monitor resource consumption, track overage charges, and manage tenant quotas' },
  '/superadmin/monitoring':     { title: 'Monitoring', subtitle: 'Real-time platform monitoring, alerts, and uptime tracking' },
  '/superadmin/logs':            { title: 'Logs', subtitle: 'View and search system logs across all services' },
  '/superadmin/background-jobs': { title: 'Background Jobs', subtitle: 'Monitor job queues, retries, worker pools, and scheduled tasks' },
  '/superadmin/api-management': { title: 'API Management', subtitle: 'Manage API keys, rate limits, webhooks, and usage monitoring' },
  '/superadmin/tenants':       { title: 'Tenants', subtitle: 'Manage platform tenants, properties, subscriptions, and access' },
  '/superadmin/tenants/analytics': { title: 'Tenant Analytics', subtitle: 'View tenant performance, revenue, and distribution metrics' },
  '/superadmin/tenants/billing':   { title: 'Tenant Billing', subtitle: 'Manage billing, invoices, and payment history' },
  '/superadmin/tenants/onboarding': { title: 'Tenant Onboarding', subtitle: 'Track new tenant setup progress' },
  '/superadmin/admins-roles':   { title: 'Admins & Roles', subtitle: 'Manage admin users, roles, and permissions' },
  '/superadmin/api-keys':      { title: 'API Keys', subtitle: 'Manage and monitor API keys, permissions, and usage' },
  '/superadmin/tickets':       { title: 'Support Tickets', subtitle: 'Manage escalated issues from tenant admins' },
  '/superadmin/announcements': { title: 'Announcements', subtitle: 'Send platform-wide announcements to tenants' },
}

export default function SuperAdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const impersonation = useSuperAdminStore(s => s.impersonation)
  const stopImpersonation = useSuperAdminStore(s => s.stopImpersonation)

  const pageInfo = pageTitles[location.pathname] || { title: 'Dashboard', subtitle: 'Welcome back, SuperAdmin' }
  return (
    <ToastProvider>
    <div className="min-h-screen bg-[#F1F5F9]">
      <SuperAdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div
        className={`flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[256px]'
        }`}
      >
        <SuperAdminNavbar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onToggleMobile={() => setMobileSidebarOpen(v => !v)}
        />

        {/* Global Impersonation Banner */}
        {impersonation.active && (
          <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCog size={14} />
              <span className="text-[12px] font-medium">
                Impersonating: <strong>{impersonation.tenantName}</strong>
                {impersonation.startedAt && <span className="ml-2 text-amber-100">| Started: {impersonation.startedAt}</span>}
              </span>
            </div>
            <button onClick={stopImpersonation}
              className="text-[11px] font-medium text-white bg-amber-600 px-3 py-1 rounded-lg hover:bg-amber-700 transition-colors">
              Stop Impersonation
            </button>
          </div>
        )}

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Search (Cmd+K) */}
      <GlobalSearch />
      </div>
    </ToastProvider>
  )
}
