import { Injectable } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';
import { VendasService } from 'src/shared/api/vendas.service';
import { GetAllVendasParams } from 'src/shared/core/interfaces/get-all-vendas-params';
import { VendasPaginated } from 'src/shared/core/interfaces/vendas-paginated';
import { VendasResponse } from 'src/shared/core/interfaces/vendas-response';

export interface ChartProductSummary {
	produto: string;
	quantidade: number;
}

export interface DashboardState {
	sales: VendasResponse[];
	products: Omit<VendasResponse, 'idVenda'>[];
	totalItems: number;
	size: number;
	page: number;
	tableFirst: number;
	loading: boolean;
	errorMessage: string;
	chartProducts: ChartProductSummary[];
	chartLoading: boolean;
	chartErrorMessage: string;
}

@Injectable()
export class DashboardStateService {
	readonly pageSizeOptions = [10, 25, 50];
	readonly orderFields: Record<string, GetAllVendasParams['orderBy']> = {
		produto: 'produto',
		quantidade: 'quantidade',
	};
	private orderBy: GetAllVendasParams['orderBy'] = 'produto';
	private orderDirection: 'asc' | 'desc' = 'asc';
	private productFilter = '';
	private quantityFilter: number | null = null;
	private chartFilterSignature: string | null = null;
	private readonly stateSubject = new BehaviorSubject<DashboardState>({
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
	readonly state$ = this.stateSubject.asObservable();
	private readonly selectedProductSubject = new BehaviorSubject<string | null>(null);
	readonly selectedProduct$ = this.selectedProductSubject.asObservable();

	get state(): DashboardState {
		return this.stateSubject.value;
	}

	constructor(private readonly vendasService: VendasService) {}

	openProductDetails(product: string): void {
		this.selectedProductSubject.next(product);
	}

	closeProductDetails(): void {
		this.selectedProductSubject.next(null);
	}

	loadSales(event?: LazyLoadEvent): void {
		const current = this.state;
		let { size, page, tableFirst } = current;
		if (event) {
			if (event.filters) {
				this.readFilters(event);
			}
			tableFirst = event.first || 0;
			size = event.rows || size;
			page = Math.floor(tableFirst / size);
			const field = event.sortField;
			if (field && this.orderFields[field]) {
				this.orderBy = this.orderFields[field];
				this.orderDirection = event.sortOrder === -1 ? 'desc' : 'asc';
			}
		}

		this.update({ ...current, size, page, tableFirst, loading: true, errorMessage: '' });
		const params: GetAllVendasParams = {
			size,
			page,
			orderBy: this.orderBy,
			orderDirection: this.orderDirection,
		};
		const product = this.productFilter.trim();
		if (product) params.Produto = `*${product}*`;
		if (this.quantityFilter !== null) params.Quantidade = this.quantityFilter;

		this.vendasService.getAll(params).subscribe({
			next: (response: VendasPaginated) =>
				this.update({
					...this.state,
					sales: response.data,
					products: this.groupByProduct(response.data),
					totalItems: response.totalItems,
					loading: false,
				}),
			error: () =>
				this.update({
					...this.state,
					sales: [],
					products: [],
					totalItems: 0,
					loading: false,
					errorMessage: 'Falha ao carregar vendas.',
				}),
		});
	}

	loadChartSales(): void {
		const signature = `${this.productFilter.trim()}|${this.quantityFilter ?? ''}`;
		if (signature === this.chartFilterSignature) return;
		this.chartFilterSignature = signature;

		const params: GetAllVendasParams = {
			size: 100,
			page: 0,
			orderBy: 'produto',
			orderDirection: 'asc',
		};
		const product = this.productFilter.trim();
		if (product) params.Produto = `*${product}*`;
		if (this.quantityFilter !== null) params.Quantidade = this.quantityFilter;

		this.update({ ...this.state, chartLoading: true, chartErrorMessage: '' });
		this.vendasService.getAll(params).subscribe({
			next: (response) =>
				this.update({
					...this.state,
					chartProducts: this.groupByProductName(response.data),
					chartLoading: false,
				}),
			error: () => {
				this.chartFilterSignature = null;
				this.update({
					...this.state,
					chartProducts: [],
					chartLoading: false,
					chartErrorMessage: 'Falha ao carregar os dados do gráfico.',
				});
			},
		});
	}

	private update(state: DashboardState): void {
		this.stateSubject.next(state);
	}

	private readFilters(event: LazyLoadEvent): void {
		const filters = event.filters;
		const product = this.getFilterValue(filters?.['produto']);
		const quantity = this.getFilterValue(filters?.['quantidade']);
		this.productFilter = typeof product === 'string' ? product : '';
		const parsedQuantity = quantity === null || quantity === undefined || quantity === '' ? null : Number(quantity);
		this.quantityFilter = parsedQuantity !== null && Number.isInteger(parsedQuantity) ? parsedQuantity : null;
	}

	private getFilterValue(filter: unknown): unknown {
		if (Array.isArray(filter)) {
			const matchingFilter = filter.find((item) => {
				const value = this.getFilterValue(item);
				return value !== null && value !== undefined && value !== '';
			});
			return matchingFilter === undefined ? null : this.getFilterValue(matchingFilter);
		}
		if (!filter || typeof filter !== 'object') return filter;

		const metadata = filter as { value?: unknown; constraints?: unknown[] };
		if ('value' in metadata) return metadata.value;
		if (metadata.constraints) return this.getFilterValue(metadata.constraints);
		return null;
	}

	private groupByProduct(vendas: VendasResponse[]): Omit<VendasResponse, 'idVenda'>[] {
		const agrupamentosPorProdutoEData = new Map<string, Map<string, Omit<VendasResponse, 'idVenda'>>>();
		for (const venda of vendas) {
			const dataVenda = venda.dataVenda.split('T')[0];
			let agrupamentosPorData = agrupamentosPorProdutoEData.get(venda.produto);
			if (!agrupamentosPorData) {
				agrupamentosPorData = new Map<string, Omit<VendasResponse, 'idVenda'>>();
				agrupamentosPorProdutoEData.set(venda.produto, agrupamentosPorData);
			}

			const resumo = agrupamentosPorData.get(dataVenda) || {
				produto: venda.produto,
				dataVenda,
				quantidade: 0,
				precoUnitario: 0,
			};
			resumo.quantidade += venda.quantidade;
			resumo.precoUnitario += venda.precoUnitario;
			agrupamentosPorData.set(dataVenda, resumo);
		}
		return Array.from(agrupamentosPorProdutoEData.values()).flatMap((agrupamentosPorData) => Array.from(agrupamentosPorData.values()));
	}

	private groupByProductName(vendas: VendasResponse[]): ChartProductSummary[] {
		const quantidadesPorProduto = new Map<string, number>();
		for (const venda of vendas) {
			quantidadesPorProduto.set(venda.produto, (quantidadesPorProduto.get(venda.produto) || 0) + venda.quantidade);
		}
		return Array.from(quantidadesPorProduto, ([produto, quantidade]) => ({ produto, quantidade }));
	}
}
