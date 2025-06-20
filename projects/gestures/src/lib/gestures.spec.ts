import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gestures } from './gestures';

describe('Gestures', () => {
  let component: Gestures;
  let fixture: ComponentFixture<Gestures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gestures]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gestures);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
