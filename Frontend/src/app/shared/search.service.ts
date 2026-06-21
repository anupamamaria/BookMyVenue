import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Venue } from './models/venue';
import { VenueService } from '../venues/venueservice';

@Injectable({ providedIn: 'root' })
export class SearchService {
  searchTerm = '';
  searchLocation = '';
  searchGuests: number | null = null;
  showFilters = false;
  filterSwimmingPool = false;
  filterOutsideCatering = false;
  filterCarParking = false;

  isSearchActive$ = new BehaviorSubject<boolean>(false);
  searchResults$ = new BehaviorSubject<Venue[]>([]);

  constructor(private venueService: VenueService) {}

  performSearch(): void {
    if (!this.searchTerm.trim() && !this.searchLocation.trim() && !this.searchGuests &&
        !this.filterSwimmingPool && !this.filterOutsideCatering && !this.filterCarParking) {
      this.isSearchActive$.next(false);
      return;
    }
    this.isSearchActive$.next(true);
    this.venueService.searchVenues(
      this.searchTerm,
      this.searchLocation,
      this.searchGuests || 0,
      {
        swimmingPool: this.filterSwimmingPool,
        outsideCateringAllowed: this.filterOutsideCatering,
        carParking: this.filterCarParking
      }
    ).subscribe((results: Venue[]) => this.searchResults$.next(results));
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchLocation = '';
    this.searchGuests = null;
    this.filterSwimmingPool = false;
    this.filterOutsideCatering = false;
    this.filterCarParking = false;
    this.showFilters = false;
    this.isSearchActive$.next(false);
    this.searchResults$.next([]);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onFilterChange(): void {
    if (this.isSearchActive$.value) this.performSearch();
  }
}
