  import { Injectable } from '@angular/core';
  import { Observable, of } from 'rxjs';
  import { Booking } from '../shared/models/booking';
import { HttpClient } from '@angular/common/http';

  @Injectable({
    providedIn: 'root'
  })
  export class BookingService {
    private baseUrl = 'http://localhost:8080/'
    constructor(private http: HttpClient) { }

    getAllBookings():Observable<Booking[]>
    {
      return this.http.get<Booking[]>(`${this.baseUrl}user/bookings`);
    }

    getUpcomingBooking():Observable<Booking>
    {
      return this.http.get<Booking>(`${this.baseUrl}user/upcoming-booking`)
    }

  }
