import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { Booking } from '../../shared/models/booking';
import { BookingService } from '../bookingservice';
import { Navbar } from '../../shared/navbar/navbar';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarModule, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Loader } from '../../shared/loader/loader';

@Component({
  selector: 'app-bookings-list',
  imports: [CommonModule, RouterModule, MatButtonModule, MatTabsModule,Navbar, MatSnackBarModule, Loader],
  templateUrl: './bookings-list.html',
  styleUrl: './bookings-list.scss',
})
export class BookingsList implements OnInit {
  upcomingBookings = signal<Booking[]>([]);
  pastBookings = signal<Booking[]>([]);
  loading = signal(false);
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  constructor(private bookingService: BookingService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    const now = new Date();
    this.bookingService.getAllBookings().subscribe({
      next : bookings => {
        this.pastBookings.set(bookings.filter(booking =>
          new Date(booking.startDateTime) < now
        ));
      
        this.upcomingBookings.set(bookings.filter(booking =>
          new Date(booking.startDateTime) >= now
        ));

        this.loading.set(false);
      },
      error: ()=> {
        this.snackBar.open("Some error in getting bookings","",{
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 3000,
        })
      },
    });

  }

  cancelBooking(booking: Booking): void {
    if (confirm(`Are you sure you want to cancel your booking for ${booking.venueName}?`)) {
      // this.bookingService.cancelBooking(booking.id).subscribe(() => {
      //   // Refresh bookings after cancellation
      //   this.loadBookings();
      // });
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

  getStatusClass(status: string | undefined): string {
    if (!status)
      return 'confirmed';
    return status.toLowerCase();
  }

  canCancelBooking(booking: Booking): boolean {
    // const bookingDate = new Date(booking.bookingDate);
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    
    // // Can only cancel confirmed bookings that are in the future
    // return booking.status === 'confirmed' && bookingDate >= today;
    return false;
  }
}

