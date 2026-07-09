import { Component, OnInit, signal } from '@angular/core';
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
import { SelectedSlot, VenueDetailsDTO, VenueSlotDTO } from '../../shared/models/venue';
import { Login } from '../../auth/login/login';
import { SearchService } from '../../shared/search.service';
import { BookingRequestDTO, OrderRequestDTO } from '../../shared/models/booking';
import { PaymentService } from '../../shared/payment';
import { switchMap } from 'rxjs';

export interface SlotGroup {
  dateIso: string;
  label: string;
  isMultiDay: boolean;
  slots: VenueSlotDTO[];
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
  venue = signal<VenueDetailsDTO | undefined>(undefined);

  readonly today: Date = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();
  readonly todayIso: string = this.toIso(this.today);
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  slotGroups = signal<SlotGroup[]>([]);
  selectedSlot = signal<SelectedSlot | undefined>(undefined);
  expandedFlexSlotId = signal<number | null>(null);
  flexSelections = signal<Map<number, { startDateTime: string; endDateTime: string}>>(new Map());
  slotsLoading = signal(false);
  heroImages = signal<string[]>([]);
  heroIndex = signal(0);
  bookingConfirmed = signal(false);
  paymentCompleted = signal(false);
  bookingId = signal<number | null>(null);
  paymentFailed = signal(false);
  private initialized = false;
  startOptionsCache = signal(new Map<number, { label: string; options: string[] }[]>());

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private venueService: VenueService,
    private authService: Authservice,
    private dialog: MatDialog,
    private searchService: SearchService,
    private paymentService: PaymentService
  ) {
    if (this.searchService.startDate()) 
      this.startDate.set(this.searchService.startDate());
    else  
      this.startDate.set(this.today);
    if (this.searchService.endDate()) 
      this.endDate.set(this.searchService.endDate());
    else
      this.endDate.set(this.today);  
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const startDate = this.startDate();
    const endDate = this.endDate();
    this.venueService.getVenueById(id, startDate ? this.toIso(startDate) : this.todayIso, endDate ? this.toIso(endDate) : this.todayIso).subscribe({
      next: venue => { 
        this.venue.set(venue);
        if (venue) {
          this.heroImages.set(venue.imagePaths.map(i => i.imagePath));
          this.heroIndex.set(0);
           this.buildSlotGroups();
           this.initialized = true;
        }
      },
      error: err => {
        console.error('API ERROR', err);
      },
    });
  }

  heroPrev(): void {
    this.heroIndex.set((this.heroIndex() - 1 + this.heroImages().length) % this.heroImages().length);
  }

  heroNext(): void {
    this.heroIndex.set((this.heroIndex() + 1) % this.heroImages().length);
  }

  get endDateMin(): Date {
    return this.startDate() ?? this.today;
  }

  get selectedDateRange(): string {
    const startDate = this.startDate();
    const endDate = this.endDate();
    if (!startDate) return '';
    const s = this.formatDateLabel(startDate);
    if (!endDate) return s;
    const e = this.formatDateLabel(endDate);
    return this.toIso(startDate) === this.toIso(endDate) ? s : `${s} — ${e}`;
  }

  onStartDateChange(date: Date | null): void {
    this.startDate.set(date);
    const endDate = this.endDate();
    if (endDate && date && endDate < date) {
      this.endDate.set(null);
    }
    this.selectedSlot.set(undefined);
    this.slotGroups.set([]);
    if (!this.startDate() || !this.endDate()) {
      return;
    }
    if (!this.initialized) {
      this.buildSlotGroups();
      return;
    }
    this.fetchSlots();
  }

  onEndDateChange(date: Date | null): void {
    this.endDate.set(date);
    this.selectedSlot.set(undefined);
    this.slotGroups.set([]);
    if (!this.startDate() || !this.endDate()) {
      return;
    }
    if (!this.initialized) {
      this.buildSlotGroups();
      return;
    }
    this.fetchSlots();
  }

  private fetchSlots(): void {
    const venue = this.venue();
    if (!venue) return;

    this.slotsLoading.set(true);
    this.venueService.getVenueSlotsById(venue.venueId,this.toIso(this.startDate()!),this.toIso(this.endDate()!))
        .subscribe({
          next: slots => {
            this.venue.update(v => {
              if (!v) {
                return undefined;
              }

              return {...v, slots};

            });

            this.buildSlotGroups();
          },

        complete: () => this.slotsLoading.set(false)
    });
  }
  private buildSlotGroups(): void {
    const venue = this.venue();
    if (!venue) return;

    this.slotsLoading.set(true);
    this.slotGroups.set(this.groupSlots(venue.slots));

    const cache = new Map<number, { label: string; options: string[] }[]>();
    for (const group of this.slotGroups()) {
      for (const slot of group.slots) {
        if (slot.slotType === 'FLEXIBLE') {
          cache.set(slot.slotId, this.flexStartOptionsGrouped(slot));
        }
      }
    }

    this.startOptionsCache.set(cache);
    this.slotsLoading.set(false);
  }

  isMultiDay(slot: VenueSlotDTO): boolean {
    return slot.slotType === 'FLEXIBLE' &&
           slot.startDateTime.substring(0, 10) !==
           slot.endDateTime.substring(0, 10);
  }

  private groupSlots(slots: VenueSlotDTO[]): SlotGroup[] {
    const groups = new Map<string, SlotGroup>();
    const multiDay: VenueSlotDTO[] = [];

    for (const slot of slots) {
      const date = slot.startDateTime.substring(0, 10);
      
      if (this.isMultiDay(slot)) { multiDay.push(slot); continue; }
      if (!groups.has(date)) {
        groups.set(date, {
          dateIso: date,
          label: this.formatDateLabel(new Date(date + 'T00:00:00')),
          isMultiDay: false,
          slots: [],
        });
      }
      groups.get(date)!.slots.push(slot);
    }

    const result = Array.from(groups.values()).sort((a, b) => a.dateIso.localeCompare(b.dateIso));
    if (multiDay.length > 0) {
      result.push({ dateIso: 'multiday', label: 'Multi-Day Packages', isMultiDay: true, slots: multiDay });
    }
    return result;
  }

  selectSlot(slot: VenueSlotDTO): void {
    if (!this.isAvailable(slot)) return;

    if (slot.slotType === 'FLEXIBLE') {
      const isAlreadyOpen = this.expandedFlexSlotId() === slot.slotId;
      
      this.selectedSlot.set(undefined);
      this.expandedFlexSlotId.set(isAlreadyOpen ? null : slot.slotId);

      if (!isAlreadyOpen && !this.flexSelections().has(slot.slotId)) {
        const map = new Map(this.flexSelections());
        const startGroups = this.flexStartOptionsGrouped(slot);
        const defaultStart = startGroups.length > 0 && startGroups[0].options.length > 0
                              ? startGroups[0].options[0] : slot.startDateTime;
        const defaultEnd = this.addMinutes(defaultStart, slot.minSlotTime!);
        map.set(slot.slotId, {
          startDateTime: defaultStart,
          endDateTime: defaultEnd
        });

        this.flexSelections.set(map);
      }
      return;
    }

    this.expandedFlexSlotId.set(null);
    this.selectedSlot.set({
      slot,
      selectedStartDateTime: slot.startDateTime,
      selectedEndDateTime: slot.endDateTime,
      selectedDurationMinutes: slot.minSlotTime!,
      calculatedPrice: slot.totalSlotPrice
    });
  }

  onFlexStartChange(slot: VenueSlotDTO, startTime: string): void {
    if (!slot) return;

    const startMin = this.timeToMinutes(startTime);
    const interval = this.freeIntervalsFor(slot)
      .find(iv => startMin >= iv.start && startMin < iv.end);

    const maxEnd = interval
      ? Math.min(interval.end, startMin + slot.maxSlotTime!)
      : startMin + (slot.minSlotTime ?? 0);

    const defaultEndMin = Math.min(startMin + slot.minSlotTime!, maxEnd);
    const endDateTime = this.minutesToDateTime(slot.startDateTime, defaultEndMin);

    const map = new Map(this.flexSelections());
    map.set(slot.slotId, { startDateTime: startTime, endDateTime });
    this.flexSelections.set(map);
    console.log('onFlexStartChange',this.flexSelections());
  }


  // Called when user changes duration inside the flex picker
  onFlexEndChange(slot: VenueSlotDTO, endTime: string): void {
    const existing = this.flexSelections().get(slot.slotId);
    const map = new Map(this.flexSelections());
    map.set(slot.slotId, {
      startDateTime: existing?.startDateTime ?? slot.startDateTime,
      endDateTime: endTime
    });
    this.flexSelections.set(map);
  }

  // Confirm a flexible slot selection — computes final times and price
  confirmFlexSlot(slot: VenueSlotDTO): void {
    const sel = this.flexSelections().get(slot.slotId);
    if (!sel) return;

    this.venueService.getFlexibleSlotPrice(slot.slotId,sel.startDateTime,sel.endDateTime).subscribe(response => {
      this.selectedSlot.set({
        slot,
        selectedStartDateTime: sel.startDateTime,
        selectedEndDateTime: sel.endDateTime,
        selectedDurationMinutes: slot.minSlotTime!,
        calculatedPrice: response
      });

      console.log('response', response);
      console.log('selected slot', this.selectedSlot());
      this.expandedFlexSlotId.set(null);
    })
  }

  flexStartOptionsGrouped(slot: VenueSlotDTO): { label: string; options: string[] }[] {
    if (!slot) return [];
    const { minSlotTime } = slot;
    const stepMinutes = 30;
    const options: string[] = [];

    for (const interval of this.freeIntervalsFor(slot)) {
      let t = Math.ceil(interval.start / stepMinutes) * stepMinutes;
      while (t + minSlotTime! <= interval.end) {
        options.push(this.minutesToDateTime(slot.startDateTime, t));
        t += stepMinutes;
      }
    }

    return options.length > 0
      ? [{ label: 'Available Times', options }]
      : [];
  }

  // Returns valid duration options (in hours) for a selected start time
  flexEndOptions(slot: VenueSlotDTO, startTime: string): string[] {
    if (!slot) return [];
    console.log(startTime);
    const startMin = this.timeToMinutes(startTime);
    console.log('StartMin', startMin);
    const interval = this.freeIntervalsFor(slot)
      .find(iv => startMin >= iv.start && startMin < iv.end);

      console.log('flex end slots',slot);
      console.log('flexEndOptions',interval);
    if (!interval) return [];

    const minEnd = startMin + slot.minSlotTime!;
    const maxEnd = Math.min(interval.end, startMin + slot.maxSlotTime!);

    const options: string[] = [];
    for (let t = minEnd; t <= maxEnd; t += 30) {
      options.push(this.minutesToDateTime(slot.startDateTime, t));
    }
    return options;
  }

  private flexDurationMinutes(slot: VenueSlotDTO, sel: { startDateTime: string; endDateTime: string }): number {
    return this.timeToMinutes(sel.endDateTime) - this.timeToMinutes(sel.startDateTime);
  }

  flexSelectedDuration(slot: VenueSlotDTO): number {
    const sel = this.flexSelections().get(slot.slotId);
    if (!sel) return slot.minSlotTime ?? 0;
    return this.flexDurationMinutes(slot, sel);
  }

  // Computes the price for the current flex selection
  flexPrice(slot: VenueSlotDTO): number {
    const sel = this.flexSelections().get(slot.slotId);
    if (!sel || !slot) return slot.totalSlotPrice;
    const durationMinutes = this.flexDurationMinutes(slot, sel);
    const pricePerMinute = slot.minSlotPrice! / slot.minSlotTime!;
    return Math.round(pricePerMinute * durationMinutes);
  }

  formatDateLabel(date: Date): string {
    const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  }

  formatTime(dateTime: string): string {
    const date = new Date(dateTime);

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  formatSlotDateRange(slot: VenueSlotDTO): string {
    const start = this.formatDateLabel(new Date(slot.startDateTime));
    const end = this.formatDateLabel(new Date(slot.endDateTime));
    if (start === end) {
      return start;
    }
    return `${start} → ${end}`;
  }

  /** Date label shown in the booking card — reflects the selected slot, not the search range */
  get selectedSlotDateLabel(): string {
    const selectedSlot = this.selectedSlot();
    if (!selectedSlot) {
      return this.selectedDateRange;
    }

    const start = this.formatDateLabel(new Date(selectedSlot.selectedStartDateTime));
    const end = this.formatDateLabel(new Date(selectedSlot.selectedEndDateTime));

    if (start === end) {
      return start;
    }

    return `${start} — ${end}`;
  }

  private toIso(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get amenityList(): { icon: string; label: string }[] {
    const venue = this.venue();
    if (!venue) return [];
    const list: { icon: string; label: string }[] = [];
    if (venue.swimmingPool)         
      list.push({ icon: 'pool', label: 'Swimming Pool' });
    if (venue.carParking)            
      list.push({ icon: 'local_parking', label: 'Car Parking' });
    if (venue.cateringProvided) 
      list.push({ icon: 'restaurant', label: 'Outside Catering' });
    if (venue.outsideServicesAllowed) 
      list.push({ icon: 'room_service', label: 'Outside Services' });
    return list;
  }

  isAvailable(slot: VenueSlotDTO): boolean {

    if (slot.slotType === 'FIXED') {
      return slot.slotStatus === 'AVAILABLE';
    }

    // FLEXIBLE
    return true;
  }

  onBook(): void {
    if (!this.selectedSlot()) return;
    if (!this.authService.loggedIn()) {
      const dialogRef = this.dialog.open(Login, { width: '420px', panelClass: 'auth-dialog' });
      dialogRef.afterClosed().subscribe(result => {
        if (result.action === 'login-success')
        {
        }
      });
    }
    const venue = this.venue();
    const selected = this.selectedSlot();

    if (!venue || !selected) {
      return;
    }

    const bookingRequest: BookingRequestDTO = {
      venueId: venue.venueId,
      slotId: selected.slot.slotId,
      startDateTime: selected.selectedStartDateTime,
      endDateTime: selected.selectedEndDateTime
    };
    console.log('Booking request:', bookingRequest);
    this.venueService.createBooking(bookingRequest).subscribe({
      next: response => {
        this.updateSlotsAfterBooking();
        this.bookingConfirmed.set(true);
        this.bookingId.set(response.bookingId);
        //this.router.navigate(['/bookings']);
      }
    });
  }
  
  private updateSlotsAfterBooking(): void {
   const selected = this.selectedSlot();
   if (!selected) return;

   this.venue.update(v => {
     if (!v) return v;

     return {
       ...v,
       slots: v.slots.map(slot => {
         if (slot.slotId !== selected.slot.slotId) {
           return slot;
         }
         // Fixed slot
         if (slot.slotType === 'FIXED') {
           return {
             ...slot,
             slotStatus: 'BOOKED'
           };
         }
         // Flexible slot
         return {
           ...slot,
           bookings: [
             ...(slot.bookings ?? []),
             {
               startDateTime: selected.selectedStartDateTime,
               endDateTime: selected.selectedEndDateTime,
               bookingStatus: 'BOOKED'
             }
           ]
         };
       })
     };
   });

   this.buildSlotGroups();
  }

  onPay(): void {
    const bookingId = this.bookingId();
    if (!bookingId) return;

    this.paymentFailed.set(false); // reset any previous failure state
    const request: OrderRequestDTO = { bookingId };

    this.paymentService.createOrderForPayment(request).pipe(
      switchMap(response =>
        this.paymentService.payNow(response.orderId)
      ),
      switchMap(payment =>
        this.paymentService.verifyPayment({
          razorpayPaymentId: payment.razorpay_payment_id,
          razorpayOrderId: payment.razorpay_order_id,
          razorpaySignature: payment.razorpay_signature,
          bookingId,
          paymentResult: 'SUCCESS'
        })
      )
    ).subscribe({
        next: response => {
          console.log('Payment verified successfully:', response);
          this.paymentCompleted.set(true);
        },
        error: error => {
          console.error('Payment failed:', error);
          this.paymentFailed.set(true);
        }

    });
  }

  private timeToMinutes(dateTime: string): number {
    const date = new Date(dateTime);

    return date.getHours() * 60 + date.getMinutes();
  }

  /** Free (bookable) sub-windows left inside the flex window after carving out
   *  bookedRanges, each expanded by bufferMinutes on both sides for turnover time. */
  private freeIntervalsFor(slot: VenueSlotDTO): { start: number; end: number }[] {
    if (!slot) return [];
    const { startDateTime, endDateTime, bufferTime, bookings } = slot;
    const winStart = this.dateTimeToMinutes(startDateTime);
    const winEnd = this.dateTimeToMinutes(endDateTime);

    if (!bookings || bookings.length === 0) {
      return [{ start: winStart, end: winEnd }];
    }
    const blocked = bookings
      .filter(b => b.bookingStatus === 'RESERVED' || b.bookingStatus === 'CONFIRMED')
      .map(b => ({
          start: Math.max(
              winStart,
              this.dateTimeToMinutes(b.startDateTime) - (bufferTime ?? 0)
          ),
          end: Math.min(
              winEnd,
              this.dateTimeToMinutes(b.endDateTime) + (bufferTime ?? 0)
          ),
      }))
      .sort((a, b) => a.start - b.start);
    console.log('blocked',blocked);
    const merged: { start: number; end: number }[] = [];
    for (const b of blocked) {
      const last = merged[merged.length - 1];
      if (last && b.start <= last.end) last.end = Math.max(last.end, b.end);
      else merged.push({ ...b });
    }
    console.log('merged', merged);
    const free: { start: number; end: number }[] = [];
    let cursor = winStart;
    for (const b of merged) {
      if (b.start > cursor) free.push({ start: cursor, end: b.start });
      cursor = Math.max(cursor, b.end);
    }
    console.log('free1', free);
    if (cursor < winEnd) free.push({ start: cursor, end: winEnd });
    console.log('free2', free);
    return free;
  }

  private dateTimeToMinutes(dateTime: string): number {

      const date = new Date(dateTime);

      return date.getHours() * 60 + date.getMinutes();
  }

  private addMinutes(dateTime: string, minutes: number): string {
    const date = new Date(dateTime);
    date.setMinutes(date.getMinutes() + minutes);
    
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    
    return `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
  }

  getDurationDays(slot: VenueSlotDTO): number {
    const start = new Date(slot.startDateTime);
    const end = new Date(slot.endDateTime);

    return Math.ceil(
      (end.getTime() - start.getTime()) /
      (1000 * 60 * 60 * 24)
    );
  }

  formatDuration(minutes: number): string {

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${mins} min`;
  }
  private minutesToDateTime(baseDateTime: string, minutes: number): string {
    const date = new Date(baseDateTime);
    
    // Keep the same date
    date.setHours(0, 0, 0, 0);

    // Set the time-of-day
    date.setMinutes(minutes);

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');

    return `${y}-${m}-${d}T${hh}:${mm}:00`;
  }
}