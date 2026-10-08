import { CommonModule } from '@angular/common';
import { fakeAsync, flushMicrotasks, ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ProcessCsvService } from '../../core/service/process-csv.service';
import { CsvVenda } from '../../core/interfaces/csv-venda';
import { ToastService } from '../../../../shared/toast/toast.service';
import { FileUpload } from 'primeng/fileupload';
import { UploadAreaComponent } from './upload-area.component';

describe('UploadAreaComponent', () => {
	let fixture: ComponentFixture<UploadAreaComponent>;
	let processCsv: jasmine.SpyObj<ProcessCsvService>;
	let toast: jasmine.SpyObj<ToastService>;

	const sales: CsvVenda[] = [{ id_venda: 1, produto: 'Camiseta', quantidade: 2, preco_unitario: 49.9, data_venda: '06/09/2026' }];

	beforeEach(async () => {
		processCsv = jasmine.createSpyObj<ProcessCsvService>('ProcessCsvService', ['process']);
		toast = jasmine.createSpyObj<ToastService>('ToastService', ['showToast', 'dismissToast']);
		await TestBed.configureTestingModule({
			declarations: [UploadAreaComponent],
			imports: [CommonModule],
			providers: [
				{ provide: ProcessCsvService, useValue: processCsv },
				{ provide: ToastService, useValue: toast },
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(UploadAreaComponent);
		fixture.detectChanges();
	});

	it('emits the selected file, clears prior sales and resets the upload control', () => {
		const file = new File(['csv'], 'vendas.csv');
		fixture.componentInstance.fileUploadRef = jasmine.createSpyObj('FileUpload', ['clear']) as unknown as FileUpload;
		const fileChange = jasmine.createSpy('fileChange');
		const salesChange = jasmine.createSpy('salesChange');
		fixture.componentInstance.selectedFileChange.subscribe(fileChange);
		fixture.componentInstance.processedSalesChange.subscribe(salesChange);

		fixture.componentInstance.onFileSelect({ files: [file] });

		expect(fileChange).toHaveBeenCalledWith(file);
		expect(salesChange).toHaveBeenCalledWith([]);
		expect(fixture.componentInstance.fileUploadRef.clear).toHaveBeenCalled();
		expect(toast.dismissToast).toHaveBeenCalled();
	});

	it('emits null when the selection is cleared', () => {
		fixture.componentInstance.fileUploadRef = jasmine.createSpyObj('FileUpload', ['clear']) as unknown as FileUpload;
		const fileChange = jasmine.createSpy('fileChange');
		fixture.componentInstance.selectedFileChange.subscribe(fileChange);
		fixture.componentInstance.onFileSelect({ files: [] });
		expect(fileChange).toHaveBeenCalledWith(null);
	});

	it('rejects a file with a non-CSV extension', fakeAsync(() => {
		fixture.componentInstance.selectedFile = new File(['text'], 'vendas.txt');
		fixture.componentInstance.submit();
		flushMicrotasks();
		expect(processCsv.process).not.toHaveBeenCalled();
		expect(toast.showToast).toHaveBeenCalledWith('Erro ao importar CSV', jasmine.any(String), 'error');
	}));

	it('loads the CSV, emits the results after the delay, and shows success', fakeAsync(() => {
		processCsv.process.and.returnValue(Promise.resolve(sales));
		fixture.componentInstance.selectedFile = new File(['csv'], 'vendas.csv');
		const loadingChange = jasmine.createSpy('loadingChange');
		const salesChange = jasmine.createSpy('salesChange');
		fixture.componentInstance.loadingChange.subscribe(loadingChange);
		fixture.componentInstance.processedSalesChange.subscribe(salesChange);

		fixture.componentInstance.submit();
		flushMicrotasks();
		expect(processCsv.process).toHaveBeenCalledWith(fixture.componentInstance.selectedFile);
		expect(loadingChange).toHaveBeenCalledWith(true);
		expect(salesChange).not.toHaveBeenCalled();
		tick(2000);
		expect(loadingChange).toHaveBeenCalledWith(false);
		expect(salesChange).toHaveBeenCalledWith(sales);
		const toastCall = toast.showToast.calls.mostRecent().args;
		expect(toastCall[0]).toContain('Importa');
		expect(toastCall[1]).toBe('1 vendas prontas para envio.');
		expect(toastCall[2]).toBe('success');
	}));

	it('ends loading and reports CSV processing failures', fakeAsync(() => {
		processCsv.process.and.returnValue(Promise.reject(new Error('invalid CSV')));
		fixture.componentInstance.selectedFile = new File(['csv'], 'vendas.csv');
		const loadingChange = jasmine.createSpy('loadingChange');
		fixture.componentInstance.loadingChange.subscribe(loadingChange);
		fixture.componentInstance.submit();
		flushMicrotasks();
		expect(loadingChange).toHaveBeenCalledWith(false);
		expect(toast.showToast).toHaveBeenCalledWith('Erro ao importar CSV', 'invalid CSV', 'error');
	}));

	it('does not process without a file or while loading', async () => {
		await fixture.componentInstance.submit();
		fixture.componentInstance.selectedFile = new File(['csv'], 'vendas.csv');
		fixture.componentInstance.loading = true;
		await fixture.componentInstance.submit();
		expect(processCsv.process).not.toHaveBeenCalled();
	});
});
