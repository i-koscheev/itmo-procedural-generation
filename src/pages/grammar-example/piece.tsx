import { useGLTF } from '@react-three/drei';
import type { GroupProps } from '@react-three/fiber';
import { Color } from 'three';

import type { Word } from '../../grammar/words';
import { WORDS } from '../../grammar/words';

export function Piece( { word, ...props }: { word: Word } & GroupProps ) {
	const model = WORDS[ word ];

	const { scene } = useGLTF( model.file );

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	scene.traverse( ( node: any ) => {
		node.castShadow = true;
		if ( node.material !== undefined ) {
			const color =  node.material.color as Color;
			if ( color.r + color.g + color.b > 2.9 ) {
				node.material.color = new Color( model.color );
			}
		}
	} );

	return (
		<primitive
			object={scene.clone()}
			{...props}
		/>
	);
}