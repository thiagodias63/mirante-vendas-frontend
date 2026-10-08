import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Venda, VendaPage, VendasService } from 'src/shared/api/vendas.service';
import { ProductDetailsDialogComponent } from './product-details-dialog.component';

describe('ProductDetailsDialogComponent', () => {
	let fixture: ComponentFixture<ProductDetailsDialogComponent>;
	let component: ProductDetailsDialogComponent;
	let vendas: jasmine.SpyObj<VendasService>;

	const sales: Venda[] = [
		{ idVenda: 1, produto: 'Camiseta', quantidade: 2, precoUnitario: 10, dataVenda: '2026-10-08T10:00:00Z' },
		{ idVenda: 2, produto: 'Camiseta', quantidade: 3, precoUnitario: 10, dataVenda: '2026-10-08T11:00:00Z' },
		{ idVenda: 3, produto: 'Camiseta estampada', quantidade: 1, precoUnitario: 15, dataVenda: '2026-10-08T12:00:00Z' },
	];

	beforeEach(async () => {
		vendas = jasmine.createSpyObj<VendasService>('VendasService', ['getAll', 'getOne']);
		const page: VendaPage = { data: sales, page: 0, size: 100, totalItems: 3 };
		vendas.getAll.and.returnValue(of(page));
		vendas.getOne.and.callFake((id) => of(sales.find((sale) => sale.idVenda === id) as Venda));
		await TestBed.configureTestingModule({
			declarations: [ProductDetailsDialogComponent],
			imports: [CommonModule],
			providers: [{ provide: VendasService, useValue: vendas }],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(ProductDetailsDialogComponent);
		component = fixture.componentInstance;
	});

	it('loads a product occurrence list and fetches each exact sale by id', async () => {
		component.product = 'Camiseta';

		await component.loadProduct();

		expect(vendas.getAll).toHaveBeenCalledWith({
			size: 100,
			page: 0,
			orderBy: 'idVenda',
			orderDirection: 'asc',
			Produto: '*Camiseta*',
		});
		expect(vendas.getOne).toHaveBeenCalledTimes(2);
		expect(vendas.getOne).toHaveBeenCalledWith(1);
		expect(vendas.getOne).toHaveBeenCalledWith(2);
		expect(component.details.map((sale) => sale.idVenda)).toEqual([1, 2]);
		expect(component.loading).toBeFalse();
	});

	it('loads details when the dialog opens for a product', () => {
		spyOn(component, 'loadProduct');
		component.visible = true;
		component.product = 'Camiseta';

		component.ngOnChanges({
			visible: new SimpleChange(false, true, true),
			product: new SimpleChange('', 'Camiseta', true),
		});

		expect(component.loadProduct).toHaveBeenCalled();
	});

	it('shows an error and clears the loading state when a detail request fails', async () => {
		vendas.getAll.and.returnValue(throwError(() => new Error('backend unavailable')));
		component.product = 'Camiseta';

		await component.loadProduct();

		expect(component.errorMessage).toBeTruthy();
		expect(component.loading).toBeFalse();
	});

	it('emits visibility changes requested by PrimeNG dialog', () => {
		const listener = jasmine.createSpy('visibleChange listener');
		component.visibleChange.subscribe(listener);

		component.setVisible(false);

		expect(component.visible).toBeFalse();
		expect(listener).toHaveBeenCalledOnceWith(false);
	});
});
