import { CsvVenda } from '../interfaces/csv-venda';

export type ProcessCsvWorkerResponse =
  | { success: true; data: CsvVenda[] }
  | { success: false; error: string };

const EXPECTED_HEADER = ['id_venda', 'produto', 'quantidade', 'preco_unitario', 'data_venda'];

function parseDate(value: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) throw new Error('data_venda inválida. Use DD/MM/AAAA.');
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error('data_venda inválida.');
  }
  return value.trim();
}

function parseCsv(content: string): CsvVenda[] {
  if (!content.trim()) throw new Error('O arquivo CSV está vazio.');
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  if (!lines.length || !lines[0].trim()) throw new Error('O arquivo CSV está vazio.');

  const header = lines[0].split(',').map(column => column.trim());
  if (header.length !== EXPECTED_HEADER.length || header.some((column, index) => column !== EXPECTED_HEADER[index])) {
    throw new Error('Cabeçalho do CSV inválido.');
  }
  if (lines.length === 1) throw new Error('O arquivo CSV não possui registros.');

  return lines.slice(1).map((line, index) => {
    const lineNumber = index + 2;
    try {
      if (!line.trim()) throw new Error('linha vazia.');
      const columns = line.split(',').map(column => column.trim());
      if (columns.length !== EXPECTED_HEADER.length) throw new Error('quantidade de colunas inválida.');
      const id = Number(columns[0]);
      if (!columns[0] || !Number.isFinite(id)) throw new Error('id_venda inválido.');
      if (!columns[1]) throw new Error('produto vazio.');
      const quantity = Number(columns[2]);
      if (!columns[2] || !Number.isFinite(quantity)) throw new Error('quantidade inválida.');
      const price = Number(columns[3]);
      if (!columns[3] || !Number.isFinite(price)) throw new Error('preco_unitario inválido.');
      const date = parseDate(columns[4]);
      return { id_venda: id, produto: columns[1], quantidade: quantity, preco_unitario: price, data_venda: date };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'registro inválido.';
      throw new Error(`Erro ao processar a linha ${lineNumber}: ${message}`);
    }
  });
}

addEventListener('message', ({ data }: MessageEvent<string>) => {
  let response: ProcessCsvWorkerResponse;
  try {
    response = { success: true, data: parseCsv(data) };
  } catch (error) {
    response = { success: false, error: error instanceof Error ? error.message : 'Não foi possível processar o CSV.' };
  }
  postMessage(response);
});
