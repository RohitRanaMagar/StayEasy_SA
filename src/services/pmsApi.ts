import api from '../api'
import type {
  GeneralInfoPayload,
  GeneralInfoResponse,
  LocationPayload,
  PhotosAmenitiesPayload,
  LocalizationPayload,
  BrandVisualPayload,
  RoomBase,
  RoomBulkCreateRequest,
  RoomResponse,
  RoomTypeResponse,
  BedTypeResponse,
  AvailableRoom,
  SpecialOfferPayload,
  SpecialOfferResponse,
  DiscountCodePayload,
  DiscountCodeResponse,
  AmenityOption,
  TenantResponse,
  PropertyBooking,
  BookingCreatePayload,
} from '../types/pms'

// ─── Properties ──────────────────────────────────────────────

export const createGeneralInfo = async (data: GeneralInfoPayload): Promise<GeneralInfoResponse> => {
  const { data: result } = await api.post('/properties/general-information', data)
  return result.data
}

export const createLocation = async (propertyId: string, data: LocationPayload): Promise<void> => {
  await api.post(`/properties/${propertyId}/create-location`, data)
}

export const createPhotosAmenities = async (propertyId: string, data: PhotosAmenitiesPayload): Promise<void> => {
  await api.post(`/properties/${propertyId}/create-photos-and-amenities`, data)
}

export const createLocalization = async (propertyId: string, data: LocalizationPayload): Promise<void> => {
  await api.post(`/properties/${propertyId}/create-localization`, data)
}

export const createBrandVisual = async (propertyId: string, data: BrandVisualPayload): Promise<void> => {
  await api.post(`/properties/${propertyId}/create-brand-visual`, data)
}

export const getProperty = async (id: string): Promise<GeneralInfoResponse> => {
  const { data: result } = await api.get(`/properties/${id}`)
  return result.data
}

export const getAllProperties = async (): Promise<GeneralInfoResponse[]> => {
  const all: GeneralInfoResponse[] = []
  let skip = 0
  const pageSize = 50
  for (;;) {
    const { data: result } = await api.get('/properties/', { params: { skip, limit: pageSize } })
    const batch: GeneralInfoResponse[] = result.data?.properties ?? []
    all.push(...batch)
    if (batch.length < pageSize) break
    skip += pageSize
  }
  return all
}

export const deleteProperty = async (id: string): Promise<void> => {
  await api.delete(`/properties/${id}`)
}

export const updatePropertyActivation = async (id: string): Promise<string> => {
  const { data: result } = await api.post(`/properties/${id}/toggle-property-activation`)
  return result.data
}

export const getAmenities = async (): Promise<AmenityOption[]> => {
  const { data: result } = await api.get('/properties/amenities')
  return Array.isArray(result.data?.amenities) ? result.data.amenities : []
}

// ─── Images ──────────────────────────────────────────────────

export const uploadPropertyImage = async (propertyId: string, formData: FormData): Promise<string[]> => {
  const { data: result } = await api.post(`/properties/${propertyId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return Array.isArray(result.data) ? result.data : []
}

export const uploadRoomImages = async (propertyId: string, formData: FormData): Promise<string[]> => {
  const { data: result } = await api.post(`/properties/${propertyId}/rooms/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return Array.isArray(result.data) ? result.data : []
}

// ─── Rooms ───────────────────────────────────────────────────

export const createRooms = async (propertyId: string, data: RoomBulkCreateRequest): Promise<{ rooms: RoomResponse[] }> => {
  const { data: result } = await api.post(`/properties/${propertyId}/rooms`, data)
  return result.data
}

export const getRooms = async (propertyId: string): Promise<RoomResponse[]> => {
  const { data: result } = await api.get(`/properties/${propertyId}/rooms`)
  return result.data
}

export const getRoom = async (propertyId: string, roomId: string): Promise<RoomResponse> => {
  const { data: result } = await api.get(`/properties/${propertyId}/rooms/${roomId}`)
  return result.data
}

export const updateRoom = async (propertyId: string, roomId: string, data: Partial<RoomBase>): Promise<RoomResponse> => {
  const { data: result } = await api.patch(`/properties/${propertyId}/rooms/${roomId}`, data)
  return result.data
}

export const deleteRoom = async (propertyId: string, roomId: string): Promise<void> => {
  await api.delete(`/properties/${propertyId}/rooms/${roomId}`)
}

export const getAvailableRooms = async (propertyId: string, checkinDate: string, checkoutDate: string): Promise<AvailableRoom[]> => {
  const { data: result } = await api.get(`/properties/${propertyId}/rooms/available-rooms`, {
    params: { checkin_date: checkinDate, checkout_date: checkoutDate },
  })
  return result.data
}

// ─── Room Types ─────────────────────────────────────────────

export const getRoomTypes = async (propertyId: string): Promise<RoomTypeResponse[]> => {
  const { data: result } = await api.get(`/properties/${propertyId}/rooms/room-types`)
  return result.data
}

export const createRoomType = async (propertyId: string, roomTypeName: string): Promise<RoomTypeResponse> => {
  const { data: result } = await api.post(`/properties/${propertyId}/rooms/room-type`, { room_type_name: roomTypeName })
  return result.data
}

// ─── Bed Types ──────────────────────────────────────────────

export const getBedTypes = async (propertyId: string): Promise<BedTypeResponse[]> => {
  const { data: result } = await api.get(`/properties/${propertyId}/rooms/bed-types`)
  return result.data
}

export const createBedType = async (propertyId: string, bedName: string): Promise<BedTypeResponse> => {
  const { data: result } = await api.post(`/properties/${propertyId}/rooms/bed-type`, { bed_name: bedName })
  return result.data
}

// ─── Special Offers ──────────────────────────────────────────

export const createSpecialOffers = async (propertyId: string, offers: SpecialOfferPayload[]): Promise<SpecialOfferResponse[]> => {
  const { data: result } = await api.post(`/properties/${propertyId}/special-offers/`, { offers })
  return result.data
}

export const getSpecialOffers = async (propertyId: string): Promise<SpecialOfferResponse[]> => {
  const { data: result } = await api.get(`/properties/${propertyId}/special-offers/`)
  return result.data
}

export const getSpecialOffer = async (propertyId: string, offerId: string): Promise<SpecialOfferResponse> => {
  const { data: result } = await api.get(`/properties/${propertyId}/special-offers/${offerId}`)
  return result.data
}

export const updateSpecialOffer = async (propertyId: string, offerId: string, data: Partial<SpecialOfferPayload>): Promise<SpecialOfferResponse> => {
  const { data: result } = await api.patch(`/properties/${propertyId}/special-offers/${offerId}`, data)
  return result.data
}

export const deleteSpecialOffer = async (propertyId: string, offerId: string): Promise<void> => {
  await api.delete(`/properties/${propertyId}/special-offers/${offerId}`)
}

// ─── Discount Codes ─────────────────────────────────────────

export const createDiscountCode = async (propertyId: string, data: DiscountCodePayload): Promise<DiscountCodeResponse> => {
  const { data: result } = await api.post(`/properties/${propertyId}/discount-codes/`, data)
  return result.data
}

export const getDiscountCodes = async (propertyId: string): Promise<DiscountCodeResponse[]> => {
  const { data: result } = await api.get(`/properties/${propertyId}/discount-codes/`)
  return result.data
}

export const getDiscountCode = async (propertyId: string, discountId: string): Promise<DiscountCodeResponse> => {
  const { data: result } = await api.get(`/properties/${propertyId}/discount-codes/${discountId}`)
  return result.data
}

export const updateDiscountCode = async (propertyId: string, discountId: string, data: Partial<DiscountCodePayload>): Promise<DiscountCodeResponse> => {
  const { data: result } = await api.patch(`/properties/${propertyId}/discount-codes/${discountId}`, data)
  return result.data
}

export const deleteDiscountCode = async (propertyId: string, discountId: string): Promise<void> => {
  await api.delete(`/properties/${propertyId}/discount-codes/${discountId}`)
}

// ─── Tenant ─────────────────────────────────────────────────

export const getTenant = async (): Promise<TenantResponse> => {
  const { data: result } = await api.get('/tenants/')
  return result.data
}

export const createTenant = async (name: string): Promise<TenantResponse> => {
  const { data: result } = await api.post('/tenants/', { name })
  return result.data
}

export const updateTenant = async (name: string): Promise<TenantResponse> => {
  const { data: result } = await api.patch('/tenants/', { name })
  return result.data
}

export const deleteTenant = async (): Promise<void> => {
  await api.delete('/tenants/')
}

// ─── Bookings ───────────────────────────────────────────────

export const getPropertyBookings = async (propertyId: string): Promise<PropertyBooking[]> => {
  const all: PropertyBooking[] = []
  let skip = 0
  const pageSize = 50
  for (;;) {
    const { data: result } = await api.get(`/properties/${propertyId}/bookings`, { params: { skip, limit: pageSize } })
    const batch: PropertyBooking[] = Array.isArray(result.data) ? result.data : []
    all.push(...batch)
    if (batch.length < pageSize) break
    skip += pageSize
  }
  return all
}

export const getBookingByRefNumber = async (refNumber: string): Promise<PropertyBooking> => {
  const { data: result } = await api.get(`/bookings/${refNumber}`)
  return result.data
}

export const createBooking = async (data: BookingCreatePayload): Promise<PropertyBooking> => {
  const { data: result } = await api.post('/bookings/', data)
  return result.data
}
