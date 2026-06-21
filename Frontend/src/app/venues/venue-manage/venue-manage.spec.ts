import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueManage } from './venue-manage';

describe('VenueManage', () => {
  let component: VenueManage;
  let fixture: ComponentFixture<VenueManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueManage],
    }).compileComponents();

    fixture = TestBed.createComponent(VenueManage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
