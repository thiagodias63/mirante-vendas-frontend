import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Venda, VendasService } from 'src/shared/api/vendas.service';

@Component({
	selector: 'app-product-details-dialog',
	templateUrl: './product-details-dialog.component.html',
	styleUrls: ['./product-details-dialog.component.css'],
})
export class ProductDetailsDialogComponent implements OnChanges {
	@Input() visible = false;
	@Input() product = '';
	@Output() readonly visibleChange = new EventEmitter<boolean>();

	details: Venda[] = [];
	loading = false;
	errorMessage = '';

	constructor(private readonly vendasService: VendasService) {}

	ngOnChanges(changes: SimpleChanges): void {
		const opened = changes['visible']?.currentValue === true;
		const productChanged = changes['product'] !== undefined;
		if (this.visible && (opened || productChanged)) void this.loadProduct();
	}

	setVisible(visible: boolean): void {
		this.visibleChange.emit(visible);
	}

	async loadProduct(): Promise<void> {
		if (!this.product) return;
		this.details = [];
		this.errorMessage = '';
		this.loading = true;

		try {
			const matchingSales: Venda[] = [];
			const pageSize = 100;
			let page = 0;
			let totalItems = 0;
			do {
				const response = await firstValueFrom(
					this.vendasService.getAll({
						size: pageSize,
						page,
						orderBy: 'idVenda',
						orderDirection: 'asc',
						Produto: `*${this.product}*`,
					}),
				);
				matchingSales.push(...response.data.filter((sale) => sale.produto === this.product));
				totalItems = response.totalItems;
				if (!response.data.length) break;
				page++;
			} while (page * pageSize < totalItems);
		} catch {
			this.errorMessage = 'Could not load this product sales.';
		} finally {
			this.loading = false;
		}
	}
}
