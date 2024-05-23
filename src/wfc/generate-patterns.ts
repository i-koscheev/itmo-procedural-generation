import type { NumberCortege as Color, Pattern, Symmetry } from './wfc.types';

/**
 * @param {Uint8Array | Uint8ClampedArray} data The RGBA data of the source image
 * @param {int} dataWidth The width of the source image
 * @param {int} dataHeight The height of the source image
 * @param {int} N Size of the patterns
 * @param {boolean} periodic Whether the source image is to be considered as periodic / as a repeatable texture
 * @param {int} symmetry Allowed symmetries from 1 (no symmetry) to 8 (all mirrored / rotated variations)
 */
export function generatePatterns(
	data: Uint8Array | Uint8ClampedArray,
	dataWidth: number,
	dataHeight: number,
	N: number,
	periodic: boolean,
	symmetry: Symmetry,
) {
	const sample: number[][] = new Array( dataWidth );
	for ( let i = 0; i < dataWidth; i++ ) {
		sample[i] = new Array( dataHeight );
	}

	const colors: Color[] = [];
	const colorMap: { [key: string]: number} = {};
		
	for ( let y = 0; y < dataHeight; y++ ) {
		for ( let x = 0; x < dataWidth; x++ ) {
			const indexPixel = ( y * dataWidth + x ) * 4;
			const color: Color = [data[indexPixel], data[indexPixel + 1], data[indexPixel + 2], data[indexPixel + 3]];
			const colorMapKey = color.join( '-' );
	
			if ( !Object.prototype.hasOwnProperty.call( colorMap, colorMapKey ) ) {
				colorMap[colorMapKey] = colors.length;
				colors.push( color );
			}
	
			sample[x][y] = colorMap[colorMapKey];
		}
	}
		
	const C = colors.length;
	const W = Math.pow( C, N * N );
		
	const pattern = function pattern( f: ( x: number, y: number ) => number ) {
		const result: Pattern = new Array( N * N );
		for ( let y = 0; y < N; y++ ) {
			for ( let x = 0; x < N; x++ ) {
				result[x + y * N] = f( x, y );
			}
		}
		return result;
	};
		
	const patternFromSample = function patternFromSample( x: number, y: number ) {
		return pattern( function ( dx, dy ) {
			return sample[( x + dx ) % dataWidth][( y + dy ) % dataHeight];
		} );
	};
		
	const rotate = function rotate( p: Pattern ) {
		return pattern( function ( x, y ) {
			return p[N - 1 - y + x * N];
		} );
	};
	
	const reflect = function reflect( p: Pattern ) {
		return pattern( function ( x, y ) {
			return p[N - 1 - x + y * N];
		} );
	};
		
	const index = function index( p: Pattern ) {
		let result = 0;
		let power = 1;
	
		for ( let i = 0; i < p.length; i++ ) {
			result += p[p.length - 1 - i] * power;
			power *= C;
		}
	
		return result;
	};
		
	const patternFromIndex = function patternFromIndex ( ind: number ) {
		let residue = ind;
		let power = W;
		const result: Pattern = new Array( N * N );
		
		for ( let i = 0; i < result.length; i++ ) {
			power /= C;
			let count = 0;
		
			while ( residue >= power ) {
				residue -= power;
				count++;
			}
		
			result[i] = count;
		}
		
		return result;
	};
		
	const weightsObject: { [key: number]: number} = {};
	const weightsKeys: number[] = []; // Object.keys won't preserve the order of creation, so we store them separately in an array
		
	const ymax = periodic ? dataHeight : dataHeight - N + 1;
	const xmax = periodic ? dataWidth : dataWidth - N + 1;
	for ( let y = 0; y < ymax; y++ ) {
		for ( let x = 0; x < xmax; x++ ) {
			const ps: Pattern[] = new Array( 8 );
			ps[0] = patternFromSample( x, y );
			ps[1] = reflect( ps[0] );
			ps[2] = rotate( ps[0] );
			ps[3] = reflect( ps[2] );
			ps[4] = rotate( ps[2] );
			ps[5] = reflect( ps[4] );
			ps[6] = rotate( ps[4] );
			ps[7] = reflect( ps[6] );
		
			for ( let k = 0; k < symmetry; k++ ) {
				const ind = index( ps[k] );
			
				if ( weightsObject[ind] ) {
					weightsObject[ind]++;
				} else {
					weightsKeys.push( ind );
					weightsObject[ind] = 1;
				}
			}
		}
	}
		
	const T = weightsKeys.length;
	const patterns: Pattern[] = new Array( T );
	let weights = new Uint16Array( T );
		
	for ( let i = 0; i < T; i++ ) {
		const w = weightsKeys[i];
		patterns[i] = patternFromIndex( w );
		weights[i] = weightsObject[w];
	}

	const nod = findNod( weights );
	if ( nod !== 1 ){
		weights = weights.map( ( w ) => w /= nod );
	}
	
	return {
		colors,
		patterns,
		weights
	};
}

/** Наибольший общий делитель */
function nod( a: number, b: number ) { 
	if ( a == 0 ) {
		return b;
	}
	return nod( b % a, a ); 
}

function findNod( array: number[] | Uint16Array ) {
	let result = array[0];
	for ( let i = 1; i < array.length; i++ ) {
		result = nod( array[i], result );
		if ( result == 1 ) {
			return 1;
		}
	}
	return result;
}
