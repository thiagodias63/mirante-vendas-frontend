import { Component, EventEmitter, Output } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { DashboardStateService } from '../../state/dashboard-state.service';

@Component({
	selector: 'app-sales-table',
	templateUrl: './sales-table.component.html',
	styleUrls: ['./sales-table.component.css'],
})
export class SalesTableComponent {
	@Output() readonly productSelected = new EventEmitter<string>();

	constructor(readonly dashboardState: DashboardStateService) {}

	requestPage(event: LazyLoadEvent): void {
		this.dashboardState.loadSales(event);
	}

	selectProduct(product: string): void {
		this.productSelected.emit(product);
	}
}
