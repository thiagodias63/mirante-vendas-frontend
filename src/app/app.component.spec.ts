import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AppComponent } from './app.component';
import { ProcessCsvService } from './core/services/process-csv.service';
import { ProcessDataFactory } from './core/factories/process-data.factory';
import { ProcessData } from './core/interfaces/process-data';
import { of, throwError } from 'rxjs';

describe('AppComponent', () => {
  let processCsv: jasmine.SpyObj<ProcessCsvService>;
  let processFactory: jasmine.SpyObj<ProcessDataFactory>;

  beforeEach(async () => {
    processCsv = jasmine.createSpyObj<ProcessCsvService>('ProcessCsvService', ['process']);
    processFactory = jasmine.createSpyObj<ProcessDataFactory>('ProcessDataFactory', ['create']);
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: ProcessCsvService, useValue: processCsv },
        { provide: ProcessDataFactory, useValue: processFactory }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  it('does not submit without a selected file', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.componentInstance.submit();
    expect(processCsv.process).not.toHaveBeenCalled();
  });

  it('shows an error when the selected file is not a CSV', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.selectedFile = new File(['content'], 'sales.txt');
    await fixture.componentInstance.submit();
    expect(processCsv.process).not.toHaveBeenCalled();
    expect(fixture.componentInstance.toast?.type).toBe('error');
  });

  it('processes a CSV and keeps loading for at least five seconds', fakeAsync(() => {
    processCsv.process.and.returnValue(Promise.resolve([]));
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.selectedFile = new File(['csv'], 'sales.csv');
    let completed = false;
    fixture.componentInstance.submit().then(() => completed = true);
    expect(fixture.componentInstance.loading).toBeTrue();
    flushMicrotasks();
    tick(4999);
    expect(fixture.componentInstance.loading).toBeTrue();
    tick(1);
    flushMicrotasks();
    expect(completed).toBeTrue();
    expect(fixture.componentInstance.loading).toBeFalse();
    expect(fixture.componentInstance.toast?.type).toBe('success');
  }));

  it('shows the processing error after the minimum loading time', fakeAsync(() => {
    processCsv.process.and.returnValue(Promise.reject(new Error('Cabeçalho do CSV inválido.')));
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.selectedFile = new File(['csv'], 'sales.csv');
    fixture.componentInstance.submit();
    flushMicrotasks();
    tick(5000);
    flushMicrotasks();
    expect(fixture.componentInstance.toast?.message).toBe('Cabeçalho do CSV inválido.');
    expect(fixture.componentInstance.toast?.type).toBe('error');
  }));

  it('sends processed sales with the selected strategy and reports the result count', () => {
    const processor = jasmine.createSpyObj<ProcessData>('ProcessData', ['send']);
    processor.send.and.returnValue(of({ id: 1 }, { id: 2 }));
    processFactory.create.and.returnValue(processor);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.processedSales = [
      { id_venda: 1, produto: 'Camiseta', quantidade: 1, preco_unitario: 49.9, data_venda: '06/09/2026' },
      { id_venda: 2, produto: 'Calça', quantidade: 2, preco_unitario: 99.9, data_venda: '07/09/2026' }
    ];

    fixture.componentInstance.sendSales();

    expect(processFactory.create).toHaveBeenCalledWith('simultaneous');
    expect(processor.send).toHaveBeenCalledWith(fixture.componentInstance.processedSales);
    expect(fixture.componentInstance.toast?.message).toBe('2 vendas enviadas com sucesso.');
  });

  it('shows HTTP errors and ends the sending state', () => {
    const processor = jasmine.createSpyObj<ProcessData>('ProcessData', ['send']);
    processor.send.and.returnValue(throwError(() => ({ message: 'Falha no backend' })));
    processFactory.create.and.returnValue(processor);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.processedSales = [
      { id_venda: 1, produto: 'Camiseta', quantidade: 1, preco_unitario: 49.9, data_venda: '06/09/2026' }
    ];

    fixture.componentInstance.sendSales();

    expect(fixture.componentInstance.sending).toBeFalse();
    expect(fixture.componentInstance.toast?.title).toBe('Erro ao enviar vendas');
    expect(fixture.componentInstance.toast?.message).toBe('Falha no backend');
  });
});
