import { useRef, useState } from 'react';
import { useEffect } from 'react';
import type { ShapeGeometry } from 'three';

import { Controller } from './controller';
import { Tree } from './tree';

export function Greenery( {
	polygon,
	geometry,
	position,
}: { position: [number,number,number], polygon: [number,number][], geometry: ShapeGeometry } ) {

	const [points, setPoints] = useState<number[]>( [] );

	const controllerRef = useRef<Controller>( null! );
	if ( controllerRef.current === null ) {
		controllerRef.current = new Controller( polygon, setPoints );
	}

	useEffect( () => () => {
		controllerRef.current.clear();
	}, [] );

	return (
		<>
			<mesh
				geometry={geometry}
				rotation={[-Math.PI / 2, 0, 0]}
				position={position}
				receiveShadow
			>
				<meshPhongMaterial color="#8fbbb2" />
			</mesh>
			<group
				rotation={[0, Math.PI/2, 0]}
				position={position}
			>
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
							position={[y,0,x]}
						/>
					);
				} )}
			</group>
		</>
	);
}