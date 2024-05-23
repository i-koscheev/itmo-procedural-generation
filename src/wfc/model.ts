// Algorithm by Maxim Gumin, 2016
// Based on JavaScript port by Kevin Chapelier, 2016

import { randomIndex } from './helpers';
import type { NumberCortege } from './wfc.types';

export class Model {
	protected MX: number;
	protected MY: number;
	protected N: number;
	protected T: number = 0;
	protected periodic: boolean;

	protected count: number;

	protected wave!: Uint8Array;

	protected propagator!: number[][][];
	
	protected compatible!: Uint16Array;
	protected observed!: Int32Array;

	private stack!: Uint32Array;
	private stackSize: number = 0;

	protected weights!: Uint16Array;
	private weightLogWeights!: Float32Array;
	private distribution!: Uint16Array;

	private sumOfWeights: number = 0;
	private sumOfWeightLogWeights: number = 0;
	private startingEntropy: number = 0;
	protected sumsOfOnes!: Int16Array;
	protected sumsOfWeights!: Float64Array;
	protected sumsOfWeightLogWeights!: Float64Array;
	protected entropies!: Float64Array;

	protected static readonly dx: NumberCortege = [-1, 0, 1, 0];
	protected static readonly dy: NumberCortege = [0, 1, 0, -1];
	private static readonly opposite: NumberCortege = [2, 3, 0, 1];

	constructor (
		width: number,
		height: number,
		N: number,
		periodic: boolean,
	) {
		this.MX = width;
		this.MY = height;
		this.count = width * height;
		this.N = N;
		this.periodic = periodic;
	}

	public init() {
		this.wave = new Uint8Array( this.count * this.T );
		this.compatible = new Uint16Array( this.count * this.T * 4 );
		this.distribution = new Uint16Array( this.T );
		this.observed = new Int32Array( this.count );

		this.weightLogWeights = new Float32Array( this.T );
		this.sumOfWeights = 0;
		this.sumOfWeightLogWeights = 0;
	
		for ( let t = 0; t < this.T; t++ ) {
			this.weightLogWeights[t] = this.weights[t] * Math.log( this.weights[t] );
			this.sumOfWeights += this.weights[t];
			this.sumOfWeightLogWeights += this.weightLogWeights[t];
		}
	
		this.startingEntropy = Math.log( this.sumOfWeights ) - this.sumOfWeightLogWeights / this.sumOfWeights;
	
		this.sumsOfOnes = new Int16Array( this.count );
		this.sumsOfWeights = new Float64Array( this.count );
		this.sumsOfWeightLogWeights = new Float64Array( this.count );
		this.entropies = new Float64Array( this.count );
	
		this.stack = new Uint32Array( this.count * this.T * 2 );
		this.stackSize = 0;
	}

	public run( random = Math.random, limit = -1 ) {
		if ( this.wave === undefined ) {
			this.init();
		}
		this.clear();

		for ( let l = 0; l < limit || limit < 0; l++ )
		{
			const node = this.nextUnobservedNode( random );
			if ( node >= 0 ) {
				this.observe( node, random );
				const success = this.propagate();
				if ( !success ) {
					return false;
				}
			} else {
				for ( let i = 0; i < this.count; i++ ) {
					for ( let t = 0; t < this.T; t++ ) {
						if ( this.wave[i * this.T + t] ) {
							this.observed[i] = t;
							break;
						}
					}
				}
				return true;
			}
		}

		return true;
	}

	private nextUnobservedNode( random: () => number ) {
		let min = 1000;
		let argmin = -1;
	
		for ( let i = 0; i < this.count; i++ ) {
			if ( !this.periodic && (
				i % this.MX + this.N > this.MX ||
				( ( i / this.MX | 0 ) + this.N ) > this.MY
			) ) {
				continue;
			}
	
			const remainingValues = this.sumsOfOnes![i];
			const entropy = this.entropies![i];
	
			if ( remainingValues > 1 && entropy <= min ) {
				const noise = 0.000001 * random();
				if ( entropy + noise < min ) {
					min = entropy + noise;
					argmin = i;
				}
			}
		}
		return argmin;
	}

	protected clear() {
		for ( let i = 0; i < this.count; i++ ) {
			for ( let t = 0; t < this.T; t++ ) {
				this.wave[i * this.T + t] = 1;
	
				for ( let d = 0; d < 4; d++ ) {
					this.compatible[( i * this.T + t ) * 4 + d] = this.propagator[Model.opposite[d]][t].length;
				}
			}
	
			this.sumsOfOnes[i] = this.weights.length;
			this.sumsOfWeights[i] = this.sumOfWeights;
			this.sumsOfWeightLogWeights[i] = this.sumOfWeightLogWeights;
			this.entropies[i] = this.startingEntropy;
			this.observed[i] = -1;
		}
	}

	private observe( node: number, random: () => number )
	{
		const begin = node * this.T;
		const w = this.wave.subarray( begin, begin + this.T  );

		for ( let t = 0; t < this.T; t++ ) {
			this.distribution[t] = w[t] ? this.weights[t] : 0;
		}

		const r = randomIndex( this.distribution, random() );
	
		for ( let t = 0; t < this.T; t++ ) {
			if ( ( w[t] === 1 ) !== ( t === r ) ) {
				this.ban( node, t );
			}
		}
	}

	protected propagate() {
		while ( this.stackSize > 0 ) {
			const i1 = this.stack[this.stackSize - 2];
			const t1 = this.stack[this.stackSize - 1];
			this.stackSize -= 2;
	
			const x1 = i1 % this.MX;
			const y1 = i1 / this.MX | 0;
	
			for ( let d = 0; d < 4; d++ ) {
				let x2 = x1 + Model.dx[d];
				let y2 = y1 + Model.dy[d];
	
				if ( !this.periodic && (
					x2 < 0 || y2 < 0 ||
					x2 + this.N > this.MX || y2 + this.N > this.MY
				) ) {
					continue;
				}
	
				if ( x2 < 0 ) {
					x2 += this.MX;
				} else if ( x2 >= this.MX ) {
					x2 -= this.MX;
				}
				if ( y2 < 0 ) {
					y2 += this.MY;
				} else if ( y2 >= this.MY ) {
					y2 -= this.MY;
				}
	
				const i2 = x2 + y2 * this.MX;
				const p = this.propagator[d][t1];

				const begin = i2 * this.T * 4;
				const compat = this.compatible.subarray( begin, begin + this.T * 4 );
	
				for ( let l = 0; l < p.length; l++ ) {
					const t2 = p[l];
					const c = --compat[t2 * 4 + d];
					if ( c === 0 ) {
						this.ban( i2, t2 );
					}
				}
			}
		}
		return this.sumsOfOnes[0] > 0;
	}

	protected ban( i: number, t: number ) {
		this.wave[i * this.T + t] = 0;

		const pre = ( i * this.T + t ) * 4;
		for ( let d = 0; d < 4; d++ ) {
			this.compatible[ pre + d ] = 0;
		}

		this.stack[this.stackSize] = i;
		this.stack[this.stackSize + 1] = t;
		this.stackSize += 2;
	
		this.sumsOfOnes[i] -= 1;
		this.sumsOfWeights[i] -= this.weights[t];
		this.sumsOfWeightLogWeights[i] -= this.weightLogWeights[t];
	
		const sum = this.sumsOfWeights[i];
		this.entropies[i] = Math.log( sum ) - this.sumsOfWeightLogWeights[i] / sum;
	}
}
