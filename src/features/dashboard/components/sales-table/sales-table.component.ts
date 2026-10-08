import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { Venda } from 'src/shared/api/vendas.service';

interface ProductSummary {
	produto: string;
	quantidade: number;
}

@Component({
	selector: 'app-sales-table',
	templateUrl: './sales-table.component.html',
	styleUrls: ['./sales-table.component.css'],
})
export class SalesTableComponent {
	products: ProductSummary[] = [];

	@Input() set sales(value: Venda[]) {
		const grouped = new Map<string, number>();
		for (const sale of value || []) {
			grouped.set(sale.produto, (grouped.get(sale.produto) || 0) + sale.quantidade);
		}
		this.products = Array.from(grouped, ([produto, quantidade]) => ({ produto, quantidade }));
	}
	@Input() totalItems = 0;
	@Input() size = 10;
	@Input() first = 0;
	@Input() loading = false;
	@Input() pageSizeOptions = [10, 25, 50];

	@Output() readonly lazyLoad = new EventEmitter<LazyLoadEvent>();
	@Output() readonly productSelected = new EventEmitter<string>();

	requestPage(event: LazyLoadEvent): void {
		this.lazyLoad.emit(event);
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
		const rows = [['Produto', 'Quantidade vendida'], ...this.products.map((product) => [product.produto, String(product.quantidade)])];

		return `\uFEFF${rows.map((row) => row.map((value) => this.escapeCsvValue(value)).join(';')).join('\r\n')}`;
	}

	private escapeCsvValue(value: string): string {
		return /[;"\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
	}
}
