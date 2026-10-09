import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CsvVenda } from '../interfaces/csv-venda';
import { VendasService } from 'src/shared/api/vendas.service';
import { ProcessDataFactory } from './process-data.factory';
import { ProcessDataSequential } from '../strategies/process-data-sequential.service';
import { ProcessDataSimultaneously } from '../strategies/process-data-simultaneously.service';
import { environment } from 'src/environments/environment';

const sales: CsvVenda[] = [
	{ id_venda: 1, produto: 'Camiseta', quantidade: 1, preco_unitario: 49.9, data_venda: '06/09/2026' },
	{ id_venda: 2, produto: 'Calça', quantidade: 2, preco_unitario: 99.9, data_venda: '07/09/2026' },
	{ id_venda: 3, produto: 'Tênis', quantidade: 1, preco_unitario: 699.9, data_venda: '10/09/2026' },
];

const vendasEndpoint = environment.apiUrl + '/vendas';

describe('Process data strategies', () => {
	let http: HttpTestingController;
	let simultaneous: ProcessDataSimultaneously;
	let sequential: ProcessDataSequential;
	let factory: ProcessDataFactory;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [VendasService, ProcessDataSequential, ProcessDataSimultaneously, ProcessDataFactory],
		});
		http = TestBed.inject(HttpTestingController);
		simultaneous = TestBed.inject(ProcessDataSimultaneously);
		sequential = TestBed.inject(ProcessDataSequential);
		factory = TestBed.inject(ProcessDataFactory);
	});

	afterEach(() => http.verify());

	it('should selects the requested strategy and rejects unsupported modes', () => {
		expect(factory.create('simultaneous')).toBe(simultaneous);
		expect(factory.create('sequential')).toBe(sequential);
		expect(() => factory.create('parallel')).toThrowError(/parallel/);
	});

	it('should starts simultaneous POST requests and emits responses in completion order', () => {
		const responses: unknown[] = [];
		simultaneous.send(sales).subscribe((response) => responses.push(response));
		const requests = http.match(vendasEndpoint);
		expect(requests.length).toBe(3);
		requests.forEach((request, index) => {
			expect(request.request.method).toBe('POST');
			expect(request.request.body).toEqual(sales[index]);
		});
		requests[2].flush({ id: 3 });
		requests[0].flush({ id: 1 });
		requests[1].flush({ id: 2 });
		expect(responses).toEqual([{ id: 3 }, { id: 1 }, { id: 2 }]);
	});

	it('should starts each sequential POST after the preceding request completes', () => {
		const responses: unknown[] = [];
		sequential.send(sales).subscribe((response) => responses.push(response));
		for (let index = 0; index < sales.length; index++) {
			const request = http.expectOne(vendasEndpoint);
			expect(request.request.body).toEqual(sales[index]);
			request.flush({ id: index + 1 });
		}
		expect(responses).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
	});

	it('should retries a sequential request three times and then forwards the final failure', fakeAsync(() => {
		spyOn(console, 'warn');
		spyOn(console, 'error');
		let failure: unknown;
		sequential.send(sales.slice(0, 1)).subscribe({ error: (error) => (failure = error) });
		for (let attempt = 0; attempt < 4; attempt++) {
			http.expectOne(vendasEndpoint).flush({ message: 'Failure' }, { status: 500, statusText: 'Server Error' });
			if (attempt < 3) tick((attempt + 1) * 1000);
		}
		expect(failure).toBeTruthy();
	}));

	it('should propagates simultaneous HTTP errors without retrying', () => {
		let failure: unknown;
		simultaneous.send(sales.slice(0, 1)).subscribe({ error: (error) => (failure = error) });
		http.expectOne(vendasEndpoint).flush({ message: 'Failure' }, { status: 500, statusText: 'Server Error' });
		expect(failure).toBeTruthy();
	});
});
