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
			{ idVenda: 3, produto: 'CalÃƒÂ§a', quantidade: 1, precoUnitario: 50, dataVenda: '2026-10-07T10:00:00Z' },
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

	it('keeps individual records from the backend for table and chart aggregation', () => {
		component.loadSales();
		expect(component.sales).toEqual(firstPage.data);
		expect(component.totalItems).toBe(3);
	});

	it('maps table pagination, sorting, and column filters to backend parameters', () => {
		component.loadSales({
			first: 25,
			rows: 25,
			sortField: 'quantidade',
			sortOrder: -1,
			filters: {
				produto: { value: '  camiseta ', matchMode: 'contains' },
				quantidade: { value: 2, matchMode: 'equals' },
			},
		});
		expect(vendas.getAll).toHaveBeenCalledWith({
			size: 25,
			page: 1,
			orderBy: 'quantidade',
			orderDirection: 'desc',
			Produto: '*camiseta*',
			Quantidade: 2,
		});
	});

	it('omits filters cleared from the table columns', () => {
		component.loadSales({
			first: 0,
			rows: 10,
			filters: {
				produto: { value: null, matchMode: 'contains' },
				quantidade: { value: null, matchMode: 'equals' },
			},
		});
		expect(vendas.getAll).toHaveBeenCalledWith({
			size: 10,
			page: 0,
			orderBy: 'produto',
			orderDirection: 'asc',
		});
	});

	it('clears table data and displays an error when the page request fails', () => {
		vendas.getAll.and.returnValue(throwError(() => new Error('backend unavailable')));
		component.loadSales();
		expect(component.totalItems).toBe(0);
		expect(component.errorMessage).toBeTruthy();
		expect(component.loading).toBeFalse();
	});

	it('renders the extracted table and chart components', () => {
		component.loadSales();
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Dashboard de vendas');
		expect(fixture.nativeElement.querySelector('app-sales-table')).toBeTruthy();
		expect(fixture.nativeElement.querySelector('app-sales-chart')).toBeTruthy();
		expect(fixture.nativeElement.querySelector('app-product-details-dialog')).toBeTruthy();
	});
});
