import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardStateService } from '../../state/dashboard-state.service';
import { VendasService } from 'src/shared/api/vendas.service';
import { SalesExportButtonComponent } from './sales-export-button.component';
import { VendasResponse } from 'src/shared/core/interfaces/vendas-response';

describe('SalesExportButtonComponent', () => {
	let fixture: ComponentFixture<SalesExportButtonComponent>;
	let component: SalesExportButtonComponent;
	let vendas: jasmine.SpyObj<VendasService>;
	let dashboardState: DashboardStateService;

	beforeEach(async () => {
		vendas = jasmine.createSpyObj<VendasService>('VendasService', ['getAll']);
		vendas.getAll.and.returnValue(of({ data: [], page: 0, size: 10, totalItems: 0 }));
		await TestBed.configureTestingModule({
			declarations: [SalesExportButtonComponent],
			providers: [DashboardStateService, { provide: VendasService, useValue: vendas }],
		}).compileComponents();
		fixture = TestBed.createComponent(SalesExportButtonComponent);
		component = fixture.componentInstance;
		dashboardState = TestBed.inject(DashboardStateService);
	});

	it('exports the aggregated product and day rows as escaped CSV', () => {
		const sales: VendasResponse[] = [
			{ idVenda: 1, produto: 'Camisa', quantidade: 2, precoUnitario: 10, dataVenda: '2026-10-08T10:00:00Z' },
			{ idVenda: 2, produto: 'Camisa', quantidade: 3, precoUnitario: 10, dataVenda: '2026-10-08T11:00:00Z' },
			{ idVenda: 3, produto: 'Cafe; "especial"', quantidade: 1, precoUnitario: 5, dataVenda: '2026-10-09T11:00:00Z' },
		];
		vendas.getAll.and.returnValue(of({ data: sales, page: 0, size: 10, totalItems: sales.length }));
		dashboardState.loadSales();

		const csv = (component as any).buildCsvContent() as string;
		expect(csv).toContain('Produto;Data da venda;Quantidade vendida;Preço total');
		expect(csv).toContain('Camisa;2026-10-08;5;20');
		expect(csv).toContain('"Cafe; ""especial""";2026-10-09;1;5');
	});

	it('downloads the CSV and revokes its temporary URL', () => {
		const createUrl = spyOn(URL, 'createObjectURL').and.returnValue('blob:csv');
		const revokeUrl = spyOn(URL, 'revokeObjectURL');
		const createElement = spyOn(document, 'createElement').and.callThrough();
		const clickLink = spyOn(HTMLAnchorElement.prototype, 'click');

		component.exportToCsv();

		expect(createUrl).toHaveBeenCalled();
		expect(clickLink).toHaveBeenCalled();
		expect(revokeUrl).toHaveBeenCalledWith('blob:csv');
		expect((createElement.calls.mostRecent().returnValue as HTMLAnchorElement).download).toBe('vendas-por-produto.csv');
	});
});
