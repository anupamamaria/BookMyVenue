import { Injectable } from '@angular/core';
import { PageResponse, VenueAdmin, VenueManage, VenueManageSlot } from '../shared/models/venue';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AdminDashboardResponse } from '../shared/models/admin';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private adminBaseUrl = 'http://localhost:8080/admin/';
  
  constructor(private http: HttpClient) { }
  
  getStatusCount(): Observable<any> {
    return this.http.get<any>(`${this.adminBaseUrl}venue-status-count`);
  }
  getApprovedVenues(pageNumber: number, pageSize: number): Observable<PageResponse<AdminDashboardResponse>> {
     let params = new HttpParams()
    .set('venueStatus', 'APPROVED')
    .set('page', pageNumber)
    .set('size', pageSize);
    return this.http.get<PageResponse<AdminDashboardResponse>>(`${this.adminBaseUrl}dashboard`,{ params });
  }
  
  getRejectedVenues(pageNumber: number, pageSize: number): Observable<PageResponse<AdminDashboardResponse>> {
     let params = new HttpParams()
    .set('venueStatus', 'REJECTED')
    .set('page', pageNumber)
    .set('size', pageSize);
    return this.http.get<PageResponse<AdminDashboardResponse>>(`${this.adminBaseUrl}dashboard`,{ params });
  }

  getPendingVenues(pageNumber: number, pageSize: number): Observable<PageResponse<AdminDashboardResponse>> {
     let params = new HttpParams()
    .set('venueStatus', 'PENDING')
    .set('page', pageNumber)
    .set('size', pageSize);
    return this.http.get<PageResponse<AdminDashboardResponse>>(`${this.adminBaseUrl}dashboard`,{ params });
  }
  
  approveVenue(venueId: number): Observable<any> {
    const AdminReviewVenueRequestDTO = {
      venueStatus: 'APPROVED',
    }
    return this.http.patch(`${this.adminBaseUrl}venue/${venueId}/review`, AdminReviewVenueRequestDTO, { responseType: 'text' as 'text'});
  }

  rejectVenue(venueId: number): Observable<any> {
    const AdminReviewVenueRequestDTO = {
      venueStatus: 'REJECTED',
    }
    return this.http.patch(`${this.adminBaseUrl}venue/${venueId}/review`, AdminReviewVenueRequestDTO, { responseType: 'text' as 'text'});
  }

  // getVenues(userName: string): Observable<VenueAdmin[]> {
  //   return of(this.venues.filter(v => v.userName === userName));
  // } 
}
