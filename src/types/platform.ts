export type UserRole = 'organizer' | 'talent' | 'both' | null;

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
}

export interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  organizerId: string;
  talentId: string;
  talentStageName: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  agreedPrice: number;
  currency: string;
  requestedAt: any;
}