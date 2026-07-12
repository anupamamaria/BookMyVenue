import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageResponse, VenueBookingResponseDTO, VenueBookings, VenueManage, VenueManageSlot } from '../../shared/models/venue';
import { VenueService } from '../venueservice';
import { VenueAddSlotComponent, AddSlotPayload, EditSlotPayload } from '../venue-add-slot/venue-add-slot';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarModule, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { VenueBookingList } from '../venue-booking-list/venue-booking-list';
import { Navbar } from '../../shared/navbar/navbar';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialog, ErrorDialogData } from '../../shared/error-dialog/error-dialog';
import { filter, map, Observable, of, switchMap } from 'rxjs';

interface SlotDateGroup {
  dateIso: string;
  endDateIso: string;
  isMultiDay: boolean;
  slots: VenueManageSlot[];
}

interface TimelineSegment {
  startMin: number;
  endMin: number;
  widthPct: number;
  type: 'booked' | 'available' | 'too-short';
  label: string;
  booking?: VenueBookings;
}

@Component({
  selector: 'app-venue-manage',
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatSnackBarModule, 
            VenueAddSlotComponent, MatTooltipModule, MatTabsModule, VenueBookingList, Navbar],
  templateUrl: './venue-manage.html',
  styleUrl: './venue-manage.scss',
})
export class VenueManagement implements OnInit {

  venue = signal<VenueManage | null>(null);
  slotGroups = signal<SlotDateGroup[]>([]);
  heroImages = signal<string[]>([]);
  heroIndex = signal(0);
  selectedBookingSlot = signal<VenueManageSlot | null>(null);
  addSlotOpen = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  editSlotTarget: VenueManageSlot | null = null;
  upcomingBookingsPage = signal<PageResponse<VenueBookingResponseDTO> | null>(null);
  pastBookingsPage = signal<PageResponse<VenueBookingResponseDTO> | null>(null);
  upcomingLoading = signal(false);
  pastLoading = signal(false);
  activeTabIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private service: VenueService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.service.getVenueManage(id).subscribe(v => {
      this.venue.set({
        ...v,
        rating: 4.5,
        description: v.additional,
        images: v.imagePaths.map(img => img.imagePath),
        imageUrl:
          v.imagePaths.find(img => img.profile)?.imagePath ??
          v.imagePaths[0]?.imagePath ??
          '',
        slots: v.slots.map(slot => {
          const activeBookings = (slot.bookings ?? []).filter(b => b.bookingStatus !== 'CANCELLED');
          return {
          ...slot,
          start: this.formatTime(slot.startDateTime),
          end: this.formatTime(slot.endDateTime),
          price: slot.totalSlotPrice,
          isBooked: activeBookings.length > 0,
          bookingStatus: slot.slotStatus ?? 'available',
          bookings: activeBookings, 
          }
        })
      });

      this.buildGroups(this.venue()!.slots);

      this.heroImages.set(
        this.venue()!.images ?? []
      );

      this.heroIndex.set(0);
    });
  }
  
  combineDateAndTime(date: Date, time: Date): string {
    const result = new Date(date);
    
    result.setHours(
      time.getHours(),
      time.getMinutes(),
      0,
      0
    );
  
    const year = result.getFullYear();
    const month = String(result.getMonth() + 1).padStart(2, '0');
    const day = String(result.getDate()).padStart(2, '0');
    const hours = String(result.getHours()).padStart(2, '0');
    const minutes = String(result.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  }

  onSlotsAdded(payloads: AddSlotPayload[]): void {
    const venueId = this.venue()?.venueId;
    if (!venueId) return;
 
  
    const dto = payloads.map(payload => ({
      slotType:       payload.slotType,
      startDateTime:  this.combineDateAndTime(payload.startDate, payload.startTime),
      endDateTime:    this.combineDateAndTime(payload.endDate, payload.endTime),
      totalSlotPrice: payload.totalSlotPrice,
      ...(payload.slotType === 'FLEXIBLE' && {
        minSlotTime:  payload.minSlotTime,
        maxSlotTime:  payload.maxSlotTime,
        minSlotPrice: payload.minSlotPrice,
        bufferTime:   payload.bufferTime,
      }),
    }));
    console.log("dto is ", dto);
    this.callSlotApi(venueId, dto, true).pipe(
      switchMap((dryRunText: string) => {
        const warnings = this.extractWarnings(dryRunText);

        if (warnings.length === 0) {
          return this.callSlotApi(venueId, dto, false);
        }

        return this.confirmWarnings(warnings).pipe(
          switchMap(confirmed =>
            confirmed ? this.callSlotApi(venueId, dto, false) : of(null)
          )
        );
      })
    ).subscribe({
      next: (result) => {
        if (result === null) {
          // user declined after seeing warnings — nothing was created
          return;
        }

        this.snackBar.open(
          dto.length > 1 ? `${dto.length} slots added` : 'Slot Added',
          '',
          {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 3000,
          }
        );
        // Refresh venue data to show the new slot(s)
        this.ngOnInit();
      },
      error: (err) => {
        console.error('Failed to create slot', err);
        this.snackBar.open('Failed to add slot(s). Please try again.', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 3000,
        });
      },
    });
  }

  /** Routes to the singular endpoint for exactly one slot, bulk otherwise. */
  private callSlotApi(venueId: number, slots: any[], dryRun: boolean): Observable<string> {
    if (slots.length === 1) {
      return this.service.createSlot(venueId, slots[0], dryRun);
    }
    return this.service.createSlotsBulk(venueId, slots, dryRun);
  }

  /** Text response from dry-run — non-empty text means there's a warning to show. */
  private extractWarnings(responseText: string): string[] {
    if (!responseText) return [];
    const trimmed = responseText.trim();
    if (!trimmed) return [];
    return trimmed.split('\n').map(w => w.trim()).filter(w => w.length > 0);
  }

  /** Shows the warning text, resolves true if the user confirms, false if they cancel. */
  private confirmWarnings(warnings: string[]) {
    const dialogRef = this.dialog.open(ErrorDialog, {
      data: {
        title: 'Review before creating slots',
        message: warnings.join('\n'),
      } as ErrorDialogData,
      width: '500px',
    });
    return dialogRef.afterClosed().pipe(map(result => result?.action === 'Ok')
    );
  }

  formatTime(dateTime: string): string {
    const date = new Date(dateTime);

    const hours = date.getHours();
    const minutes = date.getMinutes();

    const period = hours >= 12 ? 'PM' : 'AM';
    const hour = hours % 12 || 12;

    return `${hour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  heroPrev(): void {
    this.heroIndex.update(i =>
      (i - 1 + this.heroImages().length) % this.heroImages().length
    );
  }

  heroNext(): void {
    this.heroIndex.update(i =>
      (i + 1) % this.heroImages().length
    );
  }

  private buildGroups(slots: VenueManageSlot[]): void {

    const map = new Map<string, VenueManageSlot[]>();
    for (const slot of slots) {
      const startDate = slot.startDateTime.substring(0, 10);
      if (!map.has(startDate)) {
        map.set(startDate, []);
      }
      map.get(startDate)!.push(slot);
    }

    this.slotGroups.set(
      Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateIso, slots]) => ({
          dateIso,
          endDateIso: slots[0].endDateTime.substring(0, 10),
          isMultiDay:
            slots[0].startDateTime.substring(0, 10) !==
            slots[0].endDateTime.substring(0, 10),
          slots,
        }))
    );
  }

  private toEpochMin(iso: string): number {
    return new Date(iso).getTime() / 60000;
  }

  getFlexTimeline(slot: VenueManageSlot): TimelineSegment[] {
    const windowStart = this.toEpochMin(slot.startDateTime);
    const windowEnd = this.toEpochMin(slot.endDateTime);
    const total = windowEnd - windowStart;
    const minDuration = Number(slot.minSlotTime ?? 0);
    const buffer = Number(slot.bufferTime ?? 0);

    const bookings = (slot.bookings ?? [])
      .filter(b => b.bookingStatus !== 'CANCELLED')
      .map(b => ({
        start: this.toEpochMin(b.startDateTime),
        end: this.toEpochMin(b.endDateTime),
        booking: b,
      }))
      .sort((a, b) => a.start - b.start);

    const raw: Omit<TimelineSegment, 'widthPct' | 'label'>[] = [];
    let cursor = windowStart;

    for (const b of bookings) {
      // apply buffer around each booking, clamped to window
      const blockStart = Math.max(windowStart, b.start - buffer);
      const blockEnd = Math.min(windowEnd, b.end + buffer);

      if (blockStart > cursor) {
        raw.push({ startMin: cursor, endMin: blockStart, type: 'available' });
      }
      raw.push({ startMin: b.start, endMin: b.end, type: 'booked', booking: b.booking });
      cursor = Math.max(cursor, blockEnd);
    }

    if (cursor < windowEnd) {
      raw.push({ startMin: cursor, endMin: windowEnd, type: 'available' });
    }

    // Mark available gaps that are too short to satisfy minSlotTime
    return raw.map(seg => {
      const durationMin = seg.endMin - seg.startMin;
      const type =
        seg.type === 'available' && minDuration > 0 && durationMin < minDuration
          ? 'too-short'
          : seg.type;

      const label =
        type === 'booked'
          ? `${seg.booking!.userName} · ${this.formatTime(seg.booking!.startDateTime)}–${this.formatTime(seg.booking!.endDateTime)}`
          : type === 'too-short'
          ? `Gap too short to book (${durationMin} min < ${minDuration} min min)`
          : 'Available';

      return { ...seg, type, label, widthPct: (durationMin / total) * 100 };
    });
  }

  get amenityList(): { icon: string; label: string }[] {
    const venue = this.venue();
    if (!venue) {
      return [];
    }
    const list: { icon: string; label: string }[] = [];
    if (venue.carParking) {
      list.push({
        icon: 'local_parking',
        label: 'Car Parking'
      });
    }

    if (venue.swimmingPool) {
      list.push({
        icon: 'pool',
        label: 'Swimming Pool'
      });
    }

    if (venue.outsideServicesAllowed) {
      list.push({
        icon: 'restaurant',
        label: 'Outside Catering Allowed'
      });
    }

    if (venue.cateringProvided) {
      list.push({
        icon: 'room_service',
        label: 'In-house Catering'
      });
    }

    return list;
  }

  get totalSlots(): number {
    return this.venue()?.slots.length ?? 0;
  }

  get bookedSlots(): number {
    return this.venue()?.slots.filter(s => s.bookings?.length).length ?? 0;
  }
  get totalRevenue(): number {
    return this.venue()?.slots
      .filter(s => s.bookings?.length)
      .reduce((sum, s) => sum + s.totalSlotPrice, 0) ?? 0;
  }


  get availableSlots(): number {
    return this.totalSlots - this.bookedSlots;
  }

  getSlotAvailabilityState(slot: VenueManageSlot): 'booked' | 'partial' | 'available' {
    if (!slot.bookings?.length) return 'available';
    if (slot.slotType === 'FIXED') return 'booked';

    // Flexible: check if any bookable gap remains
    const hasOpenGap = this.getFlexTimeline(slot).some(seg => seg.type === 'available');
    return hasOpenGap ? 'partial' : 'booked';
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
    const normalized = (status ?? '').toUpperCase();

    const colors: Record<string, string> = {
      // Booking statuses
      CONFIRMED: '#1b7f38',
      PENDING:   '#b35a00',
      CANCELLED: '#a72020',

      // Slot statuses
      AVAILABLE: '#1b7f38',
      BOOKED:    '#1b7f38',
      RESERVED:  '#b35a00',
      EXPIRED:   '#888888',
    };

    return colors[normalized] ?? '#888888';
  }

  openBookingDetails(slot: VenueManageSlot, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedBookingSlot.set(slot);
    console.log(this.selectedBookingSlot());
  }

  closeBookingDetails(): void {
    this.selectedBookingSlot.set(null);
  }

  closeAddSlotDrawer(): void {
    this.addSlotOpen = false;
    this.editSlotTarget = null;
  }

  openAddSlot(): void {
    this.editSlotTarget = null;
    this.addSlotOpen = true;
  }

  canBlockSlot(slot: VenueManageSlot): boolean {
    const startDate = slot.startDateTime.substring(0,10);
    const now = new Date();

    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (startDate < today)
      return false;
    if (slot.slotStatus && slot.slotStatus === 'BLOCKED')
      return false;
    return true;
  }

  canUnblockSlot(slot: VenueManageSlot): boolean {
    const startDate = slot.startDateTime.substring(0,10);
    const now = new Date();

    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (startDate < today)
      return false;
    if (slot.slotStatus && slot.slotStatus === 'BLOCKED')
      return true;
    return false;
  }
  
  openEditSlot(slot: VenueManageSlot): void {
    if (slot.bookings?.length) return; // safety guard — shouldn't be reachable via UI anyway
    this.editSlotTarget = slot;
    this.addSlotOpen = true;
  }

  deleteSlot(slot: VenueManageSlot){
    const venueId = this.venue()?.venueId;
    if (!venueId) return;

    const dialogRef = this.dialog.open(ErrorDialog, {
      data: {title: 'Delete Slot', message: 'Are you sure you want to delete this slot'},
      width: '500px', panelClass: 'auth-dialog' }
    );
    dialogRef.afterClosed().pipe(
      filter(result => result?.action === 'Ok'),
      switchMap(() => this.service.deleteSlot(slot.slotId,venueId))
    ).subscribe({
      next: () => {
        this.snackBar.open('Slot Deleted', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 3000,
        });
        this.ngOnInit();
      },
      error: () =>{
        this.snackBar.open('Error occured while deleting slot', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 3000,
        });
      }
    })
  }

  blockSlot(slot: VenueManageSlot){
    const venueId = this.venue()?.venueId;
    if (!venueId) return;

    const dialogRef = this.dialog.open(ErrorDialog, {
      data: {title: 'Block Slot', message: 'Are you sure you want to block this slot'},
      width: '500px' }
    );
    dialogRef.afterClosed().pipe(
      filter(result => result?.action === 'Ok'),
      switchMap(() => this.service.blockSlot(slot.slotId,venueId))
    ).subscribe({
      next: () => {
        this.snackBar.open('Slot Blocked', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 3000,
        });
        this.ngOnInit();
      },
      error: (error) =>{
        console.log(error);
        this.snackBar.open('Error occured while Blocking slot', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 3000,
        });
      }
    })
  }

  unBlockSlot(slot: VenueManageSlot){
    const venueId = this.venue()?.venueId;
    if (!venueId) return;

    const dialogRef = this.dialog.open(ErrorDialog, {
      data: {title: 'Unblock Slot', message: 'Are you sure you want to unblock this slot'},
      width: '500px' }
    );
    dialogRef.afterClosed().pipe(
      filter(result => result?.action === 'Ok'),
      switchMap(() => this.service.unBlockSlot(slot.slotId,venueId))
    ).subscribe({
      next: () => {
        this.snackBar.open('Slot Unblocked', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 3000,
        });
        this.ngOnInit();
      },
      error: error =>{
        console.log(error);
        this.snackBar.open(`Error while unblocking slot`, '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 3000,
        });
      }
    })
  }

  onSlotEdited(payload: EditSlotPayload): void {
    const venueId = this.venue()?.venueId;
    if (!venueId) return;

    const dto = {
      slotType:       payload.slotType,
      startDateTime:  this.combineDateAndTime(payload.startDate, payload.startTime),
      endDateTime:    this.combineDateAndTime(payload.endDate, payload.endTime),
      totalSlotPrice: payload.totalSlotPrice,
      ...(payload.slotType === 'FLEXIBLE' && {
        minSlotTime:  payload.minSlotTime,
        maxSlotTime:  payload.maxSlotTime,
        minSlotPrice: payload.minSlotPrice,
        bufferTime:   payload.bufferTime,
      }),
    };

    this.service.updateSlot(venueId, payload.slotId, dto, true).pipe(
      switchMap((dryRunText: string) => {
        const warnings = this.extractWarnings(dryRunText);
      
        if (warnings.length === 0) {
          return this.service.updateSlot(venueId, payload.slotId, dto, false);
        }
      
        return this.confirmWarnings(warnings).pipe(
          switchMap(confirmed =>
            confirmed ? this.service.updateSlot(venueId, payload.slotId, dto, false) : of(null)
          )
        );
      })
    ).subscribe({
      next: (result) => {
        if (result === null) {
          // user declined after seeing warnings — slot was not updated
          return;
        }
      
        this.snackBar.open('Slot Updated', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 3000,
        });
        this.editSlotTarget = null;
        this.ngOnInit();
      },
      error: (err) => {
        console.error('Failed to update slot', err);
        this.snackBar.open('Failed to update slot. Please try again.', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 3000,
        });
      },
    });
  }

  private loadUpcomingBookings(page = 0): void {
    const venueId = this.venue()?.venueId;
    if (!venueId) return;
    this.upcomingLoading.set(true);
    this.service.getUpcomingBookings(venueId, page).subscribe({
      next: p => { this.upcomingBookingsPage.set(p); this.upcomingLoading.set(false); },
      error: () => this.upcomingLoading.set(false),
    });
  }

  private loadPastBookings(page = 0): void {
    const venueId = this.venue()?.venueId;
    if (!venueId) return;
    this.pastLoading.set(true);
    this.service.getPastBookings(venueId, page).subscribe({
      next: p => { this.pastBookingsPage.set(p); this.pastLoading.set(false); },
      error: () => this.pastLoading.set(false),
    });
  }

  onTabChange(index: number): void {
    this.activeTabIndex = index;
    if (index === 1 && !this.upcomingBookingsPage()) this.loadUpcomingBookings(0);
    if (index === 2 && !this.pastBookingsPage()) this.loadPastBookings(0);
  }

  onUpcomingLoadMore(pageIndex: number): void { this.loadUpcomingBookings(pageIndex); }
  onPastLoadMore(pageIndex: number): void { this.loadPastBookings(pageIndex); }
}