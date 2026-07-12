import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule, MatCalendar } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, MatSnackBar } from '@angular/material/snack-bar';
import { VenueService } from '../venueservice';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { signal } from '@angular/core';
import { Loader } from '../../shared/loader/loader';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialog, ErrorDialogData } from '../../shared/error-dialog/error-dialog';

export interface ImagePreview {
  file: File;
  dataUrl: string;
}

@Component({
  selector: 'app-venue-create',
  imports: [CommonModule, ReactiveFormsModule, MatStepperModule, MatCheckboxModule,
            MatInputModule, MatButtonModule, MatIconModule, MatRadioModule, MatSelectModule,
            MatCardModule, MatDatepickerModule, MatNativeDateModule, MatMenuModule,
            MatChipsModule, MatSnackBarModule, MatTimepickerModule, Loader],
  providers: [provideNativeDateAdapter()],
  templateUrl: './venue-create.html',
  styleUrl: './venue-create.scss',
})

export class VenueCreate  implements OnInit {
  multipleSlots = true;
  basicDetailsForm!: FormGroup;
  slotManagementForm!: FormGroup;
  pricingForm!: FormGroup;
  slotAddForm!: FormGroup;
  editingIndex: number | null = null;
  days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  daysSelected: Date[] = [];
  minDate: Date = new Date();
  venueImages = signal<ImagePreview[]>([]);
  isDragOver = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  loading = signal(false);
  
  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, 
              private venueService: VenueService, private router: Router,
              private dialog: MatDialog) {}

  ngOnInit(): void {

    this.basicDetailsForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      address: ['', Validators.required],
      capacity: [null, [Validators.required, Validators.min(1)]],
      venueType: ['auditorium', Validators.required],

      swimmingPool: [false],
      carParking: [false],
      outsideCatering: [false],
      outsideServicesAllowed: [false],
      description: [''],
    });

    this.slotManagementForm = this.fb.group({
      slotType: ['FIXED', Validators.required], 
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      slots: this.fb.array([]),
      applyToOtherDates: [false],
      applyMode: ['dateRange'],
      applyEndDate: [null], 
      selectedDates: [[]],
      daysOfWeek: this.fb.array(this.days.map(() => this.fb.control(true)))
    });

    this.slotAddForm = this.fb.group({
      start: ['', Validators.required],
      end: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      minSlotTime: [null],
      maxSlotTime: [null],
      minSlotPrice: [null],
      bufferTime: [null],
    });
    
    this.slotManagementForm.get('slotType')?.valueChanges.subscribe((slotType) => {
      const minSlotTimeCtrl = this.slotAddForm.get('minSlotTime');
      const maxSlotTimeCtrl = this.slotAddForm.get('maxSlotTime');
      const minSlotPriceCtrl = this.slotAddForm.get('minSlotPrice');
      const bufferTimeCtrl = this.slotAddForm.get('bufferTime');

      if (slotType === 'FLEXIBLE') {
        minSlotTimeCtrl?.setValidators([Validators.required, Validators.min(1)]);
        minSlotPriceCtrl?.setValidators([Validators.required, Validators.min(0)]);
        bufferTimeCtrl?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        minSlotTimeCtrl?.clearValidators();
        minSlotPriceCtrl?.clearValidators();
        bufferTimeCtrl?.clearValidators();
      }

      minSlotTimeCtrl?.updateValueAndValidity();
      maxSlotTimeCtrl?.updateValueAndValidity();
      minSlotPriceCtrl?.updateValueAndValidity();
      bufferTimeCtrl?.updateValueAndValidity();
    });
    this.slotManagementForm.get('startDate')?.valueChanges.subscribe(() => this.syncApplyToOtherDatesAvailability());
    this.slotManagementForm.get('endDate')?.valueChanges.subscribe(() => this.syncApplyToOtherDatesAvailability());
  }

  syncApplyToOtherDatesAvailability(): void {
    const applyCtrl = this.slotManagementForm.get('applyToOtherDates');
    if (this.isMultiDaySlot) {
      applyCtrl?.setValue(false, { emitEvent: false });
      applyCtrl?.disable({ emitEvent: false });
    } else {
      applyCtrl?.enable({ emitEvent: false });
    }
  }

  isSelected = (date: Date) => {
    return this.daysSelected.some(d => 
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    ) ? 'selected' : '';
  };

  /** Toggle date selection */
  select(date: Date | null, calendar: MatCalendar<Date>) {
    if (!date) return;

    const index = this.daysSelected.findIndex(d => 
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
    if (index < 0) {
      this.daysSelected.push(date);
    } else {
      this.daysSelected.splice(index, 1);
    }
    // Sort dates chronologically
    this.daysSelected.sort((a, b) => a.getTime() - b.getTime());
    // update form control
    this.slotManagementForm.patchValue({ selectedDates: this.daysSelected });
    calendar.updateTodaysDate();
  }

  /** Remove a selected date */
  removeSelectedDate(date: Date) {
    const index = this.daysSelected.findIndex(d => 
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
    if (index >= 0) {
      this.daysSelected.splice(index, 1);
      this.slotManagementForm.patchValue({ selectedDates: this.daysSelected });
    }
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3000,
    });
  }

  isOverlapping(start: Date, end: Date, date: Date, ignoreIndex: number | null = null): boolean {
    const newStart = this.parseTimeToMinutes(start);
    const newEnd = this.parseTimeToMinutes(end);

    return this.slots.controls.some((slot, index) => {
      if (index === ignoreIndex) return false;

      const slotStartDate: Date = new Date(slot.value.startdate);
      const slotEndDate: Date = new Date(slot.value.enddate);
      if (!slotStartDate) return false;

      // Check if the given date falls within the slot's date range
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const rangeStart = new Date(slotStartDate.getFullYear(), slotStartDate.getMonth(), slotStartDate.getDate());
      const rangeEnd = new Date(slotEndDate.getFullYear(), slotEndDate.getMonth(), slotEndDate.getDate());

      if (dateOnly < rangeStart || dateOnly > rangeEnd) return false;

      const s = this.parseTimeToMinutes(slot.value.start);
      const e = this.parseTimeToMinutes(slot.value.end);

      return (newStart < e && newEnd > s);
    });
  }

  onSubmit(): void {
    this.loading.set(true);
    //Create payload to send to backend, including images and form data
    const basicVenueDetails = {
      name: this.basicDetailsForm.value.name,
      location: this.basicDetailsForm.value.location,
      capacity: this.basicDetailsForm.value.capacity, 
      type: this.basicDetailsForm.value.venueType,
      address: this.basicDetailsForm.value.address,
      carParking: this.basicDetailsForm.value.carParking,
      swimmingPool: this.basicDetailsForm.value.swimmingPool,
      cateringProvided: this.basicDetailsForm.value.outsideCatering,
      outsideServicesAllowed: this.basicDetailsForm.value.outsideServicesAllowed,
      additional: this.basicDetailsForm.value.description,
    }
    
    this.venueService.createVenue(basicVenueDetails).pipe(
      switchMap((response: any) => {  
        const venueId = response;
        const form = this.slotManagementForm.value;
  
        const slotRequests = form.slots.map((slot: any) => {
          const request: any = {
            startDateTime: this.combineDateAndTime(slot.startdate, slot.start),
            endDateTime:   this.combineDateAndTime(slot.enddate, slot.end),
            slotType:      slot.slotType,
            totalSlotPrice: slot.price,
          };
          if (slot.slotType === 'FLEXIBLE') {
            request.minSlotTime  = slot.minSlotTime;
            request.maxSlotTime  = slot.maxSlotTime;
            request.minSlotPrice = slot.minSlotPrice;
            request.bufferTime   = slot.bufferTime;
          }
          return request; // just build the object now, don't call the API yet
        });
        // Images start immediately — independent of slot dry-run/confirm flow
        const images$ = this.venueImages().length > 0
          ? this.venueService.uploadImages(venueId, this.venueImages().map(img => img.file), 0)
          : of([]);
        
        // Slot pipeline runs its own dry-run -> optional confirm -> real create
        const slots$ = this.runSlotPipeline(venueId, slotRequests);
        
        return forkJoin({ slot: slots$, images: images$ });

        //create form data for images and slots
        // return forkJoin({
        //   slot: slotRequests.length > 0 ? this.venueService.createSlotsBulk(venueId, slotRequests, false): of([]),
        //   images: this.venueImages().length > 0 ? this.venueService.uploadImages(
        //     venueId,
        //     this.venueImages().map(img => img.file),
        //     0
        //   ) : of([]),
        // });
      })
    ).subscribe({
      next: (result) => {
        this.loading.set(false);

        if (result.slot === null) {
          // images may have succeeded independently — still worth reporting accurately
          this.openSnackBar('Venue created, but slot creation was cancelled.');
          this.router.navigate(['/venues']);
          return;
        }

        console.log('forkJoin result', result);
        this.openSnackBar('Venue created successfully!');
        setTimeout(() => {
          this.router.navigate(['/venues']);
        }, 0);
      },
      error: (error) => {
        console.log('Error creating venue', error);
        this.openSnackBar('Error creating venue. Please try again.');
        this.loading.set(false);
      }
    });
  }

  /** Dry-run -> conditional confirm -> real slot create. Emits null if user declines after warnings. */
  private runSlotPipeline(venueId: any, slotRequests: any[]) {
    if (slotRequests.length === 0) {
      return of([]);
    }

    return this.callSlotApi(venueId, slotRequests, true).pipe(
      switchMap((dryRunText: string) => {
        const warnings = this.extractWarnings(dryRunText);

        if (warnings.length === 0) {
          return this.callSlotApi(venueId, slotRequests, false);
        }

        return this.confirmWarnings(warnings).pipe(
          switchMap(confirmed =>
            confirmed
              ? this.callSlotApi(venueId, slotRequests, false)
              : of(null)
          )
        );
      })
    );
  }

  /** Routes to the singular endpoint for exactly one slot, bulk otherwise. */
  private callSlotApi(venueId: any, slotRequests: any[], dryRun: boolean): Observable<string> {
    if (slotRequests.length === 0) {
      return of('');
    }
    if (slotRequests.length === 1) {
      return this.venueService.createSlot(venueId, slotRequests[0], dryRun);
    }
    return this.venueService.createSlotsBulk(venueId, slotRequests, dryRun);
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
  
  cancelWizard(): void {
    this.router.navigate(['/venues']);
  }
  
  private combineDateAndTime(date: Date, time: Date): string {
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

  // ── Image Upload ──

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
      input.value = ''; // reset so same file can be re-added after removal
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(Array.from(files));
    }
  }

  private processFiles(files: File[]): void {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    imageFiles.forEach(file => {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.venueImages.update(images => [
          ...images,
          {
            file,
            dataUrl: e.target?.result as string
          }
        ]);
      };

      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.venueImages.update(images =>
      images.filter((_, i) => i !== index)
    );
  }


  get slots() {
    return this.slotManagementForm.get('slots') as FormArray;

  }

  removeSlot(index: number) {
    this.slots.removeAt(index);
  }

  editSlot(index: number) {
    const slot = this.slots.at(index).value;
    this.editingIndex = index;

    this.slotManagementForm.get('day')?.setValue(slot.day);

    this.slotAddForm.patchValue({
      start: slot.start,
      end: slot.end,
      price: slot.price,
      minSlotTime: slot.minSlotTime ?? null,
      minSlotPrice: slot.minSlotPrice ?? null,
      maxSlotTime: slot.maxSlotTime ?? null,
      bufferTime: slot.bufferTime ?? null,
    });
  }

  parseTimeToMinutes(time: Date): number {
    return time.getHours() * 60 + time.getMinutes();
  }

  addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  addSlotFromForm() {
    const form = this.slotManagementForm.value;
    const slotForm = this.slotAddForm.value;
    const slotType = form.slotType;

    const startTime = this.parseTimeToMinutes(slotForm.start);
    const endTime = this.parseTimeToMinutes(slotForm.end);
    const minSlotTime = slotForm.minSlotTime || 0;
    const maxSlotTime = slotForm.maxSlotTime || 0;
    const bufferTime = slotForm.bufferTime || 0;

    if (startTime >= endTime) {
      this.openSnackBar('Start time must be before end time.');
      return;
    }

    if(form.startDate > form.endDate) {
      this.openSnackBar('Start date must be before end date.');
      return;
    }

    if (slotType === 'FLEXIBLE') {
      if (slotForm.minSlotTime <= 0) {
        this.openSnackBar('Minimum slot time must be greater than 0.');
        return;
      }
      if(minSlotTime > (endTime - startTime)) {
        this.openSnackBar('Minimum slot time cannot be greater than the total slot duration.');
        return;
      }
      if (maxSlotTime && maxSlotTime > (endTime - startTime)) {
        this.openSnackBar('Maximum slot time cannot be greater than the total slot duration.');
        return;
      }
      if (bufferTime > (endTime - startTime)) {
        this.openSnackBar('Buffer time cannot be greater than the total slot duration.');
        return;
      }
      if (slotForm.minSlotPrice > slotForm.price) {
        this.openSnackBar('Minimum slot price cannot be greater than the total slot price.');
        return;
      }
    }

    const targetRanges = this.computeTargetDateRanges();
    console.log("targetRanges", targetRanges);
    if (targetRanges.length === 0) {
      this.openSnackBar('No dates matched your selection — check your day-of-week filters.');
      return;
    }

    // Check every calendar day touched by every generated range for overlaps
    const conflictDates = new Set<string>();
    for (const range of targetRanges) {
      for (const day of this.getDatesBetween(range.start, range.end)) {
        if (this.isOverlapping(slotForm.start, slotForm.end, day, this.editingIndex)) {
          conflictDates.add(day.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
        }
      }
    }
    if (conflictDates.size > 0) {
      this.openSnackBar(`Skipped — overlaps an existing slot on: ${[...conflictDates].join(', ')}`);
      return;
    }

    if (this.editingIndex !== null) {
      this.slots.removeAt(this.editingIndex);
      this.editingIndex = null;
    }

    targetRanges.forEach(range => {
      const slotGroup: any = {
        slotType,
        startdate: [range.start, Validators.required],
        enddate:   [range.end, Validators.required],
        start:     [slotForm.start, Validators.required],
        end:       [slotForm.end, Validators.required],
        price:     [slotForm.price, [Validators.required, Validators.min(0)]],
      };
      if (slotType === 'FLEXIBLE') {
        slotGroup.minSlotTime  = [slotForm.minSlotTime, [Validators.required, Validators.min(1)]];
        slotGroup.maxSlotTime  = [slotForm.maxSlotTime];
        slotGroup.minSlotPrice = [slotForm.minSlotPrice, [Validators.required, Validators.min(0)]];
        slotGroup.bufferTime   = [slotForm.bufferTime, [Validators.required, Validators.min(0)]];
      }
      this.slots.push(this.fb.group(slotGroup));
    });

    this.sortSlots();
    this.slotAddForm.reset();
    this.daysSelected = [];
    this.slotManagementForm.patchValue({ applyToOtherDates: false, selectedDates: [] });

    // const slotGroup: any = {
    //   slotType,
    //   startdate: [form.startDate, Validators.required],
    //   enddate: [form.endDate, Validators.required],
    //   start: [slotForm.start, Validators.required],
    //   end: [slotForm.end, Validators.required],
    //   price: [slotForm.price, [Validators.required, Validators.min(0)]],
    // };
    // if (slotType === 'FLEXIBLE') {
    //   slotGroup.minSlotTime = [slotForm.minSlotTime, [Validators.required, Validators.min(1)]];
    //   slotGroup.maxSlotTime = [slotForm.maxSlotTime];
    //   slotGroup.minSlotPrice = [slotForm.minSlotPrice, [Validators.required, Validators.min(0)]];
    //   slotGroup.bufferTime = [slotForm.bufferTime, [Validators.required, Validators.min(0)]];
    // }
    // this.slots.push(this.fb.group(slotGroup));

    // this.sortSlots();
    // this.slotAddForm.reset();
  }

  getDatesBetween(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    let current = new Date(start);  

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    } 

    return dates;
  }
  
  
  sortSlots() {
    this.slots.controls.sort((a, b) => {
      const dateA = new Date(a.value.startdate).getTime();
      const dateB = new Date(b.value.startdate).getTime();

      if (dateA !== dateB) {
        return dateA - dateB; // sort by date first
      }

      const startA = this.parseTimeToMinutes(a.value.start);
      const startB = this.parseTimeToMinutes(b.value.start);

      return startA - startB; // then by start time
    });
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private isSameDay(a: Date, b: Date): boolean {
    return this.stripTime(a).getTime() === this.stripTime(b).getTime();
  }

  /** Computes every {start,end} occurrence this "Add Slot" click should produce. */
  computeTargetDateRanges(): { start: Date; end: Date }[] {
    const form = this.slotManagementForm.value;
    const baseStart: Date = form.startDate;
    const baseEnd: Date = form.endDate;

    if (!form.applyToOtherDates) {
      return [{ start: baseStart, end: baseEnd }];
    }

    // applyToOtherDates is only ever true for single-day base slots (enforced via
    // syncApplyToOtherDatesAvailability), so every replicated occurrence is 1 day.
    if (form.applyMode === 'selectedDates') {
      const starts = [...this.daysSelected];
      if (!starts.some(d => this.isSameDay(d, baseStart))) {
        starts.unshift(baseStart);
      }
      return starts
        .sort((a, b) => a.getTime() - b.getTime())
        .map(start => ({ start, end: start }));
    }

    // dateRange mode
    const rangeEnd: Date = form.applyEndDate ?? baseStart;
    const allowedDays: boolean[] = form.daysOfWeek;

    return this.getDatesBetween(baseStart, rangeEnd)
      .filter(d => allowedDays[d.getDay()])
      .map(start => ({ start, end: start }));
  }

  get isMultiDaySlot(): boolean {
    const start: Date = this.slotManagementForm.get('startDate')?.value;
    const end: Date = this.slotManagementForm.get('endDate')?.value;
    if (!start || !end) return false;
    return !this.isSameDay(start, end);
  }
}
