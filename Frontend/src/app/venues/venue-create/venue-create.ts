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
import { forkJoin, switchMap } from 'rxjs';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { signal } from '@angular/core';
import { Loader } from '../../shared/loader/loader';
import { Router } from '@angular/router';

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
  multipleSlots = false;
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
              private venueService: VenueService, private router: Router) {}

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

      if (slotType === 'flexible') {
        minSlotTimeCtrl?.setValidators([Validators.required, Validators.min(1)]);
        maxSlotTimeCtrl?.setValidators([Validators.required, Validators.min(1)]);
        minSlotPriceCtrl?.setValidators([Validators.required, Validators.min(0)]);
        bufferTimeCtrl?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        minSlotTimeCtrl?.clearValidators();
        maxSlotTimeCtrl?.clearValidators();
        minSlotPriceCtrl?.clearValidators();
        bufferTimeCtrl?.clearValidators();
      }

      minSlotTimeCtrl?.updateValueAndValidity();
      maxSlotTimeCtrl?.updateValueAndValidity();
      minSlotPriceCtrl?.updateValueAndValidity();
      bufferTimeCtrl?.updateValueAndValidity();
    });
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
  
        const slot = form.slots[0]; // only one slot
        const slotRequest = {
          startDateTime: this.combineDateAndTime(form.startDate, slot.start),
          endDateTime: this.combineDateAndTime(form.endDate, slot.end),
          slotType: form.slotType,
          minSlotTime: slot.minSlotTime,
          maxSlotTime: slot.maxSlotTime,
          bufferTime: slot.bufferTime,
          totalSlotPrice: slot.price
        };
        //create form data for images and slots
        return forkJoin({
          slot: this.venueService.createSlot(
            venueId,
            slotRequest,
            false
          ),
          images: this.venueService.uploadImages(
            venueId,
            this.venueImages().map(img => img.file),
            0
          ),
        });
      })
    ).subscribe({
      next: (result) => {
        console.log('forkJoin result', result);
        this.openSnackBar('Venue created successfully!');
        this.loading.set(false);
        //reroute to venue list page after short delay to show snackbar
        setTimeout(() => {
          this.router.navigate(['/venues']);
        }, 2000);
      },
      error: (error) => {
        console.log('Error creating venue', error);
        this.openSnackBar('Error creating venue. Please try again.');
        this.loading.set(false);
      }
    });
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

    if (slotType === 'flexible') {
      if (slotForm.minSlotTime <= 0) {
        this.openSnackBar('Minimum slot time must be greater than 0.');
        return;
      }
      if(minSlotTime > (endTime - startTime)) {
        this.openSnackBar('Minimum slot time cannot be greater than the total slot duration.');
        return;
      }
      if (maxSlotTime > (endTime - startTime)) {
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

    if (this.editingIndex !== null) {
      this.slots.removeAt(this.editingIndex);
      this.editingIndex = null;
    }

    const slotGroup: any = {
      slotType,
      startdate: [form.startDate, Validators.required],
      enddate: [form.endDate, Validators.required],
      start: [slotForm.start, Validators.required],
      end: [slotForm.end, Validators.required],
      price: [slotForm.price, [Validators.required, Validators.min(0)]],
    };
    if (slotType === 'flexible') {
      slotGroup.minSlotTime = [slotForm.minSlotTime, [Validators.required, Validators.min(1)]];
      slotGroup.maxSlotTime = [slotForm.maxSlotTime, [Validators.required, Validators.min(1)]];
      slotGroup.minSlotPrice = [slotForm.minSlotPrice, [Validators.required, Validators.min(0)]];
      slotGroup.bufferTime = [slotForm.bufferTime, [Validators.required, Validators.min(0)]];
    }
    this.slots.push(this.fb.group(slotGroup));

    this.sortSlots();
    this.slotAddForm.reset();
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
}
