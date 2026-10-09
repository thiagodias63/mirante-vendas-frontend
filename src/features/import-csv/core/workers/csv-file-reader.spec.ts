import { readFileAsText } from './csv-file-reader';

describe('readFileAsText', () => {
	let reader: FileReader;
	let readAsText: jasmine.Spy;
	let readerResult: string | ArrayBuffer | null;

	beforeEach(() => {
		readAsText = jasmine.createSpy('readAsText');
		readerResult = 'csv content';
		reader = {
			get result() {
				return readerResult;
			},
			onload: null,
			onerror: null,
			onabort: null,
			readAsText,
		} as unknown as FileReader;
		spyOn(window, 'FileReader').and.returnValue(reader);
	});

	it('reads a file and resolves with its text content', async () => {
		const file = new File(['csv content'], 'sales.csv');
		const content = readFileAsText(file);
		expect(readAsText).toHaveBeenCalledOnceWith(file);

		(reader.onload as (() => void) | null)?.();

		expect(await content).toBe('csv content');
	});

	it('rejects when the file cannot be read or the read is aborted', async () => {
		const readError = readFileAsText(new File(['csv'], 'sales.csv'));
		(reader.onerror as (() => void) | null)?.();
		await expectAsync(readError).toBeRejectedWithError('Não foi possível ler o arquivo CSV.');

		const aborted = readFileAsText(new File(['csv'], 'sales.csv'));
		(reader.onabort as (() => void) | null)?.();
		await expectAsync(aborted).toBeRejectedWithError('A leitura do arquivo CSV foi cancelada.');
	});

	it('rejects when the result is not text or the browser throws while starting the read', async () => {
		const invalidResult = readFileAsText(new File(['csv'], 'sales.csv'));
		readerResult = null;
		(reader.onload as (() => void) | null)?.();
		await expectAsync(invalidResult).toBeRejectedWithError('Não foi possível ler o conteúdo do arquivo CSV.');

		readAsText.and.throwError('read failed');
		await expectAsync(readFileAsText(new File(['csv'], 'sales.csv')))
			.toBeRejectedWithError('Não foi possível ler o arquivo CSV.');
	});
});
