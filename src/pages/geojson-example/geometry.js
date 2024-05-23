import { MathUtils, Shape, ShapeGeometry } from 'three';

import { geojson } from './geojson';

const earthRadius = 63710088e-1;
const mercatorScaleLookup = {};
function getMercatorScale( lat ) {
	const index = Math.round( lat * 1e3 );
	if ( mercatorScaleLookup[index] === void 0 ) {
		mercatorScaleLookup[index] = 1 / Math.cos( lat * MathUtils.DEG2RAD );
	}
	return mercatorScaleLookup[index];
}
function averageMercatorScale( originLat, pointLat, steps = 10 ) {
	let totalScale = 0;
	const latStep = ( pointLat - originLat ) / steps;
	for ( let i = 0; i <= steps; i++ ) {
		const lat = originLat + latStep * i;
		totalScale += getMercatorScale( lat );
	}
	return totalScale / ( steps + 1 );
}
function coordsToVector3( point, origin ) {
	const latitudeDiff = ( point.latitude - origin.latitude ) * MathUtils.DEG2RAD;
	const longitudeDiff = ( point.longitude - origin.longitude ) * MathUtils.DEG2RAD;
	const altitudeDiff = ( point.altitude || 0 ) - ( origin.altitude || 0 );
	const x = longitudeDiff * earthRadius * Math.cos( origin.latitude * MathUtils.DEG2RAD );
	const y = altitudeDiff;
	const steps = Math.ceil( Math.abs( point.latitude - origin.latitude ) ) * 100 + 1;
	const avgScale = averageMercatorScale( origin.latitude, point.latitude, steps );
	const z = -latitudeDiff * earthRadius / getMercatorScale( origin.latitude ) * avgScale;
	return [x, y, z];
}

const originCoords =  geojson.features[0].geometry.coordinates[0][0];
const origin = { longitude: originCoords[0], latitude: originCoords[1] };

const greenery = [];
const buildings = [];

geojson.features.forEach( ( f ) => {
	
	const polygon = [];
	const geo = f.geometry.coordinates[0];
	for( let i = 0; i < geo.length; i++ ) {
		const c = coordsToVector3( { longitude: geo[i][0], latitude: geo[i][1] }, origin );
		polygon.push( [c[0] / 4, c[2] / 4] );
	}
	const shape = new Shape();
	const ind = polygon.length - 1;
	shape.moveTo( polygon[ind][0], polygon[ind][1] );
	polygon.forEach( ( pt ) => {
		shape.lineTo( pt[0], pt[1] );
	} );
	const geometry = new ShapeGeometry( shape );
	
	if ( f.properties.type === 'buildings' ) {
		
		const sides = [];

		for( let i = 0; i < polygon.length - 1; i++ ) {
			const a = polygon[i];
			const b = polygon[i+1];

			const dx = a[0] - b[0];
			const dy = a[1] - b[1];
			const length = Math.sqrt( dx*dx + dy*dy );
			const angle = Math.atan2( dy, dx ) + Math.PI / 2;

			sides.push( [
				a[0],
				a[1],
				angle,
				length
			] );
		}

		buildings.push( {
			sides,
			levels: parseInt( f.properties.levels ),
			geometry
		} );

	} else {
		greenery.push( {
			polygon,
			geometry
		} );
	}
} );

export const data = { greenery, buildings };
