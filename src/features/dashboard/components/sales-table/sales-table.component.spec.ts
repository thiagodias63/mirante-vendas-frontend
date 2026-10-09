import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LazyLoadEvent } from 'primeng/api';
import { of } from 'rxjs';
import { Venda } from 'src/shared/api/vendas.service';
import { DashboardStateService } from '../../state/dashboard-state.service';
import { VendasService } from 'src/shared/api/vendas.service';
import { SalesTableComponent } from './sales-table.component';

describe('SalesTableComponent', () => {
	let fixture: ComponentFixture<SalesTableComponent>;
	let component: SalesTableComponent;
	let vendas: jasmine.SpyObj<VendasService>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SalesTableComponent],
			providers: [DashboardStateService, { provide: VendasService, useValue: jasmine.createSpyObj('VendasService', ['getAll']) }],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
		vendas = TestBed.inject(VendasService) as jasmine.SpyObj<VendasService>;
		vendas.getAll.and.returnValue(of({ data: [], page: 0, size: 10, totalItems: 0 }));
		fixture = TestBed.createComponent(SalesTableComponent);
		component = fixture.componentInstance;
	});

	it('forwards pagination, sorting, and filter events to dashboard state', () => {
		const event: LazyLoadEvent = { first: 20, rows: 10, sortField: 'produto' };
		const loader = spyOn(component.dashboardState, 'loadSales');

		component.requestPage(event);

		expect(loader).toHaveBeenCalledWith(event);
	});

	it('emits the selected product for the details dialog', () => {
		const listener = jasmine.createSpy('productSelected listener');
		component.productSelected.subscribe(listener);

		component.selectProduct('Camiseta');

		expect(listener).toHaveBeenCalledOnceWith('Camiseta');
	});

	it('renders data aggregated by product and day', () => {
		const sales: Venda[] = [
			{ idVenda: 1, produto: 'Camiseta', quantidade: 2, precoUnitario: 10, dataVenda: '2026-10-08T10:00:00Z' },
			{ idVenda: 2, produto: 'Camiseta', quantidade: 3, precoUnitario: 10, dataVenda: '2026-10-08T11:00:00Z' },
			{ idVenda: 3, produto: 'Camiseta', quantidade: 4, precoUnitario: 12, dataVenda: '2026-10-09T09:00:00Z' },
		];
		vendas.getAll.and.returnValue(of({ data: sales, page: 0, size: 10, totalItems: sales.length }));
		component.dashboardState.loadSales();
		fixture.detectChanges();

		expect(component.dashboardState.state.products).toEqual([
			{ produto: 'Camiseta', dataVenda: '2026-10-08', quantidade: 5, precoUnitario: 20 },
			{ produto: 'Camiseta', dataVenda: '2026-10-09', quantidade: 4, precoUnitario: 12 },
		]);
		expect(fixture.nativeElement.querySelector('.sales-table')).toBeTruthy();
	});
});
