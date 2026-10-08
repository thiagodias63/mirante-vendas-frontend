import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';

describe('ToastComponent', () => {
	let fixture: ComponentFixture<ToastComponent>;
	let service: ToastService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ToastComponent],
			imports: [CommonModule],
			providers: [ToastService],
		}).compileComponents();
		service = TestBed.inject(ToastService);
		fixture = TestBed.createComponent(ToastComponent);
		fixture.detectChanges();
	});

	it('stays hidden until a toast is published', () => {
		expect(fixture.nativeElement.querySelector('.toast-container')).toBeNull();
	});

	it('renders toast content and dismisses it on close', () => {
		service.showToast('Import complete', '2 sales ready', 'success');
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.toast-success')).toBeTruthy();
		expect(fixture.nativeElement.textContent).toContain('Import complete');
		expect(fixture.nativeElement.textContent).toContain('2 sales ready');
		(fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.toast-container')).toBeNull();
	});
});
