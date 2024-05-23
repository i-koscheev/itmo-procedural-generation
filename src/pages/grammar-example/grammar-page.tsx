import { Environment, MapControls, Plane } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Color, FogExp2 } from 'three';

import { Building } from './building';


useGLTF.preload( '/assets/test_wall.glb' );
useGLTF.preload( '/assets/test_window.glb' );
useGLTF.preload( '/assets/test_window_150.glb' );
useGLTF.preload( '/assets/test_shop.glb' );
useGLTF.preload( '/assets/test_panel.glb' );

const background = new Color( '#c3d4e1' );
const fog = new FogExp2( '#cddb79', 0.008 );

export function GrammarPage() {
	
	return (
		<Canvas
			dpr={[1, 2]}
			gl={{ antialias: true }}
			scene={{
				background,
				fog,
			}}
			camera={{ position: [ 0, 20, 40 ] }}
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
				color="#ffffff"
				intensity={0.5}
			/>
			<directionalLight
				position={[2,10,5]}
				intensity={0.5}
				color="#ffffff"
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
				receiveShadow
			>
				<meshPhongMaterial color="#cddb79" />
			</Plane>
			<Building
				a={30}
				b={10}
				position={[-15,0,-5]}
			/>
		</Canvas>
	);
}
