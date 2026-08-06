import { Phone, Mail } from 'lucide-react'

interface Step1Props {
  data: {
    name: string
    totalRooms: number
    floors: number
    yearBuilt: number
    description: string
    phone: string
    email: string
  }
  onChange: (data: Partial<Step1Props['data']>) => void
}

export default function Step1PropertyDetails({ data, onChange }: Step1Props) {
  return (
    <div className="step-content-wrapper">
      <div className="step-card">
        <div className="step-card-header">
          <h3 className="step-card-title">Step 1: General Information</h3>
          <p className="step-card-subtitle">Provide the foundational details of your real estate asset.</p>
        </div>

        <div className="form-group">
          <label className="form-label">Property Name</label>
          <input
            type="text"
            value={data.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder="e.g. Skyline Towers, Sunset Villas"
            className="form-input"
          />
          <p className="form-hint">This will be the internal display name for your dashboard.</p>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Total Rooms</label>
            <input
              type="number"
              value={data.totalRooms || ''}
              onChange={e => onChange({ totalRooms: parseInt(e.target.value) || 0 })}
              placeholder="eg.100"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">No of Floor</label>
            <div className="counter-input">
              <button
                type="button"
                className="counter-btn"
                onClick={() => onChange({ floors: Math.max(0, data.floors - 1) })}
              >
                -
              </button>
              <span className="counter-value">{data.floors}</span>
              <button
                type="button"
                className="counter-btn"
                onClick={() => onChange({ floors: Math.min(100, data.floors + 1) })}
              >
                +
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Year Built</label>
            <input
              type="number"
              value={data.yearBuilt || ''}
              onChange={e => onChange({ yearBuilt: parseInt(e.target.value) || 0 })}
              placeholder="eg.2018"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Property Description</label>
          <p className="form-hint-inline">Highlight the best features, neighborhood vibes, and recent renovations.</p>
          <textarea
            value={data.description}
            onChange={e => onChange({ description: e.target.value.slice(0, 2500) })}
            placeholder="Enter a detailed description of the property..."
            rows={5}
            className="form-textarea"
          />
          <p className="char-count">{data.description.length} / 2500 characters</p>
        </div>
      </div>

      <div className="step-card">
        <h3 className="step-card-title with-icon">
          <Phone size={16} className="icon-primary" /> Contact Information
        </h3>
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-with-icon">
              <Phone size={14} className="input-icon" />
              <input
                type="tel"
                value={data.phone}
                onChange={e => onChange({ phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="form-input no-border"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Official Email</label>
            <div className="input-with-icon">
              <Mail size={14} className="input-icon" />
              <input
                type="email"
                value={data.email}
                onChange={e => onChange({ email: e.target.value })}
                placeholder="contact@property.com"
                className="form-input no-border"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
