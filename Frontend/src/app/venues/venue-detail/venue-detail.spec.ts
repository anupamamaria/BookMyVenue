import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueDetail } from './venue-detail';

describe('VenueDetail', () => {
  let component: VenueDetail;
  let fixture: ComponentFixture<VenueDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(VenueDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
