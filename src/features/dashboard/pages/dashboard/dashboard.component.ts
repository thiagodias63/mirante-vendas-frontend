import { Component, OnInit } from '@angular/core';
import { DashboardStateService } from '../../state/dashboard-state.service';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
	readonly viewModes = [
		{ label: 'Tabela', value: 'table' },
		{ label: 'Gráfico', value: 'chart' },
	];
	viewMode: 'table' | 'chart' = 'table';

	constructor(readonly dashboardState: DashboardStateService) {}

	ngOnInit(): void {
		this.dashboardState.loadChartSales();
	}

	showDetails(product: string): void {
		this.dashboardState.openProductDetails(product);
	}
}
