import api from '../api'

// ─── Envelope ────────────────────────────────────────────────

export interface StandardResponse<T> {
  success: boolean
  data: T
  meta?: Record<string, unknown> | null
}

// ─── Dashboard / health ──────────────────────────────────────
// The OpenAPI operations `sa_dashboard_metrics_v1` and
// `sa_system_health_v1` declare an empty (`{}`) response schema,
// so these are intentionally open shapes.

export interface DashboardMetrics {
  [key: string]: unknown
}

export interface SystemHealth {
  [key: string]: unknown
}

// ─── Plans ───────────────────────────────────────────────────

export interface CreatePlanRequest {
  name: string
  slug: string
  price_monthly: number | string
  price_yearly?: number | string | null
  max_properties?: number
  max_staff?: number
  max_rooms_per_property?: number
  max_bookings_per_month?: number
  features?: Record<string, unknown> | null
}

export interface UpdatePlanRequest {
  name?: string | null
  price_monthly?: number | string | null
  price_yearly?: number | string | null
  max_properties?: number | null
  max_staff?: number | null
  max_rooms_per_property?: number | null
  max_bookings_per_month?: number | null
  features?: Record<string, unknown> | null
  is_active?: boolean | null
}

export interface PlanResponse {
  id: string
  name: string
  slug: string
  price_monthly: string
  price_yearly: string | null
  max_properties: number
  max_staff: number
  max_rooms_per_property: number
  max_bookings_per_month: number
  features: Record<string, unknown> | null
  is_active: boolean
  created_at: string
}

export interface PlanListResponse {
  plans: PlanResponse[]
  total: number
}

export interface ListPlansParams {
  include_inactive?: boolean
}

// ─── Subscriptions ───────────────────────────────────────────

export interface AssignSubscriptionRequest {
  plan_id: string
  billing_cycle?: string
}

export interface UpgradeSubscriptionRequest {
  plan_id: string
  billing_cycle?: string | null
}

export interface TenantSubscriptionResponse {
  id: string
  tenant_id: string
  plan_id: string
  status: string
  billing_cycle: string
  starts_at: string
  expires_at: string | null
  plan: PlanResponse
}

// ─── Feature flags ───────────────────────────────────────────

export interface CreateFeatureFlagRequest {
  name: string
  key: string
  description?: string | null
  is_enabled?: boolean
}

export interface UpdateFeatureFlagRequest {
  name?: string | null
  description?: string | null
  is_enabled?: boolean | null
}

export interface FeatureFlagResponse {
  id: string
  name: string
  key: string
  description: string | null
  is_enabled: boolean
  created_by: string | null
  created_at: string
  updated_at: string | null
}

export interface FeatureFlagListResponse {
  flags: FeatureFlagResponse[]
  total: number
}

// ─── Announcements ───────────────────────────────────────────

export interface CreateAnnouncementRequest {
  title: string
  message: string
  priority?: string
  target?: string
  target_admin_ids?: string[] | null
  send_email?: boolean
}

export interface AnnouncementResponse {
  id: string
  title: string
  message: string
  priority: string
  target: string
  target_admin_ids: unknown[] | null
  send_email: boolean
  created_by: string | null
  created_at: string
}

export interface AnnouncementListResponse {
  announcements: AnnouncementResponse[]
  total: number
}

// ─── Admins ──────────────────────────────────────────────────

export interface CreateAdminRequest {
  email: string
  full_name: string
  phone?: string | null
  password: string
}

export interface UpdateAdminRequest {
  full_name?: string | null
  phone?: string | null
  is_active?: boolean | null
}

export interface AdminResponse {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: string
  is_active: boolean
  tenant_id: string | null
  created_at: string
}

export interface AdminListResponse {
  admins: AdminResponse[]
  total: number
  skip: number
  limit: number
}

export interface AuditLogResponse {
  id: string
  actor_email: string
  action: string
  target_type: string
  target_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface AuditLogListResponse {
  logs: AuditLogResponse[]
  total: number
  skip: number
  limit: number
}

export interface ImpersonateResponse {
  access_token: string
  token_type: string
  expires_in: number
  impersonated_admin_id: string
  impersonated_admin_email: string
}

export interface PaginationParams {
  skip?: number
  limit?: number
}

// ─── Dashboard / health ──────────────────────────────────────

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const { data: result } = await api.get('/superadmin/dashboard')
  return result.data
}

export const getSystemHealth = async (): Promise<SystemHealth> => {
  const { data: result } = await api.get('/superadmin/health')
  return result.data
}

// ─── Plans ───────────────────────────────────────────────────

export const listPlans = async (params?: ListPlansParams): Promise<PlanListResponse> => {
  const { data: result } = await api.get('/superadmin/plans', { params })
  return result.data
}

export const createPlan = async (data: CreatePlanRequest): Promise<PlanResponse> => {
  const { data: result } = await api.post('/superadmin/plans', data)
  return result.data
}

export const updatePlan = async (planId: string, data: UpdatePlanRequest): Promise<PlanResponse> => {
  const { data: result } = await api.patch(`/superadmin/plans/${planId}`, data)
  return result.data
}

export const deletePlan = async (planId: string): Promise<void> => {
  await api.delete(`/superadmin/plans/${planId}`)
}

// ─── Subscriptions ───────────────────────────────────────────

export const getTenantSubscription = async (tenantId: string): Promise<TenantSubscriptionResponse> => {
  const { data: result } = await api.get(`/superadmin/tenants/${tenantId}/subscription`)
  return result.data
}

export const assignSubscription = async (
  tenantId: string,
  data: AssignSubscriptionRequest,
): Promise<TenantSubscriptionResponse> => {
  const { data: result } = await api.post(`/superadmin/tenants/${tenantId}/subscription`, data)
  return result.data
}

export const changeSubscription = async (
  tenantId: string,
  data: UpgradeSubscriptionRequest,
): Promise<TenantSubscriptionResponse> => {
  const { data: result } = await api.patch(`/superadmin/tenants/${tenantId}/subscription`, data)
  return result.data
}

// ─── Feature flags ───────────────────────────────────────────

export const listFeatureFlags = async (): Promise<FeatureFlagListResponse> => {
  const { data: result } = await api.get('/superadmin/feature-flags')
  return result.data
}

export const createFeatureFlag = async (data: CreateFeatureFlagRequest): Promise<FeatureFlagResponse> => {
  const { data: result } = await api.post('/superadmin/feature-flags', data)
  return result.data
}

export const updateFeatureFlag = async (
  flagId: string,
  data: UpdateFeatureFlagRequest,
): Promise<FeatureFlagResponse> => {
  const { data: result } = await api.patch(`/superadmin/feature-flags/${flagId}`, data)
  return result.data
}

export const deleteFeatureFlag = async (flagId: string): Promise<void> => {
  await api.delete(`/superadmin/feature-flags/${flagId}`)
}

// ─── Announcements ───────────────────────────────────────────

export const listAnnouncements = async (params?: PaginationParams): Promise<AnnouncementListResponse> => {
  const { data: result } = await api.get('/superadmin/announcements', { params })
  return result.data
}

export const createAnnouncement = async (data: CreateAnnouncementRequest): Promise<AnnouncementResponse> => {
  const { data: result } = await api.post('/superadmin/announcements', data)
  return result.data
}

export const deleteAnnouncement = async (announcementId: string): Promise<void> => {
  await api.delete(`/superadmin/announcements/${announcementId}`)
}

// ─── Admins ──────────────────────────────────────────────────

export const listAdmins = async (params?: PaginationParams): Promise<AdminListResponse> => {
  const { data: result } = await api.get('/superadmin/admins', { params })
  return result.data
}

export const createAdmin = async (data: CreateAdminRequest): Promise<AdminResponse> => {
  const { data: result } = await api.post('/superadmin/admins', data)
  return result.data
}

export const getAdmin = async (adminId: string): Promise<AdminResponse> => {
  const { data: result } = await api.get(`/superadmin/admins/${adminId}`)
  return result.data
}

export const updateAdmin = async (adminId: string, data: UpdateAdminRequest): Promise<AdminResponse> => {
  const { data: result } = await api.patch(`/superadmin/admins/${adminId}`, data)
  return result.data
}

export const deleteAdmin = async (adminId: string): Promise<void> => {
  await api.delete(`/superadmin/admins/${adminId}`)
}

export const getAdminAudit = async (adminId: string, params?: PaginationParams): Promise<AuditLogListResponse> => {
  const { data: result } = await api.get(`/superadmin/admins/${adminId}/audit`, { params })
  return result.data
}

export const impersonateAdmin = async (adminId: string): Promise<ImpersonateResponse> => {
  const { data: result } = await api.post(`/superadmin/admins/${adminId}/impersonate`)
  return result.data
}

// ─── Audit logs ──────────────────────────────────────────────

export const listAuditLogs = async (params?: PaginationParams): Promise<AuditLogListResponse> => {
  const { data: result } = await api.get('/superadmin/audit-logs', { params })
  return result.data
}
