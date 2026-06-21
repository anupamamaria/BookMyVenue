import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingBanner } from './booking-banner';

describe('BookingBanner', () => {
  let component: BookingBanner;
  let fixture: ComponentFixture<BookingBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingBanner],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingBanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
