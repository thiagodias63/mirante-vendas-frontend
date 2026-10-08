import { Observable } from 'rxjs';
import { CsvVenda } from './csv-venda';

export const PROCESS_MODES = ['simultaneous', 'sequential'] as const;
export type ProcessMode = typeof PROCESS_MODES[number];

export interface ProcessData {
  send(data: CsvVenda[]): Observable<unknown>;
}
