import { Component } from '@angular/core';
import { ProcessCsvService } from './core/services/process-csv.service';
import { CsvVenda } from './core/interfaces/csv-venda';
import { ProcessDataFactory } from './core/factories/process-data.factory';
import { ProcessData, ProcessMode } from './core/interfaces/process-data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  selectedFile: File | null = null;
  loading = false;
  sending = false;
  processedSales: CsvVenda[] = [];
  processMode: ProcessMode = 'simultaneous';
  readonly processModes = [
    { label: 'Simultâneo', value: 'simultaneous' as ProcessMode },
    { label: 'Encadeado', value: 'sequential' as ProcessMode }
  ];
  toast: { title: string; message: string; type: 'success' | 'error' } | null = null;

  constructor(
    private readonly processCsvService: ProcessCsvService,
    private readonly processDataFactory: ProcessDataFactory
  ) {}

  onFileSelect(event: { files: File[] }): void {
    this.selectedFile = event.files[0] || null;
    this.processedSales = [];
    this.toast = null;
  }

  async submit(): Promise<void> {
    if (!this.selectedFile || this.loading) return;
    if (!this.selectedFile.name.toLowerCase().endsWith('.csv')) {
      this.showToast('Erro ao importar CSV', 'Selecione um arquivo com extensão .csv.', 'error');
      return;
    }

    const startedAt = Date.now();
    this.loading = true;
    this.toast = null;
    let errorMessage: string | null = null;
    try {
      this.processedSales = await this.processCsvService.process(this.selectedFile);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Não foi possível processar o arquivo CSV.';
    }

    const remaining = 5000 - (Date.now() - startedAt);
    if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining));
    this.loading = false;

    if (errorMessage) {
      this.showToast('Erro ao importar CSV', errorMessage, 'error');
    } else {
      this.showToast('Importação concluída', `${this.processedSales.length} vendas prontas para envio.`, 'success');
    }
  }

  sendSales(): void {
    if (!this.processedSales.length || this.sending || this.loading) return;

    let processor: ProcessData;
    try {
      processor = this.processDataFactory.create(this.processMode);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Estratégia de envio inválida.';
      this.showToast('Erro ao enviar vendas', message, 'error');
      return;
    }

    this.sending = true;
    this.toast = null;
    let sentCount = 0;
    processor.send(this.processedSales).subscribe({
      next: () => sentCount++,
      error: error => {
        this.sending = false;
        const message = error?.error?.message || error?.message || 'Não foi possível enviar as vendas.';
        this.showToast('Erro ao enviar vendas', message, 'error');
      },
      complete: () => {
        this.sending = false;
        this.showToast('Envio concluído', `${sentCount} ${sentCount === 1 ? 'venda enviada' : 'vendas enviadas'} com sucesso.`, 'success');
      }
    });
  }

  dismissToast(): void {
    this.toast = null;
  }

  private showToast(title: string, message: string, type: 'success' | 'error'): void {
    this.toast = { title, message, type };
  }
}
