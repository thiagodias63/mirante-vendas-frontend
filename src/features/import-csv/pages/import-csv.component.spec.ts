import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ImportCsvComponent } from './import-csv.component';
import { CsvVenda } from '../core/interfaces/csv-venda';

describe('ImportCsvComponent', () => {
	let fixture: ComponentFixture<ImportCsvComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ImportCsvComponent],
			imports: [CommonModule],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(ImportCsvComponent);
	});

	it('starts with empty upload state and simultaneous mode', () => {
		expect(fixture.componentInstance.selectedFile).toBeNull();
		expect(fixture.componentInstance.processedSales).toEqual([]);
		expect(fixture.componentInstance.processMode).toBe('simultaneous');
	});

	it('renders the upload flow until sales have been processed', () => {
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('app-upload-area')).toBeTruthy();
		expect(fixture.nativeElement.querySelector('app-format-note')).toBeTruthy();
		expect(fixture.nativeElement.querySelector('app-send-area')).toBeNull();
	});

	it('switches to the send flow after processed sales are assigned', () => {
		const sale: CsvVenda = {
			id_venda: 1,
			produto: 'Camiseta',
			quantidade: 2,
			preco_unitario: 49.9,
			data_venda: '06/09/2026',
		};
		fixture.componentInstance.processedSales = [sale];
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('app-send-area')).toBeTruthy();
		expect(fixture.nativeElement.querySelector('app-upload-area')).toBeNull();
	});
});
