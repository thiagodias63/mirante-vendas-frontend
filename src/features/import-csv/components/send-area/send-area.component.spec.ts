import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ToastService } from '../../../../shared/toast/toast.service';
import { ProcessDataFactory } from '../../core/factories/process-data.factory';
import { ProcessData } from '../../core/interfaces/process-data';
import { CsvVenda } from '../../core/interfaces/csv-venda';
import { SendAreaComponent } from './send-area.component';

describe('SendAreaComponent', () => {
	let fixture: ComponentFixture<SendAreaComponent>;
	let factory: jasmine.SpyObj<ProcessDataFactory>;
	let toast: jasmine.SpyObj<ToastService>;
	const sales: CsvVenda[] = [{ produto: 'Camiseta', quantidade: 1, precoUnitario: 49.9, dataVenda: '06/09/2026' }];

	beforeEach(async () => {
		factory = jasmine.createSpyObj<ProcessDataFactory>('ProcessDataFactory', ['create']);
		toast = jasmine.createSpyObj<ToastService>('ToastService', ['showToast', 'dismissToast']);
		await TestBed.configureTestingModule({
			declarations: [SendAreaComponent],
			imports: [CommonModule],
			providers: [
				{ provide: ProcessDataFactory, useValue: factory },
				{ provide: ToastService, useValue: toast },
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(SendAreaComponent);
		fixture.componentInstance.processedSales = sales;
		fixture.detectChanges();
	});

	it('should creates with the simultaneous strategy selected by default', () => {
		expect(fixture.componentInstance.processMode).toBe('simultaneous');
		expect(fixture.nativeElement.textContent).toContain('Enviar vendas ao backend');
	});

	it('should returns to upload by emitting an empty sales list', () => {
		const change = jasmine.createSpy('processedSalesChange');
		fixture.componentInstance.processedSalesChange.subscribe(change);
		fixture.componentInstance.goBack();
		expect(change).toHaveBeenCalledWith([]);
	});

	it('does not send when sales are empty or the component is busy', () => {
		fixture.componentInstance.processedSales = [];
		fixture.componentInstance.sendSales();
		fixture.componentInstance.processedSales = sales;
		fixture.componentInstance.sending = true;
		fixture.componentInstance.sendSales();
		fixture.componentInstance.sending = false;
		fixture.componentInstance.loading = true;
		fixture.componentInstance.sendSales();
		expect(factory.create).not.toHaveBeenCalled();
	});

	it('should sends using the selected strategy and reports the number of sales', () => {
		const processor = jasmine.createSpyObj<ProcessData>('ProcessData', ['send']);
		processor.send.and.returnValue(of({ id: 1 }));
		factory.create.and.returnValue(processor);
		fixture.componentInstance.processMode = 'sequential';
		const sending = jasmine.createSpy('sendingChange');
		fixture.componentInstance.sendingChange.subscribe(sending);

		fixture.componentInstance.sendSales();

		expect(factory.create).toHaveBeenCalledWith('sequential');
		expect(processor.send).toHaveBeenCalledWith(sales);
		expect(sending).toHaveBeenCalledWith(true);
		expect(sending).toHaveBeenCalledWith(false);
		const toastCall = toast.showToast.calls.mostRecent().args;
		expect(toastCall[0]).toContain('Envio');
		expect(toastCall[1]).toBe('1 venda enviada com sucesso.');
		expect(toastCall[2]).toBe('success');
	});

	it('should reports a backend failure and clears the sending state', () => {
		const processor = jasmine.createSpyObj<ProcessData>('ProcessData', ['send']);
		processor.send.and.returnValue(throwError(() => ({ error: { message: 'backend failed' } })));
		factory.create.and.returnValue(processor);
		const sending = jasmine.createSpy('sendingChange');
		fixture.componentInstance.sendingChange.subscribe(sending);

		fixture.componentInstance.sendSales();

		expect(sending).toHaveBeenCalledWith(false);
		expect(toast.showToast).toHaveBeenCalledWith('Erro ao enviar vendas', 'backend failed', 'error');
	});

	it('should shows a useful error when the strategy cannot be created', () => {
		factory.create.and.throwError('unsupported mode');
		fixture.componentInstance.sendSales();
		expect(toast.showToast).toHaveBeenCalledWith('Erro ao enviar vendas', 'unsupported mode', 'error');
	});
});
