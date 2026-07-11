import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueBookingList } from './venue-booking-list';

describe('VenueBookingList', () => {
  let component: VenueBookingList;
  let fixture: ComponentFixture<VenueBookingList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueBookingList],
    }).compileComponents();

    fixture = TestBed.createComponent(VenueBookingList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
