/* eslint-disable @typescript-eslint/no-explicit-any */
import { lcg } from '../../../random/lcg';
import type { OverlappingModel } from '../../../wfc/overlapping-model';

export function handleWorkerMessage<Model extends OverlappingModel>(
	worker: DedicatedWorkerGlobalScope,
	e: any,
	constructor: ( ...args: any  ) => Model,
) {
	console.log( '> Web Worker initiated' );

	const random = lcg( e.data.seed );
	console.log( `> Random seed: ${e.data.seed}` );

	const instance = constructor(
		new Uint8Array( e.data.sampleData ),
		e.data.sampleWidth,
		e.data.sampleHeight,
		e.data.n,
		e.data.width,
		e.data.height,
		e.data.periodicInput,
		e.data.periodicOutput,
		e.data.symmetry
	);

	console.log( `> Overlapping Model: ${instance.colors.length} colors, ${instance.patterns.length} patterns` );

	const count = e.data.count || 1;

	const start0 = performance.now();
	instance.init();
	const end0 = performance.now();
	const time0 = end0 - start0;
	console.log( `> Model initiated: ${time0.toFixed( 2 )} ms` );

	for ( let i = 1; i <= count; i++ ) {
		let time = 0;
		let result = false;
		let t = 0;

		while ( !result ) {
			const start = performance.now();
			result = instance.run( random );
			const end = performance.now();
			time = time + end - start;
			t++;
		}

		if ( t === 1 ) {
			console.log( `> Run #${i}: ${time.toFixed( 2 )} ms` );
		} else {
			console.log( `> Run #${i} (${t} attempts): ${time.toFixed( 2 )} ms` );
		}

		const buffer = e.data.generateData;
		const messageObject = {
			type: 'data',
			id: i,
			time: time,
			buffer: result
				? instance.graphics( new Uint8Array( buffer ) ).buffer
				: buffer,
		};

		worker.postMessage( messageObject );
	}
}