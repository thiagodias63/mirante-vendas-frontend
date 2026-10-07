import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CsvVenda } from '../interfaces/csv-venda';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VendaService {
  private readonly endpoint = `${environment.apiUrl}/vendas`;

  constructor(private readonly http: HttpClient) {}

  create(venda: CsvVenda): Observable<unknown> {
    return this.http.post<unknown>(this.endpoint, venda);
  }
}
