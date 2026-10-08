import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CsvVenda } from '../../core/interfaces/csv-venda';
import { ProcessData, ProcessMode } from '../../core/interfaces/process-data';
import { ProcessDataFactory } from '../../core/factories/process-data.factory';
import { ProcessCsvService } from '../../core/service/process-csv.service';
import { ToastService } from 'src/shared/toast/toast.service';

@Component({
  selector: 'app-send-area',
  templateUrl: './send-area.component.html',
  styleUrls: ['./send-area.component.css'],
})
export class SendAreaComponent {
  readonly processModes = [
    { label: 'Simultâneo', value: 'simultaneous' as ProcessMode },
    { label: 'Encadeado', value: 'sequential' as ProcessMode },
  ];

  @Input() loading = false;
  @Input() sending = false;
  @Input() processedSales: CsvVenda[] = [];
  @Input() selectedFile: File | null = null;
  @Input() processMode: ProcessMode = 'simultaneous';

  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() sendingChange = new EventEmitter<boolean>();
  @Output() processedSalesChange = new EventEmitter<CsvVenda[]>();
  @Output() selectedFileChange = new EventEmitter<File | null>();
  @Output() processModeChange = new EventEmitter<ProcessMode>();

  constructor(
    private readonly toastService: ToastService,
    private readonly processDataFactory: ProcessDataFactory
  ) {}

  sendSales(): void {
    if (!this.processedSales.length || this.sending || this.loading) return;

    let processor: ProcessData;
    try {
      processor = this.processDataFactory.create(this.processMode);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Estratégia de envio inválida.';
      this.toastService.showToast('Erro ao enviar vendas', message, 'error');
      return;
    }

    this.sendingChange.emit(true);
    this.toastService.dismissToast();
    let sentCount = 0;
    processor.send(this.processedSales).subscribe({
      next: () => sentCount++,
      error: (error) => {
        this.sendingChange.emit(false);
        const message =
          error?.error?.message ||
          error?.message ||
          'Não foi possível enviar as vendas.';
        this.toastService.showToast('Erro ao enviar vendas', message, 'error');
      },
      complete: () => {
        this.sendingChange.emit(false);
        this.toastService.showToast(
          'Envio concluído',
          `${sentCount} ${
            sentCount === 1 ? 'venda enviada' : 'vendas enviadas'
          } com sucesso.`,
          'success'
        );
      },
    });
  }

  goBack(): void {
    this.processedSalesChange.emit([]);
  }
}
