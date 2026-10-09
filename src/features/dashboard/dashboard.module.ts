import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SalesChartComponent } from './components/sales-chart/sales-chart.component';
import { ProductDetailsDialogComponent } from './components/product-details-dialog/product-details-dialog.component';
import { SalesTableComponent } from './components/sales-table/sales-table.component';
import { SalesExportButtonComponent } from './components/sales-export-button/sales-export-button.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DashboardStateService } from './state/dashboard-state.service';
import { CurrencyBrPipe } from './pipes/currency-br.pipe';

@NgModule({
	declarations: [DashboardComponent, SalesTableComponent, SalesChartComponent, SalesExportButtonComponent, ProductDetailsDialogComponent, CurrencyBrPipe],
	imports: [
		CommonModule,
		FormsModule,
		ButtonModule,
		ChartModule,
		DialogModule,
		TableModule,
		SelectButtonModule,
		RouterModule.forChild([{ path: '', component: DashboardComponent }]),
	],
	providers: [DashboardStateService],
})
export class DashboardModule {}
