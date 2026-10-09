import { TestBed } from '@angular/core/testing';
import { CsvVenda } from '../interfaces/csv-venda';
import { ProcessCsvService } from './process-csv.service';

describe('ProcessCsvService', () => {
	let service: ProcessCsvService;
	let worker: Worker;
	let workerConstructor: jasmine.Spy;
	let postMessage: jasmine.Spy;
	let terminate: jasmine.Spy;

	beforeEach(() => {
		TestBed.configureTestingModule({ providers: [ProcessCsvService] });
		service = TestBed.inject(ProcessCsvService);
		postMessage = jasmine.createSpy('postMessage');
		terminate = jasmine.createSpy('terminate');
		worker = { onmessage: null, onerror: null, postMessage, terminate } as unknown as Worker;
		workerConstructor = spyOn(window, 'Worker').and.returnValue(worker);
		localStorage.clear();
	});

	it('sends the File to a worker, stores parsed sales, and terminates the worker', async () => {
		const file = new File(['csv content'], 'sales.csv');
		const sales: CsvVenda[] = [{ produto: 'Camiseta', quantidade: 2, precoUnitario: 45, dataVenda: '2026-10-08' }];
		const result = service.process(file);

		expect(workerConstructor).toHaveBeenCalled();
		expect(postMessage).toHaveBeenCalledOnceWith(file);
		(worker.onmessage as ((event: MessageEvent) => void) | null)?.({
			data: { success: true, data: sales },
		} as MessageEvent);

		expect(await result).toEqual(sales);
		expect(localStorage.getItem('csv-vendas')).toBe(JSON.stringify(sales));
		expect(terminate).toHaveBeenCalled();
	});

	it('rejects when the worker cannot start', async () => {
		workerConstructor.and.throwError('Worker unavailable');

		await expectAsync(service.process(new File(['csv'], 'sales.csv'))).toBeRejectedWithError(
			'Não foi possível iniciar o processamento do CSV.',
		);
	});

	it('rejects invalid worker responses and parsing errors', async () => {
		const invalid = service.process(new File(['csv'], 'sales.csv'));
		(worker.onmessage as ((event: MessageEvent) => void) | null)?.({
			data: { success: false, error: 'invalid header' },
		} as MessageEvent);
		await expectAsync(invalid).toBeRejectedWithError('invalid header');

		const malformed = service.process(new File(['csv'], 'sales.csv'));
		(worker.onmessage as ((event: MessageEvent) => void) | null)?.({ data: null } as MessageEvent);
		await expectAsync(malformed).toBeRejectedWithError('Resposta inválida ao processar o arquivo CSV.');
	});

	it('rejects worker runtime errors and local storage failures', async () => {
		const workerError = service.process(new File(['csv'], 'sales.csv'));
		(worker.onerror as ((event: ErrorEvent) => void) | null)?.(new ErrorEvent('error'));
		await expectAsync(workerError).toBeRejectedWithError('Ocorreu um erro ao processar o arquivo CSV.');
		expect(terminate).toHaveBeenCalled();

		spyOn(Storage.prototype, 'setItem').and.throwError('storage unavailable');
		const storageError = service.process(new File(['csv'], 'sales.csv'));
		(worker.onmessage as ((event: MessageEvent) => void) | null)?.({
			data: { success: true, data: [] },
		} as MessageEvent);
		await expectAsync(storageError).toBeRejectedWithError('Não foi possível salvar os dados do CSV no armazenamento local.');
	});
});
