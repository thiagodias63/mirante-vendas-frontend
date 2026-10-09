import { CurrencyBrCurrencyPipe } from './currency-br.pipe';

describe('CurrencyBrCurrencyPipe', () => {
	let pipe: CurrencyBrCurrencyPipe;

	beforeEach(() => {
		pipe = new CurrencyBrCurrencyPipe();
	});

	it('should return "R$ 0,00" when value is an empty string', () => {
		const result = pipe.transform('');
		expect(result).toBe('R$ 0,00');
	});

	it('should transform 1000 to "R$ 10,00"', () => {
		const result = pipe.transform(1000);
		expect(result).toBe('R$ 10,00');
	});

	it('should transform 999 to "R$ 9,99"', () => {
		const result = pipe.transform(999);
		expect(result).toBe('R$ 9,99');
	});

	it('should transform 199 to "R$ 1,99"', () => {
		const result = pipe.transform(199);
		expect(result).toBe('R$ 1,99');
	});

	it('should transform 150000 to "R$ 1.500,00"', () => {
		const result = pipe.transform(150000);
		expect(result).toBe('R$ 1.500,00');
	});

	it('should return "R$ 0,00" when valus is 0', () => {
		const result = pipe.transform(0);
		expect(result).toBe('R$ 0,00');
	});

	it('should return value with thounsand separator', () => {
		const result = pipe.transform(15000000);
		expect(result).toBe('R$ 150.000,00');
	});
});
