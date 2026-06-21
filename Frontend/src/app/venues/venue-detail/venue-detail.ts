import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { VenueService } from '../venueservice';
import { Authservice } from '../../auth/authservice';
import { Venue, VenueSlot } from '../../shared/models/venue';
import { Login } from '../../auth/login/login';

export interface SlotGroup {
  dateIso: string;
  label: string;
  isMultiDay: boolean;
  slots: VenueSlot[];
}

@Component({
  selector: 'app-venue-detail',
  imports: [
    CommonModule, RouterLink, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatDatepickerModule, MatFormFieldModule, MatInputModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './venue-detail.html',
  styleUrl: './venue-detail.scss',
})
export class VenueDetail  implements OnInit {
  venue?: Venue;

  readonly today: Date = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();
  startDate: Date | null = null;
  endDate: Date | null = null;
  slotGroups: SlotGroup[] = [];
  selectedSlot?: VenueSlot;
  slotsLoading = false;
  heroImages: string[] = [];
  heroIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private venueService: VenueService,
    private authService: Authservice,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.venueService.getVenueById(id).subscribe(v => {
      this.venue = v;
      if (v) {
        this.heroImages = (v?.images && v.images.length > 0) ? v.images : (v?.imageUrl ? [v.imageUrl] : []);
        this.heroIndex = 0;
      }
    });
  }

  heroPrev(): void {
    this.heroIndex = (this.heroIndex - 1 + this.heroImages.length) % this.heroImages.length;
  }

  heroNext(): void {
    this.heroIndex = (this.heroIndex + 1) % this.heroImages.length;
  }

  get endDateMin(): Date {
    return this.startDate ?? this.today;
  }

  get selectedDateRange(): string {
    if (!this.startDate) return '';
    const s = this.formatDateLabel(this.startDate);
    if (!this.endDate) return s;
    const e = this.formatDateLabel(this.endDate);
    return this.toIso(this.startDate) === this.toIso(this.endDate) ? s : `${s} — ${e}`;
  }

  onStartDateChange(date: Date | null): void {
    this.startDate = date;
    if (this.endDate && date && this.endDate < date) {
      this.endDate = null;
    }
    this.selectedSlot = undefined;
    this.slotGroups = [];
    if (this.startDate && this.endDate) {
      this.loadSlots();
    }
  }

  onEndDateChange(date: Date | null): void {
    this.endDate = date;
    this.selectedSlot = undefined;
    this.slotGroups = [];
    if (this.startDate && this.endDate) {
      this.loadSlots();
    }
  }

  private loadSlots(): void {
    if (!this.venue || !this.startDate || !this.endDate) return;
    this.slotsLoading = true;
    const start = this.toIso(this.startDate);
    const end   = this.toIso(this.endDate);
    this.venueService.getVenueSlots(this.venue.id, start, end).subscribe(slots => {
      this.slotGroups = this.groupSlots(slots);
      this.slotsLoading = false;
    });
  }

  private groupSlots(slots: VenueSlot[]): SlotGroup[] {
    const groups = new Map<string, SlotGroup>();
    const multiDay: VenueSlot[] = [];

    for (const slot of slots) {
      if (slot.slotType === 'multiday') { multiDay.push(slot); continue; }
      if (!groups.has(slot.date)) {
        groups.set(slot.date, {
          dateIso: slot.date,
          label: this.formatDateLabel(new Date(slot.date + 'T00:00:00')),
          isMultiDay: false,
          slots: [],
        });
      }
      groups.get(slot.date)!.slots.push(slot);
    }

    const result = Array.from(groups.values()).sort((a, b) => a.dateIso.localeCompare(b.dateIso));
    if (multiDay.length > 0) {
      result.push({ dateIso: 'multiday', label: 'Multi-Day Packages', isMultiDay: true, slots: multiDay });
    }
    return result;
  }

  selectSlot(slot: VenueSlot): void {
    if (!slot.available) return;
    this.selectedSlot = slot;
  }

  formatDateLabel(date: Date): string {
    const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  }

  formatSlotDateRange(slot: VenueSlot): string {
    const start = this.formatDateLabel(new Date(slot.date + 'T00:00:00'));
    if (slot.endDate) {
      const end = this.formatDateLabel(new Date(slot.endDate + 'T00:00:00'));
      return `${start} → ${end}`;
    }
    return start;
  }

  /** Date label shown in the booking card — reflects the selected slot, not the search range */
  get selectedSlotDateLabel(): string {
    if (!this.selectedSlot) return this.selectedDateRange;
    const start = this.formatDateLabel(new Date(this.selectedSlot.date + 'T00:00:00'));
    if (this.selectedSlot.endDate) {
      const end = this.formatDateLabel(new Date(this.selectedSlot.endDate + 'T00:00:00'));
      return `${start} — ${end}`;
    }
    return start;
  }

  private toIso(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get amenityList(): { icon: string; label: string }[] {
    if (!this.venue?.amenities) return [];
    const list: { icon: string; label: string }[] = [];
    if (this.venue.amenities.swimmingPool)         
      list.push({ icon: 'pool', label: 'Swimming Pool' });
    if (this.venue.amenities.carParking)            
      list.push({ icon: 'local_parking', label: 'Car Parking' });
    if (this.venue.amenities.outsideCateringAllowed) 
      list.push({ icon: 'restaurant', label: 'Outside Catering' });
    return list;
  }

  onBook(): void {
    if (!this.selectedSlot) return;
    if (!this.authService.loggedIn()) {
      const dialogRef = this.dialog.open(Login, { width: '420px', panelClass: 'auth-dialog' });
      dialogRef.afterClosed().subscribe(result => {
        if (result === true) this.router.navigate(['/payment', this.venue?.id]);
      });
      return;
    }
    this.router.navigate(['/payment', this.venue?.id]);
  }
}