import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { VendasPaginated } from '../core/interfaces/vendas-paginated';
import { GetAllVendasParams } from '../core/interfaces/get-all-vendas-params';
import { CreateVendaRequest } from '../core/interfaces/create-venda-request';

@Injectable({ providedIn: 'root' })
export class VendasService {
	private readonly endpoint = `${environment.apiUrl}/vendas`;

	constructor(private readonly http: HttpClient) {}

	create(venda: CreateVendaRequest): Observable<void> {
		return this.http.post<void>(this.endpoint, venda);
	}

	getAll(filters: GetAllVendasParams): Observable<VendasPaginated> {
		let params = new HttpParams()
			.set('_size', filters.size)
			.set('_page', filters.page)
			.set('_order', `${filters.orderBy} ${filters.orderDirection}`);

		if (filters.Produto) params = params.set('Produto', filters.Produto);
		if (filters.Quantidade) params = params.set('Quantidade', filters.Quantidade);
		if (filters.DataVenda) params = params.set('DataVenda', filters.DataVenda);

		return this.http.get<VendasPaginated>(this.endpoint, { params });
	}
}
