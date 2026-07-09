export interface Venue1 {
  id: number;
  name: string;
  location: string;
  venueType?: 'auditorium' | 'exhibitionHall' | 'cafe';
  price: number;
  rating: number;
  imageUrl: string;
  images?: string[];
  capacity: number;
  description: string;
  featured?: boolean;
  amenities?: {
    swimmingPool?: boolean;
    outsideCateringAllowed?: boolean;
    carParking?: boolean;
  };
}

export interface Venue {
  id: number;
  name: string;
  type: string;
  address: string;
  location: string;
  capacity: number;

  carParking: boolean;
  swimmingPool: boolean;
  outsideServicesAllowed: boolean;
  cateringProvided: boolean;

  additional: string;

  venueStatus: string;
  createdAt: string;
  updatedAt: string;

  slots: VenueSlot[];
  venueImages: VenueImage[];

  // UI-only fields
  rating?: number;
  description?: string;
  images?: string[];
  imageUrl?: string;
  price?: number;
}

export interface VenueImage {
  imageId: number;
  imagePath: string;
  profile:boolean;
}

export interface VenueSlot {
  slotId: number;
  slotType: string;
  startDateTime: string;      // 'YYYY-MM-DD'
  endDateTime: string;       // 'YYYY-MM-DD' for multi-day slots
  minSlotTime: string;      // 'HH:mm'
  maxSlotTime: string;        // 'HH:mm'
  minSlotPrice: string;
  bufferTime: string;
  totalSlotPrice: number;
  slotStatus?: string;  // only for multiday slots
}

export interface VenueSlot1 {
  id: number;
  venueId: number;
  date: string;           // start date 'YYYY-MM-DD'
  endDate?: string;       // end date for multi-day slots 'YYYY-MM-DD'
  startTime: string;      // '09:00'
  endTime: string;        // '22:00'
  price: number;
  available: boolean;
  slotType: 'fixed' | 'flexible' | 'multiday';
  durationDays?: number;  // only for multiday slots
  // Only present when slotType === 'flexible'
  flexConfig?: {
    windowStart: string;    // '10:00' — earliest possible start
    windowEnd: string;      // '22:00' — latest possible end
    minDurationHours: number;
    bufferMinutes: number;
    hourlyRate: number;
    bookedRanges?: { startTime: string; endTime: string }[];
  };

  // Set by the user when they customise a flexible slot
  selectedStartTime?: string;
  selectedDurationHours?: number;
}

export interface VenueManageSlot1 {
  id: number;
  startdate: string;
  enddate: string;
  start: string;
  end: string;
  price: number;
  slotType: 'fixed' | 'flexible';
  isBooked: boolean;
  bookedBy?: string;
  bookingStatus?: 'confirmed' | 'pending' | 'cancelled';
  guests?: number;

  // Only for flexible slots
  minDurationHours?: number;
  bufferMinutes?: number;
  hourlyRate?: number;
}

export interface VenueManage1 extends VenueAdmin {
  slots: VenueManageSlot[];
}

export interface VenueAdmin extends Venue1 {
  userName: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface VenueManageSlot {
  slotId: number;
  slotType: string;
  startDateTime: string;
  endDateTime: string;
  minSlotTime: string | null;
  maxSlotTime: string | null;

  minSlotPrice: number | null;
  bufferTime: string | null;
  totalSlotPrice: number;
  slotStatus?: string;
  createdAt: string;
  updatedAt: string;
  bookings: VenueBookings[]
  // // UI-only fields
  start?: string;
  end?: string;
  isBooked?: boolean;
  bookingStatus?: string;
  price?: number;
}

export interface VenueBookings
{
  bookingId: number,
  userId: number,
  userName: string,
  email: string,
  mobile: number,
  bookingStatus: string,
  startDateTime: string,
  endDateTime: string
}
export interface VenueManage {
  venueId: number;
  name: string;
  type: string;
  address: string;
  location: string;
  capacity: number;

  carParking: boolean;
  swimmingPool: boolean;
  outsideServicesAllowed: boolean;
  cateringProvided: boolean;

  additional: string;

  venueStatus: string;
  createdAt: string;
  updatedAt: string;

  slots: VenueManageSlot[];
  imagePaths: VenueImage[];

  // UI-only fields
  rating?: number;
  description?: string;
  images?: string[];
  imageUrl?: string;
}

export interface VenueDetailsDTO {
  venueId: number;
  name: string;
  type: string;
  location: string;
  address: string;
  capacity: number;

  carParking: boolean;
  swimmingPool: boolean;
  outsideServicesAllowed: boolean;
  cateringProvided: boolean;

  additional: string;

  imagePaths: VenueImageDTO[];
  slots: VenueSlotDTO[];
}

export interface VenueImageDTO {
  imageId: number;
  imagePath: string;
  profile: boolean;
}

export interface VenueSlotDTO {
  slotId: number;
  slotType: 'FIXED' | 'FLEXIBLE';

  startDateTime: string;
  endDateTime: string;

  minSlotTime?: number;
  maxSlotTime?: number;
  bufferTime?: number;

  minSlotPrice?: number;
  totalSlotPrice: number;
  slotStatus?: 'AVAILABLE' | 'BOOKED' | 'RESERVED' | 'EXPIRED';
  bookings?: UserBookingResponseDTO[];
}

export interface UserBookingResponseDTO {
  startDateTime: string;
  endDateTime: string;
  bookingStatus: string;
}

export interface SelectedSlot {
  slot: VenueSlotDTO;
  selectedStartDateTime: string;
  selectedEndDateTime: string;
  selectedDurationMinutes: number;
  calculatedPrice: number;
}

export interface VenueDashboardResponseDTO {
  venueId: number;
  name: string;
  type: string;
  location: string;
  address: string;
  imagePath: string;
  venueStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDashboardVenueDTO {
  venueId: number;
  name: string;
  imagePath: string;
  type: string;
  location: string;
  capacity: number;
}

export interface VenueSection {
  location: string;
  venues: UserDashboardVenueDTO[];
}

export interface VenueDashboardFilters {
  location?: string;
  type?: string;
  venueStatus?: string; // 'PENDING' | 'APPROVED' | 'REJECTED'
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}
