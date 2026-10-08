import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { CsvVenda } from '../interfaces/csv-venda';
import { ProcessData } from '../interfaces/process-data';
import { VendaService } from './venda.service';

@Injectable({ providedIn: 'root' })
export class ProcessDataSequential implements ProcessData {
	constructor(private readonly vendaService: VendaService) {}

	send(data: CsvVenda[]): Observable<unknown> {
		return from(data).pipe(concatMap((venda) => this.vendaService.create(venda)));
	}
}
