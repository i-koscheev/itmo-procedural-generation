import { Model } from './model';
import type { NumberCortege as Color, Pattern } from './wfc.types';

export class PredefinedModel extends Model {

	constructor(
		private patterns: Pattern[],
		weights: Uint16Array,
		N: number,
		width: number,
		height: number,
		periodic: boolean,
		/** `[...x, y, tile...]` */
		private predefined: () => number[]
	) {
		super( width, height, N, periodic );
		this.weights = weights;
		this.T = weights.length;

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

	override clear() {
		super.clear();
		const array = this.predefined();
		for( let i = 0; i < array.length; i+=3 ) {
			const tile = array[i + 2];
			for ( let t = 0; t < this.T; t++ ) {
				if ( t !== tile ) {
					this.ban( array[i] + array[i + 1] * this.MX, t );
				}
			}
		}
		this.propagate();
	}

	public points( coef = 1, x0 = 0, y0 = 0, colorCodes: number[] ) {
		const result: number[] = [];
		if ( this.observed[0] >= 0 ) {
			for ( let y = 0; y < this.MY; y++ ) {
				const dy = y < this.MY - this.N + 1 ? 0 : this.N - 1;
				for ( let x = 0; x < this.MX; x++ ) {
					const dx = x < this.MX - this.N + 1 ? 0 : this.N - 1;
					const code = this.patterns[this.observed[x - dx + ( y - dy ) * this.MX]][dx + dy * this.N];
					if ( colorCodes.includes( code ) ) {
						result.push( x0 + x*coef, y0 + y*coef, code );
					}
				}
			}
		}
		return result;
	}

	public graphics(
		colors: Color[],
		output: Uint8Array | Uint8ClampedArray,
	) {
		if ( this.observed[0] >= 0 ) {
			for ( let y = 0; y < this.MY; y++ ) {
				const dy = y < this.MY - this.N + 1 ? 0 : this.N - 1;
				for ( let x = 0; x < this.MX; x++ ) {
					const dx = x < this.MX - this.N + 1 ? 0 : this.N - 1;
			
					const pixelIndex = ( y * this.MX + x ) * 4;
					const color = colors[this.patterns[this.observed[x - dx + ( y - dy ) * this.MX]][dx + dy * this.N]];
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

								const color = colors[this.patterns[t][dx + dy * this.N]];

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