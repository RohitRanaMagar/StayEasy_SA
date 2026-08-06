import type { SidebarSection } from '../types/superadmin'

export const sidebarSections: SidebarSection[] = [
  {
    label: 'PLATFORM',
    items: [
      {
        label: 'Tenants', icon: 'Building2',
        children: [
          { label: 'Tenant List', icon: 'List', path: '/superadmin/tenants' },
          { label: 'Tenant Analytics', icon: 'BarChart3', path: '/superadmin/tenants/analytics' },
          { label: 'Tenant Billing', icon: 'CreditCard', path: '/superadmin/tenants/billing' },
          { label: 'Tenant Onboarding', icon: 'UserPlus', path: '/superadmin/tenants/onboarding' },
        ],
      },
      { label: 'Subscriptions', icon: 'CreditCard', path: '/superadmin/subscriptions' },
      { label: 'Plans', icon: 'Package', path: '/superadmin/plans' },
      { label: 'Payments', icon: 'DollarSign', path: '/superadmin/payments' },
      { label: 'Usage & Billing', icon: 'BarChart3', path: '/superadmin/usage-billing' },
      { label: 'API Management', icon: 'Code', path: '/superadmin/api-management' },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { label: 'System Health', icon: 'Activity', path: '/superadmin/system-health' },
      { label: 'Background Jobs', icon: 'Layers', path: '/superadmin/background-jobs' },
      { label: 'Monitoring', icon: 'Eye', path: '/superadmin/monitoring' },
      { label: 'Logs', icon: 'FileText', path: '/superadmin/logs' },
      { label: 'Tickets', icon: 'MessageSquare', path: '/superadmin/tickets' },
    ],
  },
  {
    label: 'CONFIGURATION',
    items: [
      { label: 'Feature Flags', icon: 'Flag', path: '/superadmin/feature-flags' },
      { label: 'Settings', icon: 'Settings', path: '/superadmin/settings' },
      { label: 'Integrations', icon: 'Puzzle', path: '/superadmin/integrations' },
    ],
  },
  {
    label: 'COMMUNICATION',
    items: [
      { label: 'Announcements', icon: 'Megaphone', path: '/superadmin/announcements' },
      { label: 'Notifications', icon: 'Bell', path: '/superadmin/notifications' },
      { label: 'Message Inbox', icon: 'Mail', path: '/superadmin/inbox' },
    ],
  },
  {
    label: 'SECURITY',
    items: [
      { label: 'Audit Logs', icon: 'Shield', path: '/superadmin/audit-logs' },
      { label: 'Admins & Roles', icon: 'Users', path: '/superadmin/admins-roles' },
      { label: 'API Keys', icon: 'Key', path: '/superadmin/api-keys' },
    ],
  },
]
