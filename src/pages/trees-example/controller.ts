import { polygonExample } from './polygon';
import Worker from './worker?worker';

export class Controller {

	private _worker: Worker | null = null;

	private _sampleData: ImageData | null = null;

	private _seed = 42;

	constructor(
		private onPoints: ( pts: number[] ) => void
	) {
		this._load();
	}

	private _load() {
		const img = new Image();
		img.onload = () => {
			this._sample( img );
		};
		img.src = '/assets/trees.bmp';
	}

	private _start() {
		this.clear();
		this._worker = new Worker();
		this._worker.onmessage = ( event ) => {
			this._receive( event.data );
			if ( this._worker !== null ) {
				this._worker.terminate();
				this._worker = null;
			}
		};
		this._run();
	}

	private _run() {
		const message = {
			sampleData: this._sampleData!.data.buffer,
			sampleWidth: this._sampleData!.width,
			sampleHeight: this._sampleData!.height,
			n: 3,
			periodicInput: true,
			periodicOutput: true,
			symmetry: 8,
			seed: this._seed,
			polygon: polygonExample
		};
		this._worker!.postMessage( message );
	} 

	private _sample( img: ImageBitmap | HTMLImageElement ) {
		const canvas = document.createElement( 'canvas' );
		canvas.width = img.width;
		canvas.height = img.height;
		const context = canvas.getContext( '2d' );
		if ( !context ) {
			console.error( 'No 2d context' );
		} else {
			context.drawImage( img, 0, 0 );
			this._sampleData = context.getImageData( 0, 0, img.width, img.height );
			
			this._start();
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private _receive( data: any ) {
		const generateData = new ImageData(
			new Uint8ClampedArray( data.buffer ),
			data.width,
			data.height
		);
		const canvas = document.createElement( 'canvas' );
		canvas.id = 'method-result';
		canvas.width = data.width;
		canvas.height = data.height;
		canvas.style.width = data.width * 5 + 'px';
		canvas.style.height = data.height * 5 + 'px';
		canvas.style.imageRendering = 'pixelated';
		const context = canvas.getContext( '2d'  );
		if ( !context ) {
			console.error( 'No 2d context' );
		} else {
			context.putImageData( generateData, 0, 0 );
			canvas.style.position = 'absolute';
			canvas.style.bottom = '0px';
			canvas.style.right = '0px';
			canvas.style.border = '10px solid white';
			document.body.append( canvas );
		}
		this.onPoints( data.points );
	}

	clear() {
		if ( this._worker !== null ) {
			this._worker.terminate();
			this._worker = null;
		}
		const canvas = document.getElementById( 'method-result' );
		if ( canvas !== null ) {
			canvas.remove();
		}
	}
}