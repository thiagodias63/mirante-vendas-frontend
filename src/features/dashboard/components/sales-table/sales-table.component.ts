import { Component, EventEmitter, Output } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { DashboardStateService } from '../../state/dashboard-state.service';

@Component({
	selector: 'app-sales-table',
	templateUrl: './sales-table.component.html',
	styleUrls: ['./sales-table.component.css'],
})
export class SalesTableComponent {
	@Output() readonly productSelected = new EventEmitter<string>();

	constructor(readonly dashboardState: DashboardStateService) {}

	requestPage(event: LazyLoadEvent): void {
		this.dashboardState.loadSales(event);
	}

	selectProduct(product: string): void {
		this.productSelected.emit(product);
	}

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
