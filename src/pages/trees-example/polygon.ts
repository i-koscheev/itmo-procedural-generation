import { Shape, ShapeGeometry } from 'three';

export type Polygon = Array<[number, number]>;

export const polygonExample: Polygon = [
	[0, 11.0],
	[16.0, -1],
	[10.0, -20.0],
	[-10.0, -20.0],
	[-16.0, -1]
];

const shape = new Shape();
const ind = polygonExample.length - 1;
shape.moveTo( polygonExample[ind][0], polygonExample[ind][1] );
polygonExample.forEach( ( pt ) => {
	shape.lineTo( pt[0], pt[1] );
} );

export const geometry = new ShapeGeometry( shape );