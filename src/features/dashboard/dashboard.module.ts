import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { SalesChartComponent } from './components/sales-chart/sales-chart.component';
import { ProductDetailsDialogComponent } from './components/product-details-dialog/product-details-dialog.component';
import { SalesTableComponent } from './components/sales-table/sales-table.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DashboardStateService } from './state/dashboard-state.service';

@NgModule({
	declarations: [DashboardComponent, SalesTableComponent, SalesChartComponent, ProductDetailsDialogComponent],
	imports: [
		CommonModule,
		ButtonModule,
		ChartModule,
		DialogModule,
		TableModule,
		RouterModule.forChild([{ path: '', component: DashboardComponent }]),
	],
	providers: [DashboardStateService],
})
export class DashboardModule {}
