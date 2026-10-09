import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Venda, VendaPage, VendasService } from 'src/shared/api/vendas.service';
import { DashboardStateService } from '../../state/dashboard-state.service';
import { ProductDetailsDialogComponent } from './product-details-dialog.component';

describe('ProductDetailsDialogComponent', () => {
	let fixture: ComponentFixture<ProductDetailsDialogComponent>;
	let component: ProductDetailsDialogComponent;
	let vendas: jasmine.SpyObj<VendasService>;
	let dashboardState: DashboardStateService;

	const sales: Venda[] = [
		{ idVenda: 1, produto: 'Camiseta', quantidade: 2, precoUnitario: 10, dataVenda: '2026-10-08T10:00:00Z' },
		{ idVenda: 2, produto: 'Camiseta', quantidade: 3, precoUnitario: 10, dataVenda: '2026-10-08T11:00:00Z' },
		{ idVenda: 3, produto: 'Camiseta estampada', quantidade: 1, precoUnitario: 15, dataVenda: '2026-10-08T12:00:00Z' },
	];

	beforeEach(async () => {
		vendas = jasmine.createSpyObj<VendasService>('VendasService', ['getAll']);
		const page: VendaPage = { data: sales, page: 0, size: 100, totalItems: 3 };
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
		let current: { sales: Venda[]; loading: boolean; errorMessage: string } | undefined;
		component.sales$.subscribe((state) => (current = state));

		dashboardState.openProductDetails('Camiseta');

		expect(vendas.getAll).toHaveBeenCalledWith({
			size: 100,
			page: 0,
			orderBy: 'idVenda',
			orderDirection: 'asc',
			Produto: '*Camiseta*',
		});
		expect(current?.sales.map((sale) => sale.idVenda)).toEqual([1, 2]);
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
		let current: { sales: Venda[]; loading: boolean; errorMessage: string } | undefined;
		component.sales$.subscribe((state) => (current = state));
		vendas.getAll.and.returnValue(throwError(() => new Error('backend unavailable')));

		dashboardState.openProductDetails('Camiseta');

		expect(current?.sales).toEqual([]);
		expect(current?.errorMessage).toBeTruthy();
		expect(current?.loading).toBeFalse();
	});
});
