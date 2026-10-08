import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LazyLoadEvent } from 'primeng/api';
import { Venda } from 'src/shared/api/vendas.service';
import { SalesTableComponent } from './sales-table.component';

describe('SalesTableComponent', () => {
	let fixture: ComponentFixture<SalesTableComponent>;
	let component: SalesTableComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SalesTableComponent],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(SalesTableComponent);
		component = fixture.componentInstance;
	});

	it('emits pagination, sorting, and filter events from PrimeNG table', () => {
		const event: LazyLoadEvent = { first: 20, rows: 10, sortField: 'produto' };
		const listener = jasmine.createSpy('lazyLoad listener');
		component.lazyLoad.subscribe(listener);

		component.requestPage(event);

		expect(listener).toHaveBeenCalledWith(event);
	});

	it('emits the selected product for the details dialog', () => {
		const listener = jasmine.createSpy('productSelected listener');
		component.productSelected.subscribe(listener);

		component.selectProduct('Camiseta');

		expect(listener).toHaveBeenCalledOnceWith('Camiseta');
	});

	it('groups sales by product and renders the aggregated table container', () => {
		const sales: Venda[] = [
			{ idVenda: 1, produto: 'Camiseta', quantidade: 2, precoUnitario: 10, dataVenda: '2026-10-08T10:00:00Z' },
			{ idVenda: 2, produto: 'Camiseta', quantidade: 3, precoUnitario: 10, dataVenda: '2026-10-08T11:00:00Z' },
		];
		component.sales = sales;
		fixture.detectChanges();

		expect(component.products).toEqual([{ produto: 'Camiseta', quantidade: 5 }]);
		expect(fixture.nativeElement.querySelector('.sales-table')).toBeTruthy();
	});

	it('builds a CSV with the aggregated products and escapes special values', () => {
		component.sales = [
			{ idVenda: 1, produto: 'Camiseta', quantidade: 2, precoUnitario: 10, dataVenda: '' },
			{ idVenda: 2, produto: 'Camiseta', quantidade: 3, precoUnitario: 10, dataVenda: '' },
			{ idVenda: 3, produto: 'Café; "especial"', quantidade: 1, precoUnitario: 5, dataVenda: '' },
		];

		expect(component.buildCsvContent()).toBe(
			'\uFEFFProduto;Quantidade vendida\r\nCamiseta;5\r\n"Café; ""especial""";1',
		);
	});

	it('downloads the CSV with a file name and revokes the temporary URL', () => {
		const createUrl = spyOn(URL, 'createObjectURL').and.returnValue('blob:csv');
		const revokeUrl = spyOn(URL, 'revokeObjectURL');
		const createElement = spyOn(document, 'createElement').and.callThrough();
		const clickLink = spyOn(HTMLAnchorElement.prototype, 'click');

		component.exportToCsv();

		expect(createUrl).toHaveBeenCalled();
		expect(createUrl.calls.mostRecent().args[0].type).toBe('text/csv;charset=utf-8');
		expect(clickLink).toHaveBeenCalled();
		expect(revokeUrl).toHaveBeenCalledWith('blob:csv');
		expect((createElement.calls.mostRecent().returnValue as HTMLAnchorElement).download).toBe(
			'vendas-por-produto.csv',
		);
	});
});
