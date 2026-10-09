import { Component } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { DashboardStateService, ProductSummary } from '../../state/dashboard-state.service';

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

	constructor(dashboardState: DashboardStateService) {
		dashboardState.state$.subscribe(({ products }) => {
			this.products = products;
			this.chartData = {
				labels: this.products.map((product) => `${product.produto} (${product.dataVenda})`),
				datasets: [{
					label: 'Quantidade vendida',
					data: this.products.map((product) => product.quantidade),
					backgroundColor: '#3b82f6',
				}],
			};
		});
	}
}
