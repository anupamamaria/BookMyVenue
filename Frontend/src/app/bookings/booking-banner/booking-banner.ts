import { Component, Input } from '@angular/core';
import { Booking } from '../../shared/models/booking';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-booking-banner',
  imports: [CommonModule],
  templateUrl: './booking-banner.html',
  styleUrl: './booking-banner.scss',
})
export class BookingBanner {
  @Input() booking!:Booking;
}
