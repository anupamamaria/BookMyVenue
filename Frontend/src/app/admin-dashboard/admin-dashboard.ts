import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { AdminDashboardService } from './admin-dashboardservice';
import { Navbar } from '../shared/navbar/navbar';
import { AdminDashboardResponse } from '../shared/models/admin';  
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule, MatButtonModule, MatTabsModule, Navbar, 
            MatIconModule, MatProgressSpinnerModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  pendingVenues = signal<AdminDashboardResponse[]>([]);
  approvedVenues = signal<AdminDashboardResponse[]>([]);
  rejectedVenues = signal<AdminDashboardResponse[]>([]);
  pendingPage = 0;
  approvedPage = 0;
  rejectedPage = 0;
  selectedTab = 0;

  pendingLastPage = false;
  approvedLastPage = false;
  rejectedLastPage = false;
  loading = signal(false);
  pendingLoading = signal(false);
  approvedLoading = signal(false);
  rejectedLoading = signal(false);
  pendingLoaded = false;
  approvedLoaded = false;
  rejectedLoaded = false;
  pendingTotal = signal(0);
  approvedTotal = signal(0);
  rejectedTotal = signal(0);
  readonly pageSize = 10;

  constructor(private adminService: AdminDashboardService) { }

  ngOnInit(): void {
    this.loading.set(true);
    this.getStatusCount();
    this.loadPending();
  }
  
  getStatusCount(){
    this.adminService.getStatusCount().subscribe({
      next: response => {
        this.pendingTotal.set(response.pending);  
        this.approvedTotal.set(response.approved);
        this.rejectedTotal.set(response.rejected);
      }
    });
  }
  onTabChanged(index: number) {
    this.selectedTab = index;
    switch (index) {

      case 0:
        if (!this.pendingLoaded) {
          this.loading.set(true);
          this.loadPending();
        }
        break;

      case 1:
        if (!this.approvedLoaded) {
          this.loading.set(true);
          this.loadApproved();
        }
        break;

      case 2:
        if (!this.rejectedLoaded) {
          this.loading.set(true);
          this.loadRejected();
        }
        break;
    }

  }
  @HostListener('window:scroll')
  onWindowScroll() {
  
    const scrollPosition =
      window.innerHeight + window.scrollY;
  
    const pageHeight =
      document.documentElement.scrollHeight;
  
    if (scrollPosition < pageHeight - 50) {
      return;
    }
  
    switch (this.selectedTab) {
    
      case 0:
        this.loadPending();
        break;
    
      case 1:
        this.loadApproved();
        break;
    
      case 2:
        this.loadRejected();
        break;
    }
  }

  loadPending() {

    if (this.pendingLastPage || this.pendingLoading()) {
      return;
    }
  
    this.pendingLoading.set(true);
    setTimeout(() => {
    this.adminService.getPendingVenues(this.pendingPage, this.pageSize).subscribe({       
      next: response => {  
        this.pendingVenues.update(v => [
          ...v,
          ...response.content
        ]);
          
        this.pendingPage++;
        this.pendingLastPage = response.last;
        this.pendingLoaded = true;
        this.pendingTotal.set(response.totalElements);
      },
        
      complete: () => {
        this.pendingLoading.set(false);
        this.loading.set(false);
      }
    });}, 1000);  
  }

  loadApproved() {

    if (this.approvedLastPage || this.approvedLoading()) {
      return;
    }

    this.approvedLoading.set(true);
    setTimeout(() => {
    this.adminService.getApprovedVenues(this.approvedPage, this.pageSize).subscribe({
      next: response => {
        this.approvedVenues.update(v => [
          ...v,
          ...response.content
        ]);

        this.approvedPage++;
        this.approvedLastPage = response.last;
        this.approvedLoaded = true;
        console.log(response.totalElements);
        this.approvedTotal.set(response.totalElements);
      },

      complete: () => {
        this.approvedLoading.set(false);
        this.loading.set(false);
      }
    });}, 1000);
  }

  loadRejected() {
    if (this.rejectedLastPage || this.rejectedLoading()) {
      return;
    }

    this.rejectedLoading.set(true);
    setTimeout(() => {
    this.adminService.getRejectedVenues(this.rejectedPage, this.pageSize).subscribe({
      next: response => {
        this.rejectedVenues.update(v => [
          ...v,
          ...response.content
        ]);

        this.rejectedPage++;
        this.rejectedLastPage = response.last;
        this.rejectedLoaded = true;
        this.rejectedTotal.set(response.totalElements);
      },
          
      complete: () => {
        this.rejectedLoading.set(false);
        this.loading.set(false);
      }
    });},1000);   
  }

  approve(data: AdminDashboardResponse) {
    // Add to approved
    this.adminService.approveVenue(data.venueId).subscribe(() => {
      this.pendingVenues.update(venues =>
        venues.filter(x => x.venueId !== data.venueId)
      );
      this.pendingTotal.update(x => x - 1);
      this.approvedTotal.update(x => x + 1);
      this.approvedVenues.set([]);
      this.approvedPage = 0;
      this.approvedLastPage = false;
      this.approvedLoaded = false;
    });
  }

  reject(data: AdminDashboardResponse) {
    // Add to rejected
    this.adminService.rejectVenue(data.venueId).subscribe(() => {
      this.pendingVenues.update(venues =>
        venues.filter(x => x.venueId !== data.venueId)
      );
      console.log('Current pending venues:', this.pendingVenues());
      this.pendingTotal.update(x => x - 1);
      this.rejectedTotal.update(x => x + 1);
      this.rejectedVenues.set([]);
      this.rejectedPage = 0;
      this.rejectedLastPage = false;
      this.rejectedLoaded = false;
      console.log('Current rejected venues:', this.rejectedVenues());
    });
  }
}
