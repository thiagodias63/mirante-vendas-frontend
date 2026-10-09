import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'currencyBr',
	pure: true,
})
export class CurrencyBrPipe implements PipeTransform {
	transform(value: number | string): string {
		if (!value) {
			value = 0;
		}

		let numericValue = Number(value);

		if (isNaN(numericValue)) {
			numericValue = 0;
		}

		const amount = numericValue / 100;

		const stringAmount = amount.toFixed(2);

		const [integerPart, decimalPart] = stringAmount.split('.');

		const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

		return `R$ ${formattedInteger},${decimalPart}`;
	}
}
