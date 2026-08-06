// SuperAdmin Types - Extracted from superAdminMockData.ts

export interface SuperAdminTenant {
  id: string
  name: string
  plan: 'Enterprise' | 'Professional' | 'Basic' | 'Free Trial'
  status: 'Active' | 'Suspended' | 'Trialing'
  propertiesCount: number
  subscriptionDate: string
  email: string
  phone?: string
  ownerName?: string
  ownerEmail?: string
  ownerPhone?: string
  monthlyRevenue: number
  logo: string | null
  city?: string
  country?: string
  integrations?: string[]
}

export interface SuperAdminFeatureFlag {
  id: string
  feature: string
  status: boolean
  description: string
  updatedAt: string
  category: string
  scope: 'global' | 'per-tenant'
  rolloutPercent?: number
  dependencies?: string[]
  docsUrl?: string
}

export interface SuperAdminAuditLog {
  id: string
  timestamp: string
  admin: string
  action: string
  target: string
  details: string
  category: 'admin' | 'tenant' | 'system' | 'billing' | 'security' | 'feature'
  severity: 'info' | 'warning' | 'error' | 'critical'
  ipAddress?: string
  userAgent?: string
  metadata?: {
    requestMethod?: string
    requestPath?: string
    duration?: string
    changes?: { field: string; from: string; to: string }[]
    tenantEmail?: string
    sessionId?: string
  }
}

export interface SuperAdminRevenueData {
  month: string
  revenue: number
}

export interface ServiceStatus {
  name: string
  status: 'operational' | 'degraded' | 'down' | 'maintenance'
  uptime: string
  latency: string
  icon: string
  description: string
}

export interface IncidentItem {
  id: string
  title: string
  status: 'resolved' | 'monitoring' | 'investigating' | 'identified'
  severity: 'critical' | 'major' | 'minor'
  timestamp: string
  resolvedAt?: string
  description: string
  services: string[]
}

export interface ResourceMetric {
  label: string
  current: number
  average: number
  max: number
  unit: string
  data: number[]
}

export interface DependencyCheck {
  name: string
  endpoint: string
  status: 'healthy' | 'slow' | 'down'
  latency: string
  lastChecked: string
}

export interface ServerNode {
  id: string
  name: string
  region: string
  cpu: number
  memory: number
  disk: number
  status: 'online' | 'offline' | 'warning'
  uptime: string
}

export interface DashboardStats {
  totalTenants: number
  totalTenantsChange: number
  activeSubscriptions: number
  activeSubscriptionsChange: number
  mrr: number
  mrrChangePercent: number
  churnRate: number
  churnRateChange: number
  apiCallsToday: string
  apiCallsChangePercent: number
}

export interface PlanFeature {
  name: string
  included: boolean
  limit?: string
}

export interface Plan {
  id: string
  name: string
  slug: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  popular: boolean
  color: string
  features: PlanFeature[]
  maxProperties: number
  maxRooms: number
  maxUsers: number
  activeSubscribers: number
  status: 'active' | 'archived' | 'coming-soon'
  createdAt: string
}

export interface Subscription {
  id: string
  tenantId: string
  tenantName: string
  tenantEmail: string
  planId: string
  planName: string
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused'
  billingCycle: 'monthly' | 'yearly'
  price: number
  currency: string
  startDate: string
  currentPeriodEnd: string
  canceledAt?: string
  autoRenew: boolean
  paymentMethod: string
  propertiesCount: number
}

export interface BillingInvoice {
  id: string
  subscriptionId: string
  tenantName: string
  planName: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  issuedAt: string
  paidAt?: string
  description: string
}

export interface PlanChangeLog {
  id: string
  tenantName: string
  fromPlan: string
  toPlan: string
  changedAt: string
  changedBy: string
  reason: string
}

export interface FeatureFlagCategory {
  id: string
  label: string
  description: string
}

export interface TenantFeatureOverride {
  id: string
  tenantId: string
  tenantName: string
  flagId: string
  flagName: string
  overrideValue: boolean
  reason: string
  setBy: string
  setAt: string
  expiresAt?: string
}

export interface TenantBrandingConfig {
  tenantId: string
  tenantName: string
  customDomain: string
  logoUrl: string
  faviconUrl: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  customEmailFrom: string
  isWhiteLabel: boolean
  updatedAt: string
}

export interface FeatureFlagActivity {
  id: string
  flagId: string
  flagName: string
  action: 'enabled' | 'disabled' | 'override_set' | 'override_removed' | 'created' | 'rollout_changed'
  oldValue?: boolean | number
  newValue?: boolean | number
  performedBy: string
  performedAt: string
  details: string
}

export interface PlatformSettings {
  platformName: string
  platformUrl: string
  supportEmail: string
  supportPhone: string
  timezone: string
  dateFormat: string
  timeFormat: string
  defaultLanguage: string
  maintenanceMode: boolean
  maintenanceMessage: string
  smtpHost: string
  smtpPort: number
  smtpUsername: string
  smtpPassword: string
  smtpEncryption: 'ssl' | 'tls' | 'none'
  fromEmail: string
  fromName: string
  sendTestEmailTo: string
  maxEmailsPerHour: number
  passwordMinLength: number
  passwordRequireSpecialChars: boolean
  maxLoginAttempts: number
  loginLockoutDuration: number
  sessionTimeout: number
  requireEmailVerification: boolean
  allowedIpAddresses: string
  adminEmailNotifications: boolean
  adminSlackWebhook: string
  bookingAlertThreshold: number
  dailyDigestEnabled: boolean
  dailyDigestTime: string
  supportedLanguages: string[]
  supportedCurrencies: string[]
  defaultCurrency: string
  bookingDateFormat: string
  enableMultiCurrency: boolean
  maxFileUploadSize: number
  allowedFileTypes: string
  apiRateLimit: number
  maxWebhookRetries: number
  logRetentionDays: number
  backupRetentionDays: number
  autoBackupEnabled: boolean
  autoBackupFrequency: 'daily' | 'weekly' | 'monthly'
  defaultTenantPlan: string
  trialPeriodDays: number
  maxPropertiesFreeTier: number
  enableAutoProvision: boolean
  tenantQuotaWarningPercent: number
  featureFlags: {
    multiLanguage: boolean
    channelManager: boolean
    advancedAnalytics: boolean
    restaurantModule: boolean
    customDomains: boolean
  }
  paymentGateways: {
    stripe: boolean
    razorpay: boolean
    wire: boolean
  }
}

export interface PaymentTransaction {
  id: string
  tenantName: string
  tenantEmail: string
  planName: string
  amount: number
  currency: string
  fee: number
  net: number
  gateway: 'stripe' | 'razorpay' | 'wire' | 'other'
  status: 'succeeded' | 'failed' | 'pending' | 'refunded'
  description: string
  createdAt: string
  invoiceId?: string
}

export interface PaymentRefund {
  id: string
  transactionId: string
  tenantName: string
  amount: number
  currency: string
  reason: string
  status: 'completed' | 'pending' | 'failed'
  createdAt: string
  processedAt?: string
}

export interface PayoutSummary {
  totalRevenue: number
  totalFees: number
  totalRefunds: number
  netRevenue: number
  pendingPayout: number
  lastPayoutAmount: number
  lastPayoutDate: string
  pendingTransactions: number
}

export interface MonthlyRevenueBreakdown {
  month: string
  subscriptions: number
  oneTime: number
  refunds: number
  fees: number
  net: number
}

export interface SettingsChangeLog {
  id: string
  section: string
  setting: string
  oldValue: string
  newValue: string
  changedBy: string
  changedAt: string
}

export interface IntegrationService {
  id: string
  name: string
  description: string
  category: 'payment' | 'communication' | 'analytics' | 'storage' | 'ai' | 'other'
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  logo: string
  connectedAt: string
  lastSyncAt: string
  version: string
  docsUrl: string
  configFields: IntegrationConfigField[]
}

export interface IntegrationConfigField {
  key: string
  label: string
  type: 'text' | 'password' | 'select' | 'toggle'
  value: string
  required: boolean
  options?: string[]
}

export interface ApiKey {
  id: string
  name: string
  key: string
  maskedKey: string
  tenantName: string
  permissions: string[]
  status: 'active' | 'revoked' | 'expired'
  createdAt: string
  lastUsedAt: string
  expiresAt: string
}

export interface WebhookEndpoint {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'disabled' | 'failing'
  secret: string
  createdAt: string
  lastTriggeredAt: string
  successCount: number
  failureCount: number
  tenantName?: string
}

export interface TenantUsage {
  id: string
  tenantName: string
  planName: string
  status: 'active' | 'suspended' | 'trialing' | 'paused'
  apiCalls: number
  apiCallsLimit: number
  storageGB: number
  storageLimit: number
  bandwidthGB: number
  bandwidthLimit: number
  propertiesCount: number
  propertiesLimit: number
  roomsCount: number
  roomsLimit: number
  usersCount: number
  usersLimit: number
  overageCharges: number
  lastBilledAt: string
}

export interface UsageMonthlyBreakdown {
  month: string
  apiCalls: number
  storageGB: number
  bandwidthGB: number
  activeTenants: number
  totalOverageCharges: number
}

export interface OverageCharge {
  id: string
  tenantName: string
  resource: 'api_calls' | 'storage' | 'bandwidth' | 'properties' | 'rooms' | 'users'
  overageAmount: number
  unit: string
  ratePerUnit: number
  totalCharge: number
  currency: string
  billingPeriod: string
  status: 'pending' | 'invoiced' | 'paid' | 'waived'
  issuedAt: string
  paidAt?: string
  description: string
}

export interface AlertRule {
  id: string
  name: string
  description: string
  metric: string
  condition: '>' | '<' | '==' | '>=' | '<='
  threshold: number
  unit: string
  severity: 'critical' | 'warning' | 'info'
  status: 'enabled' | 'disabled'
  lastTriggered: string
  cooldownMinutes: number
}

export interface ActiveAlert {
  id: string
  ruleId: string
  ruleName: string
  severity: 'critical' | 'warning' | 'info'
  status: 'firing' | 'acknowledged' | 'resolved'
  currentValue: string
  threshold: string
  startedAt: string
  acknowledgedAt?: string
  resolvedAt?: string
  description: string
}

export interface UptimeCheck {
  id: string
  name: string
  endpoint: string
  status: 'up' | 'down' | 'slow'
  responseTimeMs: number
  uptime7d: number
  uptime30d: number
  lastChecked: string
  region: string
}

export interface PerformancePoint {
  timestamp: string
  responseTimeMs: number
  errorRatePct: number
  throughput: number
}

export interface AlertHistoryItem {
  id: string
  ruleName: string
  severity: 'critical' | 'warning' | 'info'
  status: 'firing' | 'acknowledged' | 'resolved'
  startedAt: string
  resolvedAt?: string
  duration: string
}

export interface SystemLogEntry {
  id: string
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug'
  source: string
  message: string
  details?: string
  ip?: string
  userId?: string
  requestId?: string
}

export interface JobQueue {
  id: string
  name: string
  description: string
  currentDepth: number
  processedToday: number
  failedToday: number
  avgProcessingTime: string
  workers: number
  status: 'running' | 'paused' | 'degraded' | 'stopped'
  ratePerMinute: number
}

export interface JobEntry {
  id: string
  queue: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying'
  priority: 'high' | 'normal' | 'low'
  createdAt: string
  startedAt?: string
  completedAt?: string
  duration?: string
  retryCount: number
  maxRetries: number
  payload: string
  error?: string
  tenantName?: string
}

export interface ScheduledTask {
  id: string
  name: string
  description: string
  cron: string
  nextRun: string
  lastRun: string
  lastStatus: 'success' | 'failed' | 'skipped'
  enabled: boolean
  queue: string
}

export interface WorkerPool {
  id: string
  name: string
  queue: string
  activeWorkers: number
  maxWorkers: number
  utilization: number
  avgJobDuration: string
  throughput: number
  status: 'active' | 'idle' | 'scaling' | 'stopped'
}

export interface SidebarSection {
  label: string
  items: SidebarItem[]
}

export interface SidebarItem {
  label: string
  icon: string
  path?: string
  children?: SidebarItem[]
}

export interface ApiKeyEntry {
  id: string
  name: string
  key: string
  status: 'active' | 'revoked' | 'expired'
  permissions: string[]
  rateLimit: number
  lastUsed: string
  createdAt: string
  expiresAt: string
  tenantName?: string
  usageThisMonth: number
}

export interface RateLimitPolicy {
  id: string
  name: string
  tier: 'free' | 'basic' | 'pro' | 'enterprise'
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  concurrentLimit: number
  burstLimit: number
}

export interface ApiUsageMetric {
  date: string
  requests: number
  errors: number
  avgLatency: number
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'SuperAdmin' | 'Admin' | 'Support' | 'ReadOnly'
  status: 'active' | 'inactive' | 'invited'
  lastActive: string
  joinedAt: string
  permissions: string[]
  mfaEnabled: boolean
}

export interface AdminRole {
  id: string
  name: string
  description: string
  adminCount: number
  permissions: AdminPermission[]
}

export interface AdminPermission {
  id: string
  name: string
  description: string
  category: 'tenants' | 'billing' | 'system' | 'security' | 'content'
}

export interface TenantExtended {
  id: string
  name: string
  email: string
  phone: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  plan: 'Enterprise' | 'Professional' | 'Basic' | 'Free Trial'
  status: 'Active' | 'Suspended' | 'Trialing'
  subscriptionDate: string
  planPrice: number
  planCycle?: 'monthly' | 'yearly'
  planLabel?: string
  planPerks?: string[]
  billingCycle: 'monthly' | 'yearly'
  paymentMethod: string
  propertiesCount: number
  totalRooms: number
  totalBookings: number
  monthlyRevenue: number
  rating: number
  logo: string | null
  address: string
  city: string
  country: string
  website: string
  timezone: string
  language?: string
  createdAt?: string
  lastActiveAt?: string
  lastPayment?: string
  nextBilling?: string
  featureFlags: {
    customDomain: boolean
    whiteLabel: boolean
    channelManager: boolean
    advancedAnalytics: boolean
    restaurantModule: boolean
    multiLanguage: boolean
  }
  staffCount: number
  integrations: string[]
}

export interface SuperAdminProfile {
  fullName: string
  email: string
  phone: string
  address: string
  nationality: string
  profilePicture: string | null
  isSeeded: boolean
  nidVerification: VerificationStatus
  nationalityCardVerification: VerificationStatus
  recentActivity: ActivityItem[]
}

export interface VerificationStatus {
  status: 'pending' | 'approved' | 'rejected' | 'not_submitted'
  submittedAt?: string
  documentUrl?: string
}

export interface ActivityItem {
  id: string
  type: 'login' | 'action'
  description: string
  timestamp: string
  ip?: string
  device?: string
}

export interface PlatformSetupConfig {
  platformName: string
  platformUrl: string
  timezone: string
  defaultCurrency: string
  supportEmail: string
  smtpHost: string
  smtpPort: number
  smtpUsername: string
  smtpPassword: string
  fromEmail: string
  fromName: string
  defaultLanguage: string
  dateFormat: string
  timeFormat: string
  passwordMinLength: number
  passwordRequireSpecialChars: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  loginLockoutDuration: number
  featureFlags: {
    multiLanguage: boolean
    channelManager: boolean
    advancedAnalytics: boolean
    restaurantModule: boolean
    customDomains: boolean
  }
  paymentGateways: {
    stripe: boolean
    razorpay: boolean
    wire: boolean
  }
  notifications: {
    adminEmailNotifications: boolean
    dailyDigestEnabled: boolean
    dailyDigestTime: string
  }
  backup: {
    autoBackupEnabled: boolean
    backupFrequency: 'daily' | 'weekly' | 'monthly'
    logRetentionDays: number
    backupRetentionDays: number
  }
  apiLimits: {
    rateLimit: number
    maxUploadSize: number
    trialPeriodDays: number
  }
}

// ─── Support Tickets (SA-007) ─────────────────────────────
export interface SupportTicket {
  id: string
  tenantId: string
  tenantName: string
  subject: string
  description: string
  category: 'billing' | 'technical' | 'account' | 'feature_request' | 'bug'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assignedTo?: string
  createdAt: string
  updatedAt: string
  messages: TicketMessage[]
}

export interface TicketMessage {
  id: string
  sender: 'admin' | 'superadmin'
  senderName: string
  message: string
  timestamp: string
}

// ─── Announcements (SA-008) ───────────────────────────────
export interface Announcement {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'maintenance' | 'update'
  target: 'all' | 'selected' | 'plan_based'
  targetPlans?: ('Free Trial' | 'Basic' | 'Professional' | 'Enterprise')[]
  targetTenantIds?: string[]
  sendEmail: boolean
  sendInApp: boolean
  status: 'draft' | 'scheduled' | 'sent'
  scheduledAt?: string
  sentAt?: string
  createdAt: string
  sentCount: number
}
