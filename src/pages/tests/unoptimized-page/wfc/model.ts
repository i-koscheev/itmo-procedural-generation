// Algorithm by Maxim Gumin, 2016
// JavaScript port by Kevin Chapelier, 2016

import { randomIndex as randomIndexFromBuffer } from '../../../../wfc/helpers';
import type { NumberCortege } from '../../../../wfc/wfc.types';
const randomIndex = randomIndexFromBuffer as unknown as ( a: number[], r: number ) => number;

export class OriginalModel {
	protected MX: number;
	protected MY: number;
	protected N: number;
	protected T: number = 0;
	protected periodic: boolean;

	protected wave!: boolean[][];

	protected propagator!: number[][][];
	protected compatible!: NumberCortege[][];
	protected observed!: number[];

	private stack!: [number, number][];
	private stackSize: number = 0;

	protected weights!: number[];
	private weightLogWeights!: number[];
	private distribution!: number[];

	private sumOfWeights: number = 0;
	private sumOfWeightLogWeights: number = 0;
	private startingEntropy: number = 0;
	protected sumsOfOnes!: number[];
	protected sumsOfWeights!: number[];
	protected sumsOfWeightLogWeights!: number[];
	protected entropies!: number[];

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
		this.N = N;
		this.periodic = periodic;
	}

	public init() {
		const length =  this.MX * this.MY;
		this.wave = new Array( length );
		this.compatible = new Array( length );
	
		for ( let i = 0; i < length; i++ ) {
			this.wave[i] = new Array( this.T );
			this.compatible[i] = new Array( this.T );
	
			for ( let t = 0; t < this.T; t++ ) {
				this.compatible[i][t] = [0,0,0,0];
			}
		}
		this.distribution = new Array( this.T );
		this.observed = new Array( length );

		this.weightLogWeights = new Array( this.T );
		this.sumOfWeights = 0;
		this.sumOfWeightLogWeights = 0;
	
		for ( let t = 0; t < this.T; t++ ) {
			this.weightLogWeights[t] = this.weights[t] * Math.log( this.weights[t] );
			this.sumOfWeights += this.weights[t];
			this.sumOfWeightLogWeights += this.weightLogWeights[t];
		}
	
		this.startingEntropy = Math.log( this.sumOfWeights ) - this.sumOfWeightLogWeights / this.sumOfWeights;
	
		this.sumsOfOnes = new Array( length );
		this.sumsOfWeights = new Array( length );
		this.sumsOfWeightLogWeights = new Array( length );
		this.entropies = new Array( length );
	
		this.stack = new Array( length * this.T );
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
				for ( let i = 0; i < this.wave.length; i++ ) {
					for ( let t = 0; t < this.T; t++ ) {
						if ( this.wave[i][t] ) {
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
	
		for ( let i = 0; i < this.wave.length; i++ ) {
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

	private clear() {
		for ( let i = 0; i < this.wave!.length; i++ ) {
			for ( let t = 0; t < this.T; t++ ) {
				this.wave![i][t] = true;
	
				for ( let d = 0; d < 4; d++ ) {
					this.compatible![i][t][d] = this.propagator![OriginalModel.opposite[d]][t].length;
				}
			}
	
			this.sumsOfOnes![i] = this.weights!.length;
			this.sumsOfWeights![i] = this.sumOfWeights;
			this.sumsOfWeightLogWeights![i] = this.sumOfWeightLogWeights;
			this.entropies![i] = this.startingEntropy;
			this.observed![i] = -1;
		}
	}

	private observe( node: number, random: () => number )
	{
		const w = this.wave[ node ];

		for ( let t = 0; t < this.T; t++ ) {
			this.distribution[t] = w[t] ? this.weights[t] : 0;
		}

		const r = randomIndex( this.distribution, random() );
	
		for ( let t = 0; t < this.T; t++ ) {
			if ( w[t] !== ( t === r ) ) {
				this.ban( node, t );
			}
		}
	}

	private propagate() {
		while ( this.stackSize > 0 ) {
			const [i1, t1] = this.stack[this.stackSize - 1];
			this.stackSize--;
	
			const x1 = i1 % this.MX;
			const y1 = i1 / this.MX | 0;
	
			for ( let d = 0; d < 4; d++ ) {
				let x2 = x1 + OriginalModel.dx[d];
				let y2 = y1 + OriginalModel.dy[d];
	
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
				const compat = this.compatible[i2];
	
				for ( let l = 0; l < p.length; l++ ) {
					const t2 = p[l];
					const comp = compat[t2];

					comp[d]--;
					if ( comp[d] == 0 ) {
						this.ban( i2, t2 );
					}
				}
			}
		}
		return this.sumsOfOnes[0] > 0;
	}

	private ban( i: number, t: number ) {
		this.wave[i][t] = false;

		const comp = this.compatible[i][t];
		for ( let d = 0; d < 4; d++ ) {
			comp[d] = 0;
		}
		this.stack[this.stackSize] = [i, t];
		this.stackSize++;
	
		this.sumsOfOnes[i] -= 1;
		this.sumsOfWeights[i] -= this.weights[t];
		this.sumsOfWeightLogWeights[i] -= this.weightLogWeights[t];
	
		const sum = this.sumsOfWeights[i];
		this.entropies[i] = Math.log( sum ) - this.sumsOfWeightLogWeights[i] / sum;
	}
}