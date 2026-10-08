import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingStateComponent } from './processing-state.component';

describe('ProcessingStateComponent', () => {
  let component: ProcessingStateComponent;
  let fixture: ComponentFixture<ProcessingStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessingStateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
