import { TestBed } from '@angular/core/testing';

import { HdrLoaderService } from './hdr-loader.service';

describe('HdrLoaderService', () => {
  let service: HdrLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HdrLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
