// ═══════════════════════════════════════════════════════════════
// ServeIQ — SuperAdmin Mock Data
// Single source of truth for all demo / simulated data used across
// the SuperAdmin dashboard. Every array below maps 1:1 to an
// interface in src/types/superadmin.ts.
//
// Convention:
//  • Dates displayed directly by the UI use readable strings: 'Aug 3, 2026'
//  • Dates parsed by the UI (e.g. subscription periods) use ISO strings.
// ═══════════════════════════════════════════════════════════════

import type {
  SuperAdminTenant,
  TenantExtended,
  Plan,
  Subscription,
  BillingInvoice,
  PlanChangeLog,
  SuperAdminFeatureFlag,
  FeatureFlagCategory,
  TenantFeatureOverride,
  TenantBrandingConfig,
  FeatureFlagActivity,
  PlatformSettings,
  PaymentTransaction,
  PaymentRefund,
  PayoutSummary,
  MonthlyRevenueBreakdown,
  AdminUser,
  AdminRole,
  AdminPermission,
  ApiKeyEntry,
  SuperAdminAuditLog,
  SupportTicket,
  Announcement,
  ServiceStatus,
  IncidentItem,
  ResourceMetric,
  DependencyCheck,
  ServerNode,
  SystemLogEntry,
  JobQueue,
  JobEntry,
  ScheduledTask,
  WorkerPool,
  ActiveAlert,
  AlertRule,
  UptimeCheck,
  PerformancePoint,
  AlertHistoryItem,
  TenantUsage,
  UsageMonthlyBreakdown,
  OverageCharge,
  IntegrationService,
  ApiKey,
  WebhookEndpoint,
  RateLimitPolicy,
  ApiUsageMetric,
  SettingsChangeLog,
  OnboardingActivity,
} from '../types/superadmin'

// ═══════════════════════════════════════════════════════════════
// Tenants
// ═══════════════════════════════════════════════════════════════

export const mockTenantsExtended: TenantExtended[] = [
  {
    id: 'tnt_001', name: 'Hotel Everest Kathmandu', email: 'admin@everesthotel.com', phone: '+977-1-4567890',
    plan: 'Enterprise', planPrice: 49999, planCycle: 'monthly', planLabel: 'Enterprise',
    planPerks: ['Unlimited rooms', 'Multi-property', 'Channel manager', '24/7 support'],
    status: 'Active', rating: 4.8, propertiesCount: 3, totalRooms: 120, totalBookings: 2840,
    monthlyRevenue: 284000, staffCount: 45, paymentMethod: 'Stripe',
    subscriptionDate: 'Jan 15, 2025', lastPayment: 'Jul 15, 2026', nextBilling: 'Aug 15, 2026', billingCycle: 'yearly',
    logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=120&h=120&fit=crop',
    ownerName: 'Pemba Sherpa', ownerEmail: 'pemba@everest.com', ownerPhone: '+977-9801234567',
    website: 'www.everesthotel.com', address: 'Thamel, Kathmandu', city: 'Kathmandu', country: 'Nepal',
    timezone: 'Asia/Kathmandu', language: 'English', createdAt: 'Dec 12, 2024', lastActiveAt: 'Aug 5, 2026',
    featureFlags: { customDomain: true, whiteLabel: true, channelManager: true, advancedAnalytics: true, restaurantModule: true, multiLanguage: true },
    integrations: ['Stripe', 'Booking.com', 'GoogleAnalytics', 'Slack'],
    onboardingProgress: 5,
  },
  {
    id: 'tnt_002', name: 'Lakeside Resort Pokhara', email: 'info@lakesideresort.com', phone: '+977-61-555123',
    plan: 'Professional', planPrice: 19999, planCycle: 'monthly', planLabel: 'Professional',
    planPerks: ['Up to 100 rooms', 'Channel manager', 'Analytics dashboard'],
    status: 'Active', rating: 4.5, propertiesCount: 1, totalRooms: 45, totalBookings: 980,
    monthlyRevenue: 98000, staffCount: 18, paymentMethod: 'Stripe',
    subscriptionDate: 'Feb 10, 2025', lastPayment: 'Jul 10, 2026', nextBilling: 'Aug 10, 2026', billingCycle: 'yearly',
    logo: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=120&h=120&fit=crop',
    ownerName: 'Sita Gurung', ownerEmail: 'sita@lakeside.com', ownerPhone: '+977-9802345678',
    website: 'www.lakesideresort.com', address: 'Lakeside, Pokhara', city: 'Pokhara', country: 'Nepal',
    timezone: 'Asia/Kathmandu', language: 'English', createdAt: 'Jan 5, 2025', lastActiveAt: 'Aug 4, 2026',
    featureFlags: { customDomain: false, whiteLabel: false, channelManager: true, advancedAnalytics: true, restaurantModule: false, multiLanguage: true },
    integrations: ['Stripe', 'Razorpay'],
    onboardingProgress: 4,
  },
  {
    id: 'tnt_003', name: 'Budget Stay Chitwan', email: 'hello@budgetstay.com', phone: '+977-56-444888',
    plan: 'Basic', planPrice: 7999, planCycle: 'monthly', planLabel: 'Basic',
    planPerks: ['Up to 30 rooms', 'Basic reports'],
    status: 'Suspended', rating: 3.2, propertiesCount: 1, totalRooms: 18, totalBookings: 120,
    monthlyRevenue: 12000, staffCount: 6, paymentMethod: 'Razorpay',
    subscriptionDate: 'Mar 5, 2025', lastPayment: 'Jun 5, 2026', nextBilling: '—', billingCycle: 'monthly',
    logo: null,
    ownerName: 'Rajan Thapa', ownerEmail: 'rajan@budget.com', ownerPhone: '+977-9803456789',
    website: 'www.budgetstay.com', address: 'Sauraha, Chitwan', city: 'Chitwan', country: 'Nepal',
    timezone: 'Asia/Kathmandu', language: 'Nepali', createdAt: 'Feb 20, 2025', lastActiveAt: 'Jun 28, 2026',
    featureFlags: { customDomain: false, whiteLabel: false, channelManager: false, advancedAnalytics: false, restaurantModule: false, multiLanguage: false },
    integrations: ['Razorpay'],
    onboardingProgress: 1,
  },
  {
    id: 'tnt_004', name: 'Heritage Inn Bhaktapur', email: 'frontdesk@heritageinn.com', phone: '+977-1-6611234',
    plan: 'Professional', planPrice: 249990, planCycle: 'yearly', planLabel: 'Professional',
    planPerks: ['Up to 100 rooms', 'Channel manager'],
    status: 'Active', rating: 4.7, propertiesCount: 2, totalRooms: 62, totalBookings: 1450,
    monthlyRevenue: 145000, staffCount: 25, paymentMethod: 'Stripe',
    subscriptionDate: 'Dec 20, 2024', lastPayment: 'Dec 20, 2025', nextBilling: 'Dec 20, 2026', billingCycle: 'yearly',
    logo: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=120&h=120&fit=crop',
    ownerName: 'Hari Maharjan', ownerEmail: 'hari@heritage.com', ownerPhone: '+977-9804567890',
    website: 'www.heritageinn.com', address: 'Durbar Square, Bhaktapur', city: 'Bhaktapur', country: 'Nepal',
    timezone: 'Asia/Kathmandu', language: 'English', createdAt: 'Nov 15, 2024', lastActiveAt: 'Aug 5, 2026',
    featureFlags: { customDomain: true, whiteLabel: false, channelManager: true, advancedAnalytics: false, restaurantModule: true, multiLanguage: false },
    integrations: ['Stripe', 'Booking.com'],
    onboardingProgress: 4,
  },
  {
    id: 'tnt_005', name: 'Sunrise Beach Resort', email: 'reservations@sunrisebeach.com', phone: '+977-61-777444',
    plan: 'Free Trial', planPrice: 0, planCycle: 'monthly', planLabel: 'Free Trial',
    planPerks: ['14-day trial', 'All Professional features'],
    status: 'Trialing', rating: 4.1, propertiesCount: 1, totalRooms: 24, totalBookings: 45,
    monthlyRevenue: 0, staffCount: 8, paymentMethod: 'Stripe',
    subscriptionDate: 'Jul 28, 2026', lastPayment: '—', nextBilling: 'Aug 11, 2026', billingCycle: 'monthly',
    logo: null,
    ownerName: 'Anita Rai', ownerEmail: 'anita@sunrise.com', ownerPhone: '+977-9805678901',
    website: 'www.sunrisebeach.com', address: 'Pokhara Lakeside', city: 'Pokhara', country: 'Nepal',
    timezone: 'Asia/Kathmandu', language: 'English', createdAt: 'Jul 28, 2026', lastActiveAt: 'Aug 5, 2026',
    featureFlags: { customDomain: false, whiteLabel: false, channelManager: true, advancedAnalytics: true, restaurantModule: false, multiLanguage: false },
    integrations: [],
    onboardingProgress: 3,
  },
  {
    id: 'tnt_006', name: 'Himalaya View Hotel', email: 'bookings@himalayaview.com', phone: '+977-61-556677',
    plan: 'Enterprise', planPrice: 49999, planCycle: 'monthly', planLabel: 'Enterprise',
    planPerks: ['Unlimited rooms', 'Multi-property', 'Channel manager', '24/7 support'],
    status: 'Active', rating: 4.6, propertiesCount: 2, totalRooms: 88, totalBookings: 1720,
    monthlyRevenue: 176000, staffCount: 32, paymentMethod: 'Stripe',
    subscriptionDate: 'May 1, 2025', lastPayment: 'Jul 1, 2026', nextBilling: 'Aug 1, 2026', billingCycle: 'monthly',
    logo: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=120&h=120&fit=crop',
    ownerName: 'Kiran Basnet', ownerEmail: 'kiran@himalayaview.com', ownerPhone: '+977-9806789012',
    website: 'www.himalayaview.com', address: 'Sarangkot, Pokhara', city: 'Pokhara', country: 'Nepal',
    timezone: 'Asia/Kathmandu', language: 'English', createdAt: 'Apr 14, 2025', lastActiveAt: 'Aug 5, 2026',
    featureFlags: { customDomain: true, whiteLabel: true, channelManager: true, advancedAnalytics: true, restaurantModule: false, multiLanguage: true },
    integrations: ['Stripe', 'Booking.com', 'Slack'],
    onboardingProgress: 6,
  },
  {
    id: 'tnt_007', name: 'Garden Retreat Lalitpur', email: 'stay@gardenretreat.com', phone: '+977-1-5522334',
    plan: 'Professional', planPrice: 19999, planCycle: 'monthly', planLabel: 'Professional',
    planPerks: ['Up to 100 rooms', 'Channel manager', 'Analytics dashboard'],
    status: 'Active', rating: 4.4, propertiesCount: 1, totalRooms: 38, totalBookings: 720,
    monthlyRevenue: 74000, staffCount: 14, paymentMethod: 'Wire Transfer',
    subscriptionDate: 'Jun 18, 2025', lastPayment: 'Jul 18, 2026', nextBilling: 'Aug 18, 2026', billingCycle: 'monthly',
    logo: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=120&h=120&fit=crop',
    ownerName: 'Maya Shrestha', ownerEmail: 'maya@gardenretreat.com', ownerPhone: '+977-9807890123',
    website: 'www.gardenretreat.com', address: 'Patan, Lalitpur', city: 'Lalitpur', country: 'Nepal',
    timezone: 'Asia/Kathmandu', language: 'Nepali', createdAt: 'May 25, 2025', lastActiveAt: 'Aug 3, 2026',
    featureFlags: { customDomain: false, whiteLabel: false, channelManager: true, advancedAnalytics: false, restaurantModule: true, multiLanguage: true },
    integrations: ['Stripe', 'GoogleAnalytics'],
    onboardingProgress: 5,
  },
  {
    id: 'tnt_008', name: 'Royal Palace Hotel', email: 'reservations@royalpalace.com', phone: '+977-1-4265152',
    plan: 'Enterprise', planPrice: 499990, planCycle: 'yearly', planLabel: 'Enterprise',
    planPerks: ['Unlimited rooms', 'Multi-property', 'Channel manager', '24/7 support'],
    status: 'Active', rating: 4.9, propertiesCount: 4, totalRooms: 210, totalBookings: 4860,
    monthlyRevenue: 412000, staffCount: 68, paymentMethod: 'Stripe',
    subscriptionDate: 'Sep 1, 2024', lastPayment: 'Sep 1, 2025', nextBilling: 'Sep 1, 2026', billingCycle: 'yearly',
    logo: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=120&h=120&fit=crop',
    ownerName: 'Deepak Joshi', ownerEmail: 'deepak@royalpalace.com', ownerPhone: '+977-9808901234',
    website: 'www.royalpalace.com', address: 'Durbar Marg, Kathmandu', city: 'Kathmandu', country: 'Nepal',
    timezone: 'Asia/Kathmandu', language: 'English', createdAt: 'Aug 8, 2024', lastActiveAt: 'Aug 5, 2026',
    featureFlags: { customDomain: true, whiteLabel: true, channelManager: true, advancedAnalytics: true, restaurantModule: true, multiLanguage: true },
    integrations: ['Stripe', 'Razorpay', 'Booking.com', 'GoogleAnalytics', 'Slack', 'Twilio'],
    onboardingProgress: 6,
  },
  {
    id: 'tnt_009', name: 'Mountain Trail Lodge', email: 'trail@mountaintrail.com', phone: '+977-26-450099',
    plan: 'Basic', planPrice: 7999, planCycle: 'monthly', planLabel: 'Basic',
    planPerks: ['Up to 30 rooms', 'Basic reports'],
    status: 'Suspended', rating: 3.6, propertiesCount: 1, totalRooms: 12, totalBookings: 86,
    monthlyRevenue: 9000, staffCount: 4, paymentMethod: 'Razorpay',
    subscriptionDate: 'Oct 10, 2025', lastPayment: 'May 10, 2026', nextBilling: '—', billingCycle: 'monthly',
    logo: null,
    ownerName: 'Laxman Bhandari', ownerEmail: 'laxman@mountaintrail.com', ownerPhone: '+977-9809012345',
    website: 'www.mountaintrail.com', address: 'Ghandruk, Kaski', city: 'Kaski', country: 'Nepal',
    timezone: 'Asia/Kathmandu', language: 'Nepali', createdAt: 'Sep 25, 2025', lastActiveAt: 'May 22, 2026',
    featureFlags: { customDomain: false, whiteLabel: false, channelManager: false, advancedAnalytics: false, restaurantModule: false, multiLanguage: false },
    integrations: ['Razorpay'],
    onboardingProgress: 1,
  },
  {
    id: 'tnt_010', name: 'Annapurna Base Camp Inn', email: 'hello@abcinn.com', phone: '+977-61-431212',
    plan: 'Free Trial', planPrice: 0, planCycle: 'monthly', planLabel: 'Free Trial',
    planPerks: ['14-day trial', 'All Professional features'],
    status: 'Trialing', rating: 4.3, propertiesCount: 1, totalRooms: 16, totalBookings: 31,
    monthlyRevenue: 0, staffCount: 5, paymentMethod: 'Stripe',
    subscriptionDate: 'Aug 2, 2026', lastPayment: '—', nextBilling: 'Aug 16, 2026', billingCycle: 'monthly',
    logo: null,
    ownerName: 'Sunita Adhikari', ownerEmail: 'sunita@abcinn.com', ownerPhone: '+977-9810123456',
    website: 'www.abcinn.com', address: 'Nayapul, Pokhara', city: 'Pokhara', country: 'Nepal',
    timezone: 'Asia/Kathmandu', language: 'English', createdAt: 'Aug 2, 2026', lastActiveAt: 'Aug 5, 2026',
    featureFlags: { customDomain: false, whiteLabel: false, channelManager: true, advancedAnalytics: false, restaurantModule: false, multiLanguage: false },
    integrations: [],
    onboardingProgress: 2,
  },
  {
    id: 'tnt_011', name: 'Skyline Boutique Hotel', email: 'stay@skylineboutique.com', phone: '+977-21-520110',
    plan: 'Professional', planPrice: 19999, planCycle: 'monthly', planLabel: 'Professional',
    planPerks: ['Up to 100 rooms', 'Channel manager', 'Analytics dashboard'],
    status: 'Active', rating: 4.2, propertiesCount: 1, totalRooms: 28, totalBookings: 410,
    monthlyRevenue: 52000, staffCount: 11, paymentMethod: 'Wire Transfer',
    subscriptionDate: 'Jan 22, 2026', lastPayment: 'Jul 22, 2026', nextBilling: 'Aug 22, 2026', billingCycle: 'monthly',
    logo: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=120&h=120&fit=crop',
    ownerName: 'Roshan KC', ownerEmail: 'roshan@skylineboutique.com', ownerPhone: '+977-9811234567',
    website: 'www.skylineboutique.com', address: 'Dharan', city: 'Dharan', country: 'Nepal',
    timezone: 'Asia/Kathmandu', language: 'English', createdAt: 'Dec 30, 2025', lastActiveAt: 'Aug 4, 2026',
    featureFlags: { customDomain: false, whiteLabel: false, channelManager: true, advancedAnalytics: true, restaurantModule: false, multiLanguage: false },
    integrations: ['Stripe'],
    onboardingProgress: 5,
  },
  {
    id: 'tnt_012', name: 'Mustang Desert Camp', email: 'camp@mustangdesert.com', phone: '+977-69-460055',
    plan: 'Enterprise', planPrice: 49999, planCycle: 'monthly', planLabel: 'Enterprise',
    planPerks: ['Unlimited rooms', 'Multi-property', 'Channel manager', '24/7 support'],
    status: 'Active', rating: 4.7, propertiesCount: 2, totalRooms: 54, totalBookings: 1180,
    monthlyRevenue: 158000, staffCount: 22, paymentMethod: 'Stripe',
    subscriptionDate: 'Mar 12, 2025', lastPayment: 'Jul 12, 2026', nextBilling: 'Aug 12, 2026', billingCycle: 'monthly',
    logo: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=120&h=120&fit=crop',
    ownerName: 'Tenzin Dolma', ownerEmail: 'tenzin@mustangdesert.com', ownerPhone: '+977-9812345678',
    website: 'www.mustangdesert.com', address: 'Jomsom, Mustang', city: 'Mustang', country: 'Nepal',
    timezone: 'Asia/Kathmandu', language: 'English', createdAt: 'Feb 15, 2025', lastActiveAt: 'Aug 5, 2026',
    featureFlags: { customDomain: true, whiteLabel: false, channelManager: true, advancedAnalytics: true, restaurantModule: true, multiLanguage: false },
    integrations: ['Stripe', 'Booking.com', 'GoogleAnalytics'],
    onboardingProgress: 6,
  },
]

export const mockOnboardingActivities: OnboardingActivity[] = [
  {
    id: 'act_001',
    tenantId: 'tnt_002',
    tenantName: 'Lakeside Resort Pokhara',
    action: 'Rooms configured',
    time: '2h ago',
    icon: 'building',
  },
  {
    id: 'act_002',
    tenantId: 'tnt_005',
    tenantName: 'Sunrise Beach Resort',
    action: 'Property details updated',
    time: '5h ago',
    icon: 'building',
  },
  {
    id: 'act_003',
    tenantId: 'tnt_004',
    tenantName: 'Heritage Inn Bhaktapur',
    action: 'Payment gateway connected',
    time: '1d ago',
    icon: 'building',
  },
]

/** Compact tenant shape consumed by the store / dashboard / global search. */
export const mockTenants: SuperAdminTenant[] = mockTenantsExtended.map(({
  id, name, plan, status, propertiesCount, subscriptionDate, email, phone,
  ownerName, ownerEmail, ownerPhone, monthlyRevenue, logo, city, country, integrations,
  onboardingProgress,
}) => ({
  id, name, plan, status, propertiesCount, subscriptionDate, email, phone,
  ownerName, ownerEmail, ownerPhone, monthlyRevenue, logo, city, country, integrations,
  onboardingProgress,
}))

// ═══════════════════════════════════════════════════════════════
// Plans
// ═══════════════════════════════════════════════════════════════

export const mockPlans: Plan[] = [
  {
    id: 'plan_free', name: 'Free Trial', slug: 'free-trial',
    description: 'Everything you need to explore ServeIQ for 14 days — no card required.',
    monthlyPrice: 0, yearlyPrice: 0, popular: false, color: '#6B7280',
    features: [
      { name: 'Property Listings', included: true, limit: 'Up to 5' },
      { name: 'Room Management', included: true, limit: 'Up to 30' },
      { name: 'Booking Engine', included: true },
      { name: 'Basic Analytics', included: true },
      { name: 'Staff Accounts', included: true, limit: 'Up to 3' },
      { name: 'Channel Manager', included: false },
      { name: 'Restaurant Module', included: false },
      { name: 'Multi-language', included: false },
      { name: 'API Access', included: false },
      { name: 'Priority Support', included: false },
      { name: 'Custom Domain', included: false },
      { name: 'White Label', included: false },
    ],
    maxProperties: 5, maxRooms: 30, maxUsers: 3,
    activeSubscribers: 4, status: 'active', createdAt: 'Jan 1, 2025',
  },
  {
    id: 'plan_basic', name: 'Basic', slug: 'basic',
    description: 'For independent hotels getting started with online bookings.',
    monthlyPrice: 19, yearlyPrice: 190, popular: false, color: '#3B82F6',
    features: [
      { name: 'Property Listings', included: true, limit: 'Up to 10' },
      { name: 'Room Management', included: true, limit: 'Up to 50' },
      { name: 'Booking Engine', included: true },
      { name: 'Basic Analytics', included: true },
      { name: 'Staff Accounts', included: true, limit: 'Up to 5' },
      { name: 'Channel Manager', included: false },
      { name: 'Restaurant Module', included: false },
      { name: 'Multi-language', included: false },
      { name: 'API Access', included: false },
      { name: 'Priority Support', included: false },
      { name: 'Custom Domain', included: false },
      { name: 'White Label', included: false },
    ],
    maxProperties: 10, maxRooms: 50, maxUsers: 5,
    activeSubscribers: 9, status: 'active', createdAt: 'Jan 1, 2025',
  },
  {
    id: 'plan_pro', name: 'Professional', slug: 'professional',
    description: 'The sweet spot for growing properties — channel manager included.',
    monthlyPrice: 49, yearlyPrice: 490, popular: true, color: '#8B5CF6',
    features: [
      { name: 'Property Listings', included: true, limit: 'Up to 25' },
      { name: 'Room Management', included: true, limit: 'Up to 150' },
      { name: 'Booking Engine', included: true },
      { name: 'Basic Analytics', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Channel Manager', included: true },
      { name: 'Restaurant Module', included: false },
      { name: 'Multi-language', included: true },
      { name: 'API Access', included: true, limit: '1,000 req/day' },
      { name: 'Priority Support', included: true },
      { name: 'Custom Domain', included: true },
      { name: 'White Label', included: false },
    ],
    maxProperties: 25, maxRooms: 150, maxUsers: 20,
    activeSubscribers: 21, status: 'active', createdAt: 'Jan 1, 2025',
  },
  {
    id: 'plan_ent', name: 'Enterprise', slug: 'enterprise',
    description: 'For hotel groups and multi-property operators. Everything, unlimited.',
    monthlyPrice: 99, yearlyPrice: 990, popular: false, color: '#F59E0B',
    features: [
      { name: 'Property Listings', included: true, limit: 'Unlimited' },
      { name: 'Room Management', included: true, limit: 'Unlimited' },
      { name: 'Booking Engine', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Channel Manager', included: true },
      { name: 'Restaurant Module', included: true },
      { name: 'Multi-language', included: true },
      { name: 'API Access', included: true, limit: '10,000 req/day' },
      { name: 'Priority Support', included: true },
      { name: 'Custom Domain', included: true },
      { name: 'White Label', included: true },
      { name: 'Dedicated Account Manager', included: true },
    ],
    maxProperties: -1, maxRooms: -1, maxUsers: -1,
    activeSubscribers: 13, status: 'active', createdAt: 'Jan 1, 2025',
  },
  {
    id: 'plan_starter', name: 'Starter (Legacy)', slug: 'starter-legacy',
    description: 'Legacy plan for early customers. No longer available for new signups.',
    monthlyPrice: 9, yearlyPrice: 90, popular: false, color: '#6B7280',
    features: [
      { name: 'Property Listings', included: true, limit: 'Up to 3' },
      { name: 'Room Management', included: true, limit: 'Up to 20' },
      { name: 'Booking Engine', included: true },
      { name: 'Basic Analytics', included: false },
      { name: 'Staff Accounts', included: true, limit: 'Up to 2' },
      { name: 'Channel Manager', included: false },
      { name: 'Restaurant Module', included: false },
      { name: 'Multi-language', included: false },
      { name: 'API Access', included: false },
      { name: 'Priority Support', included: false },
      { name: 'Custom Domain', included: false },
      { name: 'White Label', included: false },
    ],
    maxProperties: 3, maxRooms: 20, maxUsers: 2,
    activeSubscribers: 2, status: 'archived', createdAt: 'Jan 1, 2025',
  },
  {
    id: 'plan_lux', name: 'Luxury', slug: 'luxury',
    description: 'Premium tier with AI-powered revenue management and a dedicated CSM.',
    monthlyPrice: 199, yearlyPrice: 1990, popular: false, color: '#10B981',
    features: [
      { name: 'Property Listings', included: true, limit: 'Unlimited' },
      { name: 'Room Management', included: true, limit: 'Unlimited' },
      { name: 'Booking Engine', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Channel Manager', included: true },
      { name: 'Restaurant Module', included: true },
      { name: 'Multi-language', included: true },
      { name: 'AI Dynamic Pricing', included: true },
      { name: 'API Access', included: true, limit: '25,000 req/day' },
      { name: 'Priority Support', included: true },
      { name: 'Custom Domain', included: true },
      { name: 'White Label', included: true },
    ],
    maxProperties: -1, maxRooms: -1, maxUsers: -1,
    activeSubscribers: 0, status: 'coming-soon', createdAt: 'Jun 1, 2026',
  },
]

// ═══════════════════════════════════════════════════════════════
// Subscriptions
// ═══════════════════════════════════════════════════════════════

export const mockSubscriptions: Subscription[] = [
  { id: 'sub_001', tenantId: 'tnt_001', tenantName: 'Hotel Everest Kathmandu', tenantEmail: 'admin@everesthotel.com', planId: 'plan_ent', planName: 'Enterprise', status: 'active', billingCycle: 'monthly', price: 99, currency: 'USD', startDate: 'Jan 15, 2025', currentPeriodEnd: '2026-08-15', autoRenew: true, paymentMethod: 'Stripe •••• 4242', propertiesCount: 3 },
  { id: 'sub_002', tenantId: 'tnt_002', tenantName: 'Lakeside Resort Pokhara', tenantEmail: 'info@lakesideresort.com', planId: 'plan_pro', planName: 'Professional', status: 'active', billingCycle: 'monthly', price: 49, currency: 'USD', startDate: 'Feb 10, 2025', currentPeriodEnd: '2026-08-10', autoRenew: true, paymentMethod: 'Mastercard •••• 5555', propertiesCount: 1 },
  { id: 'sub_003', tenantId: 'tnt_003', tenantName: 'Budget Stay Chitwan', tenantEmail: 'hello@budgetstay.com', planId: 'plan_basic', planName: 'Basic', status: 'canceled', billingCycle: 'monthly', price: 19, currency: 'USD', startDate: 'Mar 5, 2025', currentPeriodEnd: '2026-07-05', canceledAt: 'Jun 28, 2026', autoRenew: false, paymentMethod: 'Razorpay •••• 6011', propertiesCount: 1 },
  { id: 'sub_004', tenantId: 'tnt_004', tenantName: 'Heritage Inn Bhaktapur', tenantEmail: 'frontdesk@heritageinn.com', planId: 'plan_pro', planName: 'Professional', status: 'active', billingCycle: 'yearly', price: 490, currency: 'USD', startDate: 'Dec 20, 2024', currentPeriodEnd: '2026-12-20', autoRenew: true, paymentMethod: 'Visa •••• 7788', propertiesCount: 2 },
  { id: 'sub_005', tenantId: 'tnt_005', tenantName: 'Sunrise Beach Resort', tenantEmail: 'reservations@sunrisebeach.com', planId: 'plan_free', planName: 'Free Trial', status: 'trialing', billingCycle: 'monthly', price: 0, currency: 'USD', startDate: 'Jul 28, 2026', currentPeriodEnd: '2026-08-11', autoRenew: true, paymentMethod: 'Stripe •••• 9900', propertiesCount: 1 },
  { id: 'sub_006', tenantId: 'tnt_006', tenantName: 'Himalaya View Hotel', tenantEmail: 'bookings@himalayaview.com', planId: 'plan_ent', planName: 'Enterprise', status: 'active', billingCycle: 'monthly', price: 99, currency: 'USD', startDate: 'May 1, 2025', currentPeriodEnd: '2026-09-01', autoRenew: true, paymentMethod: 'Amex •••• 1005', propertiesCount: 2 },
  { id: 'sub_007', tenantId: 'tnt_007', tenantName: 'Garden Retreat Lalitpur', tenantEmail: 'stay@gardenretreat.com', planId: 'plan_pro', planName: 'Professional', status: 'past_due', billingCycle: 'monthly', price: 49, currency: 'USD', startDate: 'Jun 18, 2025', currentPeriodEnd: '2026-07-18', autoRenew: true, paymentMethod: 'Wire Transfer', propertiesCount: 1 },
  { id: 'sub_008', tenantId: 'tnt_008', tenantName: 'Royal Palace Hotel', tenantEmail: 'reservations@royalpalace.com', planId: 'plan_ent', planName: 'Enterprise', status: 'active', billingCycle: 'yearly', price: 990, currency: 'USD', startDate: 'Sep 1, 2024', currentPeriodEnd: '2026-09-01', autoRenew: true, paymentMethod: 'Stripe •••• 4242', propertiesCount: 4 },
  { id: 'sub_009', tenantId: 'tnt_009', tenantName: 'Mountain Trail Lodge', tenantEmail: 'trail@mountaintrail.com', planId: 'plan_basic', planName: 'Basic', status: 'paused', billingCycle: 'monthly', price: 19, currency: 'USD', startDate: 'Oct 10, 2025', currentPeriodEnd: '2026-10-10', autoRenew: true, paymentMethod: 'Razorpay •••• 6011', propertiesCount: 1 },
  { id: 'sub_010', tenantId: 'tnt_010', tenantName: 'Annapurna Base Camp Inn', tenantEmail: 'hello@abcinn.com', planId: 'plan_free', planName: 'Free Trial', status: 'trialing', billingCycle: 'monthly', price: 0, currency: 'USD', startDate: 'Aug 2, 2026', currentPeriodEnd: '2026-08-16', autoRenew: true, paymentMethod: 'Stripe •••• 3344', propertiesCount: 1 },
  { id: 'sub_011', tenantId: 'tnt_011', tenantName: 'Skyline Boutique Hotel', tenantEmail: 'stay@skylineboutique.com', planId: 'plan_pro', planName: 'Professional', status: 'active', billingCycle: 'monthly', price: 49, currency: 'USD', startDate: 'Jan 22, 2026', currentPeriodEnd: '2026-08-22', autoRenew: true, paymentMethod: 'Wire Transfer', propertiesCount: 1 },
  { id: 'sub_012', tenantId: 'tnt_012', tenantName: 'Mustang Desert Camp', tenantEmail: 'camp@mustangdesert.com', planId: 'plan_ent', planName: 'Enterprise', status: 'active', billingCycle: 'monthly', price: 99, currency: 'USD', startDate: 'Mar 12, 2025', currentPeriodEnd: '2026-08-12', autoRenew: true, paymentMethod: 'Visa •••• 4455', propertiesCount: 2 },
]

// ═══════════════════════════════════════════════════════════════
// Billing Invoices
// ═══════════════════════════════════════════════════════════════

export const mockBillingInvoices: BillingInvoice[] = [
  { id: 'INV-2026-0012', subscriptionId: 'sub_001', tenantName: 'Hotel Everest Kathmandu', planName: 'Enterprise', amount: 99, currency: 'USD', status: 'paid', issuedAt: 'Jul 15, 2026', paidAt: 'Jul 15, 2026', description: 'Enterprise Plan — Monthly subscription' },
  { id: 'INV-2026-0011', subscriptionId: 'sub_008', tenantName: 'Royal Palace Hotel', planName: 'Enterprise', amount: 990, currency: 'USD', status: 'paid', issuedAt: 'Jul 1, 2026', paidAt: 'Jul 1, 2026', description: 'Enterprise Plan — Annual subscription' },
  { id: 'INV-2026-0010', subscriptionId: 'sub_002', tenantName: 'Lakeside Resort Pokhara', planName: 'Professional', amount: 49, currency: 'USD', status: 'paid', issuedAt: 'Jul 10, 2026', paidAt: 'Jul 10, 2026', description: 'Professional Plan — Monthly subscription' },
  { id: 'INV-2026-0009', subscriptionId: 'sub_006', tenantName: 'Himalaya View Hotel', planName: 'Enterprise', amount: 99, currency: 'USD', status: 'paid', issuedAt: 'Jul 1, 2026', paidAt: 'Jul 2, 2026', description: 'Enterprise Plan — Monthly subscription' },
  { id: 'INV-2026-0008', subscriptionId: 'sub_007', tenantName: 'Garden Retreat Lalitpur', planName: 'Professional', amount: 49, currency: 'USD', status: 'failed', issuedAt: 'Jul 18, 2026', description: 'Professional Plan — Monthly subscription' },
  { id: 'INV-2026-0007', subscriptionId: 'sub_012', tenantName: 'Mustang Desert Camp', planName: 'Enterprise', amount: 99, currency: 'USD', status: 'paid', issuedAt: 'Jul 12, 2026', paidAt: 'Jul 12, 2026', description: 'Enterprise Plan — Monthly subscription' },
  { id: 'INV-2026-0006', subscriptionId: 'sub_004', tenantName: 'Heritage Inn Bhaktapur', planName: 'Professional', amount: 490, currency: 'USD', status: 'paid', issuedAt: 'Jun 20, 2026', paidAt: 'Jun 20, 2026', description: 'Professional Plan — Annual renewal' },
  { id: 'INV-2026-0005', subscriptionId: 'sub_011', tenantName: 'Skyline Boutique Hotel', planName: 'Professional', amount: 49, currency: 'USD', status: 'paid', issuedAt: 'Jul 22, 2026', paidAt: 'Jul 22, 2026', description: 'Professional Plan — Monthly subscription' },
  { id: 'INV-2026-0004', subscriptionId: 'sub_003', tenantName: 'Budget Stay Chitwan', planName: 'Basic', amount: 19, currency: 'USD', status: 'refunded', issuedAt: 'Jun 5, 2026', paidAt: 'Jun 5, 2026', description: 'Basic Plan — Monthly subscription' },
  { id: 'INV-2026-0003', subscriptionId: 'sub_001', tenantName: 'Hotel Everest Kathmandu', planName: 'Enterprise', amount: 99, currency: 'USD', status: 'paid', issuedAt: 'Jun 15, 2026', paidAt: 'Jun 15, 2026', description: 'Enterprise Plan — Monthly subscription' },
  { id: 'INV-2026-0002', subscriptionId: 'sub_005', tenantName: 'Sunrise Beach Resort', planName: 'Free Trial', amount: 0, currency: 'USD', status: 'pending', issuedAt: 'Aug 1, 2026', description: 'Free Trial — Onboarding' },
  { id: 'INV-2026-0001', subscriptionId: 'sub_010', tenantName: 'Annapurna Base Camp Inn', planName: 'Free Trial', amount: 0, currency: 'USD', status: 'pending', issuedAt: 'Aug 4, 2026', description: 'Free Trial — Onboarding' },
  { id: 'INV-2025-0091', subscriptionId: 'sub_008', tenantName: 'Royal Palace Hotel', planName: 'Enterprise', amount: 990, currency: 'USD', status: 'paid', issuedAt: 'Sep 1, 2025', paidAt: 'Sep 1, 2025', description: 'Enterprise Plan — Annual renewal' },
  { id: 'INV-2025-0087', subscriptionId: 'sub_004', tenantName: 'Heritage Inn Bhaktapur', planName: 'Professional', amount: 490, currency: 'USD', status: 'paid', issuedAt: 'Dec 20, 2025', paidAt: 'Dec 20, 2025', description: 'Professional Plan — Annual renewal' },
]

// ═══════════════════════════════════════════════════════════════
// Plan Change Logs
// ═══════════════════════════════════════════════════════════════

export const mockPlanChangeLogs: PlanChangeLog[] = [
  { id: 'chg_001', tenantName: 'Himalaya View Hotel', fromPlan: 'Professional', toPlan: 'Enterprise', changedAt: 'May 1, 2025', changedBy: 'SuperAdmin', reason: 'Added second property — required multi-property support' },
  { id: 'chg_002', tenantName: 'Skyline Boutique Hotel', fromPlan: 'Basic', toPlan: 'Professional', changedAt: 'Jan 22, 2026', changedBy: 'SuperAdmin', reason: 'Upgraded for channel manager' },
  { id: 'chg_003', tenantName: 'Garden Retreat Lalitpur', fromPlan: 'Professional', toPlan: '—', changedAt: 'Jul 19, 2026', changedBy: 'SuperAdmin', reason: 'Subscription canceled' },
  { id: 'chg_004', tenantName: 'Budget Stay Chitwan', fromPlan: 'Basic', toPlan: 'Basic', changedAt: 'Jun 28, 2026', changedBy: 'SuperAdmin', reason: 'Account suspended for non-payment' },
  { id: 'chg_005', tenantName: 'Mustang Desert Camp', fromPlan: 'Professional', toPlan: 'Enterprise', changedAt: 'Mar 12, 2025', changedBy: 'SuperAdmin', reason: 'Growth plan — added restaurant module' },
  { id: 'chg_006', tenantName: 'Mountain Trail Lodge', fromPlan: 'Basic', toPlan: 'Basic', changedAt: 'May 10, 2026', changedBy: 'SuperAdmin', reason: 'Subscription paused at owner request' },
  { id: 'chg_007', tenantName: 'Lakeside Resort Pokhara', fromPlan: 'Basic', toPlan: 'Professional', changedAt: 'Feb 10, 2025', changedBy: 'SuperAdmin', reason: 'Upgraded during promo' },
  { id: 'chg_008', tenantName: 'Royal Palace Hotel', fromPlan: 'Professional', toPlan: 'Enterprise', changedAt: 'Sep 1, 2024', changedBy: 'SuperAdmin', reason: 'Multi-property rollout across 4 locations' },
]

// ═══════════════════════════════════════════════════════════════
// Payments — Transactions, Refunds, Payout Summary, Revenue Trend
// ═══════════════════════════════════════════════════════════════

export const mockTransactions: PaymentTransaction[] = [
  { id: 'txn_0421', tenantName: 'Royal Palace Hotel', tenantEmail: 'reservations@royalpalace.com', planName: 'Enterprise', amount: 990, currency: 'USD', fee: 29.01, net: 960.99, gateway: 'stripe', status: 'succeeded', description: 'Annual subscription — Enterprise plan', createdAt: 'Aug 5, 2026 09:12 AM', invoiceId: 'INV-2025-0091' },
  { id: 'txn_0420', tenantName: 'Hotel Everest Kathmandu', tenantEmail: 'admin@everesthotel.com', planName: 'Enterprise', amount: 99, currency: 'USD', fee: 3.17, net: 95.83, gateway: 'stripe', status: 'succeeded', description: 'Monthly subscription — Enterprise plan', createdAt: 'Aug 5, 2026 08:44 AM' },
  { id: 'txn_0419', tenantName: 'Lakeside Resort Pokhara', tenantEmail: 'info@lakesideresort.com', planName: 'Professional', amount: 49, currency: 'USD', fee: 1.72, net: 47.28, gateway: 'stripe', status: 'succeeded', description: 'Monthly subscription — Professional plan', createdAt: 'Aug 4, 2026 10:05 PM' },
  { id: 'txn_0418', tenantName: 'Mustang Desert Camp', tenantEmail: 'camp@mustangdesert.com', planName: 'Enterprise', amount: 99, currency: 'USD', fee: 3.17, net: 95.83, gateway: 'stripe', status: 'succeeded', description: 'Monthly subscription — Enterprise plan', createdAt: 'Aug 4, 2026 09:31 AM' },
  { id: 'txn_0417', tenantName: 'Skyline Boutique Hotel', tenantEmail: 'stay@skylineboutique.com', planName: 'Professional', amount: 49, currency: 'USD', fee: 1.72, net: 47.28, gateway: 'wire', status: 'pending', description: 'Monthly subscription — Professional plan (wire)', createdAt: 'Aug 3, 2026 02:20 PM' },
  { id: 'txn_0416', tenantName: 'Himalaya View Hotel', tenantEmail: 'bookings@himalayaview.com', planName: 'Enterprise', amount: 99, currency: 'USD', fee: 3.17, net: 95.83, gateway: 'razorpay', status: 'succeeded', description: 'Monthly subscription — Enterprise plan', createdAt: 'Aug 3, 2026 11:58 AM' },
  { id: 'txn_0415', tenantName: 'Garden Retreat Lalitpur', tenantEmail: 'stay@gardenretreat.com', planName: 'Professional', amount: 49, currency: 'USD', fee: 1.72, net: 47.28, gateway: 'wire', status: 'failed', description: 'Monthly subscription — card declined', createdAt: 'Aug 2, 2026 07:40 AM' },
  { id: 'txn_0414', tenantName: 'Budget Stay Chitwan', tenantEmail: 'hello@budgetstay.com', planName: 'Basic', amount: 19, currency: 'USD', fee: 0.85, net: 18.15, gateway: 'razorpay', status: 'refunded', description: 'Monthly subscription — Basic plan', createdAt: 'Jul 30, 2026 04:15 PM', invoiceId: 'INV-2026-0004' },
  { id: 'txn_0413', tenantName: 'Heritage Inn Bhaktapur', tenantEmail: 'frontdesk@heritageinn.com', planName: 'Professional', amount: 490, currency: 'USD', fee: 14.51, net: 475.49, gateway: 'stripe', status: 'succeeded', description: 'Annual renewal — Professional plan', createdAt: 'Jul 29, 2026 08:02 AM' },
  { id: 'txn_0412', tenantName: 'Hotel Everest Kathmandu', tenantEmail: 'admin@everesthotel.com', planName: 'Enterprise', amount: 99, currency: 'USD', fee: 3.17, net: 95.83, gateway: 'stripe', status: 'succeeded', description: 'Monthly subscription — Enterprise plan', createdAt: 'Jul 28, 2026 12:30 PM' },
  { id: 'txn_0411', tenantName: 'Mountain Trail Lodge', tenantEmail: 'trail@mountaintrail.com', planName: 'Basic', amount: 19, currency: 'USD', fee: 0.85, net: 18.15, gateway: 'razorpay', status: 'failed', description: 'Monthly subscription — Basic plan', createdAt: 'Jul 27, 2026 06:10 PM' },
  { id: 'txn_0410', tenantName: 'Royal Palace Hotel', tenantEmail: 'reservations@royalpalace.com', planName: 'Enterprise', amount: 99, currency: 'USD', fee: 3.17, net: 95.83, gateway: 'stripe', status: 'succeeded', description: 'Overage — additional properties', createdAt: 'Jul 26, 2026 10:45 AM' },
  { id: 'txn_0409', tenantName: 'Lakeside Resort Pokhara', tenantEmail: 'info@lakesideresort.com', planName: 'Professional', amount: 49, currency: 'USD', fee: 1.72, net: 47.28, gateway: 'stripe', status: 'succeeded', description: 'Monthly subscription — Professional plan', createdAt: 'Jul 25, 2026 03:55 PM' },
  { id: 'txn_0408', tenantName: 'Mustang Desert Camp', tenantEmail: 'camp@mustangdesert.com', planName: 'Enterprise', amount: 99, currency: 'USD', fee: 3.17, net: 95.83, gateway: 'stripe', status: 'succeeded', description: 'Monthly subscription — Enterprise plan', createdAt: 'Jul 24, 2026 09:20 AM' },
  { id: 'txn_0407', tenantName: 'Sunrise Beach Resort', tenantEmail: 'reservations@sunrisebeach.com', planName: 'Free Trial', amount: 0, currency: 'USD', fee: 0, net: 0, gateway: 'stripe', status: 'succeeded', description: 'Trial start — no charge', createdAt: 'Jul 28, 2026 11:00 AM' },
  { id: 'txn_0406', tenantName: 'Annapurna Base Camp Inn', tenantEmail: 'hello@abcinn.com', planName: 'Free Trial', amount: 0, currency: 'USD', fee: 0, net: 0, gateway: 'stripe', status: 'succeeded', description: 'Trial start — no charge', createdAt: 'Aug 2, 2026 05:25 PM' },
]

export const mockRefunds: PaymentRefund[] = [
  { id: 'ref_0901', transactionId: 'txn_0414', tenantName: 'Budget Stay Chitwan', amount: 19, currency: 'USD', reason: 'Account suspended — prorated refund', status: 'completed', createdAt: 'Jul 30, 2026', processedAt: 'Jul 30, 2026' },
  { id: 'ref_0900', transactionId: 'txn_0415', tenantName: 'Garden Retreat Lalitpur', amount: 49, currency: 'USD', reason: 'Charged twice after payment retry — customer request', status: 'completed', createdAt: 'Jul 19, 2026', processedAt: 'Jul 20, 2026' },
  { id: 'ref_0899', transactionId: 'txn_0411', tenantName: 'Mountain Trail Lodge', amount: 19, currency: 'USD', reason: 'Paused subscription — refund for unused period', status: 'pending', createdAt: 'Jul 22, 2026' },
  { id: 'ref_0898', transactionId: 'txn_0417', tenantName: 'Skyline Boutique Hotel', amount: 49, currency: 'USD', reason: 'Plan downgrade adjustment', status: 'completed', createdAt: 'Jan 22, 2026', processedAt: 'Jan 22, 2026' },
  { id: 'ref_0897', transactionId: 'txn_0413', tenantName: 'Heritage Inn Bhaktapur', amount: 49, currency: 'USD', reason: 'Invoice error — double billing (partial refund)', status: 'failed', createdAt: 'Jun 21, 2026' },
]

export const mockPayoutSummary: PayoutSummary = {
  totalRevenue: 48250,
  totalFees: 1398.12,
  totalRefunds: 136,
  netRevenue: 46715.88,
  pendingPayout: 2340,
  lastPayoutAmount: 8120,
  lastPayoutDate: 'Jul 28, 2026',
  pendingTransactions: 6,
}

export const mockMonthlyRevenueBreakdown: MonthlyRevenueBreakdown[] = [
  { month: 'Feb 2026', subscriptions: 2120, oneTime: 340, refunds: 45, fees: 71.34, net: 2343.66 },
  { month: 'Mar 2026', subscriptions: 2415, oneTime: 280, refunds: 0, fees: 78.14, net: 2616.86 },
  { month: 'Apr 2026', subscriptions: 2580, oneTime: 410, refunds: 68, fees: 86.72, net: 2835.28 },
  { month: 'May 2026', subscriptions: 2795, oneTime: 320, refunds: 19, fees: 90.28, net: 3005.72 },
  { month: 'Jun 2026', subscriptions: 3010, oneTime: 455, refunds: 92, fees: 100.61, net: 3272.39 },
  { month: 'Jul 2026', subscriptions: 3250, oneTime: 380, refunds: 136, fees: 105.2, net: 3388.8 },
]

// ═══════════════════════════════════════════════════════════════
// Admins & Roles
// ═══════════════════════════════════════════════════════════════

export const mockAdminUsers: AdminUser[] = [
  { id: 'adm_001', name: 'Aarav Sharma', email: 'aarav@ServeIQ.com', role: 'SuperAdmin', status: 'active', lastActive: 'Aug 5, 2026', joinedAt: 'Jan 2, 2024', permissions: ['all'], mfaEnabled: true },
  { id: 'adm_002', name: 'Priya Koirala', email: 'priya@ServeIQ.com', role: 'Admin', status: 'active', lastActive: 'Aug 5, 2026', joinedAt: 'Mar 14, 2024', permissions: ['tenants.read', 'tenants.write', 'billing.read', 'billing.write', 'system.read'], mfaEnabled: true },
  { id: 'adm_003', name: 'Sandeep Rana', email: 'sandeep@ServeIQ.com', role: 'Admin', status: 'active', lastActive: 'Aug 4, 2026', joinedAt: 'Jun 1, 2024', permissions: ['tenants.read', 'tenants.write', 'content.write', 'system.read'], mfaEnabled: false },
  { id: 'adm_004', name: 'Nisha Gurung', email: 'nisha@ServeIQ.com', role: 'Support', status: 'active', lastActive: 'Aug 5, 2026', joinedAt: 'Sep 20, 2024', permissions: ['tenants.read', 'tickets.read', 'tickets.write'], mfaEnabled: false },
  { id: 'adm_005', name: 'Bikash Tamang', email: 'bikash@ServeIQ.com', role: 'ReadOnly', status: 'inactive', lastActive: 'Jun 12, 2026', joinedAt: 'Nov 3, 2024', permissions: ['tenants.read', 'billing.read', 'audit.read'], mfaEnabled: true },
  { id: 'adm_006', name: 'Anjali Thapa', email: 'anjali@ServeIQ.com', role: 'Support', status: 'invited', lastActive: '—', joinedAt: 'Aug 3, 2026', permissions: ['tickets.read', 'tickets.write'], mfaEnabled: false },
]

const perm = (id: string, name: string, description: string, category: AdminPermission['category']): AdminPermission => ({ id, name, description, category })

export const mockAdminRoles: AdminRole[] = [
  {
    id: 'role_super', name: 'SuperAdmin', description: 'Unrestricted access to every module, including billing, security and platform settings.',
    adminCount: 1,
    permissions: [
      perm('perm_001', 'Manage Tenants', 'Create, suspend and delete tenant accounts', 'tenants'),
      perm('perm_002', 'Manage Billing', 'Full billing, invoicing and refund access', 'billing'),
      perm('perm_003', 'System Settings', 'Edit global platform configuration', 'system'),
      perm('perm_004', 'Security & Audits', 'Manage admins, API keys and audit trails', 'security'),
      perm('perm_005', 'Content & Announcements', 'Publish announcements and platform content', 'content'),
    ],
  },
  {
    id: 'role_admin', name: 'Operations Admin', description: 'Day-to-day tenant and billing operations without access to security controls.',
    adminCount: 2,
    permissions: [
      perm('perm_001', 'Manage Tenants', 'Create, suspend and delete tenant accounts', 'tenants'),
      perm('perm_002', 'Manage Billing', 'Full billing, invoicing and refund access', 'billing'),
      perm('perm_003', 'System Settings', 'Edit global platform configuration', 'system'),
    ],
  },
  {
    id: 'role_support', name: 'Support Agent', description: 'Responds to tenant tickets and can view tenant details, but cannot change billing.',
    adminCount: 2,
    permissions: [
      perm('perm_001', 'Manage Tenants', 'Create, suspend and delete tenant accounts', 'tenants'),
      perm('perm_005', 'Content & Announcements', 'Publish announcements and platform content', 'content'),
    ],
  },
  {
    id: 'role_readonly', name: 'Read-Only Auditor', description: 'View-only access to tenants, billing and audit logs for compliance reviews.',
    adminCount: 1,
    permissions: [
      perm('perm_006', 'View Tenants', 'Read-only access to tenant data', 'tenants'),
      perm('perm_007', 'View Billing', 'Read-only access to billing reports', 'billing'),
      perm('perm_008', 'View Audits', 'Read-only access to audit trails', 'security'),
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// API Keys (ApiKeyEntry — store + ApiManagementPage)
// ═══════════════════════════════════════════════════════════════

export const mockApiKeys: ApiKeyEntry[] = [
  { id: 'key_001', name: 'Production API Key', key: 'sk_live_FAKE_KEY_001', status: 'active', permissions: ['read', 'write', 'webhooks'], rateLimit: 500, lastUsed: '2 min ago', createdAt: 'Jan 10, 2026', expiresAt: 'Jan 10, 2027', tenantName: 'Hotel Everest Kathmandu', usageThisMonth: 12480 },
  { id: 'key_002', name: 'Staging Environment Key', key: 'sk_test_FAKE_KEY_002', status: 'active', permissions: ['read', 'write'], rateLimit: 250, lastUsed: '1 hr ago', createdAt: 'Feb 22, 2026', expiresAt: 'Feb 22, 2027', tenantName: 'Royal Palace Hotel', usageThisMonth: 3840 },
  { id: 'key_003', name: 'Booking Engine Webhook Key', key: 'whsec_live_FAKE_003', status: 'active', permissions: ['webhooks', 'read'], rateLimit: 100, lastUsed: '12 min ago', createdAt: 'Mar 5, 2026', expiresAt: 'Mar 5, 2027', tenantName: 'Lakeside Resort Pokhara', usageThisMonth: 2190 },
  { id: 'key_004', name: 'Analytics Export Key', key: 'sk_live_FAKE_KEY_004', status: 'revoked', permissions: ['read'], rateLimit: 100, lastUsed: 'May 12, 2026', createdAt: 'Jan 10, 2026', expiresAt: 'Jan 10, 2027', tenantName: 'Heritage Inn Bhaktapur', usageThisMonth: 0 },
  { id: 'key_005', name: 'Legacy Integration Key', key: 'sk_legacy_FAKE_005', status: 'expired', permissions: ['read', 'write'], rateLimit: 60, lastUsed: 'Dec 30, 2025', createdAt: 'Jan 1, 2025', expiresAt: 'Jan 1, 2026', tenantName: 'Budget Stay Chitwan', usageThisMonth: 0 },
  { id: 'key_006', name: 'Mobile App Key', key: 'sk_live_FAKE_KEY_006', status: 'active', permissions: ['read', 'webhooks'], rateLimit: 300, lastUsed: '5 min ago', createdAt: 'Jun 18, 2026', expiresAt: 'Jun 18, 2027', tenantName: 'Mustang Desert Camp', usageThisMonth: 8610 },
]

// ═══════════════════════════════════════════════════════════════
// Rate Limits & API Usage (ApiManagementPage)
// ═══════════════════════════════════════════════════════════════

export const mockRateLimitPolicies: RateLimitPolicy[] = [
  { id: 'rl_free', name: 'Free Tier', tier: 'free', requestsPerMinute: 30, requestsPerHour: 500, requestsPerDay: 5000, concurrentLimit: 5, burstLimit: 60 },
  { id: 'rl_basic', name: 'Basic Tier', tier: 'basic', requestsPerMinute: 120, requestsPerHour: 2000, requestsPerDay: 25000, concurrentLimit: 10, burstLimit: 180 },
  { id: 'rl_pro', name: 'Professional Tier', tier: 'pro', requestsPerMinute: 300, requestsPerHour: 6000, requestsPerDay: 100000, concurrentLimit: 25, burstLimit: 450 },
  { id: 'rl_ent', name: 'Enterprise Tier', tier: 'enterprise', requestsPerMinute: 1000, requestsPerHour: 20000, requestsPerDay: 500000, concurrentLimit: 100, burstLimit: 1500 },
]

export const mockApiUsageData: ApiUsageMetric[] = [
  { date: 'Jul 30', requests: 892000, errors: 1024, avgLatency: 78 },
  { date: 'Jul 31', requests: 935000, errors: 893, avgLatency: 74 },
  { date: 'Aug 1', requests: 1012000, errors: 1502, avgLatency: 86 },
  { date: 'Aug 2', requests: 964000, errors: 778, avgLatency: 71 },
  { date: 'Aug 3', requests: 1048000, errors: 2310, avgLatency: 118 },
  { date: 'Aug 4', requests: 987000, errors: 945, avgLatency: 76 },
  { date: 'Aug 5', requests: 1125000, errors: 1211, avgLatency: 82 },
]

// ═══════════════════════════════════════════════════════════════
// Webhooks (shared: IntegrationsPage + ApiManagementPage)
// ═══════════════════════════════════════════════════════════════

export const mockWebhookEndpoints: WebhookEndpoint[] = [
  { id: 'wh_001', name: 'Booking Confirmed', url: 'https://api.everesthotel.com/webhooks/booking', events: ['booking.created', 'booking.confirmed'], status: 'active', secret: 'whsec_8f2a1c…', createdAt: 'Jan 15, 2026', lastTriggeredAt: 'Aug 5, 2026 09:02 AM', successCount: 4821, failureCount: 12, tenantName: 'Hotel Everest Kathmandu' },
  { id: 'wh_002', name: 'Payment Events', url: 'https://api.royalpalace.com/hooks/payments', events: ['payment.succeeded', 'payment.failed', 'invoice.paid'], status: 'active', secret: 'whsec_91b3e2…', createdAt: 'Feb 2, 2026', lastTriggeredAt: 'Aug 5, 2026 08:55 AM', successCount: 3107, failureCount: 4, tenantName: 'Royal Palace Hotel' },
  { id: 'wh_003', name: 'Channel Sync', url: 'https://hooks.lakesideresort.com/channel-sync', events: ['channel.room_updated', 'channel.rate_updated'], status: 'failing', secret: 'whsec_42c5f0…', createdAt: 'Mar 20, 2026', lastTriggeredAt: 'Aug 5, 2026 07:48 AM', successCount: 982, failureCount: 214, tenantName: 'Lakeside Resort Pokhara' },
  { id: 'wh_004', name: 'Guest Checkout', url: 'https://api.mustangdesert.com/wh/checkout', events: ['booking.completed', 'guest.checked_in'], status: 'disabled', secret: 'whsec_77d9a4…', createdAt: 'Apr 11, 2026', lastTriggeredAt: 'Jul 15, 2026', successCount: 420, failureCount: 0, tenantName: 'Mustang Desert Camp' },
]

// ═══════════════════════════════════════════════════════════════
// Integrations (IntegrationsPage)
// ═══════════════════════════════════════════════════════════════

export const mockIntegrationServices: IntegrationService[] = [
  {
    id: 'int_001', name: 'Stripe', description: 'Accept card payments and manage subscriptions for tenant billing.',
    category: 'payment', status: 'connected', logo: 'S', connectedAt: 'Jan 10, 2025', lastSyncAt: 'Aug 5, 2026 09:00 AM', version: '2026-07-01', docsUrl: 'https://docs.stripe.com',
    configFields: [
      { key: 'publishableKey', label: 'Publishable Key', type: 'text', value: 'pk_live_FAKE_KEY', required: true },
      { key: 'secretKey', label: 'Secret Key', type: 'password', value: 'sk_live_FAKE', required: true },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', value: 'whsec_FAKE', required: false },
      { key: 'statementDescriptor', label: 'Statement Descriptor', type: 'text', value: 'ServeIQ', required: false },
    ],
  },
  {
    id: 'int_002', name: 'Razorpay', description: 'India & South Asia payments — UPI, cards, net banking and wallets.',
    category: 'payment', status: 'connected', logo: 'R', connectedAt: 'Feb 18, 2025', lastSyncAt: 'Aug 5, 2026 08:40 AM', version: '2.0.14', docsUrl: 'https://razorpay.com/docs',
    configFields: [
      { key: 'keyId', label: 'Key ID', type: 'text', value: 'rzp_live_7tY8…', required: true },
      { key: 'keySecret', label: 'Key Secret', type: 'password', value: 'rzp_••••••••', required: true },
    ],
  },
  {
    id: 'int_003', name: 'Booking.com Channel', description: 'Push availability, rates and reservations between ServeIQ and Booking.com.',
    category: 'other', status: 'connected', logo: 'B', connectedAt: 'Mar 2, 2025', lastSyncAt: 'Aug 5, 2026 08:58 AM', version: '3.1.0', docsUrl: 'https://developers.booking.com',
    configFields: [
      { key: 'connectionId', label: 'Connection ID', type: 'text', value: 'BCH-2026-88213', required: true },
      { key: 'ratePlanMapping', label: 'Rate Plan Mapping', type: 'select', value: 'manual', required: true, options: ['manual', 'auto', 'mirror'] },
      { key: 'autoAcceptBookings', label: 'Auto-accept bookings', type: 'toggle', value: 'true', required: false },
    ],
  },
  {
    id: 'int_004', name: 'Google Analytics 4', description: 'Track booking funnel and marketing attribution for tenant dashboards.',
    category: 'analytics', status: 'connected', logo: 'G', connectedAt: 'May 12, 2025', lastSyncAt: 'Aug 5, 2026 09:02 AM', version: 'GA4-1.4', docsUrl: 'https://developers.google.com/analytics',
    configFields: [
      { key: 'measurementId', label: 'Measurement ID', type: 'text', value: 'G-9XQ2M4T7', required: true },
      { key: 'propertyId', label: 'Property ID', type: 'text', value: '336709182', required: true },
    ],
  },
  {
    id: 'int_005', name: 'Slack', description: 'Post booking alerts, refund requests and anomaly notifications to channels.',
    category: 'communication', status: 'connected', logo: 'S', connectedAt: 'Jun 25, 2025', lastSyncAt: 'Aug 5, 2026 09:04 AM', version: '1.8.2', docsUrl: 'https://api.slack.com',
    configFields: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'password', value: 'https://hooks.slack.com/••••', required: true },
      { key: 'channel', label: 'Channel', type: 'text', value: '#ServeIQ-alerts', required: false },
      { key: 'notifyOnBooking', label: 'Booking alerts', type: 'toggle', value: 'true', required: false },
    ],
  },
  {
    id: 'int_006', name: 'Twilio SMS', description: 'Guest booking confirmations and check-in reminders via SMS.',
    category: 'communication', status: 'pending', logo: 'T', connectedAt: '—', lastSyncAt: '—', version: '9.0.5', docsUrl: 'https://www.twilio.com/docs',
    configFields: [
      { key: 'accountSid', label: 'Account SID', type: 'text', value: '', required: true },
      { key: 'authToken', label: 'Auth Token', type: 'password', value: '', required: true },
      { key: 'fromNumber', label: 'From Number', type: 'text', value: '', required: true },
    ],
  },
  {
    id: 'int_007', name: 'AWS S3', description: 'Store property images, documents and backup archives.',
    category: 'storage', status: 'connected', logo: 'A', connectedAt: 'Feb 3, 2025', lastSyncAt: 'Aug 5, 2026 08:31 AM', version: '3.0.0', docsUrl: 'https://docs.aws.amazon.com/s3',
    configFields: [
      { key: 'bucket', label: 'Bucket', type: 'text', value: 'ServeIQ-media', required: true },
      { key: 'region', label: 'Region', type: 'select', value: 'ap-south-1', required: true, options: ['us-east-1', 'eu-west-1', 'ap-south-1', 'ap-southeast-1'] },
      { key: 'accessKey', label: 'Access Key ID', type: 'text', value: 'AKIA4XQ…', required: true },
    ],
  },
  {
    id: 'int_008', name: 'OpenAI Assistant', description: 'AI chat assistant for guest enquiries and auto-replies (experimental).',
    category: 'ai', status: 'disconnected', logo: 'O', connectedAt: '—', lastSyncAt: '—', version: '1.0.0', docsUrl: 'https://platform.openai.com/docs',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', value: '', required: true },
      { key: 'model', label: 'Model', type: 'select', value: 'gpt-4o-mini', required: true, options: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1-mini'] },
    ],
  },
]

/** API keys shown on the Integrations page (ApiKey type with maskedKey). */
export const mockIntegrationApiKeys: ApiKey[] = [
  { id: 'intkey_001', name: 'Booking Engine API Key', key: 'sk_live_FAKE_KEY_001', maskedKey: 'sk_live_FAKE_001••••••••••••', tenantName: 'Hotel Everest Kathmandu', permissions: ['read', 'write', 'webhooks'], status: 'active', createdAt: 'Jan 10, 2026', lastUsedAt: 'Aug 5, 2026', expiresAt: 'Jan 10, 2027' },
  { id: 'intkey_002', name: 'Channel Manager Key', key: 'sk_live_FAKE_KEY_006', maskedKey: 'sk_live_FAKE_006••••••••••••', tenantName: 'Royal Palace Hotel', permissions: ['read', 'webhooks'], status: 'active', createdAt: 'Feb 22, 2026', lastUsedAt: 'Aug 4, 2026', expiresAt: 'Feb 22, 2027' },
  { id: 'intkey_003', name: 'Analytics Connector', key: 'sk_live_FAKE_KEY_004', maskedKey: 'sk_live_FAKE_004••••••••••••', tenantName: 'Lakeside Resort Pokhara', permissions: ['read'], status: 'revoked', createdAt: 'Mar 5, 2026', lastUsedAt: 'May 12, 2026', expiresAt: 'Mar 5, 2027' },
  { id: 'intkey_004', name: 'Mobile App Connector', key: 'sk_live_FAKE_KEY_007', maskedKey: 'sk_live_FAKE_007••••••••••••', tenantName: 'Mustang Desert Camp', permissions: ['read', 'webhooks'], status: 'active', createdAt: 'Jun 18, 2026', lastUsedAt: 'Aug 5, 2026', expiresAt: 'Jun 18, 2027' },
]

// ═══════════════════════════════════════════════════════════════
// Audit Logs
// ═══════════════════════════════════════════════════════════════

export const mockAuditLogs: SuperAdminAuditLog[] = [
  { id: 'log_0001', timestamp: 'Aug 5, 2026 09:12 AM', admin: 'Aarav Sharma', action: 'LOGIN_SUCCESS', target: 'self', details: 'SuperAdmin logged in from Chrome on Windows', category: 'security', severity: 'info', ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', metadata: { sessionId: 'sess_9f2a' } },
  { id: 'log_0002', timestamp: 'Aug 5, 2026 08:44 AM', admin: 'Aarav Sharma', action: 'PAYMENT_RECEIVED', target: 'Hotel Everest Kathmandu', details: 'Payment of $99 received from "Hotel Everest Kathmandu"', category: 'billing', severity: 'info', ipAddress: '192.168.1.100', metadata: { requestMethod: 'POST', requestPath: '/api/payments/webhook' } },
  { id: 'log_0003', timestamp: 'Aug 5, 2026 08:40 AM', admin: 'System', action: 'INCIDENT_DETECTED', target: 'Database Cluster', details: 'Connection pool usage exceeded 85% — auto-scaling engaged', category: 'system', severity: 'warning', metadata: { requestPath: '/api/system/alerts' } },
  { id: 'log_0004', timestamp: 'Aug 5, 2026 08:12 AM', admin: 'Priya Koirala', action: 'TENANT_UPDATED', target: 'Garden Retreat Lalitpur', details: 'Tenant "Garden Retreat Lalitpur" updated (contactEmail)', category: 'tenant', severity: 'info', metadata: { changes: [{ field: 'contactEmail', from: 'stay@gardenretreat.com', to: 'frontdesk@gardenretreat.com' }] } },
  { id: 'log_0005', timestamp: 'Aug 5, 2026 07:48 AM', admin: 'System', action: 'WEBHOOK_FAILING', target: 'Channel Sync', details: 'Webhook "Channel Sync" exceeded failure threshold — 214 failures in 7 days', category: 'system', severity: 'warning', metadata: { requestPath: '/api/webhooks/status' } },
  { id: 'log_0006', timestamp: 'Aug 4, 2026 10:05 PM', admin: 'Aarav Sharma', action: 'PAYMENT_RECEIVED', target: 'Lakeside Resort Pokhara', details: 'Payment of $49 received from "Lakeside Resort Pokhara"', category: 'billing', severity: 'info', metadata: { requestMethod: 'POST', requestPath: '/api/payments/webhook' } },
  { id: 'log_0007', timestamp: 'Aug 4, 2026 06:22 PM', admin: 'Nisha Gurung', action: 'TICKET_UPDATED', target: 'Channel sync issues on Lakeside Resort', details: 'Ticket escalated to engineering — priority changed to high', category: 'admin', severity: 'info' },
  { id: 'log_0008', timestamp: 'Aug 4, 2026 03:15 PM', admin: 'Aarav Sharma', action: 'FEATURE_FLAG_ROLLOUT_CHANGED', target: 'Dynamic Pricing', details: 'Rollout for "Dynamic Pricing" changed to 25%', category: 'feature', severity: 'info', metadata: { changes: [{ field: 'rolloutPercent', from: '10', to: '25' }] } },
  { id: 'log_0009', timestamp: 'Aug 4, 2026 11:40 AM', admin: 'System', action: 'BACKUP_COMPLETED', target: 'Database', details: 'Automated nightly backup completed successfully (2.4 GB)', category: 'system', severity: 'info' },
  { id: 'log_0010', timestamp: 'Aug 4, 2026 09:55 AM', admin: 'Sandeep Rana', action: 'ANNOUNCEMENT_SENT', target: 'Scheduled maintenance — Search indexing', details: 'Announcement sent to all tenants (12 reached)', category: 'admin', severity: 'info' },
  { id: 'log_0011', timestamp: 'Aug 3, 2026 04:30 PM', admin: 'Aarav Sharma', action: 'ADMIN_INVITED', target: 'Anjali Thapa', details: 'Admin "Anjali Thapa" invited with Support role', category: 'admin', severity: 'info', metadata: { tenantEmail: 'anjali@ServeIQ.com' } },
  { id: 'log_0012', timestamp: 'Aug 3, 2026 02:20 PM', admin: 'Aarav Sharma', action: 'SUBSCRIPTION_CREATED', target: 'Skyline Boutique Hotel', details: 'Subscription created for "Skyline Boutique Hotel" on Professional plan', category: 'billing', severity: 'info', metadata: { requestMethod: 'POST', requestPath: '/api/subscriptions' } },
  { id: 'log_0013', timestamp: 'Aug 2, 2026 05:25 PM', admin: 'Priya Koirala', action: 'TENANT_CREATED', target: 'Annapurna Base Camp Inn', details: 'Tenant "Annapurna Base Camp Inn" created with Free Trial plan', category: 'tenant', severity: 'info', metadata: { requestMethod: 'POST', requestPath: '/api/tenants', changes: [{ field: 'status', from: '—', to: 'Active' }] } },
  { id: 'log_0014', timestamp: 'Aug 2, 2026 11:02 AM', admin: 'System', action: 'RATE_LIMIT_ENFORCED', target: 'Budget Stay Chitwan', details: 'Rate limit triggered — 342 requests within 1 minute', category: 'system', severity: 'warning', metadata: { tenantEmail: 'hello@budgetstay.com' } },
  { id: 'log_0015', timestamp: 'Aug 1, 2026 07:40 AM', admin: 'Aarav Sharma', action: 'PAYMENT_FAILED', target: 'Garden Retreat Lalitpur', details: 'Payment of $49 failed — card declined (insufficient funds)', category: 'billing', severity: 'error', metadata: { requestPath: '/api/payments/webhook' } },
  { id: 'log_0016', timestamp: 'Jul 30, 2026 04:15 PM', admin: 'Priya Koirala', action: 'REFUND_ISSUED', target: 'Budget Stay Chitwan', details: 'Refund of $19 issued to "Budget Stay Chitwan" — account suspended, prorated refund', category: 'billing', severity: 'warning' },
  { id: 'log_0017', timestamp: 'Jul 30, 2026 10:20 AM', admin: 'Aarav Sharma', action: 'SUSPEND_TENANT', target: 'Budget Stay Chitwan', details: 'Tenant "Budget Stay Chitwan" suspended — all services deactivated', category: 'tenant', severity: 'warning', metadata: { changes: [{ field: 'status', from: 'Active', to: 'Suspended' }] } },
  { id: 'log_0018', timestamp: 'Jul 29, 2026 08:02 AM', admin: 'Aarav Sharma', action: 'PAYMENT_RECEIVED', target: 'Heritage Inn Bhaktapur', details: 'Payment of $490 received from "Heritage Inn Bhaktapur"', category: 'billing', severity: 'info' },
  { id: 'log_0019', timestamp: 'Jul 28, 2026 03:45 PM', admin: 'Sandeep Rana', action: 'API_KEY_CREATED', target: 'Mobile App Key', details: 'API key "Mobile App Key" created for Mustang Desert Camp', category: 'security', severity: 'info' },
  { id: 'log_0020', timestamp: 'Jul 28, 2026 11:00 AM', admin: 'Priya Koirala', action: 'TENANT_CREATED', target: 'Sunrise Beach Resort', details: 'Tenant "Sunrise Beach Resort" created with Free Trial plan', category: 'tenant', severity: 'info', metadata: { requestMethod: 'POST', requestPath: '/api/tenants' } },
  { id: 'log_0021', timestamp: 'Jul 27, 2026 06:10 PM', admin: 'System', action: 'PAYMENT_FAILED', target: 'Mountain Trail Lodge', details: 'Payment of $19 failed — insufficient funds', category: 'billing', severity: 'error' },
  { id: 'log_0022', timestamp: 'Jul 26, 2026 09:30 AM', admin: 'Aarav Sharma', action: 'SETTINGS_CHANGED', target: 'Platform', details: 'Platform settings updated (maxLoginAttempts, sessionTimeout)', category: 'system', severity: 'info', metadata: { changes: [{ field: 'sessionTimeout', from: '30', to: '45' }] } },
  { id: 'log_0023', timestamp: 'Jul 25, 2026 02:05 PM', admin: 'Aarav Sharma', action: 'IMPERSONATE_TENANT', target: 'Heritage Inn Bhaktapur', details: 'Started impersonation of tenant "Heritage Inn Bhaktapur" (ID: tnt_004)', category: 'security', severity: 'warning', metadata: { sessionId: 'imp_…' } },
  { id: 'log_0024', timestamp: 'Jul 24, 2026 12:00 PM', admin: 'Nisha Gurung', action: 'TICKET_RESOLVED', target: 'Refund not received for canceled booking', details: 'Support ticket resolved — refund processed', category: 'admin', severity: 'info' },
]

// ═══════════════════════════════════════════════════════════════
// Feature Flags
// ═══════════════════════════════════════════════════════════════

export const mockFeatureFlagCategories: FeatureFlagCategory[] = [
  { id: 'cat_localization', label: 'Localization', description: 'Language, currency and region settings' },
  { id: 'cat_integrations', label: 'Integrations', description: 'Third-party connectivity' },
  { id: 'cat_analytics', label: 'Analytics', description: 'Reporting and intelligence' },
  { id: 'cat_modules', label: 'Modules', description: 'Optional business modules' },
  { id: 'cat_branding', label: 'Branding', description: 'White-label and domain controls' },
  { id: 'cat_ai', label: 'AI & Automation', description: 'Machine-learning features' },
  { id: 'cat_mobile', label: 'Mobile', description: 'Guest and owner apps' },
]

export const mockFeatureFlags: SuperAdminFeatureFlag[] = [
  { id: 'ff_001', feature: 'Multi-Language Support', status: true, description: 'Allow tenants to publish sites and dashboards in Nepali, English, Hindi and more.', updatedAt: 'Jul 12, 2026', category: 'Localization', scope: 'global', rolloutPercent: 100, docsUrl: 'https://docs.ServeIQ.com/features/multi-language' },
  { id: 'ff_002', feature: 'Channel Manager', status: true, description: 'Two-way OTA sync with Booking.com, Expedia and Agoda.', updatedAt: 'Jun 30, 2026', category: 'Integrations', scope: 'global', rolloutPercent: 100, dependencies: ['ff_004'], docsUrl: 'https://docs.ServeIQ.com/features/channel-manager' },
  { id: 'ff_003', feature: 'Advanced Analytics', status: true, description: 'Revenue dashboards, occupancy forecasts and cohort reports.', updatedAt: 'Jul 22, 2026', category: 'Analytics', scope: 'global', rolloutPercent: 80, dependencies: ['ff_004'], docsUrl: 'https://docs.ServeIQ.com/features/analytics' },
  { id: 'ff_004', feature: 'Restaurant Module', status: false, description: 'Table management, menu builder and F&B billing for on-site restaurants.', updatedAt: 'May 18, 2026', category: 'Modules', scope: 'per-tenant', docsUrl: 'https://docs.ServeIQ.com/features/restaurant' },
  { id: 'ff_005', feature: 'Custom Domains', status: true, description: 'Serve tenant booking engines on their own domains with SSL.', updatedAt: 'Jun 8, 2026', category: 'Branding', scope: 'global', rolloutPercent: 50, dependencies: ['ff_001'], docsUrl: 'https://docs.ServeIQ.com/features/custom-domains' },
  { id: 'ff_006', feature: 'Dynamic Pricing', status: false, description: 'ML-based rate recommendations based on demand and seasonality.', updatedAt: 'Aug 4, 2026', category: 'AI & Automation', scope: 'global', rolloutPercent: 25, docsUrl: 'https://docs.ServeIQ.com/features/dynamic-pricing' },
  { id: 'ff_007', feature: 'Guest Mobile App', status: true, description: 'White-labeled guest app for bookings, check-in and concierge.', updatedAt: 'Jul 5, 2026', category: 'Mobile', scope: 'global', rolloutPercent: 25, docsUrl: 'https://docs.ServeIQ.com/features/guest-app' },
  { id: 'ff_008', feature: 'Loyalty Program', status: false, description: 'Points, tiers and rewards engine for returning guests.', updatedAt: 'Apr 20, 2026', category: 'Modules', scope: 'per-tenant', docsUrl: 'https://docs.ServeIQ.com/features/loyalty' },
]

export const mockTenantOverrides: TenantFeatureOverride[] = [
  { id: 'ovr_001', tenantId: 'tnt_004', tenantName: 'Heritage Inn Bhaktapur', flagId: 'ff_004', flagName: 'Restaurant Module', overrideValue: true, reason: 'Running an in-house restaurant — pilot customer', setBy: 'Aarav Sharma', setAt: 'Jun 2, 2026', expiresAt: 'Dec 31, 2026' },
  { id: 'ovr_002', tenantId: 'tnt_002', tenantName: 'Lakeside Resort Pokhara', flagId: 'ff_006', flagName: 'Dynamic Pricing', overrideValue: true, reason: 'Beta participant for peak-season pricing', setBy: 'Priya Koirala', setAt: 'Jul 15, 2026' },
  { id: 'ovr_003', tenantId: 'tnt_001', tenantName: 'Hotel Everest Kathmandu', flagId: 'ff_008', flagName: 'Loyalty Program', overrideValue: false, reason: 'Customer declined loyalty rollout for now', setBy: 'Aarav Sharma', setAt: 'May 30, 2026' },
  { id: 'ovr_004', tenantId: 'tnt_008', tenantName: 'Royal Palace Hotel', flagId: 'ff_007', flagName: 'Guest Mobile App', overrideValue: true, reason: 'Enterprise agreement includes branded guest app', setBy: 'Sandeep Rana', setAt: 'Jul 1, 2026' },
]

export const mockBrandingConfigs: TenantBrandingConfig[] = [
  { tenantId: 'tnt_001', tenantName: 'Hotel Everest Kathmandu', customDomain: 'book.everesthotel.com', logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=120&h=120&fit=crop', faviconUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=32&h=32&fit=crop', primaryColor: '#1A4B8C', secondaryColor: '#F5B942', accentColor: '#2E86AB', fontFamily: 'Sora, sans-serif', customEmailFrom: 'bookings@everesthotel.com', isWhiteLabel: true, updatedAt: 'Jul 20, 2026' },
  { tenantId: 'tnt_008', tenantName: 'Royal Palace Hotel', customDomain: 'reservations.royalpalace.com', logoUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=120&h=120&fit=crop', faviconUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=32&h=32&fit=crop', primaryColor: '#7B1E2B', secondaryColor: '#C9A227', accentColor: '#8B5CF6', fontFamily: 'Playfair Display, serif', customEmailFrom: 'reservations@royalpalace.com', isWhiteLabel: true, updatedAt: 'Jul 8, 2026' },
  { tenantId: 'tnt_006', tenantName: 'Himalaya View Hotel', customDomain: 'stay.himalayaview.com', logoUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=120&h=120&fit=crop', faviconUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=32&h=32&fit=crop', primaryColor: '#0E7C66', secondaryColor: '#E8A33D', accentColor: '#10B981', fontFamily: 'Inter, sans-serif', customEmailFrom: 'bookings@himalayaview.com', isWhiteLabel: false, updatedAt: 'Jun 25, 2026' },
  { tenantId: 'tnt_004', tenantName: 'Heritage Inn Bhaktapur', customDomain: 'book.heritageinn.com', logoUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=120&h=120&fit=crop', faviconUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=32&h=32&fit=crop', primaryColor: '#8C3A1E', secondaryColor: '#D9A05B', accentColor: '#F59E0B', fontFamily: 'Sora, sans-serif', customEmailFrom: 'frontdesk@heritageinn.com', isWhiteLabel: false, updatedAt: 'May 12, 2026' },
]

export const mockFeatureFlagActivities: FeatureFlagActivity[] = [
  { id: 'ffact_001', flagId: 'ff_006', flagName: 'Dynamic Pricing', action: 'rollout_changed', oldValue: 10, newValue: 25, performedBy: 'Aarav Sharma', performedAt: 'Aug 4, 2026 03:15 PM', details: 'Rollout expanded to 25% of tenants after stable canary' },
  { id: 'ffact_002', flagId: 'ff_001', flagName: 'Multi-Language Support', action: 'enabled', oldValue: false, newValue: true, performedBy: 'Priya Koirala', performedAt: 'Jul 12, 2026 10:40 AM', details: 'GA launch — 100% rollout' },
  { id: 'ffact_003', flagId: 'ff_004', flagName: 'Restaurant Module', action: 'override_set', newValue: true, performedBy: 'Aarav Sharma', performedAt: 'Jun 2, 2026 01:20 PM', details: 'Override enabled for Heritage Inn Bhaktapur' },
  { id: 'ffact_004', flagId: 'ff_005', flagName: 'Custom Domains', action: 'rollout_changed', oldValue: 25, newValue: 50, performedBy: 'Sandeep Rana', performedAt: 'Jun 8, 2026 11:05 AM', details: 'Rollout expanded after DNS/SSL automation verified' },
  { id: 'ffact_005', flagId: 'ff_007', flagName: 'Guest Mobile App', action: 'created', newValue: true, performedBy: 'Aarav Sharma', performedAt: 'May 21, 2026 04:45 PM', details: 'Feature flag created for guest app program' },
  { id: 'ffact_006', flagId: 'ff_008', flagName: 'Loyalty Program', action: 'disabled', oldValue: true, newValue: false, performedBy: 'Priya Koirala', performedAt: 'Apr 20, 2026 09:30 AM', details: 'Paused pending pricing review' },
  { id: 'ffact_007', flagId: 'ff_003', flagName: 'Advanced Analytics', action: 'rollout_changed', oldValue: 60, newValue: 80, performedBy: 'Aarav Sharma', performedAt: 'Jul 22, 2026 02:10 PM', details: 'Gradual rollout continuing as planned' },
  { id: 'ffact_008', flagId: 'ff_006', flagName: 'Dynamic Pricing', action: 'override_set', newValue: true, performedBy: 'Priya Koirala', performedAt: 'Jul 15, 2026 03:50 PM', details: 'Override enabled for Lakeside Resort Pokhara (beta)' },
]

// ═══════════════════════════════════════════════════════════════
// Support Tickets
// ═══════════════════════════════════════════════════════════════

export const mockTickets: SupportTicket[] = [
  {
    id: 'tkt_001', tenantId: 'tnt_002', tenantName: 'Lakeside Resort Pokhara',
    subject: 'Channel sync failing since this morning', description: 'Room availability keeps getting out of sync with Booking.com. Last successful sync was 06:40 AM.',
    category: 'technical', priority: 'high', status: 'in_progress', assignedTo: 'Nisha Gurung',
    createdAt: 'Aug 5, 2026 07:52 AM', updatedAt: 'Aug 5, 2026 09:10 AM',
    messages: [
      { id: 'msg_001', sender: 'admin', senderName: 'Sita Gurung', message: 'Availability and rates have not synced for over 2 hours. Guests are seeing wrong prices.', timestamp: 'Aug 5, 2026 07:52 AM' },
      { id: 'msg_002', sender: 'superadmin', senderName: 'Nisha Gurung', message: 'Thanks Sita — I can see the failing webhook (wh_003). Escalating to engineering now.', timestamp: 'Aug 5, 2026 08:05 AM' },
      { id: 'msg_003', sender: 'superadmin', senderName: 'Aarav Sharma', message: 'We found a bad rate-plan mapping on your side. Pushing a corrected mapping in ~20 minutes.', timestamp: 'Aug 5, 2026 09:10 AM' },
    ],
  },
  {
    id: 'tkt_002', tenantId: 'tnt_007', tenantName: 'Garden Retreat Lalitpur',
    subject: 'Duplicate charge on July invoice', description: 'Our card was charged twice for the July 18 subscription renewal. Need one refunded.',
    category: 'billing', priority: 'urgent', status: 'open', assignedTo: 'Nisha Gurung',
    createdAt: 'Aug 4, 2026 04:20 PM', updatedAt: 'Aug 4, 2026 04:20 PM',
    messages: [
      { id: 'msg_004', sender: 'admin', senderName: 'Maya Shrestha', message: 'We noticed two identical charges of $49 on July 18. Please investigate urgently.', timestamp: 'Aug 4, 2026 04:20 PM' },
    ],
  },
  {
    id: 'tkt_003', tenantId: 'tnt_001', tenantName: 'Hotel Everest Kathmandu',
    subject: 'Feature request: bulk rate updates', description: 'Managing 120 rooms individually is slow. Would love bulk rate editing per room type.',
    category: 'feature_request', priority: 'medium', status: 'resolved', assignedTo: 'Sandeep Rana',
    createdAt: 'Jul 30, 2026 02:10 PM', updatedAt: 'Aug 3, 2026 11:30 AM',
    messages: [
      { id: 'msg_005', sender: 'admin', senderName: 'Pemba Sherpa', message: 'As the title says — bulk rate editing would save us hours each week.', timestamp: 'Jul 30, 2026 02:10 PM' },
      { id: 'msg_006', sender: 'superadmin', senderName: 'Sandeep Rana', message: 'Noted and added to the Q3 roadmap (BULK-142). We will ping you when it ships.', timestamp: 'Aug 3, 2026 11:30 AM' },
    ],
  },
  {
    id: 'tkt_004', tenantId: 'tnt_008', tenantName: 'Royal Palace Hotel',
    subject: 'Guest app shows wrong currency', description: 'The guest mobile app is showing USD for all rates, but our property is set to NPR.',
    category: 'bug', priority: 'high', status: 'in_progress', assignedTo: 'Aarav Sharma',
    createdAt: 'Aug 4, 2026 10:05 AM', updatedAt: 'Aug 4, 2026 02:45 PM',
    messages: [
      { id: 'msg_007', sender: 'admin', senderName: 'Deepak Joshi', message: 'Currency override is not respected in the guest app checkout flow.', timestamp: 'Aug 4, 2026 10:05 AM' },
      { id: 'msg_008', sender: 'superadmin', senderName: 'Aarav Sharma', message: 'Reproduced in staging. Hotfix scheduled for tonight — will confirm after deploy.', timestamp: 'Aug 4, 2026 02:45 PM' },
    ],
  },
  {
    id: 'tkt_005', tenantId: 'tnt_003', tenantName: 'Budget Stay Chitwan',
    subject: 'Unable to log in after suspension', description: 'Our team cannot access the dashboard. Is our account suspended?',
    category: 'account', priority: 'medium', status: 'closed', assignedTo: 'Nisha Gurung',
    createdAt: 'Jul 30, 2026 09:15 AM', updatedAt: 'Jul 30, 2026 01:00 PM',
    messages: [
      { id: 'msg_009', sender: 'admin', senderName: 'Rajan Thapa', message: 'We cannot access the dashboard since this morning.', timestamp: 'Jul 30, 2026 09:15 AM' },
      { id: 'msg_010', sender: 'superadmin', senderName: 'Nisha Gurung', message: 'The account was suspended for non-payment. Please settle invoice INV-2026-0004 to restore access.', timestamp: 'Jul 30, 2026 01:00 PM' },
    ],
  },
  {
    id: 'tkt_006', tenantId: 'tnt_012', tenantName: 'Mustang Desert Camp',
    subject: 'Restaurant module setup help', description: 'We enabled the restaurant module and need help setting up tables and menu.',
    category: 'technical', priority: 'low', status: 'resolved', assignedTo: 'Sandeep Rana',
    createdAt: 'Jul 28, 2026 03:40 PM', updatedAt: 'Jul 29, 2026 10:20 AM',
    messages: [
      { id: 'msg_011', sender: 'admin', senderName: 'Tenzin Dolma', message: 'We would love some guidance with the restaurant setup.', timestamp: 'Jul 28, 2026 03:40 PM' },
      { id: 'msg_012', sender: 'superadmin', senderName: 'Sandeep Rana', message: 'Shared the setup guide and scheduled a walkthrough call for Friday.', timestamp: 'Jul 29, 2026 10:20 AM' },
    ],
  },
  {
    id: 'tkt_007', tenantId: 'tnt_006', tenantName: 'Himalaya View Hotel',
    subject: 'Refund not received for canceled booking', description: 'Guest canceled on July 24, refund still not reflected in our payout report.',
    category: 'billing', priority: 'medium', status: 'open', assignedTo: 'Nisha Gurung',
    createdAt: 'Aug 3, 2026 08:30 AM', updatedAt: 'Aug 3, 2026 08:30 AM',
    messages: [
      { id: 'msg_013', sender: 'admin', senderName: 'Kiran Basnet', message: 'Refund has been pending for 10 days. Could you check the payout cycle?', timestamp: 'Aug 3, 2026 08:30 AM' },
    ],
  },
  {
    id: 'tkt_008', tenantId: 'tnt_011', tenantName: 'Skyline Boutique Hotel',
    subject: 'Custom domain not resolving', description: 'Our custom domain has been propagating for 24h but still shows the default ServeIQ URL.',
    category: 'technical', priority: 'high', status: 'in_progress', assignedTo: 'Aarav Sharma',
    createdAt: 'Aug 2, 2026 11:55 AM', updatedAt: 'Aug 2, 2026 04:10 PM',
    messages: [
      { id: 'msg_014', sender: 'admin', senderName: 'Roshan KC', message: 'DNS shows our CNAME record but the site is not served on it yet.', timestamp: 'Aug 2, 2026 11:55 AM' },
      { id: 'msg_015', sender: 'superadmin', senderName: 'Aarav Sharma', message: 'Your CNAME is pointing at the staging host. Updating to the production alias now.', timestamp: 'Aug 2, 2026 04:10 PM' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// Announcements
// ═══════════════════════════════════════════════════════════════

export const mockAnnouncements: Announcement[] = [
  { id: 'ann_001', title: 'Scheduled maintenance — Search indexing', message: 'Search indexing will be rebuilt on August 15 between 02:00–03:00 AM (NPT). Property search may be briefly unavailable. No action needed.', type: 'maintenance', target: 'all', targetAudience: ['tenants', 'hosts', 'property_owners', 'admin'], sendEmail: true, sendWhatsApp: false, sendTelegram: true, status: 'scheduled', scheduledAt: 'Aug 15, 2026 02:00 AM', createdAt: 'Aug 4, 2026', sentCount: 0 },
  { id: 'ann_002', title: 'New: Multi-language support is live', message: 'Tenants on Professional and Enterprise plans can now publish booking sites in Nepali, English and Hindi. See the docs for setup.', type: 'update', target: 'tenants', targetAudience: ['tenants'], sendEmail: true, sendWhatsApp: true, sendTelegram: false, status: 'sent', sentAt: 'Jul 13, 2026 09:00 AM', createdAt: 'Jul 12, 2026', sentCount: 34, deliveredTo: ['tenants'] },
  { id: 'ann_003', title: 'Stripe fee schedule update', message: 'Effective September 1, international card transactions will incur an additional 0.5% cross-border fee. Updated pricing is available in the billing docs.', type: 'warning', target: 'all', targetAudience: ['tenants', 'hosts', 'property_owners', 'admin'], sendEmail: true, sendWhatsApp: false, sendTelegram: false, status: 'scheduled', scheduledAt: 'Aug 10, 2026 10:00 AM', createdAt: 'Aug 3, 2026', sentCount: 0 },
  { id: 'ann_004', title: 'Welcome, new tenants! 👋', message: 'A warm welcome to our newest properties. Complete your onboarding checklist to get the most out of ServeIQ.', type: 'info', target: 'tenants', targetAudience: ['tenants'], sendEmail: true, sendWhatsApp: true, sendTelegram: false, status: 'draft', createdAt: 'Aug 5, 2026', sentCount: 0 },
  { id: 'ann_005', title: 'New integration: Twilio SMS', message: 'Guest booking confirmations and check-in reminders via SMS are now available. Connect your Twilio account under Integrations.', type: 'update', target: 'tenants', targetAudience: ['tenants', 'hosts'], sendEmail: false, sendWhatsApp: true, sendTelegram: true, status: 'sent', sentAt: 'Jul 25, 2026 11:00 AM', createdAt: 'Jul 24, 2026', sentCount: 34, deliveredTo: ['tenants', 'hosts'] },
  { id: 'ann_006', title: 'Dynamic Pricing beta — sign up', message: 'Enterprise customers can join the Dynamic Pricing beta for ML-based rate recommendations. Reply to this announcement or open a ticket.', type: 'info', target: 'hosts', targetAudience: ['hosts'], sendEmail: false, sendWhatsApp: false, sendTelegram: true, status: 'draft', createdAt: 'Aug 4, 2026', sentCount: 0 },
]

// ═══════════════════════════════════════════════════════════════
// Platform Settings
// ═══════════════════════════════════════════════════════════════

export const mockSettings: PlatformSettings = {
  platformName: 'ServeIQ',
  platformUrl: 'https://ServeIQ.com',
  supportEmail: 'support@ServeIQ.com',
  supportPhone: '+977-1-5900000',
  timezone: 'Asia/Kathmandu',
  dateFormat: 'MMM DD, YYYY',
  timeFormat: '12-hour AM/PM',
  defaultLanguage: 'English',
  maintenanceMode: false,
  maintenanceMessage: 'ServeIQ is under scheduled maintenance. We will be back shortly.',
  smtpHost: 'smtp.ServeIQ.com',
  smtpPort: 587,
  smtpUsername: 'noreply@ServeIQ.com',
  smtpPassword: '••••••••',
  smtpEncryption: 'tls',
  fromEmail: 'noreply@ServeIQ.com',
  fromName: 'ServeIQ',
  sendTestEmailTo: 'aarav@ServeIQ.com',
  maxEmailsPerHour: 2000,
  passwordMinLength: 8,
  passwordRequireSpecialChars: true,
  maxLoginAttempts: 5,
  loginLockoutDuration: 15,
  sessionTimeout: 45,
  requireEmailVerification: true,
  allowedIpAddresses: '192.168.0.0/16, 10.0.0.0/8',
  adminEmailNotifications: true,
  adminSlackWebhook: 'https://hooks.slack.com/services/T0X1/ABC/DEF',
  bookingAlertThreshold: 15,
  dailyDigestEnabled: true,
  dailyDigestTime: '09:00 AM',
  supportedLanguages: ['English', 'Nepali', 'Hindi'],
  supportedCurrencies: ['USD', 'NPR', 'EUR', 'INR'],
  defaultCurrency: 'USD',
  bookingDateFormat: 'MMM DD, YYYY',
  enableMultiCurrency: true,
  maxFileUploadSize: 10,
  allowedFileTypes: 'jpg,png,webp,pdf',
  apiRateLimit: 100,
  maxWebhookRetries: 5,
  logRetentionDays: 90,
  backupRetentionDays: 30,
  autoBackupEnabled: true,
  autoBackupFrequency: 'daily',
  defaultTenantPlan: 'Free Trial',
  trialPeriodDays: 14,
  maxPropertiesFreeTier: 5,
  enableAutoProvision: true,
  tenantQuotaWarningPercent: 80,
  featureFlags: {
    multiLanguage: true,
    channelManager: true,
    advancedAnalytics: true,
    restaurantModule: false,
    customDomains: true,
  },
  paymentGateways: {
    stripe: true,
    razorpay: true,
    wire: true,
  },
}

export const mockSettingsChangeLogs: SettingsChangeLog[] = [
  { id: 'setlog_001', section: 'Security', setting: 'Session Timeout', oldValue: '30 minutes', newValue: '45 minutes', changedBy: 'Aarav Sharma', changedAt: 'Jul 26, 2026 09:30 AM' },
  { id: 'setlog_002', section: 'Payments', setting: 'Razorpay Gateway', oldValue: 'Disabled', newValue: 'Enabled', changedBy: 'Aarav Sharma', changedAt: 'Jul 18, 2026 02:15 PM' },
  { id: 'setlog_003', section: 'Email', setting: 'Daily Digest', oldValue: '08:00 AM', newValue: '09:00 AM', changedBy: 'Priya Koirala', changedAt: 'Jul 10, 2026 10:05 AM' },
  { id: 'setlog_004', section: 'Backup', setting: 'Backup Frequency', oldValue: 'Weekly', newValue: 'Daily', changedBy: 'Aarav Sharma', changedAt: 'Jun 28, 2026 11:40 AM' },
  { id: 'setlog_005', section: 'Localization', setting: 'Default Currency', oldValue: 'NPR', newValue: 'USD', changedBy: 'Sandeep Rana', changedAt: 'Jun 5, 2026 04:20 PM' },
]

// ═══════════════════════════════════════════════════════════════
// System Health (SystemHealthPage)
// ═══════════════════════════════════════════════════════════════

export const mockSystemHealthSnapshot = {
  serverUptime: 99.98, serverUptimeChange: 0.02,
  errorRate: 0.23, errorRateChange: 0.05,
  averageResponseTime: 84, p99ResponseTime: 212,
  activeConnections: 128, requestRate: 342,
  queueDepth: 12, queueDepthChange: 3,
  cacheHitRatio: 94.2,
  networkInbound: 412, networkOutbound: 385, networkUnit: 'Mbps',
}

export const mockServicesStatus: ServiceStatus[] = [
  { name: 'API Gateway', status: 'operational', uptime: '99.99%', latency: '62ms', icon: 'Zap', description: 'Routes all platform API traffic with auth and rate limiting' },
  { name: 'Auth Service', status: 'operational', uptime: '99.98%', latency: '48ms', icon: 'Server', description: 'Login, SSO, MFA and session management' },
  { name: 'Booking Engine', status: 'operational', uptime: '99.97%', latency: '74ms', icon: 'Globe', description: 'Property booking sites and checkout flow' },
  { name: 'Payment Gateway', status: 'degraded', uptime: '99.91%', latency: '128ms', icon: 'CreditCard', description: 'Stripe & Razorpay processing, webhooks and invoicing' },
  { name: 'Database (PostgreSQL)', status: 'operational', uptime: '99.99%', latency: '32ms', icon: 'Database', description: 'Primary relational store with read replicas' },
  { name: 'Email Service', status: 'operational', uptime: '99.95%', latency: '210ms', icon: 'Mail', description: 'Transactional email, digests and announcements' },
  { name: 'Search Index', status: 'maintenance', uptime: '99.86%', latency: '95ms', icon: 'Search', description: 'Full-text property & booking search' },
  { name: 'Cache / Redis', status: 'operational', uptime: '100%', latency: '1.2ms', icon: 'Layers', description: 'Session cache, rate-limit counters and hot data' },
  { name: 'CDN', status: 'operational', uptime: '100%', latency: '28ms', icon: 'Wifi', description: 'Global edge delivery for booking sites and assets' },
  { name: 'Background Jobs', status: 'operational', uptime: '99.92%', latency: '41ms', icon: 'HardDrive', description: 'Queues for email, webhooks, reports and backups' },
]

export const mockIncidents: IncidentItem[] = [
  { id: 'inc_001', title: 'Payment Gateway latency spike', status: 'resolved', severity: 'major', timestamp: 'Aug 3, 2026 14:22', resolvedAt: 'Aug 3, 2026 15:05', description: 'Webhook processing latency spiked to 1.8s during a Stripe incident. Retries were queued and drained after resolution. No charges were lost.', services: ['Payment Gateway'] },
  { id: 'inc_002', title: 'Search index rebuild failure', status: 'resolved', severity: 'minor', timestamp: 'Jul 28, 2026 22:10', resolvedAt: 'Jul 28, 2026 23:40', description: 'A nightly index rebuild failed due to a disk quota error on the search node. Rebuilt successfully after cleanup.', services: ['Search Index'] },
  { id: 'inc_003', title: 'Database connection pool exhaustion', status: 'monitoring', severity: 'major', timestamp: 'Aug 5, 2026 08:40', description: 'Connection pool usage exceeded 85% during peak booking hours. Auto-scaling engaged; monitoring closely.', services: ['Database (PostgreSQL)', 'API Gateway'] },
  { id: 'inc_004', title: 'CDN edge node degraded in APAC', status: 'investigating', severity: 'minor', timestamp: 'Aug 5, 2026 09:05', description: 'One edge node in the ap-south-1 region is serving stale assets. Traffic is being shifted to other edges.', services: ['CDN'] },
]

const hourlyMetric = (label: string, unit: string, max: number, current: number, values: number[]): ResourceMetric => ({
  label, unit, max, current,
  average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
  data: values,
})

export const mockCpuMetrics: ResourceMetric = hourlyMetric('CPU', '%', 100, 42, [31, 34, 33, 36, 38, 41, 44, 47, 52, 55, 58, 54, 49, 46, 43, 40, 38, 36, 39, 43, 46, 44, 42, 41])
export const mockMemoryMetrics: ResourceMetric = hourlyMetric('Memory', 'GB', 64, 43, [58, 57, 57, 58, 59, 60, 61, 62, 63, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50])
export const mockDiskIOMetrics: ResourceMetric = hourlyMetric('Disk I/O', 'MB/s', 100, 62, [22, 19, 24, 31, 28, 42, 55, 62, 71, 66, 58, 47, 39, 33, 29, 26, 24, 27, 32, 38, 44, 49, 45, 40])
export const mockNetworkMetrics: ResourceMetric = hourlyMetric('Network', 'Mbps', 1000, 412, [280, 265, 255, 248, 240, 260, 310, 380, 445, 480, 455, 420, 390, 360, 335, 315, 300, 320, 355, 395, 425, 440, 428, 410])

export const mockHourlyLabels: string[] = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']

export const mockDependencyChecks: DependencyCheck[] = [
  { name: 'PostgreSQL', endpoint: 'postgres.ServeIQ.internal', status: 'healthy', latency: '32ms', lastChecked: '2 min ago' },
  { name: 'Redis Cache', endpoint: 'redis.ServeIQ.internal', status: 'healthy', latency: '1.2ms', lastChecked: '2 min ago' },
  { name: 'Stripe API', endpoint: 'api.stripe.com', status: 'healthy', latency: '210ms', lastChecked: '4 min ago' },
  { name: 'Razorpay API', endpoint: 'api.razorpay.com', status: 'slow', latency: '640ms', lastChecked: '4 min ago' },
  { name: 'AWS S3', endpoint: 's3.amazonaws.com', status: 'healthy', latency: '48ms', lastChecked: '5 min ago' },
  { name: 'SendGrid', endpoint: 'api.sendgrid.com', status: 'healthy', latency: '165ms', lastChecked: '5 min ago' },
]

export const mockServerNodes: ServerNode[] = [
  { id: 'node_01', name: 'web-01', region: 'us-east-1', cpu: 42, memory: 68, disk: 54, status: 'online', uptime: '99.99%' },
  { id: 'node_02', name: 'web-02', region: 'us-east-1', cpu: 38, memory: 61, disk: 52, status: 'online', uptime: '99.98%' },
  { id: 'node_03', name: 'api-01', region: 'eu-west-1', cpu: 55, memory: 72, disk: 61, status: 'warning', uptime: '99.95%' },
  { id: 'node_04', name: 'db-01', region: 'ap-south-1', cpu: 63, memory: 78, disk: 58, status: 'online', uptime: '99.99%' },
]

// ═══════════════════════════════════════════════════════════════
// System Logs (LogsPage)
// ═══════════════════════════════════════════════════════════════

export const mockSystemLogs: SystemLogEntry[] = [
  { id: 'syslog_001', timestamp: '2026-08-05 09:14:22', level: 'info', source: 'api-server', message: 'GET /api/v1/tenants?page=2 returned 200 in 58ms', details: '200 OK — 58ms — 1,284 bytes', ip: '192.168.1.100', userId: 'adm_001', requestId: 'req_a1b2c3' },
  { id: 'syslog_002', timestamp: '2026-08-05 09:13:58', level: 'warn', source: 'payment-gateway', message: 'Webhook retry scheduled for txn_0417 (attempt 2 of 5)', details: 'Stripe webhook returned 502 — retrying with exponential backoff', requestId: 'req_9f8e7d' },
  { id: 'syslog_003', timestamp: '2026-08-05 09:13:11', level: 'info', source: 'booking-engine', message: 'Booking #BK-77231 created for Royal Palace Hotel', details: 'Room Deluxe King — Aug 12 to Aug 14 — NPR 24,500', userId: 'tnt_008', requestId: 'req_4b5c6d' },
  { id: 'syslog_004', timestamp: '2026-08-05 09:12:40', level: 'debug', source: 'cache', message: 'Cache miss for rate_limit:key_001 — recalculating', details: 'Redis GET returned nil', requestId: 'req_7h8j9k' },
  { id: 'syslog_005', timestamp: '2026-08-05 09:12:05', level: 'error', source: 'database', message: 'Connection pool at 88% — autoscaler engaged', details: 'max_connections=100, active=88, idle=4', requestId: 'req_2m3n4p' },
  { id: 'syslog_006', timestamp: '2026-08-05 09:10:33', level: 'info', source: 'auth-service', message: 'Login success for aarav@ServeIQ.com (MFA ok)', details: 'Issued access token, TTL 45 min', ip: '192.168.1.100', userId: 'adm_001', requestId: 'req_5q6r7s' },
  { id: 'syslog_007', timestamp: '2026-08-05 09:08:51', level: 'warn', source: 'webhook', message: 'Channel sync webhook (wh_003) failing — 214 failures / 7 days', details: 'Endpoint returned 408 on last 12 attempts', requestId: 'req_8t9u0v' },
  { id: 'syslog_008', timestamp: '2026-08-05 09:05:20', level: 'info', source: 'background-jobs', message: 'Job email_4821 completed in 1.2s', details: 'Queue email-queue — 4 workers active', requestId: 'req_1w2x3y' },
  { id: 'syslog_009', timestamp: '2026-08-05 09:03:47', level: 'debug', source: 'api-server', message: 'Request ID tracing enabled for /api/v1/bookings', details: 'sample_rate=0.1', requestId: 'req_4z5a6b' },
  { id: 'syslog_010', timestamp: '2026-08-05 08:58:12', level: 'info', source: 'search-index', message: 'Index updated for property tnt_008 (2,140 docs)', details: 'Indexing latency 310ms', requestId: 'req_7c8d9e' },
  { id: 'syslog_011', timestamp: '2026-08-05 08:52:40', level: 'warn', source: 'cdn', message: 'Edge node ap-south-1 serving stale assets', details: 'Purged cache entry cache_asset_8821', requestId: 'req_0f1g2h' },
  { id: 'syslog_012', timestamp: '2026-08-05 08:44:02', level: 'info', source: 'payment-gateway', message: 'Charge succeeded txn_0420 — $99.00 (Hotel Everest Kathmandu)', details: 'Stripe ch_3Qz… — card visa •••• 4242', requestId: 'req_3i4j5k' },
  { id: 'syslog_013', timestamp: '2026-08-05 08:40:15', level: 'error', source: 'email-service', message: 'SMTP timeout sending digest to support@ServeIQ.com', details: 'Connection reset by peer — retrying (2/3)', requestId: 'req_6l7m8n' },
  { id: 'syslog_014', timestamp: '2026-08-05 08:31:55', level: 'info', source: 'background-jobs', message: 'Nightly backup completed — 2.4 GB to S3', details: 'backup_2026-08-05.zip — checksum ok', requestId: 'req_9p0q1r' },
  { id: 'syslog_015', timestamp: '2026-08-05 08:22:31', level: 'info', source: 'auth-service', message: 'Password reset requested for hello@budgetstay.com', details: 'Reset link sent', ip: '103.44.55.221', requestId: 'req_2s3t4u' },
  { id: 'syslog_016', timestamp: '2026-08-05 08:15:09', level: 'debug', source: 'booking-engine', message: 'Pricing engine cache warmed for tnt_012', details: '12 rate plans cached', requestId: 'req_5v6w7x' },
  { id: 'syslog_017', timestamp: '2026-08-05 08:02:44', level: 'warn', source: 'api-server', message: 'Rate limit warning for key_003 (82% of quota)', details: '4,928 / 6,000 hourly requests', requestId: 'req_8y9z0a' },
  { id: 'syslog_018', timestamp: '2026-08-05 07:58:33', level: 'error', source: 'payment-gateway', message: 'Razorpay order creation failed — API timeout', details: 'POST /v1/orders — 504 in 30s', requestId: 'req_1b2c3d' },
  { id: 'syslog_019', timestamp: '2026-08-05 07:48:11', level: 'info', source: 'system', message: 'Deploy v2.41.0 rolled out to 100% of nodes', details: 'Deployment ID dep_20260805_01 — 12 nodes healthy', requestId: 'req_4e5f6g' },
  { id: 'syslog_020', timestamp: '2026-08-05 07:40:26', level: 'info', source: 'api-server', message: 'POST /api/v1/subscriptions returned 201 in 112ms', details: 'Subscription sub_011 created', userId: 'adm_001', requestId: 'req_7h8i9j' },
  { id: 'syslog_021', timestamp: '2026-08-04 23:59:59', level: 'info', source: 'system', message: 'Daily usage aggregation completed for 12 tenants', details: 'Aggregation window 2026-08-04 00:00 → 23:59', requestId: 'req_0k1l2m' },
  { id: 'syslog_022', timestamp: '2026-08-04 22:45:18', level: 'debug', source: 'cache', message: 'Evicted 2,140 idle keys (maxmemory policy: allkeys-lru)', details: 'Redis memory usage dropped to 61%', requestId: 'req_3n4o5p' },
  { id: 'syslog_023', timestamp: '2026-08-04 21:30:02', level: 'warn', source: 'search-index', message: 'Index rebuild scheduled but disk usage at 89%', details: 'Estimated 1.8 GB needed — cleanup requested', requestId: 'req_6q7r8s' },
  { id: 'syslog_024', timestamp: '2026-08-04 20:15:47', level: 'info', source: 'webhook', message: 'Webhook delivered to api.everesthotel.com/webhooks/booking (200)', details: 'Event booking.created — 1.4s total', requestId: 'req_9t0u1v' },
]

// ═══════════════════════════════════════════════════════════════
// Background Jobs
// ═══════════════════════════════════════════════════════════════

export const mockJobQueues: JobQueue[] = [
  { id: 'queue_001', name: 'email-queue', description: 'Transactional emails, digests and announcements', currentDepth: 128, processedToday: 4820, failedToday: 12, avgProcessingTime: '1.4s', workers: 4, status: 'running', ratePerMinute: 320 },
  { id: 'queue_002', name: 'webhook-delivery', description: 'Outbound webhook delivery to tenant endpoints', currentDepth: 46, processedToday: 3107, failedToday: 214, avgProcessingTime: '480ms', workers: 6, status: 'running', ratePerMinute: 96 },
  { id: 'queue_003', name: 'booking-sync', description: 'OTA channel availability and rate sync', currentDepth: 312, processedToday: 8412, failedToday: 28, avgProcessingTime: '620ms', workers: 8, status: 'running', ratePerMinute: 410 },
  { id: 'queue_004', name: 'report-generation', description: 'Scheduled analytics and revenue reports', currentDepth: 0, processedToday: 64, failedToday: 1, avgProcessingTime: '8.2s', workers: 2, status: 'paused', ratePerMinute: 4 },
  { id: 'queue_005', name: 'search-index', description: 'Full-text index builds and updates', currentDepth: 21, processedToday: 1480, failedToday: 9, avgProcessingTime: '2.1s', workers: 3, status: 'degraded', ratePerMinute: 61 },
]

export const mockJobEntries: JobEntry[] = [
  { id: 'job_101', queue: 'email-queue', type: 'SendAnnouncementEmail', status: 'completed', priority: 'normal', createdAt: 'Aug 5, 2026 09:10 AM', startedAt: 'Aug 5, 2026 09:10 AM', completedAt: 'Aug 5, 2026 09:10 AM', duration: '1.1s', retryCount: 0, maxRetries: 3, payload: '{"announcementId":"ann_003","recipients":34}' },
  { id: 'job_102', queue: 'webhook-delivery', type: 'DeliverWebhook', status: 'retrying', priority: 'high', createdAt: 'Aug 5, 2026 09:02 AM', startedAt: 'Aug 5, 2026 09:02 AM', duration: '—', retryCount: 2, maxRetries: 5, payload: '{"webhookId":"wh_003","event":"channel.room_updated"}', error: '408 Request Timeout', tenantName: 'Lakeside Resort Pokhara' },
  { id: 'job_103', queue: 'booking-sync', type: 'SyncAvailability', status: 'running', priority: 'high', createdAt: 'Aug 5, 2026 09:12 AM', startedAt: 'Aug 5, 2026 09:12 AM', retryCount: 0, maxRetries: 2, payload: '{"tenantId":"tnt_008","channel":"booking.com","rooms":210}', tenantName: 'Royal Palace Hotel' },
  { id: 'job_104', queue: 'email-queue', type: 'SendInvoice', status: 'completed', priority: 'normal', createdAt: 'Aug 5, 2026 08:58 AM', startedAt: 'Aug 5, 2026 08:58 AM', completedAt: 'Aug 5, 2026 08:58 AM', duration: '0.9s', retryCount: 0, maxRetries: 3, payload: '{"invoiceId":"INV-2026-0012","to":"reservations@royalpalace.com"}' },
  { id: 'job_105', queue: 'search-index', type: 'RebuildIndex', status: 'pending', priority: 'low', createdAt: 'Aug 5, 2026 09:15 AM', retryCount: 0, maxRetries: 2, payload: '{"collection":"properties","tenantIds":["tnt_012"]}' },
  { id: 'job_106', queue: 'report-generation', type: 'GenerateRevenueReport', status: 'pending', priority: 'normal', createdAt: 'Aug 5, 2026 09:00 AM', retryCount: 0, maxRetries: 3, payload: '{"period":"2026-07","format":"pdf"}' },
  { id: 'job_107', queue: 'webhook-delivery', type: 'DeliverWebhook', status: 'completed', priority: 'normal', createdAt: 'Aug 5, 2026 08:55 AM', startedAt: 'Aug 5, 2026 08:55 AM', completedAt: 'Aug 5, 2026 08:55 AM', duration: '1.4s', retryCount: 0, maxRetries: 5, payload: '{"webhookId":"wh_001","event":"booking.confirmed"}', tenantName: 'Hotel Everest Kathmandu' },
  { id: 'job_108', queue: 'email-queue', type: 'SendDailyDigest', status: 'failed', priority: 'low', createdAt: 'Aug 5, 2026 08:40 AM', startedAt: 'Aug 5, 2026 08:40 AM', duration: '—', retryCount: 1, maxRetries: 3, payload: '{"tenantId":"tnt_007","time":"09:00 AM"}', error: 'SMTP timeout — connection reset' },
  { id: 'job_109', queue: 'booking-sync', type: 'SyncRates', status: 'completed', priority: 'high', createdAt: 'Aug 5, 2026 08:31 AM', startedAt: 'Aug 5, 2026 08:31 AM', completedAt: 'Aug 5, 2026 08:32 AM', duration: '48.2s', retryCount: 0, maxRetries: 2, payload: '{"tenantId":"tnt_004","channel":"booking.com","rates":62}', tenantName: 'Heritage Inn Bhaktapur' },
  { id: 'job_110', queue: 'search-index', type: 'UpdateDocument', status: 'running', priority: 'normal', createdAt: 'Aug 5, 2026 09:13 AM', startedAt: 'Aug 5, 2026 09:13 AM', retryCount: 0, maxRetries: 2, payload: '{"docId":"tnt_008","op":"index"}' },
  { id: 'job_111', queue: 'webhook-delivery', type: 'DeliverWebhook', status: 'pending', priority: 'normal', createdAt: 'Aug 5, 2026 09:14 AM', retryCount: 0, maxRetries: 5, payload: '{"webhookId":"wh_004","event":"booking.completed"}', tenantName: 'Mustang Desert Camp' },
  { id: 'job_112', queue: 'email-queue', type: 'SendPaymentReceipt', status: 'completed', priority: 'high', createdAt: 'Aug 5, 2026 08:44 AM', startedAt: 'Aug 5, 2026 08:44 AM', completedAt: 'Aug 5, 2026 08:44 AM', duration: '0.8s', retryCount: 0, maxRetries: 3, payload: '{"transactionId":"txn_0420","to":"admin@everesthotel.com"}' },
]

export const mockScheduledTasks: ScheduledTask[] = [
  { id: 'task_001', name: 'Daily Database Backup', description: 'Full snapshot to S3 with 30-day retention', cron: '0 2 * * *', nextRun: 'Aug 6, 2026 02:00 AM', lastRun: 'Aug 5, 2026 02:00 AM', lastStatus: 'success', enabled: true, queue: 'email-queue' },
  { id: 'task_002', name: 'Weekly Revenue Digest', description: 'Sends Monday revenue summary to all admins', cron: '0 9 * * 1', nextRun: 'Aug 10, 2026 09:00 AM', lastRun: 'Aug 3, 2026 09:00 AM', lastStatus: 'success', enabled: true, queue: 'report-generation' },
  { id: 'task_003', name: 'Send Booking Reminders', description: '24h before check-in reminders to guests', cron: '0 12 * * *', nextRun: 'Aug 6, 2026 12:00 PM', lastRun: 'Aug 5, 2026 12:00 PM', lastStatus: 'success', enabled: true, queue: 'email-queue' },
  { id: 'task_004', name: 'Purge Expired Tokens', description: 'Removes expired sessions and refresh tokens', cron: '0 3 * * *', nextRun: 'Aug 6, 2026 03:00 AM', lastRun: 'Aug 5, 2026 03:00 AM', lastStatus: 'success', enabled: true, queue: 'booking-sync' },
  { id: 'task_005', name: 'Index New Properties', description: 'Incremental search index updates', cron: '*/30 * * * *', nextRun: 'Aug 5, 2026 09:30 AM', lastRun: 'Aug 5, 2026 09:00 AM', lastStatus: 'failed', enabled: true, queue: 'search-index' },
]

export const mockWorkerPools: WorkerPool[] = [
  { id: 'pool_001', name: 'webhook-workers', queue: 'webhook-delivery', activeWorkers: 6, maxWorkers: 12, utilization: 74, avgJobDuration: '480ms', throughput: 96, status: 'active' },
  { id: 'pool_002', name: 'email-workers', queue: 'email-queue', activeWorkers: 4, maxWorkers: 8, utilization: 58, avgJobDuration: '1.4s', throughput: 320, status: 'active' },
  { id: 'pool_003', name: 'report-workers', queue: 'report-generation', activeWorkers: 2, maxWorkers: 4, utilization: 12, avgJobDuration: '8.2s', throughput: 4, status: 'idle' },
  { id: 'pool_004', name: 'search-workers', queue: 'search-index', activeWorkers: 3, maxWorkers: 10, utilization: 41, avgJobDuration: '2.1s', throughput: 61, status: 'scaling' },
]

// ═══════════════════════════════════════════════════════════════
// Monitoring (MonitoringPage)
// ═══════════════════════════════════════════════════════════════

export const mockAlertRules: AlertRule[] = [
  { id: 'rule_001', name: 'High Error Rate', description: 'Alert when API error rate exceeds 1% over 5 minutes', metric: 'error_rate', condition: '>', threshold: 1, unit: '%', severity: 'critical', status: 'enabled', lastTriggered: 'Aug 3, 2026 14:22', cooldownMinutes: 15 },
  { id: 'rule_002', name: 'API Latency', description: 'Alert when p95 response time exceeds 300ms', metric: 'latency_p95', condition: '>', threshold: 300, unit: 'ms', severity: 'warning', status: 'enabled', lastTriggered: 'Aug 4, 2026 11:12', cooldownMinutes: 10 },
  { id: 'rule_003', name: 'CPU Utilization', description: 'Alert when any node CPU exceeds 85% for 10 minutes', metric: 'cpu_usage', condition: '>', threshold: 85, unit: '%', severity: 'warning', status: 'enabled', lastTriggered: '—', cooldownMinutes: 20 },
  { id: 'rule_004', name: 'Queue Depth', description: 'Alert when any queue exceeds 100 pending jobs', metric: 'queue_depth', condition: '>', threshold: 100, unit: 'jobs', severity: 'critical', status: 'enabled', lastTriggered: 'Aug 5, 2026 08:40', cooldownMinutes: 10 },
  { id: 'rule_005', name: 'Payment Gateway Down', description: 'Alert when payment gateway uptime check fails', metric: 'gateway_status', condition: '==', threshold: 0, unit: 'status', severity: 'critical', status: 'enabled', lastTriggered: 'Aug 3, 2026 14:22', cooldownMinutes: 5 },
  { id: 'rule_006', name: 'Disk Usage', description: 'Alert when disk usage exceeds 85% on any node', metric: 'disk_usage', condition: '>', threshold: 85, unit: '%', severity: 'info', status: 'disabled', lastTriggered: 'Jul 28, 2026 22:10', cooldownMinutes: 30 },
]

export const mockActiveAlerts: ActiveAlert[] = [
  { id: 'alert_001', ruleId: 'rule_005', ruleName: 'Payment Gateway Down', severity: 'critical', status: 'firing', currentValue: 'down', threshold: 'up', startedAt: 'Aug 3, 2026 14:22', description: 'Uptime check against api.stripe.com failed 3 consecutive times' },
  { id: 'alert_002', ruleId: 'rule_004', ruleName: 'Queue Depth', severity: 'critical', status: 'firing', currentValue: '128', threshold: '100', startedAt: 'Aug 5, 2026 08:40', description: 'email-queue depth above threshold — workers scaling' },
  { id: 'alert_003', ruleId: 'rule_002', ruleName: 'API Latency', severity: 'warning', status: 'acknowledged', currentValue: '342ms', threshold: '300ms', startedAt: 'Aug 4, 2026 11:12', acknowledgedAt: 'Aug 4, 2026 11:40', description: 'p95 latency elevated during peak — acknowledged, monitoring' },
  { id: 'alert_004', ruleId: 'rule_003', ruleName: 'CPU Utilization', severity: 'warning', status: 'resolved', currentValue: '61%', threshold: '85%', startedAt: 'Aug 1, 2026 06:10', resolvedAt: 'Aug 1, 2026 06:45', description: 'CPU spike on api-01 resolved after autoscaling' },
]

export const mockUptimeChecks: UptimeCheck[] = [
  { id: 'up_001', name: 'Dashboard API', endpoint: 'https://api.ServeIQ.com/health', status: 'up', responseTimeMs: 84, uptime7d: 99.99, uptime30d: 99.98, lastChecked: '1 min ago', region: 'ap-south-1' },
  { id: 'up_002', name: 'Booking Engine', endpoint: 'https://booking.ServeIQ.com/health', status: 'up', responseTimeMs: 96, uptime7d: 99.97, uptime30d: 99.95, lastChecked: '1 min ago', region: 'ap-south-1' },
  { id: 'up_003', name: 'Webhooks Ingress', endpoint: 'https://api.ServeIQ.com/webhooks/health', status: 'slow', responseTimeMs: 412, uptime7d: 98.42, uptime30d: 99.21, lastChecked: '2 min ago', region: 'eu-west-1' },
  { id: 'up_004', name: 'Auth Service', endpoint: 'https://auth.ServeIQ.com/health', status: 'up', responseTimeMs: 48, uptime7d: 99.98, uptime30d: 99.99, lastChecked: '1 min ago', region: 'us-east-1' },
  { id: 'up_005', name: 'CDN Edge', endpoint: 'https://cdn.ServeIQ.com/health', status: 'up', responseTimeMs: 28, uptime7d: 100, uptime30d: 100, lastChecked: '1 min ago', region: 'ap-south-1' },
  { id: 'up_006', name: 'Admin Console', endpoint: 'https://admin.ServeIQ.com/health', status: 'down', responseTimeMs: 0, uptime7d: 96.2, uptime30d: 98.8, lastChecked: '3 min ago', region: 'us-east-1' },
]

export const mockPerformanceData: PerformancePoint[] = [
  { timestamp: '00:00', responseTimeMs: 68, errorRatePct: 0.05, throughput: 182 },
  { timestamp: '01:00', responseTimeMs: 65, errorRatePct: 0.03, throughput: 168 },
  { timestamp: '02:00', responseTimeMs: 62, errorRatePct: 0.02, throughput: 154 },
  { timestamp: '03:00', responseTimeMs: 60, errorRatePct: 0.02, throughput: 149 },
  { timestamp: '04:00', responseTimeMs: 64, errorRatePct: 0.04, throughput: 158 },
  { timestamp: '05:00', responseTimeMs: 72, errorRatePct: 0.06, throughput: 187 },
  { timestamp: '06:00', responseTimeMs: 78, errorRatePct: 0.08, throughput: 224 },
  { timestamp: '07:00', responseTimeMs: 84, errorRatePct: 0.1, throughput: 268 },
  { timestamp: '08:00', responseTimeMs: 96, errorRatePct: 0.14, throughput: 315 },
  { timestamp: '09:00', responseTimeMs: 108, errorRatePct: 0.18, throughput: 362 },
  { timestamp: '10:00', responseTimeMs: 118, errorRatePct: 0.22, throughput: 398 },
  { timestamp: '11:00', responseTimeMs: 124, errorRatePct: 0.25, throughput: 412 },
  { timestamp: '12:00', responseTimeMs: 118, errorRatePct: 0.21, throughput: 402 },
  { timestamp: '13:00', responseTimeMs: 112, errorRatePct: 0.19, throughput: 386 },
  { timestamp: '14:00', responseTimeMs: 108, errorRatePct: 0.17, throughput: 371 },
  { timestamp: '15:00', responseTimeMs: 104, errorRatePct: 0.15, throughput: 358 },
  { timestamp: '16:00', responseTimeMs: 102, errorRatePct: 0.14, throughput: 349 },
  { timestamp: '17:00', responseTimeMs: 106, errorRatePct: 0.16, throughput: 355 },
  { timestamp: '18:00', responseTimeMs: 112, errorRatePct: 0.18, throughput: 367 },
  { timestamp: '19:00', responseTimeMs: 98, errorRatePct: 0.13, throughput: 331 },
  { timestamp: '20:00', responseTimeMs: 92, errorRatePct: 0.11, throughput: 305 },
  { timestamp: '21:00', responseTimeMs: 86, errorRatePct: 0.09, throughput: 278 },
  { timestamp: '22:00', responseTimeMs: 78, errorRatePct: 0.07, throughput: 244 },
  { timestamp: '23:00', responseTimeMs: 72, errorRatePct: 0.05, throughput: 214 },
]

export const mockAlertHistory: AlertHistoryItem[] = [
  { id: 'hist_001', ruleName: 'Payment Gateway Down', severity: 'critical', status: 'resolved', startedAt: 'Aug 3, 2026 14:22', resolvedAt: 'Aug 3, 2026 15:05', duration: '43m' },
  { id: 'hist_002', ruleName: 'API Latency', severity: 'warning', status: 'acknowledged', startedAt: 'Aug 4, 2026 11:12', duration: '>1d' },
  { id: 'hist_003', ruleName: 'Search Index Rebuild', severity: 'info', status: 'resolved', startedAt: 'Jul 28, 2026 22:10', resolvedAt: 'Jul 28, 2026 23:40', duration: '1h 30m' },
  { id: 'hist_004', ruleName: 'CPU Utilization', severity: 'warning', status: 'resolved', startedAt: 'Aug 1, 2026 06:10', resolvedAt: 'Aug 1, 2026 06:45', duration: '35m' },
  { id: 'hist_005', ruleName: 'Disk Usage', severity: 'info', status: 'resolved', startedAt: 'Jul 25, 2026 09:00', resolvedAt: 'Jul 25, 2026 09:12', duration: '12m' },
]

// ═══════════════════════════════════════════════════════════════
// Usage & Billing (UsageBillingPage)
// ═══════════════════════════════════════════════════════════════

export const mockTenantUsageData: TenantUsage[] = [
  { id: 'use_001', tenantName: 'Hotel Everest Kathmandu', planName: 'Enterprise', status: 'active', apiCalls: 248000, apiCallsLimit: 500000, storageGB: 82, storageLimit: 200, bandwidthGB: 410, bandwidthLimit: 1000, propertiesCount: 3, propertiesLimit: -1, roomsCount: 120, roomsLimit: -1, usersCount: 45, usersLimit: -1, overageCharges: 0, lastBilledAt: 'Aug 1, 2026' },
  { id: 'use_002', tenantName: 'Lakeside Resort Pokhara', planName: 'Professional', status: 'active', apiCalls: 96500, apiCallsLimit: 100000, storageGB: 41, storageLimit: 100, bandwidthGB: 188, bandwidthLimit: 500, propertiesCount: 1, propertiesLimit: 25, roomsCount: 45, roomsLimit: 150, usersCount: 18, usersLimit: 20, overageCharges: 12.5, lastBilledAt: 'Aug 1, 2026' },
  { id: 'use_003', tenantName: 'Budget Stay Chitwan', planName: 'Basic', status: 'suspended', apiCalls: 11200, apiCallsLimit: 25000, storageGB: 8, storageLimit: 25, bandwidthGB: 42, bandwidthLimit: 100, propertiesCount: 1, propertiesLimit: 10, roomsCount: 18, roomsLimit: 50, usersCount: 6, usersLimit: 5, overageCharges: 0, lastBilledAt: 'Jun 1, 2026' },
  { id: 'use_004', tenantName: 'Heritage Inn Bhaktapur', planName: 'Professional', status: 'active', apiCalls: 78200, apiCallsLimit: 100000, storageGB: 36, storageLimit: 100, bandwidthGB: 154, bandwidthLimit: 500, propertiesCount: 2, propertiesLimit: 25, roomsCount: 62, roomsLimit: 150, usersCount: 25, usersLimit: 20, overageCharges: 8.75, lastBilledAt: 'Aug 1, 2026' },
  { id: 'use_005', tenantName: 'Sunrise Beach Resort', planName: 'Free Trial', status: 'trialing', apiCalls: 3400, apiCallsLimit: 5000, storageGB: 2, storageLimit: 5, bandwidthGB: 8, bandwidthLimit: 20, propertiesCount: 1, propertiesLimit: 5, roomsCount: 24, roomsLimit: 30, usersCount: 8, usersLimit: 3, overageCharges: 0, lastBilledAt: '—' },
  { id: 'use_006', tenantName: 'Himalaya View Hotel', planName: 'Enterprise', status: 'active', apiCalls: 188000, apiCallsLimit: 500000, storageGB: 68, storageLimit: 200, bandwidthGB: 322, bandwidthLimit: 1000, propertiesCount: 2, propertiesLimit: -1, roomsCount: 88, roomsLimit: -1, usersCount: 32, usersLimit: -1, overageCharges: 0, lastBilledAt: 'Aug 1, 2026' },
  { id: 'use_007', tenantName: 'Garden Retreat Lalitpur', planName: 'Professional', status: 'active', apiCalls: 88400, apiCallsLimit: 100000, storageGB: 29, storageLimit: 100, bandwidthGB: 142, bandwidthLimit: 500, propertiesCount: 1, propertiesLimit: 25, roomsCount: 38, roomsLimit: 150, usersCount: 14, usersLimit: 20, overageCharges: 0, lastBilledAt: 'Aug 1, 2026' },
  { id: 'use_008', tenantName: 'Royal Palace Hotel', planName: 'Enterprise', status: 'active', apiCalls: 412000, apiCallsLimit: 500000, storageGB: 148, storageLimit: 200, bandwidthGB: 724, bandwidthLimit: 1000, propertiesCount: 4, propertiesLimit: -1, roomsCount: 210, roomsLimit: -1, usersCount: 68, usersLimit: -1, overageCharges: 42.0, lastBilledAt: 'Aug 1, 2026' },
  { id: 'use_009', tenantName: 'Mountain Trail Lodge', planName: 'Basic', status: 'paused', apiCalls: 5400, apiCallsLimit: 25000, storageGB: 5, storageLimit: 25, bandwidthGB: 24, bandwidthLimit: 100, propertiesCount: 1, propertiesLimit: 10, roomsCount: 12, roomsLimit: 50, usersCount: 4, usersLimit: 5, overageCharges: 0, lastBilledAt: 'May 1, 2026' },
  { id: 'use_010', tenantName: 'Annapurna Base Camp Inn', planName: 'Free Trial', status: 'trialing', apiCalls: 2100, apiCallsLimit: 5000, storageGB: 1, storageLimit: 5, bandwidthGB: 5, bandwidthLimit: 20, propertiesCount: 1, propertiesLimit: 5, roomsCount: 16, roomsLimit: 30, usersCount: 5, usersLimit: 3, overageCharges: 0, lastBilledAt: '—' },
  { id: 'use_011', tenantName: 'Skyline Boutique Hotel', planName: 'Professional', status: 'active', apiCalls: 44800, apiCallsLimit: 100000, storageGB: 18, storageLimit: 100, bandwidthGB: 86, bandwidthLimit: 500, propertiesCount: 1, propertiesLimit: 25, roomsCount: 28, roomsLimit: 150, usersCount: 11, usersLimit: 20, overageCharges: 0, lastBilledAt: 'Aug 1, 2026' },
  { id: 'use_012', tenantName: 'Mustang Desert Camp', planName: 'Enterprise', status: 'active', apiCalls: 142000, apiCallsLimit: 500000, storageGB: 51, storageLimit: 200, bandwidthGB: 268, bandwidthLimit: 1000, propertiesCount: 2, propertiesLimit: -1, roomsCount: 54, roomsLimit: -1, usersCount: 22, usersLimit: -1, overageCharges: 0, lastBilledAt: 'Aug 1, 2026' },
]

export const mockUsageMonthlyBreakdown: UsageMonthlyBreakdown[] = [
  { month: 'Feb 2026', apiCalls: 2410000, storageGB: 312, bandwidthGB: 1480, activeTenants: 11, totalOverageCharges: 18.4 },
  { month: 'Mar 2026', apiCalls: 2620000, storageGB: 336, bandwidthGB: 1612, activeTenants: 11, totalOverageCharges: 21.6 },
  { month: 'Apr 2026', apiCalls: 2810000, storageGB: 358, bandwidthGB: 1740, activeTenants: 11, totalOverageCharges: 24.1 },
  { month: 'May 2026', apiCalls: 2980000, storageGB: 379, bandwidthGB: 1895, activeTenants: 12, totalOverageCharges: 27.9 },
  { month: 'Jun 2026', apiCalls: 3240000, storageGB: 402, bandwidthGB: 2032, activeTenants: 12, totalOverageCharges: 31.5 },
  { month: 'Jul 2026', apiCalls: 3520000, storageGB: 431, bandwidthGB: 2214, activeTenants: 12, totalOverageCharges: 36.8 },
]

export const mockOverageCharges: OverageCharge[] = [
  { id: 'ovg_001', tenantName: 'Lakeside Resort Pokhara', resource: 'api_calls', overageAmount: 6500, unit: 'calls', ratePerUnit: 0.00002, totalCharge: 0.13, currency: 'USD', billingPeriod: 'Jul 2026', status: 'invoiced', issuedAt: 'Aug 1, 2026', description: 'API calls above 100K monthly quota' },
  { id: 'ovg_002', tenantName: 'Heritage Inn Bhaktapur', resource: 'users', overageAmount: 5, unit: 'users', ratePerUnit: 1.75, totalCharge: 8.75, currency: 'USD', billingPeriod: 'Jul 2026', status: 'invoiced', issuedAt: 'Aug 1, 2026', description: '5 staff users above plan limit of 20' },
  { id: 'ovg_003', tenantName: 'Royal Palace Hotel', resource: 'storage', overageAmount: 28, unit: 'GB', ratePerUnit: 1.5, totalCharge: 42.0, currency: 'USD', billingPeriod: 'Jul 2026', status: 'paid', issuedAt: 'Aug 1, 2026', paidAt: 'Aug 3, 2026', description: 'Storage above 200 GB plan allocation' },
  { id: 'ovg_004', tenantName: 'Sunrise Beach Resort', resource: 'bandwidth', overageAmount: 4, unit: 'GB', ratePerUnit: 0.5, totalCharge: 2.0, currency: 'USD', billingPeriod: 'Jul 2026', status: 'waived', issuedAt: 'Aug 1, 2026', description: 'Trial tenant — overage waived' },
  { id: 'ovg_005', tenantName: 'Garden Retreat Lalitpur', resource: 'rooms', overageAmount: 6, unit: 'rooms', ratePerUnit: 0.9, totalCharge: 5.4, currency: 'USD', billingPeriod: 'Jun 2026', status: 'pending', issuedAt: 'Jul 1, 2026', description: 'Rooms above 150 limit during expansion' },
  { id: 'ovg_006', tenantName: 'Himalaya View Hotel', resource: 'properties', overageAmount: 1, unit: 'properties', ratePerUnit: 12.0, totalCharge: 12.0, currency: 'USD', billingPeriod: 'Jul 2026', status: 'paid', issuedAt: 'Aug 1, 2026', paidAt: 'Aug 2, 2026', description: 'Temporary 3rd property during renovation' },
]
