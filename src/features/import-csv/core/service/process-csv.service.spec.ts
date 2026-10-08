import { TestBed } from '@angular/core/testing';
import { CsvVenda } from '../interfaces/csv-venda';
import { ProcessCsvService } from './process-csv.service';

describe('ProcessCsvService', () => {
	let service: ProcessCsvService;
	let reader: FileReader;
	let worker: Worker;
	let workerConstructor: jasmine.Spy;
	let readAsText: jasmine.Spy;
	let postMessage: jasmine.Spy;
	let terminate: jasmine.Spy;
	let readerResult: string | ArrayBuffer | null;

	beforeEach(() => {
		TestBed.configureTestingModule({ providers: [ProcessCsvService] });
		service = TestBed.inject(ProcessCsvService);
		readAsText = jasmine.createSpy('readAsText');
		readerResult = 'csv content';
		reader = {
			get result() {
				return readerResult;
			},
			onload: null,
			onerror: null,
			onabort: null,
			readAsText,
		} as unknown as FileReader;
		postMessage = jasmine.createSpy('postMessage');
		terminate = jasmine.createSpy('terminate');
		worker = { onmessage: null, onerror: null, postMessage, terminate } as unknown as Worker;
		spyOn(window, 'FileReader').and.returnValue(reader);
		workerConstructor = spyOn(window, 'Worker').and.returnValue(worker);
		localStorage.clear();
	});

	function startAndLoad(): Promise<CsvVenda[]> {
		const result = service.process(new File(['csv content'], 'sales.csv'));
		(reader.onload as (() => void) | null)?.();
		return result;
	}

	it('should reads the file, sends it to a worker, stores valid rows, and terminates the worker', async () => {
		const sales: CsvVenda[] = [{ id_venda: 7, produto: 'Camiseta', quantidade: 2, preco_unitario: 45, data_venda: '08/10/2026' }];
		const result = startAndLoad();
		expect(readAsText).toHaveBeenCalled();
		expect(postMessage).toHaveBeenCalledWith('csv content');
		(worker.onmessage as ((event: MessageEvent) => void) | null)?.({
			data: { success: true, data: sales },
		} as MessageEvent);
		expect(await result).toEqual(sales);
		expect(localStorage.getItem('csv-vendas')).toBe(JSON.stringify(sales));
		expect(terminate).toHaveBeenCalled();
	});

	it('rejects file read errors and aborts', async () => {
		const readError = service.process(new File(['csv'], 'sales.csv'));
		(reader.onerror as (() => void) | null)?.();
		await expectAsync(readError).toBeRejected();
		const aborted = service.process(new File(['csv'], 'sales.csv'));
		(reader.onabort as (() => void) | null)?.();
		await expectAsync(aborted).toBeRejected();
	});

	it('rejects when the reader result is not text or the worker cannot start', async () => {
		const emptyResult = service.process(new File(['csv'], 'sales.csv'));
		readerResult = null;
		(reader.onload as (() => void) | null)?.();
		await expectAsync(emptyResult).toBeRejected();

		readerResult = 'csv content';
		workerConstructor.and.throwError('Worker unavailable');
		const workerStartError = service.process(new File(['csv'], 'sales.csv'));
		(reader.onload as (() => void) | null)?.();
		await expectAsync(workerStartError).toBeRejected();
	});

	it('rejects invalid worker responses and parsing errors', async () => {
		const invalid = startAndLoad();
		(worker.onmessage as ((event: MessageEvent) => void) | null)?.({
			data: { success: false, error: 'invalid header' },
		} as MessageEvent);
		await expectAsync(invalid).toBeRejectedWithError('invalid header');

		const malformed = startAndLoad();
		(worker.onmessage as ((event: MessageEvent) => void) | null)?.({ data: null } as MessageEvent);
		await expectAsync(malformed).toBeRejected();
	});

	it('rejects worker runtime errors and local storage failures', async () => {
		const workerError = startAndLoad();
		(worker.onerror as ((event: ErrorEvent) => void) | null)?.(new ErrorEvent('error'));
		await expectAsync(workerError).toBeRejected();
		expect(terminate).toHaveBeenCalled();

		spyOn(Storage.prototype, 'setItem').and.throwError('storage unavailable');
		const storageError = startAndLoad();
		(worker.onmessage as ((event: MessageEvent) => void) | null)?.({
			data: { success: true, data: [] },
		} as MessageEvent);
		await expectAsync(storageError).toBeRejected();
	});
});
