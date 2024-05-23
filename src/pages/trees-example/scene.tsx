import { useRef, useState } from 'react';
import { useEffect } from 'react';

import { Controller } from './controller';
import { geometry } from './polygon';
import { Tree } from './tree';

export function Scene() {
	const [points, setPoints] = useState<number[]>( [] );

	const controllerRef = useRef<Controller>( null! );
	if ( controllerRef.current === null ) {
		controllerRef.current = new Controller( setPoints );
	}

	useEffect( () => () => {
		controllerRef.current.clear();
	}, [] );

	return (
		<mesh
			geometry={geometry}
			rotation={[-Math.PI / 2, 0, 0]}
			receiveShadow
		>
			<meshPhongMaterial color="#8fbbb2" />
			{points.map( ( x, i ) => {
				if ( i % 3 !== 0 ) {
					return null;
				}
				const y = points[i + 1];
				const b = points[i + 2] === 2;
				return (
					<Tree
						key={x+'-'+y}
						size={ b ? 'big' : 'small' }
						position={[x,y,0]}
					/>
				);
			} )}
		</mesh>
	);
}