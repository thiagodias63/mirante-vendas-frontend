import { Injectable } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';
import { GetAllVendasParams, Venda, VendaPage, VendasService } from 'src/shared/api/vendas.service';

export interface ProductSummary {
	produto: string;
	dataVenda: string;
	quantidade: number;
	precoUnitario: number;
}

export interface DashboardState {
	sales: Venda[];
	products: ProductSummary[];
	totalItems: number;
	size: number;
	page: number;
	tableFirst: number;
	loading: boolean;
	errorMessage: string;
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
	private readonly stateSubject = new BehaviorSubject<DashboardState>({
		sales: [],
		products: [],
		totalItems: 0,
		size: 10,
		page: 0,
		tableFirst: 0,
		loading: false,
		errorMessage: '',
	});
	readonly state$ = this.stateSubject.asObservable();

	get state(): DashboardState {
		return this.stateSubject.value;
	}

	constructor(private readonly vendasService: VendasService) {}

	loadSales(event?: LazyLoadEvent): void {
		const current = this.state;
		let { size, page, tableFirst } = current;
		if (event) {
			if (event.filters) this.readFilters(event);
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
			next: (response: VendaPage) =>
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

	private update(state: DashboardState): void {
		this.stateSubject.next(state);
	}

	private readFilters(event: LazyLoadEvent): void {
		const filters = event.filters;
		const product = filters?.['produto']?.value;
		const quantity = filters?.['quantidade']?.value;
		this.productFilter = typeof product === 'string' ? product : '';
		const parsedQuantity = quantity === null || quantity === undefined || quantity === '' ? null : Number(quantity);
		this.quantityFilter = parsedQuantity !== null && Number.isInteger(parsedQuantity) ? parsedQuantity : null;
	}

	private groupByProduct(vendas: Venda[]): ProductSummary[] {
		const agrupamentosPorProdutoEData = new Map<string, Map<string, ProductSummary>>();
		for (const venda of vendas) {
			const dataVenda = venda.dataVenda.split('T')[0];
			let agrupamentosPorData = agrupamentosPorProdutoEData.get(venda.produto);
			if (!agrupamentosPorData) {
				agrupamentosPorData = new Map<string, ProductSummary>();
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
}
