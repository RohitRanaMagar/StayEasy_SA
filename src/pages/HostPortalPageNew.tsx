import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import PortalHeader from '../components/portal/PortalHeader'
import ProgressBar from '../components/portal/ProgressBar'
import PropertyTypeSelector from '../components/portal/PropertyTypeSelector'
import Step1PropertyDetails from '../components/portal/Step1PropertyDetails'
import Step2Location from '../components/portal/Step2Location'
import Step3PhotosAmenities from '../components/portal/Step3PhotosAmenities'
import Step4Localization from '../components/portal/Step4Localization'
import type { LocalizationData } from '../components/portal/Step4Localization'
import Step5BrandingVisuals from '../components/portal/Step5BrandingVisuals'
import type { BrandData } from '../components/portal/Step5BrandingVisuals'
import Step4RoomSetup, { Room } from '../components/portal/Step4RoomSetup'
import Step5PricingOffers from '../components/portal/Step5PricingOffers'
import Step6Review from '../components/portal/Step6Review'
import NavigationButtons from '../components/portal/NavigationButtons'
import {
  createGeneralInfo,
  createLocation,
  createPhotosAmenities,
  createLocalization,
  createBrandVisual,
  uploadPropertyImage,
  uploadRoomImages,
  createRooms,
  createRoomType,
  createBedType,
  getRoomTypes,
  getBedTypes,
  createSpecialOffers,
  updatePropertyActivation,
  getAmenities as fetchAmenitiesApi,
  getTenant,
  createTenant,
} from '../services/pmsApi'
import type {
  GeneralInfoPayload,
  LocationPayload,
  PhotosAmenitiesPayload,
  PhotosAmenityCustom,
  AmenityOption,
  LocalizationPayload,
  BrandVisualPayload,
  RoomBase,
  SpecialOfferPayload,
} from '../types/pms'
import '../styles/portal.css'

type WizardStep = 'type' | 'property' | 'location' | 'photos' | 'localization' | 'branding' | 'rooms' | 'pricing' | 'review'

interface PropertyData {
  type: string
  name: string
  totalRooms: number
  floors: number
  yearBuilt: number
  description: string
  phone: string
  email: string
}

interface LocationData {
  country: string
  state: string
  city: string
  zip: string
  street: string
  latitude: number | null
  longitude: number | null
}

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

const DEFAULT_OFFERS: Offer[] = [
  { id: 'early', label: 'Early Bird Discount', badge: '10% OFF', badgeColor: '#dcfce7', badgeText: '#16a34a', desc: '10% off for bookings made 30+ days in advance', discountPercentage: 10, enabled: false, startDate: null, endDate: null },
  { id: 'last', label: 'Last-Minute Deal', badge: '15% OFF', badgeColor: '#fee2e2', badgeText: '#dc2626', desc: '15% off for bookings made within 48 hours of check-in', discountPercentage: 15, enabled: false, startDate: null, endDate: null },
  { id: 'long', label: 'Long Stay Discount', badge: '20% OFF', badgeColor: '#dbeafe', badgeText: '#2563eb', desc: '20% off for stays of 7 nights or more', discountPercentage: 20, enabled: false, startDate: null, endDate: null },
  { id: 'free', label: 'Free Cancellation', badge: 'Free', badgeColor: '#f3e8ff', badgeText: '#9333ea', desc: 'Full refund if cancelled 48+ hours before check-in', discountPercentage: 0, enabled: false, startDate: null, endDate: null },
]

const createDefaultRoom = (id: number): Room => ({
  id: `room-${id}`,
  floor: '1',
  name: `Room ${id}`,
  type: '',
  bedType: '',
  maxAdults: 2,
  maxChildren: 0,
  petsAllowed: false,
  minRate: '0.00',
  cancellationPolicy: 'moderate',
  customPolicyTitle: '',
  customPolicyDescription: '',
  savedCustomPolicies: [],
  amenities: ['High-speed WiFi', 'Air Conditioning'],
  expanded: true,
  photos: [],
  coverPhotoIndex: 0,
})

export default function HostPortalPageNew() {
  const { user, loading: authLoading } = useAuth()

  const [currentStep, setCurrentStep] = useState<WizardStep>('type')
  const [propertyData, setPropertyData] = useState<PropertyData>({
    type: '',
    name: '',
    totalRooms: 0,
    floors: 0,
    yearBuilt: 0,
    description: '',
    phone: '',
    email: '',
  })
  const [locationData, setLocationData] = useState<LocationData>({
    country: 'United States',
    state: '',
    city: '',
    zip: '',
    street: '',
    latitude: null,
    longitude: null,
  })
  const [photos, setPhotos] = useState<File[]>([])
  const [coverIndex, setCoverIndex] = useState(0)
  const [systemAmenityIds, setSystemAmenityIds] = useState<string[]>([])
  const [customAmenities, setCustomAmenities] = useState<PhotosAmenityCustom[]>([])
  const [availableAmenities, setAvailableAmenities] = useState<AmenityOption[]>([])
  const [rooms, setRooms] = useState<Room[]>([createDefaultRoom(1)])
  const [offers, setOffers] = useState<Offer[]>(DEFAULT_OFFERS)
  const [starRating, setStarRating] = useState(0)

  const [localizationData, setLocalizationData] = useState<LocalizationData>({
    currency: 'USD',
    timezone: 'UTC',
    language: 'English (US)',
    checkInTime: '3:00 PM',
    checkOutTime: '11:00 AM',
    earlyCheckInGrace: 0,
    lateCheckOutGrace: 0,
    allowAlwaysCheckIn: true,
  })

  const [brandData, setBrandData] = useState<BrandData>({
    logo: null,
    brandColor: '#2E86AB',
    isWcagPassing: true,
  })

  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const hasRestoredRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const draftKey = `stayEasyDraft_${user?.id || user?.email || 'anon'}`

  useEffect(() => {
    try { localStorage.removeItem('stayEasyDraft') } catch {}
  }, [])

  useEffect(() => {
    if (hasRestoredRef.current) return
    if (!user) return
    const raw = localStorage.getItem(draftKey)
    if (raw) {
      try {
        const draft = JSON.parse(raw)
        // Don't restore currentStep from draft — always start at step 1
        // but pre-fill the form data so nothing is lost
        if (draft.propertyData) setPropertyData(draft.propertyData)
        if (draft.locationData) setLocationData(draft.locationData)
        if (draft.coverIndex !== undefined) setCoverIndex(draft.coverIndex)
        if (draft.systemAmenityIds) setSystemAmenityIds(draft.systemAmenityIds)
        if (draft.customAmenities) setCustomAmenities(draft.customAmenities)
        if (draft.starRating !== undefined) setStarRating(draft.starRating)
        if (draft.localizationData) setLocalizationData(draft.localizationData)
        if (draft.rooms) setRooms(draft.rooms.map((r: any) => ({
          ...r,
          photos: [],
          customPolicyTitle: r.customPolicyTitle ?? '',
          customPolicyDescription: r.customPolicyDescription ?? '',
          savedCustomPolicies: r.savedCustomPolicies ?? [],
        })))
        if (draft.offers) {
          setOffers(draft.offers.map((o: any) => ({
            ...o,
            discountPercentage: o.discountPercentage ?? 0,
            startDate: o.startDate ? new Date(o.startDate) : null,
            endDate: o.endDate ? new Date(o.endDate) : null,
          })))
        }
        if (draft.brandData) setBrandData({ ...draft.brandData, logo: null })
        if (draft.propertyId !== undefined) setPropertyId(draft.propertyId)
      } catch {}
    }
    hasRestoredRef.current = true
  }, [draftKey, user])

  useEffect(() => {
    if (!hasRestoredRef.current) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      const draft = {
        currentStep,
        propertyData,
        locationData,
        coverIndex,
        systemAmenityIds,
        customAmenities,
        starRating,
        localizationData,
        rooms: rooms.map(r => ({ ...r, photos: [] })),
        offers: offers.map(o => ({
          ...o,
          startDate: o.startDate instanceof Date ? o.startDate.toISOString() : o.startDate,
          endDate: o.endDate instanceof Date ? o.endDate.toISOString() : o.endDate,
        })),
        brandData: { ...brandData, logo: null },
        propertyId,
      }
      localStorage.setItem(draftKey, JSON.stringify(draft))
    }, 500)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [currentStep, propertyData, locationData, coverIndex, systemAmenityIds, customAmenities, starRating, localizationData, rooms, offers, brandData, propertyId])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey)
  }, [draftKey])

  useEffect(() => {
    fetchAmenitiesApi().then(setAvailableAmenities).catch(() => {})
  }, [])

  const stepOrder: WizardStep[] = ['type', 'property', 'location', 'photos', 'localization', 'branding', 'rooms', 'pricing', 'review']

  const getStepIndex = (step: WizardStep): number => stepOrder.indexOf(step)

  const getSectionNumber = (): number => {
    switch (currentStep) {
      case 'property': case 'location': case 'photos': case 'localization': case 'branding':
        return 1
      case 'rooms':
        return 2
      case 'pricing': case 'review':
        return 3
      default:
        return 0
    }
  }

  const getProgressPercentage = (): number => {
    const section = getSectionNumber()
    if (section === 0) return 0
    return Math.round(((section - 1) / 2) * 100)
  }

  const getStepNumber = (): { current: number; total: number } => {
    const section = getSectionNumber()
    return { current: section, total: 3 }
  }

  const getStepTitle = (): string => {
    const titles: Record<WizardStep, string> = {
      type: 'Select Your Property Type',
      property: 'Property Details',
      location: 'Location Details',
      photos: 'Photos & Amenities',
      localization: 'Property Localization',
      branding: 'Branding & Visuals',
      rooms: 'Room Setup',
      pricing: 'Pricing & Offers',
      review: 'Final Review & Launch',
    }
    return titles[currentStep]
  }

  const getNextStep = (): WizardStep | null => {
    const idx = getStepIndex(currentStep)
    return idx < stepOrder.length - 1 ? stepOrder[idx + 1] : null
  }

  const getPrevStep = (): WizardStep | null => {
    const idx = getStepIndex(currentStep)
    return idx > 0 ? stepOrder[idx - 1] : null
  }

  const saveCurrentStep = useCallback(async (): Promise<boolean> => {
    setSaveError(null)

    if (!user) {
      if (currentStep === 'property' && propertyId === null) {
        setPropertyId(`demo_${Date.now()}`)
      }
      return true
    }

    try {
      switch (currentStep) {
        case 'type':
          return true

        case 'property': {
          try {
            await getTenant()
          } catch {
            await createTenant(propertyData.name || 'My Property')
          }
          const payload: GeneralInfoPayload = {
            name: propertyData.name,
            type: propertyData.type,
            total_rooms: propertyData.totalRooms,
            number_of_floors: propertyData.floors,
            year_built: propertyData.yearBuilt,
            description: propertyData.description,
            phone_number: propertyData.phone,
            email: propertyData.email,
          }
          const result = await createGeneralInfo(payload)
          setPropertyId(result.id)
          return true
        }

        case 'location': {
          if (propertyId === null) return false
          const requiredFields: [string, string][] = [
            ['Country', locationData.country],
            ['State/Province', locationData.state],
            ['City', locationData.city],
            ['ZIP/Postal Code', locationData.zip],
            ['Street Address', locationData.street],
          ]
          const missing = requiredFields.find(([, v]) => v.trim().length < 2)
          if (missing) {
            setSaveError(`${missing[0]} must be at least 2 characters before continuing.`)
            return false
          }
          const payload: LocationPayload = {
            country: locationData.country,
            state: locationData.state,
            city: locationData.city,
            zip_code: locationData.zip,
            address: locationData.street,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          }
          await createLocation(propertyId, payload)
          return true
        }

        case 'photos': {
          if (propertyId === null) return false

          let coverUrl = ''
          let galleryUrls: string[] = []

          if (photos.length > 0) {
            const orderedPhotos = coverIndex < photos.length
              ? [photos[coverIndex], ...photos.filter((_, i) => i !== coverIndex)]
              : photos
            const formData = new FormData()
            orderedPhotos.forEach(p => formData.append('files', p))
            const uploadedUrls = await uploadPropertyImage(propertyId, formData)

            if (uploadedUrls.length > 0) {
              coverUrl = uploadedUrls[0]
              galleryUrls = uploadedUrls.slice(1)
            }
          }

          const payload: PhotosAmenitiesPayload = {
            photos: {
              cover: coverUrl,
              gallery: galleryUrls,
            },
            amenities: {
              system_amenity_ids: systemAmenityIds,
              custom_amenities: customAmenities,
            },
            star_rating: starRating,
          }
          await createPhotosAmenities(propertyId, payload)
          return true
        }

        case 'localization': {
          if (propertyId === null) return false

          let checkInTime: string | null = null
          let checkOutTime: string | null = null

          if (!localizationData.allowAlwaysCheckIn) {
            checkInTime = localizationData.checkInTime.trim()
            checkOutTime = localizationData.checkOutTime.trim()
            if (checkInTime.length < 2) {
              setSaveError('Check-in Time must be at least 2 characters before continuing.')
              return false
            }
            if (checkOutTime.length < 2) {
              setSaveError('Check-out Time must be at least 2 characters before continuing.')
              return false
            }
          }

          const payload: LocalizationPayload = {
            currency: localizationData.currency,
            timezone: localizationData.timezone,
            language: localizationData.language,
            check_in_time: checkInTime,
            check_out_time: checkOutTime,
            check_in_grace_period: localizationData.earlyCheckInGrace,
            check_out_grace_period: localizationData.lateCheckOutGrace,
            always_allow_check_in_out: localizationData.allowAlwaysCheckIn,
          }
          await createLocalization(propertyId, payload)
          return true
        }

        case 'branding': {
          if (propertyId === null) return false
          let logoUrl: string | null = null
          if (brandData.logo) {
            const formData = new FormData()
            formData.append('files', brandData.logo)
            const urls = await uploadPropertyImage(propertyId, formData)
            if (urls.length > 0) logoUrl = urls[0]
          }
          const payload: BrandVisualPayload = {
            brand_color: brandData.brandColor,
            brand_logo_url: logoUrl,
          }
          await createBrandVisual(propertyId, payload)
          return true
        }

        case 'rooms': {
          if (propertyId === null) return false

          const roomTypeCache: Record<string, string> = {}
          const bedTypeCache: Record<string, string> = {}

          let existingRoomTypes: { room_type_name: string; id: string }[] = []
          let existingBedTypes: { bed_name: string; id: string }[] = []
          try {
            const [rt, bt] = await Promise.all([
              getRoomTypes(propertyId),
              getBedTypes(propertyId),
            ])
            existingRoomTypes = rt
            existingBedTypes = bt
          } catch {
            // room-types/bed-types endpoints may not be available yet
          }
          for (const rt of existingRoomTypes) {
            roomTypeCache[rt.room_type_name] = rt.id
          }
          for (const bt of existingBedTypes) {
            bedTypeCache[bt.bed_name] = bt.id
          }

          for (const room of rooms) {
            if (room.type && !roomTypeCache[room.type]) {
              const res = await createRoomType(propertyId, room.type)
              roomTypeCache[room.type] = res.id
            }
            if (room.bedType && !bedTypeCache[room.bedType]) {
              const res = await createBedType(propertyId, room.bedType)
              bedTypeCache[room.bedType] = res.id
            }
          }

          const roomBases: RoomBase[] = []

          for (const room of rooms) {
            let coverUrl: string | null = null
            let galleryUrls: string[] = []
            if (room.photos.length > 0) {
              const coverIdx = room.coverPhotoIndex ?? 0
              const orderedPhotos = coverIdx < room.photos.length
                ? [room.photos[coverIdx], ...room.photos.filter((_, i) => i !== coverIdx)]
                : room.photos
              const formData = new FormData()
              orderedPhotos.forEach(p => formData.append('files', p))
              const uploadedUrls = await uploadRoomImages(propertyId, formData)
              if (uploadedUrls.length > 0) {
                coverUrl = uploadedUrls[0]
                galleryUrls = uploadedUrls.slice(1)
              }
            }

            let cancellationPolicy = (room.cancellationPolicy || 'moderate').toUpperCase() as string
            let cancellationTitle: string | null = null
            let cancellationDescription: string | null = null
            if (cancellationPolicy.startsWith('CUSTOM-')) {
              const saved = room.savedCustomPolicies.find(p => p.id === room.cancellationPolicy)
              if (saved) {
                cancellationPolicy = 'CUSTOM'
                cancellationTitle = saved.title
                cancellationDescription = saved.description
              }
            }

            const systemAmenityIds = room.amenities
              .map(name => {
                const found = availableAmenities.find(a => (a.label || a.name) === name)
                return found ? String(found.id) : null
              })
              .filter((id): id is string => id !== null)

            const customAmenityNames = room.amenities.filter(name =>
              !availableAmenities.some(a => (a.label || a.name) === name)
            )

            roomBases.push({
              floor_number: parseInt(room.floor, 10) || 0,
              room_name: room.name,
              room_type_id: roomTypeCache[room.type] || '',
              bed_type_id: bedTypeCache[room.bedType] || '',
              max_adults: room.maxAdults,
              max_children: room.maxChildren,
              base_rate: parseFloat(room.minRate) || 1,
              status: 'AVAILABLE',
              cancellation_policy: cancellationPolicy,
              cancellation_title: cancellationTitle,
              cancellation_description: cancellationDescription,
              photos: { cover: coverUrl, gallery: galleryUrls },
              system_amenity_ids: systemAmenityIds,
              custom_amenities: customAmenityNames.map(name => ({ name, icon: null })),
            })
          }

          await createRooms(propertyId, { rooms: roomBases })
          return true
        }

        case 'pricing': {
          if (propertyId === null) return false
          const enabledOffers = offers.filter(o => o.enabled)
          if (enabledOffers.length > 0) {
            const payload: SpecialOfferPayload[] = enabledOffers.map(o => ({
              title: o.label,
              description: o.desc,
              discount_percentage: o.discountPercentage,
              start_date: o.startDate ? o.startDate.toISOString().split('T')[0] : null,
              end_date: o.endDate ? o.endDate.toISOString().split('T')[0] : null,
              is_active: true,
              is_custom: o.id.startsWith('custom-'),
            }))
            await createSpecialOffers(propertyId, payload)
          }
          return true
        }

        case 'review':
          return true

        default:
          return true
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to save'
      setSaveError(msg)
      return false
    }
  }, [currentStep, propertyData, locationData, systemAmenityIds, customAmenities, starRating, localizationData, brandData, rooms, offers, photos, propertyId])

  const handleNext = useCallback(async () => {
    setIsSaving(true)
    const ok = await saveCurrentStep()
    setIsSaving(false)
    if (!ok) return
    const next = getNextStep()
    if (next) setCurrentStep(next)
  }, [saveCurrentStep])

  const handleBack = useCallback(() => {
    setSaveError(null)
    const prev = getPrevStep()
    if (prev) setCurrentStep(prev)
  }, [currentStep])

  const handleGoToStep = useCallback((stepIdx: number) => {
    if (stepIdx >= 0 && stepIdx < stepOrder.length) {
      setCurrentStep(stepOrder[stepIdx])
    }
  }, [])

  const renderStepContent = () => {
    switch (currentStep) {
      case 'type':
        return (
          <PropertyTypeSelector
            selectedType={propertyData.type}
            onSelect={(type) => {
              setPropertyData(prev => ({ ...prev, type }))
              handleNext()
            }}
          />
        )

      case 'property':
        return (
          <Step1PropertyDetails
            data={propertyData}
            onChange={(data) => setPropertyData(prev => ({ ...prev, ...data }))}
          />
        )

      case 'location':
        return (
          <Step2Location
            data={locationData}
            onChange={(data) => setLocationData(prev => ({ ...prev, ...data }))}
          />
        )

      case 'photos':
        return (
          <Step3PhotosAmenities
            photos={photos}
            onPhotosChange={setPhotos}
            coverIndex={coverIndex}
            onCoverIndexChange={setCoverIndex}
            availableAmenities={availableAmenities}
            systemAmenityIds={systemAmenityIds}
            onSystemAmenityIdsChange={setSystemAmenityIds}
            customAmenities={customAmenities}
            onCustomAmenitiesChange={setCustomAmenities}
            starRating={starRating}
            onStarRatingChange={setStarRating}
          />
        )

      case 'localization':
        return (
          <Step4Localization
            data={localizationData}
            onChange={(data) => setLocalizationData(prev => ({ ...prev, ...data }))}
          />
        )

      case 'branding':
        return (
          <Step5BrandingVisuals
            data={brandData}
            onChange={(data) => setBrandData(prev => ({ ...prev, ...data }))}
            propertyName={propertyData.name}
            propertyPhone={propertyData.phone}
          />
        )

      case 'rooms':
        return (
          <Step4RoomSetup
            rooms={rooms}
            onRoomsChange={setRooms}
            availableAmenities={availableAmenities}
            floors={propertyData.floors}
          />
        )

      case 'pricing':
        return (
          <Step5PricingOffers
            offers={offers}
            onOffersChange={setOffers}
          />
        )

      case 'review':
        return (
          <Step6Review
            property={{
              name: propertyData.name,
              type: propertyData.type,
              description: propertyData.description,
              phone: propertyData.phone,
              email: propertyData.email,
              totalRooms: propertyData.totalRooms,
              floors: propertyData.floors,
              yearBuilt: propertyData.yearBuilt,
            }}
            location={locationData}
            photos={photos}
            availableAmenities={availableAmenities}
            systemAmenityIds={systemAmenityIds}
            customAmenities={customAmenities}
            rooms={rooms}
            offers={offers}
            starRating={starRating}
            onGoToStep={handleGoToStep}
            onPublish={async () => {
              if (propertyId) {
                try { await updatePropertyActivation(propertyId) } catch {}
              }
              clearDraft()
            }}
          />
        )

      default:
        return null
    }
  }

  const renderNavigation = () => {
    if (currentStep === 'type') return null
    if (currentStep === 'review') return null

    const prev = getPrevStep()
    const next = getNextStep()

    const nextLabel =
      currentStep === 'localization' ? 'Continue to Branding & Visuals' :
      currentStep === 'rooms' ? 'Continue to Pricing & Offers' :
      'Next Step'

    return (
      <div className="portal-nav-container">
        {saveError && <div className="error-banner">{saveError}</div>}
        <NavigationButtons
          onBack={prev ? handleBack : undefined}
          onNext={next ? handleNext : undefined}
          backLabel="Previous Step"
          nextLabel={nextLabel}
          loading={isSaving}
        />
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="portal-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="portal-page">
      <PortalHeader />

      <main className="portal-main">
        {currentStep === 'type' ? (
          <div className="portal-type-container">
            <div className="portal-type-card">
              <h1 className="portal-type-title">{getStepTitle()}</h1>
              <p className="portal-type-subtitle">
                Choose the primary category that best describes your property. This helps us customize your management dashboard.
              </p>
              {renderStepContent()}
            </div>
          </div>
        ) : (
          <div className="portal-wizard-container">
            <ProgressBar
              currentStep={getStepNumber().current}
              totalSteps={getStepNumber().total}
              percentage={getProgressPercentage()}
              title={getStepTitle()}
            />
            {renderStepContent()}
            {renderNavigation()}
          </div>
        )}
      </main>
    </div>
  )
}
