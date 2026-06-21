import { Component, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenueService } from '../venues/venueservice';
import { SearchService } from '../shared/search.service';
import { Venue } from '../shared/models/venue';
import { VenueCard } from '../venues/venue-card/venue-card';
import { NavbarHome } from '../shared/navbar-home/navbar-home';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, VenueCard, NavbarHome],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard  implements OnInit {
  featuredVenues: Venue[] = [];
  wayanadVenues: Venue[] = [];
  kochiVenues: Venue[] = [];
  munnarVenues: Venue[] = [];
  isSearchActive$!: import('rxjs').BehaviorSubject<boolean>;
  searchResults$!: import('rxjs').BehaviorSubject<Venue[]>;

  constructor(
    private venueService: VenueService,
    private search: SearchService,
    private el: ElementRef
  ) {
    this.isSearchActive$ = this.search.isSearchActive$;
    this.searchResults$ = this.search.searchResults$;
  }

  ngOnInit(): void {
    this.venueService.getFeaturedVenues().subscribe(v => this.featuredVenues = v);
    this.venueService.getVenuesByLocation('Wayanad').subscribe(v => this.wayanadVenues = v);
    this.venueService.getVenuesByLocation('Kochi').subscribe(v => this.kochiVenues = v);
    this.venueService.getVenuesByLocation('Munnar').subscribe(v => this.munnarVenues = v);
  }

  scroll(trackId: string, direction: 'left' | 'right'): void {
    const track = this.el.nativeElement.querySelector(`#${trackId}`);
    if (!track) return;
    const cardWidth = track.querySelector('.card-slide')?.offsetWidth || 280;
    const scrollAmount = (cardWidth + 24) * 4;
    track.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
  }
}
