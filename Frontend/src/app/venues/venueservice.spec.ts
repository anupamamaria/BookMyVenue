import { TestBed } from '@angular/core/testing';

import { Venueservice } from './venueservice';

describe('Venueservice', () => {
  let service: Venueservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Venueservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
