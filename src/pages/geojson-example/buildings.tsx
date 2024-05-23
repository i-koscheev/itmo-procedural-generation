import type { ShapeGeometry } from 'three';

import { BuildingWall } from './building-wall';

export function Buildings( {
	sides,
	levels,
	geometry,
	position = [0,0,0],
}: {
	sides: [number,number,number,number][],
	levels: number,
	position?: [number,number,number],
	geometry: ShapeGeometry,
} ) {

	return (
		<>
			<mesh
				geometry={geometry}
				rotation={[-Math.PI / 2, 0, 0]}
				position={[position[0], position[1] + levels*3.5*0.5+0.001, position[2] ]}
				receiveShadow
			>
				<meshPhongMaterial color="#bbbbbb" />
			</mesh>
			<group
				rotation={[0, Math.PI/2, 0]}
				position={position}
			>
				{sides.map( ( d, i ) => {
					return (
						<BuildingWall
							key={i}
							levels={levels}
							position={[d[1], position[1], d[0]]}
							rotation={[0,d[2],0]}
							length={d[3]*2}
							scale={0.5}
						/>
					);
				} )}
			</group>
		</>
	);
}