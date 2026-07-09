import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueAddSlot } from './venue-add-slot';

describe('VenueAddSlot', () => {
  let component: VenueAddSlot;
  let fixture: ComponentFixture<VenueAddSlot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueAddSlot],
    }).compileComponents();

    fixture = TestBed.createComponent(VenueAddSlot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
