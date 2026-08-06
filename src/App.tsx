import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PageLoader } from './components/PageLoader'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SuperAdminRoute } from './components/SuperAdminRoute'
import { ScrollRestoration } from './components/ScrollRestoration'

const Login = lazy(() => import('./pages/Login'))
const SuperAdminLayout = lazy(() => import('./components/superadmin/SuperAdminLayout'))
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'))
const SuperAdminSystemHealth = lazy(() => import('./pages/superadmin/SystemHealthPage'))
const SuperAdminPlans = lazy(() => import('./pages/superadmin/PlansPage'))
const SuperAdminSubscriptions = lazy(() => import('./pages/superadmin/SubscriptionsPage'))
const SuperAdminFeatureFlags = lazy(() => import('./pages/superadmin/FeatureFlagsPage'))
const SuperAdminSettings = lazy(() => import('./pages/superadmin/SettingsPage'))
const SuperAdminPayments = lazy(() => import('./pages/superadmin/PaymentsPage'))
const SuperAdminAuditLogs = lazy(() => import('./pages/superadmin/AuditLogsPage'))
const SuperAdminIntegrations = lazy(() => import('./pages/superadmin/IntegrationsPage'))
const SuperAdminUsageBilling = lazy(() => import('./pages/superadmin/UsageBillingPage'))
const SuperAdminMonitoring = lazy(() => import('./pages/superadmin/MonitoringPage'))
const SuperAdminLogs = lazy(() => import('./pages/superadmin/LogsPage'))
const SuperAdminBackgroundJobs = lazy(() => import('./pages/superadmin/BackgroundJobsPage'))
const SuperAdminApiManagement = lazy(() => import('./pages/superadmin/ApiManagementPage'))
const SuperAdminTenants = lazy(() => import('./pages/superadmin/tenant/TenantsPage'))
const SuperAdminTenantAnalytics = lazy(() => import('./pages/superadmin/tenant/TenantAnalytics'))
const SuperAdminTenantBilling = lazy(() => import('./pages/superadmin/tenant/TenantBilling'))
const SuperAdminTenantOnboarding = lazy(() => import('./pages/superadmin/tenant/TenantOnboarding'))
const SuperAdminAdminsRoles = lazy(() => import('./pages/superadmin/AdminsRolesPage'))
const SuperAdminApiKeys = lazy(() => import('./pages/superadmin/ApiKeysPage'))
const SuperAdminTickets = lazy(() => import('./pages/superadmin/TicketsPage'))
const SuperAdminAnnouncements = lazy(() => import('./pages/superadmin/AnnouncementsPage'))
const SuperAdminProfile = lazy(() => import('./pages/superadmin/SuperAdminProfile'))
const SuperAdminProfileLayout = lazy(() => import('./components/superadmin/SuperAdminProfileLayout'))
const SuperAdminNotifications = lazy(() => import('./pages/superadmin/SuperAdminNotifications'))

function App() {
  return (
    <BrowserRouter>
      <ScrollRestoration />
      <Suspense fallback={<PageLoader />}>
        <ErrorBoundary>
        <Routes>
          <Route path="/superadmin/login" element={<Login />} />
          <Route path="/superadmin/profile" element={<SuperAdminRoute><SuperAdminProfileLayout /></SuperAdminRoute>}>
            <Route index element={<SuperAdminProfile />} />
            <Route path="settings" element={<SuperAdminSettings />} />
            <Route path="notifications" element={<SuperAdminNotifications />} />
          </Route>
          <Route path="/superadmin" element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="system-health" element={<SuperAdminSystemHealth />} />
            <Route path="plans" element={<SuperAdminPlans />} />
            <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
            <Route path="feature-flags" element={<SuperAdminFeatureFlags />} />
            <Route path="settings" element={<SuperAdminSettings />} />
            <Route path="payments" element={<SuperAdminPayments />} />
            <Route path="audit-logs" element={<SuperAdminAuditLogs />} />
            <Route path="integrations" element={<SuperAdminIntegrations />} />
            <Route path="usage-billing" element={<SuperAdminUsageBilling />} />
            <Route path="monitoring" element={<SuperAdminMonitoring />} />
            <Route path="logs" element={<SuperAdminLogs />} />
            <Route path="background-jobs" element={<SuperAdminBackgroundJobs />} />
            <Route path="tenants" element={<SuperAdminTenants />} />
            <Route path="tenants/analytics" element={<SuperAdminTenantAnalytics />} />
            <Route path="tenants/billing" element={<SuperAdminTenantBilling />} />
            <Route path="tenants/onboarding" element={<SuperAdminTenantOnboarding />} />
            <Route path="api-management" element={<SuperAdminApiManagement />} />
            <Route path="admins-roles" element={<SuperAdminAdminsRoles />} />
            <Route path="api-keys" element={<SuperAdminApiKeys />} />
            <Route path="tickets" element={<SuperAdminTickets />} />
            <Route path="announcements" element={<SuperAdminAnnouncements />} />
          </Route>
          <Route path="*" element={<Navigate to="/superadmin/login" replace />} />
        </Routes>
        </ErrorBoundary>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
