import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VenueAdmin } from '../../shared/models/venue';
import { AdminDashboardService } from '../../admin-dashboard/admin-dashboardservice';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Authservice } from '../../auth/authservice';
import { Navbar } from '../../shared/navbar/navbar';
import { Loader } from '../../shared/loader/loader';

@Component({
  selector: 'app-venue-list',
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule,
            MatPaginatorModule, MatSelectModule, MatFormFieldModule, FormsModule, Navbar, Loader],
  templateUrl: './venue-list.html',
  styleUrl: './venue-list.scss',
})
export class VenueList implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  allVenues: VenueAdmin[] = [];
  filteredVenues: VenueAdmin[] = [];
  pagedVenues: VenueAdmin[] = [];

  pageSize = 10;
  pageIndex = 0;

  filterLocation = '';
  filterType = '';
  filterStatus = '';
  filtersOpen = false;
  loading = signal(false);

  locations: string[] = [];
  venueTypes = [
    { value: 'auditorium',     label: 'Auditorium' },
    { value: 'exhibitionHall', label: 'Exhibition Hall' },
    { value: 'cafe',           label: 'Cafe' },
  ];
  statuses: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected'];

  constructor(private venueService: AdminDashboardService, private authService: Authservice) {}

  ngOnInit(): void {
    this.loading.set(true);
    const userName = this.authService.currentUser?.name ?? 'user1';
    this.venueService.getVenues(userName).subscribe({
      next: (venues) => {
        this.allVenues = venues;
        this.locations = [...new Set(venues.map(v => v.location))].sort();
        this.applyFilters();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching venues:', error);
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.filteredVenues = this.allVenues.filter(v => {
      const matchLocation = !this.filterLocation || v.location === this.filterLocation;
      const matchType     = !this.filterType     || v.venueType === this.filterType;
      const matchStatus   = !this.filterStatus   || v.status    === this.filterStatus;
      return matchLocation && matchType && matchStatus;
    });
    this.pageIndex = 0;
    if (this.paginator) this.paginator.firstPage();
    this.updatePage();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize  = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePage();
  }
  
  get activeFilterSummary(): string {
    const parts: string[] = [];
    if (this.filterLocation) parts.push(this.filterLocation);
    if (this.filterType) {
      const t = this.venueTypes.find(v => v.value === this.filterType);
      parts.push(t?.label ?? this.filterType);
    }
    if (this.filterStatus) parts.push(this.filterStatus.charAt(0).toUpperCase() + this.filterStatus.slice(1));
    return parts.join(' · ');
  }

  updatePage(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedVenues = this.filteredVenues.slice(start, start + this.pageSize);
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
