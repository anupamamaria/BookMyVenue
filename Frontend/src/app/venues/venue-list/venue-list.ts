import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VenueDashboardFilters, VenueDashboardResponseDTO } from '../../shared/models/venue';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Authservice } from '../../auth/authservice';
import { Navbar } from '../../shared/navbar/navbar';
import { Loader } from '../../shared/loader/loader';
import { VenueService } from '../venueservice';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-venue-list',
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule,
            MatSelectModule, MatFormFieldModule, FormsModule,MatProgressSpinnerModule, 
            Navbar, Loader],
  templateUrl: './venue-list.html',
  styleUrl: './venue-list.scss',
})
export class VenueList implements OnInit {

  venues = signal<VenueDashboardResponseDTO[]>([]);
  page = 0;
  readonly pageSize = 10;
  totalElements = 0;
  lastPage = false;
  loading = signal(false);
  loadingMore = signal(false);
  filterLocation = '';
  filterType = '';
  filterStatus = '';
  filtersOpen = false;

  locations: string[] = [];
  

  constructor(private venueService: VenueService, private authService: Authservice) {
  }

  ngOnInit(): void {
    this.loadVenues();
  }

  loadVenues() {
    if (this.lastPage || this.loadingMore()) {
      return;
    }

    if (this.page === 0) {
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    const filters: VenueDashboardFilters = {
      location: this.filterLocation || undefined,
      type: this.filterType || undefined,
      venueStatus: this.filterStatus || undefined,
    };
    
    setTimeout(() => {
    this.venueService.getVenueDashboard(this.page,this.pageSize, filters).subscribe({
      next: response => {
        this.venues.update(v => [
          ...v,
          ...response.content
        ]);
        
        this.lastPage = response.last;
        this.page = response.number + 1;
        this.totalElements = response.totalElements;
      },

      complete: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
      }

    })}, 1000);

  }

  applyFilters(): void {
    this.page = 0;
    this.lastPage = false;
    
    this.venues.set([]);
    this.loadVenues();
  }

  onSearch(event: { location: string; type: string; status: string }): void {
    this.filterLocation = event.location;
    this.filterType = event.type;
    this.filterStatus = event.status;
    this.applyFilters();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
  
    const scrollPosition =
      window.innerHeight + window.scrollY;
  
    const pageHeight =
      document.documentElement.scrollHeight;
  
    if (scrollPosition >= pageHeight - 50) {
      this.loadVenues();
    }
  }

  clearFilters(): void {
    this.filterLocation = '';
    this.filterType     = '';
    this.filterStatus   = '';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(this.filterLocation || this.filterType || this.filterStatus);
  }
}
