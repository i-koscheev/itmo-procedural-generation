/// <reference lib="webworker" />
declare const self: DedicatedWorkerGlobalScope;

import { lcg } from '../../random/lcg';
import { generatePatterns } from '../../wfc/generate-patterns';
import { PredefinedModel } from '../../wfc/predefined-model';
import type { Symmetry } from '../../wfc/wfc.types';

import type { Polygon } from './polygon';


function inside( x: number, y: number, vs: Polygon ) {
	// ray-casting algorithm based on
	// https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
	let inside = false;
	for ( let i = 0, j = vs.length - 1; i < vs.length; j = i++ ) {
		const xi = vs[i][0], yi = vs[i][1];
		const xj = vs[j][0], yj = vs[j][1];
		const intersect = ( ( yi > y ) != ( yj > y ) )
			&& ( x < ( xj - xi ) * ( y - yi ) / ( yj - yi ) + xi );
		if ( intersect ) {
			inside = !inside;
		}
	}
	return inside;
}

self.onmessage = function( e ) {
	const random = lcg( e.data.seed );

	const { colors, patterns, weights } = generatePatterns(
		new Uint8Array( e.data.sampleData ),
		e.data.sampleWidth,
		e.data.sampleHeight,
		e.data.n,
		e.data.periodicInput,
		e.data.symmetry as Symmetry,
	);
	
	const poly = e.data.polygon as Polygon;
	let xmin = poly[0][0], xmax = poly[0][0];
	let ymin = poly[0][1], ymax = poly[0][1];
	poly.forEach( ( pt ) => {
		if ( pt[0] < xmin ) {
			xmin = pt[0];
		} else if ( pt[0] > xmax ) {
			xmax = pt[0];
		}
		if ( pt[1] < ymin ) {
			ymin = pt[1];
		} else if ( pt[1] > ymax ) {
			ymax = pt[1];
		}
	} );
	const w = 2 * Math.round( 1 + xmax - xmin );
	const h = 2 * Math.round( 1 + ymax - ymin );

	const clearOutsidePoints = () => {
		const predefined: number[] = [];
		const tile = 0; // пустой паттерн
		for ( let x = 1; x < w-1; x++ ) {
			for ( let y = 1; y < h-1; y++ ) {
				if ( !inside( xmin + x / 2, ymin + y / 2, poly ) ) {
					predefined.push( x, y, tile );
				}
			}
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
		clearOutsidePoints,
	);

	instance.init();

	let result = false;

	while ( !result ) {
		result = instance.run( random );
	}

	const buffer = new ImageData( w, h ).data.buffer;
	const messageObject = {
		type: 'data',
		width: w,
		height: h,
		buffer: result
			? instance.graphics( colors, new Uint8Array( buffer ) ).buffer
			: buffer,
		points: instance.points( 0.5, xmin, ymin, [2,4] )
	};

	self.postMessage( messageObject, [messageObject.buffer] );
};
