/**
 * Lê um arquivo CSV como texto usando a API `FileReader` disponível no worker.
 *
 * @param file Arquivo CSV que será lido.
 * @returns Uma promessa com o conteúdo textual do arquivo.
 * @throws Rejeita a promessa se a leitura falhar, for cancelada ou não produzir texto.
 */
export function readFileAsText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(new Error('Não foi possível ler o arquivo CSV.'));
		reader.onabort = () => reject(new Error('A leitura do arquivo CSV foi cancelada.'));
		reader.onload = () => {
			if (typeof reader.result !== 'string') {
				reject(new Error('Não foi possível ler o conteúdo do arquivo CSV.'));
				return;
			}
			resolve(reader.result);
		};

		try {
			reader.readAsText(file);
		} catch {
			reject(new Error('Não foi possível ler o arquivo CSV.'));
		}
	});
}
