import { Injectable } from '@angular/core';
import { CsvVenda } from '../interfaces/csv-venda';
import { ProcessCsvWorkerResponse } from '../workers/csv-parser';

const CSV_VENDAS_STORAGE_KEY = 'csv-vendas';

@Injectable()
export class ProcessCsvService {
	process(file: File): Promise<CsvVenda[]> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onerror = (): void => reject(new Error('Não foi possível ler o arquivo CSV.'));
			reader.onabort = (): void => reject(new Error('A leitura do arquivo CSV foi cancelada.'));
			reader.onload = (): void => {
				if (typeof reader.result !== 'string') {
					reject(new Error('Não foi possível ler o conteúdo do arquivo CSV.'));
					return;
				}

				let worker: Worker;
				try {
					worker = new Worker(new URL('../workers/process-csv.worker', import.meta.url), { type: 'module' });
				} catch {
					reject(new Error('Não foi possível iniciar o processamento do CSV.'));
					return;
				}

				const finish = (): void => worker.terminate();
				worker.onerror = (): void => {
					finish();
					reject(new Error('Ocorreu um erro ao processar o arquivo CSV.'));
				};
				worker.onmessage = ({ data }: MessageEvent<ProcessCsvWorkerResponse>): void => {
					finish();
					if (!data || typeof data.success !== 'boolean') {
						reject(new Error('Resposta inválida ao processar o arquivo CSV.'));
						return;
					}
					if (!data.success) {
						reject(new Error(data.error));
						return;
					}
					try {
						localStorage.setItem(CSV_VENDAS_STORAGE_KEY, JSON.stringify(data.data));
						resolve(data.data);
					} catch {
						reject(new Error('Não foi possível salvar os dados do CSV no armazenamento local.'));
					}
				};
				worker.postMessage(reader.result);
			};
			reader.readAsText(file);
		});
	}
}
