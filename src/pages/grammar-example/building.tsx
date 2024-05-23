
import type { FC } from 'react';
import { Fragment } from 'react';
import { Box } from '@react-three/drei';
import type { GroupProps } from '@react-three/fiber';

import { line1, line2 } from './examples';
import { LineBuilder } from './line-builder';
export interface BuildingProps extends GroupProps {
	position?: [number, number, number];
	a: number;
	b: number;
	h?: number;
}

export const Building: FC<BuildingProps> = ( {
	position = [0, 0, 0],
	a,
	b,
	h = 4,
	...props
} ) => {
	return (
		<group 
			position={[position[0], position[1], position[2]]}
			{...props}
		>
			<Box
				args={[a,0.3,b]}
				position={[a/2, h * 3.5 + 0.15, b/2]}
			>
				<meshPhongMaterial color="#dfdfdf" />
			</Box>
			
		
			<LineBuilder
				length={a}
				elements={line1}
				position={[0, 0, b]}
			/>
			<LineBuilder
				length={a}
				elements={line1}
				position={[a, 0, 0]}
				rotation={[0, -Math.PI, 0]}
			/>
			<LineBuilder
				length={b}
				elements={line1}
				position={[0, 0, 0]}
				rotation={[0, -Math.PI * 0.5, 0]}
			/>
			<LineBuilder
				length={b}
				elements={line1}
				position={[a, 0, b]}
				rotation={[0, Math.PI * 0.5, 0]}
			/>
			{Array.from( { length: h - 1 } ).map( ( _, index ) => {
				const h = 3.5 * ( index + 1 );
				return (
					<Fragment key={index}>
						<LineBuilder
							length={a}
							elements={line2}
							position={[0, h, b]}
						/>
						<LineBuilder
							length={a}
							elements={line2}
							position={[a, h, 0]}
							rotation={[0, -Math.PI, 0]}
						/>
						<LineBuilder
							length={b}
							elements={line2}
							position={[0, h, 0]}
							rotation={[0, -Math.PI * 0.5, 0]}
						/>
						<LineBuilder
							length={b}
							elements={line2}
							position={[a, h, b]}
							rotation={[0, Math.PI * 0.5, 0]}
						/>
					</Fragment>
				);
			} )}
		</group>
	);
};