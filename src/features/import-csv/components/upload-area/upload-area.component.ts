import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CsvVenda } from '../../core/interfaces/csv-venda';
import { ToastService } from 'src/shared/toast/toast.service';
import { ProcessCsvService } from '../../core/service/process-csv.service';
import { FileUpload } from 'primeng/fileupload';

@Component({
	selector: 'app-upload-area',
	templateUrl: './upload-area.component.html',
	styleUrls: ['./upload-area.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadAreaComponent {
	@ViewChild('fileUploadRef') fileUploadRef!: FileUpload;

	@Input() loading = false;
	@Input() sending = false;
	@Input() processedSales: CsvVenda[] = [];
	@Input() selectedFile: File | null = null;

	@Output() loadingChange = new EventEmitter<boolean>();
	@Output() sendingChange = new EventEmitter<boolean>();
	@Output() processedSalesChange = new EventEmitter<CsvVenda[]>();
	@Output() selectedFileChange = new EventEmitter<File | null>();

	constructor(
		private readonly processCsvService: ProcessCsvService,
		private readonly toastService: ToastService,
	) {}

	onFileSelect(event: { files: File[] }): void {
		this.selectedFileChange.emit(event.files[0] || null);
		this.processedSalesChange.emit([]);
		this.toastService.dismissToast();
		this.fileUploadRef.clear();
	}

	async submit(): Promise<void> {
		if (!this.selectedFile || this.loading) return;
		if (!this.selectedFile.name.toLowerCase().endsWith('.csv')) {
			this.toastService.showToast('Erro ao importar CSV', 'Selecione um arquivo com extensão .csv.', 'error');
			return;
		}

		this.loadingChange.emit(true);
		this.toastService.dismissToast();
		let errorMessage: string | null = null;
		try {
			this.processedSales = await this.processCsvService.process(this.selectedFile);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Não foi possível processar o arquivo CSV.';
			this.loadingChange.emit(false);
		}

		if (errorMessage) {
			this.toastService.showToast('Erro ao importar CSV', errorMessage, 'error');
			return;
		}
		this.toastService.showToast('Importação concluída', `${this.processedSales.length} vendas prontas para envio.`, 'success');

		setTimeout(() => {
			this.loadingChange.emit(false);
			this.processedSalesChange.emit(this.processedSales);
		}, 1_000);
	}
}
