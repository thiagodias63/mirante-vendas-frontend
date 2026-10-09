import { VendasResponse } from './vendas-response';

export interface VendasPaginated {
	data: VendasResponse[];
	page: number;
	size: number;
	totalItems: number;
}
