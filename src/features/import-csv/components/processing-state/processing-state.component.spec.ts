import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ProcessingStateComponent } from './processing-state.component';

describe('ProcessingStateComponent', () => {
	let fixture: ComponentFixture<ProcessingStateComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ProcessingStateComponent],
			imports: [CommonModule],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(ProcessingStateComponent);
	});

	it('should hides its progress indicator when idle', () => {
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.processing-state')).toBeNull();
	});

	it('should shows the loading message while processing a file', () => {
		fixture.componentInstance.loading = true;
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.processing-state')).toBeTruthy();
		expect(fixture.nativeElement.textContent).toContain('Validando e processando seu arquivo');
	});

	it('should shows the sending message while submitting sales', () => {
		fixture.componentInstance.sending = true;
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Enviando vendas ao backend');
	});
});
