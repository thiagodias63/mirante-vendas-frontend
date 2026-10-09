import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { VendasService } from 'src/shared/api/vendas.service';
import { DashboardStateService } from '../../state/dashboard-state.service';
import { VendasResponse } from 'src/shared/core/interfaces/vendas-response';

interface ProductDetailsViewState {
	sales: Omit<VendasResponse, 'idVenda'>[];
	loading: boolean;
	errorMessage: string;
}

@Component({
	selector: 'app-product-details-dialog',
	templateUrl: './product-details-dialog.component.html',
	styleUrls: ['./product-details-dialog.component.css'],
})
export class ProductDetailsDialogComponent {
	readonly sales$: Observable<ProductDetailsViewState>;

	constructor(
		private readonly vendasService: VendasService,
		readonly dashboardState: DashboardStateService,
	) {
		this.sales$ = this.dashboardState.selectedProduct$.pipe(
			switchMap((product) => {
				if (product === null) return of({ sales: [], loading: false, errorMessage: '' });
				return this.loadProductSales$(product).pipe(
					map((sales) => ({ sales, loading: false, errorMessage: '' })),
					startWith({ sales: [], loading: true, errorMessage: '' }),
					catchError(() => of({ sales: [], loading: false, errorMessage: 'Could not load this product sales.' })),
				);
			}),
		);
	}

	setVisible(visible: boolean): void {
		if (!visible) this.dashboardState.closeProductDetails();
	}

	private loadProductSales$(product: string): Observable<Omit<VendasResponse, 'idVenda'>[]> {
		const pageSize = 100;
		return this.vendasService
			.getAll({
				size: pageSize,
				page: 0,
				orderBy: 'dataVenda',
				orderDirection: 'asc',
				Produto: `*${product}*`,
			})
			.pipe(map((response) => response.data.filter((sale) => sale.produto === product)));
	}
}
