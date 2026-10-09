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
			chartProducts: [],
			chartLoading: false,
			chartErrorMessage: '',
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

	it('uses product-only summaries from the shared dashboard state', () => {
		state.next({ ...state.value, chartProducts: [
			{ produto: 'Camiseta', quantidade: 5 },
			{ produto: 'Calça', quantidade: 1 },
		] });

		expect(component.products).toEqual(state.value.chartProducts);
		expect(component.chartData.labels).toEqual(['Camiseta', 'Calça']);
		expect(component.chartData.datasets[0].data).toEqual([5, 1]);
	});

	it('renders the chart, loading, and empty states from the shared state', () => {
		state.next({ ...state.value, chartProducts: [{ produto: 'Camiseta', quantidade: 2 }] });
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('p-chart')).toBeTruthy();

		state.next({ ...state.value, chartProducts: [], chartLoading: true });
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Carregando dados do gráfico');

		state.next({ ...state.value, chartProducts: [], chartLoading: false });
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.sales-chart__empty')).toBeTruthy();
	});
});
