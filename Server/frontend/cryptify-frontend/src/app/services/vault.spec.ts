import { TestBed } from '@angular/core/testing';

import { Vault } from './vault';

describe('Vault', () => {
  let service: Vault;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Vault);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
