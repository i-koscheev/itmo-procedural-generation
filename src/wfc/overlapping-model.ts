import { Model } from './model';
import type { NumberCortege as Color, Pattern, Symmetry } from './wfc.types';

export class OverlappingModel extends Model {
	readonly colors: Color[];
	readonly patterns: Pattern[];

	/**
	 * @param {Uint8Array | Uint8ClampedArray} data The RGBA data of the source image
	 * @param {int} dataWidth The width of the source image
	 * @param {int} dataHeight The height of the source image
	 * @param {int} N Size of the patterns
	 * @param {int} width The width of the generation
	 * @param {int} height The height of the generation
	 * @param {boolean} periodicInput Whether the source image is to be considered as periodic / as a repeatable texture
	 * @param {boolean} periodicOutput Whether the generation should be periodic / a repeatable texture
	 * @param {int} symmetry Allowed symmetries from 1 (no symmetry) to 8 (all mirrored / rotated variations)
	 */
	constructor(
		data: Uint8Array | Uint8ClampedArray,
		dataWidth: number,
		dataHeight: number,
		N: number,
		width: number,
		height: number,
		periodicInput: boolean,
		periodicOutput: boolean,
		symmetry: Symmetry,
	) {
		super( width, height, N, periodicOutput );

		const sample: number[][] = new Array( dataWidth );
		for ( let i = 0; i < dataWidth; i++ ) {
			sample[i] = new Array( dataHeight );
		}

		this.colors = [];
		const colorMap: { [key: string]: number} = {};
		
		for ( let y = 0; y < dataHeight; y++ ) {
			for ( let x = 0; x < dataWidth; x++ ) {
				const indexPixel = ( y * dataWidth + x ) * 4;
				const color: Color = [data[indexPixel], data[indexPixel + 1], data[indexPixel + 2], data[indexPixel + 3]];
				const colorMapKey = color.join( '-' );
		
				if ( !Object.prototype.hasOwnProperty.call( colorMap, colorMapKey ) ) {
					colorMap[colorMapKey] = this.colors.length;
					this.colors.push( color );
				}
		
				sample[x][y] = colorMap[colorMapKey];
			}
		}
		
		const C = this.colors.length;
		const W = Math.pow( C, N * N );
		
		const pattern = function pattern ( f: ( x: number, y: number ) => number ) {
			const result: Pattern = new Array( N * N );
			for ( let y = 0; y < N; y++ ) {
				for ( let x = 0; x < N; x++ ) {
					result[x + y * N] = f( x, y );
				}
			}
			return result;
		};
		
		const patternFromSample = function patternFromSample ( x: number, y: number ) {
			return pattern( function ( dx, dy ) {
				return sample[( x + dx ) % dataWidth][( y + dy ) % dataHeight];
			} );
		};
		
		const rotate = function rotate ( p: Pattern ) {
			return pattern( function ( x, y ) {
				return p[N - 1 - y + x * N];
			} );
		};
		
		const reflect = function reflect ( p: Pattern ) {
			return pattern( function ( x, y ) {
				return p[N - 1 - x + y * N];
			} );
		};
		
		const index = function index ( p: Pattern ) {
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
		
		const ymax = periodicInput ? dataHeight : dataHeight - N + 1;
		const xmax = periodicInput ? dataWidth : dataWidth - N + 1;
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
		
		this.T = weightsKeys.length;
		this.patterns = new Array( this.T );
		this.weights = new Uint16Array( this.T );
		
		for ( let i = 0; i < this.T; i++ ) {
			const w = weightsKeys[i];
			this.patterns[i] = patternFromIndex( w );
			this.weights[i] = weightsObject[w];
		}
		
		const agrees = function agrees ( p1: Pattern, p2: Pattern, dx: number, dy: number ) {
			const xmin = dx < 0 ? 0 : dx;
			const xmax = dx < 0 ? dx + N : N;
			const ymin = dy < 0 ? 0 : dy;
			const ymax = dy < 0 ? dy + N : N;
		
			for ( let y = ymin; y < ymax; y++ ) {
				for ( let x = xmin; x < xmax; x++ ) {
					if ( p1[x + N * y] !== p2[x - dx + N * ( y - dy )] ) {
						return false;
					}
				}
			}
		
			return true;
		};
		
		this.propagator = new Array( 4 );
		
		for ( let d = 0; d < 4; d++ ) {
			this.propagator[d] = new Array( this.T );
			for ( let t = 0; t < this.T; t++ ) {
				const list = [];
			
				for ( let t2 = 0; t2 < this.T; t2++ ) {
					if ( agrees( this.patterns[t], this.patterns[t2], Model.dx[d], Model.dy[d] ) ) {
						list.push( t2 );
					}
				}
		
				this.propagator[d][t] = list;
			}
		}
	}

	public graphics( output: Uint8Array | Uint8ClampedArray ) {

		if ( this.observed[0] >= 0 ) {
			for ( let y = 0; y < this.MY; y++ ) {
				const dy = y < this.MY - this.N + 1 ? 0 : this.N - 1;
				for ( let x = 0; x < this.MX; x++ ) {
					const dx = x < this.MX - this.N + 1 ? 0 : this.N - 1;
			
					const pixelIndex = ( y * this.MX + x ) * 4;
					const color = this.colors[this.patterns[this.observed[x - dx + ( y - dy ) * this.MX]][dx + dy * this.N]];
					output[pixelIndex] = color[0];
					output[pixelIndex + 1] = color[1];
					output[pixelIndex + 2] = color[2];
					output[pixelIndex + 3] = color[3];
				}
			}
		} else {
			for ( let i = 0; i < this.count; i++ ) {
				const x = i % this.MX;
				const y = i / this.MX | 0;

				let contributors = 0;
				let r = 0;
				let g = 0;
				let b = 0;
				let a = 0;

				for ( let dy = 0; dy < this.N; dy++ ) {
					for ( let dx = 0; dx < this.N; dx++ ) {
						let sx = x - dx;
						if ( sx < 0 ) {sx += this.MX;}

						let sy = y - dy;
						if ( sy < 0 ) {sy += this.MY;}

						if ( !this.periodic && (
							sx < 0 || sy < 0 ||
							( sx + this.N > this.MX ) || ( sy + this.N > this.MY )
						) ) {
							continue;
						}

						const s = sx + sy * this.MX;

						for ( let t = 0; t < this.T; t++ ) {
							if ( this.wave[s * this.T + t] ) {
								contributors++;

								const color = this.colors[this.patterns[t][dx + dy * this.N]];

								r += color[0];
								g += color[1];
								b += color[2];
								a += color[3];
							}
						}
					}
				}

				const pixelIndex = i * 4;

				output[pixelIndex] = r / contributors;
				output[pixelIndex + 1] = g / contributors;
				output[pixelIndex + 2] = b / contributors;
				output[pixelIndex + 3] = a / contributors;
			}
		}
	
		return output;
	}
}