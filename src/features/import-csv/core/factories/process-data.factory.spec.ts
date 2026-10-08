import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CsvVenda } from '../interfaces/csv-venda';
import { ProcessDataFactory } from './process-data.factory';
import { ProcessDataSequential } from '../strategies/process-data-sequential.service';
import { ProcessDataSimultaneously } from '../strategies/process-data-simultaneously.service';

const sales: CsvVenda[] = [
  {
    id_venda: 1,
    produto: 'Camiseta',
    quantidade: 1,
    preco_unitario: 49.9,
    data_venda: '06/09/2026',
  },
  {
    id_venda: 2,
    produto: 'Calça',
    quantidade: 2,
    preco_unitario: 99.9,
    data_venda: '07/09/2026',
  },
  {
    id_venda: 3,
    produto: 'Tênis',
    quantidade: 1,
    preco_unitario: 699.9,
    data_venda: '10/09/2026',
  },
];

describe('Process data factory', () => {
  let http: HttpTestingController;
  let simultaneous: ProcessDataSimultaneously;
  let sequential: ProcessDataSequential;
  let factory: ProcessDataFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    http = TestBed.inject(HttpTestingController);
    simultaneous = TestBed.inject(ProcessDataSimultaneously);
    sequential = TestBed.inject(ProcessDataSequential);
    factory = TestBed.inject(ProcessDataFactory);
  });

  afterEach(() => http.verify());

  it('selects the requested strategy and rejects unsupported modes', () => {
    expect(factory.create('simultaneous')).toBe(simultaneous);
    expect(factory.create('sequential')).toBe(sequential);
    expect(() => factory.create('parallel')).toThrowError(
      'Estratégia de envio inválida: parallel'
    );
  });

  it('starts all POST requests concurrently and emits their responses', () => {
    const responses: unknown[] = [];
    simultaneous.send(sales).subscribe((response) => responses.push(response));

    const requests = http.match('/vendas');
    expect(requests.length).toBe(3);
    requests.forEach((request, index) => {
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(sales[index]);
    });
    requests[2].flush({ id: 3 });
    requests[0].flush({ id: 1 });
    requests[1].flush({ id: 2 });
    expect(responses).toEqual([{ id: 3 }, { id: 1 }, { id: 2 }]);
  });

  it('starts each sequential POST after the previous request completes', () => {
    const responses: unknown[] = [];
    sequential.send(sales).subscribe((response) => responses.push(response));

    const first = http.expectOne('/vendas');
    expect(first.request.body).toEqual(sales[0]);
    first.flush({ id: 1 });

    const second = http.expectOne('/vendas');
    expect(second.request.body).toEqual(sales[1]);
    second.flush({ id: 2 });

    const third = http.expectOne('/vendas');
    expect(third.request.body).toEqual(sales[2]);
    third.flush({ id: 3 });
    expect(responses).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  it('propagates HTTP failures from either strategy', () => {
    let simultaneousError: unknown;
    simultaneous
      .send(sales.slice(0, 1))
      .subscribe({ error: (error) => (simultaneousError = error) });
    http
      .expectOne('/vendas')
      .flush({ message: 'Falha' }, { status: 500, statusText: 'Server Error' });
    expect(simultaneousError).toBeTruthy();

    let sequentialError: unknown;
    sequential
      .send(sales.slice(0, 1))
      .subscribe({ error: (error) => (sequentialError = error) });
    http
      .expectOne('/vendas')
      .flush({ message: 'Falha' }, { status: 500, statusText: 'Server Error' });
    expect(sequentialError).toBeTruthy();
  });
});
