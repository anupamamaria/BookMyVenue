import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VenueService } from '../venues/venueservice';
import { UserDashboardVenueDTO } from './models/venue'; // adjust path to wherever this DTO lives
import { DashboardFilters } from './models/user';

@Injectable({ providedIn: 'root' })
export class SearchService {
  // plain properties — bound via [(ngModel)] in the navbar template
  searchLocation = '';
  searchTerm = '';
  searchGuests: number | null = null;

  // signals — read/set via () and .set() in navbar-home.ts / .html
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

  showFilters = false;
  filterSwimmingPool = false;
  filterOutsideCatering = false;
  filterCarParking = false;

  isSearchActive$ = new BehaviorSubject<boolean>(false);
  searchResults$ = new BehaviorSubject<UserDashboardVenueDTO[]>([]);

  constructor(private venueService: VenueService) {}

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  formatLocalDate(date: Date | null): string | undefined {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  private buildFilters(): DashboardFilters {
    return {
      location: this.searchLocation || undefined,
      name: this.searchTerm || undefined,
      capacity: this.searchGuests ?? undefined,
      swimmingPool: this.filterSwimmingPool || undefined,
      carParking: this.filterCarParking || undefined,
      startDate: this.formatLocalDate(this.startDate()),
      endDate: this.formatLocalDate(this.endDate()),
    };
  }

  performSearch(): void {
    this.venueService.getUserDashboardVenues(0, 10, this.buildFilters())
      .subscribe(response => {
        this.searchResults$.next(response.content);
        this.isSearchActive$.next(true);
      });
  }

  onFilterChange(): void {
    // if a search is already active, refine it live as filters change
    if (this.isSearchActive$.value) {
      this.performSearch();
    }
  }

  clearSearch(): void {
    this.searchLocation = '';
    this.searchTerm = '';
    this.searchGuests = null;
    this.startDate.set(null);
    this.endDate.set(null);
    this.filterSwimmingPool = false;
    this.filterOutsideCatering = false;
    this.filterCarParking = false;
    this.showFilters = false;
    this.searchResults$.next([]);
    this.isSearchActive$.next(false);
  }
}