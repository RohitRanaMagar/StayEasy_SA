import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings, Globe, Mail, Shield, Bell, Wrench, Save,
  RefreshCw, Eye, EyeOff, Clock, Server,
  Users, Download, Upload, FileText, Info, ChevronRight,
  Flag, CreditCard,
} from 'lucide-react'
import { useToast } from '../../components/superadmin/Toast'
import AdvancedButton from '../../components/superadmin/AdvancedButton'
import { useAction } from '../../components/superadmin/useAction'
import { useSuperAdminStore } from '../../components/superadmin/superAdminStore'
import { PageTransition } from '../../components/superadmin/Animations'
import type { PlatformSettings, SettingsChangeLog } from '../../types/superadmin'

import { mockSettingsChangeLogs } from '../../data/superAdminMockData'
const settingsChangeLogs: SettingsChangeLog[] = mockSettingsChangeLogs

// ═══════════════════════════════════════════════════════════════
// Tab Configuration
// ═══════════════════════════════════════════════════════════════

const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'localization', label: 'Localization', icon: Globe },
  { id: 'features', label: 'Features', icon: Flag },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
] as const

type TabId = typeof tabs[number]['id']

// ═══════════════════════════════════════════════════════════════
// Settings Field Input Components
// ═══════════════════════════════════════════════════════════════

function TextInput({ label, value, type = 'text', help, disabled }: {
  label: string; value: string; type?: string; help?: string; disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        defaultValue={value}
        disabled={disabled}
        className={`w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none transition-colors ${
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'focus:border-[#2E86AB] hover:border-gray-300'
        }`}
      />
      {help && <p className="text-[10px] text-gray-400 mt-1">{help}</p>}
    </div>
  )
}

function NumberInput({ label, value, help, suffix }: {
  label: string; value: number; help?: string; suffix?: string
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          defaultValue={value}
          className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] hover:border-gray-300 transition-colors"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">{suffix}</span>}
      </div>
      {help && <p className="text-[10px] text-gray-400 mt-1">{help}</p>}
    </div>
  )
}

function ToggleField({ label, value, help }: {
  label: string; value: boolean; help?: string
}) {
  const [enabled, setEnabled] = useState(value)
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <span className="text-[13px] text-gray-700 font-medium">{label}</span>
        {help && <p className="text-[10px] text-gray-400 mt-0.5">{help}</p>}
      </div>
      <button
        onClick={() => setEnabled(v => !v)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 ${enabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${enabled ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}

function SelectField({ label, value, options, help }: {
  label: string; value: string; options: string[]; help?: string
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-500 mb-1">{label}</label>
      <select
        defaultValue={value}
        className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] hover:border-gray-300 transition-colors"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {help && <p className="text-[10px] text-gray-400 mt-1">{help}</p>}
    </div>
  )
}

function TextareaField({ label, value, help, rows = 3 }: {
  label: string; value: string; help?: string; rows?: number
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-500 mb-1">{label}</label>
      <textarea
        defaultValue={value}
        rows={rows}
        className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] hover:border-gray-300 transition-colors resize-none"
      />
      {help && <p className="text-[10px] text-gray-400 mt-1">{help}</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Settings Section Wrapper
// ═══════════════════════════════════════════════════════════════

function SettingsSection({ title, description, children, icon: Icon }: {
  title: string; description?: string; children: React.ReactNode; icon: typeof Settings
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#2E86AB15' }}>
          <Icon size={15} className="text-[#2E86AB]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-[11px] text-gray-400">{description}</p>}
        </div>
      </div>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Settings Change Log
// ═══════════════════════════════════════════════════════════════

function SettingsChangeLog() {
  const navigate = useNavigate()
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Recent Changes</h3>
        <button onClick={() => navigate('/superadmin/audit-logs')} className="text-[11px] font-medium text-[#2E86AB] hover:text-[#1A6B8A] transition-colors">View All →</button>
      </div>
      <div className="space-y-0">
        {settingsChangeLogs.map((log, idx) => (
          <div key={log.id} className="relative pl-6 pb-3 last:pb-0">
            {idx < settingsChangeLogs.length - 1 && (
              <div className="absolute left-[5px] top-3 bottom-0 w-px bg-gray-100" />
            )}
            <div className="absolute left-[1px] top-1.5 w-[9px] h-[9px] rounded-full bg-[#2E86AB] ring-2 ring-white" />
            <div className="text-[12px] font-medium text-gray-800">{log.setting}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              <span className="text-red-400 line-through">{log.oldValue}</span>
              {' → '}
              <span className="text-emerald-600">{log.newValue}</span>
            </div>
            <div className="text-[9px] text-gray-400 mt-0.5">{log.changedAt} · {log.changedBy}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Tab Panel
// ═══════════════════════════════════════════════════════════════

function GeneralSettings({ settings }: { settings: PlatformSettings }) {
  return (
    <div className="space-y-4">
      <SettingsSection title="Platform Information" description="Basic platform identity and contact details" icon={Settings}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <TextInput label="Platform Name" value={settings.platformName} help="Used across all system emails and pages" />
          <TextInput label="Platform URL" value={settings.platformUrl} help="Main website URL" />
          <TextInput label="Support Email" value={settings.supportEmail} />
          <TextInput label="Support Phone" value={settings.supportPhone} />
        </div>
      </SettingsSection>

      <SettingsSection title="Regional Settings" description="Timezone, date/time formats, and default language" icon={Globe}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <SelectField label="Timezone" value={settings.timezone}
            options={['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney']}
            help="Default timezone for all platform operations" />
          <SelectField label="Date Format" value={settings.dateFormat}
            options={['MMM DD, YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} />
          <SelectField label="Time Format" value={settings.timeFormat === '12h' ? '12-hour (AM/PM)' : '24-hour'}
            options={['12-hour (AM/PM)', '24-hour']} />
          <SelectField label="Default Language" value={settings.defaultLanguage === 'en' ? 'English' : settings.defaultLanguage}
            options={['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Chinese']} />
        </div>
      </SettingsSection>

      <SettingsSection title="Maintenance Mode" description="Put the platform in maintenance mode" icon={Wrench}>
        <ToggleField label="Enable Maintenance Mode" value={settings.maintenanceMode}
          help="When enabled, only super admins can access the platform" />
        <TextareaField label="Maintenance Message" value={settings.maintenanceMessage}
          help="Shown to users when maintenance mode is active" rows={2} />
      </SettingsSection>
    </div>
  )
}

function EmailSettings({ settings }: { settings: PlatformSettings }) {
  const { showToast } = useToast()
  const [showPw, setShowPw] = useState(false)

  return (
    <div className="space-y-4">
      <SettingsSection title="SMTP Configuration" description="Outgoing email server settings" icon={Mail}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <TextInput label="SMTP Host" value={settings.smtpHost} />
          <NumberInput label="SMTP Port" value={settings.smtpPort} />
          <TextInput label="SMTP Username" value={settings.smtpUsername} />
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">SMTP Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                defaultValue={settings.smtpPassword || '••••••••••••••••'}
                className="w-full px-3 py-2 pr-10 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#2E86AB] hover:border-gray-300 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <SelectField label="Encryption" value={settings.smtpEncryption === 'tls' ? 'TLS' : settings.smtpEncryption === 'ssl' ? 'SSL' : 'None'}
            options={['TLS', 'SSL', 'None']} />
          <NumberInput label="Max Emails Per Hour" value={settings.maxEmailsPerHour} suffix="emails/h" />
        </div>
      </SettingsSection>

      <SettingsSection title="Sender Details" description="Default from name and email address" icon={Mail}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <TextInput label="From Email" value={settings.fromEmail} help="Shown as the sender in all outgoing emails" />
          <TextInput label="From Name" value={settings.fromName} help="Display name for the sender" />
        </div>
      </SettingsSection>

      <SettingsSection title="Test Email" description="Send a test email to verify SMTP configuration" icon={Mail}>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <TextInput label="Send Test To" value={settings.sendTestEmailTo} />
          </div>
          <button onClick={() => showToast('success', 'Test email sent successfully (mock)')}
            className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-white rounded-lg transition-colors shrink-0"
            style={{ background: 'linear-gradient(135deg, #2E86AB, #1A6B8A)' }}
          >
            <Mail size={13} /> Send Test
          </button>
        </div>
      </SettingsSection>
    </div>
  )
}

function SecuritySettings({ settings }: { settings: PlatformSettings }) {
  return (
    <div className="space-y-4">
      <SettingsSection title="Password Policy" description="Password requirements for tenant admin accounts" icon={Shield}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <NumberInput label="Minimum Password Length" value={settings.passwordMinLength} suffix="chars" />
          <div className="flex items-center pt-6">
            <ToggleField label="Require Special Characters" value={settings.passwordRequireSpecialChars}
              help="Require !@#$%^&* in passwords" />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Login Security" description="Authentication and session settings" icon={Shield}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <NumberInput label="Max Login Attempts" value={settings.maxLoginAttempts} help="Before account is temporarily locked" />
          <NumberInput label="Lockout Duration" value={settings.loginLockoutDuration} suffix="minutes" />
          <NumberInput label="Session Timeout" value={settings.sessionTimeout} suffix="minutes" help="Inactivity timeout for admin sessions" />
          <div className="flex items-center pt-6">
            <ToggleField label="Require Email Verification" value={settings.requireEmailVerification}
              help="New accounts must verify their email" />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="IP Restrictions" description="Allowed IP addresses for admin access" icon={Shield}>
        <TextInput label="Allowed IP Ranges (CIDR)" value={settings.allowedIpAddresses}
          help="Comma-separated CIDR notation. Use 0.0.0.0/0 to allow all" />
      </SettingsSection>
    </div>
  )
}

function NotificationSettings({ settings }: { settings: PlatformSettings }) {
  return (
    <div className="space-y-4">
      <SettingsSection title="Admin Notifications" description="How super admins receive platform alerts" icon={Bell}>
        <ToggleField label="Email Notifications" value={settings.adminEmailNotifications}
          help="Receive administrative alerts via email" />
        <TextInput label="Slack Webhook URL" value={settings.adminSlackWebhook}
          help="Post notifications to a Slack channel" />
      </SettingsSection>

      <SettingsSection title="Booking Alerts" description="Alert thresholds for booking activity" icon={Bell}>
        <NumberInput label="Booking Alert Threshold" value={settings.bookingAlertThreshold} suffix="minutes"
          help="Send alert if no booking is received within this period" />
      </SettingsSection>

      <SettingsSection title="Daily Digest" description="Configure daily summary emails" icon={Clock}>
        <ToggleField label="Enable Daily Digest" value={settings.dailyDigestEnabled}
          help="Send a daily summary of platform activity" />
        <SelectField label="Digest Time" value={settings.dailyDigestTime}
          options={['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']}
          help="Time of day to send the digest" />
      </SettingsSection>
    </div>
  )
}

function LocalizationSettings({ settings }: { settings: PlatformSettings }) {
  return (
    <div className="space-y-4">
      <SettingsSection title="Currencies" description="Supported currencies and multi-currency settings" icon={Globe}>
        <ToggleField label="Enable Multi-Currency" value={settings.enableMultiCurrency}
          help="Allow tenants to accept payments in multiple currencies" />
        <SelectField label="Default Currency" value={settings.defaultCurrency}
          options={['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'BRL', 'MXN', 'CNY']} />
        <SelectField label="Booking Date Format" value={settings.bookingDateFormat}
          options={['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']} />
        <div>
          <label className="block text-[11px] font-medium text-gray-500 mb-1">Supported Currencies</label>
          <div className="flex flex-wrap gap-1.5">
            {settings.supportedCurrencies.map(curr => (
              <span key={curr} className="px-2 py-1 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {curr}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Currencies enabled for tenant payment processing</p>
        </div>
      </SettingsSection>

      <SettingsSection title="Languages" description="Supported platform languages" icon={Globe}>
        <div>
          <label className="block text-[11px] font-medium text-gray-500 mb-1">Supported Languages</label>
          <div className="flex flex-wrap gap-1.5">
            {settings.supportedLanguages.map(lang => (
              <span key={lang} className="px-2 py-1 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                {lang.toUpperCase()}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{settings.supportedLanguages.length} languages available</p>
        </div>
      </SettingsSection>
    </div>
  )
}

function MaintenanceSettings({ settings }: { settings: PlatformSettings }) {
  return (
    <div className="space-y-4">
      <SettingsSection title="File Upload" description="File upload limits and allowed types" icon={Upload}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <NumberInput label="Max File Upload Size" value={settings.maxFileUploadSize} suffix="MB" />
          <TextInput label="Allowed File Types" value={settings.allowedFileTypes} />
        </div>
      </SettingsSection>

      <SettingsSection title="API & Webhooks" description="API rate limits and webhook retry configuration" icon={Server}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <NumberInput label="API Rate Limit" value={settings.apiRateLimit} suffix="req/min" help="Per-tenant API rate limit" />
          <NumberInput label="Max Webhook Retries" value={settings.maxWebhookRetries} help="Number of retry attempts for failed webhooks" />
        </div>
      </SettingsSection>

      <SettingsSection title="Data Retention" description="Log and backup retention policies" icon={FileText}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <NumberInput label="Log Retention Period" value={settings.logRetentionDays} suffix="days" help="System logs are purged after this period" />
          <NumberInput label="Backup Retention Period" value={settings.backupRetentionDays} suffix="days" />
        </div>
      </SettingsSection>

      <SettingsSection title="Automated Backups" description="Configure automatic backup scheduling" icon={Download}>
        <ToggleField label="Enable Auto Backup" value={settings.autoBackupEnabled} help="Automatically backup the platform database" />
        <SelectField label="Backup Frequency" value={settings.autoBackupFrequency}
          options={['daily', 'weekly', 'monthly']}
          help="How often to run automated backups" />
      </SettingsSection>

      <SettingsSection title="Tenant Defaults" description="Default settings for new tenants" icon={Users}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <SelectField label="Default Plan" value={settings.defaultTenantPlan}
            options={['Free Trial', 'Basic', 'Professional', 'Enterprise']} />
          <NumberInput label="Trial Period Duration" value={settings.trialPeriodDays} suffix="days" />
          <NumberInput label="Max Properties (Free Tier)" value={settings.maxPropertiesFreeTier} />
          <NumberInput label="Quota Warning At" value={settings.tenantQuotaWarningPercent} suffix="%" help="Warn tenants when they reach this % of their plan limit" />
        </div>
        <ToggleField label="Enable Auto-Provision" value={settings.enableAutoProvision}
          help="Automatically provision tenant accounts upon signup" />
      </SettingsSection>
    </div>
  )
}

function FeatureSettings({ settings }: { settings: PlatformSettings }) {
  return (
    <div className="space-y-4">
      <SettingsSection title="Feature Flags" description="Enable or disable platform features globally" icon={Flag}>
        <ToggleField label="Multi-Language Support" value={settings.featureFlags.multiLanguage}
          help="Allow tenants to configure multiple languages" />
        <ToggleField label="Channel Manager" value={settings.featureFlags.channelManager}
          help="Sync availability across OTAs (Booking.com, Airbnb, etc.)" />
        <ToggleField label="Advanced Analytics" value={settings.featureFlags.advancedAnalytics}
          help="Detailed reporting and analytics dashboards" />
        <ToggleField label="Restaurant Module" value={settings.featureFlags.restaurantModule}
          help="Table reservations and restaurant management" />
        <ToggleField label="Custom Domains" value={settings.featureFlags.customDomains}
          help="Allow tenants to use their own domain names" />
      </SettingsSection>
    </div>
  )
}

function PaymentGatewaySettings({ settings }: { settings: PlatformSettings }) {
  return (
    <div className="space-y-4">
      <SettingsSection title="Payment Gateways" description="Configure payment processing providers" icon={CreditCard}>
        <ToggleField label="Stripe" value={settings.paymentGateways.stripe}
          help="Accept credit/debit cards via Stripe" />
        <ToggleField label="Razorpay" value={settings.paymentGateways.razorpay}
          help="Accept payments via Razorpay (India, Nepal)" />
        <ToggleField label="Wire Transfer" value={settings.paymentGateways.wire}
          help="Accept manual bank wire transfers" />
      </SettingsSection>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function SettingsPage() {
  const { showToast } = useToast()
  const storeSettings = useSuperAdminStore(s => s.settings)
  const updateSettings = useSuperAdminStore(s => s.updateSettings)
  const resetSettings = useSuperAdminStore(s => s.resetSettings)
  const saveAction = useAction({ duration: 800 })
  const resetAction = useAction({ duration: 500 })
  const [activeTab, setActiveTab] = useState<TabId>('general')

  const handleSave = async () => {
    await saveAction.execute(async () => {
      await new Promise(r => setTimeout(r, 800))
      updateSettings({ platformName: storeSettings.platformName })
      showToast('success', 'Settings saved successfully')
    })
  }

  const handleReset = async () => {
    await resetAction.execute(async () => {
      resetSettings()
      showToast('info', 'Settings reset to defaults')
    })
  }

  const settings = storeSettings

  return (
    <PageTransition>
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
            Platform Settings
          </h2>
          <p className="text-[12px] text-gray-400 mt-0.5">Configure global platform settings, email, security, and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <AdvancedButton
            variant="outline" size="md"
            icon={<RefreshCw size={13} />}
            loading={resetAction.loading}
            success={resetAction.success}
            onClick={handleReset}
            tooltip="Reset all settings to defaults"
          >
            Reset
          </AdvancedButton>
        </div>
      </div>

      {/* ── Info Banner ───────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl border border-blue-100 p-3.5 flex items-start gap-2.5">
        <Info size={14} className="text-[#2E86AB] mt-0.5 shrink-0" />
        <p className="text-[11px] text-gray-600 leading-relaxed">
          These settings apply globally across the entire platform. Changes take effect immediately for all tenants.
          Use the tabs below to navigate between configuration sections.
        </p>
      </div>

      {/* ── Layout: Sidebar tabs + Content ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_220px] gap-3">
        {/* Tab Navigation */}
        <div>
          <div className="bg-white rounded-xl border border-gray-100 p-2 sticky top-6">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible custom-scroll-thin">
              {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#2E86AB]/10 text-[#2E86AB] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={15} />
                    <span className="hidden lg:inline">{tab.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Quick Stats (desktop) */}
            <div className="hidden lg:block mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Sections</span>
                <span className="font-medium text-gray-600">{tabs.length}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Settings</span>
                <span className="font-medium text-gray-600">{Object.keys(settings).length}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Recent Changes</span>
                <span className="font-medium text-gray-600">{settingsChangeLogs.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-3">
          {/* Active Tab Indicator */}
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <Settings size={12} />
            <span>Settings</span>
            <ChevronRight size={10} />
            <span className="font-medium text-gray-600 capitalize">{activeTab}</span>
          </div>

          {/* Tab Content */}
          {activeTab === 'general' && <GeneralSettings settings={settings} />}
          {activeTab === 'email' && <EmailSettings settings={settings} />}
          {activeTab === 'security' && <SecuritySettings settings={settings} />}
          {activeTab === 'notifications' && <NotificationSettings settings={settings} />}
          {activeTab === 'localization' && <LocalizationSettings settings={settings} />}
          {activeTab === 'features' && <FeatureSettings settings={settings} />}
          {activeTab === 'payments' && <PaymentGatewaySettings settings={settings} />}
          {activeTab === 'maintenance' && <MaintenanceSettings settings={settings} />}

          {/* Save Footer */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-[11px] text-gray-400">
              <span className="font-medium text-gray-600 capitalize">{activeTab}</span> settings — changes apply globally
            </div>
            <AdvancedButton
              variant="primary" size="md"
              icon={<Save size={14} />}
              loading={saveAction.loading}
              success={saveAction.success}
              onClick={handleSave}
            >
              {saveAction.success ? 'Saved!' : 'Save Changes'}
            </AdvancedButton>
          </div>
        </div>

        {/* Change Log */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <SettingsChangeLog />
          </div>
        </div>
        <div className="lg:hidden">
          <SettingsChangeLog />
        </div>
      </div>
    </div>
    </PageTransition>
  )
}
