/// <reference lib="webworker" />
declare const self: DedicatedWorkerGlobalScope;

import { lcg } from '../../../random/lcg';
import { generatePatterns } from '../../../wfc/generate-patterns';
import { PredefinedModel } from '../../../wfc/predefined-model';
import type { Symmetry } from '../../../wfc/wfc.types';

self.onmessage = function( e ) {
	console.log( '> Web Worker initiated' );

	const random = lcg( e.data.seed );
	console.log( `> Random seed: ${e.data.seed}` );

	const { colors, patterns, weights } = generatePatterns(
		new Uint8Array( e.data.sampleData ),
		e.data.sampleWidth,
		e.data.sampleHeight,
		e.data.n,
		e.data.periodicInput,
		e.data.symmetry as Symmetry,
	);
	console.log( `> Generate Patterns: ${colors.length} colors, ${patterns.length} patterns` );

	const w = e.data.width;
	const h = e.data.height;

	const clearPerimeter = () => {
		const predefined: number[] = [];
		const tile = 0; // пустой паттерн
		for ( let x = 1; x < w-1; x++ ) {
			predefined.push(
				x, 1, tile,
				x, h-4, tile,
			);
		}
		for ( let y = 2; y < h-4; y++ ) {
			predefined.push(
				1, y, tile,
				w-4, y, tile,
			);
		}
		return predefined;
	};
	
	const instance = new PredefinedModel(
		patterns,
		weights,
		e.data.n,
		w,
		h,
		e.data.periodicOutput,
		clearPerimeter,
	);

	console.log( '> Predefined Model, clear perimeter' );

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
				? instance.graphics( colors, new Uint8Array( buffer ) ).buffer
				: buffer,
		};

		self.postMessage( messageObject );
	}
};
