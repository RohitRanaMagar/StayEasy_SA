import { create } from 'zustand'
import type {
  SuperAdminTenant, SuperAdminAuditLog, SuperAdminRevenueData,
  Plan, Subscription, BillingInvoice, PlanChangeLog,
  SuperAdminFeatureFlag, TenantFeatureOverride, TenantBrandingConfig,
  PlatformSettings,
  PaymentTransaction, PaymentRefund, PayoutSummary,
  AdminUser, AdminRole, ApiKeyEntry,
  ServiceStatus, IncidentItem, ResourceMetric, DependencyCheck, ServerNode,
  FeatureFlagActivity, DashboardStats,
  SuperAdminProfile, PlatformSetupConfig,
  SupportTicket, TicketMessage, Announcement,
  TenantExtended,
} from '../../types/superadmin'
import {
  mockTenants, mockPlans, mockSubscriptions,
  mockBillingInvoices, mockPlanChangeLogs,
  mockFeatureFlags, mockTenantOverrides, mockBrandingConfigs,
  mockTransactions, mockRefunds, mockPayoutSummary,
  mockAdminUsers, mockAdminRoles, mockApiKeys, mockAuditLogs,
  mockTickets, mockAnnouncements, mockSettings,
} from '../../data/superAdminMockData'
import { mockSuperAdminLogin, saveCredentials } from '../../lib/superadmin-mock-auth'

// ─── Helper: generate unique IDs ──────────────────────────
let _counter = Date.now()
function uid(prefix = 'gen'): string {
  return `${prefix}_${++_counter}`
}

function now(): string {
  const d = new Date()
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// ─── Dashboard derived stats ──────────────────────────────
function calcDashboardStats(tenants: SuperAdminTenant[], subs: Subscription[]): DashboardStats {
  const activeTenants = tenants.filter(t => t.status === 'Active').length
  const activeSubs = subs.filter(s => s.status === 'active').length
  const mrr = subs
    .filter(s => s.status === 'active' || s.status === 'trialing')
    .reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.price : s.price / 12), 0)
  const churned = subs.filter(s => s.status === 'canceled').length
  const churnRate = subs.length > 0 ? (churned / subs.length) * 100 : 0

  return {
    totalTenants: tenants.length,
    totalTenantsChange: activeTenants,
    activeSubscriptions: activeSubs,
    activeSubscriptionsChange: Math.round(activeSubs * 0.04),
    mrr: Math.round(mrr),
    mrrChangePercent: parseFloat((mrr > 0 ? ((mrr - mrr / 1.08) / (mrr / 1.08)) * 100 : 0).toFixed(1)),
    churnRate: parseFloat(churnRate.toFixed(1)),
    churnRateChange: parseFloat((churnRate * 0.1).toFixed(1)),
    apiCallsToday: `${(Math.floor(Math.random() * 500) + 800)}K`,
    apiCallsChangePercent: parseFloat((Math.random() * 15 + 5).toFixed(1)),
  }
}

function calcRevenueData(subs: Subscription[]): SuperAdminRevenueData[] {
  // Last 6 months relative to today
  const now = new Date()
  const months: { label: string; year: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), year: d.getFullYear() })
  }
  return months.map((m, i) => ({
    month: `${m.label} ${m.year}`,
    revenue: subs
      .filter(s => s.status === 'active' || s.status === 'trialing')
      .reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.price : s.price / 12), 0) *
      (0.7 + i * 0.06),
  }))
}

// ─── Store Interface ──────────────────────────────────────
interface SuperAdminStore {
  // Data
  tenants: SuperAdminTenant[]
  plans: Plan[]
  subscriptions: Subscription[]
  billingInvoices: BillingInvoice[]
  planChangeLogs: PlanChangeLog[]
  featureFlags: SuperAdminFeatureFlag[]
  tenantOverrides: TenantFeatureOverride[]
  brandingConfigs: TenantBrandingConfig[]
  featureFlagActivities: FeatureFlagActivity[]
  settings: PlatformSettings
  transactions: PaymentTransaction[]
  refunds: PaymentRefund[]
  payoutSummary: PayoutSummary
  adminUsers: AdminUser[]
  adminRoles: AdminRole[]
  apiKeys: ApiKeyEntry[]
  auditLogs: SuperAdminAuditLog[]

  // Profile
  profile: SuperAdminProfile
  isProfileComplete: boolean
  platformConfig: PlatformSetupConfig

  // Impersonation
  impersonation: {
    active: boolean
    tenantId: string | null
    tenantName: string | null
    token: string | null
    startedAt: string | null
  }

  // Support Tickets (SA-007)
  tickets: SupportTicket[]

  // Announcements (SA-008)
  announcements: Announcement[]

  // System health (mostly static)
  systemHealth: { uptime: string; status: string; cpuUsage: number; memoryUsage: number; diskUsage: number; activeConnections: number; requestsPerSecond: number; avgResponseTime: number; errorRate: number; throughput: number; serverUptime: number; serverUptimeChange: number; errorRateChange: number; queueDepth: number; queueDepthChange: number; cacheHitRatio: number; cacheHitRatioChange: number } | null
  servicesStatus: ServiceStatus[]
  incidents: IncidentItem[]
  cpuMetrics: ResourceMetric
  memoryMetrics: ResourceMetric
  diskIOMetrics: ResourceMetric
  networkMetrics: ResourceMetric
  dependencyChecks: DependencyCheck[]
  serverNodes: ServerNode[]
  hourlyLabels: string[]

  // Derived
  dashboardStats: DashboardStats
  revenueData: SuperAdminRevenueData[]

  // ─── Actions ────────────────────────────────────────────

  // Auth (Backend API)
  login: (email: string, password: string, rememberme?: boolean) => Promise<{ forcePasswordChange: boolean; isProfileComplete: boolean }>
  logout: () => void
  fetchProfile: () => Promise<void>

  // Tenants
  addTenant: (t: Omit<SuperAdminTenant, 'id'>) => void
  updateTenant: (id: string, data: Partial<SuperAdminTenant>) => void
  deleteTenant: (id: string) => void
  suspendTenant: (id: string) => void
  restoreTenant: (id: string) => void
  bulkSuspend: (ids: string[]) => void
  bulkDelete: (ids: string[]) => void
  editTenant: (id: string, data: Partial<TenantExtended>) => void
  changeTenantPlan: (id: string, newPlan: string, price: number) => void

  // Plans
  addPlan: (p: Omit<Plan, 'id'>) => void
  updatePlan: (id: string, data: Partial<Plan>) => void
  archivePlan: (id: string) => void
  duplicatePlan: (id: string) => void

  // Subscriptions
  addSubscription: (s: Omit<Subscription, 'id'>) => void
  updateSubscription: (id: string, data: Partial<Subscription>) => void
  cancelSubscription: (id: string) => void
  pauseSubscription: (id: string) => void
  resumeSubscription: (id: string) => void
  upgradeSubscription: (id: string, newPlanId: string) => void

  // Feature Flags
  addFlag: (f: Omit<SuperAdminFeatureFlag, 'id'>) => void
  updateFlag: (id: string, data: Partial<SuperAdminFeatureFlag>) => void
  toggleFlag: (id: string) => void
  setRollout: (id: string, percent: number) => void
  addOverride: (o: Omit<TenantFeatureOverride, 'id' | 'setAt'>) => void
  removeOverride: (id: string) => void
  updateBranding: (tenantId: string, data: Partial<TenantBrandingConfig>) => void

  // Payments
  addTransaction: (t: Omit<PaymentTransaction, 'id'>) => void
  processRefund: (refund: Omit<PaymentRefund, 'id' | 'processedAt'>) => void
  completeRefund: (id: string) => void

  // Admins
  addAdmin: (a: Omit<AdminUser, 'id'>) => void
  updateAdmin: (id: string, data: Partial<AdminUser>) => void
  deleteAdmin: (id: string) => void

  // API Keys
  addApiKey: (k: Omit<ApiKeyEntry, 'id'>) => void
  revokeApiKey: (id: string) => void
  rotateApiKey: (id: string) => void

  // Settings
  updateSettings: (data: Partial<PlatformSettings>) => void
  resetSettings: () => void

  // Invoices
  generateInvoice: (subId: string) => BillingInvoice
  payInvoice: (id: string) => void
  refundInvoice: (id: string) => void

  // Audit logs
  addAuditLog: (log: Omit<SuperAdminAuditLog, 'id' | 'timestamp'>) => string
  clearAuditLogs: () => void

  // Impersonation
  startImpersonation: (tenantId: string, tenantName: string) => void
  stopImpersonation: () => void

  // Support Tickets (SA-007)
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>) => void
  updateTicket: (id: string, data: Partial<SupportTicket>) => void
  addTicketMessage: (ticketId: string, message: Omit<TicketMessage, 'id' | 'timestamp'>) => void

  // Announcements (SA-008)
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'sentCount'>) => void
  sendAnnouncement: (id: string) => void
  deleteAnnouncement: (id: string) => void

  // Profile
  updateProfile: (data: Partial<SuperAdminProfile>) => void
  uploadProfilePicture: (dataUrl: string) => void
  submitNidVerification: (documentUrl: string) => void
  submitNationalityCardVerification: (documentUrl: string) => void
  changePassword: (newPassword: string) => void
  setProfileComplete: (value: boolean) => void
  setPlatformConfig: (data: Partial<PlatformSetupConfig>) => void

  // Recalculate
  recalcDashboard: () => void
}

// ─── Initial default settings (for reset) ────────────────
const defaultSettings: PlatformSettings = {
  platformName: '',
  platformUrl: '',
  supportEmail: '',
  supportPhone: '',
  timezone: '',
  dateFormat: '',
  timeFormat: '',
  defaultLanguage: '',
  maintenanceMode: false,
  maintenanceMessage: '',
  smtpHost: '',
  smtpPort: 0,
  smtpUsername: '',
  smtpPassword: '',
  smtpEncryption: 'none',
  fromEmail: '',
  fromName: '',
  sendTestEmailTo: '',
  maxEmailsPerHour: 0,
  passwordMinLength: 0,
  passwordRequireSpecialChars: false,
  maxLoginAttempts: 0,
  loginLockoutDuration: 0,
  sessionTimeout: 0,
  requireEmailVerification: false,
  allowedIpAddresses: '',
  adminEmailNotifications: false,
  adminSlackWebhook: '',
  bookingAlertThreshold: 0,
  dailyDigestEnabled: false,
  dailyDigestTime: '',
  supportedLanguages: [],
  supportedCurrencies: [],
  defaultCurrency: '',
  bookingDateFormat: '',
  enableMultiCurrency: false,
  maxFileUploadSize: 0,
  allowedFileTypes: '',
  apiRateLimit: 0,
  maxWebhookRetries: 0,
  logRetentionDays: 0,
  backupRetentionDays: 0,
  autoBackupEnabled: false,
  autoBackupFrequency: 'daily',
  defaultTenantPlan: '',
  trialPeriodDays: 0,
  maxPropertiesFreeTier: 0,
  enableAutoProvision: false,
  tenantQuotaWarningPercent: 0,
  featureFlags: {
    multiLanguage: false,
    channelManager: false,
    advancedAnalytics: false,
    restaurantModule: false,
    customDomains: false,
  },
  paymentGateways: {
    stripe: false,
    razorpay: false,
    wire: false,
  },
}

// ═══════════════════════════════════════════════════════════
// Store
// ═══════════════════════════════════════════════════════════
export const useSuperAdminStore = create<SuperAdminStore>((set, get) => ({
  // ─── Initial Data (seeded from src/data/superAdminMockData) ──
  tenants: mockTenants,
  plans: mockPlans,
  subscriptions: mockSubscriptions,
  billingInvoices: mockBillingInvoices,
  planChangeLogs: mockPlanChangeLogs,
  featureFlags: mockFeatureFlags,
  tenantOverrides: mockTenantOverrides,
  brandingConfigs: mockBrandingConfigs,
  featureFlagActivities: [],
  settings: mockSettings,
  transactions: mockTransactions,
  refunds: mockRefunds,
  payoutSummary: mockPayoutSummary,
  adminUsers: mockAdminUsers,
  adminRoles: mockAdminRoles,
  apiKeys: mockApiKeys,
  auditLogs: mockAuditLogs,
  profile: {
    fullName: 'SuperAdmin',
    email: 'admin@ServeIQ.com',
    phone: '+977-9800000000',
    address: 'Kathmandu, Nepal',
    nationality: 'Nepali',
    profilePicture: null,
    isSeeded: false,
    nidVerification: { status: 'not_submitted' },
    nationalityCardVerification: { status: 'not_submitted' },
    recentActivity: [
      { id: 'act1', type: 'login', description: 'Logged in from Chrome on Windows', timestamp: '2025-01-15 09:30 AM', ip: '192.168.1.100', device: 'Chrome 120, Windows 11' },
      { id: 'act2', type: 'action', description: 'Created subscription plan "Enterprise"', timestamp: '2025-01-14 02:15 PM', ip: '192.168.1.100' },
      { id: 'act3', type: 'login', description: 'Logged in from Firefox on macOS', timestamp: '2025-01-13 11:00 AM', ip: '10.0.0.55', device: 'Firefox 121, macOS' },
      { id: 'act4', type: 'action', description: 'Suspended tenant "Hotel Everest"', timestamp: '2025-01-12 04:45 PM', ip: '192.168.1.100' },
      { id: 'act5', type: 'action', description: 'Updated platform security settings', timestamp: '2025-01-11 10:20 AM', ip: '192.168.1.100' },
    ],
  },
  isProfileComplete: localStorage.getItem('isProfileComplete') === 'true',
  impersonation: {
    active: false,
    tenantId: null,
    tenantName: null,
    token: null,
    startedAt: null,
  },
  tickets: mockTickets,
  announcements: mockAnnouncements,
  platformConfig: {
    platformName: '',
    platformUrl: '',
    timezone: 'Asia/Kathmandu',
    defaultCurrency: 'NPR',
    supportEmail: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    defaultLanguage: 'English',
    dateFormat: 'MMM DD YYYY',
    timeFormat: '12-hour AM/PM',
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    loginLockoutDuration: 15,
    featureFlags: {
      multiLanguage: true,
      channelManager: true,
      advancedAnalytics: true,
      restaurantModule: true,
      customDomains: true,
    },
    paymentGateways: {
      stripe: true,
      razorpay: false,
      wire: false,
    },
    notifications: {
      adminEmailNotifications: true,
      dailyDigestEnabled: true,
      dailyDigestTime: '09:00 AM',
    },
    backup: {
      autoBackupEnabled: true,
      backupFrequency: 'weekly',
      logRetentionDays: 90,
      backupRetentionDays: 30,
    },
    apiLimits: {
      rateLimit: 100,
      maxUploadSize: 10,
      trialPeriodDays: 14,
    },
  },
  systemHealth: {
    uptime: '99.98%', status: 'healthy', cpuUsage: 42, memoryUsage: 68, diskUsage: 54,
    activeConnections: 128, requestsPerSecond: 342, avgResponseTime: 84, errorRate: 0.23,
    throughput: 1840, serverUptime: 99.98, serverUptimeChange: 0.02, errorRateChange: 0.05,
    queueDepth: 12, queueDepthChange: 3, cacheHitRatio: 94.2, cacheHitRatioChange: 1.1,
  },
  servicesStatus: [],
  incidents: [],
  cpuMetrics: { label: 'CPU', current: 0, average: 0, max: 100, unit: '%', data: [] },
  memoryMetrics: { label: 'Memory', current: 0, average: 0, max: 100, unit: '%', data: [] },
  diskIOMetrics: { label: 'Disk I/O', current: 0, average: 0, max: 100, unit: '%', data: [] },
  networkMetrics: { label: 'Network', current: 0, average: 0, max: 100, unit: 'Mbps', data: [] },
  dependencyChecks: [],
  serverNodes: [],
  hourlyLabels: [],

  // ─── Derived (computed from seeded data) ───────────────
  dashboardStats: calcDashboardStats(mockTenants, mockSubscriptions),
  revenueData: calcRevenueData(mockSubscriptions),

  // ─── Auth Actions (Mock) ─────────────────────────────
  login: async (email, password, rememberMe = true) => {
    const result = await mockSuperAdminLogin(email, password)

    if (!result.success) {
      throw new Error(result.error || 'Login failed')
    }

    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('superAdminToken', result.token!)
    storage.setItem('accessToken', result.token!)
    storage.setItem('refreshToken', result.refreshToken!)
    storage.setItem('userType', 'superadmin')

    set({
      isProfileComplete: result.isProfileComplete ?? false,
      profile: {
        ...get().profile,
        email: email,
      },
    })

    return {
      forcePasswordChange: result.forcePasswordChange ?? false,
      isProfileComplete: result.isProfileComplete ?? false,
      isSeeded: false,
    }
  },

  logout: () => {
    ;[localStorage, sessionStorage].forEach(storage => {
    storage.removeItem('accessToken')
    storage.removeItem('refreshToken')
    storage.removeItem('superAdminToken')
    storage.removeItem('tempToken')
    storage.removeItem('userType')
    storage.removeItem('isProfileComplete')
    })
    set({
      isProfileComplete: false,
      impersonation: { active: false, tenantId: null, tenantName: null, token: null, startedAt: null },
    })
  },

  fetchProfile: async () => {
    // Mock: profile is already initialized with default data
  },

  // ─── Helper: recalculate dashboard ─────────────────────
  recalcDashboard: () => {
    const { tenants, subscriptions } = get()
    set({
      dashboardStats: calcDashboardStats(tenants, subscriptions),
      revenueData: calcRevenueData(subscriptions),
    })
  },

  // ─── Helper: add audit log ─────────────────────────────
  addAuditLog: (logData) => {
    const id = uid('log')
    const log: SuperAdminAuditLog = { id, ...logData, timestamp: now() }
    set(s => ({ auditLogs: [log, ...s.auditLogs] }))
    return id
  },

  clearAuditLogs: () => set({ auditLogs: [] }),

  // ─── Impersonation Actions ────────────────────────────────
  startImpersonation: (tenantId, tenantName) => {
    const token = `imp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    set({
      impersonation: {
        active: true,
        tenantId,
        tenantName,
        token,
        startedAt: now(),
      }
    })
    get().addAuditLog({
      admin: 'SuperAdmin',
      action: 'IMPERSONATE_TENANT',
      target: tenantName,
      details: `Started impersonation of tenant "${tenantName}" (ID: ${tenantId})`,
      category: 'security',
      severity: 'warning',
      metadata: { sessionId: token },
    })
  },

  stopImpersonation: () => {
    const { impersonation } = get()
    if (impersonation.active) {
      get().addAuditLog({
        admin: 'SuperAdmin',
        action: 'IMPERSONATE_TENANT',
        target: impersonation.tenantName || 'Unknown',
        details: `Stopped impersonation of tenant "${impersonation.tenantName}"`,
        category: 'security',
        severity: 'info',
        metadata: { sessionId: impersonation.token || undefined },
      })
    }
    set({
      impersonation: {
        active: false,
        tenantId: null,
        tenantName: null,
        token: null,
        startedAt: null,
      }
    })
  },

  // ─── Support Ticket Actions (SA-007) ──────────────────────
  addTicket: (data) => {
    const id = uid('tkt')
    const ticket: SupportTicket = {
      id,
      ...data,
      messages: [],
      createdAt: now(),
      updatedAt: now(),
    }
    set(s => ({ tickets: [ticket, ...s.tickets] }))
    get().addAuditLog({
      admin: 'SuperAdmin',
      action: 'CREATE_TICKET',
      target: data.subject,
      details: `Support ticket created: "${data.subject}" for tenant "${data.tenantName}"`,
      category: 'admin',
      severity: 'info',
    })
  },

  updateTicket: (id, data) => {
    set(s => ({
      tickets: s.tickets.map(t =>
        t.id === id ? { ...t, ...data, updatedAt: now() } : t
      )
    }))
    get().addAuditLog({
      admin: 'SuperAdmin',
      action: 'UPDATE_TICKET',
      target: data.subject || id,
      details: `Ticket ${id} updated`,
      category: 'admin',
      severity: 'info',
    })
  },

  addTicketMessage: (ticketId, message) => {
    const msg: TicketMessage = {
      id: uid('msg'),
      ...message,
      timestamp: now(),
    }
    set(s => ({
      tickets: s.tickets.map(t =>
        t.id === ticketId
          ? { ...t, messages: [...t.messages, msg], updatedAt: now() }
          : t
      )
    }))
  },

  // ─── Announcement Actions (SA-008) ────────────────────────
  addAnnouncement: (data) => {
    const id = uid('ann')
    const announcement: Announcement = {
      id,
      ...data,
      createdAt: now(),
      sentCount: 0,
    }
    set(s => ({ announcements: [announcement, ...s.announcements] }))
    get().addAuditLog({
      admin: 'SuperAdmin',
      action: 'CREATE_ANNOUNCEMENT',
      target: data.title,
      details: `Announcement created: "${data.title}"`,
      category: 'admin',
      severity: 'info',
    })
  },

  sendAnnouncement: (id) => {
    set(s => ({
      announcements: s.announcements.map(a =>
        a.id === id ? {
          ...a,
          status: 'sent',
          sentAt: now(),
          sentCount: 10,
          deliveredTo: a.targetAudience,
        } : a
      )
    }))
    const ann = get().announcements.find(a => a.id === id)
    get().addAuditLog({
      admin: 'SuperAdmin',
      action: 'SEND_ANNOUNCEMENT',
      target: ann?.title || id,
      details: `Announcement "${ann?.title}" sent to ${ann?.targetAudience?.join(', ') || ann?.target} audience`,
      category: 'admin',
      severity: 'info',
    })
  },

  deleteAnnouncement: (id) => {
    const ann = get().announcements.find(a => a.id === id)
    set(s => ({ announcements: s.announcements.filter(a => a.id !== id) }))
    get().addAuditLog({
      admin: 'SuperAdmin',
      action: 'DELETE_ANNOUNCEMENT',
      target: ann?.title || id,
      details: `Announcement "${ann?.title}" deleted`,
      category: 'admin',
      severity: 'warning',
    })
  },

  // ─── Profile Actions ──────────────────────────────────
  updateProfile: (data) => set(s => ({ profile: { ...s.profile, ...data } })),

  uploadProfilePicture: (dataUrl) => set(s => ({
    profile: { ...s.profile, profilePicture: dataUrl }
  })),

  submitNidVerification: (documentUrl) => set(s => ({
    profile: {
      ...s.profile,
      nidVerification: { status: 'pending', submittedAt: now(), documentUrl }
    }
  })),

  submitNationalityCardVerification: (documentUrl) => set(s => ({
    profile: {
      ...s.profile,
      nationalityCardVerification: { status: 'pending', submittedAt: now(), documentUrl }
    }
  })),

  changePassword: (newPassword) => {
    const currentEmail = get().profile.email
    if (currentEmail) {
      saveCredentials(currentEmail, newPassword)
    }
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'PASSWORD_CHANGED', target: 'self',
      details: 'SuperAdmin changed their password',
      category: 'security', severity: 'info', ipAddress: '192.168.1.100',
    })
  },

  setProfileComplete: (value) => {
    if (value) localStorage.setItem('isProfileComplete', 'true')
    else localStorage.removeItem('isProfileComplete')
    set({ isProfileComplete: value })
  },

  setPlatformConfig: (data) => set(s => ({ platformConfig: { ...s.platformConfig, ...data } })),

  // ─── Tenant Actions ────────────────────────────────────
  addTenant: (data) => {
    const id = uid('tnt')
    const tenant: SuperAdminTenant = { id, ...data }
    set(s => ({ tenants: [...s.tenants, tenant] }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'TENANT_CREATED', target: data.name,
      details: `Tenant "${data.name}" created with ${data.plan} plan`,
      category: 'tenant', severity: 'info', ipAddress: '192.168.1.1',
      metadata: { requestMethod: 'POST', requestPath: '/api/tenants', changes: [{ field: 'status', from: '—', to: 'Active' }] },
    })
    get().recalcDashboard()
  },

  updateTenant: (id, data) => {
    const prev = get().tenants.find(t => t.id === id)
    set(s => ({ tenants: s.tenants.map(t => t.id === id ? { ...t, ...data } : t) }))
    if (prev) {
      const changes = Object.entries(data).map(([field, to]) => ({
        field, from: String((prev as any)[field] ?? ''), to: String(to ?? ''),
      }))
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'TENANT_UPDATED', target: prev.name,
        details: `Tenant "${prev.name}" updated (${changes.map(c => c.field).join(', ')})`,
        category: 'tenant', severity: 'info',
        metadata: { changes },
      })
    }
    get().recalcDashboard()
  },

  deleteTenant: (id) => {
    const t = get().tenants.find(x => x.id === id)
    set(s => ({ tenants: s.tenants.filter(x => x.id !== id) }))
    if (t) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'TENANT_DELETED', target: t.name,
        details: `Tenant "${t.name}" permanently deleted`,
        category: 'tenant', severity: 'warning',
      })
    }
    get().recalcDashboard()
  },

  suspendTenant: (id) => {
    const t = get().tenants.find(x => x.id === id)
    set(s => ({ tenants: s.tenants.map(x => x.id === id ? { ...x, status: 'Suspended' } : x) }))
    if (t) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'SUSPEND_TENANT', target: t.name,
        details: `Tenant "${t.name}" suspended — all services deactivated`,
        category: 'tenant', severity: 'warning',
        metadata: { changes: [{ field: 'status', from: 'Active', to: 'Suspended' }] },
      })
    }
    get().recalcDashboard()
  },

  restoreTenant: (id) => {
    const t = get().tenants.find(x => x.id === id)
    set(s => ({ tenants: s.tenants.map(x => x.id === id ? { ...x, status: 'Active' } : x) }))
    if (t) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'TENANT_RESTORED', target: t.name,
        details: `Tenant "${t.name}" restored — services reactivated`,
        category: 'tenant', severity: 'info',
        metadata: { changes: [{ field: 'status', from: 'Suspended', to: 'Active' }] },
      })
    }
    get().recalcDashboard()
  },

  bulkSuspend: (ids) => {
    set(s => ({
      tenants: s.tenants.map(x => ids.includes(x.id) ? { ...x, status: 'Suspended' } : x),
    }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'SUSPEND_TENANT', target: `${ids.length} tenants`,
      details: `Bulk suspended ${ids.length} tenants`,
      category: 'tenant', severity: 'warning',
    })
    get().recalcDashboard()
  },

  bulkDelete: (ids) => {
    set(s => ({ tenants: s.tenants.filter(x => !ids.includes(x.id)) }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'TENANT_DELETED', target: `${ids.length} tenants`,
      details: `Bulk deleted ${ids.length} tenants`,
      category: 'tenant', severity: 'warning',
    })
    get().recalcDashboard()
  },

  editTenant: (id, data) => {
    const prev = get().tenants.find(t => t.id === id)
    set(s => ({ tenants: s.tenants.map(t => t.id === id ? { ...t, ...data } : t) }))
    if (prev) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'TENANT_UPDATED', target: prev.name,
        details: `Tenant "${prev.name}" edited (${Object.keys(data).join(', ')})`,
        category: 'tenant', severity: 'info',
      })
    }
    get().recalcDashboard()
  },

  changeTenantPlan: (id, newPlan, price) => {
    const t = get().tenants.find(x => x.id === id)
    if (!t) return
    const oldPlan = t.plan
    set(s => ({
      tenants: s.tenants.map(x => x.id === id
        ? { ...x, plan: newPlan as 'Free Trial' | 'Basic' | 'Professional' | 'Enterprise', planPrice: price }
        : x),
    }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'UPDATE_PLAN', target: t.name,
      details: `Tenant "${t.name}" plan changed from ${oldPlan} to ${newPlan}`,
      category: 'tenant', severity: 'info',
      metadata: { changes: [{ field: 'plan', from: oldPlan, to: newPlan }] },
    })
    get().planChangeLogs.push({
      id: uid('chg'), tenantName: t.name,
      fromPlan: oldPlan, toPlan: newPlan,
      changedAt: now(), changedBy: 'SuperAdmin', reason: 'Tenant plan change',
    })
    get().recalcDashboard()
  },

  // ─── Plan Actions ──────────────────────────────────────
  addPlan: (data) => {
    const id = uid('plan')
    set(s => ({ plans: [...s.plans, { id, ...data }] }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'PLAN_CREATED', target: data.name,
      details: `Plan "${data.name}" created at $${data.monthlyPrice}/mo`,
      category: 'billing', severity: 'info',
    })
  },

  updatePlan: (id, data) => {
    const prev = get().plans.find(p => p.id === id)
    set(s => ({ plans: s.plans.map(p => p.id === id ? { ...p, ...data } : p) }))
    if (prev) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'UPDATE_PLAN', target: prev.name,
        details: `Plan "${prev.name}" updated`,
        category: 'billing', severity: 'info',
      })
    }
  },

  archivePlan: (id) => {
    const p = get().plans.find(x => x.id === id)
    set(s => ({ plans: s.plans.map(x => x.id === id ? { ...x, status: 'archived' } : x) }))
    if (p) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'PLAN_ARCHIVED', target: p.name,
        details: `Plan "${p.name}" archived`,
        category: 'billing', severity: 'info',
      })
    }
  },

  duplicatePlan: (id) => {
    const source = get().plans.find(p => p.id === id)
    if (!source) return
    const clone: Plan = {
      ...source, id: uid('plan'), name: `${source.name} (Copy)`,
      slug: `${source.slug}-copy`, activeSubscribers: 0, status: 'active',
      createdAt: now(),
    }
    set(s => ({ plans: [...s.plans, clone] }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'PLAN_CREATED', target: clone.name,
      details: `Plan "${clone.name}" duplicated from "${source.name}"`,
      category: 'billing', severity: 'info',
    })
  },

  // ─── Subscription Actions ──────────────────────────────
  addSubscription: (data) => {
    const id = uid('sub')
    set(s => ({ subscriptions: [...s.subscriptions, { id, ...data }] }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'SUBSCRIPTION_CREATED', target: data.tenantName,
      details: `Subscription created for "${data.tenantName}" on ${data.planName} plan`,
      category: 'billing', severity: 'info',
    })
    get().recalcDashboard()
  },

  updateSubscription: (id, data) => {
    const prev = get().subscriptions.find(s => s.id === id)
    set(s => ({ subscriptions: s.subscriptions.map(x => x.id === id ? { ...x, ...data } : x) }))
    if (prev) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'SUBSCRIPTION_UPDATED', target: prev.tenantName,
        details: `Subscription for "${prev.tenantName}" updated`,
        category: 'billing', severity: 'info',
      })
    }
    get().recalcDashboard()
  },

  cancelSubscription: (id) => {
    const s = get().subscriptions.find(x => x.id === id)
    set(subs => ({
      subscriptions: subs.subscriptions.map(x => x.id === id
        ? { ...x, status: 'canceled' as const, autoRenew: false, canceledAt: now() }
        : x),
    }))
    if (s) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'SUBSCRIPTION_CANCELED', target: s.tenantName,
        details: `Subscription for "${s.tenantName}" (${s.planName}) canceled`,
        category: 'billing', severity: 'warning',
      })
      get().planChangeLogs.push({
        id: uid('chg'), tenantName: s.tenantName, fromPlan: s.planName, toPlan: '—',
        changedAt: now(), changedBy: 'SuperAdmin', reason: 'Subscription canceled',
      })
    }
    get().recalcDashboard()
  },

  pauseSubscription: (id) => {
    set(subs => ({
      subscriptions: subs.subscriptions.map(x => x.id === id ? { ...x, status: 'paused' as const } : x),
    }))
    const s = get().subscriptions.find(x => x.id === id)
    if (s) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'SUBSCRIPTION_PAUSED', target: s.tenantName,
        details: `Subscription for "${s.tenantName}" paused`,
        category: 'billing', severity: 'info',
      })
    }
    get().recalcDashboard()
  },

  resumeSubscription: (id) => {
    set(subs => ({
      subscriptions: subs.subscriptions.map(x => x.id === id ? { ...x, status: 'active' as const } : x),
    }))
    const s = get().subscriptions.find(x => x.id === id)
    if (s) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'SUBSCRIPTION_RESUMED', target: s.tenantName,
        details: `Subscription for "${s.tenantName}" resumed`,
        category: 'billing', severity: 'info',
      })
    }
    get().recalcDashboard()
  },

  upgradeSubscription: (id, newPlanId) => {
    const plan = get().plans.find(p => p.id === newPlanId)
    const sub = get().subscriptions.find(s => s.id === id)
    if (!plan || !sub) return
    set(subs => ({
      subscriptions: subs.subscriptions.map(x => x.id === id
        ? { ...x, planId: newPlanId, planName: plan.name, price: plan.monthlyPrice }
        : x),
    }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'UPDATE_PLAN', target: sub.tenantName,
      details: `Subscription for "${sub.tenantName}" changed from ${sub.planName} to ${plan.name}`,
      category: 'billing', severity: 'info',
    })
    get().planChangeLogs.push({
      id: uid('chg'), tenantName: sub.tenantName,
      fromPlan: sub.planName, toPlan: plan.name,
      changedAt: now(), changedBy: 'SuperAdmin', reason: 'Plan upgrade/downgrade',
    })
    get().recalcDashboard()
  },

  // ─── Feature Flag Actions ──────────────────────────────
  addFlag: (data) => {
    const id = uid('ff')
    set(s => ({ featureFlags: [...s.featureFlags, { id, ...data }] }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'FEATURE_FLAG_CREATED', target: data.feature,
      details: `Feature flag "${data.feature}" created`,
      category: 'feature', severity: 'info',
    })
  },

  updateFlag: (id, data) => {
    set(s => ({ featureFlags: s.featureFlags.map(f => f.id === id ? { ...f, ...data } : f) }))
    const flag = get().featureFlags.find(f => f.id === id)
    if (flag) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'UPDATE_FEATURE_FLAG', target: flag.feature,
        details: `Feature flag "${flag.feature}" updated`,
        category: 'feature', severity: 'info',
      })
    }
  },

  toggleFlag: (id) => {
    const flag = get().featureFlags.find(f => f.id === id)
    if (!flag) return
    const newStatus = !flag.status
    set(s => ({ featureFlags: s.featureFlags.map(f => f.id === id ? { ...f, status: newStatus, updatedAt: now() } : f) }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: newStatus ? 'FEATURE_FLAG_ENABLED' : 'FEATURE_FLAG_DISABLED',
      target: flag.feature,
      details: `Feature flag "${flag.feature}" ${newStatus ? 'enabled' : 'disabled'}`,
      category: 'feature', severity: 'info',
      metadata: { changes: [{ field: 'status', from: String(flag.status), to: String(newStatus) }] },
    })
  },

  setRollout: (id, percent) => {
    const flag = get().featureFlags.find(f => f.id === id)
    set(s => ({ featureFlags: s.featureFlags.map(f => f.id === id ? { ...f, rolloutPercent: percent, updatedAt: now() } : f) }))
    if (flag) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'FEATURE_FLAG_ROLLOUT_CHANGED', target: flag.feature,
        details: `Rollout for "${flag.feature}" changed to ${percent}%`,
        category: 'feature', severity: 'info',
      })
    }
  },

  addOverride: (data) => {
    const id = uid('ovr')
    set(s => ({ tenantOverrides: [...s.tenantOverrides, { id, ...data, setAt: now() }] }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'FEATURE_FLAG_OVERRIDE_SET', target: data.tenantName,
      details: `Override set for "${data.tenantName}" on "${data.flagName}"`,
      category: 'feature', severity: 'info',
    })
  },

  removeOverride: (id) => {
    const ovr = get().tenantOverrides.find(o => o.id === id)
    set(s => ({ tenantOverrides: s.tenantOverrides.filter(o => o.id !== id) }))
    if (ovr) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'FEATURE_FLAG_OVERRIDE_REMOVED', target: ovr.tenantName,
        details: `Override removed for "${ovr.tenantName}" on "${ovr.flagName}"`,
        category: 'feature', severity: 'info',
      })
    }
  },

  updateBranding: (tenantId, data) => {
    set(s => ({
      brandingConfigs: s.brandingConfigs.map(b =>
        b.tenantId === tenantId ? { ...b, ...data, updatedAt: now() } : b
      ),
    }))
    const brand = get().brandingConfigs.find(b => b.tenantId === tenantId)
    if (brand) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'BRANDING_UPDATED', target: brand.tenantName,
        details: `Branding for "${brand.tenantName}" updated`,
        category: 'admin', severity: 'info',
      })
    }
  },

  // ─── Payment Actions ───────────────────────────────────
  addTransaction: (data) => {
    const id = uid('txn')
    set(s => ({ transactions: [...s.transactions, { id, ...data }] }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'PAYMENT_RECEIVED', target: data.tenantName,
      details: `Payment of $${data.amount} received from "${data.tenantName}"`,
      category: 'billing', severity: 'info',
    })
    get().recalcDashboard()
  },

  processRefund: (refundData) => {
    const id = uid('ref')
    const refund: PaymentRefund = { id, ...refundData, processedAt: now() }
    set(s => ({
      refunds: [...s.refunds, refund],
      transactions: s.transactions.map(t =>
        t.id === refundData.transactionId ? { ...t, status: 'refunded' as const } : t
      ),
    }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'REFUND_ISSUED', target: refundData.tenantName,
      details: `Refund of $${refundData.amount} issued to "${refundData.tenantName}" — ${refundData.reason}`,
      category: 'billing', severity: 'warning',
    })
    get().recalcDashboard()
  },

  completeRefund: (id) => {
    set(s => ({
      refunds: s.refunds.map(r => r.id === id ? { ...r, status: 'completed' as const, processedAt: now() } : r),
    }))
  },

  // ─── Admin Actions ──────────────────────────────────────
  addAdmin: (data) => {
    const id = uid('adm')
    set(s => ({ adminUsers: [...s.adminUsers, { id, ...data }] }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'ADMIN_INVITED', target: data.name,
      details: `Admin "${data.name}" invited with ${data.role} role`,
      category: 'admin', severity: 'info',
      metadata: { tenantEmail: data.email },
    })
  },

  updateAdmin: (id, data) => {
    set(s => ({ adminUsers: s.adminUsers.map(a => a.id === id ? { ...a, ...data } : a) }))
    const admin = get().adminUsers.find(a => a.id === id)
    if (admin) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'ADMIN_UPDATED', target: admin.name,
        details: `Admin "${admin.name}" updated`,
        category: 'admin', severity: 'info',
      })
    }
  },

  deleteAdmin: (id) => {
    const admin = get().adminUsers.find(a => a.id === id)
    set(s => ({ adminUsers: s.adminUsers.filter(a => a.id !== id) }))
    if (admin) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'ADMIN_DELETED', target: admin.name,
        details: `Admin "${admin.name}" removed`,
        category: 'admin', severity: 'warning',
      })
    }
  },

  // ─── API Key Actions ───────────────────────────────────
  addApiKey: (data) => {
    const id = uid('key')
    set(s => ({ apiKeys: [...s.apiKeys, { id, ...data }] }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'API_KEY_REGENERATED', target: data.name,
      details: `API key "${data.name}" created`,
      category: 'security', severity: 'info',
    })
  },

  revokeApiKey: (id) => {
    const key = get().apiKeys.find(k => k.id === id)
    set(s => ({ apiKeys: s.apiKeys.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k) }))
    if (key) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'API_KEY_REVOKED', target: key.name,
        details: `API key "${key.name}" revoked`,
        category: 'security', severity: 'warning',
      })
    }
  },

  rotateApiKey: (id) => {
    set(s => ({ apiKeys: s.apiKeys.map(k => k.id === id ? { ...k, key: `${k.key.slice(0, 12)}_rotated_${Date.now()}` } : k) }))
    const key = get().apiKeys.find(k => k.id === id)
    if (key) {
      get().addAuditLog({
        admin: 'SuperAdmin', action: 'API_KEY_REGENERATED', target: key.name,
        details: `API key "${key.name}" rotated`,
        category: 'security', severity: 'info',
      })
    }
  },

  // ─── Settings Actions ──────────────────────────────────
  updateSettings: (data) => {
    set(s => ({ settings: { ...s.settings, ...data } }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'SETTINGS_CHANGED', target: 'Platform',
      details: `Platform settings updated (${Object.keys(data).join(', ')})`,
      category: 'system', severity: 'info',
      metadata: { changes: Object.entries(data).map(([field, to]) => ({ field, from: '(previous)', to: String(to) })) },
    })
  },

  resetSettings: () => {
    set({ settings: { ...defaultSettings } })
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'SETTINGS_CHANGED', target: 'Platform',
      details: 'All settings reset to defaults',
      category: 'system', severity: 'warning',
    })
  },

  // ─── Invoice Actions ───────────────────────────────────
  generateInvoice: (subId) => {
    const sub = get().subscriptions.find(s => s.id === subId)
    if (!sub) throw new Error('Subscription not found')
    const invoice: BillingInvoice = {
      id: uid('inv'), subscriptionId: subId,
      tenantName: sub.tenantName, planName: sub.planName,
      amount: sub.price, currency: sub.currency,
      status: 'pending', issuedAt: now(),
      description: `${sub.planName} Plan - Invoice`,
    }
    set(s => ({ billingInvoices: [...s.billingInvoices, invoice] }))
    get().addAuditLog({
      admin: 'SuperAdmin', action: 'INVOICE_SENT', target: sub.tenantName,
      details: `Invoice of $${sub.price} generated for "${sub.tenantName}"`,
      category: 'billing', severity: 'info',
    })
    return invoice
  },

  payInvoice: (id) => {
    set(s => ({
      billingInvoices: s.billingInvoices.map(inv => inv.id === id ? { ...inv, status: 'paid' as const, paidAt: now() } : inv),
    }))
  },

  refundInvoice: (id) => {
    set(s => ({
      billingInvoices: s.billingInvoices.map(inv => inv.id === id ? { ...inv, status: 'refunded' as const } : inv),
    }))
  },
}))
