import { ProcessCsvWorkerResponse, processCsvWorkerMessage } from './csv-parser';
import { readFileAsText } from './csv-file-reader';

addEventListener('message', async ({ data: file }: MessageEvent<File>) => {
	let response: ProcessCsvWorkerResponse;
	try {
		response = processCsvWorkerMessage(await readFileAsText(file));
	} catch (error) {
		response = {
			success: false,
			error: error instanceof Error ? error.message : 'Não foi possível ler o arquivo CSV.',
		};
	}
	postMessage(response);
});
