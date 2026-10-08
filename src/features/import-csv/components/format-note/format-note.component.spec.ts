import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatNoteComponent } from './format-note.component';

describe('FormatNoteComponent', () => {
  let component: FormatNoteComponent;
  let fixture: ComponentFixture<FormatNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormatNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormatNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
