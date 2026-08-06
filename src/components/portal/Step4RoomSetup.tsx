import { useState, type ComponentType, type SVGProps } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, Upload, Search, Star, ConciergeBell, AirVent, Coffee, Dumbbell, Wifi, Car, Wind, Flame, Vault, Shirt, Refrigerator, Sparkles, Bath, Tv, Waves, Copy } from 'lucide-react'
import type { AmenityOption } from '../../types/pms'

const ROOM_TYPES = ['Standard Room', 'Deluxe Room', 'Suite', 'Executive Suite', 'Family Room']
const BED_TYPES = ['Single Bed', 'Double Bed', 'Queen Bed', 'King Bed', 'Twin Beds']

const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>> = {
  ConciergeBell, AirVent, Coffee, Dumbbell, Wifi, Car, Wind, Flame, Vault, Shirt, Refrigerator, Sparkles, Bath, Tv, Waves,
}

const CANCELLATION_POLICIES = [
  { id: 'flexible', label: 'Flexible', desc: 'Full refund 24 hrs before check-in' },
  { id: 'moderate', label: 'Moderate', desc: 'Full refund 5 days before check-in' },
  { id: 'strict', label: 'Strict', desc: '50% refund up to 1 week before' },
  { id: 'non-refundable', label: 'Non-Refundable', desc: 'No refund at any time' },
  { id: 'custom', label: 'Custom', desc: 'Define your own terms' },
]

export interface SavedCustomPolicy {
  id: string
  title: string
  description: string
}

export interface Room {
  id: string
  floor: string
  name: string
  type: string
  bedType: string
  maxAdults: number
  maxChildren: number
  petsAllowed: boolean
  minRate: string
  cancellationPolicy: string
  customPolicyTitle: string
  customPolicyDescription: string
  savedCustomPolicies: SavedCustomPolicy[]
  amenities: string[]
  expanded: boolean
  photos: File[]
  coverPhotoIndex: number
}

const createRoom = (id: number): Room => ({
  id: `room-${id}`, floor: '1', name: `Room ${id}`, type: '', bedType: '',
  maxAdults: 2, maxChildren: 0, petsAllowed: false, minRate: '0.00',
  cancellationPolicy: 'moderate', customPolicyTitle: '', customPolicyDescription: '',
  savedCustomPolicies: [],
  amenities: ['High-speed WiFi', 'Air Conditioning'], expanded: true, photos: [],
  coverPhotoIndex: 0,
})

interface Step4Props {
  rooms: Room[]
  onRoomsChange: (rooms: Room[]) => void
  availableAmenities: AmenityOption[]
  floors: number
}

export default function Step4RoomSetup({ rooms, onRoomsChange, availableAmenities, floors }: Step4Props) {
  const [amenitySearch, setAmenitySearch] = useState('')
  const [customAmenities, setCustomAmenities] = useState<string[]>([])
  const [customAmenityInput, setCustomAmenityInput] = useState('')

  const updateRoom = (id: string, data: Partial<Room>) => {
    onRoomsChange(rooms.map(r => r.id === id ? { ...r, ...data } : r))
  }

  const addRoom = () => {
    onRoomsChange([...rooms, createRoom(rooms.length + 1)])
  }

  const copyLastRoom = () => {
    const last = rooms[rooms.length - 1]
    if (!last) return
    const copy: Room = {
      ...last,
      id: `room-${Date.now()}`,
      name: `${last.name} (Copy)`,
      photos: [...last.photos],
      coverPhotoIndex: last.coverPhotoIndex,
      expanded: true,
      savedCustomPolicies: [...last.savedCustomPolicies],
      amenities: [...last.amenities],
    }
    onRoomsChange([...rooms, copy])
  }

  const removeRoom = (id: string) => {
    onRoomsChange(rooms.filter(r => r.id !== id))
  }

  const handleRoomPhotoUpload = (roomId: string, files: FileList | null) => {
    if (!files) return
    const room = rooms.find(r => r.id === roomId)
    if (!room) return
    const newPhotos = Array.from(files).filter(f => f.type.startsWith('image/'))
    updateRoom(roomId, { photos: [...room.photos, ...newPhotos].slice(0, 5) })
  }

  const removeRoomPhoto = (roomId: string, photoIdx: number) => {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return
    const newPhotos = room.photos.filter((_, i) => i !== photoIdx)
    let newCoverIndex = room.coverPhotoIndex
    if (photoIdx === room.coverPhotoIndex) {
      newCoverIndex = 0
    } else if (photoIdx < room.coverPhotoIndex) {
      newCoverIndex = room.coverPhotoIndex - 1
    }
    updateRoom(roomId, { photos: newPhotos, coverPhotoIndex: Math.min(newCoverIndex, Math.max(0, newPhotos.length - 1)) })
  }

  const setRoomCoverPhoto = (roomId: string, photoIdx: number) => {
    updateRoom(roomId, { coverPhotoIndex: photoIdx })
  }

  const saveCustomPolicy = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    if (!room || !room.customPolicyTitle.trim() || !room.customPolicyDescription.trim()) return
    const newPolicy: SavedCustomPolicy = {
      id: `custom-${Date.now()}`,
      title: room.customPolicyTitle.trim(),
      description: room.customPolicyDescription.trim(),
    }
    updateRoom(roomId, {
      savedCustomPolicies: [...room.savedCustomPolicies, newPolicy],
      cancellationPolicy: newPolicy.id,
      customPolicyTitle: '',
      customPolicyDescription: '',
    })
  }

  const removeSavedCustomPolicy = (roomId: string, policyId: string) => {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return
    const updated = room.savedCustomPolicies.filter(p => p.id !== policyId)
    updateRoom(roomId, {
      savedCustomPolicies: updated,
      cancellationPolicy: room.cancellationPolicy === policyId ? 'moderate' : room.cancellationPolicy,
    })
  }

  const filteredAmenities = (Array.isArray(availableAmenities) ? availableAmenities : []).filter(a => {
    const label = a.label || a.name || ''
    return label.toLowerCase().includes(amenitySearch.toLowerCase())
  })

  const addCustomAmenity = () => {
    const name = customAmenityInput.trim()
    if (name && !customAmenities.includes(name)) {
      setCustomAmenities([...customAmenities, name])
      setCustomAmenityInput('')
    }
  }

  const removeCustomAmenity = (name: string) => {
    setCustomAmenities(customAmenities.filter(a => a !== name))
  }

  const toggleRoomAmenity = (roomId: string, amenity: string) => {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return
    const updated = room.amenities.includes(amenity)
      ? room.amenities.filter(a => a !== amenity)
      : [...room.amenities, amenity]
    updateRoom(roomId, { amenities: updated })
  }

  return (
    <div className="step-room-wrapper">
      <div className="flex-1">
        <div className="step-card step-card-compact">
          <div className="step-card-header">
            <h3 className="step-card-title with-icon">
              <span className="step-icon">&#128203;</span> Room Setup
            </h3>
            <p className="step-card-subtitle">Add each room type guests will be able to book at your property</p>
          </div>
        </div>

        {rooms.map((room, idx) => (
          <div key={room.id} className="room-card">
            <div
              className={`room-header ${room.expanded ? 'expanded' : ''}`}
              onClick={() => updateRoom(room.id, { expanded: !room.expanded })}
            >
              <div className="room-header-left">
                <div className="room-number">{idx + 1}</div>
                <span className="room-name">{room.name || `Room ${idx + 1}`}</span>
              </div>
              <div className="room-header-right">
                {rooms.length > 1 && (
                  <button
                    className="room-delete-btn"
                    onClick={e => { e.stopPropagation(); removeRoom(room.id) }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                {room.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {room.expanded && (
              <div className="room-content">
                <div className="room-fields">
                  <div className="room-section-label">Room Identification</div>
                <div className="form-row-4">
                  <div className="form-group">
                    <label className="form-label">Floor *</label>
                    <select
                      value={room.floor}
                      onChange={e => updateRoom(room.id, { floor: e.target.value })}
                      className="form-select"
                    >
                      {Array.from({ length: floors + 1 }, (_, i) => i).map(f => (
                        <option key={f} value={f}>{f === 0 ? 'Ground Floor' : `Floor ${f}`}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room Name *</label>
                    <input
                      type="text"
                      value={room.name}
                      onChange={e => updateRoom(room.id, { name: e.target.value })}
                      placeholder="e.g. Ocean Suite A"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room Type *</label>
                    <select
                      value={room.type}
                      onChange={e => updateRoom(room.id, { type: e.target.value })}
                      className="form-select"
                    >
                      <option value="">Select type</option>
                      {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bed Type *</label>
                    <select
                      value={room.bedType}
                      onChange={e => updateRoom(room.id, { bedType: e.target.value })}
                      className="form-select"
                    >
                      <option value="">Select bed type</option>
                      {BED_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="room-section-label">Room Photos (MAX 5)</div>
                <div className="room-photos-section">
                  <div className="room-photos-grid">
                    {room.photos.slice(0, 5).map((p, i) => (
                      <div key={i} className={`room-photo-item ${i === room.coverPhotoIndex ? 'cover' : ''}`}>
                        <img src={URL.createObjectURL(p)} alt="" className="room-photo-img" />
                        <button
                          className={`room-photo-cover-btn ${i === room.coverPhotoIndex ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); setRoomCoverPhoto(room.id, i) }}
                          title={i === room.coverPhotoIndex ? 'Cover photo' : 'Set as cover'}
                        >
                          <Star size={12} fill={i === room.coverPhotoIndex ? '#F39C12' : 'none'} />
                        </button>
                        <button
                          className="room-photo-remove"
                          onClick={() => removeRoomPhoto(room.id, i)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {room.photos.length < 5 && (
                      <label className="room-photo-add">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={e => handleRoomPhotoUpload(room.id, e.target.files)}
                        />
                        <Upload size={20} className="upload-icon" />
                        <span>Add</span>
                      </label>
                    )}
                  </div>
                  <p className="room-photos-hint">Click the star to set cover photo. Hover a card to remove.</p>
                </div>

                <div className="room-section-label">Maximum Occupancy</div>
                <div className="occupancy-row">
                  <div className="occupancy-control">
                    <span className="occupancy-label">Adults <small>Age 18+</small></span>
                    <div className="counter-input small">
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => updateRoom(room.id, { maxAdults: Math.max(1, room.maxAdults - 1) })}
                      >-</button>
                      <span className="counter-value">{room.maxAdults}</span>
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => updateRoom(room.id, { maxAdults: room.maxAdults + 1 })}
                      >+</button>
                    </div>
                  </div>
                  <div className="occupancy-control">
                    <span className="occupancy-label">Children <small>Age 2-17</small></span>
                    <div className="counter-input small">
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => updateRoom(room.id, { maxChildren: Math.max(0, room.maxChildren - 1) })}
                      >-</button>
                      <span className="counter-value">{room.maxChildren}</span>
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => updateRoom(room.id, { maxChildren: room.maxChildren + 1 })}
                      >+</button>
                    </div>
                  </div>
                  <div className="occupancy-control">
                    <span className="occupancy-label">Pets Allowed</span>
                    <button
                      type="button"
                      className={`toggle-switch ${room.petsAllowed ? 'active' : ''}`}
                      onClick={() => updateRoom(room.id, { petsAllowed: !room.petsAllowed })}
                    >
                      <div className="toggle-knob" />
                    </button>
                  </div>
                </div>

                <div className="room-section-label">Rates & Policies</div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Minimum Rate per Night (USD) *</label>
                  <input
                    type="number"
                    value={room.minRate}
                    onChange={e => updateRoom(room.id, { minRate: e.target.value })}
                    placeholder="0.00"
                    className="form-input"
                    style={{ width: 200 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cancellation Policy *</label>
                  <div className="cancellation-grid">
                    {CANCELLATION_POLICIES.filter(p => p.id !== 'custom').map(p => (
                      <label
                        key={p.id}
                        className={`cancellation-option ${room.cancellationPolicy === p.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`cancel-${room.id}`}
                          checked={room.cancellationPolicy === p.id}
                          onChange={() => updateRoom(room.id, { cancellationPolicy: p.id })}
                          className="radio-input"
                        />
                        <div>
                          <div className="cancellation-label">{p.label}</div>
                          <div className="cancellation-desc">{p.desc}</div>
                        </div>
                      </label>
                    ))}
                    {room.savedCustomPolicies?.map(sp => (
                      <label
                        key={sp.id}
                        className={`cancellation-option cancellation-option-custom ${room.cancellationPolicy === sp.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`cancel-${room.id}`}
                          checked={room.cancellationPolicy === sp.id}
                          onChange={() => updateRoom(room.id, { cancellationPolicy: sp.id })}
                          className="radio-input"
                        />
                        <div className="custom-policy-card-content">
                          <div className="custom-policy-card-header">
                            <div className="cancellation-label">{sp.title}</div>
                            <button
                              type="button"
                              className="custom-policy-delete-btn"
                              onClick={e => { e.preventDefault(); e.stopPropagation(); removeSavedCustomPolicy(room.id, sp.id) }}
                            >
                              ×
                            </button>
                          </div>
                          <div className="cancellation-desc">{sp.description}</div>
                        </div>
                      </label>
                    ))}
                    <label
                      className={`cancellation-option cancellation-option-add ${room.cancellationPolicy === 'custom' ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`cancel-${room.id}`}
                        checked={room.cancellationPolicy === 'custom'}
                        onChange={() => updateRoom(room.id, { cancellationPolicy: 'custom' })}
                        className="radio-input"
                      />
                      <div>
                        <div className="cancellation-label">+ Custom</div>
                        <div className="cancellation-desc">Define your own terms</div>
                      </div>
                    </label>
                  </div>
                  {room.cancellationPolicy === 'custom' && (
                    <div className="custom-policy-fields">
                      <div className="form-group">
                        <label className="form-label">Policy Title *</label>
                        <input
                          type="text"
                          value={room.customPolicyTitle}
                          onChange={e => updateRoom(room.id, { customPolicyTitle: e.target.value })}
                          placeholder="e.g. Flexible Full Refund"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Description *</label>
                        <textarea
                          value={room.customPolicyDescription}
                          onChange={e => updateRoom(room.id, { customPolicyDescription: e.target.value })}
                          placeholder="Describe your cancellation terms, e.g. Full refund if cancelled 48 hours before check-in, 50% refund within 24 hours..."
                          className="form-input custom-policy-textarea"
                          rows={3}
                        />
                      </div>
                      <button
                        type="button"
                        className="custom-policy-save-btn"
                        disabled={!room.customPolicyTitle.trim() || !room.customPolicyDescription.trim()}
                        onClick={() => saveCustomPolicy(room.id)}
                      >
                        Save Policy
                       </button>
                     </div>
                   )}
                 </div>
                </div>

                <div className="room-amenities-panel">
                  <h3 className="step-card-title">Amenities</h3>
                  <div className="search-input-wrapper">
                    <Search size={14} className="search-icon" />
                    <input
                      type="text"
                      value={amenitySearch}
                      onChange={e => setAmenitySearch(e.target.value)}
                      placeholder="Search amenities..."
                      className="search-input"
                    />
                  </div>
                  <div className="amenities-list">
                    {filteredAmenities.map(a => {
                      const label = a.label || a.name || ''
                      return (
                        <label key={a.id} className="amenity-item">
                          <input
                            type="checkbox"
                            checked={room.amenities.includes(label)}
                            onChange={() => toggleRoomAmenity(room.id, label)}
                            className="amenity-checkbox"
                          />
                          {a.icon && iconMap[a.icon] && <span className="amenity-icon">{(() => { const Icon = iconMap[a.icon]; return <Icon size={16} /> })()}</span>}
                          <span className="amenity-label">{label}</span>
                        </label>
                      )
                    })}
                    {customAmenities.filter(c => c.toLowerCase().includes(amenitySearch.toLowerCase())).map(name => (
                      <label key={name} className="amenity-item">
                        <input
                          type="checkbox"
                          checked={room.amenities.includes(name)}
                          onChange={() => toggleRoomAmenity(room.id, name)}
                          className="amenity-checkbox"
                        />
                        <span className="amenity-icon">✏️</span>
                        <span className="amenity-label">{name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeCustomAmenity(name) }}
                          className="custom-amenity-remove-btn"
                          title="Remove"
                        >
                          <span style={{ fontSize: 12, marginLeft: 4 }}>✕</span>
                        </button>
                      </label>
                    ))}
                  </div>
                  <div className="custom-amenity-section">
                    <p className="custom-amenity-title">Add a custom amenity</p>
                    <div className="custom-amenity-input-row">
                      <input
                        type="text"
                        value={customAmenityInput}
                        onChange={e => setCustomAmenityInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustomAmenity()}
                        placeholder="e.g. Private Helipad, Wine Cellar, Hammam..."
                        className="form-input flex-1"
                      />
                      <button onClick={addCustomAmenity} className="btn-add-amenity">+ Add</button>
                    </div>
                    <p className="custom-amenity-hint">Press Enter or click Add to include an amenity not in the list above.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="room-actions-row">
          <button onClick={copyLastRoom} className="copy-room-btn">
            <Copy size={16} /> Copy Last Room
          </button>
          <button onClick={addRoom} className="add-room-btn">
            <Plus size={16} /> Add Blank Room
          </button>
        </div>
      </div>
    </div>
  )
}
