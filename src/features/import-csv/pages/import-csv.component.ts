import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CsvVenda } from '../core/interfaces/csv-venda';
import { ProcessMode } from '../core/interfaces/process-data';

@Component({
  selector: 'import-csv',
  templateUrl: './import-csv.component.html',
  styleUrls: ['./import-csv.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportCsvComponent {
  selectedFile: File | null = null;
  loading = false;
  sending = false;
  processedSales: CsvVenda[] = [];
  processMode: ProcessMode = 'simultaneous';
}
