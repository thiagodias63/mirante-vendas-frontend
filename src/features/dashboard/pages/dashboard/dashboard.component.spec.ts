import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { VendaPage, VendasService } from 'src/shared/api/vendas.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
	let fixture: ComponentFixture<DashboardComponent>;
	let component: DashboardComponent;
	let vendas: jasmine.SpyObj<VendasService>;

	const firstPage: VendaPage = {
		data: [
			{ idVenda: 1, produto: 'Camiseta', quantidade: 2, precoUnitario: 10, dataVenda: '2026-10-08T10:00:00Z' },
			{ idVenda: 2, produto: 'Camiseta', quantidade: 3, precoUnitario: 10, dataVenda: '2026-10-08T11:00:00Z' },
			{ idVenda: 3, produto: 'Calça', quantidade: 1, precoUnitario: 50, dataVenda: '2026-10-07T10:00:00Z' },
		],
		page: 0,
		size: 10,
		totalItems: 3,
	};

	beforeEach(async () => {
		vendas = jasmine.createSpyObj<VendasService>('VendasService', ['getAll']);
		vendas.getAll.and.returnValue(of(firstPage));
		await TestBed.configureTestingModule({
			declarations: [DashboardComponent],
			imports: [CommonModule, FormsModule],
			providers: [{ provide: VendasService, useValue: vendas }],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(DashboardComponent);
		component = fixture.componentInstance;
	});

	it('groups records by product and totals quantities, occurrences, and sales value', () => {
		component.loadSales();
		expect(component.products).toEqual([
			{ produto: 'Camiseta', quantidade: 5, ocorrencias: 2, valorTotal: 50 },
			{ produto: 'Calça', quantidade: 1, ocorrencias: 1, valorTotal: 50 },
		]);
		expect(component.totalItems).toBe(3);
	});

	it('requests the selected page, order, and backend filters', () => {
		component.productFilter = '  camiseta ';
		component.quantityFilter = 2;
		component.dateFilter = new Date(2026, 9, 8);
		component.loadSales({ first: 25, rows: 25, sortField: 'quantidade', sortOrder: -1 });
		expect(vendas.getAll).toHaveBeenCalledWith({
			size: 25,
			page: 1,
			orderBy: 'quantidade',
			orderDirection: 'desc',
			Produto: '*camiseta*',
			Quantidade: 2,
			DataVenda: '2026-10-08',
		});
	});

	it('resets pagination and filters when clearing the search', () => {
		component.page = 3;
		component.tableFirst = 30;
		component.productFilter = 'Camisa';
		component.quantityFilter = 4;
		component.dateFilter = new Date();
		component.clearFilters();
		expect(component.page).toBe(0);
		expect(component.tableFirst).toBe(0);
		expect(component.productFilter).toBe('');
		expect(component.quantityFilter).toBeNull();
		expect(component.dateFilter).toBeNull();
		expect(vendas.getAll).toHaveBeenCalledWith({
			size: 10,
			page: 0,
			orderBy: 'produto',
			orderDirection: 'asc',
		});
	});

	it('loads every page of the selected product for the details table', async () => {
		vendas.getAll.and.returnValues(
			of({ ...firstPage, data: [firstPage.data[0]], size: 1, totalItems: 2 }),
			of({ ...firstPage, data: [firstPage.data[1], firstPage.data[2]], page: 1, size: 2, totalItems: 2 }),
		);
		await component.showDetails('Camiseta');
		expect(vendas.getAll).toHaveBeenCalledTimes(2);
		expect(vendas.getAll.calls.argsFor(0)[0]).toEqual({
			size: 100,
			page: 0,
			orderBy: 'idVenda',
			orderDirection: 'asc',
			Produto: '*Camiseta*',
		});
		expect(component.details.map((sale) => sale.idVenda)).toEqual([1, 2]);
		expect(component.detailsVisible).toBeTrue();
		expect(component.detailsLoading).toBeFalse();
	});

	it('shows a useful message when the details request fails', async () => {
		vendas.getAll.and.returnValue(throwError(() => new Error('backend unavailable')));
		await component.showDetails('Camiseta');
		expect(component.detailsError).toBeTruthy();
		expect(component.detailsLoading).toBeFalse();
	});

	it('clears table data and displays an error when the page request fails', () => {
		vendas.getAll.and.returnValue(throwError(() => new Error('backend unavailable')));
		component.loadSales();
		expect(component.products).toEqual([]);
		expect(component.totalItems).toBe(0);
		expect(component.errorMessage).toBeTruthy();
		expect(component.loading).toBeFalse();
	});

	it('builds a proportional bar width and renders dashboard content', () => {
		component.loadSales();
		fixture.detectChanges();
		expect(component.barHeight(2)).toBe('40%');
		expect(fixture.nativeElement.textContent).toContain('Dashboard de vendas');
		expect(fixture.nativeElement.querySelector('.bar-chart')).toBeTruthy();
	});
});
