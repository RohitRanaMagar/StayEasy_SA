export interface GeneralInfoPayload {
  name: string
  type: string
  total_rooms: number
  number_of_floors: number
  year_built: number
  description: string
  phone_number: string
  email: string
}

export interface GeneralInfoResponse extends GeneralInfoPayload {
  id: string
  created_at?: string
  updated_at?: string
}

export interface LocationPayload {
  country: string
  state: string
  city: string
  zip_code: string
  address: string
  latitude: number | null
  longitude: number | null
}

export interface PhotosAmenityCustom {
  name: string
  icon: string
}

export interface PhotosAmenitiesPayload {
  photos: {
    cover: string
    gallery: string[]
  }
  amenities: {
    system_amenity_ids: string[]
    custom_amenities: PhotosAmenityCustom[]
  }
  star_rating: number
}

export interface LocalizationPayload {
  currency: string
  timezone: string
  language: string
  check_in_time: string | null
  check_out_time: string | null
  check_in_grace_period: number
  check_out_grace_period: number
  always_allow_check_in_out: boolean
}

export interface BrandVisualPayload {
  brand_color: string
  brand_logo_url?: string | null
}

export interface RoomTypeResponse {
  id: string
  property_id: string
  room_type_name: string
  is_default: boolean
}

export interface BedTypeResponse {
  id: string
  property_id: string
  bed_name: string
  is_default: boolean
}

export interface RoomBase {
  floor_number: number
  room_name: string
  room_type_id: string
  bed_type_id: string
  photos?: { cover: string | null; gallery: string[] }
  max_adults: number
  max_children: number
  base_rate: number | string
  status?: string
  cancellation_policy?: string
  cancellation_title?: string | null
  cancellation_description?: string | null
  system_amenity_ids?: string[]
  custom_amenities?: { name: string; icon?: string | null }[]
}

export interface RoomBulkCreateRequest {
  rooms: RoomBase[]
}

export interface RoomResponse extends RoomBase {
  id: string
  property_id: string
}

export interface AvailableRoom {
  id: string
  room_name: string
  room_type: string
  bed_type: string
  base_rate: string
  photos: { cover: string | null; gallery: string[] }
  max_adults: number
  max_children: number
  status: string
  floor_number: number
  cancellation_policy: string
  cancellation_title: string | null
  cancellation_description: string | null
  system_amenities: { name: string; icon: string | null }[]
  custom_amenities: { name: string; icon: string | null }[]
}

export interface SpecialOfferPayload {
  title: string
  description: string
  discount_percentage: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  is_custom: boolean
}

export interface SpecialOfferResponse extends SpecialOfferPayload {
  id: string
  property_id: string
  created_at?: string
  updated_at?: string
}

export interface DiscountCodePayload {
  code: string
  type: 'FIXED' | 'PERCENTAGE'
  discount_value: number
  min_amount: number
  max_uses: number
  valid_from: string
  valid_to: string
}

export interface DiscountCodeResponse extends DiscountCodePayload {
  id: string
  property_id: string
  used_count: number
  created_at?: string
  updated_at?: string
}

export interface ActivationPayload {
  is_active: boolean
}

export interface AmenityOption {
  id: string | number
  name: string
  label?: string
  icon?: string
}

export interface TenantPayload {
  name: string
}

export interface TenantResponse {
  id: number | string
  name: string
  owner_id?: string
  created_at?: string
}

export interface PropertyBooking {
  id: string
  guest_name: string
  guest_email: string
  booking_number: string
  room_names: string[]
  checkin_date: string
  checkout_date: string
  status: string
  payment_gateway: string
  subtotal: string
  special_offer_discount: string | null
  coupon_code: string | null
  coupon_discount: string | null
  total_amount: string
  created_at: string
}

export interface BookingCreatePayload {
  idempotency_key: string
  property_id: string
  room_ids: string[]
  check_in: string
  check_out: string
  adults: number
  children: number
}
