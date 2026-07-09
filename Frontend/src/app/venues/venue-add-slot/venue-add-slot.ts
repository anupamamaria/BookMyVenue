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

  /** Show / hide the drawer */
  @Input() open = false;
  @Input() editSlot: VenueManageSlot | null = null;

  /** Fired when the user cancels or after a successful save */
  @Output() closeDrawer = new EventEmitter<void>();

  /** Fired with the validated payload — parent calls the API */
  @Output() slotAdded = new EventEmitter<AddSlotPayload>();
  @Output() slotEdited = new EventEmitter<EditSlotPayload>();


  readonly minDate = new Date();
  isEnabled = false; // for repeat section

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
      minSlotTime:    [null],
      maxSlotTime:    [null],
      minSlotPrice:   [null],
      bufferTime:     [0],
      // repeat
      repeatEnabled:  [false],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
   if (changes['open']?.currentValue === true) {
      if (this.editSlot) {
        this.prefillForEdit(this.editSlot);
      } else {
        this.form.reset({ slotType: 'FIXED', bufferTime: 0, repeatEnabled: false });
        this.selectedDays.clear();
      }
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

  toggleDay(val: number): void {
    this.selectedDays.has(val) ? this.selectedDays.delete(val) : this.selectedDays.add(val);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // getRawValue() needed because slotType is disabled in edit mode —
    // disabled controls are excluded from .value but included in .getRawValue()
    const v = this.form.getRawValue();
    console.log("v", v);
    const toIso = (d: Date | null): string => {
      if (!d) return '';
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const basePayload: AddSlotPayload = {
      slotType:       v.slotType,
      startDate:      v.startDate,
      endDate:        v.endDate,
      startTime:      v.startTime,
      endTime:        v.endTime,
      totalSlotPrice: v.totalSlotPrice,
      ...(v.slotType === 'FLEXIBLE' && {
        minSlotTime:  v.minSlotTime,
        maxSlotTime:  v.maxSlotTime,
        minSlotPrice: v.minSlotPrice,
        bufferTime:   v.bufferTime ?? 0,
      }),
      ...(this.repeatEnabled && this.selectedDays.size > 0 && {
        repeatDays: [...this.selectedDays].sort(),
      }),
    };

    if (this.isEditMode) {
      console.log({ ...basePayload, slotId: this.editSlot!.slotId });
      this.slotEdited.emit({ ...basePayload, slotId: this.editSlot!.slotId });
    } else {
      this.slotAdded.emit(basePayload);
    }
    this.closeDrawer.emit();
  }

  close(): void {
    this.form.get('slotType')?.enable(); // reset lock state for next open
    this.closeDrawer.emit();
  }
}
