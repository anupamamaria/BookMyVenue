export interface Booking {
  bookingId: number,
  venueName: string,
  location: string,
  startDateTime: string,
  endDateTime: string,
  totalPrice: number,
  bookingStatus?: string,
  imagePath?:string
}

export const RazorPayment = {
  razorpayKey: 'rzp_test_T71Ifrp2xFrEPh',
};

export interface BookingRequestDTO {
  venueId: number;
  slotId: number;
  startDateTime: string; // ISO date string
  endDateTime: string;
}

export interface OrderRequestDTO {
  bookingId: number;
}