import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueCard } from './venue-card';

describe('VenueCard', () => {
  let component: VenueCard;
  let fixture: ComponentFixture<VenueCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueCard],
    }).compileComponents();

    fixture = TestBed.createComponent(VenueCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
