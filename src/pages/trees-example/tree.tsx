
import { useGLTF } from '@react-three/drei';
import type { GroupProps } from '@react-three/fiber';

export function Tree( { size, position, ...props }: GroupProps & { size: 'big' | 'small' } ) {
	const { scene } = useGLTF( size === 'big'
		? '/assets/low_poly_tree.glb'
		: '/assets/low_poly_bush.glb'
	);

	scene.traverse( ( node: any ) => {
		node.castShadow = true;
		node.receiveShadow = true;
	} );

	return (
		<primitive
			object={scene.clone()}
			rotation={[Math.PI / 2, 0, 0]}
			scale={size === 'big' ? 0.004 : 0.1}
			// @ts-ignore
			position={[position[0], position[1], size === 'big' ? 0 : 1.25]}
			{...props}
		/>
	);
}