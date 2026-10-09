export interface GetAllVendasParams {
	size: number;
	page: number;
	orderBy: 'idVenda' | 'produto' | 'quantidade' | 'dataVenda';
	orderDirection: 'asc' | 'desc';
	Produto?: string;
	Quantidade?: number;
	DataVenda?: string;
}
