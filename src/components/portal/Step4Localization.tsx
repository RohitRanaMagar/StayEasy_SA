import { Clock, MapPin, Lock } from 'lucide-react'

export interface LocalizationData {
  currency: string
  timezone: string
  language: string
  checkInTime: string
  checkOutTime: string
  earlyCheckInGrace: number
  lateCheckOutGrace: number
  allowAlwaysCheckIn: boolean
}

interface Step4Props {
  data: LocalizationData
  onChange: (data: Partial<LocalizationData>) => void
}

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar ($)' },
  { value: 'EUR', label: 'EUR - Euro (€)' },
  { value: 'GBP', label: 'GBP - British Pound (£)' },
  { value: 'JPY', label: 'JPY - Japanese Yen (¥)' },
  { value: 'CAD', label: 'CAD - Canadian Dollar (C$)' },
  { value: 'AUD', label: 'AUD - Australian Dollar (A$)' },
  { value: 'CHF', label: 'CHF - Swiss Franc (Fr)' },
  { value: 'INR', label: 'INR - Indian Rupee (₹)' },
  { value: 'NPR', label: 'NPR - Nepalese Rupee (Rs)' },
]

const TIMEZONES = [
  { value: 'UTC', label: '(UTC+00:00) UTC' },
  { value: 'PST', label: '(UTC-08:00) Pacific Time (US & Canada)' },
  { value: 'MST', label: '(UTC-07:00) Mountain Time (US & Canada)' },
  { value: 'CST', label: '(UTC-06:00) Central Time (US & Canada)' },
  { value: 'EST', label: '(UTC-05:00) Eastern Time (US & Canada)' },
  { value: 'CET', label: '(UTC+01:00) Central European Time' },
  { value: 'IST', label: '(UTC+05:30) India Standard Time' },
  { value: 'SGT', label: '(UTC+08:00) Singapore / Kuala Lumpur' },
  { value: 'JST', label: '(UTC+09:00) Japan Standard Time' },
]

const LANGUAGES = ['English (US)', 'Español', 'Français']

const GRACE_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' },
  { value: 3, label: '3 hours' },
]

export default function Step4Localization({ data, onChange }: Step4Props) {
  return (
    <div className="step-content-wrapper">
      <div className="step-card">
        <div className="step-card-header">
          <h3 className="step-card-title">Regional Preferences</h3>
          <p className="step-card-subtitle">
            These settings affect how your property is presented in search results and how invoices are generated.
          </p>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Primary Currency</label>
            <select
              value={data.currency}
              onChange={e => onChange({ currency: e.target.value })}
              className="form-select"
            >
              {CURRENCIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Primary Timezone</label>
            <select
              value={data.timezone}
              onChange={e => onChange({ timezone: e.target.value })}
              className="form-select"
            >
              {TIMEZONES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Primary Communication Language</label>
          <div className="language-pills">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                type="button"
                className={`language-pill ${data.language === lang ? 'active' : ''}`}
                onClick={() => onChange({ language: lang })}
              >
                {data.language === lang && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="info-banner">
        <MapPin size={16} className="info-banner-icon" />
        <span>
          <strong>Verification:</strong> Seattle, Washington. Localization settings are optimized for North American regulatory
          compliance standards and compliance standards.
        </span>
      </div>

      <div className="step-card">
        <div className="step-card-header">
          <h3 className="step-card-title">Stay Policies</h3>
          <p className="step-card-subtitle">Define check-in/out windows and automated access preferences.</p>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">
              <Clock size={14} className="icon-primary" style={{ marginRight: 4 }} />
              Check-in Time
            </label>
            <input
              type="text"
              value={data.checkInTime}
              onChange={e => onChange({ checkInTime: e.target.value })}
              placeholder="3:00 PM"
              className="form-input"
              disabled={data.allowAlwaysCheckIn}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              <Clock size={14} className="icon-primary" style={{ marginRight: 4 }} />
              Check-out Time
            </label>
            <input
              type="text"
              value={data.checkOutTime}
              onChange={e => onChange({ checkOutTime: e.target.value })}
              placeholder="11:00 AM"
              className="form-input"
              disabled={data.allowAlwaysCheckIn}
            />
          </div>
        </div>

        {data.allowAlwaysCheckIn && (
          <p className="form-hint">
            Check-in/out times are not required while always check-in is enabled.
          </p>
        )}

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Early Check-in Grace Period</label>
            <select
              value={data.earlyCheckInGrace}
              onChange={e => onChange({ earlyCheckInGrace: Number(e.target.value) })}
              className="form-select"
            >
              {GRACE_OPTIONS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Late Check-out Grace Period</label>
            <select
              value={data.lateCheckOutGrace}
              onChange={e => onChange({ lateCheckOutGrace: Number(e.target.value) })}
              className="form-select"
            >
              {GRACE_OPTIONS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="self-checkin-row">
          <div className="self-checkin-info">
            <Lock size={18} className="icon-primary" />
            <div>
              <div className="self-checkin-label">Allow Always Check-in</div>
              <p className="form-hint" style={{ margin: 0 }}>Guests can check in at any time using digital access</p>
            </div>
          </div>
          <button
            type="button"
            className={`toggle-switch ${data.allowAlwaysCheckIn ? 'active' : ''}`}
            onClick={() => onChange({ allowAlwaysCheckIn: !data.allowAlwaysCheckIn })}
          >
            <div className="toggle-knob" />
          </button>
        </div>
      </div>
    </div>
  )
}
