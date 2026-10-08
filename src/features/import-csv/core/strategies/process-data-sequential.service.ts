import { Injectable } from '@angular/core';

import { Observable, from, throwError, timer } from 'rxjs';
import { concatMap, retry, catchError } from 'rxjs/operators';
import { CsvVenda } from '../interfaces/csv-venda';
import { ProcessData } from '../interfaces/process-data';
import { VendasService } from 'src/shared/api/vendas.service';

@Injectable()
export class ProcessDataSequential implements ProcessData {
  constructor(private readonly vendaService: VendasService) {}

  send(data: CsvVenda[]): Observable<unknown> {
    return from(data).pipe(
      concatMap((venda) =>
        this.vendaService.create(venda).pipe(
          // Aplica a estratégia de retry para cada requisição individual que falhar
          retry({
            count: 3, // Número máximo de tentativas (além da primeira chamada)
            delay: (error, retryCount) => {
              // retryCount começa em 1.
              // 1ª retentativa: 1000ms (1s)
              // 2ª retentativa: 2000ms (2s)
              // 3ª retentativa: 3000ms (3s)
              const delayMs = retryCount * 1000;
              console.warn(
                `Tentativa ${retryCount} falhou. Retentando em ${
                  delayMs / 1_000
                }s...`,
                error
              );
              return timer(delayMs);
            },
          }),
          catchError((err) => {
            // Caso esgote todas as tentativas, cai aqui para você tratar ou repassar o erro
            console.error('Falha definitiva ao enviar a venda:', venda, err);
            return throwError(() => err);
          })
        )
      )
    );
  }
}
