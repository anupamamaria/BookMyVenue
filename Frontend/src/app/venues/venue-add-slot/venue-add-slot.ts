import {Component,EventEmitter,Input,OnChanges,Output,SimpleChanges,} from '@angular/core';
import {FormBuilder,FormGroup,ReactiveFormsModule,Validators,} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { VenueManageSlot } from '../../shared/models/venue';

export interface AddSlotPayload {
  slotType: 'FIXED' | 'FLEXIBLE';
  startDate: Date;   // YYYY-MM-DD
  endDate: Date;     // YYYY-MM-DD
  startTime: Date;   // HH:mm
  endTime: Date;     // HH:mm
  totalSlotPrice: number;
  // FLEXIBLE only
  minSlotTime?: number;
  maxSlotTime?: number;
  minSlotPrice?: number;
  bufferTime?: number;
  // repeat options
  repeatDays?: number[]; // 0=Sun … 6=Sat
}

export interface EditSlotPayload extends AddSlotPayload {
  slotId: number;
}

@Component({
  selector: 'app-venue-add-slot',
  imports: [CommonModule,ReactiveFormsModule,MatButtonModule,MatIconModule,MatFormFieldModule,
            MatInputModule,MatSelectModule,MatRadioModule,MatDatepickerModule,MatNativeDateModule,
            MatCheckboxModule,MatDividerModule,MatTimepickerModule,
  ],
  templateUrl: './venue-add-slot.html',
  styleUrl:    './venue-add-slot.scss',
})
export class VenueAddSlotComponent implements OnChanges {
  @Input() open = false;
  @Input() editSlot: VenueManageSlot | null = null;

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() slotsAdded = new EventEmitter<AddSlotPayload[]>();
  @Output() slotEdited = new EventEmitter<EditSlotPayload>();
  
  readonly minDate = new Date();
  repeatDaysError = false;
  repeatUntilError = false;

  readonly weekDays = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ];

  selectedDays = new Set<number>();
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      slotType:       ['FIXED', Validators.required],
      startDate:      [null,    Validators.required],
      endDate:        [null,    Validators.required],
      startTime:      ['',      Validators.required],
      endTime:        ['',      Validators.required],
      totalSlotPrice: [null,    [Validators.required, Validators.min(1)]],
      // flexible
      minSlotTime:    [null, [Validators.required, Validators.min(1)]],
      maxSlotTime:    [null],
      minSlotPrice:   [null, [Validators.required, Validators.min(1)]],
      bufferTime:     [0, Validators.required],
      // repeat
      repeatEnabled:  [false],
      repeatUntil:    [null],
    });
    this.form.get('startDate')?.valueChanges.subscribe(() => this.syncRepeatAvailability());
    this.form.get('endDate')?.valueChanges.subscribe(() => this.syncRepeatAvailability());
  }

  ngOnChanges(changes: SimpleChanges): void {
   if (changes['open']?.currentValue === true) {
      if (this.editSlot) {
        this.prefillForEdit(this.editSlot);
      } else {
        this.form.reset({ slotType: 'FIXED', bufferTime: 0, repeatEnabled: false });
        this.selectedDays.clear();
      }
      this.repeatDaysError = false;
      this.repeatUntilError = false;
    }
  }

  get isFlexible(): boolean {
    return this.form.get('slotType')?.value === 'FLEXIBLE';
  }

  get isEditMode(): boolean {
    return this.editSlot !== null;
  }

  get repeatEnabled(): boolean {
    return !!this.form.get('repeatEnabled')?.value;
  }
  
  get isMultiDayRange(): boolean {
    const start: Date = this.form.get('startDate')?.value;
    const end: Date = this.form.get('endDate')?.value;
    if (!start || !end) return false;
    return this.stripTime(start).getTime() !== this.stripTime(end).getTime();
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private isSameDay(a: Date, b: Date): boolean {
    return this.stripTime(a).getTime() === this.stripTime(b).getTime();
  }

  private syncRepeatAvailability(): void {
    const repeatEnabledCtrl = this.form.get('repeatEnabled');
    const repeatUntilCtrl = this.form.get('repeatUntil');

    if (this.isMultiDayRange) {
      this.form.get('repeatEnabled')?.setValue(false, { emitEvent: false });
      this.form.get('repeatUntil')?.setValue(null, { emitEvent: false });
      this.selectedDays.clear();
      this.repeatDaysError = false;
      this.repeatUntilError = false;
      repeatEnabledCtrl?.setValue(false, { emitEvent: false });
      repeatEnabledCtrl?.disable({ emitEvent: false });
      repeatUntilCtrl?.setValue(null, { emitEvent: false });
      repeatUntilCtrl?.disable({ emitEvent: false });
    }
    else
    {
      repeatEnabledCtrl?.enable({ emitEvent: false });
      repeatUntilCtrl?.enable({ emitEvent: false });
    }
  }

  toggleDay(val: number): void {
    this.selectedDays.has(val) ? this.selectedDays.delete(val) : this.selectedDays.add(val);
    if (this.selectedDays.size > 0) this.repeatDaysError = false; // ADD
  }

  private computeTargetDates(baseStart: Date, repeatUntil: Date | null): Date[] {
    if (!this.repeatEnabled || !repeatUntil) {
      return [baseStart];
    }
    const dates: Date[] = [];
    const end = this.stripTime(repeatUntil);
    let current = new Date(baseStart);

    while (this.stripTime(current).getTime() <= end.getTime()) {
      if (this.selectedDays.has(current.getDay())) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    // always include the originally-entered date, even if its weekday wasn't chip-selected
    if (!dates.some(d => this.isSameDay(d, baseStart))) {
      dates.unshift(new Date(baseStart));
    }
    return dates.sort((a, b) => a.getTime() - b.getTime());
  }

  private prefillForEdit(slot: VenueManageSlot): void {
    const start = new Date(slot.startDateTime);
    const end = new Date(slot.endDateTime);

    this.form.reset({
      slotType:       slot.slotType,
      startDate:      start,
      endDate:        end,
      startTime:      start,   // mat-timepicker binds to Date objects too
      endTime:        end,
      totalSlotPrice: slot.totalSlotPrice,
      minSlotTime:    slot.minSlotTime,
      maxSlotTime:    slot.maxSlotTime,
      minSlotPrice:   slot.minSlotPrice,
      bufferTime:     slot.bufferTime ?? 0,
      repeatEnabled:  false,
    });
    this.selectedDays.clear();

    // Lock slot type — can't be changed once created
    this.form.get('slotType')?.disable();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    if (this.repeatEnabled) {
      if (this.selectedDays.size === 0) {
        this.repeatDaysError = true;
        return;
      }
      if (!this.form.get('repeatUntil')?.value) {
        this.repeatUntilError = true;
        return;
      }
    }

    // getRawValue() needed because slotType is disabled in edit mode —
    // disabled controls are excluded from .value but included in .getRawValue()
    const v = this.form.getRawValue();
    console.log("Data is ", v);
    const toPayload = (startDate: Date, endDate: Date): AddSlotPayload => ({
      slotType:       v.slotType,
      startDate,
      endDate,
      startTime:      v.startTime,
      endTime:        v.endTime,
      totalSlotPrice: v.totalSlotPrice,
      ...(v.slotType === 'FLEXIBLE' && {
        minSlotTime:  v.minSlotTime,
        maxSlotTime:  v.maxSlotTime,
        minSlotPrice: v.minSlotPrice,
        bufferTime:   v.bufferTime ?? 0,
      }),
    });

    if (this.isEditMode) {
      const payload = toPayload(v.startDate, v.endDate);
      this.slotEdited.emit({ ...payload, slotId: this.editSlot!.slotId });
      this.closeDrawer.emit();
      return;
    }

    const targetDates = this.computeTargetDates(v.startDate, v.repeatUntil);
    const payloads = targetDates.map(d => toPayload(d, d));
    this.slotsAdded.emit(payloads);
    this.closeDrawer.emit();
  }

  close(): void {
    this.form.get('slotType')?.enable(); // reset lock state for next open
    this.closeDrawer.emit();
  }
}
