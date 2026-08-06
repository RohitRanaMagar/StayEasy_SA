import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Step2Props {
  data: {
    country: string
    state: string
    city: string
    zip: string
    street: string
    latitude: number | null
    longitude: number | null
  }
  onChange: (data: Partial<Step2Props['data']>) => void
}

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India',
  'Nepal', 'Germany', 'France', 'Italy', 'Spain', 'Japan', 'Brazil',
]

const COUNTRY_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  'United States': { center: [39.8283, -98.5795], zoom: 4 },
  'United Kingdom': { center: [54.5, -3.4], zoom: 5 },
  'Canada': { center: [56.13, -106.35], zoom: 3 },
  'Australia': { center: [-25.27, 133.78], zoom: 4 },
  'India': { center: [20.59, 78.96], zoom: 5 },
  'Nepal': { center: [28.3949, 84.124], zoom: 7 },
  'Germany': { center: [51.1657, 10.4515], zoom: 6 },
  'France': { center: [46.6, 2.2137], zoom: 6 },
  'Italy': { center: [41.8719, 12.5674], zoom: 5 },
  'Spain': { center: [40.4637, -3.7492], zoom: 5 },
  'Japan': { center: [36.2048, 138.2529], zoom: 5 },
  'Brazil': { center: [-14.235, -51.9253], zoom: 4 },
}

const DEFAULT_CENTER: [number, number] = COUNTRY_CENTERS['United States'].center
const DEFAULT_ZOOM = COUNTRY_CENTERS['United States'].zoom

const COUNTRY_SEARCH_HINTS: Record<string, string> = {
  'United States': 'USA',
  'United Kingdom': 'UK',
}

const pinIcon = L.divIcon({
  className: 'step-map-pin',
  html: '<svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 27 15 27s15-15.8 15-27C30 6.7 23.3 0 15 0z" fill="#e94560"/><circle cx="15" cy="15" r="6" fill="#fff"/></svg>',
  iconSize: [30, 42],
  iconAnchor: [15, 42],
})

async function reverseGeocode(lat: number, lng: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('Reverse geocoding failed')
  const json = await res.json()
  const a: Record<string, string> = json.address || {}
  return {
    country: a.country || '',
    state: a.state || a.state_district || a.region || '',
    city: a.city || a.town || a.village || a.municipality || a.county || '',
    zip: a.postcode || '',
    street: [a.road, a.house_number].filter(Boolean).join(' ') || a.road || a.neighbourhood || '',
  }
}

async function forwardGeocode(query: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('Geocoding failed')
  const json = await res.json()
  if (Array.isArray(json) && json.length > 0) {
    return { lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon) }
  }
  return null
}

export default function Step2Location({ data, onChange }: Step2Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const lastPlacedRef = useRef<{ lat: number; lng: number } | null>(null)
  const lastGeocodedRef = useRef<{ country: string; state: string; city: string }>({ country: '', state: '', city: '' })
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchSeqRef = useRef(0)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const el = mapContainerRef.current
    if (!el) return

    const map = L.map(el, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      worldCopyJump: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    const placeMarker = (lat: number, lng: number) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map)
      }
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = +e.latlng.lat.toFixed(6)
      const lng = +e.latlng.lng.toFixed(6)
      placeMarker(lat, lng)
      lastPlacedRef.current = { lat, lng }
      map.setView([lat, lng], Math.max(map.getZoom(), 15))
      reverseGeocode(lat, lng)
        .then((fields) => {
          lastGeocodedRef.current = { country: fields.country, state: fields.state, city: fields.city }
          onChangeRef.current({ ...fields, latitude: lat, longitude: lng })
        })
        .catch(() => onChangeRef.current({ latitude: lat, longitude: lng }))
    })

    mapRef.current = map
    const t = setTimeout(() => map.invalidateSize(), 0)

    return () => {
      clearTimeout(t)
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  useEffect(() => {
    const { latitude, longitude } = data
    if (latitude == null || longitude == null) {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      return
    }
    const last = lastPlacedRef.current
    if (last && Math.abs(last.lat - latitude) < 1e-9 && Math.abs(last.lng - longitude) < 1e-9) return
    const map = mapRef.current
    if (!map) return
    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude])
    } else {
      markerRef.current = L.marker([latitude, longitude], { icon: pinIcon }).addTo(map)
    }
    map.setView([latitude, longitude], 16)
  }, [data.latitude, data.longitude])

  useEffect(() => {
    const map = mapRef.current
    const center = COUNTRY_CENTERS[data.country]
    if (!map || !center) return
    if (lastGeocodedRef.current.country === data.country) return
    if (data.latitude != null && data.longitude != null) return
    map.setView(center.center, center.zoom)
  }, [data.country, data.latitude, data.longitude])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (lastGeocodedRef.current.city === data.city && lastGeocodedRef.current.state === data.state) return
    if (!data.city && !data.state) return

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    const seq = ++searchSeqRef.current
    const country = COUNTRY_SEARCH_HINTS[data.country] || data.country
    const query = [data.city, data.state, country].filter(Boolean).join(', ')

    searchTimerRef.current = setTimeout(() => {
      forwardGeocode(query)
        .then((res) => {
          if (!res || seq !== searchSeqRef.current) return
          map.setView([res.lat, res.lon], data.city ? 12 : 9)
        })
        .catch(() => {})
    }, 700)

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [data.city, data.state, data.country])

  return (
    <div className="step-location-wrapper">
      <div className="step-card flex-1">
        <h3 className="step-card-title">Physical Address</h3>
        <p className="form-hint" style={{ marginBottom: 14 }}>
          Fill the country, city, or state and the map moves to it — or click anywhere on the map to auto-fill the address.
        </p>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Country</label>
            <select
              value={data.country}
              onChange={e => {
                lastGeocodedRef.current = { country: '', state: '', city: '' }
                onChange({ country: e.target.value, latitude: null, longitude: null })
              }}
              className="form-select"
            >
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">State/Province</label>
            <input
              type="text"
              value={data.state}
              onChange={e => onChange({ state: e.target.value })}
              placeholder="State"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              value={data.city}
              onChange={e => onChange({ city: e.target.value })}
              placeholder="City"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">ZIP/Postal Code</label>
            <input
              type="text"
              value={data.zip}
              onChange={e => onChange({ zip: e.target.value })}
              placeholder="Zip Code"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Street Address</label>
          <input
            type="text"
            value={data.street}
            onChange={e => onChange({ street: e.target.value })}
            placeholder="e.g. 123 Property Lane"
            className="form-input"
          />
        </div>

        {(data.latitude != null && data.longitude != null) && (
          <p className="form-hint" style={{ color: 'var(--primary)', fontWeight: 500, marginTop: 12 }}>
            Lat: {data.latitude.toFixed(6)}, Lng: {data.longitude.toFixed(6)}
          </p>
        )}
      </div>

      <div className="map-view-panel">
        <div className="map-view-header">
          <h3 className="step-card-title" style={{ margin: 0, fontSize: 15 }}>Click to Pin Location</h3>
        </div>
        <div className="map-view-content" ref={mapContainerRef} />
      </div>
    </div>
  )
}
