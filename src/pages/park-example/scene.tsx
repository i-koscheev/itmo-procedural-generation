import { useRef, useState } from 'react';
import { useEffect } from 'react';
import { Cylinder, useGLTF } from '@react-three/drei';
import type { GroupProps } from '@react-three/fiber';

import { Controller } from './controller';
import { geometry } from './polygon';

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
		<>
			<mesh
				geometry={geometry}
				rotation={[-Math.PI / 2, 0, 0]}
				receiveShadow
			>
				<meshPhongMaterial color="#8fbbb2" />
			</mesh>
			{points.map( ( x, i ) => {
				if ( i % 3 !== 0 ) {
					return null;
				}
				const y = points[i + 1];
				const code = points[i + 2];
				// деревья
				if ( code === 2 ) {
					return (
						<Tree key={x+'-'+y}
							position={[x,0,y]}
						/>
					);
				}
				// дорожки
				if ( code === 3 ) {
					return (
						<Road key={x+'-'+y}
							position={[x,0,y]}
						/>
					);
				}
				// скамейки
				if ( code === 4 ) {
					let rotate = 0;
					points.some( ( px, pi ) => {
						if ( pi % 3 !== 0 || points[pi + 2] !== 3 ) {
							return false;
						}
						const py = points[pi + 1];
						if ( ( px === x ) && py === y + 0.5 ) {
							rotate = 0;
							return true;
						}
						if ( ( px === x - 0.5 ) && ( py === y ) ) {
							rotate = 1;
							return true;
						}
						if ( ( px === x ) && ( py === y - 0.5 ) ) {
							rotate = 2;
							return true;
						}
						if ( ( px === x + 0.5 ) && ( py === y ) ) {
							rotate = 3;
							return true;
						}
						return false;
					} );
					return (
						<Bench key={x+'-'+y}
							position={[x,0.4,y]}
							rotation={[0,rotate * Math.PI / 2,0]}
						/>
					);
				}
			} )}
		</>
	);
}

function Bench( props: GroupProps ) {
	const { scene } = useGLTF( '/assets/low_poly_wooden_bench.glb' );

	scene.traverse( ( node ) => {
		node.castShadow = true;
		node.receiveShadow = true;
	} );

	return (
		<primitive
			object={scene.clone()}
			scale={0.33}
			{...props}
		/>
	);
}

function Road( props: { position: [number,number,number] } ) {
	return (
		<Cylinder
			args={[0.48, 0.48, 0.05, 8]}
			receiveShadow
			{...props}
		>
			<meshPhongMaterial color="#FFE9C9" />
		</Cylinder>
	);
}

function Tree( props: GroupProps ) {
	const { scene } = useGLTF( '/assets/low_poly_tree.glb' );

	scene.traverse( ( node ) => {
		node.castShadow = true;
		node.receiveShadow = true;
	} );

	return (
		<primitive
			object={scene.clone()}
			scale={0.002}
			{...props}
		/>
	);
}
