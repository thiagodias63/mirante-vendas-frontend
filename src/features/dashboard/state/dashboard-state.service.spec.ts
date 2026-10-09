import { TestBed } from '@angular/core/testing';
import { LazyLoadEvent } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { Venda, VendaPage, VendasService } from 'src/shared/api/vendas.service';
import { DashboardStateService } from './dashboard-state.service';

describe('DashboardStateService', () => {
	let stateService: DashboardStateService;
	let vendasService: jasmine.SpyObj<VendasService>;

	const vendas: Venda[] = [
		{ idVenda: 1, produto: 'Camisa', quantidade: 2, precoUnitario: 10, dataVenda: '2026-10-08T09:00:00Z' },
		{ idVenda: 2, produto: 'Camisa', quantidade: 3, precoUnitario: 12, dataVenda: '2026-10-08T16:30:00Z' },
		{ idVenda: 3, produto: 'Camisa', quantidade: 4, precoUnitario: 15, dataVenda: '2026-10-09T10:00:00Z' },
		{ idVenda: 4, produto: 'Calça', quantidade: 1, precoUnitario: 50, dataVenda: '2026-10-08T11:00:00Z' },
	];
	const vendaPage: VendaPage = { data: vendas, page: 0, size: 10, totalItems: 4 };

	beforeEach(() => {
		vendasService = jasmine.createSpyObj<VendasService>('VendasService', ['getAll']);
		vendasService.getAll.and.returnValue(of(vendaPage));
		TestBed.configureTestingModule({
			providers: [DashboardStateService, { provide: VendasService, useValue: vendasService }],
		});
		stateService = TestBed.inject(DashboardStateService);
	});

	it('should starts with an empty dashboard state', () => {
		expect(stateService.state).toEqual({
			sales: [],
			products: [],
			totalItems: 0,
			size: 10,
			page: 0,
			tableFirst: 0,
			loading: false,
			errorMessage: '',
		});
	});

	it('should publishes the selected product separately from the dashboard data state', () => {
		const selectedProducts: Array<string | null> = [];
		stateService.selectedProduct$.subscribe((product) => selectedProducts.push(product));

		stateService.openProductDetails('Camisa');
		stateService.closeProductDetails();

		expect(selectedProducts).toEqual([null, 'Camisa', null]);
		expect(Object.prototype.hasOwnProperty.call(stateService.state, 'selectedProduct')).toBeFalse();
		expect(Object.prototype.hasOwnProperty.call(stateService.state, 'detailsVisible')).toBeFalse();
	});

	it('should loads backend sales and sums quantity and unit price by product and day', () => {
		stateService.loadSales();

		expect(vendasService.getAll).toHaveBeenCalledWith({
			size: 10,
			page: 0,
			orderBy: 'produto',
			orderDirection: 'asc',
		});
		expect(stateService.state.sales).toEqual(vendas);
		expect(stateService.state.totalItems).toBe(4);
		expect(stateService.state.products).toEqual([
			{ produto: 'Camisa', dataVenda: '2026-10-08', quantidade: 5, precoUnitario: 22 },
			{ produto: 'Camisa', dataVenda: '2026-10-09', quantidade: 4, precoUnitario: 15 },
			{ produto: 'Calça', dataVenda: '2026-10-08', quantidade: 1, precoUnitario: 50 },
		]);
		expect(stateService.state.loading).toBeFalse();
	});

	it('should maps pagination, sorting, and filters to backend parameters', () => {
		const event: LazyLoadEvent = {
			first: 25,
			rows: 25,
			sortField: 'quantidade',
			sortOrder: -1,
			filters: {
				produto: { value: '  camisa ', matchMode: 'contains' },
				quantidade: { value: '3', matchMode: 'equals' },
			},
		};

		stateService.loadSales(event);

		expect(vendasService.getAll).toHaveBeenCalledWith({
			size: 25,
			page: 1,
			orderBy: 'quantidade',
			orderDirection: 'desc',
			Produto: '*camisa*',
			Quantidade: 3,
		});
		expect(stateService.state.tableFirst).toBe(25);
		expect(stateService.state.size).toBe(25);
		expect(stateService.state.page).toBe(1);
	});

	it('should omits cleared or invalid filters', () => {
		stateService.loadSales({
			first: 0,
			rows: 10,
			filters: {
				produto: { value: null, matchMode: 'contains' },
				quantidade: { value: '2.5', matchMode: 'equals' },
			},
		});

		expect(vendasService.getAll).toHaveBeenCalledWith({
			size: 10,
			page: 0,
			orderBy: 'produto',
			orderDirection: 'asc',
		});
	});

	it('should reads a product filter wrapped in a constraints list', () => {
		const event = {
			first: 0,
			rows: 10,
			filters: {
				produto: { constraints: [{ value: 'Camisa', matchMode: 'contains' }] },
			},
		} as unknown as LazyLoadEvent;

		stateService.loadSales(event);

		expect(vendasService.getAll).toHaveBeenCalledWith({
			size: 10,
			page: 0,
			orderBy: 'produto',
			orderDirection: 'asc',
			Produto: '*Camisa*',
		});
	});

	it('should publishes loading state and clears results when the request fails', () => {
		let loadingWhileRequesting = false;
		stateService.state$.subscribe((state) => {
			if (state.loading) loadingWhileRequesting = true;
		});
		vendasService.getAll.and.returnValue(throwError(() => new Error('backend unavailable')));

		stateService.loadSales();

		expect(loadingWhileRequesting).toBeTrue();
		expect(stateService.state.sales).toEqual([]);
		expect(stateService.state.products).toEqual([]);
		expect(stateService.state.totalItems).toBe(0);
		expect(stateService.state.loading).toBeFalse();
		expect(stateService.state.errorMessage).toBeTruthy();
	});
});
