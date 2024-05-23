import { Environment, MapControls, Plane } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Color, FogExp2 } from 'three';

import { Buildings } from './buildings';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { data } from './geometry';
import { Greenery } from './greenery';

useGLTF.preload( '/assets/low_poly_bush.glb' );
useGLTF.preload( '/assets/low_poly_tree.glb' );

const background = new Color( '#C0D3E1' );
const fog = new FogExp2( '#CBCDD4', 0.001 );

export function GeojsonPage() {
	return (
		<Canvas
			dpr={[1, 2]}
			gl={{ antialias: true }}
			scene={{ background, fog }}
			camera={{ position: [ 120, 60, -240 ] }}
			shadows="soft"
		>
			<MapControls
				enableDamping
				dampingFactor={0.05}
				screenSpacePanning={false}
				minDistance={10}
				maxDistance={100}
				maxPolarAngle={Math.PI / 2 - 0.01}
			/>
			<Environment
				preset="park"
			/>
			<ambientLight
				color="#FFFFEE"
				intensity={1}
			/>
			<directionalLight
				position={[-10,80,-40]}
				intensity={1}
				color="#FFFFFF"
				shadow-mapSize-height={2048}
				shadow-mapSize-width={2048}
				shadow-bias={-0.001}
				shadow-camera-far={500}
				shadow-camera-left={-100}
				shadow-camera-right={100}
				shadow-camera-top={100}
				shadow-camera-bottom={-100}
				castShadow
			/>
			<Plane
				args={[400, 400]}
				rotation={[-Math.PI / 2, 0, 0]}
				position={[0,-0.1,0]}
				receiveShadow
			>
				<meshPhongMaterial color="#F2EFE8" />
			</Plane>
			{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
			{data.greenery.map( ( d: any, i: number ) => {
				return (
					<Greenery
						key={i}
						{...d}
					/>
				);
			} )}
			{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
			{data.buildings.map( ( d: any, i: number ) => {
				return (
					<Buildings
						key={i}
						{...d}
					/>
				);
			} )}
		</Canvas>
	);
}
