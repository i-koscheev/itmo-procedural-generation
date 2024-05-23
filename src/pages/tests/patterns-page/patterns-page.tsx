import { useRef, useState } from 'react';

import { PatternsController } from './patterns-controller';

export const PatternsPage = () => {
	const controllerRef = useRef<PatternsController>( null! );
	if ( controllerRef.current === null ) {
		controllerRef.current = new PatternsController();
	}

	const [options, setOptions] = useState( () =>
		controllerRef.current.options
	);

	return (
		<section className="section">
			<h1>WFC Patterns Generation</h1>
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
					<span>Options</span>
					<div>N: <span>{options.n}</span></div>
					<div>periodic: <span>{options.periodic ? 'true' : 'false'}</span></div>
					<div>symmetry: <span>{options.symmetry}</span></div>
				</div>
			</div>
			<div 
				id="container"
				className="container"
			/>
		</section>
	);
};