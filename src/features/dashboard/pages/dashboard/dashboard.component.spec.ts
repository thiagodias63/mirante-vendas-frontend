import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { VendasService } from 'src/shared/api/vendas.service';
import { DashboardStateService } from '../../state/dashboard-state.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
	let fixture: ComponentFixture<DashboardComponent>;
	let component: DashboardComponent;

	beforeEach(async () => {
		const vendas = jasmine.createSpyObj<VendasService>('VendasService', ['getAll']);
		await TestBed.configureTestingModule({
			declarations: [DashboardComponent],
			imports: [CommonModule, FormsModule, SelectButtonModule],
			providers: [
				{ provide: VendasService, useValue: vendas },
				DashboardStateService,
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(DashboardComponent);
		component = fixture.componentInstance;
	});

	it('publishes the selected product to the dialog state', () => {
		let selectedProduct: string | null | undefined;
		component.dashboardState.selectedProduct$.subscribe((product) => selectedProduct = product);

		component.showDetails('Camiseta');

		expect(selectedProduct).toBe('Camiseta');
		expect(Object.prototype.hasOwnProperty.call(component.dashboardState.state, 'selectedProduct')).toBeFalse();
	});

	it('renders the dashboard and its child components', () => {
		fixture.detectChanges();

		expect(fixture.nativeElement.textContent).toContain('Dashboard de vendas');
		expect(fixture.nativeElement.querySelector('app-sales-table')).toBeTruthy();
		expect(fixture.nativeElement.querySelector('app-sales-chart')).toBeNull();
		expect(fixture.nativeElement.querySelector('app-product-details-dialog')).toBeTruthy();
	});

	it('renders only the view selected by the mode control', () => {
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('app-sales-table')).toBeTruthy();
		expect(fixture.nativeElement.querySelector('app-sales-chart')).toBeNull();

		component.viewMode = 'chart';
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('app-sales-table')).toBeNull();
		expect(fixture.nativeElement.querySelector('app-sales-chart')).toBeTruthy();
	});
});
