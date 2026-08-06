import { useState } from 'react'
import { Upload, Search, Star, X } from 'lucide-react'
import type { AmenityOption } from '../../types/pms'

interface CustomAmenity {
  name: string
  icon: string
}

interface Step3Props {
  photos: File[]
  onPhotosChange: (photos: File[]) => void
  coverIndex: number
  onCoverIndexChange: (index: number) => void
  availableAmenities: AmenityOption[]
  systemAmenityIds: string[]
  onSystemAmenityIdsChange: (ids: string[]) => void
  customAmenities: CustomAmenity[]
  onCustomAmenitiesChange: (items: CustomAmenity[]) => void
  starRating: number
  onStarRatingChange: (rating: number) => void
}

export default function Step3PhotosAmenities({
  photos, onPhotosChange,
  coverIndex, onCoverIndexChange,
  availableAmenities,
  systemAmenityIds, onSystemAmenityIdsChange,
  customAmenities, onCustomAmenitiesChange,
  starRating, onStarRatingChange,
}: Step3Props) {
  const [amenitySearch, setAmenitySearch] = useState('')
  const [customAmenity, setCustomAmenity] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const toggleSystemAmenity = (id: string) => {
    onSystemAmenityIdsChange(
      systemAmenityIds.includes(id)
        ? systemAmenityIds.filter(x => x !== id)
        : [...systemAmenityIds, id]
    )
  }

  const addCustomAmenity = () => {
    const name = customAmenity.trim()
    if (name && !customAmenities.some(c => c.name === name)) {
      onCustomAmenitiesChange([...customAmenities, { name, icon: '✏️' }])
      setCustomAmenity('')
    }
  }

  const removeCustomAmenity = (name: string) => {
    onCustomAmenitiesChange(customAmenities.filter(c => c.name !== name))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newPhotos = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
      onPhotosChange([...photos, ...newPhotos].slice(0, 5))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
      onPhotosChange([...photos, ...newPhotos].slice(0, 5))
    }
  }

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index))
    if (index === coverIndex) {
      onCoverIndexChange(0)
    } else if (index < coverIndex) {
      onCoverIndexChange(coverIndex - 1)
    }
  }

  const searchLower = amenitySearch.toLowerCase()

  const filteredSystemAmenities = (Array.isArray(availableAmenities) ? availableAmenities : []).filter(a => {
    const label = a.label || a.name || ''
    return label.toLowerCase().includes(searchLower)
  })

  const filteredCustomAmenities = customAmenities.filter(c =>
    c.name.toLowerCase().includes(searchLower)
  )

  return (
    <div className="step-photos-wrapper">
      <div className="flex-1">
        <div className="step-card">
          <div className="step-card-header">
            <h3 className="step-card-title">Property Photos</h3>
            <span className="photo-count">{photos.length} / 5 Uploaded</span>
          </div>

          <div
            className={`photo-upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('photo-input')?.click()}
          >
            <Upload size={32} className="upload-icon" />
            <p className="upload-text">Drag & drop your photos here</p>
            <p className="upload-link">or browse files from your computer</p>
            <p className="upload-hint">
              <span className="hint-dot" /> High resolution
              <span className="hint-dot" /> JPG, PNG, WEBP
              <span className="hint-dot" /> Up to 20MB
            </p>
          </div>
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileSelect}
          />

          {photos.length > 0 && (
            <>
              <p className="form-hint" style={{ margin: '12px 0 8px' }}>
                Click the star on a photo to set it as your cover image.
              </p>
              <div className="photo-preview-grid">
              {photos.map((p, i) => (
                <div key={i} className={`photo-preview-item ${i === coverIndex ? 'cover' : ''}`}>
                  <img src={URL.createObjectURL(p)} alt="" className="photo-preview-img" />
                  <button
                    className={`photo-cover-btn ${i === coverIndex ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onCoverIndexChange(i) }}
                    title={i === coverIndex ? 'Cover photo' : 'Set as cover'}
                  >
                    <Star size={12} fill={i === coverIndex ? '#F39C12' : 'none'} />
                  </button>
                  <button
                    className="photo-remove-btn"
                    onClick={(e) => { e.stopPropagation(); removePhoto(i) }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            </>
          )}
        </div>

        <div className="step-card">
          <div className="star-rating-section">
            <div className="star-rating-header">
              <Star size={18} className="icon-primary" />
              <h3 className="step-card-title" style={{ margin: 0 }}>Official Star Rating</h3>
            </div>
            <p className="form-hint" style={{ margin: '0 0 12px' }}>
              Select the certified commercial rating of this property.
            </p>
            <div className="star-rating-buttons">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${starRating >= star ? 'active' : ''}`}
                  onClick={() => onStarRatingChange(star === starRating ? 0 : star)}
                >
                  <Star size={24} fill={starRating >= star ? '#F39C12' : 'none'} />
                </button>
              ))}
              <span className="star-rating-label">
                {starRating > 0 ? `${starRating} Star${starRating > 1 ? 's' : ''}` : 'Select a rating'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="amenities-sidebar">
        <div className="step-card">
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
            {filteredSystemAmenities.map(a => {
              const label = a.label || a.name || ''
              const amenityId = String(a.id)
              return (
                <label key={amenityId} className="amenity-item">
                  <input
                    type="checkbox"
                    checked={systemAmenityIds.includes(amenityId)}
                    onChange={() => toggleSystemAmenity(amenityId)}
                    className="amenity-checkbox"
                  />
                  {a.icon && <span className="amenity-icon">{a.icon}</span>}
                  <span className="amenity-label">{label}</span>
                </label>
              )
            })}

            {filteredCustomAmenities.length > 0 && (
              <>
                {filteredCustomAmenities.map(c => (
                  <label key={c.name} className="amenity-item">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => removeCustomAmenity(c.name)}
                      className="amenity-checkbox"
                    />
                    <span className="amenity-icon">{c.icon}</span>
                    <span className="amenity-label">{c.name}</span>
                    <button
                      type="button"
                      className="custom-amenity-remove-btn"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeCustomAmenity(c.name)
                      }}
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </label>
                ))}
              </>
            )}
          </div>

          <div className="custom-amenity-section">
            <p className="custom-amenity-title">Add a custom amenity</p>
            <div className="custom-amenity-input-row">
              <input
                type="text"
                value={customAmenity}
                onChange={e => setCustomAmenity(e.target.value)}
                placeholder="e.g. Private Helipad, Wine Cellar, Hammam..."
                onKeyDown={e => e.key === 'Enter' && addCustomAmenity()}
                className="form-input flex-1"
              />
              <button onClick={addCustomAmenity} className="btn-add-amenity">
                + Add
              </button>
            </div>
            <p className="custom-amenity-hint">Press Enter or click Add to include an amenity not in the list above.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
