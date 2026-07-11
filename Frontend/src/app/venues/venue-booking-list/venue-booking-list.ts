import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { VenueBookingResponseDTO, PageResponse } from '../../shared/models/venue';

interface BookingRow extends VenueBookingResponseDTO {
  dateLabel: string;      // "22 Jun 2026" or "22 Jun – 24 Jun 2026"
  timeLabel: string;      // "2:30 PM – 4:30 PM"
  isMultiDay: boolean;
}

@Component({
  selector: 'app-venue-booking-list',
  imports: [CommonModule, MatIconModule],
  templateUrl: './venue-booking-list.html',
  styleUrl: './venue-booking-list.scss',
})

export class VenueBookingList {
  @Input() variant: 'upcoming' | 'past' = 'upcoming';
  @Input() page: PageResponse<VenueBookingResponseDTO> | null = null;
  @Input() loading = false;
  @Output() loadMore = new EventEmitter<number>();
  @ViewChild('sentinel') sentinelRef?: ElementRef<HTMLDivElement>;

  @Output() pageChange = new EventEmitter<PageEvent>();

  rows: BookingRow[] = [];
  private nextPageIndex = 0;
  private hasMore = true;
  private observer?: IntersectionObserver;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['page']) {
      const p = this.page;
      if (p === null) {
        // Reset signal from parent (e.g. switching venues or tabs)
        this.rows = [];
        this.nextPageIndex = 0;
        this.hasMore = true;
        return;
      }
      const newRows = p.content.map(b => this.toRow(b));
      this.rows = p.number === 0 ? newRows : [...this.rows, ...newRows];
      this.nextPageIndex = p.number + 1;
      this.hasMore = !p.last;
    }
  }
  
  ngAfterViewInit(): void {
    if (!this.sentinelRef) return;
    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && this.hasMore && !this.loading) {
        this.loadMore.emit(this.nextPageIndex);
      }
    }, { rootMargin: '200px' }); // fire slightly before it's actually visible
    this.observer.observe(this.sentinelRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private toRow(b: VenueBookingResponseDTO): BookingRow {
    const start = new Date(b.startDateTime);
    const end = new Date(b.endDateTime);
    const isMultiDay = start.toDateString() !== end.toDateString();
    const dateFmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeFmt = (d: Date) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

    return {
      ...b,
      isMultiDay,
      dateLabel: isMultiDay ? `${dateFmt(start)} – ${dateFmt(end)}` : dateFmt(start),
      timeLabel: `${timeFmt(start)} – ${timeFmt(end)}`,
    };
  }

  bookingStatusColor(status: string): string {
    const colors: Record<string, string> = {
      CONFIRMED: '#1b7f38', RESERVED: '#b35a00', PAYMENT_FAILED: '#a72020', CANCELLED: '#888888',
    };
    return colors[status] ?? '#888888';
  }

  paymentStatusColor(status: string): string {
    const colors: Record<string, string> = {
      SUCCESS: '#1b7f38', PENDING: '#b35a00', FAILED: '#a72020',
    };
    return colors[status] ?? '#888888';
  }
}
