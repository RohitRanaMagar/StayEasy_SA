import { useState } from 'react'
import { Tag, Calendar, X } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface Offer {
  id: string
  label: string
  badge: string
  badgeColor: string
  badgeText: string
  desc: string
  discountPercentage: number
  enabled: boolean
  startDate?: Date | null
  endDate?: Date | null
}

interface Step5Props {
  offers: Offer[]
  onOffersChange: (offers: Offer[]) => void
}

export default function Step5PricingOffers({ offers, onOffersChange }: Step5Props) {
  const [activeCalendar, setActiveCalendar] = useState<string | null>(null)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customOffer, setCustomOffer] = useState({
    title: '',
    description: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  })

  const toggleOffer = (id: string) => {
    onOffersChange(offers.map(o => o.id === id ? { ...o, enabled: !o.enabled } : o))
  }

  const updateOfferDates = (id: string, startDate: Date | null | undefined, endDate: Date | null | undefined) => {
    onOffersChange(offers.map(o => o.id === id ? { ...o, startDate: startDate ?? null, endDate: endDate ?? null } : o))
  }

  const saveOfferDates = () => {
    setActiveCalendar(null)
  }

  const addCustomOffer = () => {
    if (customOffer.title.trim()) {
      onOffersChange([...offers, {
        id: `custom-${Date.now()}`,
        label: customOffer.title.trim(),
        badge: 'Custom',
        badgeColor: '#f3e8ff',
        badgeText: '#9333ea',
        desc: customOffer.description || 'Custom offer',
        discountPercentage: 0,
        enabled: true,
        startDate: customOffer.startDate,
        endDate: customOffer.endDate,
      }])
      setCustomOffer({ title: '', description: '', startDate: null, endDate: null })
      setShowCustomModal(false)
    }
  }

  return (
    <div className="step-pricing-wrapper">
      <div className="step-pricing-header">
        <div className="step-pricing-badge">STEP 3 OF 3</div>
        <h1 className="step-pricing-title">Pricing & Offers</h1>
        <p className="step-pricing-subtitle">Set your nightly rate and any special offers for guests.</p>
      </div>

      <div className="step-card">
        <div className="step-card-header">
          <div className="step-card-title with-icon">
            <Tag size={18} className="icon-primary" /> Special Offers
          </div>
          <p className="step-card-subtitle" style={{ margin: 0 }}>
            Enable pre-set promotions or create fully custom offers for festivals and events.
          </p>
        </div>

        <div className="offers-list">
          {offers.map(offer => (
            <div key={offer.id} className={`offer-item ${offer.enabled ? 'enabled' : ''}`}>
              <div className="offer-content">
                <button
                  className={`offer-toggle ${offer.enabled ? 'active' : ''}`}
                  onClick={() => toggleOffer(offer.id)}
                >
                  <div className="toggle-knob" />
                </button>
                <div className="offer-info">
                  <div className="offer-title-row">
                    <span className="offer-label">{offer.label}</span>
                    <span
                      className="offer-badge"
                      style={{ background: offer.badgeColor, color: offer.badgeText }}
                    >
                      {offer.badge}
                    </span>
                  </div>
                  <p className="offer-desc">{offer.desc}</p>
                  {offer.startDate && offer.endDate && (
                    <p className="offer-dates">
                      {offer.startDate.toLocaleDateString()} - {offer.endDate.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <button
                className={`btn-set-dates ${activeCalendar === offer.id ? 'active' : ''}`}
                onClick={() => setActiveCalendar(activeCalendar === offer.id ? null : offer.id)}
              >
                {activeCalendar === offer.id ? (
                  'Close'
                ) : (
                  <><Calendar size={12} /> Set Dates</>
                )}
              </button>

              {activeCalendar === offer.id && (
                <div className="calendar-dropdown">
                  <div className="calendar-dropdown-header">
                    <span className="calendar-dropdown-title">
                      SET ACTIVE DATES FOR THIS OFFER
                    </span>
                  </div>
                  <div className="calendar-container">
                    <DatePicker
                      selected={offer.startDate}
                      onChange={(dates: [Date | null, Date | null] | null) => {
                        if (dates && dates[0] && dates[1]) {
                          updateOfferDates(offer.id, dates[0], dates[1])
                        }
                      }}
                      startDate={offer.startDate}
                      endDate={offer.endDate}
                      selectsRange
                      inline
                      calendarClassName="portal-calendar"
                    />
                  </div>
                  <div className="calendar-date-inputs">
                    <div className="form-group">
                      <label className="form-label small">FROM</label>
                      <DatePicker
                        selected={offer.startDate}
                        onChange={(date: Date | null) => updateOfferDates(offer.id, date, offer.endDate ?? null)}
                        selectsStart
                        startDate={offer.startDate}
                        endDate={offer.endDate}
                        placeholderText="Pick start date"
                        className="form-input date-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label small">TO</label>
                      <DatePicker
                        selected={offer.endDate}
                        onChange={(date: Date | null) => updateOfferDates(offer.id, offer.startDate ?? null, date)}
                        selectsEnd
                        startDate={offer.startDate}
                        endDate={offer.endDate}
                        minDate={offer.startDate ?? undefined}
                        placeholderText="Pick end date"
                        className="form-input date-input"
                      />
                    </div>
                  </div>
                  <div className="calendar-actions">
                    <button className="btn-cancel" onClick={() => setActiveCalendar(null)}>
                      Cancel
                    </button>
                    <button className="btn-save-dates" onClick={saveOfferDates}>
                      <Calendar size={14} /> Save Dates
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="btn-add-custom-offer" onClick={() => setShowCustomModal(true)}>
          + Add Custom Offer
        </button>
      </div>

      {showCustomModal && (
        <div className="modal-overlay" onClick={() => setShowCustomModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-icon">&#10133;</div>
                <h3 className="modal-title">Create Custom Offer</h3>
              </div>
              <button className="modal-close" onClick={() => setShowCustomModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Offer Title *</label>
                <input
                  type="text"
                  value={customOffer.title}
                  onChange={e => setCustomOffer(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Diwali Festival Special, New Year Deal, Summer Sale..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description <span className="optional">(optional)</span></label>
                <textarea
                  value={customOffer.description}
                  onChange={e => setCustomOffer(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Briefly describe the offer - discount details, eligibility, or what makes it special..."
                  rows={3}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Offer Dates * <span className="form-hint-inline">Click start and end date</span></label>
                <div className="calendar-dropdown" style={{ position: 'static', boxShadow: 'none', border: '1px solid var(--border)' }}>
                  <div className="calendar-container">
                    <DatePicker
                      selected={customOffer.startDate}
                      onChange={(dates: [Date | null, Date | null] | null) => {
                        if (dates && dates[0] && dates[1]) {
                          setCustomOffer(prev => ({ ...prev, startDate: dates[0], endDate: dates[1] }))
                        }
                      }}
                      startDate={customOffer.startDate}
                      endDate={customOffer.endDate}
                      selectsRange
                      inline
                      calendarClassName="portal-calendar"
                    />
                  </div>
                  <div className="calendar-date-inputs">
                    <div className="form-group">
                      <label className="form-label small">FROM</label>
                      <DatePicker
                        selected={customOffer.startDate}
                        onChange={(date: Date | null) => setCustomOffer(prev => ({ ...prev, startDate: date }))}
                        selectsStart
                        startDate={customOffer.startDate}
                        endDate={customOffer.endDate}
                        placeholderText="Pick start date"
                        className="form-input date-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label small">TO</label>
                      <DatePicker
                        selected={customOffer.endDate}
                        onChange={(date: Date | null) => setCustomOffer(prev => ({ ...prev, endDate: date }))}
                        selectsEnd
                        startDate={customOffer.startDate}
                        endDate={customOffer.endDate}
                        minDate={customOffer.startDate ?? undefined}
                        placeholderText="Pick end date"
                        className="form-input date-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCustomModal(false)}>
                Cancel
              </button>
              <button className="btn-save-dates" onClick={addCustomOffer}>
                <Calendar size={14} /> Save Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
