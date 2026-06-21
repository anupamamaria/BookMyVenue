export interface Venue {
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

export interface VenueSlot {
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
}

export interface VenueAdmin extends Venue {
  address?: string;
  userName: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface VenueManageSlot {
  id: number;
  startdate: string;   // 'YYYY-MM-DD'
  enddate: string;     // 'YYYY-MM-DD'
  start: string;       // '09:00'
  end: string;         // '18:00'
  price: number;
  slotType: 'fixed' | 'flexible';
  isBooked: boolean;
  bookedBy?: string;
  bookingStatus?: 'confirmed' | 'pending' | 'cancelled';
  guests?: number;
}

export interface VenueManage extends VenueAdmin {
  slots: VenueManageSlot[];
}
