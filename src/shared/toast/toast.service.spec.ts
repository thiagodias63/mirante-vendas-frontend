import { TestBed } from '@angular/core/testing';
import { Toast } from './toast';
import { ToastService } from './toast.service';

describe('ToastService', () => {
	let service: ToastService;
	let emitted: Toast[];

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ToastService);
		emitted = [];
		service.toast$().subscribe((toast) => emitted.push(toast));
	});

	it('should publishes a success toast to subscribers', () => {
		service.showToast('Saved', 'Sales saved', 'success');
		expect(emitted).toEqual([null, { title: 'Saved', message: 'Sales saved', type: 'success' }]);
	});

	it('should publishes an error toast and clears it when dismissed', () => {
		service.showToast('Error', 'Request failed', 'error');
		service.dismissToast();
		expect(emitted[1]).toEqual({ title: 'Error', message: 'Request failed', type: 'error' });
		expect(emitted[2]).toBeNull();
	});
});
