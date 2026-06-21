export interface Booking {
  id: number;
  venueId: number;
  venueName: string;
  venueLocation: string;
  venueImageUrl: string;
  userId: number;
  userName: string;
  bookingDate: string; // ISO date string
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  guests: number;
  specialRequests?: string;
  createdAt: string;
}
