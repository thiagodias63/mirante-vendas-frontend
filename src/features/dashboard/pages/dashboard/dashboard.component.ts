import { Component } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import {
	GetAllVendasParams,
	Venda,
	VendaPage,
	VendasService,
} from 'src/shared/api/vendas.service';

interface ProductSummary {
	produto: string;
	quantidade: number;
	ocorrencias: number;
	valorTotal: number;
}

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
	readonly pageSizeOptions = [10, 25, 50];
	readonly orderFields: Record<string, GetAllVendasParams['orderBy']> = {
		idVenda: 'idVenda',
		produto: 'produto',
		quantidade: 'quantidade',
		data_venda: 'data_venda',
		dataVenda: 'data_venda',
	};

	products: ProductSummary[] = [];
	details: Venda[] = [];
	totalItems = 0;
	size = 10;
	page = 0;
	tableFirst = 0;
	orderBy: GetAllVendasParams['orderBy'] = 'produto';
	orderDirection: 'asc' | 'desc' = 'asc';
	productFilter = '';
	quantityFilter: number | null = null;
	dateFilter: Date | null = null;
	loading = false;
	detailsLoading = false;
	detailsVisible = false;
	detailsError = '';
	selectedProduct = '';
	errorMessage = '';

	constructor(private readonly vendasService: VendasService) {}

	loadSales(event?: LazyLoadEvent): void {
		if (event) {
			this.tableFirst = event.first || 0;
			this.size = event.rows || this.size;
			this.page = Math.floor(this.tableFirst / this.size);
			const field = Array.isArray(event.sortField)
				? event.sortField[0]
				: event.sortField;
			if (field && this.orderFields[field]) {
				this.orderBy = this.orderFields[field];
				this.orderDirection = event.sortOrder === -1 ? 'desc' : 'asc';
			}
		}
		this.fetchPage();
	}

	applyFilters(): void {
		this.page = 0;
		this.tableFirst = 0;
		this.fetchPage();
	}

	clearFilters(): void {
		this.productFilter = '';
		this.quantityFilter = null;
		this.dateFilter = null;
		this.applyFilters();
	}

	async showDetails(product: string): Promise<void> {
		this.selectedProduct = product;
		this.details = [];
		this.detailsError = '';
		this.detailsVisible = true;
		this.detailsLoading = true;

		try {
			const allDetails: Venda[] = [];
			const detailSize = 100;
			let currentPage = 0;
			let totalItems = 0;
			do {
				const response = await firstValueFrom(
					this.vendasService.getAll({
						size: detailSize,
						page: currentPage,
						orderBy: 'idVenda',
						orderDirection: 'asc',
						Produto: `*${product}*`,
					}),
				);
				allDetails.push(...response.data);
				totalItems = response.totalItems;
				if (!response.data.length) break;
				currentPage++;
			} while (allDetails.length < totalItems);
			this.details = allDetails.filter((sale) => sale.produto === product);
		} catch {
			this.detailsError = 'Não foi possível carregar as ocorrências deste produto.';
		} finally {
			this.detailsLoading = false;
		}
	}

	get chartMaximum(): number {
		return Math.max(1, ...this.products.map((product) => product.quantidade));
	}

	barHeight(quantity: number): string {
		return `${Math.max(4, (quantity / this.chartMaximum) * 100)}%`;
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
		if (this.dateFilter) params.DataVenda = this.formatDate(this.dateFilter);

		this.vendasService.getAll(params).subscribe({
			next: (response: VendaPage) => {
				this.totalItems = response.totalItems;
				this.products = this.groupByProduct(response.data);
				this.loading = false;
			},
			error: () => {
				this.products = [];
				this.totalItems = 0;
				this.errorMessage = 'Não foi possível carregar as vendas. Tente novamente.';
				this.loading = false;
			},
		});
	}

	private groupByProduct(sales: Venda[]): ProductSummary[] {
		const grouped = new Map<string, ProductSummary>();
		for (const sale of sales) {
			const summary = grouped.get(sale.produto) || {
				produto: sale.produto,
				quantidade: 0,
				ocorrencias: 0,
				valorTotal: 0,
			};
			summary.quantidade += sale.quantidade;
			summary.ocorrencias++;
			summary.valorTotal += sale.quantidade * sale.precoUnitario;
			grouped.set(sale.produto, summary);
		}
		return Array.from(grouped.values());
	}

	private formatDate(date: Date): string {
		const year = date.getFullYear();
		const month = `${date.getMonth() + 1}`.padStart(2, '0');
		const day = `${date.getDate()}`.padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
}
