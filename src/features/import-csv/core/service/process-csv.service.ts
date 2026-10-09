import { Injectable } from '@angular/core';
import { CsvVenda } from '../interfaces/csv-venda';
import { ProcessCsvWorkerResponse } from '../workers/csv-parser';

const CSV_VENDAS_STORAGE_KEY = 'csv-vendas';

/**
 * Coordena a leitura e o processamento de arquivos CSV de vendas.
 *
 * Envia o arquivo para um Web Worker, persiste o resultado validado no
 * armazenamento local e devolve as vendas processadas ao chamador.
 */
@Injectable()
export class ProcessCsvService {
	/**
	 * Processa um arquivo CSV e armazena as vendas resultantes no `localStorage`.
	 *
	 * @param file Arquivo CSV selecionado para processamento.
	 * @returns Uma promessa com as vendas convertidas para o formato `CsvVenda`.
	 * @throws Rejeita a promessa se o worker não puder iniciar, se a leitura ou
	 * o processamento falhar, ou se não for possível persistir o resultado.
	 */
	async process(file: File): Promise<CsvVenda[]> {
		const parsedData = await this.parseCsvWithWorker(file);
		this.saveToLocalStorage(parsedData);
		return parsedData;
	}

	/**
	 * Envia o arquivo ao worker e interpreta a resposta do processamento.
	 * O worker é encerrado após responder ou emitir um erro.
	 *
	 * @param file Arquivo CSV que será lido e processado pelo worker.
	 * @returns Uma promessa com as vendas processadas pelo worker.
	 * @throws Rejeita a promessa se o worker não iniciar, falhar ou retornar uma
	 * resposta inválida ou com erro de processamento.
	 */
	private parseCsvWithWorker(file: File): Promise<CsvVenda[]> {
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
			worker.postMessage(file);
		});
	}

	/**
	 * Persiste as vendas processadas no armazenamento local como JSON.
	 *
	 * @param data Vendas retornadas pelo worker.
	 * @throws Erro se a serialização ou a gravação no `localStorage` falhar.
	 */
	private saveToLocalStorage(data: CsvVenda[]): void {
		try {
			localStorage.setItem(CSV_VENDAS_STORAGE_KEY, JSON.stringify(data));
		} catch {
			throw new Error('Não foi possível salvar os dados do CSV no armazenamento local.');
		}
	}
}
