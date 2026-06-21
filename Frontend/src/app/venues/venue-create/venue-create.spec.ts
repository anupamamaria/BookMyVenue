import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueCreate } from './venue-create';

describe('VenueCreate', () => {
  let component: VenueCreate;
  let fixture: ComponentFixture<VenueCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(VenueCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
