import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { DashboardState, DashboardStateService } from '../../state/dashboard-state.service';
import { SalesChartComponent } from './sales-chart.component';

describe('SalesChartComponent', () => {
	let fixture: ComponentFixture<SalesChartComponent>;
	let component: SalesChartComponent;
	let state: BehaviorSubject<DashboardState>;

	beforeEach(async () => {
		state = new BehaviorSubject<DashboardState>({
			sales: [],
			products: [],
			totalItems: 0,
			size: 10,
			page: 0,
			tableFirst: 0,
			loading: false,
			errorMessage: '',
		});
		await TestBed.configureTestingModule({
			declarations: [SalesChartComponent],
			imports: [CommonModule],
			providers: [{ provide: DashboardStateService, useValue: { state$: state.asObservable() } }],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(SalesChartComponent);
		component = fixture.componentInstance;
	});

	it('should uses product and day summaries from shared dashboard state', () => {
		state.next({
			...state.value,
			products: [
				{ produto: 'Camiseta', dataVenda: '2026-10-08', quantidade: 5, precoUnitario: 20 },
				{ produto: 'Calça', dataVenda: '2026-10-09', quantidade: 1, precoUnitario: 50 },
			],
		});
		expect(component.products).toEqual(state.value.products);
		expect(component.chartData.labels).toEqual(['Camiseta (2026-10-08)', 'Calça (2026-10-09)']);
		expect(component.chartData.datasets[0].data).toEqual([5, 1]);
	});

	it('should renders the chart and empty state from shared state', () => {
		state.next({ ...state.value, products: [{ produto: 'Camiseta', dataVenda: '2026-10-08', quantidade: 2, precoUnitario: 10 }] });
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('p-chart')).toBeTruthy();
		state.next({ ...state.value, products: [] });
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.sales-chart__empty')).toBeTruthy();
	});
});
