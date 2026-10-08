import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CsvVenda } from '../interfaces/csv-venda';
import { ProcessData } from '../interfaces/process-data';
import { VendaService } from '../api/venda.service';

@Injectable()
export class ProcessDataSimultaneously implements ProcessData {
  constructor(private readonly vendaService: VendaService) {}

  send(data: CsvVenda[]): Observable<unknown> {
    return from(data).pipe(
      mergeMap((venda) => this.vendaService.create(venda))
    );
  }
}
