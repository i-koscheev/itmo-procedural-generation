import { generatePatterns } from '../../../wfc/generate-patterns';
import type { NumberCortege as Color, Pattern, Symmetry } from '../../../wfc/wfc.types';
import { config } from '../common/config';

export class PatternsController {
	private _selected = 0;

	options = {
		n: 3,
		periodic: true,
		symmetry: config.symmetries[this._selected],
	};

	private _container: HTMLDivElement | null = null;
	private _sampleData: ImageData | null = null;

	private _colors: Color[] = [];
	private _patterns: Pattern[] = [];
	private _weights: Uint16Array | number[] = [];

	constructor() {
		this._load();
	}

	protected _initWorker() {}

	nextSample() {
		this._clear();
		this._load();
	}

	private _load() {
		const img = new Image();
		img.onload = () => {
			this._sample( img );
		};
		img.src = '/assets/' + config.filenames[this._selected];
		this.options.symmetry = config.symmetries[this._selected];
		this._selected = ( this._selected + 1 ) % config.filenames.length;
	}
	
	start() {
		this._clear();
		const result = generatePatterns(
			new Uint8Array( this._sampleData!.data.buffer ),
			this._sampleData!.width,
			this._sampleData!.height,
			this.options.n,
			this.options.periodic,
			this.options.symmetry as Symmetry,
		);
		this._colors = result.colors;
		this._drawColors();
		this._patterns = result.patterns;
		this._weights = result.weights;
		this._drawPatterns();
	}

	private _sample( img: ImageBitmap | HTMLImageElement ) {
		const canvas = document.getElementById( 'sample' ) as HTMLCanvasElement;
		const width = Math.min( 50, img.width );
		const height = Math.min( 50, img.height );
		canvas.width = width;
		canvas.height = height;
		canvas.style.width = width * 5 + 'px';
		canvas.style.height = height * 5 + 'px';
		canvas.style.imageRendering = 'pixelated';
		const context = canvas.getContext( '2d', {
			willReadFrequently: true,
		} );
		if ( !context ) {
			console.error( 'No 2d context' );
		} else {
			context.drawImage( img, 0, 0 );
			this._sampleData = context.getImageData( 0, 0, width, height );
		}
	}

	private _makeContainer( h: string, bottom?: HTMLElement ) {
		const header = document.createElement( 'h2' );
		header.append( h );
		const container = document.createElement( 'div' );
		container.classList.add( 'container' );
		const wrapper = document.createElement( 'div' );
		wrapper.classList.add( 'block' );
		wrapper.append( header, container );
		if ( bottom ) {
			wrapper.append( bottom );
		}
		this._container!.append( wrapper );
		return container;
	}

	private _drawColors() {
		const container = this._makeContainer(
			this._colors!.length + ' colors'
		);
		this._colors.forEach( ( color, index ) => {
			const data = new ImageData( new Uint8ClampedArray( color ), 1, 1 );
			const canvas = document.createElement( 'canvas' );
			canvas.id = 'color-' + index;
			canvas.width = 1;
			canvas.height = 1;
			canvas.style.width = '25px';
			canvas.style.height = '25px';
			canvas.style.imageRendering = 'pixelated';
			const context = canvas.getContext( '2d'  );
			if ( !context ) {
				console.error( 'No 2d context' );
			} else {
				context.putImageData( data, 0, 0 );
				const label = document.createElement( 'div' );
				label.append( index.toString() );
				const block = document.createElement( 'div' );
				block.classList.add( 'block' );
				block.append( label, canvas );
				container.append( block );
			}
		} );
	}

	private _drawPatterns() {
		const container = this._makeContainer(
			this._patterns!.length + ' patterns'
		);
		this._patterns.forEach( ( pattern, index ) => {
			const n = this.options.n;
			const output: number[] = [];
			pattern.forEach( ( c ) => {
				output.push( ...this._colors[c] );
			} );
			const data = new ImageData( new Uint8ClampedArray( output ), n, n );
			const canvas = document.createElement( 'canvas' );
			canvas.id = 'pattern-' + index;
			canvas.width = n;
			canvas.height = n;
			canvas.style.width = n * 25 + 'px';
			canvas.style.height = n * 25 + 'px';
			canvas.style.imageRendering = 'pixelated';
			const context = canvas.getContext( '2d'  );
			if ( !context ) {
				console.error( 'No 2d context' );
			} else {
				context.putImageData( data, 0, 0 );
				const label = document.createElement( 'div' );
				label.append( `[${index}]` );
				const block = document.createElement( 'div' );
				block.classList.add( 'block' );
				const weight = document.createElement( 'div' );
				weight.append( `x${this._weights[index]}` );
				weight.classList.add( 'gray' );
				block.append( label, canvas, weight );
				container.append( block );
			}
		} );
	}

	private _clear() {
		console.clear();
		this._colors = [];
		this._patterns = [];
		this._weights = [];
		this._container = document.getElementById( 'container' ) as HTMLDivElement;
		this._container!.replaceChildren();
	}
}