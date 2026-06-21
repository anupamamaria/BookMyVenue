  import { Injectable } from '@angular/core';
  import { Observable, of } from 'rxjs';
  import { Booking } from '../shared/models/booking';

  @Injectable({
    providedIn: 'root'
  })
  export class BookingService {

    constructor() { }

    // Mock data - replace with actual API calls
    private mockBookings: Booking[] = [
      {
        id: 1,
        venueId: 101,
        venueName: 'Grand Ballroom',
        venueLocation: 'Kochi',
        venueImageUrl: 'https://images.unsplash.com/photo-1519167758481-83f29da8aef8?w=800',
        userId: 1,
        userName: 'John Doe',
        bookingDate: '2026-08-15',
        startTime: '18:00',
        endTime: '23:00',
        totalPrice: 2500,
        status: 'confirmed',
        guests: 150,
        specialRequests: 'Need audio system setup',
        createdAt: '2026-06-01T10:00:00Z'
      },
      {
        id: 2,
        venueId: 102,
        venueName: 'Sunset Garden',
        venueLocation: 'Kochi',
        venueImageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        userId: 1,
        userName: 'John Doe',
        bookingDate: '2026-05-20',
        startTime: '14:00',
        endTime: '18:00',
        totalPrice: 1200,
        status: 'completed',
        guests: 80,
        specialRequests: '',
        createdAt: '2026-04-15T10:00:00Z'
      },
      {
        id: 3,
        venueId: 103,
        venueName: 'Modern Conference Hall',
        venueLocation: 'Munnar',
        venueImageUrl: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
        userId: 1,
        userName: 'John Doe',
        bookingDate: '2026-04-10',
        startTime: '09:00',
        endTime: '17:00',
        totalPrice: 1800,
        status: 'completed',
        guests: 100,
        specialRequests: 'Projector and whiteboard needed',
        createdAt: '2026-03-20T10:00:00Z'
      },
      {
        id: 4,
        venueId: 104,
        venueName: 'Rooftop Terrace',
        venueLocation: 'Munnar',
        venueImageUrl: '',
        userId: 1,
        userName: 'John Doe',
        bookingDate: '2026-07-04',
        startTime: '19:00',
        endTime: '23:00',
        totalPrice: 3200,
        status: 'confirmed',
        guests: 200,
        specialRequests: 'Outdoor lighting and catering setup',
        createdAt: '2026-05-25T10:00:00Z'
      },
      {
        id: 5,
        venueId: 105,
        venueName: 'Elegant Banquet Hall',
        venueLocation: 'Wayanad',
        venueImageUrl: 'https://images.unsplash.com/photo-1519167758481-83f29da8aef8?w=800',
        userId: 1,
        userName: 'John Doe',
        bookingDate: '2026-03-15',
        startTime: '17:00',
        endTime: '22:00',
        totalPrice: 2800,
        status: 'completed',
        guests: 120,
        specialRequests: 'NA',
        createdAt: '2026-02-10T10:00:00Z'
      }
  ];

  getUserBookings(): Observable<Booking[]> {
    // TODO: Replace with actual HTTP call
    // return this.http.get<Booking[]>('/api/bookings/user');
    return of(this.mockBookings);
  }

  getUpcomingBookings(): Observable<Booking[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = this.mockBookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= today && (booking.status === 'confirmed' || booking.status === 'pending');
    });
    
    return of(upcoming);
  }

  getPastBookings(): Observable<Booking[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const past = this.mockBookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate < today || booking.status === 'completed' || booking.status === 'cancelled';
    });
    
    return of(past);
  }

  cancelBooking(bookingId: number): Observable<boolean> {
    // TODO: Replace with actual HTTP call
    // return this.http.post<boolean>(`/api/bookings/${bookingId}/cancel`, {});
    const booking = this.mockBookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'cancelled';
    }
    return of(true);
  }
}
