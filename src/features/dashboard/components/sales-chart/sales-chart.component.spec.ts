import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Venda } from 'src/shared/api/vendas.service';
import { SalesChartComponent } from './sales-chart.component';

describe('SalesChartComponent', () => {
	let fixture: ComponentFixture<SalesChartComponent>;
	let component: SalesChartComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SalesChartComponent],
			imports: [CommonModule],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(SalesChartComponent);
		component = fixture.componentInstance;
	});

	it('groups quantities by product and prepares PrimeNG chart data', () => {
		const sales: Venda[] = [
			{ idVenda: 1, produto: 'Camiseta', quantidade: 2, precoUnitario: 10, dataVenda: '2026-10-08T10:00:00Z' },
			{ idVenda: 2, produto: 'Camiseta', quantidade: 3, precoUnitario: 10, dataVenda: '2026-10-08T11:00:00Z' },
			{ idVenda: 3, produto: 'Calça', quantidade: 1, precoUnitario: 50, dataVenda: '2026-10-07T10:00:00Z' },
		];

		component.sales = sales;

		expect(component.products).toEqual([
			{ produto: 'Camiseta', quantidade: 5 },
			{ produto: 'Calça', quantidade: 1 },
		]);
		expect(component.chartData.labels).toEqual(['Camiseta', 'Calça']);
		expect(component.chartData.datasets[0].data).toEqual([5, 1]);
	});

	it('renders PrimeNG chart for data and an empty state when there are no sales', () => {
		component.sales = [
			{ idVenda: 1, produto: 'Camiseta', quantidade: 2, precoUnitario: 10, dataVenda: '' },
		];
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('p-chart')).toBeTruthy();

		component.sales = [];
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.sales-chart__empty')).toBeTruthy();
	});
});
