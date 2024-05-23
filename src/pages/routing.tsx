import { Route, Routes } from 'react-router-dom';

import { GeojsonPage } from './geojson-example/geojson-page';
import { GrammarPage } from './grammar-example/grammar-page';
import { HomePage } from './home/home-page';
import { ParkPage } from './park-example/park-page';
import { OverlappingPage } from './tests/overlapping-page';
import { PatternsPage } from './tests/patterns-page';
import { PredefinedPage } from './tests/predefined-page';
import { UnoptimizedPage } from './tests/unoptimized-page';
import { TreesPage } from './trees-example/trees-page';

function Routing() {
	return (
		<Routes>
			<Route path="/"
				element={<HomePage />}
			/>
			<Route path="/overlapping"
				element={<OverlappingPage />}
			/>
			<Route path="/unoptimized"
				element={<UnoptimizedPage />}
			/>
			<Route path="/patterns"
				element={<PatternsPage />}
			/>
			<Route path="/predefined"
				element={<PredefinedPage />}
			/>
			<Route path="/trees"
				element={<TreesPage />}
			/>
			<Route path="/park"
				element={<ParkPage />}
			/>
			<Route path="/grammar"
				element={<GrammarPage />}
			/>
			<Route path="/geojson"
				element={<GeojsonPage />}
			/>
		</Routes>
	);
}

export default Routing;
