import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CsvVenda } from '../interfaces/csv-venda';
import { ProcessData } from '../interfaces/process-data';
import { VendasService } from 'src/shared/api/vendas.service';

@Injectable()
export class ProcessDataSimultaneously implements ProcessData {
	constructor(private readonly vendaService: VendasService) {}

	send(data: CsvVenda[]): Observable<void> {
		return from(data).pipe(mergeMap((venda) => this.vendaService.create(venda)));
	}
}
