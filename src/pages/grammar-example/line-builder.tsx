import { useMemo } from 'react';
import type { GroupProps } from '@react-three/fiber';

import type { LineElement } from '../../grammar/build';
import { build } from '../../grammar/build';

import { Piece } from './piece';

interface LineBuilderProps extends GroupProps {
	length: number;
	elements: LineElement[];
}


export const LineBuilder = ( { length, elements, ...props }: LineBuilderProps ) => {

	const pieces = useMemo( () =>
		build( length, elements )
	, [length, elements] );

	return (
		<group {...props}>
			{pieces.map( ( info, index ) => (
				<Piece
					key={index}
					word={info.word}
					position={[info.position, 0, 0]}
					scale={[info.scale, 1, 1]}
				/>
			) )}
		</group>
	);
};
