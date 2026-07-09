import { Component, OnInit, ElementRef, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenueService } from '../venues/venueservice';
import { SearchService } from '../shared/search.service';
import { UserDashboardVenueDTO, Venue, Venue1, VenueSection } from '../shared/models/venue';
import { VenueCard } from '../venues/venue-card/venue-card';
import { NavbarHome } from '../shared/navbar-home/navbar-home';
import { Authservice } from '../auth/authservice';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { Booking } from '../shared/models/booking';
import { BookingService } from '../bookings/bookingservice';
import { BookingBanner } from '../bookings/booking-banner/booking-banner';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, VenueCard, NavbarHome, BookingBanner],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})

export class Dashboard  implements OnInit {
  sections = signal<VenueSection[]>([]);
  isSearchActive$!: BehaviorSubject<boolean>;
  searchResults$!: BehaviorSubject<UserDashboardVenueDTO[]>;
  upcomingBooking = signal<Booking | null>(null);
  private isFirstRun = true;

  constructor(
    private venueService: VenueService,
    private search: SearchService,
    private el: ElementRef,
    private authService:Authservice,
    private bookingService: BookingService
  ) {
    this.isSearchActive$ = this.search.isSearchActive$;
    this.searchResults$ = this.search.searchResults$;
    effect(() => {
      this.authService.loggedIn(); // read the signal so the effect tracks it

      if (this.isFirstRun) {
        this.isFirstRun = false; // skip the run that fires immediately on creation
        return;
      }

      this.loadDashboard();
    });
  }

  ngOnInit(): void { 
    this.loadDashboard();
  }

  loadDashboard(): void {
    const dashboardRequest = this.venueService.getUserDashboardVenues();
    const upcomingBookingRequest = this.isLoggedIn ? this.bookingService.getUpcomingBooking() : of(null);
    forkJoin({
      dashboard: dashboardRequest,
      upcomingBooking: upcomingBookingRequest
    }).subscribe({
      next: ({ dashboard, upcomingBooking }) => {
      
        const grouped = dashboard.content.reduce((acc, venue) => {
          let section = acc.find(s => s.location === venue.location);
        
          if (!section) {
            section = {
              location: venue.location,
              venues: []
            };
            acc.push(section);
          }
        
          section.venues.push(venue);
          return acc;
        }, [] as VenueSection[]);
      
        this.sections.set(grouped);
        this.upcomingBooking.set(upcomingBooking);
      }
    });

  }
  get isLoggedIn(): boolean {
    return this.authService.loggedIn();
  }

  scroll(trackId: string, direction: 'left' | 'right'): void {
    const track = this.el.nativeElement.querySelector(`#${trackId}`);
    if (!track) return;
    const cardWidth = track.querySelector('.card-slide')?.offsetWidth || 280;
    const scrollAmount = (cardWidth + 24) * 4;
    track.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
  }
}
