import { Component } from '@angular/core';
import { DashboardStateService } from '../../state/dashboard-state.service';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
	detailsVisible = false;
	selectedProduct = '';

	constructor(readonly dashboardState: DashboardStateService) {}

	showDetails(product: string): void {
		this.selectedProduct = product;
		this.detailsVisible = true;
	}
}
