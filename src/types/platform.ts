export type UserRole = 'organizer' | 'talent' | 'both' | 'admin' | 'scanner' | null;
export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
export type TalentCategory = 'DJ' | 'MC' | 'Hypeman' | 'Singer' | 'Dancer' | 'Comedian' | 'Band' | 'Other';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  onboarded: boolean;
  active: boolean;
  createdAt: any;
  updatedAt: any;
  provider?: 'google' | 'email';
}

export interface TalentProfile {
  uid: string;
  stageName: string;
  displayName: string;
  category: TalentCategory;
  bio: string;
  city: string;
  region: string;
  country: string;
  basePrice: number;
  currency: string;
  waveScore: number;
  averageRating: number;
  ratingCount: number;
  eventCount: number;
  lastEventDate: any;
  available: boolean;
  verified: boolean;
  photoURL: string;
  [key: string]: any;
}

export interface OrganizerProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  city?: string;
  region?: string;
  eventCount?: number;
  totalSpent?: number;
  verified?: boolean;
  rating?: number;
  [key: string]: any;
}

export interface PlatformEvent {
  id: string;
  organizerId: string;
  organizerName: string;
  title: string;
  category: string;
  date: any;
  venue: string;
  city: string;
  region: string;
  talentCategory: TalentCategory;
  talentBudget: number;
  currency: string;
  status: 'open' | 'matched' | 'booked' | 'completed' | 'cancelled';
  matchedTalents?: string[];
  bookedTalentId?: string | null;
  [key: string]: any;
}

export interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  organizerId: string;
  talentId: string;
  talentStageName: string;
  status: BookingStatus;
  agreedPrice: number;
  currency: string;
  requestedAt: any;
  eventDate?: any;
  eventVenue?: string;
  eventCity?: string;
  matchPercentage?: number;
  locationScore?: number;
  categoryScore?: number;
  waveScoreContribution?: number;
  locationReason?: string;
  categoryReason?: string;
  message?: string;
  talentResponse?: string;
  organizerPhoto?: string;
  talentPhoto?: string;
  organizerName?: string;
  talentCategory?: TalentCategory;
  waveScore?: number;
  rated?: boolean;
  ratingSubmitted?: boolean;
  [key: string]: any;
}

export interface Rating {
  id: string;
  bookingId: string;
  talentId: string;
  organizerId: string;
  overall: number;
  comment?: string;
  createdAt?: any;
  [key: string]: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt?: any;
  [key: string]: any;
}
