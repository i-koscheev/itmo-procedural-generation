
import type { FC } from 'react';
import type { GroupProps } from '@react-three/fiber';

import { line1, line2 } from '../grammar-example/examples';
import { LineBuilder } from '../grammar-example/line-builder';

export interface BuildingWallProps extends GroupProps {
	position?: [number, number, number];
	length: number;
	levels: number;
}

export const BuildingWall: FC<BuildingWallProps> = ( {
	position = [0, 0, 0],
	length,
	levels,
	...props
} ) => {
	return (
		<group 
			position={[position[0], position[1], position[2]]}
			{...props}
		>
			<LineBuilder
				length={length}
				elements={line1}
				position={[0, 0, 0]}
			/>
			{Array.from( { length: levels - 1 } ).map( ( _, index ) => {
				const h = 3.5 * ( index + 1 );
				return (
					<LineBuilder
						key={index}
						length={length}
						elements={line2}
						position={[0, h, 0]}
					/>
				);
			} )}
		</group>
	);
};