
export type UserRole = 
  'organizer' | 'talent' | 'both' | null

export type TalentCategory =
  | 'DJ'
  | 'MC'
  | 'Hypeman'
  | 'Singer'
  | 'Dancer'
  | 'Comedian'
  | 'Band'
  | 'Other'

export type EventCategory =
  | 'Party'
  | 'Concert'
  | 'Corporate'
  | 'Wedding'
  | 'Festival'
  | 'Conference'
  | 'Birthday'
  | 'Other'

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'completed'
  | 'cancelled'

export type EventStatus =
  | 'open'
  | 'matched'
  | 'booked'
  | 'completed'
  | 'cancelled'

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: UserRole
  onboarded: boolean
  provider: 'email' | 'google'
  active: boolean
  createdAt: any
  updatedAt: any
  lastLogin: any
}

export interface OrganizerProfile {
  uid: string
  displayName: string
  email: string
  phone: string
  photoURL: string
  bio: string
  company: string
  city: string
  region: string
  country: string
  website: string
  instagram: string
  twitter: string
  eventCount: number
  totalSpent: number
  verified: boolean
  rating: number
  createdAt: any
  updatedAt: any
}

export interface TalentProfile {
  uid: string
  displayName: string
  stageName: string
  email: string
  phone: string
  photoURL: string
  bio: string
  category: TalentCategory
  subcategory: string
  skills: string[]
  city: string
  region: string
  country: string
  basePrice: number
  currency: 'GHS' | 'USD'
  priceNegotiable: boolean
  available: boolean
  instagram: string
  twitter: string
  soundcloud: string
  spotify: string
  youtube: string
  portfolio: string[]
  demoReel: string
  waveScore: number
  averageRating: number
  ratingCount: number
  eventCount: number
  lastEventDate: any
  recencyFactor: number
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  verified: boolean
  featured: boolean
  active: boolean
  createdAt: any
  updatedAt: any
}

export interface PlatformEvent {
  id: string
  organizerId: string
  organizerName: string
  organizerPhoto: string
  title: string
  description: string
  category: EventCategory
  date: any
  startTime: string
  endTime: string
  venue: string
  city: string
  region: string
  country: string
  talentCategory: TalentCategory
  talentBudget: number
  currency: 'GHS' | 'USD'
  guestCount: number
  status: EventStatus
  matchedTalents: string[]
  bookedTalentId: string | null
  imageUrl: string
  requirements: string
  additionalNotes: string
  createdAt: any
  updatedAt: any
}

export interface Booking {
  id: string
  eventId: string
  organizerId: string
  organizerName: string
  talentId: string
  talentName: string
  talentStageName: string
  talentCategory: string
  talentPhoto: string
  matchPercentage: number
  waveScore: number
  eventTitle: string
  eventDate: any
  eventVenue: string
  eventCity: string
  agreedPrice: number
  currency: 'GHS' | 'USD'
  status: BookingStatus
  message: string
  talentResponse: string
  ratingSubmitted: boolean
  rated: boolean
  requestedAt: any
  respondedAt: any
  completedAt: any
  updatedAt: any
}

export interface Rating {
  id: string
  bookingId: string
  eventId: string
  organizerId: string
  organizerName: string
  talentId: string
  overall: number
  performance: number
  professionalism: number
  communication: number
  valueForMoney: number
  averageScore: number
  review: string
  eventDate: any
  submittedAt: any
}

export interface MatchResult {
  talentId: string
  talentName: string
  stageName: string
  photoURL: string
  category: string
  city: string
  waveScore: number
  matchPercentage: number
  locationScore: number
  categoryScore: number
  waveScoreContribution: number
  basePrice: number
  currency: string
  available: boolean
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  actionUrl: string
  relatedId: string
  createdAt: any
}
