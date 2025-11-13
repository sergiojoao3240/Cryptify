import { TestBed } from '@angular/core/testing';

import { VaultUser } from './vault-user';

describe('VaultUser', () => {
  let service: VaultUser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VaultUser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
