import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { VendasService } from 'src/shared/api/vendas.service';
import { DashboardStateService } from '../../state/dashboard-state.service';
import { ProductDetailsDialogComponent } from './product-details-dialog.component';
import { VendasPaginated } from 'src/shared/core/interfaces/vendas-paginated';
import { VendasResponse } from 'src/shared/core/interfaces/vendas-response';

describe('ProductDetailsDialogComponent', () => {
	let fixture: ComponentFixture<ProductDetailsDialogComponent>;
	let component: ProductDetailsDialogComponent;
	let vendas: jasmine.SpyObj<VendasService>;
	let dashboardState: DashboardStateService;

	const sales: VendasResponse[] = [
		{ idVenda: 1, produto: 'Camiseta', quantidade: 2, precoUnitario: 10, dataVenda: '2026-10-08T10:00:00Z' },
		{ idVenda: 2, produto: 'Camiseta', quantidade: 3, precoUnitario: 10, dataVenda: '2026-10-08T11:00:00Z' },
		{ idVenda: 3, produto: 'Camiseta estampada', quantidade: 1, precoUnitario: 15, dataVenda: '2026-10-08T12:00:00Z' },
	];

	beforeEach(async () => {
		vendas = jasmine.createSpyObj<VendasService>('VendasService', ['getAll']);
		const page: VendasPaginated = { data: sales, page: 0, size: 100, totalItems: 3 };
		vendas.getAll.and.returnValue(of(page));
		await TestBed.configureTestingModule({
			declarations: [ProductDetailsDialogComponent],
			imports: [CommonModule],
			providers: [{ provide: VendasService, useValue: vendas }, DashboardStateService],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(ProductDetailsDialogComponent);
		component = fixture.componentInstance;
		dashboardState = TestBed.inject(DashboardStateService);
	});

	it('should loads exact product sales when the selected product changes', () => {
		let current: { sales: Omit<VendasResponse, 'idVenda'>[]; loading: boolean; errorMessage: string } | undefined;
		component.sales$.subscribe((state) => (current = state));

		dashboardState.openProductDetails('Camiseta');

		expect(vendas.getAll).toHaveBeenCalledWith({
			size: 100,
			page: 0,
			orderBy: 'dataVenda',
			orderDirection: 'asc',
			Produto: '*Camiseta*',
		});
		expect(current?.sales.map((sale) => sale.dataVenda)).toEqual(['2026-10-08T10:00:00Z', '2026-10-08T11:00:00Z']);
		expect(current?.loading).toBeFalse();
	});

	it('should closes the dialog by clearing the selected product', () => {
		dashboardState.openProductDetails('Camiseta');
		component.setVisible(false);

		let selectedProduct: string | null | undefined;
		dashboardState.selectedProduct$.subscribe((product) => (selectedProduct = product));
		expect(selectedProduct).toBeNull();
	});

	it('should  emits an error state when a product sales request fails', () => {
		let current: { sales: Omit<VendasResponse, 'idVenda'>[]; loading: boolean; errorMessage: string } | undefined;
		component.sales$.subscribe((state) => (current = state));
		vendas.getAll.and.returnValue(throwError(() => new Error('backend unavailable')));

		dashboardState.openProductDetails('Camiseta');

		expect(current?.sales).toEqual([]);
		expect(current?.errorMessage).toBeTruthy();
		expect(current?.loading).toBeFalse();
	});
});
