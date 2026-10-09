import { Component } from '@angular/core';
import { DashboardStateService } from '../../state/dashboard-state.service';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
	constructor(readonly dashboardState: DashboardStateService) {}

	showDetails(product: string): void {
		this.dashboardState.openProductDetails(product);
	}
}
