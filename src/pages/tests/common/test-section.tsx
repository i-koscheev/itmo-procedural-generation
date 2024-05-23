import { useRef, useState } from 'react';

import type { TestController } from './test-controller';

export function TestSection<Controller extends TestController>(
	constructor: () => Controller,
	name?: string
) {
	const controllerRef = useRef<Controller>( null! );
	if ( controllerRef.current === null ) {
		controllerRef.current = constructor();
	}

	const [options, setOptions] = useState( () =>
		controllerRef.current.options
	);

	return (
		<section className="section">
			<h1>WFC Test ({name})</h1>
			<div className="header">
				<div className="column">
					<canvas
						id="sample"
						className="sample"
						onClick={()=>{
							controllerRef.current.nextSample();
							setOptions( controllerRef.current.options );
						}}
					/>
					<button className="button"
						onClick={()=>{ controllerRef.current.start(); }}
					>
					START
					</button>
				</div>
				<div className="column">
					<span>Input options</span>
					<div>N: <span>{options.n}</span></div>
					<div>periodicInput: <span>{options.periodicInput ? 'true' : 'false'}</span></div>
					<div>symmetry: <span>{options.symmetry}</span></div>
				</div>
				<div className="column">
					<span>Output options</span>
					<div>size: <span>{options.width} x {options.height}</span></div>
					<div>periodicOutput: <span>{options.periodicOutput ? 'true' : 'false'}</span></div>
					<div>number of runs: <span>{options.count}</span></div>
				</div>
			</div>
			<div 
				id="container"
				className="container"
			/>
		</section>
	);
}