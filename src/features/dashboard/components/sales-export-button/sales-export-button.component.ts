import { Component } from '@angular/core';
import { DashboardStateService } from '../../state/dashboard-state.service';

@Component({
	selector: 'app-sales-export-button',
	templateUrl: './sales-export-button.component.html',
	styleUrls: ['./sales-export-button.component.css'],
})
export class SalesExportButtonComponent {
	constructor(private readonly dashboardState: DashboardStateService) {}

	exportToCsv(): void {
		const file = new Blob([this.buildCsvContent()], { type: 'text/csv;charset=utf-8' });
		const url = URL.createObjectURL(file);
		const downloadLink = document.createElement('a');
		downloadLink.href = url;
		downloadLink.download = 'vendas-por-produto.csv';
		downloadLink.style.display = 'none';
		document.body.appendChild(downloadLink);
		try {
			downloadLink.click();
		} finally {
			downloadLink.remove();
			URL.revokeObjectURL(url);
		}
	}

	private buildCsvContent(): string {
		const rows = [
			['Produto', 'Data da venda', 'Quantidade vendida', 'Preço total'],
			...this.dashboardState.state.products.map((product) => [
				product.produto,
				product.dataVenda,
				String(product.quantidade),
				String(product.precoUnitario),
			]),
		];

		return `\uFEFF${rows.map((row) => row.map((value) => this.escapeCsvValue(value)).join(';')).join('\r\n')}`;
	}

	private escapeCsvValue(value: string): string {
		return /[;"\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
	}
}
