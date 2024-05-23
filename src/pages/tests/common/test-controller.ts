import { config } from './config';

/** Базовый класс */
export class TestController {
	protected _worker: Worker | null = null;

	protected _selected = 0;
	protected _options = {
		n: 3,
		periodicInput: true,
		periodicOutput: true,
		width: 192,
		height: 96,
		symmetry: config.symmetries[this._selected],
	};

	protected _count = 1;

	private _container: HTMLDivElement | null = null;
	private _sampleData: ImageData | null = null;
	private _generateData: ImageData | null = null;

	private _seed = 10042;

	private _times: number[] = [];

	constructor() {
		this._load();
	}

	protected _initWorker() {}

	get options() {
		return {
			...this._options,
			count: this._count,
		};
	}

	nextSample() {
		this._clear();
		this._load();
	}

	protected _load() {
		const img = new Image();
		img.onload = () => {
			this._sample( img );
		};
		img.src = '/assets/' + config.filenames[this._selected];
		this._options.symmetry = config.symmetries[this._selected];
		this._selected = ( this._selected + 1 ) % config.filenames.length;
	}

	private _terminateWorker() {
		if ( this._worker !== null ) {
			this._worker.terminate();
			this._worker = null;
		}
	}
	
	start() {
		this._clear();
		console.log( '> Start' );
		this._makeData();
		this._initWorker();
		this._worker!.onmessage = ( event ) => {
			this._receive( event.data.buffer, event.data.id );
			this._times.push( event.data.time );
			if ( this._times.length === this._count ) {
				this._terminateWorker();
				console.log( '> End' );
				this._stats();
			}
		};
		this._run();
	}

	private _run() {
		const message = {
			generateData: this._generateData!.data.buffer,
			sampleData: this._sampleData!.data.buffer,
			sampleWidth: this._sampleData!.width,
			sampleHeight: this._sampleData!.height,
			n: this._options.n,
			width: this._options.width,
			height: this._options.height,
			periodicInput: this._options.periodicInput,
			periodicOutput: this._options.periodicOutput,
			symmetry: this._options.symmetry,
			seed: this._seed,
			count: this._count,
		};
		this._worker!.postMessage( message, [message.generateData] );
	} 

	protected _sample( img: ImageBitmap | HTMLImageElement ) {
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

	private _makeData() {
		this._generateData = new ImageData( this._options.width, this._options.height );
	}

	private _receive( buffer: ArrayBufferLike, id: number ) {
		this._generateData = new ImageData(
			new Uint8ClampedArray( buffer ),
			this._options.width,
			this._options.height
		);
		const canvas = document.createElement( 'canvas' );
		canvas.id = 'result-' + id;
		canvas.width = this._options.width;
		canvas.height = this._options.height;
		canvas.style.width = this._options.width * 5 + 'px';
		canvas.style.height = this._options.height * 5 + 'px';
		canvas.style.imageRendering = 'pixelated';
		const context = canvas.getContext( '2d'  );
		if ( !context ) {
			console.error( 'No 2d context' );
		} else {
			context.putImageData( this._generateData, 0, 0 );
			const label = document.createElement( 'div' );
			label.append( '#' + id );
			const block = document.createElement( 'div' );
			block.classList.add( 'block' );
			block.append( label, canvas );
			this._container!.append( block );
		}
	}

	private _stats() {
		if ( this._times.length > 1 ) {
			const sorted = [...this._times].sort( ( a, b ) => a - b );
			const mid = Math.floor( sorted.length / 2 );
			const median = sorted.length % 2 ? sorted[mid] : ( ( sorted[mid - 1] + sorted[mid] ) / 2 );

			const sum = this._times.reduce( ( acc, v ) => acc + v, 0 );
			const average = sum / this._times.length;

			console.log( `> Median: ${median.toFixed( 2 )} ms` );
			console.log( `> Average: ${average.toFixed( 2 )} ms` );
		}
	}

	private _clear() {
		console.clear();
		this._terminateWorker();
		this._generateData = null;
		this._times = [];
		this._container = document.getElementById( 'container' ) as HTMLDivElement;
		this._container!.replaceChildren();
	}
}