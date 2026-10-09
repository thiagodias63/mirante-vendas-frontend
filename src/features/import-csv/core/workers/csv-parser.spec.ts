import { parseCsv, processCsvWorkerMessage } from './csv-parser';

describe('CSV worker parser', () => {
	const header = 'id_venda,produto,quantidade,preco_unitario,data_venda';

	it('should parses rows, trims values and ignores trailing blank lines', () => {
		const csv = `\uFEFF${header}\r\n 12 , Camiseta , 2 , 49.9 , 08/10/2026 \r\n\r\n`;
		expect(parseCsv(csv)).toEqual([
			{
				produto: 'Camiseta',
				quantidade: 2,
				precoUnitario: 4990,
				dataVenda: '2026-10-08',
			},
		]);
	});

	it('should rejects empty CSV, invalid headers, and a header without rows', () => {
		expect(() => parseCsv(' \r\n ')).toThrow();
		expect(() => parseCsv('id,produto,quantidade,preco_unitario,data_venda\n1,A,1,2,01/01/2026')).toThrow();
		expect(() => parseCsv(header)).toThrow();
	});

	it('should reports a line number for malformed rows and invalid dates', () => {
		expect(() => parseCsv(`${header}\n1,Produto,1,10,31/02/2026`)).toThrowError(/linha 2/);
		expect(() => parseCsv(`${header}\n1,,1,10,01/01/2026`)).toThrowError(/linha 2/);
		expect(() => parseCsv(`${header}\n1,Produto,1,10,01/01/2026\n\n2,Outro,1,5,02/01/2026`)).toThrowError(/linha 3/);
	});

	it('should rejects invalid identifiers, quantities, prices, column counts, and date formats', () => {
		const badRows = [
			'abc,Produto,1,10,01/01/2026',
			'1,Produto,um,10,01/01/2026',
			'1,Produto,1,dez,01/01/2026',
			'1,Produto,1,10',
			'1,Produto,1,10,2026-01-01',
		];
		badRows.forEach((row) => expect(() => parseCsv(`${header}\n${row}`)).toThrow());
	});

	it('should returns success and error responses for worker messages', () => {
		expect(processCsvWorkerMessage(`${header}\n1,Produto,1,10,01/01/2026`)).toEqual({
			success: true,
			data: [
				{
					produto: 'Produto',
					quantidade: 1,
					precoUnitario: 1000,
					dataVenda: '2026-01-01',
				},
			],
		});
		expect(processCsvWorkerMessage('invalid')).toEqual(jasmine.objectContaining({ success: false }));
	});
});
