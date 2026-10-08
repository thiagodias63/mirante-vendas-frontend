import { processCsvWorkerMessage } from './csv-parser';

addEventListener('message', ({ data }: MessageEvent<string>) => {
	postMessage(processCsvWorkerMessage(data));
});
