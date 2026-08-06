export interface User {
  id?: number | string
  first_name: string
  last_name: string
  full_name?: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  role?: string
  avatar?: string
  countryFlag?: string
  country?: string
  phone?: string
  nationality?: string
  joinedDate?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  first_name: string
  last_name: string
  email: string
  password: string
}

export interface SearchFormData {
  destination: string
  checkIn: string
  checkOut: string
  guests: number
}

export interface Destination {
  id: number
  name: string
  country: string
  image: string
  reviews: number
}

export interface Testimonial {
  id: number
  name: string
  location: string
  avatar: string
  rating: number
  quote: string
}

export interface Tenant {
  id: string
  name: string
}
