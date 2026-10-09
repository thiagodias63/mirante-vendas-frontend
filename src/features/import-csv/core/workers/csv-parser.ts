import { CsvVenda } from '../interfaces/csv-venda';

export type ProcessCsvWorkerResponse = { success: true; data: CsvVenda[] } | { success: false; error: string };

const EXPECTED_HEADER = ['id_venda', 'produto', 'quantidade', 'preco_unitario', 'data_venda'];

/**
 * Converte e valida uma string de data no formato DD/MM/AAAA.
 *
 * Garante que a string corresponda ao formato esperado e represente
 * uma data válida no calendário (ex.: rejeita dias/meses inexistentes como 31/02/2023).
 *
 * @param {string} value - A string contendo a data a ser processada.
 * @returns {string} A string da data higienizada (sem espaços adicionais nas pontas).
 * @throws {Error} Se o formato for diferente de DD/MM/AAAA ou se a data for inexistente no calendário.
 */
function parseDate(value: string): string {
	const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
	if (!match) throw new Error('data_venda inv\u00e1lida. Use DD/MM/AAAA.');
	const day = Number(match[1]);
	const month = Number(match[2]);
	const year = Number(match[3]);
	const date = new Date(Date.UTC(year, month - 1, day));
	if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
		throw new Error('data_venda inv\u00e1lida.');
	}
	return value.trim();
}
/**
 * Remove caracteres BOM, divide o conteúdo em linhas e remove linhas vazias ao final.
 *
 * @param {string} content - Conteúdo bruto do arquivo CSV.
 * @returns {string[]} Lista de linhas não vazias do CSV.
 * @throws {Error} Se o conteúdo estiver vazio ou contiver apenas espaços.
 */
function sanitizeLines(content: string): string[] {
	if (!content.trim()) {
		throw new Error('O arquivo CSV está vazio.');
	}

	const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);

	while (lines.length && !lines[lines.length - 1].trim()) {
		lines.pop();
	}

	if (!lines.length || !lines[0].trim()) {
		throw new Error('O arquivo CSV está vazio.');
	}

	return lines;
}

/**
 * Valida se o cabeçalho da primeira linha corresponde exatamente à estrutura esperada.
 *
 * @param {string} headerLine - Primeira linha do CSV contendo os nomes das colunas.
 * @throws {Error} Se o cabeçalho não corresponder a `EXPECTED_HEADER`.
 */
function validateHeader(headerLine: string): void {
	const header = headerLine.split(',').map((column) => column.trim());

	const isValidLength = header.length === EXPECTED_HEADER.length;
	const matchesExpected = header.every((column, index) => column === EXPECTED_HEADER[index]);

	if (!isValidLength || !matchesExpected) {
		throw new Error('Cabeçalho do CSV inválido.');
	}
}

/**
 * Converte uma linha individual do CSV em um objeto `CsvVenda`.
 *
 * @param {string} line - Texto da linha do CSV a ser processada.
 * @param {number} lineNumber - Número da linha no arquivo original para relatório de erros.
 * @returns {CsvVenda} Objeto de venda formatado e validado.
 * @throws {Error} Se a linha for vazia, tiver colunas ausentes ou conter dados numéricos/datas inválidos.
 */
function parseCsvRow(line: string, lineNumber: number): CsvVenda {
	try {
		if (!line.trim()) {
			throw new Error('linha vazia.');
		}

		const columns = line.split(',').map((column) => column.trim());

		if (columns.length !== EXPECTED_HEADER.length) {
			throw new Error('quantidade de colunas inválida.');
		}

		const id = Number(columns[0]);
		if (!columns[0] || !Number.isFinite(id)) {
			throw new Error('id_venda inválido.');
		}

		if (!columns[1]) {
			throw new Error('produto vazio.');
		}

		const quantity = Number(columns[2]);
		if (!columns[2] || !Number.isFinite(quantity)) {
			throw new Error('quantidade inválida.');
		}

		const price = Number(columns[3]);
		if (!columns[3] || !Number.isFinite(price)) {
			throw new Error('preco_unitario inválido.');
		}

		const date = parseDate(columns[4]);

		return {
			id_venda: id,
			produto: columns[1],
			quantidade: quantity,
			preco_unitario: price,
			data_venda: date,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : 'registro inválido.';
		throw new Error(`Erro ao processar a linha ${lineNumber}: ${message}`);
	}
}

/**
 * Realiza o parse de uma string em formato CSV contendo dados de vendas.
 *
 * @param {string} content - Conteúdo textual completo do arquivo CSV.
 * @returns {CsvVenda[]} Lista de objetos `CsvVenda` validados e tipados.
 * @throws {Error} Se o arquivo estiver vazio, com cabeçalho inválido, sem registros ou com linhas malformatadas.
 */
export function parseCsv(content: string): CsvVenda[] {
	const lines = sanitizeLines(content);

	validateHeader(lines[0]);

	if (lines.length === 1) {
		throw new Error('O arquivo CSV não possui registros.');
	}

	return lines.slice(1).map((line, index) => parseCsvRow(line, index + 2));
}

/**
 * Ponto de entrada (handler) para mensagens do Web Worker responsáveis pelo processamento de CSV.
 *
 * Encapsula a chamada de `parseCsv` capturando exceções e convertendo o resultado
 * em um objeto estandardizado `ProcessCsvWorkerResponse`.
 *
 * @param {string} content - Conteúdo bruto do arquivo CSV a ser processado.
 * @returns {ProcessCsvWorkerResponse} Objeto contendo `success: true` e os dados processados em caso de sucesso,
 * ou `success: false` com a mensagem de erro formatada em caso de falha.
 */
export function processCsvWorkerMessage(content: string): ProcessCsvWorkerResponse {
	try {
		return { success: true, data: parseCsv(content) };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'N\u00e3o foi poss\u00edvel processar o CSV.',
		};
	}
}
