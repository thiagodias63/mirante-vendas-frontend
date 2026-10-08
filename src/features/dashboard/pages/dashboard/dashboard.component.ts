import { Component } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import {
	GetAllVendasParams,
	Venda,
	VendaPage,
	VendasService,
} from 'src/shared/api/vendas.service';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
	readonly pageSizeOptions = [10, 25, 50];
	readonly orderFields: Record<string, GetAllVendasParams['orderBy']> = {
		produto: 'produto',
		quantidade: 'quantidade',
	};

	sales: Venda[] = [];
	totalItems = 0;
	size = 10;
	page = 0;
	tableFirst = 0;
	orderBy: GetAllVendasParams['orderBy'] = 'produto';
	orderDirection: 'asc' | 'desc' = 'asc';
	productFilter = '';
	quantityFilter: number | null = null;
	loading = false;
	detailsVisible = false;
	selectedProduct = '';
	errorMessage = '';

	constructor(private readonly vendasService: VendasService) {}

	loadSales(event?: LazyLoadEvent): void {
		if (event) {
			if (event.filters) this.readFilters(event);
			this.tableFirst = event.first || 0;
			this.size = event.rows || this.size;
			this.page = Math.floor(this.tableFirst / this.size);
			const field = event.sortField;
			if (field && this.orderFields[field]) {
				this.orderBy = this.orderFields[field];
				this.orderDirection = event.sortOrder === -1 ? 'desc' : 'asc';
			}
		}
		this.fetchPage();
	}

	showDetails(product: string): void {
		this.selectedProduct = product;
		this.detailsVisible = true;
	}

	private fetchPage(): void {
		this.loading = true;
		this.errorMessage = '';
		const params: GetAllVendasParams = {
			size: this.size,
			page: this.page,
			orderBy: this.orderBy,
			orderDirection: this.orderDirection,
		};
		const product = this.productFilter.trim();
		if (product) params.Produto = `*${product}*`;
		if (this.quantityFilter !== null) params.Quantidade = this.quantityFilter;

		this.vendasService.getAll(params).subscribe({
			next: (response: VendaPage) => {
				this.totalItems = response.totalItems;
				this.sales = response.data;
				this.loading = false;
			},
			error: () => {
				this.sales = [];
				this.totalItems = 0;
				this.errorMessage = 'Não foi possível carregar as vendas. Tente novamente.';
				this.loading = false;
			},
		});
	}

	private readFilters(event: LazyLoadEvent): void {
		const filters = event.filters;
		const product = filters?.['produto']?.value;
		const quantity = filters?.['quantidade']?.value;

		this.productFilter = typeof product === 'string' ? product : '';
		const parsedQuantity =
			quantity === null || quantity === undefined || quantity === ''
				? null
				: Number(quantity);
		this.quantityFilter =
			parsedQuantity !== null && Number.isInteger(parsedQuantity) ? parsedQuantity : null;
	}
}
