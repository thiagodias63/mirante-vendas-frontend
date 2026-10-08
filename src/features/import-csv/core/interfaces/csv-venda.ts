export interface CsvVenda {
  id_venda: number;
  produto: string;
  quantidade: number;
  preco_unitario: number;
  data_venda: Date | string;
}
