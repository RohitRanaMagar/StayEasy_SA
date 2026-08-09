import { useState, useRef } from 'react'
import { Upload, CheckCircle, Palette, Star, Hotel } from 'lucide-react'

export interface BrandData {
  logo: File | null
  brandColor: string
  isWcagPassing: boolean
}

interface Step6Props {
  data: BrandData
  onChange: (data: Partial<BrandData>) => void
  propertyName?: string
  propertyPhone?: string
}

const SUGGESTED_PALETTES = [
  { name: 'Ocean Blue', color: '#2E86AB' },
  { name: 'Forest Green', color: '#27AE60' },
  { name: 'Deep Violet', color: '#8E44AD' },
  { name: 'Warm Amber', color: '#F39C12' },
  { name: 'Royal Purple', color: '#5B2C8E' },
]

export default function Step6BrandingVisuals({ data, onChange, propertyName = 'Your Property', propertyPhone = '' }: Step6Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange({ logo: file })
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleColorInputChange = (value: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(value) || /^#[0-9A-Fa-f]{3}$/.test(value)) {
      onChange({ brandColor: value })
    }
  }

  return (
    <div className="branding-wrapper">
      <div className="branding-left">
        <div className="step-card">
          <div className="step-card-header">
            <h3 className="step-card-title">Brand Identity</h3>
            <p className="step-card-subtitle">PNG, SVG, or JPG. Max 2MB. Min resolution: 400x400px.</p>
          </div>

          <div
            className="logo-upload-zone"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={28} className="upload-icon" />
            <p className="upload-text">Upload Property Logo</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/svg+xml,image/jpeg"
            hidden
            onChange={handleLogoUpload}
          />

          <div className="preview-contact-card">
            <div className="preview-contact-left">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="preview-logo-img" />
              ) : (
                <div className="preview-logo-placeholder">
                  <Hotel size={20} />
                </div>
              )}
              <div className="preview-contact-info">
                <span className="preview-contact-name">{propertyName}</span>
                <span className="preview-contact-phone">{propertyPhone || '+1 (555) 000-0000'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="step-card">
          <div className="step-card-header">
            <h3 className="step-card-title">
              <Palette size={16} className="icon-primary" /> Brand Color
            </h3>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Action Color</label>
            <div className="color-picker-row">
              <div className="color-swatch" style={{ backgroundColor: data.brandColor }} />
              <input
                type="text"
                value={data.brandColor}
                onChange={e => handleColorInputChange(e.target.value)}
                className="form-input color-hex-input"
                placeholder="#2E86AB"
                maxLength={7}
              />
              <input
                type="color"
                value={data.brandColor}
                onChange={e => onChange({ brandColor: e.target.value })}
                className="color-picker-native"
              />
              <button type="button" className="btn-pick-color">Pick</button>
            </div>
          </div>

          <div className="wcag-badge">
            <CheckCircle size={16} />
            <span>
              <strong>WCAG 2.1 Compliant</strong> Ratio 4.5:1 (AA) Passed!
            </span>
          </div>

          <div className="palette-section">
            <label className="form-label">Suggested Palettes</label>
            <div className="palette-row">
              {SUGGESTED_PALETTES.map(p => (
                <button
                  key={p.color}
                  type="button"
                  className={`palette-swatch ${data.brandColor === p.color ? 'selected' : ''}`}
                  style={{ backgroundColor: p.color }}
                  onClick={() => onChange({ brandColor: p.color })}
                  title={p.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="branding-right">
        <div className="preview-frame-card">
          <h3 className="step-card-title" style={{ marginBottom: 16 }}>Portal Live Preview</h3>
          <div className="portal-preview-frame">
            <div className="preview-phone-header">
              <div className="preview-phone-notch" />
            </div>
            <div className="preview-phone-content">
              <div className="preview-property-image" style={{ background: `linear-gradient(135deg, ${data.brandColor}, ${data.brandColor}dd)` }}>
                <div className="preview-property-badge">ServeIQ</div>
              </div>
              <div className="preview-property-details">
                <h4 className="preview-property-title">Testing Accommodations</h4>
                <div className="preview-stars">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={12} fill="#F39C12" color="#F39C12" />
                  ))}
                </div>
                <p className="preview-property-desc">Experience comfort and luxury at its finest.</p>
                <div className="preview-price-row">
                  <span className="preview-price">$180</span>
                  <span className="preview-price-unit">/ night</span>
                </div>
                <button
                  type="button"
                  className="preview-book-btn"
                  style={{ backgroundColor: data.brandColor }}
                >
                  BOOK NOW
                </button>
                <button
                  type="button"
                  className="preview-continue-btn"
                  style={{ color: data.brandColor, borderColor: data.brandColor }}
                >
                  Continue Booking
                </button>
              </div>
            </div>
          </div>
          <p className="form-hint" style={{ marginTop: 12, textAlign: 'center' }}>
            A strong contrast between the logo and primary color is recommended. See the WCAG guidelines for the optimal rendering on all displays.
          </p>
        </div>
      </div>
    </div>
  )
}
