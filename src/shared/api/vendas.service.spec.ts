import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { VendasService } from './vendas.service';

describe('VendasService', () => {
	let service: VendasService;
	let http: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
		service = TestBed.inject(VendasService);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => http.verify());

	it('should posts a sale to the vendas endpoint', () => {
		const sale = {
			id_venda: 3,
			produto: 'Tênis',
			quantidade: 2,
			preco_unitario: 99.9,
			data_venda: '2026-10-08',
		};
		let result: unknown;
		service.create(sale).subscribe((response) => (result = response));

		const request = http.expectOne(`${environment.apiUrl}/vendas`);
		expect(request.request.method).toBe('POST');
		expect(request.request.body).toEqual(sale);
		request.flush({ id: 3 });
		expect(result).toEqual({ id: 3 });
	});

	it('should gets a page and sends pagination, sorting, and optional filters', () => {
		const page = { data: [], page: 0, size: 25, totalItems: 0 };
		let result: unknown;
		service
			.getAll({
				size: 25,
				page: 0,
				orderBy: 'data_venda',
				orderDirection: 'desc',
				Produto: '*tenis*',
				Quantidade: 2,
				DataVenda: '2026-10-08',
			})
			.subscribe((response) => (result = response));

		const request = http.expectOne((candidate) => candidate.url === `${environment.apiUrl}/vendas`);
		expect(request.request.method).toBe('GET');
		expect(request.request.params.get('_size')).toBe('25');
		expect(request.request.params.get('_page')).toBe('0');
		expect(request.request.params.get('_order')).toBe('data_venda desc');
		expect(request.request.params.get('Produto')).toBe('*tenis*');
		expect(request.request.params.get('Quantidade')).toBe('2');
		expect(request.request.params.get('DataVenda')).toBe('2026-10-08');
		request.flush(page);
		expect(result).toEqual(page);
	});

	it('should omits filters that are not set', () => {
		service.getAll({ size: 10, page: 1, orderBy: 'idVenda', orderDirection: 'asc' }).subscribe();
		const request = http.expectOne((candidate) => candidate.url === `${environment.apiUrl}/vendas`);
		expect(request.request.params.get('_size')).toBe('10');
		expect(request.request.params.get('_page')).toBe('1');
		expect(request.request.params.get('_order')).toBe('idVenda asc');
		expect(request.request.params.has('Produto')).toBeFalse();
		expect(request.request.params.has('Quantidade')).toBeFalse();
		expect(request.request.params.has('DataVenda')).toBeFalse();
		request.flush({ data: [], page: 1, size: 10, totalItems: 0 });
	});
});
