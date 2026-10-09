import { Injectable } from '@angular/core';
import { CsvVenda } from '../interfaces/csv-venda';
import { ProcessCsvWorkerResponse } from '../workers/csv-parser';

const CSV_VENDAS_STORAGE_KEY = 'csv-vendas';

@Injectable()
export class ProcessCsvService {
	/**
	 * Processa um arquivo CSV, orquestrando a leitura do arquivo,
	 * o parsing em uma thread separada e o armazenamento em cache.
	 *
	 * @param file O arquivo CSV a ser processado.
	 * @returns Uma Promise que resolve com a lista de vendas processadas.
	 */
	async process(file: File): Promise<CsvVenda[]> {
		const csvContent = await this.readFileAsText(file);
		const parsedData = await this.parseCsvWithWorker(csvContent);
		this.saveToLocalStorage(parsedData);

		return parsedData;
	}

	/**
	 * Lê o conteúdo de um arquivo físico e o converte para texto.
	 *
	 * @param file O arquivo a ser lido.
	 * @returns Uma Promise que resolve com o conteúdo do arquivo em formato de string.
	 * @throws {Error} Se ocorrer uma falha na leitura ou se o arquivo for abortado.
	 */
	private readFileAsText(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onerror = () => reject(new Error('Não foi possível ler o arquivo CSV.'));
			reader.onabort = () => reject(new Error('A leitura do arquivo CSV foi cancelada.'));
			reader.onload = () => {
				if (typeof reader.result !== 'string') {
					reject(new Error('Não foi possível ler o conteúdo do arquivo CSV.'));
					return;
				}
				resolve(reader.result);
			};

			reader.readAsText(file);
		});
	}

	/**
	 * Envia o conteúdo do CSV para um Web Worker processar sem travar a thread principal (UI).
	 *
	 * @param csvContent O conteúdo do arquivo CSV em texto.
	 * @returns Uma Promise que resolve com os dados processados e tipados.
	 * @throws {Error} Se o worker falhar ao iniciar, retornar erro ou emitir uma resposta em formato inválido.
	 */
	private parseCsvWithWorker(csvContent: string): Promise<CsvVenda[]> {
		return new Promise((resolve, reject) => {
			let worker: Worker;

			try {
				worker = new Worker(new URL('../workers/process-csv.worker', import.meta.url), { type: 'module' });
			} catch {
				reject(new Error('Não foi possível iniciar o processamento do CSV.'));
				return;
			}

			const finish = () => worker.terminate();

			worker.onerror = () => {
				finish();
				reject(new Error('Ocorreu um erro ao processar o arquivo CSV.'));
			};

			worker.onmessage = ({ data }: MessageEvent<ProcessCsvWorkerResponse>) => {
				finish();

				if (!data || typeof data.success !== 'boolean') {
					reject(new Error('Resposta inválida ao processar o arquivo CSV.'));
					return;
				}

				if (!data.success) {
					reject(new Error(data.error));
					return;
				}

				resolve(data.data);
			};

			worker.postMessage(csvContent);
		});
	}

	/**
	 * Salva a lista de vendas processadas no armazenamento local (localStorage) em formato JSON.
	 *
	 * @param data A lista de vendas a ser salva.
	 * @throws {Error} Se houver falha de escrita (ex: cota excedida do navegador).
	 */
	private saveToLocalStorage(data: CsvVenda[]): void {
		try {
			localStorage.setItem(CSV_VENDAS_STORAGE_KEY, JSON.stringify(data));
		} catch {
			throw new Error('Não foi possível salvar os dados do CSV no armazenamento local.');
		}
	}
}
