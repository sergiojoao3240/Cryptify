import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyPin } from './verify-pin';

describe('VerifyPin', () => {
  let component: VerifyPin;
  let fixture: ComponentFixture<VerifyPin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyPin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyPin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
