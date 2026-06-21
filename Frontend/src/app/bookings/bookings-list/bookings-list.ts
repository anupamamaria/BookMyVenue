import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { Booking } from '../../shared/models/booking';
import { BookingService } from '../bookingservice';

@Component({
  selector: 'app-bookings-list',
  imports: [CommonModule, RouterModule, MatButtonModule, MatTabsModule],
  templateUrl: './bookings-list.html',
  styleUrl: './bookings-list.scss',
})
export class BookingsList implements OnInit {
  upcomingBookings: Booking[] = [];
  pastBookings: Booking[] = [];

  constructor(private bookingService: BookingService) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.bookingService.getUpcomingBookings().subscribe(bookings => {
      this.upcomingBookings = bookings;
    });

    this.bookingService.getPastBookings().subscribe(bookings => {
      this.pastBookings = bookings;
    });
  }

  cancelBooking(booking: Booking): void {
    if (confirm(`Are you sure you want to cancel your booking for ${booking.venueName}?`)) {
      this.bookingService.cancelBooking(booking.id).subscribe(() => {
        // Refresh bookings after cancellation
        this.loadBookings();
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  canCancelBooking(booking: Booking): boolean {
    const bookingDate = new Date(booking.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Can only cancel confirmed bookings that are in the future
    return booking.status === 'confirmed' && bookingDate >= today;
  }
}

