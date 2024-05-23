import { MapControls, Plane } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Color, FogExp2 } from 'three';

import { Scene } from './scene';

useGLTF.preload( '/assets/low_poly_wooden_bench.glb' );
useGLTF.preload( '/assets/low_poly_tree.glb' );

const background = new Color( '#C0D3E1' );
const fog = new FogExp2( '#CBCDD4', 0.008 );

export function ParkPage() {
	return (
		<Canvas
			dpr={[1, 2]}
			gl={{ antialias: true }}
			scene={{ background, fog }}
			camera={{ position: [ 0, 24, 24 ] }}
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
			<ambientLight
				color="#FFFFEE"
				intensity={1.2}
			/>
			<directionalLight
				position={[2,10,5]}
				intensity={1}
				color="#FFFFFF"
				shadow-mapSize-height={2048}
				shadow-mapSize-width={2048}
				shadow-bias={-0.00005}
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
			<Scene />
		</Canvas>
	);
}
