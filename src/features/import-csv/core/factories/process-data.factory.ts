import { Injectable } from '@angular/core';
import { ProcessData, PROCESS_MODES } from '../interfaces/process-data';
import { ProcessDataSequential } from '../strategies/process-data-sequential.service';
import { ProcessDataSimultaneously } from '../strategies/process-data-simultaneously.service';

@Injectable()
export class ProcessDataFactory {
	constructor(
		private readonly simultaneous: ProcessDataSimultaneously,
		private readonly sequential: ProcessDataSequential,
	) {}

	create(mode: string): ProcessData {
		if (!(PROCESS_MODES as readonly string[]).includes(mode)) {
			throw new Error(`Estratégia de envio inválida: ${mode}`);
		}

		switch (mode) {
			case 'simultaneous':
				return this.simultaneous;
			case 'sequential':
				return this.sequential;
		}
		throw new Error(`Estratégia de envio inválida: ${mode}`);
	}
}
