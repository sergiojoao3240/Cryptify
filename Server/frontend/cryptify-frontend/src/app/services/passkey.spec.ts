import { TestBed } from '@angular/core/testing';

import { Passkey } from './passkey';

describe('Passkey', () => {
  let service: Passkey;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Passkey);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
