import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { VenueAdmin } from '../shared/models/venue';
import { AdminDashboardService } from './admin-dashboardservice';
import { Navbar } from '../shared/navbar/navbar';


@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule, MatButtonModule, MatTabsModule, Navbar],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  pendingVenues: VenueAdmin[] = [];
  approvedVenues: VenueAdmin[] = [];
  rejectedVenues: VenueAdmin[] = [];

  constructor(private adminService: AdminDashboardService) { }

  ngOnInit(): void {
    this.adminService.getPendingVenues().subscribe(v => this.pendingVenues = v);
    this.adminService.getApprovedVenues().subscribe(v => this.approvedVenues = v);
    this.adminService.getRejectedVenues().subscribe(v => this.rejectedVenues = v);
  }


  approve(data: VenueAdmin) {
    this.pendingVenues = this.pendingVenues.filter(x => x.id !== data.id);

    // Add to approved
    this.approvedVenues = [...this.approvedVenues, data]; // new array reference

  }

  reject(data: VenueAdmin) {
    this.pendingVenues = this.pendingVenues.filter(x => x.id !== data.id);

    // Add to rejected
    this.rejectedVenues = [...this.rejectedVenues, data]; // new array reference
  }

}
