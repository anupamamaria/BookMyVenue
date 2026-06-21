import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingLoader } from './booking-loader';

describe('BookingLoader', () => {
  let component: BookingLoader;
  let fixture: ComponentFixture<BookingLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingLoader],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingLoader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
