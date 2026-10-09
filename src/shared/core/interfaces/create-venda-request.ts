export interface CreateVendaRequest {
	produto: string;
	quantidade: number;
	precoUnitario: number;
	dataVenda: Date | string;
}
