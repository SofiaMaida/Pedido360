import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mesero } from './mesero';

describe('Mesero', () => {
  let component: Mesero;
  let fixture: ComponentFixture<Mesero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mesero]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mesero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
