import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

@NgModule({
	declarations: [DashboardComponent],
	imports: [
		CommonModule,
		FormsModule,
		ButtonModule,
		CalendarModule,
		DialogModule,
		InputNumberModule,
		InputTextModule,
		TableModule,
		RouterModule.forChild([{ path: '', component: DashboardComponent }]),
	],
})
export class DashboardModule {}
