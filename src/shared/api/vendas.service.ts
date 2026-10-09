import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateVendaRequest {
	id_venda: number;
	produto: string;
	quantidade: number;
	preco_unitario: number;
	data_venda: Date | string;
}

export interface Venda {
	idVenda: number;
	produto: string;
	quantidade: number;
	precoUnitario: number;
	dataVenda: string;
}

export interface VendaPage {
	data: Venda[];
	page: number;
	size: number;
	totalItems: number;
}

export interface GetAllVendasParams {
	size: number;
	page: number;
	orderBy: 'idVenda' | 'produto' | 'quantidade' | 'data_venda';
	orderDirection: 'asc' | 'desc';
	Produto?: string;
	Quantidade?: number;
	DataVenda?: string;
}

@Injectable({ providedIn: 'root' })
export class VendasService {
	private readonly endpoint = `${environment.apiUrl}/vendas`;

	constructor(private readonly http: HttpClient) {}

	create(venda: CreateVendaRequest): Observable<unknown> {
		return this.http.post<unknown>(this.endpoint, venda);
	}

	getAll(filters: GetAllVendasParams): Observable<VendaPage> {
		let params = new HttpParams()
			.set('_size', filters.size)
			.set('_page', filters.page)
			.set('_order', `${filters.orderBy} ${filters.orderDirection}`);

		if (filters.Produto) params = params.set('Produto', filters.Produto);
		if (filters.Quantidade) params = params.set('Quantidade', filters.Quantidade);
		if (filters.DataVenda) params = params.set('DataVenda', filters.DataVenda);

		return this.http.get<VendaPage>(this.endpoint, { params });
	}
}
