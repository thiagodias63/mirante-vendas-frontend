import { Component, Input } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { Venda } from 'src/shared/api/vendas.service';

export interface ProductSummary {
	produto: string;
	quantidade: number;
}

@Component({
	selector: 'app-sales-chart',
	templateUrl: './sales-chart.component.html',
	styleUrls: ['./sales-chart.component.css'],
})
export class SalesChartComponent {
	products: ProductSummary[] = [];
	chartData: ChartData<'bar', number[], string> = {
		labels: [],
		datasets: [{ label: 'Quantidade vendida', data: [], backgroundColor: '#3b82f6' }],
	};
	readonly chartOptions: ChartOptions<'bar'> = {
		responsive: true,
		plugins: { legend: { display: false } },
		scales: {
			x: { title: { display: true, text: 'Produto' } },
			y: {
				beginAtZero: true,
				title: { display: true, text: 'Quantidade vendida' },
				ticks: { precision: 0 },
			},
		},
	};

	@Input() set sales(value: Venda[]) {
		this.products = this.groupByProduct(value || []);
		this.chartData = {
			labels: this.products.map((product) => product.produto),
			datasets: [{
				label: 'Quantidade vendida',
				data: this.products.map((product) => product.quantidade),
				backgroundColor: '#3b82f6',
			}],
		};
	}

	private groupByProduct(sales: Venda[]): ProductSummary[] {
		const grouped = new Map<string, ProductSummary>();
		for (const sale of sales) {
			const summary = grouped.get(sale.produto) || {
				produto: sale.produto,
				quantidade: 0,
			};
			summary.quantidade += sale.quantidade;
			grouped.set(sale.produto, summary);
		}
		return Array.from(grouped.values());
	}
}
