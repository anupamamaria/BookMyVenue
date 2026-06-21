import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VenueManage, VenueManageSlot } from '../../shared/models/venue';
import { VenueService } from '../venueservice';

interface SlotDateGroup {
  dateIso: string;
  endDateIso: string;
  isMultiDay: boolean;
  slots: VenueManageSlot[];
}

@Component({
  selector: 'app-venue-manage',
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './venue-manage.html',
  styleUrl: './venue-manage.scss',
})
export class VenueManagement implements OnInit {
  venue?: VenueManage;
  slotGroups: SlotDateGroup[] = [];
  heroImages: string[] = [];
  heroIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private service: VenueService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getVenueManage(id).subscribe(v => {
      this.venue = v;
      this.buildGroups(v.slots);
      this.heroImages = (v.images && v.images.length > 0) ? v.images : [v.imageUrl];
      this.heroIndex = 0;
    });
  }

  heroPrev(): void {
    this.heroIndex = (this.heroIndex - 1 + this.heroImages.length) % this.heroImages.length;
  }
  
  heroNext(): void {
    this.heroIndex = (this.heroIndex + 1) % this.heroImages.length;
  }

  private buildGroups(slots: VenueManageSlot[]): void {
    const map = new Map<string, VenueManageSlot[]>();
    for (const slot of slots) {
      if (!map.has(slot.startdate)) map.set(slot.startdate, []);
      map.get(slot.startdate)!.push(slot);
    }
    this.slotGroups = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateIso, slots]) => ({
        dateIso,
        endDateIso: slots[0].enddate,
        isMultiDay: slots[0].startdate !== slots[0].enddate,
        slots,
      }));
  }

  get amenityList(): { icon: string; label: string }[] {
    if (!this.venue?.amenities) return [];
    const list: { icon: string; label: string }[] = [];
    if (this.venue.amenities.swimmingPool)         list.push({ icon: 'pool',           label: 'Swimming Pool' });
    if (this.venue.amenities.carParking)            list.push({ icon: 'local_parking',  label: 'Car Parking' });
    if (this.venue.amenities.outsideCateringAllowed) list.push({ icon: 'restaurant',    label: 'Outside Catering' });
    return list;
  }

  get totalSlots(): number {
     return this.venue?.slots.length ?? 0; 
  }

  get bookedSlots(): number { 
    return this.venue?.slots.filter(s => s.isBooked).length ?? 0; 
  }
  
  get availableSlots(): number { 
    return this.totalSlots - this.bookedSlots; 
 }
  
  get totalRevenue(): number {
    return this.venue?.slots.filter(s => s.isBooked).reduce((sum, s) => sum + s.price, 0) ?? 0;
  }

  venueTypeLabel(type?: string): string {
    const map: Record<string, string> = {
      auditorium: 'Auditorium',
      exhibitionHall: 'Exhibition Hall',
      cafe: 'Cafe',
    };
    return type ? (map[type] ?? type) : '—';
  }

  bookingStatusColor(status?: string): string {
    return ({ confirmed: '#1b7f38', pending: '#b35a00', cancelled: '#a72020' } as Record<string, string>)[status ?? ''] ?? '#888';
  }
}

