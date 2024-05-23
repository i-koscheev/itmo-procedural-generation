/// <reference lib="webworker" />
declare const self: DedicatedWorkerGlobalScope;

import { lcg } from '../../random/lcg';
import { generatePatterns } from '../../wfc/generate-patterns';
import { PredefinedModel } from '../../wfc/predefined-model';
import type { Symmetry } from '../../wfc/wfc.types';

import type { Polygon } from './polygon';

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
	const w = 2 * Math.round( xmax - xmin );
	const h = 2 * Math.round( ymax - ymin );

	const makeRoads = () => {
		const predefined: number[] = [
			// левый верхний
			0, 0, 0,
			0, 1, 0,
			1, 0, 0,
			1, 1, 81,
			// правый верхний
			w-3, 0, 0,
			w-3, 1, 0,
			w-4, 0, 0,
			w-4, 1, 80,
			// левый нижний
			0, h-3, 0,
			0, h-4, 0,
			1, h-3, 0,
			1, h-4, 82,
			// правый нижний
			w-3, h-3, 0,
			w-3, h-4, 0,
			w-4, h-3, 0,
			w-4, h-4, 83,
		];
		const wl = w / 3;
		const hl = h / 3;
		for ( let x = 4; x < w-6; x++ ) {
			if ( x < wl || x > w - wl ) {
				predefined.push(
					x, 0, 87,
					x, h-3, 84,
				);
			} else {
				predefined.push(
					x, -1, 0,
					x, h-2, 0,
				);
			}
		}
		for ( let y = 4; y < h-6; y++ ) {
			if ( y < hl || y > h - hl ) {
				predefined.push(
					0, y, 86,
					w-3, y, 85,
				);
			} else {
				predefined.push(
					-1, y, 0,
					w-2, y, 0,
				);
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
		makeRoads,
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
		points: instance.points( 0.5, xmin, ymin, [2,3,4] )
	};

	self.postMessage( messageObject, [messageObject.buffer] );
};
