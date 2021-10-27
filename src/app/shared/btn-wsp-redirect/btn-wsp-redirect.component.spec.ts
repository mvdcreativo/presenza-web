import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnWspRedirectComponent } from './btn-wsp-redirect.component';

describe('BtnWspRedirectComponent', () => {
  let component: BtnWspRedirectComponent;
  let fixture: ComponentFixture<BtnWspRedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BtnWspRedirectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnWspRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
