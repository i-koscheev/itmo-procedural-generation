import { Shape, ShapeGeometry } from 'three';

export type Polygon = Array<[number, number]>;

const hw = 25;
const hh = 15;

export const polygonExample: Polygon = [
	[hw, hh],
	[hw, -hh],
	[-hw, -hh],
	[-hw, hh]
];

const shape = new Shape();
const ind = polygonExample.length - 1;
shape.moveTo( polygonExample[ind][0], polygonExample[ind][1] );
polygonExample.forEach( ( pt ) => {
	shape.lineTo( pt[0], pt[1] );
} );

export const geometry = new ShapeGeometry( shape );