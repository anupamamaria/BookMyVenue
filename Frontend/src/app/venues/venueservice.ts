import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venue, VenueManage, VenueManageSlot, VenueSlot, VenueDashboardResponseDTO, PageResponse, 
         UserDashboardVenueDTO, VenueDetailsDTO, VenueSlotDTO, VenueDashboardFilters, 
         VenueBookingResponseDTO } from '../shared/models/venue';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BookingRequestDTO, OrderRequestDTO } from '../shared/models/booking';
import { DashboardFilters } from '../shared/models/user';

@Injectable({
  providedIn: 'root',
})
export class VenueService {
  private baseUrl: string='';
  
  constructor(private http: HttpClient) {
    this.baseUrl = 'http://localhost:8080/';
  }
 
  getVenueDashboard(page: number = 0,size: number = 10,filters: VenueDashboardFilters = {}): Observable<PageResponse<VenueDashboardResponseDTO>> {
    let params = new HttpParams()
    .set('page', page)
    .set('size', size);

    (Object.keys(filters) as (keyof VenueDashboardFilters)[]).forEach(key => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value);
      }
    });
    return this.http.get<PageResponse<VenueDashboardResponseDTO>>(
      `${this.baseUrl}venue/dashboard`, { params }
    );
  }

  getUserDashboardVenues(page: number = 0, size: number = 10,filters: DashboardFilters = {}): Observable<PageResponse<UserDashboardVenueDTO>> {
     let params = new HttpParams()
    .set('page', page)
    .set('size', size);

    (Object.keys(filters) as (keyof DashboardFilters)[]).forEach(key => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<PageResponse<UserDashboardVenueDTO>>(
      `${this.baseUrl}user/dashboard`, { params });
  }

  

  getVenueById(id: number, startDate: string , endDate: string): Observable<VenueDetailsDTO | undefined> {
    return this.http.get<VenueDetailsDTO>(
        `${this.baseUrl}user/venues/${id}?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getVenueSlotsById(id: number, startDate: string , endDate: string): Observable<VenueSlotDTO[]> {
    return this.http.get<VenueSlotDTO[]>(
        `${this.baseUrl}user/venues/${id}/slots?startDate=${startDate}&endDate=${endDate}`
    );
  }

  createBooking(bookingRequest: BookingRequestDTO): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}booking`, bookingRequest);
  }

  getFlexibleSlotPrice(slotId:number, startDateTime: string, endDateTime: string): Observable<any>{
    return this.http.get(`${this.baseUrl}user/${slotId}/price?startDateTime=${startDateTime}&endDateTime=${endDateTime}`, {responseType: 'text'})
  }

  getVenueManage(id: number): Observable<VenueManage> {
   return this.http.get<VenueManage>(`${this.baseUrl}venue/details/${id}`);
  }
  
  updateSlot(venueId: number, slotId: number, slotData: any,  dryRun: boolean): Observable<any> {
    const params = new HttpParams().set('dryRun', String(dryRun));
    return this.http.put(`${this.baseUrl}venue/${venueId}/slot/${slotId}`, slotData, { params, responseType: 'text' });
  }

  createVenue(venueData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}venue`, venueData, { responseType: 'text' });
  }

  createSlot(venueId: number, slotData: any, dryRun: boolean): Observable<any> {
    const params = new HttpParams().set('dryRun', String(dryRun));
    return this.http.post(`${this.baseUrl}venue/${venueId}/slot`, slotData, { params, responseType: 'text' });
  }

  createSlotsBulk(venueId: number, slotData: any, dryRun: boolean): Observable<any> {
    const params = new HttpParams().set('dryRun', String(dryRun));
    return this.http.post(`${this.baseUrl}venue/${venueId}/slots/bulk`, slotData, { params, responseType: 'text' });
  }

  deleteSlot(slotId: number,venueId:number): Observable<any>
  {
    return this.http.delete(`${this.baseUrl}venue/${venueId}/slots/${slotId}`, {responseType:'text'});
  }
  
  blockSlot(slotId: number,venueId:number): Observable<any>
  {
    return this.http.patch(`${this.baseUrl}venue/${venueId}/slots/${slotId}/block`, null, {responseType:'text'});
  }
  
  unBlockSlot(slotId: number,venueId:number): Observable<any>
  {
    return this.http.patch(`${this.baseUrl}venue/${venueId}/slots/${slotId}/unblock`, null,  {responseType:'text'});
  }

  uploadImages(venueId: number, images: File[], profileIndex: number): Observable<any> {
    const formData = new FormData();
    images.forEach(file => {
      formData.append('images', file);
    });

    formData.append('profileIndex', profileIndex.toString());
    return this.http.post(`${this.baseUrl}venue/${venueId}/images`,formData,{ responseType: 'text' });
  }

  getUpcomingBookings(venueId: number, page = 0, size = 10): Observable<PageResponse<VenueBookingResponseDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<VenueBookingResponseDTO>>(
      `${this.baseUrl}venue/${venueId}/upcoming-bookings`, { params }
    );
  }

  getPastBookings(venueId: number, page = 0, size = 10): Observable<PageResponse<VenueBookingResponseDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<VenueBookingResponseDTO>>(
      `${this.baseUrl}venue/${venueId}/past-bookings`, { params }
    );
  }

}
